import type { RootState, SliceType, store as storeType } from '../../src/ui/state/state.reducer';

declare const store: typeof storeType;
declare const slice: SliceType;
declare function startUI(): void;

export async function loadStoreState(state: RootState['state']) {
	if (!document.getElementById('root')) {
		throw new Error('root element not found');
	}

	store.dispatch(slice.actions.loadState(state));
	startUI();
}
