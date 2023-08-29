import * as idb from 'idb-keyval';
import { GamesInfo, Mod, Mods } from '../state';
import { Filesystem } from './filesystem';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

interface StoredGamesInfo {
    games: Array<StoredGame>;
	selectedGame: number;
	nextId: number;
}

type StoredGame = {
	id: number;
	type: 'handle';
	handle: FileSystemDirectoryHandle;
} | { 
	id: number;
	type: 'fs';
	path: string;
};

export class Game {
	private games = new Map<number, StoredGame>();
	private selectedGame = 0;
	private nextId = 0;

	constructor (
		private readonly filesystem: Filesystem,
	) { 
		if (globalThis['require']) {
			const path: typeof import('path') = globalThis['require']('path');
			this.games.set(0, {
				id: 0,
				type: 'fs',
				path: path.dirname(process.execPath),
			});
			this.nextId++;
		}
	}

	public hasSelectedGame() {
		return this.games.has(this.selectedGame);
	}

	public getSelectedGame(): number {
		return this.selectedGame;
	}

	public setSelectedGame(selectedGame: number) {
		this.selectedGame = selectedGame;
		
		const gameHandles: StoredGamesInfo = {
			games: [...this.games.values()],
			nextId: this.nextId,
			selectedGame: this.selectedGame,
		};
		return idb.set('index', gameHandles, gameStore);
	}

	public async loadGames(): Promise<GamesInfo> {
		const gameHandles: StoredGamesInfo | undefined = await idb.get('index', gameStore);
		if (!gameHandles) {
			return {
				games: [...this.games.values()],
				selectedGame: this.selectedGame,
			};
		}

		this.selectedGame = gameHandles.selectedGame;
		this.nextId = gameHandles.nextId;
		for (const game of gameHandles.games) {
			if (game.id === 0 && globalThis['require']) {
				continue; //Skip current directory entry
			}
			this.games.set(game.id, game);
		}
		
		return {
			games: [...this.games.values()],
			selectedGame: this.selectedGame,
		};
	}

	public async mountGame(): Promise<boolean> {
		const id = this.selectedGame;
		const selectedGameInfo = this.games.get(id);
		if (!selectedGameInfo) {
			throw new Error('Game info must me loaded before loading the game');
		}

		if (selectedGameInfo.type === 'handle') {
			if (await selectedGameInfo.handle.queryPermission({mode: 'read'}) !== 'granted') {
				await selectedGameInfo.handle.requestPermission({mode: 'read'});
			}
			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + id + '/', selectedGameInfo.handle);

			return true;
		}

		return false;
	}

	public async openGame(): Promise<GamesInfo> {
		if (globalThis['require']) {
			throw new Error('Not implemented yet');
		} else {
			const handle = await globalThis.showDirectoryPicker({ id: 'game' });

			this.games.set(this.nextId, {
				id: this.nextId,
				type: 'handle',
				handle,
			});
			this.selectedGame = this.nextId;
			this.nextId++;

			const gameHandles: StoredGamesInfo = {
				games: [...this.games.values()],
				nextId: this.nextId,
				selectedGame: this.selectedGame,
			};

			
			if (await handle.queryPermission({mode: 'read'}) !== 'granted') {
				await handle.requestPermission({mode: 'read'});
			}
			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + gameHandles.selectedGame + '/', handle);

			await idb.set('index', gameHandles, gameStore);

			return gameHandles;
		}
	}

	public async tryGetMods(): Promise<Mods | undefined> {
		const id = this.selectedGame;
		const selectedGameInfo = this.games.get(id);
		if (!selectedGameInfo) {
			throw new Error('Game info must me loaded before loading the game');
		}

		if (selectedGameInfo.type === 'handle' && await selectedGameInfo.handle.queryPermission({mode: 'read'}) !== 'granted') {
			return undefined;
		}

		if (!await this.mountGame()) {
			return undefined;
		}

		return this.getModsInternal(id);
	}

	public async getMods(): Promise<Mods> {
		const id = this.selectedGame;
		await this.mountGame();
		return this.getModsInternal(id);
	}

	private async getModsInternal(gameId: number): Promise<Mods> {
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