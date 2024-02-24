import { SingleCommunication } from '../communication/single';
import { Storage } from './storage';

export class StorageFileList extends Storage {
	public constructor(
		public readonly target: string,
		private readonly fileListChannel: SingleCommunication,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fileListChannel.send<boolean>('readFile', {
			target: this.target,
			path,
			response,
		}, response);
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fileListChannel.send<boolean>('readDir', {
			target: this.target,
			path,
			response,
		}, response);
	}
	public async writeGranted(): Promise<boolean> {
		return false;
	}
	public async writeFile(): Promise<boolean> {
		return false;
	}

	public async stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.fileListChannel.send<boolean>('stat', {
			target: this.target,
			path,
			response,
		}, response);
	}

	public async delete(): Promise<boolean> {
		return false;
	}
}
