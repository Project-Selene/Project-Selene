import { filesystem } from './filesystem';
import { doAsync } from './hooks/state';
import { Mods } from './state';

export function loadMods() {
	doAsync((state, mods) => {
		state.mods = {
			loading: false,
			success: true,
			data: mods,
		};
	}, async () => {
		// await filesystem.mountInMemory('/fs/mods/', 'mods');

		// const result: Mods = {
		// 	mods: [],
		// 	store: {
		// 		type: 'indexedDb',
		// 		key: 'mods',
		// 	},
		// };
		const handle = await window.showDirectoryPicker({ id: 'mods', mode: 'read' });

		await filesystem.mountDirectoryHandle('/fs/mods/', handle);

		const result: Mods = {
			mods: [],
			store: {
				type: 'handle',
				handle,
			},
		};

		try {
			const modFolders = await filesystem.readDir('/fs/mods/');
			for (const modFolder of modFolders) {
				const modManifest = JSON.parse(await filesystem.readFile('/fs/mods/' + modFolder.name + '/manifest.json'));
				result.mods.push({
					internalName: modFolder.name,
					enabled: true,
					currentInfo: {
						id: modManifest.id,
						name: modManifest.name,
						version: modManifest.version,
						description: modManifest.description,
					},
				});
			}
		} catch (e) {
			console.error(e);
		}


		return result;
	});
}