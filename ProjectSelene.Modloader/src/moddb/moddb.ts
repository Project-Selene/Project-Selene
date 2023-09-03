import { ModInfo } from '../state';
import { ModService, OpenAPI } from './generated';

declare global {
	interface Window {
		DEBUG?: boolean;
	}
}

export class ModDB {
	constructor() {
		OpenAPI.BASE = window.DEBUG ? 'https://localhost:7086' : 'https://projectselene.org';
	}
	
	public async modList(): Promise<ModInfo[]> {
		if (navigator.userAgent === 'ReactSnap') {
			return [];
		}

		return (await ModService.getModList()).entries;
	}

	public async download(mod: ModInfo) {
		return (await fetch(OpenAPI.BASE + '/mod/download/' + encodeURIComponent(mod.id) + '/' + encodeURIComponent(mod.version))).body;
	}
}