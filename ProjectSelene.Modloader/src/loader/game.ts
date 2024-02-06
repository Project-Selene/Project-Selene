import * as idb from 'idb-keyval';
import { Mod } from '../ui/state/models/mod';
import { GameInfo, GamesInfo, Mods } from '../ui/state/state.models';
import { Filesystem } from './filesystem';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

interface StoredGamesInfo {
	handles: Record<number, FileSystemDirectoryHandle>;
}

export class Game {
	private info?: StoredGamesInfo;

	private readonly mountedGames = new Set<number>();
	private readonly mountedMods = new Map<number, Set<string>>();

	constructor(
		private readonly filesystem: Filesystem,
	) { }

	public async loadGames(games: GamesInfo): Promise<GamesInfo> {
		const gameHandles: StoredGamesInfo = await idb.get('index', gameStore) ?? { handles: {} };
		this.info = gameHandles;

		games = JSON.parse(JSON.stringify(games));

		for (const game of games.games) {
			if (game.type === 'handle') {
				if (!gameHandles.handles[game.id]) {
					game.loaded = false;
				} else {
					game.loaded = await gameHandles.handles[game.id].queryPermission({ mode: 'read' }) === 'granted';
				}
			} else if (game.type === 'fs') {
				game.loaded = 'require' in globalThis;
			}
		}

		if ('require' in globalThis) {
			const path: typeof import('path') = globalThis['require']('path');
			const gamePath = path.dirname(process.execPath);
			const localGame = games.games.find(g => g.type === 'fs' && g.path === gamePath);
			if (!localGame) {
				games.games.push({
					id: games.games.map(g => g.id).reduce((a, b) => Math.max(a, b), 0) + 1,
					type: 'fs',
					path: gamePath,
					loaded: true,
				});
			}
		}

		const selectedGame = games.games.find(g => g.id === games.selectedGame);
		if (!selectedGame) {
			games.selectedGame = games.games.find(g => g.loaded)?.id ?? -1;
		}

		return games;
	}

	public async mountGame(game: GameInfo, mode: FileSystemPermissionMode = 'read'): Promise<boolean> {
		if (game.type === 'handle') {
			if (!this.info) {
				this.info = await idb.get('index', gameStore) ?? { handles: {} };
			}

			let handle = this.info.handles[game.id];
			if (!handle) {
				await this.openGame(game.id, mode);
				handle = this.info.handles[game.id];
				if (!handle) {
					return false;
				}
			}

			if (await handle.queryPermission({ mode }) !== 'granted') {
				if (await handle.requestPermission({ mode }) !== 'granted') {
					return false;
				}
			}

			if (this.mountedGames.has(game.id)) {
				return true;
			}
			this.mountedGames.add(game.id);

			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + game.id + '/', handle);
			return true;
		} else if (game.type === 'fs') {
			if (this.mountedGames.has(game.id)) {
				return true;
			}
			this.mountedGames.add(game.id);

			await this.filesystem.mountDirectoryFS('/fs/internal/game/' + game.id + '/', game.path);

			return true;
		}

