import { loader, Mods } from '@project-selene/selene';
import { createAsyncThunk, createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ensureGameInfoMode, gameFromGameInfo, loadGameInfo, openGame } from './game-info';
import { Handles } from './handles';
import { GameInfo, GameState } from './models/game';
import { LoadingState } from './models/loading-state';
import { ModManifest } from './models/mod';
import { RootState } from './state.reducer';



interface GameStore {
	games: GameInfo[];
	selectedGame?: number;
	installedMods: Record<number, LoadingState<ModManifest[]>>;
	loading: boolean;
	playing: boolean;
	opening: boolean;
}

const initialState: GameStore = {
	games: [],
	installedMods: {},
	loading: false,
	playing: false,
	opening: false,
};

const handlesCache = new Handles();

export const loadInstalledMods = createAsyncThunk('loadInstalledMods', async (gameInfo: GameInfo) => {
	switch (gameInfo.type) {
		case 'handle': {
			const handle = await handlesCache.get(1);
			if (!handle) {
				return {};
			}

			const mods = await Mods.fromFileHandle(handle)
			return mods.readManifests();
		}
		case 'fs': {
			const mods = await Mods.fromLocalPath(gameInfo.path)
			return mods.readManifests();
		}
		case 'filelist': {
			throw new Error('Not implement yet');
		}
	}

});

export const loadGames = createAsyncThunk('loadGames', async (_, { dispatch }) => {
	const games = await loadGameInfo();

	for (const game of games) {
		dispatch(loadInstalledMods(game));
	}

	return games;
});

export const openSelectedGame = createAsyncThunk(
	'openExistingGames',
	async (mode: FileSystemPermissionMode | void, { getState, dispatch }) => {
		const state = getState() as RootState;

		const gameInfo = state.game.games.find(g => g.id === state.game.selectedGame);
		if (!gameInfo) {
			throw new Error('No game selected');
		}

		await ensureGameInfoMode(gameInfo, mode ?? 'read');

		dispatch(loadInstalledMods(gameInfo));
	},
);
export const openDirectory = createAsyncThunk(
	'openDirectory',
	async (mode: FileSystemPermissionMode | void, { dispatch }) => {
		const gameInfo = await openGame(mode ?? 'read');
		if (!gameInfo) {
			throw new Error('No game selected');
		}

		dispatch(loadInstalledMods(gameInfo));

		return gameInfo;
	},
);

export const installModLoader = createAsyncThunk('installModLoader', async (_, { dispatch, getState }) => {
	const state = getState() as RootState;
	let gameInfo = state.game.games.find(g => g.id === state.game.selectedGame);
	if (!gameInfo) {
		const openResult = await dispatch(openDirectory('readwrite'));
		gameInfo = (openResult.payload as GameInfo);
		if (!gameInfo) {
			throw new Error('No game selected');
		}
	}
	const game = await gameFromGameInfo(gameInfo);
	return await game.installModLoader();
});

export const play = createAsyncThunk('play', async (_, { dispatch, getState }) => {
	const state = getState() as RootState;
	let gameInfo = state.game.games.find(g => g.id === state.game.selectedGame);
	if (!gameInfo) {
		const openResult = await dispatch(openDirectory());
		console.log(openResult);
		gameInfo = (openResult.payload as GameInfo);
		if (!gameInfo) {
			throw new Error('No game selected');
		}
	}

	await ensureGameInfoMode(gameInfo, 'read');

	const game = await gameFromGameInfo(gameInfo);
	return await loader.play(game, false);
});

export const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		readGames(state) {
			state.games = JSON.parse(localStorage.getItem('games') ?? '[]');

			//TODO: set type === 'fs' to loaded if we have local access and it exists.

			const selected = state.games.find(g => g.id === state.selectedGame);
			if (selected) {
				return;
			}

			const loaded = state.games.find(g => g.loaded);
			if (!loaded) {
				return;
			}

			state.selectedGame = loaded.id;
		},
		writeGames(state) {
			const games = state.games
				.filter(g => g.type !== 'filelist')
				.map(g => ({ ...g, loaded: false }) satisfies GameInfo);
			localStorage.setItem('games', JSON.stringify(games));
		},
		setSelectedGame(state, { payload }: PayloadAction<number>) {
			if (!state.games.some(g => g.id === payload)) {
				throw new Error('No game not found');
			}
			state.selectedGame = payload;
		},
	},
	extraReducers(builder) {
		builder.addCase(loadGames.fulfilled, (state, { payload }) => {
			state.games = payload;
		});
		builder.addCase(openSelectedGame.fulfilled, state => {
			const gameInfo = state.games.find(g => g.id === state.selectedGame);
			if (!gameInfo) {
				throw new Error('No game selected'); //Should be unreachable
			}
			gameInfo.loaded = true;
		});
		builder.addCase(openDirectory.fulfilled, (state, { payload }) => {
			state.games.push(payload);
			state.selectedGame = payload.id;
		});
		builder.addCase(loadInstalledMods.pending, (state, { meta }) => {
			state.installedMods[meta.arg.id] ??= {};
			state.installedMods[meta.arg.id].loading = true;
		});
		builder.addCase(loadInstalledMods.rejected, (state, { meta }) => {
			state.installedMods[meta.arg.id] ??= {};
			state.installedMods[meta.arg.id].loading = false;
		});
		builder.addCase(loadInstalledMods.fulfilled, (state, { meta, payload }) => {
			state.installedMods[meta.arg.id] ??= {};
			state.installedMods[meta.arg.id].loading = false;
			state.installedMods[meta.arg.id].data = Object.values(payload);
		});
	},
	selectors: {
		selectGameState: state => {
			if (state.playing) {
				return GameState.PLAYING;
			}
			if (state.loading) {
				return GameState.LOADING;
			}
			if (state.opening) {
				return GameState.OPENING;
			}
			const gameInfo = state.games.find(g => g.id === state.selectedGame);
			if (!gameInfo) {
				return GameState.PROMPT;
			}
			return GameState.READY;
		},
		selectInstalledMods: createSelector(
			(state: GameStore) => state.installedMods,
			(state: GameStore) => state.selectedGame,
			(installedMods, selectedGame) => installedMods[selectedGame!]?.data ?? [],
		),
		selectInstalledModsLoading: createSelector(
			(state: GameStore) => state.installedMods,
			(state: GameStore) => state.selectedGame,
			(installedMods, selectedGame) => installedMods[selectedGame!]?.loading ?? false,
		),
	},
});

export const { readGames, writeGames, setSelectedGame } = gameSlice.actions;

export const { selectGameState, selectInstalledMods, selectInstalledModsLoading } = gameSlice.selectors;
