import * as idb from 'idb-keyval';
import { BroadcastCommunication } from '../communication/broadcast';
import { ServiceWorkerCommunicationClient } from '../communication/serviceworker-client';
import { SingleCommunication } from '../communication/single';
import { WORKER_COUNT } from '../communication/worker';
import { RegisterDir, RegisterPatches, UnregisterPatches } from '../worker/worker-message';
import { StorageFileList } from './worker-storage-filelist';
import { StorageFS } from './worker-storage-fs';

declare global {
	interface RequestInit {
		duplex?: 'half';
	}
}

const workerBroadcast = new BroadcastCommunication('project-selene-worker-broadcast');

interface FsMessage {
	target: string;
	source: string;
	path: string;
	response: WritableStream<Uint8Array>;
}

interface FsMessageWrite extends FsMessage {
	content: ReadableStream<Uint8Array>;
}


class Filesystem {
	private swChannel!: ServiceWorkerCommunicationClient;
	private readonly store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
	private readonly fileListFS = new StorageFileList();
	private readonly workers: SharedWorker[] = [];

	public async setup() {
		if (window.navigator.serviceWorker) {
			await navigator.serviceWorker.register('serviceworker.js');

			const workers = await this.getSharedWorkers();

			const reg = await navigator.serviceWorker.ready;
			if (reg.active) {
				this.swChannel = new ServiceWorkerCommunicationClient();
				this.swChannel.on('install', async () => {
					const workers = await this.getSharedWorkers();
					const ports = workers.map(w => w.port);
					await this.swChannel.sendToSW('workers', ports, ...ports);
				});
				const ports = workers.map(w => w.port);
				await this.swChannel.sendToSW('workers', ports, ...ports);
			}
		}
	}

	public async readFile(path: string): Promise<string> {
		return fetch(path).then(resp => {
			if (!resp.ok) {
				throw new Error('Failed to read file' + resp.status.toString());
			}
			return resp.text();
		});
	}

	public async openFile(path: string): Promise<ReadableStream<Uint8Array>> {
		return fetch(path).then(resp => {
			if (!resp.ok) {
				throw new Error('Failed to read file' + resp.status.toString());
			}
			if (resp.body === null) {
				throw new Error('Failed to read file: body is null');
			}
			return resp.body;
		});
	}

	public async writeFile(path: string, content: BodyInit): Promise<boolean> {
		return (
			await (
				await fetch(path, {
					method: 'POST',
					body: content,
					headers: {
						'X-SW-Command': 'writeFile',
					},
					duplex: 'half',
				})
			).json()
		)?.success;
	}

	public async readDir(path: string): Promise<{ name: string; isDir: boolean }[]> {
		return await (
			await fetch(path, {
				method: 'GET',
				headers: {
					'X-SW-Command': 'readDir',
				},
			})
		).json();
	}

	public async isWritable(path: string): Promise<boolean> {
		return await (
			await fetch(path, {
				method: 'GET',
				headers: {
					'X-SW-Command': 'isWritable',
				},
			})
		).json();
	}

	public async stat(path: string): Promise<{ ctimeMs: number }> {
		return await (
			await fetch(path, {
				method: 'GET',
				headers: {
					'X-SW-Command': 'stat',
				},
			})
		).json();
	}

	public async delete(path: string): Promise<boolean> {
		return (
			await (
				await fetch(path, {
					method: 'DELETE',
					headers: {
						'X-SW-Command': 'delete',
					},
				})
			).json()
		)?.success;
	}

