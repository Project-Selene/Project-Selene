import * as idb from 'idb-keyval';
import { RegisterDir, RegisterPatches, UnregisterPatches } from '../worker/worker-message';
import { ClientEventHandler } from './event-handler';
import { StorageFileList } from './worker-storage-filelist';
import { StorageFS } from './worker-storage-fs';

export const WORKER_COUNT = 1;

declare global {
	interface RequestInit {
		duplex?: 'half';
	}
}

interface FsMessage {
	target: string;
	source: string;
	path: string;
	response: WritableStream<Uint8Array>;
}

interface FsMessageWrite extends FsMessage {
	content: ReadableStream<Uint8Array>;
}

interface SwFetchEvent {
	request: SwFetchRequest;
	response: WritableStream;
}

interface SwFetchRequest {
	method: string;
	url: string;
	headers: Record<string, string>;
	body: WritableStream | null;
}

class Filesystem {
	private readonly store = idb.createStore('SeleneDb-handle-transfer', 'handle-transfer');
	private readonly fileListFS = new StorageFileList();
	private readonly workers: ClientEventHandler[] = [];
	private nextWorker = 0;

	public async setup() {
		if (window.navigator.serviceWorker) {
			window.navigator.serviceWorker.addEventListener('message', event => {
				if (event.origin !== location.origin) {
					return;
				}

				this.handleSwMessage(event);
			});

			await navigator.serviceWorker.register('serviceworker.js');

			await this.startWorkers();
		}
	}

	private handleSwMessage(event: MessageEvent<{ type: 'fetch', id: number, data: SwFetchEvent }>) {
		const id = event.data.id;
		switch (event.data.type) {
			case 'fetch':
				this.handleSwFetch(event.data.data)
					.then(response => event.source?.postMessage({ type: 'response', success: true, id, response }))
					.catch(err => event.source?.postMessage({ type: 'response', success: false, id, response: err }));
		}
	}

	private handleSwFetch(data: SwFetchEvent): Promise<ResponseInit> {
		const worker = this.workers[this.nextWorker];
		this.nextWorker = (this.nextWorker + 1) % this.workers.length;

		if (data.request.body) {
			return worker.send('fetch', data, data.response, data.request.body);
		} else {
			return worker.send('fetch', data, data.response);
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

	private sendToAllWorkers(type: string, message: unknown) {
		const promises: Promise<void>[] = [];
		for (const worker of this.workers) {
			promises.push(worker.send(type, message));
		}
		return Promise.allSettled(promises);
	}

	public async mountDirectoryHandle(mount: string, dir: FileSystemDirectoryHandle) {
		console.debug('mounted directory', mount);
		const rid = Math.random();
		const id = 'dir-' + rid;
		await idb.set(id, dir, this.store);

		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'handle',
			handle: id,
		} satisfies RegisterDir);

		idb.del(id, this.store);
	}
	public async mountDirectoryFS(mount: string, dir: string) {
		console.debug('mounted directory', mount);
		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'fs',
			source: dir,
		} satisfies RegisterDir);
	}
	public async mountFileList(mount: string, files: FileList) {
		console.debug('mounted files', mount);
		for (const file of files) {
			this.fileListFS.registerFile(
				mount + file.webkitRelativePath.slice(file.webkitRelativePath.indexOf('/') + 1),
				file,
			);
		}

		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'on-demand',
		} satisfies RegisterDir);
	}
	public async mountInMemory(mount: string, key: string) {
		console.debug('mounted in memory', mount, key);
		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'indexed',
			key,
		} satisfies RegisterDir);
	}
	public async mountZip(mount: string, source: string) {
		console.debug('mounted zip', mount, source);
		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'zip',
			source,
		} satisfies RegisterDir);
	}
	public async mountLink(mount: string, source: string) {
		console.debug('mounted link', mount, source);
		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'link',
			source,
		} satisfies RegisterDir);
	}
	public async mountHttp(mount: string, source: string) {
		console.debug('mounted http', mount, source);
		await this.sendToAllWorkers('register-dir', {
			target: mount,
			kind: 'http',
			source,
		} satisfies RegisterDir);
	}

	private async startWorkers() {
		for (let i = 0; i < WORKER_COUNT; i++) {
			const worker = new Worker('static/js/worker.js', {
				name: 'Project Selene Worker ' + (i + 1),
			});
			const coms = new ClientEventHandler(worker);
			this.workers.push(coms);

			await this.registerLocalFS(coms);
			await this.registerFileLists(coms);

		}
		return this.workers;
	}

	private async registerLocalFS(coms: ClientEventHandler) {
		if (window['require']) {
			const fs = new StorageFS();

			const fsChannel = new MessageChannel();

			const fsComs = new ClientEventHandler(fsChannel.port1);
			fsComs.on('readFile', (args: FsMessage) => fs.readFile(args.target, args.source, args.path, args.response));
			fsComs.on('readDir', (args: FsMessage) => fs.readDir(args.target, args.source, args.path, args.response));
			fsComs.on('writeFile', (args: FsMessageWrite) =>
				fs.writeFile(args.target, args.source, args.path, args.response, args.content),
			);
			fsComs.on('stat', (args: FsMessage) => fs.stat(args.target, args.source, args.path, args.response));
			fsComs.on('delete', (args: FsMessage) => fs.delete(args.target, args.source, args.path, args.response));

			fsChannel.port1.start();
			await coms.send('register-fs', { channel: fsChannel.port2 }, fsChannel.port2);
		}
	}

	private async registerFileLists(coms: ClientEventHandler) {
		const fileListChannel = new MessageChannel();

		const fsComs = new ClientEventHandler(fileListChannel.port1);
		fsComs.on('readFile', (args: FsMessage) => this.fileListFS.readFile(args.target, args.path, args.response));
		fsComs.on('readDir', (args: FsMessage) => this.fileListFS.readDir(args.target, args.path, args.response));
		fsComs.on('stat', (args: FsMessage) => this.fileListFS.stat(args.target, args.path, args.response));

		fileListChannel.port1.start();
		await coms.send(
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
		await this.sendToAllWorkers('register-patches', {
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
		await this.sendToAllWorkers('unregister-patches', {
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
		await this.sendToAllWorkers('register-patches', {
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
		await this.sendToAllWorkers('unregister-patches', {
			kind: 'raw',
			patches,
		} satisfies UnregisterPatches);
	}
}

export const filesystem = new Filesystem();