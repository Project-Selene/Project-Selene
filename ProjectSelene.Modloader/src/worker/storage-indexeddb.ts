import * as idb from 'idb-keyval';
import { Storage } from './storage';

export class StorageIndexedDB extends Storage {
	private readonly store: idb.UseStore;
	public constructor(
        public readonly target: string,
        private readonly key: string,
	) {
		super();
		this.store = idb.createStore('SeleneDb-worker-store-' + key, 'worker-store-' + key);
	}
	
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const content: string | undefined = await idb.get(path, this.store);
			if (content === undefined) {
				return false;
			}

			new Blob([content], {type: 'text/plain'}).stream().pipeTo(response); //Do not wait here
			return true;
		} catch {
			return false;
		}
	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		this.readDirAsync(path, response);
		return true;
	}
	private async readDirAsync(path: string, response: WritableStream<Uint8Array>): Promise<void> {
		const result: {name: string, isDir: boolean}[] = [];
		try {
			const keys = await idb.keys(this.store);
			for (const key of keys) {
				const str = key.toString();
				if (str.startsWith(path)) {
					const name = str.slice(path.length);
					if (name.includes('/')) {
						result.push({
							isDir: true,
							name: name.slice(0, name.indexOf('/')),
						});
					} else {
						result.push({
							isDir: false,
							name,
						});
					}
				}
			}
		} finally {
			new Blob([JSON.stringify(result)], {type: 'application/json'}).stream().pipeTo(response); //Do not wait here
		}
	}
	public async writeGranted(response: WritableStream<Uint8Array>): Promise<boolean> {
		new Blob(['{"state":"granted"}'], {type: 'application/json'}).stream().pipeTo(response); //Do not wait here
		return true;
	}
	public async writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean> {
		this.writeFileAsync(path, content, response);
		return true;
	}
	private async writeFileAsync(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<void> {
		try {
			const contentText = await new Response(content).text();
			await idb.set(path, contentText, this.store);
			await new Blob(['{"success":true}'], {type: 'application/json'}).stream().pipeTo(response);
		} catch {
			await new Blob(['{"success":false}'], {type: 'application/json'}).stream().pipeTo(response);
		}
	}
}