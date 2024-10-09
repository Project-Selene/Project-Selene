import { pollForDevMod } from './loader/dev-poll';
import { Filesystem } from './loader/filesystem';
import { loadState, selectStoreWithoutUI, store } from './state/state.reducer';
import { startUI } from './ui/ui';

if (document.visibilityState as string !== 'prerender') {
	const localStored = localStorage.getItem('store');
	if (localStored) {
		store.dispatch(loadState(JSON.parse(localStored)));
	}
	store.subscribe(() => localStorage.setItem('store', JSON.stringify(selectStoreWithoutUI(store.getState()))));
}

const glob = 'manifest.json';
import('../public/' + glob); //Actually includes all files in public

if (process.env.NODE_ENV === 'development') {
	const stored = sessionStorage.getItem('store');
	if (stored) {
		const storeData = JSON.parse(stored);
		if (storeData) {
			store.dispatch(loadState(storeData));
		}
	}
	sessionStorage.removeItem('store');
	new EventSource('/esbuild').addEventListener('change', () => {
		sessionStorage.setItem('store', JSON.stringify(store.getState().state));
		return location.reload();
	});
}

if (!window.TEST && document.visibilityState as string !== 'prerender') {
	pollForDevMod();
}

new Filesystem().setup().then(() => startUI());
