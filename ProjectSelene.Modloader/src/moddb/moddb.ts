import { ModInfo } from '../state';

export class ModDB {
	private static url = 'https://localhost:7086';
	public async modList(): Promise<ModInfo[]> {
		return (await (await fetch(ModDB.url + '/mod/list')).json()).entries;
	}
}