import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MiscStore {
	infoOpen: boolean;
}

const initialState: MiscStore = {
	infoOpen: false,
};

export const miscSlice = createSlice({
	name: 'misc',
	initialState,
	reducers: {
		setInfoOpen: (state, { payload }: PayloadAction<boolean>) => {
			state.infoOpen = payload;
		},
	},
	selectors: {
		selectInfoDialogOpen: state => state.infoOpen,
	},
});

export const { setInfoOpen } = miscSlice.actions;

export const { selectInfoDialogOpen } = miscSlice.selectors;
