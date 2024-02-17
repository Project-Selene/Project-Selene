import { Storage } from './storage';

export class StorageLink extends Storage {
	public constructor(
		public readonly target: string,
		private readonly sourcePath: string,
		private readonly sourceStorage: Storage,
	) {
		super();
	}
	public readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.readFile(this.sourcePath + path, response);
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.readDir(this.sourcePath + path, response);
	}
	public writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.writeGranted(response);
	}
	public writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.writeFile(this.sourcePath + path, content, response);
	}
	public stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.stat(this.sourcePath + path, response);
	}
	public delete(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.delete(this.sourcePath + path, response);
	}
}