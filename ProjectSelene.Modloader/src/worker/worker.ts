/// <reference lib="WebWorker" />

import * as idb from 'idb-keyval';
import { BroadcastCommunication } from '../communication/broadcast';
import { SingleCommunication } from '../communication/single';
import { Patcher } from './patcher';
import { PatcherJSON } from './patcher-json';
import { PatcherRaw } from './patcher-raw';
import { Storage } from './storage';
import { StorageFS } from './storage-fs';
import { StorageHandles } from './storage-handles';
import { StorageHttp } from './storage-http';
import { StorageIndexedDB } from './storage-indexeddb';
import { StorageLink } from './storage-link';
import { StorageZip } from './storage-zip';
import { RegisterDir, RegisterFs, RegisterPatches, RequestData, UnregisterPatches } from './worker-message';
// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: SharedWorkerGlobalScope;

const storages: Storage[] = [];
const rawPatcher = new PatcherRaw(readFile);
const patchers: Patcher[] = [
	rawPatcher,
	new PatcherJSON(readFile),
];

const store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
const workerBroadcast = new BroadcastCommunication('project-selene-worker-broadcast');
let fsChannel: SingleCommunication;
let swChannel: SingleCommunication;

workerBroadcast.on('register-dir', async (data: RegisterDir) => {
	if (data.kind === 'handle') {
		const handle = await idb.get(data.handle, store);
		if (!handle) {
			throw new Error('Could not find handle');
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
	} else if (data.kind === 'fs') {
		storages.unshift(new StorageFS(data.target, data.source, fsChannel));
	} else {
		throw new Error('Not implemented yet: ' + data.kind);
	}
});

workerBroadcast.on('register-patches', (data: RegisterPatches) => {
	if (data.kind === 'json') {
		patchers[1].registerPatches(data.patches);
	} else if (data.kind === 'raw') {
		rawPatcher.registerPatches(data.patches);
	}
});

workerBroadcast.on('unregister-patches', (data: UnregisterPatches) => {
	if (data.kind === 'json') {
		patchers[1].unregisterPatches(data.patches);
	} else if (data.kind === 'raw') {
		rawPatcher.unregisterPatches(data.patches);
	}
});

async function readFileWithPatches(pathname: string, target: Storage | null, path: string | null, response: WritableStream<Uint8Array>): Promise<boolean> {
	const applicable = patchers.filter(p => p.hasPatch(pathname));
	if (applicable.length === 0) {
		if (!target || path === null) {
			return false; //No patches and no target file
		}

		return await target.readFile(path, response); //No patches but we have a file
	}

	let readable: ReadableStream<Uint8Array>;
	if (applicable.includes(rawPatcher)) {
		applicable.splice(applicable.indexOf(rawPatcher), 1);

		//Raw patch exists -> always use it even if we have a file
		readable = rawPatcher.patchFile(pathname, null);
	} else {
		if (!target || !path) {
			return false; //We have patches but non of them are raw and we have no file
		}

		const transformer = new TransformStream();
		const result = await target.readFile(path, transformer.writable);
		if (!result) {
			return false; //We failed to read the file, we can't apply patches to failed reads
		}

		readable = transformer.readable;
	}

	for (const patcher of applicable) {
		readable = patcher.patchFile(pathname, readable);
	}

	readable.pipeTo(response);

	return true;
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

	swChannel = new SingleCommunication(port);

	swChannel.on('register-fs', (data: RegisterFs) => {
		fsChannel = new SingleCommunication(data.channel);
	});

	swChannel.on('fetch', async ({ request, response }: { request: RequestData, response: WritableStream<Uint8Array> }): Promise<ResponseInit> => {
		const pathname = decodeURI(new URL(request.url).pathname);
		let target: Storage | null = null;
		for (const storage of storages) {
			if (pathname.startsWith(storage.target)) {
				if (!target || target.target.length < storage.target.length) {
					target = storage;
				}
			}
		}
		console.log('handling: ', request.url, target);
		if (target) {
			const path = pathname.slice(target.target.length);
			let result: boolean;
			switch (request.headers['x-sw-command']) {
				case 'writeFile':
					result = await target.writeFile(path, request.body, response);
					break;
				case 'readDir':
					result = await target.readDir(path, response);
					break;
				case 'isWritable':
					result = await target.writeGranted(response);
					break;
				case 'stat':
					result = await target.stat(path, response);
					break;
				case 'delete':
					result = await target.delete(path, response);
					break;
				default: {
					result = await readFileWithPatches(pathname, target, path, response);
					break;
				}
			}

			if (result) {
				return {
					status: 200,
					headers: {
						'content-type': 'text/javascript',
					},
				};
			} else {
				new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
				return {
					status: 404,
				};
			}
		} else {
			const result = await readFileWithPatches(pathname, null, null, response);
			if (result) {
				return {
					status: 200,
					headers: {
						'content-type': 'text/javascript',
					},
				};
			}
		}
		return {
			status: 500,
			headers: {
				'content-type': 'text/plain',
			},
		};
	});

	port.start();
});