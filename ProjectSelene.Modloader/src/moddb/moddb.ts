import { ModInfo } from '../ui/state/models/mod';
import { ModService, OpenAPI } from './generated';

declare global {
	interface Window {
		/** Is replaced during compilation with the actual value. Only use this as window.DEBUG. */
		DEBUG?: boolean;
		TEST?: boolean;
	}
}

const CDN_BASE = globalThis.window && window.DEBUG ? 'https://localhost:7086' : 'https://cdn.projectselene.org';

export class ModDB {
	constructor() {
		OpenAPI.BASE = globalThis.window && window.DEBUG ? 'https://localhost:7086' : 'https://projectselene.org';
	}

	public async modList(): Promise<ModInfo[]> {
		if (document.visibilityState as string === 'prerender') {
			return [];
		}

		return (await ModService.getApiModList()).entries;
	}

	public async download(id: string, version: string) {
		return (await fetch(CDN_BASE + '/api/Artifact/' + encodeURIComponent(id) + '/' + encodeURIComponent(version))).body;
	}
}