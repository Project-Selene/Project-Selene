import { configureStore } from '@reduxjs/toolkit';
import { gameSlice } from './game.store';
import { miscSlice } from './misc.store';
import { modSlice } from './mod.store';

// export const deleteMod = createAsyncThunk('deleteMod', async (name: string, { getState }) => {
// 	const { state } = getState() as RootState;
// 	const gameInfo = state.gamesInfo.games.find(g => g.id === state.gamesInfo.selectedGame);
// 	if (!gameInfo) {
// 		throw new Error('No game selected');
// 	}
// 	return await game.deleteMod(gameInfo, name);
// });

// export const installMod = createAsyncThunk(
// 	'installMod',
// 	async (mod: { filename: string; id: string; version: string }, { getState }) => {
// 		const { state } = getState() as RootState;
// 		const gameInfo = state.gamesInfo.games.find(g => g.id === state.gamesInfo.selectedGame);
// 		if (!gameInfo) {
// 			throw new Error('No game selected');
// 		}

// 		const content = await moddb.download(mod.id, mod.version);
// 		if (!content) {
// 			return game.getMods(gameInfo);
// 		}
// 		return await game.installMod(gameInfo, mod.filename, content);
// 	},
// );

function loadDevState(): unknown {
	if (process.env.NODE_ENV !== 'development') {
		return;
	}

	if ((document.visibilityState as string) === 'prerender') {
		return;
	}

	const localStored = sessionStorage.getItem('store');
	if (!localStored) {
		return;
	}

	sessionStorage.removeItem('store');

	return JSON.parse(localStored);
}

export const store = configureStore({
	reducer: {
		game: gameSlice.reducer,
		mod: modSlice.reducer,
		misc: miscSlice.reducer,
	},
	preloadedState: loadDevState(),
});
export type RootState = ReturnType<typeof store.getState>;

/** Should be used for testing only */
if (globalThis.window && window.TEST) {
	Object.assign(window, { store });
}
