import { transform } from '../loader/transformer';
import { Storage } from './storage';

export class StorageTransform extends Storage {
	public constructor(
		public readonly target: string,
		private readonly sourcePath: string,
		private readonly sourceStorage: Storage,
		private readonly prefix: string,
	) {
		super();
	}
	public readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		const pipe = new TransformStream();
		this.innerReadFile(pipe.readable, response);
		return this.sourceStorage.readFile(this.sourcePath + path, pipe.writable);
	}

	private async innerReadFile(readable: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<void> {
		const text = await new Response(readable).text();
		const result = transform(text, this.prefix);

		const writer = response.getWriter();
		writer.write(new TextEncoder().encode(result));
		writer.close();
	}

	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.readDir(this.sourcePath + path, response);
	}
	public async readDirRecursive(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.readDirRecursive(this.sourcePath + path, response);
	}
	public writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.writeGranted(response);
	}
	public writeFile(
		path: string,
		content: ReadableStream<Uint8Array>,
		response: WritableStream<Uint8Array>,
	): Promise<boolean> {
		return this.sourceStorage.writeFile(this.sourcePath + path, content, response);
	}
	public stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.stat(this.sourcePath + path, response);
	}
	public delete(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return this.sourceStorage.delete(this.sourcePath + path, response);
	}
}
