import { ModDto, ModsClient, StorageClient } from './generated/selene-api';

declare global {
	interface Window {
		/** Is replaced during compilation with the actual value. Only use this as window.DEBUG. */
		DEBUG?: boolean;
		TEST?: boolean;
	}
}

export class ModDB {
	private readonly baseUrl =
		globalThis.window && window.DEBUG ? 'https://localhost:7086' : 'https://projectselene.org';
	private readonly mods = new ModsClient(this.baseUrl);
	private readonly storage = new StorageClient(this.baseUrl);

	public async modList(): Promise<ModDto[]> {
		if ((document.visibilityState as string) === 'prerender') {
			return [];
		}

		return (await this.mods.getMods()).mods;
	}

	public async download(id: string, version: string) {
		return (await this.storage.downloadArtifact(id, version)).data.stream();
	}
}
