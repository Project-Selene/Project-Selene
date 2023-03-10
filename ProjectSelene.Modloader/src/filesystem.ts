import { Worker } from './worker';

export class Filesystem {
	private readonly worker = new Worker();

	public async setup() {
		await this.worker.setup();
		await this.mountInMemory('/fs/saves/', 'saves');
	}

	public async readFile(path: string): Promise<string> {
		return await (await fetch(path)).text();
	}

	public async writeFile(path: string, content: string): Promise<boolean> {
		return (await (await fetch(path, {
			method: 'POST',
			body: content,
			headers: {
				'X-SW-Command': 'writeFile',
			},
		})).json())?.success;
	}

	public async readDir(path: string): Promise<{name: string, isDir: boolean}[]> {
		return await (await fetch(path, {
			method: 'GET',
			headers: {
				'X-SW-Command': 'readDir',
			},
		})).json();
	}

	public async isWritable(path: string): Promise<boolean> {
		return await (await fetch(path, {
			method: 'GET',
			headers: {
				'X-SW-Command': 'isWritable',
			},
		})).json();
	}
	
	public async mountDirectoryHandle(mount: string, dir: FileSystemDirectoryHandle) {
		await this.worker.registerDirectoryHandle(mount, dir);
	}
	public async mountFileList(mount: string, files: FileList) {
		await this.worker.registerGameDirectoryOnDemand(mount, files);
	}
	public async mountInMemory(mount: string, key: string) {
		await this.worker.registerInMemory(mount, key);
	}
}

export const filesystem = new Filesystem();