import * as idb from 'idb-keyval';
import { BroadcastCommunication } from '../communication/broadcast';
import { SingleCommunication } from '../communication/single';
import { SWCommunication } from '../communication/sw';
import { WORKER_COUNT } from '../communication/worker';
import { RegisterDir, RegisterPatches, UnregisterPatches } from '../worker/worker-message';
import { StorageFS } from './worker-storage-fs';

const workerBroadcast = new BroadcastCommunication('project-selene-worker-broadcast');

const fileMap = new Map<string, File>();

interface FsMessage {
	target: string,
	source: string,
	path: string,
	response: WritableStream<Uint8Array>;
}

interface FsMessageWrite extends FsMessage {
	content: ReadableStream<Uint8Array>;
}


export class Worker {
	private swChannel!: SWCommunication;
	private readonly store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
	private readonly filters: string[] = [];

	async setup() {
		if (window.navigator.serviceWorker) {
			await navigator.serviceWorker.register('serviceworker.js');
    
			const workers: MessagePort[] = [];
			for (let i = 0; i < WORKER_COUNT; i++) {
				const sharedWorker = new SharedWorker('static/js/worker.js', 'Project Selene Worker ' + (i + 1));
				sharedWorker.port.start();
				workers.push(sharedWorker.port);
			}


        
			if (window['require']) {
				for (const worker of workers) {
					const fs = new StorageFS();
	
					const fsChannel = new MessageChannel();

					const fsComs = new SingleCommunication(fsChannel.port1);
					fsComs.on('readFile', (args: FsMessage) => fs.readFile(args.target, args.source, args.path, args.response));
					fsComs.on('readDir', (args: FsMessage) => fs.readDir(args.target, args.source, args.path, args.response));
					fsComs.on('writeFile', (args: FsMessageWrite) => fs.writeFile(args.target, args.source, args.path, args.response, args.content));
					fsComs.on('stat', (args: FsMessage) => fs.stat(args.target, args.source, args.path, args.response));
					

					await new SingleCommunication(worker).send('register-fs', {channel: fsChannel.port2}, fsChannel.port2);
				}
			}
			const reg = await navigator.serviceWorker.ready;
			if (reg.active) {
				this.swChannel = new SWCommunication();
				this.swChannel.on('install', async () => {
					const workers: MessagePort[] = [];
					for (let i = 0; i < WORKER_COUNT; i++) {
						const sharedWorker = new SharedWorker('/static/js/worker.js', 'Project Selene Worker ' + (i + 1));
						sharedWorker.port.start();
						workers.push(sharedWorker.port);
					}
				
					await this.swChannel.sendToSW('workers', workers, ...workers);
					await Promise.all(this.filters.map(f => this.swChannel.sendToSW('filter', f)));
				});
				await this.swChannel.sendToSW('workers', workers, ...workers);
			}
		}
	}


	public async registerDirectoryHandle(mount: string, dir: FileSystemDirectoryHandle) {
		const rid = Math.random();
		const id = 'dir-' + rid;
		await idb.set(id, dir, this.store);

		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'handle',
			handle: id,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
		idb.del(id, this.store);
	}
	public async registerGameDirectoryOnDemand(mount: string, files: FileList) {
		const names = Array.from(files).map(f => f.webkitRelativePath.slice(f.webkitRelativePath.indexOf('/') + 1));
		
		for (const file of files) {
			fileMap.set(mount + file.webkitRelativePath.slice(file.webkitRelativePath.indexOf('/') + 1), file);
		}

		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'on-demand',
			files: names,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}
	public async registerDirectoryFS(mount: string, dir: string) {
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'fs',
			source: dir,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}
	public async registerInMemory(mount: string, key: string) {
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'indexed',
			key,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}
	public async registerZip(mount: string, source: string) {
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'zip',
			source,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}
	public async registerLink(mount: string, source: string) {
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'link',
			source,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}
	public async registerHttp(mount: string, source: string) {
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'http',
			source,
		} satisfies RegisterDir);
		
		const sw = (await navigator.serviceWorker.ready).active;
		if (!sw) {
			throw new Error('No serviceworker found');
		}
		await this.swChannel.sendToSW('filter', mount);
		this.filters.push(mount);
	}

	public async registerJSONPatches(patches: {
        target: string,
        source: string,
    }[]) {
		await workerBroadcast.send('register-patches', {
			kind: 'json',
			patches,
		} satisfies RegisterPatches);
	}
	public async unregisterJSONPatches(patches: {
        target: string,
        source: string,
    }[]) {
		await workerBroadcast.send('unregister-patches', {
			kind: 'json',
			patches,
		} satisfies UnregisterPatches);
	}

	public async registerRawPatches(patches: {
        target: string,
        source: string,
    }[]) {
		await workerBroadcast.send('register-patches', {
			kind: 'raw',
			patches,
		} satisfies RegisterPatches);
	}
	public async unregisterRawPatches(patches: {
        target: string,
        source: string,
    }[]) {
		await workerBroadcast.send('unregister-patches', {
			kind: 'raw',
			patches,
		} satisfies UnregisterPatches);
	}
}