/// <reference lib="WebWorker" />

import * as idb from 'idb-keyval';
import { RegisterDir, WorkerMessage } from './worker-message';
// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: SharedWorkerGlobalScope;

const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
workerBroadcast.addEventListener('message', handleMessage);

const dirs: RegisterDir[] = [];
const handles = new WeakMap<RegisterDir, FileSystemDirectoryHandle>();

async function handleMessage(event: MessageEvent) {
	const data: WorkerMessage = event.data;
	switch (data.type) {
	case 'register-dir': {
		dirs.push(data);
		if (data.kind === 'handle') {
			const handle = await idb.get(data.handle);
			if (!handle) {
				workerBroadcast.postMessage({type: 'error', id: data.id} as WorkerMessage);
			}
			handles.set(data, handle);
		}
		workerBroadcast.postMessage({type: 'ok', id: data.id} as WorkerMessage);
		break;
	}
	case 'fetch': {
		console.log('handling: ', data.request.url);
		const pathname = decodeURI(new URL(data.request.url).pathname);
		for (const dir of dirs) {
			if (pathname.startsWith(dir.target)) {
				switch(dir.kind) {
				case 'handle': {
					const parts = pathname.split('/').slice(3);
					let handle = handles.get(dir);
					if (!handle) {
						new Blob(['{"success":false}'], {type: 'application/json'}).stream().pipeTo(data.response);
						return;
					}
					for (const part of parts.slice(0, parts.length - 1)) {
						handle = await handle.getDirectoryHandle(part);
					}

					switch (data.request.headers['x-sw-command']) {
					case 'writeFile': {
						const fileHandle = await handle.getFileHandle(parts[parts.length - 1]);
						await data.request.body.pipeTo(await fileHandle.createWritable());
						new Blob(['{"success":true}'], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					}
					case 'readDir': {
						const dirHandle = await handle.getDirectoryHandle(parts[parts.length - 1]);
						const result: {name: string, isDir: boolean}[] = [];
						for await (const [name, entry] of dirHandle.entries()) {
							result.push({
								name,
								isDir: entry.kind === 'directory',
							});
						}
						new Blob([JSON.stringify(result)], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					}
					case 'isWritable':
						new Blob(['{"state":"denied"}'], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					default: {
						const fileHandle = await handle.getFileHandle(parts[parts.length - 1]);
						const file = await fileHandle.getFile();
						file.stream().pipeTo(data.response);
						break;
					}
					}
					break;
				}
				case 'on-demand': {
					const target = pathname.substring(dir.target.length);
					switch (data.request.headers['x-sw-command']) {
					case 'writeFile': {
						new Blob(['{"success":false}'], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					}
					case 'readDir': {
						const result: {name: string, isDir: boolean}[] = dir.files
							.filter(file => file.startsWith(target))
							.map(file => {
								let name = file.slice(target.length);
								while (name.startsWith('/')) {
									name = name.slice(1);
								}
								if (name.includes('/')) {
									return {
										name: name.slice(0, name.indexOf('/')),
										isDir: true,
									};
								} else {
									return {name, isDir: false};
								}
							});
						new Blob([JSON.stringify(result)], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					}
					case 'isWritable':
						new Blob(['{"state":"denied"}'], {type: 'application/json'}).stream().pipeTo(data.response);
						break;
					default: {
						const exact = dir.files.indexOf(target);
						if (exact != -1) {
							event.source?.postMessage({
								type: 'request-resource',
								file: pathname,
								stream: data.response,
							} as WorkerMessage);
						} else {
							new Blob(['Not found: ' + pathname], {type: 'text/plain'}).stream().pipeTo(data.response);
						}
					}
					}
					break;
				}
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