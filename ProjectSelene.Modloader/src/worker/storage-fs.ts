import { Storage } from './storage';

export class StorageFS extends Storage {
	public constructor(
        public readonly target: string,
        private readonly source: string,
		private readonly fsChannel: MessagePort,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.postMessage({
			kind: 'readFile',
			source: this.source,
			target: this.target,
			path,
			response,
		});
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.postMessage({
			kind: 'readDir',
			source: this.source,
			target: this.target,
			path,
			response,
		});
	}
	public async writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"granted"}'], {type: 'application/json'}).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.postMessage({
			kind: 'writeFile',
			source: this.source,
			target: this.target,
			path,
			response,
			content,
		});
	}
	
	public async stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		return await this.postMessage({
			kind: 'stat',
			source: this.source,
			target: this.target,
			path,
			response,
		});
	}

	private postMessage(message: {id?: number, type?: string, kind: string, target: string, source: string, path: string, response: WritableStream<Uint8Array>, content?: ReadableStream<Uint8Array>}) {
		return new Promise<boolean>((resolve, reject) => {
			const handler = (msg: MessageEvent) => {
				if (msg.data.type === 'fs-response' && msg.data.id === message.id) {
					this.fsChannel.removeEventListener('message', handler);
					if (msg.data.fail) {
						reject(msg.data.result);
					} else {
						resolve(msg.data.result);
					}
				}
			};

			this.fsChannel.addEventListener('message', handler);

			message.id = Math.random();
			message.type = 'fs-request';
			this.fsChannel.postMessage(message, message.content ? [message.content, message.response] as unknown as Transferable[] : [message.response] as unknown as Transferable[]);
		});
	}
}
