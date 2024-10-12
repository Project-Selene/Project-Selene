export class StorageFileList {
	private readonly fileMap = new Map<string, File>();
	private readonly dirMap = new Map<string, { isDir: boolean; name: string }[]>();

	public registerFile(path: string, file: File) {
		this.fileMap.set(path, file);

		let next = path.indexOf('/', 1);
		while (next !== -1) {
			const dir = path.substring(0, next + 1);
			let entries = this.dirMap.get(dir);
			if (!entries) {
				entries = [];
				this.dirMap.set(dir, entries);
			}
			next = path.indexOf('/', next + 1);
			if (next === -1) {
				entries.push({ isDir: false, name: path.substring(dir.length) });
			} else {
				entries.push({ isDir: true, name: path.substring(dir.length, next) });
			}
		}
	}

	public async readFile(target: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		const file = this.fileMap.get(target + path);
		if (!file) {
			return false;
		}

		file.stream().pipeTo(response);
		return true;
	}
	public async readDir(target: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		const result = this.dirMap.get(target + path) || [];
		new Blob([JSON.stringify(result)], { type: 'application/json' }).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async stat(target: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		const file = this.fileMap.get(target + path);
		if (!file) {
			return false;
		}

		new Blob([JSON.stringify({ ctimeMs: file.lastModified })], {
			type: 'application/json',
		})
			.stream()
			.pipeTo(response);
		return true;
	}
}
