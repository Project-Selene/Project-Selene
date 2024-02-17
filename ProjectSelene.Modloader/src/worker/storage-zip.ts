import JSZip from 'jszip';
import { Storage } from './storage';

export class StorageZip extends Storage {
	public constructor(
		public readonly target: string,
		private readonly source: string,
		private readonly readFileFromFS: (pathname: string) => Promise<ReadableStream<Uint8Array> | undefined>,
	) {
		super();
	}
	public async readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const stream = await this.readFileFromFS(this.source);
			if (!stream) {
				return false;
			}

			const zip = await JSZip.loadAsync(await (new Response(stream)).arrayBuffer());
			const file = zip.file(path);
			if (!file) {
				return false;
			}

			const writer = response.getWriter();
			file.async('uint8array').then(async result => {
				await writer.write(result);
				writer.close();
			});
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}

	}
	public async readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const stream = await this.readFileFromFS(this.source);
			if (!stream) {
				return false;
			}

			const zip = await JSZip.loadAsync(await (new Response(stream)).arrayBuffer());
			const folder = zip.folder(path);
			if (!folder) {
				return false;
			}

			(async (zip: JSZip, response: WritableStream<Uint8Array>) => {
				const result: { name: string, isDir: boolean }[] = [];
				zip.forEach((name, file) => {
					result.push({
						name,
						isDir: file.dir,
					});
				});
				await new Blob([JSON.stringify(result)], { type: 'application/json' }).stream().pipeTo(response);
			})(zip, response);
			return true;
		} catch (e) {
			console.error(e);
			return false;
		}
	}

	public async stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean> {
		try {
			const stream = await this.readFileFromFS(this.source);
			if (!stream) {
				return false;
			}

			const zip = await JSZip.loadAsync(await (new Response(stream)).arrayBuffer());
			const file = zip.file(path);
			if (!file) {
				return false;
			}

			new Blob([JSON.stringify({ ctimeMs: file.date.getTime() })], { type: 'application/json' }).stream().pipeTo(response);
			return true;
		} catch {
			return false;
		}
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