	public async mountDirectoryHandle(mount: string, dir: FileSystemDirectoryHandle) {
		console.log('mounted directory', mount);
		const rid = Math.random();
		const id = 'dir-' + rid;
		await idb.set(id, dir, this.store);

		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'handle',
			handle: id,
		} satisfies RegisterDir);

		idb.del(id, this.store);
	}
	public async mountDirectoryFS(mount: string, dir: string) {
		console.log('mounted directory', mount);
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'fs',
			source: dir,
		} satisfies RegisterDir);
	}
	public async mountFileList(mount: string, files: FileList) {
		console.log('mounted files', mount);
		for (const file of files) {
			this.fileListFS.registerFile(
				mount + file.webkitRelativePath.slice(file.webkitRelativePath.indexOf('/') + 1),
				file,
			);
		}

		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'on-demand',
		} satisfies RegisterDir);
	}
	public async mountInMemory(mount: string, key: string) {
		console.log('mounted in memory', mount, key);
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'indexed',
			key,
		} satisfies RegisterDir);
	}
	public async mountZip(mount: string, source: string) {
		console.log('mounted zip', mount, source);
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'zip',
			source,
		} satisfies RegisterDir);
	}
	public async mountLink(mount: string, source: string) {
		console.log('mounted link', mount, source);
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'link',
			source,
		} satisfies RegisterDir);
	}
	public async mountHttp(mount: string, source: string) {
		console.log('mounted http', mount, source);
		await workerBroadcast.send('register-dir', {
			target: mount,
			kind: 'http',
			source,
		} satisfies RegisterDir);
	}

	private async getSharedWorkers() {
		if (this.workers.length > 0) {
			const result: SharedWorker[] = [];
			for (let i = 0; i < WORKER_COUNT; i++) {
				const sharedWorker = new SharedWorker('/static/js/worker.js', {
					name: 'Project Selene Worker ' + (i + 1),
				});
				sharedWorker.port.start();
				result.push(sharedWorker);
			}
			return result;
		}

		for (let i = 0; i < WORKER_COUNT; i++) {
			const sharedWorker = new SharedWorker('/static/js/worker.js', {
				name: 'Project Selene Worker ' + (i + 1),
			});
			sharedWorker.port.start();
			this.workers.push(sharedWorker);

			await this.registerLocalFS(sharedWorker.port);
			await this.registerFileLists(sharedWorker.port);

		}
		return this.workers;
	}

	private async registerLocalFS(worker: MessagePort) {
		if (window['require']) {
			const fs = new StorageFS();

			const fsChannel = new MessageChannel();

			const fsComs = new SingleCommunication(fsChannel.port1);
			fsComs.on('readFile', (args: FsMessage) => fs.readFile(args.target, args.source, args.path, args.response));
			fsComs.on('readDir', (args: FsMessage) => fs.readDir(args.target, args.source, args.path, args.response));
			fsComs.on('writeFile', (args: FsMessageWrite) =>
				fs.writeFile(args.target, args.source, args.path, args.response, args.content),
			);
			fsComs.on('stat', (args: FsMessage) => fs.stat(args.target, args.source, args.path, args.response));
			fsComs.on('delete', (args: FsMessage) => fs.delete(args.target, args.source, args.path, args.response));

			await new SingleCommunication(worker).send('register-fs', { channel: fsChannel.port2 }, fsChannel.port2);

		}
	}

	private async registerFileLists(worker: MessagePort) {
		const fileListChannel = new MessageChannel();

		const fsComs = new SingleCommunication(fileListChannel.port1);
		fsComs.on('readFile', (args: FsMessage) => this.fileListFS.readFile(args.target, args.path, args.response));
		fsComs.on('readDir', (args: FsMessage) => this.fileListFS.readDir(args.target, args.path, args.response));
		fsComs.on('stat', (args: FsMessage) => this.fileListFS.stat(args.target, args.path, args.response));

		await new SingleCommunication(worker).send(
			'register-filelist',
			{ channel: fileListChannel.port2 },
			fileListChannel.port2,
		);
	}
	public async registerJSONPatches(
		patches: {
			target: string;
			source: string;
		}[],
	) {
		await workerBroadcast.send('register-patches', {
			kind: 'json',
			patches,
		} satisfies RegisterPatches);
	}
	public async unregisterJSONPatches(
		patches: {
			target: string;
			source: string;
		}[],
	) {
		await workerBroadcast.send('unregister-patches', {
			kind: 'json',
			patches,
		} satisfies UnregisterPatches);
	}

	public async registerRawPatches(
		patches: {
			target: string;
			source: string;
		}[],
	) {
		await workerBroadcast.send('register-patches', {
			kind: 'raw',
			patches,
		} satisfies RegisterPatches);
	}
	public async unregisterRawPatches(
		patches: {
			target: string;
			source: string;
		}[],
	) {
		await workerBroadcast.send('unregister-patches', {
			kind: 'raw',
			patches,
		} satisfies UnregisterPatches);
	}
}

export const filesystem = new Filesystem();