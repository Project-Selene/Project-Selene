import { ModInfo } from '../state';

declare global {
	interface Window {
		DEBUG?: boolean;
	}
}

export class ModDB {
	private static url = window.DEBUG ? 'https://localhost:7086' : (location.protocol + '//' + location.host + '/');
	public async modList(): Promise<ModInfo[]> {
		return (await (await fetch(ModDB.url + '/mod/list')).json()).entries;
	}

	public async download(mod: ModInfo) {
		return (await fetch(ModDB.url + '/mod/download/' + mod.id)).body;
	}
}