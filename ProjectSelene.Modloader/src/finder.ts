import * as idb from 'idb-keyval';
import { Draft, Immutable, castImmutable } from 'immer';
import { filesystem } from './filesystem';
import { doAsync } from './hooks/state';
import { Game, Games, Mod, Mods, State } from './state';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

export async function loadGames(state: Draft<State>) {
	state.games = { loading: true };
	doAsync((state, games) => {
		state.games = {
			loading: false,
			success: true,
			data: games,
		};
	}, async () => loadGamesFromStore());
}

export async function loadGamesFromStore(): Promise<Games> {
	const games: Game[] = [];	
	for (const key of (await idb.get('keys', gameStore)) ?? []) {
		const handle = await idb.get(key + '_handle', gameStore);
		if (!handle) {
			throw new Error('Failed to load game folder from storage');
		}
        
		await handle.requestPermission({ mode: 'read' });
		await filesystem.mountDirectoryHandle('/fs/internal/game/' + key + '/', handle);

		games.push({
			name: key + '',
			internalName: key + '',
		});
	}

	return {
		games,
		selectedGame: (await idb.get('selectedGame', gameStore)) ?? 0,
	};
}

export async function openGameFolder(games: Immutable<Games>) {
	const handle = await window.showDirectoryPicker({ id: 'game', mode: 'read' });
	const newGames: Game[] = Object.assign([], games.games);
	const newKey = Math.random() + '';
	newGames.push({
		internalName: newKey,
		name: newKey,
	});

	const keys = (await idb.get('keys', gameStore)) ?? [];
	keys.push(newKey);
	await idb.set('keys', keys, gameStore);
	await idb.set(newKey + '_handle', handle, gameStore);

	await handle.requestPermission({ mode: 'read' });
	await filesystem.mountDirectoryHandle('/fs/internal/game/' + newKey + '/', handle);

	return {
		games: newGames,
		selectedGame: games.games.length,
	} as Games;
}

export async function loadMods(state: Draft<State>) {
	state.mods = { loading: true };
	doAsync((state, mods) => {
		state.mods = {
			loading: false,
			success: true,
			data: mods,
		};
	}, async () => loadModsFromStore(castImmutable(state.games?.data)));
}

export async function loadModsFromStore(games?: Immutable<Games>): Promise<Mods> {
	let modId = 0;
	const mods: Mod[] = [];
	if (games) {
		for (const game of games.games) {
			try {
				const zipMods = await filesystem.readDir('/fs/internal/game/' + game.internalName + '/mods/');
				for (const mod of zipMods) {
					if (!mod.isDir && mod.name.endsWith('.mod.zip')) {
						const internalName = modId;
						modId++;
						await filesystem.mountZip('/fs/internal/mods/' + internalName + '/', '/fs/internal/game/' + game.internalName + '/mods/' + mod.name);

						try {
							const manifestText = await filesystem.readFile('/fs/internal/mods/' + internalName + '/manifest.json');
							const manifest = JSON.parse(manifestText);
							mods.push({
								currentInfo: manifest,
								enabled: true,
								internalName: internalName + '',
							});
						} catch (e) {
							console.error('Invalid mod: ' + mod.name, e);
						}
					}
				}
			} catch {
				//This happens mostly if the mod directory doesn't exist. Ignore.
			}
		}
	}
	return {
		mods,
	};
}