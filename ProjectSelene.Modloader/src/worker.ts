import * as idb from 'idb-keyval';
import { SWMessage, SWMessageResponse } from './serviceworker/sw-message';
import { WorkerMessage } from './worker/worker-message';

const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
const numberOfWorkers = 1;

const fileMap = new Map<string, File>();

export class Worker {
	private pendingPromiseResolve?: (data: unknown) => void;
	private pendingPromiseReject?: (err: string) => void;
	
	private pendingWorkerPromiseResolve?: (data: unknown) => void;
	private pendingWorkerPromiseReject?: (err: string) => void;

	async setup() {
		workerBroadcast.addEventListener('message', msg => {
			if (msg.data?.type === 'request-resource') {
				fileMap.get(msg.data.file)?.stream().pipeTo(msg.data.stream);
				return;
			}
			this.pendingWorkerPromiseResolve?.(msg.data);
		} );
		workerBroadcast.addEventListener('messageerror', msg => this.pendingWorkerPromiseReject?.(msg.data));

		if (window.navigator.serviceWorker) {
			navigator.serviceWorker.register('serviceworker.js');
    
			const workers: MessagePort[] = [];
			for (let i = 0; i < numberOfWorkers; i++) {
				const sharedWorker = new SharedWorker('static/js/worker.js', 'Project Selene Worker ' + (i + 1));
				sharedWorker.port.start();
				workers.push(sharedWorker.port);
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

	private postMessageBroadcast(message: WorkerMessage, id?: number) {
		return new Promise((resolve, reject) => {
			let pendingWorkerCount = numberOfWorkers;
			const result: unknown[] = [];
			this.pendingWorkerPromiseResolve = data => {
				if (id !== (data as {id?: number})?.id) {
					return;
				}
				pendingWorkerCount--;
				result.push(data);
				if (pendingWorkerCount === 0) {
					resolve(result);
				}
			} ;
			this.pendingWorkerPromiseReject = reject;

			workerBroadcast.postMessage(message);
		});
	}

	public async registerGameDirectoryHandle(dir: FileSystemDirectoryHandle) {
		const rid = Math.random();
		const id = 'game-dir-' + rid;
		idb.set(id, dir);

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: '/fs/game/',
			kind: 'handle',
			handle: id,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: '/fs/game/',
		} as SWMessage, []);
		idb.del(id);
	}
	public async registerGameDirectoryOnDemand(files: FileList) {
		const rid = Math.random();

		const names = Array.from(files).map(f => f.webkitRelativePath.slice(f.webkitRelativePath.indexOf('/') + 1));
		
		for (const file of files) {
			fileMap.set( '/fs/game/' + file.webkitRelativePath.slice(file.webkitRelativePath.indexOf('/') + 1), file);
		}

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: '/fs/game/',
			kind: 'on-demand',
			files: names,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: '/fs/game/',
		} as SWMessage, []);
	}

	public async registerSavesInMemory(key: string) {
		const rid = Math.random();

		await this.postMessageBroadcast({
			type: 'register-dir',
			id: rid,
			target: '/fs/saves/',
			kind: 'indexed',
			key,
		}, rid);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.postMessage(sw, {
			type: 'filter',
			start: '/fs/saves/',
		} as SWMessage, []);
	}
}

export const worker = new Worker();
