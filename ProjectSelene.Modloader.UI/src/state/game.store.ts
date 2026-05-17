import { createSlice } from '@reduxjs/toolkit';

import { GameState } from './models/game';
import { ModManifest } from './models/mod';

interface GameStore {
	state: GameState;
	installedMods: ModManifest[];
	disabledModIds: string[];
	installedModsLoading: boolean;
}

const initialState: GameStore = {
	state: GameState.PROMPT,
	installedMods: [],
	disabledModIds: [],
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
		},
		setDisabledMods: (state, action: { payload: string[] }) => {
			state.disabledModIds = action.payload;
		},
		setGameState: (state, action: { payload: GameState }) => {
			state.state = action.payload;
		},
	},
	selectors: {
		selectGameState: state => state.state,
		selectInstalledMods: state => state.installedMods,
		selectDisabledMods: state => state.disabledModIds,
		selectInstalledModsLoading: state => state.installedModsLoading,
	},
});

export const { setGameState, setInstalledMods, setDisabledMods, setInstalledModsLoading } = gameSlice.actions;

export const { selectGameState, selectInstalledMods, selectDisabledMods, selectInstalledModsLoading } =
	gameSlice.selectors;
