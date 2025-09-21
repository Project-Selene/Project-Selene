import { filesystem } from '@project-selene/selene';
import { store } from './state/state.reducer';
import { startUI } from './ui/ui';

const glob = 'manifest.json';
import('../public/' + glob); //Actually includes all files in public

if (process.env.NODE_ENV === 'development') {
	(async () => {
		const idb = await import('idb-keyval');
		const stateStore = idb.createStore('SeleneDb-ui-state-store', 'gameHandles');
		const stored = await idb.get('store', stateStore);
		if (stored) {
			await idb.clear(stateStore);
			// store.dispatch(loadState(storeData));
		}
		new EventSource('http://localhost:8080/esbuild').addEventListener('change', async () => {
			await idb.set('store', store.getState())
			return location.reload();
		});
	})()
}

if (!window.TEST && (document.visibilityState as string) !== 'prerender') {
	// pollForDevMod();
}

filesystem.setup().then(() => startUI());
