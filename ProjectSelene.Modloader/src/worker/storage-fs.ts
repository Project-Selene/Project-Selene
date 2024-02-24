import { SingleCommunication } from '../communication/single';
import { Storage } from './storage';

export class StorageFS extends Storage {
	public constructor(
		public readonly target: string,
		private readonly source: string,
		private readonly fsChannel: SingleCommunication,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fsChannel.send<boolean>('readFile', {
			source: this.source,
			target: this.target,
			path,
			response,
		}, response);
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fsChannel.send<boolean>('readDir', {
			source: this.source,
			target: this.target,
			path,
			response,
		}, response);
	}
	public async writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"granted"}'], { type: 'application/json' }).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fsChannel.send<boolean>('writeFile', {
			source: this.source,
			target: this.target,
			path,
			response,
			content,
		}, content, response);
	}

	public async stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fsChannel.send<boolean>('stat', {
			source: this.source,
			target: this.target,
			path,
			response,
		}, response);
	}

	public async delete(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fsChannel.send<boolean>('delete', {
			source: this.source,
			target: this.target,
			path,
			response,
		}, response);
	}
}
