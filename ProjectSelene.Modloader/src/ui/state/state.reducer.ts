import { PayloadAction, configureStore, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { Filesystem } from '../../loader/filesystem';
import { Game } from '../../loader/game';
import { Loader } from '../../loader/loader';
import { LoginService, LoginType, OpenAPI } from '../../moddb/generated';
import { ModDB } from '../../moddb/moddb';
import { GameInfo, GamesInfo, State } from './state.models';

const fs = new Filesystem();
const game = new Game(fs);
const moddb = new ModDB();
export const loader = new Loader(fs, game);

export const login = createAsyncThunk('login', async (_, { getState }) => {
	const url = new URL((await LoginService.getApiLogin()).githubUrl);
	const { state } = getState() as RootState;
	const id = Math.random().toString(36).substring(2);
	localStorage.setItem('loginstate', JSON.stringify({ [id]: state }));
	url.searchParams.set('state', id);
	location.href = url.toString();
});

export const completeLogin = createAsyncThunk('completeLogin', async (code: string, { dispatch }) => {
	const token = await LoginService.postApiLoginComplete({ type: LoginType.GITHUB, token: code });
	localStorage.setItem('token', token);
	OpenAPI.TOKEN = token;

	dispatch(getUser());

	return true;
});

export const getUser = createAsyncThunk('getUser', async () => {
	return await LoginService.getApiLoginCurrent();
});

export const loadMods = createAsyncThunk('loadMods', async (gamesInfo: GamesInfo | void, { getState }) => {
	const { state } = getState() as RootState;
	const gameInfo = (gamesInfo ?? state.gamesInfo).games.find(g => g.id === state.gamesInfo.selectedGame);
	if (!gameInfo) {
		return undefined;
	}
	return await game.tryGetMods(gameInfo);
});

export const loadGames = createAsyncThunk('loadGames', async (_, { dispatch, getState }) => {
	const { state } = getState() as RootState;
	const games = await game.loadGames(state.gamesInfo);
	dispatch(loadMods(games));
	return games;
});

export const loadModList = createAsyncThunk('loadModList', async () => {
	return await moddb.modList();
});

export const openDirectory = createAsyncThunk('openDirectory', async (_, { getState }) => {
	const { state } = getState() as RootState;

	const unloaded = state.gamesInfo.games.find(g => !g.loaded);
	if (unloaded) {
		const mounted = await game.mountGame(unloaded);
		if (!mounted) {
			throw new Error('Could not mount game');
		}
		return { game: unloaded, mods: await game.getMods(unloaded) };
	}

	const nextId = state.gamesInfo.games.map(g => g.id).reduce((a, b) => Math.max(a, b), 0) + 1;
	const gameInfo = await game.openGame(nextId);
	if (!gameInfo) {
		throw new Error('No game selected');
	}

	return { game: gameInfo, mods: await game.getMods(gameInfo) };
});

export const deleteMod = createAsyncThunk('deleteMod', async (name: string, { getState }) => {
	const { state } = getState() as RootState;
	const gameInfo = state.gamesInfo.games.find(g => g.id === state.gamesInfo.selectedGame);
	if (!gameInfo) {
		throw new Error('No game selected');
	}
	return await game.deleteMod(gameInfo, name);
});

export const installMod = createAsyncThunk('installMod', async (mod: { filename: string, id: string, version: string }, { getState }) => {
	const { state } = getState() as RootState;
	const gameInfo = state.gamesInfo.games.find(g => g.id === state.gamesInfo.selectedGame);
	if (!gameInfo) {
		throw new Error('No game selected');
	}

	const content = await moddb.download(mod.id, mod.version);
	if (!content) {
		return game.getMods(gameInfo);
	}
	return await game.installMod(gameInfo, mod.filename, content);
});

export const play = createAsyncThunk('play', async (_, { dispatch, getState }) => {
	const { state } = getState() as RootState;
	let gameInfo = state.gamesInfo.games.find(g => g.id === state.gamesInfo.selectedGame);
	if (!gameInfo) {
		const openResult = await dispatch(openDirectory());
		gameInfo = (openResult.payload as { game: GameInfo })?.game;
		if (!gameInfo) {
			throw new Error('No game selected');
		}
	}

	const dev = ('DEV' in window && !!window.DEV) || !!new URLSearchParams(window.location.search).get('dev');
	return await loader.play(gameInfo, dev);
});

const memoizedSelectInstalledMods = createSelector(
	(state: State) => state.mods.data?.mods,
	mods => mods?.map(m => m)
		.sort((a, b) => a.currentInfo.name.localeCompare(b.currentInfo.name))
		.map(m => m.currentInfo.id) ?? []);

const memoizedSelectInstalledModsSet = createSelector(
	memoizedSelectInstalledMods,
	mods => new Set(mods));

const slice = createSlice({
	name: 'state',
	initialState: {
		gamesInfo: {
			games: [],
			selectedGame: -1,
		},
		mods: {},
		modDb: {
			mods: {},
			modDetails: {},
			versionDetails: {},
		},
		ui: {
			modsOpen: false,
			modsTab: 0,
			infoOpen: false,
			openOpen: false,
			playing: false,
		},
	} as State,
	reducers: {
		loadState: (_, { payload }: PayloadAction<State>) => {
			return payload;
		},
		setInfoOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.ui.infoOpen = payload;
		},
		setModsOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.ui.modsOpen = payload;
		},
		changeModsTab: (state, { payload }: PayloadAction<number>) => {
			state.ui.modsTab = payload;
		},
		logout: (state) => {
			state.user = undefined;
			localStorage.removeItem('token');
			OpenAPI.TOKEN = undefined;
		},
	},
	extraReducers(builder) {
		builder.addCase(loadGames.pending, (state) => {
			state.gamesInfo.games = state.gamesInfo.games.map(g => ({ ...g, loaded: false }));
		});
		builder.addCase(loadGames.fulfilled, (state, { payload }) => {
			state.gamesInfo = payload;
		});

		builder.addCase(loadMods.pending, (state) => {
			state.mods = { loading: true };
		});
		builder.addCase(loadMods.fulfilled, (state, { payload }) => {
			if (payload) {
				state.mods = { data: payload, loading: false };
			} else {
				state.mods = {}; // Did not fail but not succeed either
			}
		});
		builder.addCase(loadMods.rejected, (state, { error }) => {
			state.mods = { failed: true, error };
		});

		builder.addCase(loadModList.pending, (state) => {
			state.modDb.mods = { loading: true };
		});
		builder.addCase(loadModList.fulfilled, (state, { payload }) => {
			state.modDb.mods = { data: payload, loading: false };
		});
		builder.addCase(loadModList.rejected, (state, { error }) => {
			state.modDb.mods = { failed: true, error };
		});

		builder.addCase(openDirectory.pending, (state) => {
			state.mods = { loading: true };
			state.ui.openOpen = true;
		});
		builder.addCase(openDirectory.fulfilled, (state, { payload }) => {
			state.mods = { data: payload.mods, loading: false };
			const existing = state.gamesInfo.games.find(g => g.id === payload.game.id);
			if (existing) {
				existing.loaded = true;
			} else {
				state.gamesInfo.games.push(payload.game);
			}
			state.gamesInfo.selectedGame = payload.game.id;
			state.ui.openOpen = false;
		});
		builder.addCase(openDirectory.rejected, (state, { error }) => {
			state.mods = { failed: true, error };
			state.ui.openOpen = false;
		});

		builder.addCase(deleteMod.fulfilled, (state, { payload }) => {
			state.mods = { data: payload, loading: false };
		});
		builder.addCase(installMod.fulfilled, (state, { payload }) => {
			state.mods = { data: payload, loading: false };
		});
		builder.addCase(play.pending, (state) => {
			state.ui.playing = true;
		});
		builder.addCase(play.rejected, (state, { error }) => {
			state.ui.playing = false;
			console.error(error.stack);
		});
		builder.addCase(getUser.fulfilled, (state, { payload }) => {
			state.user = payload;
		});
		builder.addCase(getUser.rejected, (state) => {
			state.user = undefined;
		});
	},
	selectors: {
		selectInfoDialogOpen: (state) => state.ui.infoOpen,
		selectModsDialogOpen: (state) => state.ui.modsOpen,
		selectOpenDialogOpen: (state) => state.ui.openOpen,
		selectPlaying: (state) => state.ui.playing,
		selectModsLoaded: (state) => !state.mods.loading && !state.mods.failed,
		selectModsInitialized: (state) => state.mods.loading !== undefined,
		selectModsTab: (state) => state.ui.modsTab,
		selectInstalledModIds: memoizedSelectInstalledMods,
		selectAvailableModIds: createSelector(
			[
				(state: State) => state.modDb.mods.data,
				(state: State) => memoizedSelectInstalledModsSet(state),
			],
			(moddb, installed) => moddb
				?.filter(m => !installed.has(m.id))
				.sort((a, b) => a.name.localeCompare(b.name))
				.map(m => m.id) ?? []),

		selectInstalledMod: createSelector(
			[(state: State) => state.mods.data?.mods, (_, id: string) => id],
			(mods, id) => mods?.find(m => m.currentInfo.id === id),
		),
		selectAvailableMod: createSelector(
			[(state: State) => state.modDb.mods.data, (_, id: string) => id],
			(mods, id) => mods?.find(m => m.id === id),
		),
		selectIsLoggedIn: (state) => !!state.user,
		selectUserAvatarUrl: (state) => state.user?.avatarUrl,
		selectStoreWithoutUI: (state) => {
			return {
				...state, ui: {
					modsOpen: false,
					modsTab: 0,
					infoOpen: false,
					openOpen: false,
					playing: false,
				},
			} satisfies State;
		},
	},
});

export const {
	loadState,
	setInfoOpen,
	setModsOpen,
	changeModsTab,
	logout,
} = slice.actions;
export const {
	selectInfoDialogOpen,
	selectModsDialogOpen,
	selectOpenDialogOpen,
	selectPlaying,
	selectModsLoaded,
	selectModsInitialized,
	selectModsTab,
	selectInstalledModIds,
	selectAvailableModIds,
	selectAvailableMod,
	selectIsLoggedIn,
	selectUserAvatarUrl,
	selectInstalledMod,
	selectStoreWithoutUI,
} = slice.selectors;
export const store = configureStore({ reducer: { state: slice.reducer } });
export type RootState = ReturnType<typeof store.getState>;