/// <reference lib="WebWorker" />

import * as idb from 'idb-keyval';
import { Patcher } from './patcher';
import { PatcherJSON } from './patcher-json';
import { Storage } from './storage';
import { StorageHandles } from './storage-handles';
import { StorageHttp } from './storage-http';
import { StorageIndexedDB } from './storage-indexeddb';
import { StorageLink } from './storage-link';
import { StorageZip } from './storage-zip';
import { WorkerMessage } from './worker-message';
// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: SharedWorkerGlobalScope;

const store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
workerBroadcast.addEventListener('message', handleMessage);

const storages: Storage[] = [];
const patchers: Patcher[] = [
	new PatcherJSON(readFile),
];

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
			storages.unshift(new StorageHandles(data.target, handle));
		} else if (data.kind === 'indexed') {
			storages.unshift(new StorageIndexedDB(data.target, data.key));
		} else if (data.kind === 'zip') {
			storages.unshift(new StorageZip(data.target, data.source, readFile));
		} else if (data.kind === 'http') {
			storages.unshift(new StorageHttp(data.target, data.source));
		} else if (data.kind === 'link') {
			const sourceStorage = storages.filter(s => data.source.startsWith(s.target))
				.sort((a, b) => b.target.length - a.target.length)[0];
			const sourcePath = data.source.substring(sourceStorage.target.length);

			storages.unshift(new StorageLink(data.target, sourcePath, sourceStorage));
		} else {
			throw new Error('Not implemented yet: ' + data.kind);
		}
		workerBroadcast.postMessage({type: 'ok', id: data.id} as WorkerMessage);
		break;
	}
	case 'register-patches': {
		if (data.kind === 'json') {
			patchers[0].registerPatches(data.patches);
		}
		workerBroadcast.postMessage({type: 'ok', id: data.id} as WorkerMessage);
		break;
	}
	case 'unregister-patches': {
		if (data.kind === 'json') {
			patchers[0].unregisterPatches(data.patches);
		}
		workerBroadcast.postMessage({type: 'ok', id: data.id} as WorkerMessage);
		break;
	}
	case 'fetch': {
		const pathname = decodeURI(new URL(data.request.url).pathname);
		let target: Storage | null = null;
		for (const storage of storages) {
			if (pathname.startsWith(storage.target)) {
				if (!target || target.target.length < storage.target.length) {
					target = storage;
				}
			}
		}
		console.log('handling: ', data.request.url, target);
		if (target) {
			const path = pathname.slice(target.target.length);
			let result: boolean;
			switch (data.request.headers['x-sw-command']) {
			case 'writeFile': 
				result = await target.writeFile(path, data.request.body, data.response);
				break;
			case 'readDir': 
				result = await target.readDir(path, data.response);
				break;
			case 'isWritable':
				result = await target.writeGranted(data.response);
				break;
			case 'stat':
				result = await target.stat(path, data.response);
				break;
			default: {
				const patcher = patchers.find(p => p.hasPatch(pathname));
				if (patcher) {
					const transformer = new TransformStream();
					result = await target.readFile(path, transformer.writable);
					if (result) {
						patcher.patchFile(pathname, transformer.readable).pipeTo(data.response);
					} else {
						transformer.readable.pipeTo(data.response);
					}
				} else {
					result = await target.readFile(path, data.response);
				}
				break;
			}
			}
			
			if (result) {
				workerBroadcast.postMessage({
					type: 'response',
					id: data.id,
					response: {
						status: 200,
						headers: {
							'content-type': 'text/javascript',
						},
					},
				} as WorkerMessage);
			} else {
				new Blob([], {type: 'text/plain'}).stream().pipeTo(data.response);
				workerBroadcast.postMessage({
					type: 'response',
					id: data.id,
					response: {
						status: 404,
					},
				} as WorkerMessage);
			}
		}
		break;
	}
	default:
		break;
	}
}

async function readFile(pathname: string) {
	for (const storage of storages) {
		if (pathname.startsWith(storage.target)) {
			const str = new TransformStream();

			const path = pathname.slice(storage.target.length);
			const result = await storage.readFile(path, str.writable);
				
			if (result) {
				return str.readable;
			}
		}
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