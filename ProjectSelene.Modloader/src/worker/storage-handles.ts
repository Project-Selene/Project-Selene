import { Storage } from './storage';

export class StorageHandles extends Storage {
	public constructor(
		public readonly target: string,
		private readonly dir: FileSystemDirectoryHandle,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const parts = path.split('/');
			const fileHandle = await this.resolveFile(parts, 'read', false);
			const file = await fileHandle.getFile();
			file.stream().pipeTo(response); //Do not wait here
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}

	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const parts = path.split('/');
			const dirHandle = await this.resolveFolder(parts, 'read', false);
			const result: { name: string, isDir: boolean }[] = [];
			for await (const [name, entry] of dirHandle.entries()) {
				result.push({
					name,
					isDir: entry.kind === 'directory',
				});
			}
			new Blob([JSON.stringify(result)], { type: 'application/json' }).stream().pipeTo(response); //Do not wait here
			return true;
		} catch {
			return false;
		}
	}
	public async writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"' + await this.dir.queryPermission({ mode: 'readwrite' }) + '"}'], { type: 'application/json' }).stream().pipeTo(response);
		return true;
	}

	public async writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const parts = path.split('/');
			const fileHandle = await this.resolveFile(parts, 'readwrite', true);
			const file = await fileHandle.createWritable();
			content.pipeTo(file)
				.then(() => file.close())
				.then(() => new Blob(['{"success":true}'], { type: 'application/json' }).stream().pipeTo(response))
				.catch(() => new Blob(['{"success":false}'], { type: 'application/json' }).stream().pipeTo(response));  //Do not wait here
			return true;
		} catch {
			return false;
		}
	}

	public async stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const parts = path.split('/');
			const fileHandle = await this.resolveFile(parts, 'read', false);
			const file = await fileHandle.getFile();
			new Blob([JSON.stringify({ ctimeMs: file.lastModified })], { type: 'application/json' }).stream().pipeTo(response);
			return true;
		} catch {
			return false;
		}
	}

	public async delete(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const parts = path.split('/');
			const dir = await this.resolveFolder(parts.slice(0, parts.length - 1), 'readwrite', false);
			await dir.removeEntry(parts[parts.length - 1], { recursive: true });
			new Blob(['{"success":true}'], { type: 'application/json' }).stream().pipeTo(response);
			return true;
		} catch {
			return false;
		}
	}

	private async resolveFolder(path: string[], mode: FileSystemPermissionMode, create: boolean) {
		let dir = await this.ensurePermissions(this.dir, mode);
		for (const part of path) {
			if (part) {
				dir = await this.ensurePermissions(await dir.getDirectoryHandle(part, { create }), mode);
			}
		}
		return dir;
	}
	private async resolveFile(path: string[], mode: FileSystemPermissionMode, create: boolean) {
		const dir = await this.resolveFolder(path.slice(0, path.length - 1), mode, create);
		const file = await dir.getFileHandle(path[path.length - 1], { create });
		return await this.ensurePermissions(file, mode);
	}

	private async ensurePermissions<T extends FileSystemDirectoryHandle | FileSystemFileHandle>(dir: T, mode: FileSystemPermissionMode) {
		const state = await dir.queryPermission({ mode });
		if (state !== 'granted') {
			const result = await dir.requestPermission({ mode });
			console.log('permission result', result);
		}
		return dir;
	}
}