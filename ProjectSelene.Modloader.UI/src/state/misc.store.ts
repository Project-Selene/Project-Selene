import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MiscStore {
	infoOpen: boolean;
	playAnimation: boolean;
}

const initialState: MiscStore = {
	infoOpen: false,
	playAnimation: false,
};

export const miscSlice = createSlice({
	name: 'misc',
	initialState,
	reducers: {
		setInfoOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.infoOpen = payload;
		},
		setPlayAnimation: (state, { payload }: PayloadAction<boolean>) => {
			state.playAnimation = payload;
		}
	},
	selectors: {
		selectInfoDialogOpen: state => state.infoOpen,
		selectPlayAnimation: state => state.playAnimation,
	},
});

export const { setInfoOpen, setPlayAnimation } = miscSlice.actions;

export const { selectInfoDialogOpen, selectPlayAnimation } = miscSlice.selectors;
