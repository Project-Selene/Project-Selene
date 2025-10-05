import { createSlice } from '@reduxjs/toolkit';

import { GameState } from './models/game';
import { ModManifest } from './models/mod';



interface GameStore {
	state: GameState;
	installedMods: ModManifest[];
	installedModsLoading: boolean;
}

const initialState: GameStore = {
	state: GameState.PROMPT,
	installedMods: [],
	installedModsLoading: false,
};

export const gameSlice = createSlice({
	name: 'game',
	initialState,
	reducers: {
		setInstalledMods: (state, action: { payload: ModManifest[] }) => {
			state.installedMods = action.payload;
		},
		setInstalledModsLoading: (state, action: { payload: boolean }) => {
			state.installedModsLoading = action.payload;
		}
	},
	selectors: {
		selectGameState: state => state.state,
		selectInstalledMods: state => state.installedMods,
		selectInstalledModsLoading: state => state.installedModsLoading,
	},
});

export const { setInstalledMods, setInstalledModsLoading } = gameSlice.actions;

export const { selectGameState, selectInstalledMods, selectInstalledModsLoading } = gameSlice.selectors;
