import { PayloadAction } from '@reduxjs/toolkit';
import type { RootState, store as storeType } from '../../src/state/state.reducer';

declare const store: typeof storeType;
declare function startUI(): void;

export async function loadStoreState(state: RootState) {
	if (!document.getElementById('root')) {
		throw new Error('root element not found');
	}

	const action: PayloadAction<RootState> = {
		type: 'loadState',
		payload: state,
	}

	store.dispatch(action);
	startUI();
}
