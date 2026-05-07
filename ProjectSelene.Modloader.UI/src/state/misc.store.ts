import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MiscStore {
	infoOpen: boolean;
	playAnimation: boolean;
	statusVisible: boolean;
	status: string;
	statusIcon: 'loading' | 'success' | 'error';
}

const initialState: MiscStore = {
	infoOpen: false,
	playAnimation: false,
	statusVisible: false,
	status: '',
	statusIcon: 'loading',
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
		},
		setStatus: (state, { payload }: PayloadAction<{ status: string; visible: boolean, icon: 'loading' | 'success' | 'error' }>) => {
			state.status = payload.status;
			state.statusVisible = payload.visible;
			state.statusIcon = payload.icon;
		},
	},
	selectors: {
		selectInfoDialogOpen: state => state.infoOpen,
		selectPlayAnimation: state => state.playAnimation,
		selectStatusVisible: state => state.statusVisible,
		selectStatus: state => state.status,
		selectStatusIcon: state => state.statusIcon,
	},
});

export const { setInfoOpen, setPlayAnimation, setStatus } = miscSlice.actions;

export const { selectInfoDialogOpen, selectPlayAnimation, selectStatusVisible, selectStatus, selectStatusIcon } = miscSlice.selectors;
