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

			const zip = await JSZip.loadAsync(await new Response(stream).arrayBuffer());
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

			const zip = await JSZip.loadAsync(await new Response(stream).arrayBuffer());
			const folder = zip.folder(path);
			if (!folder) {
				return false;
			}

			(async (zip: JSZip, response: WritableStream<Uint8Array>) => {
				const result: { name: string; isDir: boolean }[] = [];
				zip.forEach((name, file) => {
					if (file.dir) {
						// Directories always end with a slash and may not have another slash in the name
						if (name.indexOf('/') !== name.length - 1) {
							return;
						}
						result.push({
							name: name.slice(0, -1),
							isDir: true,
						});
					} else {
						// Files may not have a slash
						if (name.includes('/')) {
							return;
						}
						result.push({
							name,
							isDir: false,
						});
					}
				});
				await new Blob([JSON.stringify(result)], { type: 'application/json' }).stream().pipeTo(response);
			})(folder, response);
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

			const zip = await JSZip.loadAsync(await new Response(stream).arrayBuffer());
			const file = zip.file(path);
			if (!file) {
				return false;
			}

			new Blob([JSON.stringify({ ctimeMs: file.date.getTime() })], {
				type: 'application/json',
			})
				.stream()
				.pipeTo(response);
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
