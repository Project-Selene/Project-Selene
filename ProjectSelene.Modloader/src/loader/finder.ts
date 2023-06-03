import * as idb from 'idb-keyval';
import { AppState, Game, GamesInfo, Mod, Mods } from '../state';
import { Filesystem } from './filesystem';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

export class Finder  {
	private readonly filesystem = new Filesystem();

	public async loadGames(): Promise<GamesInfo> {
		const gameHandles: GamesInfo | undefined = await idb.get('index', gameStore);
		if (!gameHandles) {
			return {
				games: [],
				nextId: 0,
				selectedGame: 0,
			};
		}

		return {
			games: gameHandles.games,
			nextId: gameHandles.nextId,
			selectedGame: gameHandles.selectedGame,
		};
	}

	public async loadGame(state: AppState, id: number): Promise<Game> {
		const selectedGameInfo = state.gamesInfo?.data?.games[id];
		if (!selectedGameInfo) {
			throw new Error('Game info must me loaded before loading the game');
		}

		if (selectedGameInfo.type === 'handle') {
			await selectedGameInfo.handle.requestPermission({mode: 'read'});
			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + id + '/', selectedGameInfo.handle);
		}

		return {
			id,
		};
	}

	public async openGame(state: AppState): Promise<[Game, GamesInfo, Mods | undefined]> {
		if (!state.gamesInfo.success) {
			throw new Error('Cannot open game while no info is available.');
		}

		if (globalThis['require']) {
			throw new Error('Not implemented yet');
		} else {
			const handle = await globalThis.showDirectoryPicker({ id: 'game' });

			const gameHandles: GamesInfo | undefined = {
				games: [
					...state.gamesInfo.data.games,
					{
						id: state.gamesInfo.data.nextId,
						type: 'handle',
						handle,
					},
				],
				nextId: state.gamesInfo.data.nextId + 1,
				selectedGame: state.gamesInfo.data.games.length,
			};
			
			await idb.set('index', gameHandles, gameStore);
			
			return [{
				id: state.gamesInfo.data.nextId,
			}, gameHandles, state.mods.data as Mods];
		}
	}

	public async loadMods(state: AppState, gameId: number): Promise<Mods> {
		let modId = 0;
		const mods: Mod[] = [];
		try {
			const zipMods = await this.filesystem.readDir('/fs/internal/game/' + gameId + '/mods/');
			for (const mod of zipMods) {
				if (!mod.isDir && mod.name.endsWith('.mod.zip')) {
					const internalName = modId;
					modId++;
					await this.filesystem.mountZip('/fs/internal/mods/' + internalName + '/', '/fs/internal/game/' + gameId + '/mods/' + mod.name);
	
					try {
						const manifestText = await this.filesystem.readFile('/fs/internal/mods/' + internalName + '/manifest.json');
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
		
		return {
			mods,
		};
	}
}