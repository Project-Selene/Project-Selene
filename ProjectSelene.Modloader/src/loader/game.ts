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

	private readonly mountedGames = new Set<number>();
	private readonly mountedMods = new Set<string>();

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
			await this.loadGames();
			if (!this.games.has(this.selectedGame)) {
				return false;
			}
			return this.mountGame();
		}

		if (selectedGameInfo.type === 'handle') {
			if (await selectedGameInfo.handle.queryPermission({mode: 'read'}) !== 'granted') {
				await selectedGameInfo.handle.requestPermission({mode: 'read'});
			}

			if (this.mountedGames.has(id)) {
				return true;
			}
			this.mountedGames.add(id);
			
			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + id + '/', selectedGameInfo.handle);
			
			return true;
		} else if (selectedGameInfo.type === 'fs') {
			if (this.mountedGames.has(id)) {
				return true;
			}
			this.mountedGames.add(id);

			await this.filesystem.mountDirectoryFS('/fs/internal/game/' + id + '/', selectedGameInfo.path);

			return true;
		}

		return false;
	}

	public async openGame(): Promise<GamesInfo> {
		if (globalThis['require']) {
			throw new Error('Not implemented yet');
		} else {
			const handle = await globalThis.showDirectoryPicker({ id: 'game' });

			for (const game of this.games.values()) {
				if (game.type === 'handle' && await game.handle.isSameEntry(handle)) {
					this.selectedGame = game.id;

					const stored: StoredGamesInfo = {
						games: [...this.games.values()],
						nextId: this.nextId,
						selectedGame: this.selectedGame,
					};
					await idb.set('index', stored, gameStore);
					return stored;
				}
			}

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
			return undefined;
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

					if (!this.mountedMods.has('/fs/internal/mods/' + internalName + '/')) {
						await this.filesystem.mountZip('/fs/internal/mods/' + internalName + '/', '/fs/internal/game/' + gameId + '/mods/' + mod.name);
						this.mountedMods.add('/fs/internal/mods/' + internalName + '/');
					}
	
					try {
						const manifestText = await this.filesystem.readFile('/fs/internal/mods/' + internalName + '/manifest.json');
						const manifest = JSON.parse(manifestText);
						mods.push({
							currentInfo: manifest,
							enabled: true,
							internalName: internalName + '',
							filename: mod.name,
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

	public async deleteMod(filename: string) {
		const id = this.selectedGame;
		const selectedGameInfo = this.games.get(id);
		if (!selectedGameInfo) {
			throw new Error('Game must be opened before deleting a mod');
		}

		if (selectedGameInfo.type === 'handle') {
			if (await selectedGameInfo.handle.queryPermission({mode: 'read'}) !== 'granted') {
				if (await selectedGameInfo.handle.requestPermission({mode: 'readwrite'}) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}

			const mods = await selectedGameInfo.handle.getDirectoryHandle('mods');
			if (await mods.queryPermission({mode: 'readwrite'}) !== 'granted') {
				if (await mods.requestPermission({mode: 'readwrite'}) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}

			await mods.removeEntry(filename);
		} else if (selectedGameInfo.type === 'fs') {
			const fs: typeof import('fs') = globalThis['require']('fs');
			const path: typeof import('path') = globalThis['require']('path');

			await fs.promises.unlink(path.join(selectedGameInfo.path, 'mods', filename));
		}
		return this.getModsInternal(id);
	}

	public async installMod(name: string, content: ReadableStream<Uint8Array>) {
		const id = this.selectedGame;
		const selectedGameInfo = this.games.get(id);
		if (!selectedGameInfo) {
			throw new Error('Game must be opened before installing a mod');
		}

		if (selectedGameInfo.type === 'handle') {
			if (await selectedGameInfo.handle.queryPermission({mode: 'read'}) !== 'granted') {
				if (await selectedGameInfo.handle.requestPermission({mode: 'readwrite'}) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}

			const mods = await selectedGameInfo.handle.getDirectoryHandle('mods');
			if (await mods.queryPermission({mode: 'readwrite'}) !== 'granted') {
				if (await mods.requestPermission({mode: 'readwrite'}) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}
			
			const handle = await mods.getFileHandle(name, { create: true });
			const writable = await handle.createWritable({ keepExistingData: false });
			await content.pipeTo(writable);
		} else if (selectedGameInfo.type === 'fs') {
			const fs: typeof import('fs') = globalThis['require']('fs');
			const path: typeof import('path') = globalThis['require']('path');

			const writable = fs.createWriteStream(path.join(selectedGameInfo.path, 'mods', name));
			const reader = content.getReader();
			for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
				writable.write(chunk.value);
			}
			writable.end();
			await new Promise<void>((resolve, reject) => {
				writable.on('finish', () => resolve());
				writable.on('error', () => reject());
			});
		}
		return this.getModsInternal(id);
	}
}