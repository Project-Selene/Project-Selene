import { Filesystem } from './loader/filesystem';
import { debugSetState, store } from './ui/state/state.reducer';
import { startUI } from './ui/ui';

import('./import.esbuild.js').catch(() => {/* We don't actually want to run it */ });
if (process.env.NODE_ENV === 'development') {
	const stored = sessionStorage.getItem('store');
	if (stored) {
		const storeData = JSON.parse(stored);
		if (storeData) {
			store.dispatch(debugSetState(storeData));
		}
	}
	sessionStorage.removeItem('store');
	new EventSource('/esbuild').addEventListener('change', () => {
		sessionStorage.setItem('store', JSON.stringify(store.getState().state));
		return location.reload();
	});
}

if (navigator.userAgent === 'ReactSnap') {
	if (location.href.endsWith('404.html')) {
		document.title = 'Project Selene 404';
	}
}

new Filesystem().setup().then(() => startUI());