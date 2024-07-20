export class StorageFS {
	private readonly fs: typeof import('fs');
	private readonly path: typeof import('path');
	private readonly textEncoder = new TextEncoder();
	public constructor(
	) {
		this.fs = window['require']('fs');
		this.path = window['require']('path');
	}
	public async readFile(target: string, source: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const content = await this.fs.promises.open(this.path.join(source, path), 'r');
			const reader = content.createReadStream();
			const writer = response.getWriter();
			reader.on('data', str => typeof str === 'string' ? writer.write(this.textEncoder.encode(str)) : writer.write(str));
			reader.on('close', () => writer.close());
			return true;
		} catch {
			new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
			return false;
		}
	}
	public async readDir(target: string, source: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const dir = await this.fs.promises.readdir(this.path.join(source, path), { withFileTypes: true, encoding: 'utf-8' });
			const result = dir.map(f => ({ isDir: f.isDirectory(), name: f.name }));
			new Blob([JSON.stringify(result)], { type: 'application/json' }).stream().pipeTo(response); //Do not wait here
			return true;
		} catch {
			new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
			return false;
		}
	}
	public async writeGranted(target: string, source: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"granted"}'], { type: 'application/json' }).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeFile(target: string, source: string, path: string, response: WritableStream<Uint8Array>, content: ReadableStream<Uint8Array>): Promise<boolean> {
		try {
			const filePath = this.path.join(source, path);
			await this.fs.promises.mkdir(this.path.dirname(filePath), { recursive: true });
			const handle = await this.fs.promises.open(filePath, 'w');
			const writer = handle.createWriteStream();
			content.pipeTo(new WritableStream({
				write(data) {
					writer.write(data);
				},
				close() {
					writer.close();
					new Blob(['{"success":true}'], { type: 'application/json' }).stream().pipeTo(response);
				},
				abort() {
					new Blob(['{"success":false}'], { type: 'application/json' }).stream().pipeTo(response);
				},
			}));
			return true;
		} catch {
			new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
			return false;
		}
	}

	public async stat(target: string, source: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const stat = await this.fs.promises.stat(this.path.join(source, path));
			new Blob([JSON.stringify(stat)], { type: 'application/json' }).stream().pipeTo(response);
			return true;
		} catch {
			new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
			return false;
		}
	}

	public async delete(target: string, source: string, path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			await this.fs.promises.rm(this.path.join(source, path), { recursive: true });
			new Blob(['{"success":true}'], { type: 'application/json' }).stream().pipeTo(response);
			return true;
		} catch {
			new Blob([], { type: 'text/plain' }).stream().pipeTo(response);
			return false;
		}
	}
}
