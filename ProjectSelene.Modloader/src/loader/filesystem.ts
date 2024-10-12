import { Worker } from './worker';

declare global {
	interface RequestInit {
		duplex?: 'half';
	}
}

export class Filesystem {
	public static readonly worker = new Worker();
	private readonly worker = Filesystem.worker;

	public async setup() {
		await this.worker.setup();
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
		await this.worker.registerDirectoryHandle(mount, dir);
	}
	public async mountDirectoryFS(mount: string, dir: string) {
		console.log('mounted directory', mount);
		await this.worker.registerDirectoryFS(mount, dir);
	}
	public async mountFileList(mount: string, files: FileList) {
		console.log('mounted files', mount);
		await this.worker.registerGameDirectoryOnDemand(mount, files);
	}
	public async mountInMemory(mount: string, key: string) {
		console.log('mounted in memory', mount, key);
		await this.worker.registerInMemory(mount, key);
	}
	public async mountZip(mount: string, source: string) {
		console.log('mounted zip', mount, source);
		await this.worker.registerZip(mount, source);
	}
	public async mountLink(mount: string, source: string) {
		console.log('mounted link', mount, source);
		await this.worker.registerLink(mount, source);
	}
	public async mountHttp(mount: string, source: string) {
		console.log('mounted http', mount, source);
		await this.worker.registerHttp(mount, source);
	}
}
