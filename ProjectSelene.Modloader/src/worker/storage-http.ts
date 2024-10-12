import { Storage } from './storage';

export class StorageHttp extends Storage {
	public constructor(
		public readonly target: string,
		private readonly source: string,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const resp = await fetch(this.source + path);
			resp.body?.pipeTo(response);

			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}
	public async readDir(): Promise<boolean> {
		return false; //If this is ever needed we can implement it for dev mods
	}

	public async stat(): Promise<boolean> {
		return false;
	}

	public async writeGranted(): Promise<boolean> {
		return false;
	}

	public async writeFile(): Promise<boolean> {
		return false;
	}

	public async delete(): Promise<boolean> {
		return false;
	}
}
