import * as idb from 'idb-keyval';
import { SWMessage, SWMessageResponse } from '../serviceworker/sw-message';
import { WorkerMessage } from '../worker/worker-message';
import { StorageFS } from './worker-storage-fs';

const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
const numberOfWorkers = 1;

const fileMap = new Map<string, File>();

export class Worker {
	private pendingPromiseResolve?: (data: unknown) => void;
	private pendingPromiseReject?: (err: string) => void;

	private readonly store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');

	async setup() {
		if (window.navigator.serviceWorker) {
			if (navigator.serviceWorker.controller) {
				await (await navigator.serviceWorker.ready).unregister();
			}
			await navigator.serviceWorker.register('serviceworker.js');
    
			const workers: MessagePort[] = [];
			for (let i = 0; i < numberOfWorkers; i++) {
				const sharedWorker = new SharedWorker('static/js/worker.js', 'Project Selene Worker ' + (i + 1));
				sharedWorker.port.start();
				workers.push(sharedWorker.port);
			}
        
			if (window['require']) {
				for (const worker of workers) {
					const fs = new StorageFS();
	
					const fsChannel = new MessageChannel();
		
					fsChannel.port1.onmessage = msg => {
						if (msg.data.type === 'fs-request') {
							(fs as unknown as {[name: string]: (target: string, source: string, path: string, response: WritableStream<Uint8Array>, content?: ReadableStream<Uint8Array>) => Promise<boolean>})[msg.data.kind](msg.data.target, msg.data.source, msg.data.path, msg.data.response, msg.data.content)
								.then(result => fsChannel.port1.postMessage({type: 'fs-response', result, id: msg.data.id }))
								.catch(result => fsChannel.port1.postMessage({type: 'fs-response', result, id: msg.data.id, fail: true }));
							return;
						} else if (msg.data.type === 'fs-response') {
							return;
						}
					};
					
					// fsChannel.port2.postMessage({type: 'fs-request'});

					await this.postMessageToSingleWorker(worker, {
						type: 'register-fs',
						id: Math.random(),
						channel: fsChannel.port2,
					}, [fsChannel.port2]);
				}
			}
			const reg = await navigator.serviceWorker.ready;
			if (reg.active) {
				navigator.serviceWorker.addEventListener('message', event => {
					if (this.pendingPromiseReject && this.pendingPromiseResolve && event.data?.type) {
						const response = event.data as SWMessageResponse;
						switch (response.type) {
						case 'ok':
							this.pendingPromiseResolve(response);
							break;
						case 'error':
							this.pendingPromiseReject(response.message);
							break;
						}
					}
				});
				navigator.serviceWorker.addEventListener('messageerror', event => console.error('message error', event));
				
				await this.postMessage(reg.active, {
					type: 'workers',
					workers,
				}, workers);

			}
		}
	}

	private postMessage(target: ServiceWorker | MessagePort, message: SWMessage, transferables: Transferable[]) {
		return new Promise((resolve, reject) => {
			this.pendingPromiseResolve = resolve;
			this.pendingPromiseReject = reject;

			target.postMessage(message, transferables);
		});
	}
	private postMessageToSingleWorker(target: MessagePort, message: WorkerMessage, transferables: Transferable[]) {
		return new Promise((resolve, reject) => {
			const res = (msg: MessageEvent) => {
				resolve(msg.data);
				workerBroadcast.removeEventListener('message', res);
				workerBroadcast.removeEventListener('messageerror', rej);
			};
			const rej = (msg: MessageEvent) => {
				reject(msg.data);
				workerBroadcast.removeEventListener('message', res);
				workerBroadcast.removeEventListener('messageerror', rej);
			};
			workerBroadcast.addEventListener('message', res);
			workerBroadcast.addEventListener('messageerror', rej);

			target.postMessage(message, transferables);
		});
	}

	private postMessageBroadcast(message: WorkerMessage, id?: number) {
		const rid = id;
		return new Promise((resolve, reject) => {
			let pendingWorkerCount = numberOfWorkers;
			const result: unknown[] = [];
			const res = (msg: MessageEvent) => {
				const data = msg.data;
				if (rid !== (data as {id?: number})?.id) {
					return;
				}
				pendingWorkerCount--;
				result.push(data);
				if (pendingWorkerCount === 0) {
					// console.log('resolve worker message', id);
					resolve(result);
					workerBroadcast.removeEventListener('message', res);
					workerBroadcast.removeEventListener('messageerror', rej);
				}
			};
			const rej = (msg: MessageEvent) => {
				reject(msg.data);
				workerBroadcast.removeEventListener('message', res);
				workerBroadcast.removeEventListener('messageerror', rej);
			};
			workerBroadcast.addEventListener('message', res);
			workerBroadcast.addEventListener('messageerror', rej);

			workerBroadcast.postMessage(message);
		});
	}

	public async registerDirectoryHandle(mount: string, dir: FileSystemDirectoryHandle) {
		const rid = Math.random();
		const id = 'dir-' + rid;
		await idb.set(id, dir, this.store);

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'handle',
			handle: id,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
		idb.del(id, this.store);
	}
	public async registerGameDirectoryOnDemand(mount: string, files: FileList) {
		const rid = Math.random();

		const names = Array.from(files).map(f => f.webkitRelativePath.slice(f.webkitRelativePath.indexOf('/') + 1));
		
		for (const file of files) {
			fileMap.set(mount + file.webkitRelativePath.slice(file.webkitRelativePath.indexOf('/') + 1), file);
		}

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'on-demand',
			files: names,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
	}
	public async registerDirectoryFS(mount: string, dir: string) {
		const rid = Math.random();
		const id = 'dir-' + rid;
		await idb.set(id, dir, this.store);

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'fs',
			source: dir,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
		idb.del(id, this.store);
	}
	public async registerInMemory(mount: string, key: string) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'indexed',
			key,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
	}
	public async registerZip(mount: string, source: string) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'zip',
			source,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
	}
	public async registerLink(mount: string, source: string) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'link',
			source,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
	}
	public async registerHttp(mount: string, source: string) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: mount,
			kind: 'http',
			source,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: mount,
		} as SWMessage, []);
	}

	public async registerJSONPatches(patches: {
        target: string,
        source: string,
    }[]) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-patches',
			id: rid,
			kind: 'json',
			patches,
		}, rid);
	}
	public async unregisterJSONPatches(patches: {
        target: string,
        source: string,
    }[]) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'unregister-patches',
			id: rid,
			kind: 'json',
			patches,
		}, rid);
	}

	public async registerRawPatches(patches: {
        target: string,
        source: string,
    }[]) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-patches',
			id: rid,
			kind: 'raw',
			patches,
		}, rid);
	}
	public async unregisterRawPatches(patches: {
        target: string,
        source: string,
    }[]) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'unregister-patches',
			id: rid,
			kind: 'raw',
			patches,
		}, rid);
	}
}