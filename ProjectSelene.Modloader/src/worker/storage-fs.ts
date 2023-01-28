import { Storage } from './storage';

export class StorageFS extends Storage {
	private readonly fs: typeof import('fs');
	private readonly path: typeof import('path');
	private readonly textEncoder = new TextEncoder();
	public constructor(
        public readonly target: string,
        private readonly source: string,
	) {
		super();
		this.fs = require('fs');
		this.path = require('path');
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const content = await this.fs.promises.open(this.path.join(this.source, path), 'r');
			const reader = content.createReadStream();
			const writer = response.getWriter();
			reader.on('data', str => typeof str === 'string' ? writer.write(this.textEncoder.encode(str)) : writer.write(str));
			reader.on('close', () => writer.close());
			return true;
		} catch {
			return false;
		}
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		const dir = await this.fs.promises.readdir(this.path.join(this.source, path), {withFileTypes: true, encoding: 'utf-8'});
		const result = dir.map(f => ({isDir: f.isDirectory(), name: f.name}));
		new Blob([JSON.stringify(result)], {type: 'application/json'}).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"granted"}'], {type: 'application/json'}).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const handle = await this.fs.promises.open(this.path.join(this.source, path), 'w');
			const writer = handle.createWriteStream();
			content.pipeTo(new WritableStream({
				write(data) {
					writer.write(data);
				},
				close() {
					writer.close();
					new Blob(['{"success":true}'], {type: 'application/json'}).stream().pipeTo(response);
				},
				abort() {
					new Blob(['{"success":false}'], {type: 'application/json'}).stream().pipeTo(response);
				},
			}));
			return true;
		} catch {
			return false;
		}
	}
	
}