		return false;
	}

	public async openGame(id: number, mode: FileSystemPermissionMode = 'read'): Promise<GameInfo> {
		if (globalThis['require']) {
			throw new Error('Not implemented yet');
		} else {
			if (!this.info) {
				this.info = await idb.get('index', gameStore) ?? { handles: {} };
			}

			const handle = await globalThis.showDirectoryPicker({ id: 'game', mode });
			this.info.handles[id] = handle;
			await idb.set('index', this.info, gameStore);

			if (await handle.queryPermission({ mode }) !== 'granted') {
				await handle.requestPermission({ mode });
			}

			await this.filesystem.mountDirectoryHandle('/fs/internal/game/' + id + '/', handle);
			this.mountedGames.add(id);

			return {
				id,
				type: 'handle',
				loaded: true,
			};
		}
	}

	public async tryGetMods(game: GameInfo): Promise<Mods | undefined> {
		if (!this.info) {
			this.info = await idb.get('index', gameStore) ?? { handles: {} };
		}

		const handle = this.info.handles[game.id];
		if (game.type === 'handle' && await handle?.queryPermission({ mode: 'read' }) !== 'granted') {
			return undefined;
		}

		if (!await this.mountGame(game)) {
			return undefined;
		}

		return this.getModsInternal(game.id);
	}

	public async getMods(game: GameInfo): Promise<Mods> {
		await this.mountGame(game);
		return this.getModsInternal(game.id);
	}

	private async getModsInternal(gameId: number): Promise<Mods> {
		let modId = 0;
		const mods: Mod[] = [];
		const mountedMods = this.mountedMods.get(gameId) ?? new Set<string>();
		this.mountedMods.set(gameId, mountedMods);
		try {
			const zipMods = await this.filesystem.readDir('/fs/internal/game/' + gameId + '/mods/');
			for (const mod of zipMods) {
				if (!mod.isDir && mod.name.endsWith('.mod.zip')) {
					const internalName = modId;
					modId++;

					if (!mountedMods.has('/fs/internal/mods/' + gameId + '/' + internalName + '/')) {
						await this.filesystem.mountZip('/fs/internal/mods/' + gameId + '/' + internalName + '/', '/fs/internal/game/' + gameId + '/mods/' + mod.name);
						mountedMods.add('/fs/internal/mods/' + gameId + '/' + internalName + '/');
					}

					try {
						const manifestText = await this.filesystem.readFile('/fs/internal/mods/' + gameId + '/' + internalName + '/manifest.json');
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

	public async deleteMod(game: GameInfo, filename: string) {
		if (!await this.mountGame(game, 'readwrite')) {
			throw new Error('Game must be opened before deleting a mod');
		}

		if (game.type === 'handle') {
			const handle = this.info?.handles[game.id];
			if (!handle) {
				throw new Error('Game must be opened before deleting a mod');
			}

			if (await handle.queryPermission({ mode: 'read' }) !== 'granted') {
				if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}

			const mods = await handle.getDirectoryHandle('mods');
			if (await mods.queryPermission({ mode: 'readwrite' }) !== 'granted') {
				if (await mods.requestPermission({ mode: 'readwrite' }) !== 'granted') {
					throw new Error('Could not delete mod due to missing permissions');
				}
			}

			await mods.removeEntry(filename);
		} else if (game.type === 'fs') {
			const fs: typeof import('fs') = globalThis['require']('fs');
			const path: typeof import('path') = globalThis['require']('path');

			await fs.promises.unlink(path.join(game.path, 'mods', filename));
		}
		return this.getModsInternal(game.id);
	}

	public async installMod(game: GameInfo, name: string, content: ReadableStream<Uint8Array>) {
		if (!await this.mountGame(game, 'readwrite')) {
			throw new Error('Game must be opened before installing a mod');
		}
		if (game.type === 'handle') {
			const gameHandle = this.info?.handles[game.id];
			if (!gameHandle) {
				throw new Error('Game must be opened before deleting a mod');
			}


			if (await gameHandle.queryPermission({ mode: 'read' }) !== 'granted') {
				if (await gameHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
					throw new Error('Could not install mod due to missing permissions');
				}
			}

			const entries = gameHandle.keys();
			let found = false;
			for await (const entry of entries) {
				if (entry === 'mods') {
					found = true;
					break;
				}
			}
			if (!found) {
				if (await gameHandle.queryPermission({ mode: 'readwrite' }) !== 'granted') {
					if (await gameHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
						throw new Error('Could not install mod due to missing permissions');
					}
				}
				await gameHandle.getDirectoryHandle('mods', { create: true });
			}

			const mods = await gameHandle.getDirectoryHandle('mods');
			if (await mods.queryPermission({ mode: 'readwrite' }) !== 'granted') {
				if (await mods.requestPermission({ mode: 'readwrite' }) !== 'granted') {
					throw new Error('Could not install mod due to missing permissions');
				}
			}

			const handle = await mods.getFileHandle(name, { create: true });
			const writable = await handle.createWritable({ keepExistingData: false });
			await content.pipeTo(writable);
		} else if (game.type === 'fs') {
			const fs: typeof import('fs') = globalThis['require']('fs');
			const path: typeof import('path') = globalThis['require']('path');

			await fs.promises.mkdir(path.join(game.path, 'mods'), { recursive: true });
			const writable = fs.createWriteStream(path.join(game.path, 'mods', name));
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
		return this.getModsInternal(game.id);
	}
}