import { PayloadAction, configureStore, createAsyncThunk, createSelector, createSlice } from '@reduxjs/toolkit';
import { Filesystem } from '../../loader/filesystem';
import { Game } from '../../loader/game';
import { Loader } from '../../loader/loader';
import { LoginService } from '../../moddb/generated';
import { ModDB } from '../../moddb/moddb';
import { State } from './state.models';

const fs = new Filesystem();
const game = new Game(fs);
const moddb = new ModDB();
export const loader = new Loader(fs, game);

export const login = createAsyncThunk('login', async () => {
	const url = await LoginService.getLoginUrl();
	window.open(url, '_blank');

});

export const loadMods = createAsyncThunk('loadMods', async () => {
	return await game.tryGetMods();
});

export const loadGames = createAsyncThunk('loadGames', async (_, { dispatch }) => {
	const games = await game.loadGames();
	dispatch(loadMods());
	return games;
});

export const loadModList = createAsyncThunk('loadModList', async () => {
	return await moddb.modList();
});

export const openDirectory = createAsyncThunk('openDirectory', async () => {
	return await game.getMods();
});

export const deleteMod = createAsyncThunk('deleteMod', async (name: string) => {
	return await game.deleteMod(name);
});

export const installMod = createAsyncThunk('installMod', async (mod: { filename: string, id: number, version: string }) => {
	const content = await moddb.download(mod.id, mod.version);
	if (!content) {
		return game.getMods();
	}
	return await game.installMod(mod.filename, content);
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
		gamesInfo: {},
		games: [],
		selectedGame: 0,
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
		},
	} as State,
	reducers: {
		debugSetState: (_, { payload }: PayloadAction<State>) => {
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
	},
	extraReducers(builder) {
		builder.addCase(loadGames.pending, (state) => {
			state.gamesInfo = { loading: true };
		});
		builder.addCase(loadGames.fulfilled, (state, { payload }) => {
			state.gamesInfo = { data: payload, loading: false };
		});
		builder.addCase(loadGames.rejected, (state, { error }) => {
			state.gamesInfo = { failed: true, error };
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
		});
		builder.addCase(openDirectory.fulfilled, (state, { payload }) => {
			state.mods = { data: payload, loading: false };
		});
		builder.addCase(openDirectory.rejected, (state, { error }) => {
			state.mods = { failed: true, error };
		});

		builder.addCase(deleteMod.fulfilled, (state, { payload }) => {
			state.mods = { data: payload, loading: false };
		});
		builder.addCase(installMod.fulfilled, (state, { payload }) => {
			state.mods = { data: payload, loading: false };
		});
	},
	selectors: {
		selectInfoDialogOpen: (state) => state.ui.infoOpen,
		selectModsDialogOpen: (state) => state.ui.modsOpen,
		selectGamesLoaded: (state) => !state.gamesInfo.loading && !state.gamesInfo.failed,
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
			[(state: State) => state.mods.data?.mods, (_, id: number) => id],
			(mods, id) => mods?.find(m => m.currentInfo.id === id),
		),
		selectAvailableMod: createSelector(
			[(state: State) => state.modDb.mods.data, (_, id: number) => id],
			(mods, id) => mods?.find(m => m.id === id),
		),
	},
});

export const {
	debugSetState,
	setInfoOpen,
	setModsOpen,
	changeModsTab,
} = slice.actions;
export const {
	selectInfoDialogOpen,
	selectModsDialogOpen,
	selectGamesLoaded,
	selectModsLoaded,
	selectModsInitialized,
	selectModsTab,
	selectInstalledModIds,
	selectAvailableModIds,
	selectAvailableMod,
	selectInstalledMod,
} = slice.selectors;
export const store = configureStore({ reducer: { state: slice.reducer } });
export type RootState = ReturnType<typeof store.getState>;