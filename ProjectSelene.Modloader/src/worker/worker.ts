/// <reference lib="WebWorker" />

import * as idb from 'idb-keyval';
import { Storage } from './storage';
import { StorageHandles } from './storage-handles';
import { StorageIndexedDB } from './storage-indexeddb';
import { WorkerMessage } from './worker-message';
// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: SharedWorkerGlobalScope;

const store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
workerBroadcast.addEventListener('message', handleMessage);

const storages: Storage[] = [];

async function handleMessage(event: MessageEvent) {
	const data: WorkerMessage = event.data;
	switch (data.type) {
	case 'register-dir': {
		if (data.kind === 'handle') {
			const handle = await idb.get(data.handle, store);
			if (!handle) {
				workerBroadcast.postMessage({type: 'error', id: data.id} as WorkerMessage);
				return;
			}
			storages.push(new StorageHandles(data.target, handle));
		} else if (data.kind === 'indexed') {
			storages.push(new StorageIndexedDB(data.target, data.key));
		} else {
			throw new Error('Not implemented yet: ' + data.kind);
		}
		workerBroadcast.postMessage({type: 'ok', id: data.id} as WorkerMessage);
		break;
	}
	case 'fetch': {
		console.log('handling: ', data.request.url);
		const pathname = decodeURI(new URL(data.request.url).pathname);
		for (const storage of storages) {
			if (pathname.startsWith(storage.target)) {
				const path = pathname.slice(storage.target.length);
				switch (data.request.headers['x-sw-command']) {
				case 'writeFile': 
					storage.writeFile(path, data.request.body, data.response);
					break;
				case 'readDir': 
					storage.readDir(path, data.response);
					break;
				case 'isWritable':
					storage.writeGranted(data.response);
					break;
				default: 
					storage.readFile(path, data.response);
					break;
				}
			}
		}
		break;
	}
	default:
		break;
	}
}


self.addEventListener('connect', event => {
	const port = event.ports[0];

	port.addEventListener('message', handleMessage);

	port.addEventListener('messageerror', event => {
		console.error('Error sending message to worker: ', event.data);
	});

	port.start();
});