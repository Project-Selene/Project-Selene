import { Mod, ModPatch } from '../state/models/mod';
import { GameInfo, Mods } from '../state/state.models';
import { stopPollForDevMod } from './dev-poll';
import { Filesystem } from './filesystem';
import { Game } from './game';
import { ModInfo as ModHandler } from './mod-handler';
import { transform } from './transformer';
import { prepareWindow } from './window';

export class Loader {
	private devModIteration = 0;
	private hasDevMod = false;

	constructor(
		private readonly filesystem: Filesystem,
		private readonly game: Game,
	) {}

	public async play(game: GameInfo, hasDevMod: boolean) {
		this.hasDevMod = hasDevMod;

		const id = game.id;
		if (!(await this.game.mountGame(game))) {
			throw new Error('Could not mount game');
		}
		const injected = await this.transformCached(id);

		await this.filesystem.mountLink('/fs/game/', '/fs/internal/game/' + id + '/');
		await this.filesystem.mountInMemory('/fs/saves/', 'save-data');

		await this.filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
		await this.filesystem.mountLink('/fs/game/terra/dist/bundle.js', injected);

		await this.filesystem.mountHttp('/fs/internal/dev-mod/', 'http://localhost:8182/');

		const mods = await this.game.getMods(game);
		for (const mod of mods.mods) {
			await this.filesystem.mountLink(
				'/fs/mods/' + mod.internalName + '/',
				'/fs/internal/mods/' + game.id + '/' + mod.internalName + '/',
			);
		}

		const entryPointResponse = await fetch('/fs/game/terra/index.html');
		const parser = new DOMParser();
		const doc = parser.parseFromString(await entryPointResponse.text(), 'text/html');
		const base = doc.createElement('base');
		base.href = '/fs/game/terra/';
		doc.head.prepend(base);

		prepareWindow((...args: unknown[]) => this.hookGameStart(mods, ...args));

		document.open();
		document.write(doc.documentElement.innerHTML);
		document.close();
	}

	public injectDevMod() {
		if (!this.hasDevMod) {
			stopPollForDevMod();
			this.hasDevMod = true;
			this.loadDevMod();
		}
	}

	private async transformCached(id: number) {
		const hash = await crypto.subtle.digest(
			'SHA-256',
			await (await fetch('/fs/internal/game/' + id + '/terra/dist/bundle.js')).arrayBuffer(),
		);
		const hashString = Array.from(new Uint8Array(hash))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');

		await this.filesystem.mountInMemory('/cache', 'cache');
		const files = await this.filesystem.readDir('/cache/');
		const existing = files.find(f => f.name === 'game-' + hashString + '.js');
		if (existing) {
			return '/cache/' + existing.name;
		}

		//Limit cache size
		if (files.length > 3) {
			const dates = await Promise.all(files.map(async f => (await this.filesystem.stat('/cache/' + f.name)).ctimeMs));
			const oldest = files[dates.indexOf(Math.min(...dates))];
			await this.filesystem.delete('/cache/' + oldest.name);
		}

		const code = await this.filesystem.readFile('/fs/internal/game/' + id + '/terra/dist/bundle.js');
		const prefix = await this.filesystem.readFile('static/js/prefix.js');
		const result = transform(code, prefix);
		await this.filesystem.writeFile('/cache/game-' + hashString + '.js', result);
		return '/cache/game-' + hashString + '.js';
	}

	async hookGameStart(mods: Mods, ...args: unknown[]) {
		console.log('ready', ...args);
		//Stub out analytics
		Object.getPrototypeOf(__projectSelene.classes.Analytics).prototype.isTrackingAllowed = () => false;
		await this.loadMods(mods);
		return __projectSelene.functions['startGame'](...args);
	}

	async loadMods(mods: Mods) {
		for (const mod of mods.mods) {
			if (mod.enabled) {
				console.log('loading mod', mod);
				await this.loadMod(mod);
			}
		}

		if (this.hasDevMod) {
			stopPollForDevMod();
			await this.loadDevMod();
		}
	}

	async loadMod(mod: Mod) {
		try {
			this.registerPatches(`/fs/mods/${mod.internalName}/`, mod.currentInfo.patches ?? [], true);
			const src = `/fs/mods/${mod.internalName}/main.js`;
			const imported = await import(/*webpackIgnore: true*/ src);
			imported.default(new ModHandler(mod));
		} catch (e) {
			console.error('could not load mod', e);
			return;
		}
		return;
	}

	async loadDevMod() {
		try {
			let found = false;
			while (!found) {
				try {
					await fetch('http://localhost:8182/health'); //Check if mod exists
					found = true;
				} catch {
					await new Promise(resolve => setTimeout(resolve, 5000));
				}
			}

			const devModPath = '/fs/dev-mod/' + this.devModIteration++ + '/';

			await this.filesystem.mountLink(devModPath, '/fs/internal/dev-mod/');

			const manifestText = await this.filesystem.readFile(devModPath + 'manifest.json');
			const manifest = JSON.parse(manifestText);
			const mod: Mod = {
				currentInfo: manifest,
				enabled: true,
				internalName: 'dev',
				filename: '',
			};
			const handler = new ModHandler(mod);

			const src = devModPath + 'main.js';

			__projectSelene.devMod ??= {
				async hotreload() {
					return;
				},
				registerPatches: patches => {
					return this.registerPatches(devModPath, patches, true);
				},
				unregisterPatches: patches => {
					return this.registerPatches(devModPath, patches, false);
				},
			};
			__projectSelene.devMod.hotreload = async () => {
				console.log('Reloading development mod');

				const imported = await import(/*webpackIgnore: true*/ src);
				try {
					imported.unload?.();
				} catch (e) {
					console.error(e);
				}
				handler.uninject();
				await this.registerPatches(devModPath, mod.currentInfo.patches ?? [], false);

				this.loadDevMod();
			};

			this.registerPatches(devModPath, mod.currentInfo.patches ?? [], true);
			const imported = await import(/*webpackIgnore: true*/ src);
			imported.default(handler);
			__projectSelene.devMod.afterMain?.(handler);
		} catch (e) {
			console.log('No dev mod found', e);
		}
	}

	private async registerPatches(base: string, patches: ModPatch[], register: boolean) {
		const rawPatches = patches
			.filter(p => p.type === 'raw')
			.map(p => ({
				target: '/fs/game/' + p.target,
				source: base + 'assets/' + p.target.substring('terra/'.length),
			}));
		const jsonPatches = patches
			.filter(p => p.type === 'json')
			.map(p => ({
				target: '/fs/game/' + p.target,
				source: base + 'assets/' + p.target.substring('terra/'.length) + '-patch',
			}));

		if (register) {
			await Filesystem.worker.registerRawPatches(rawPatches);
			await Filesystem.worker.registerJSONPatches(jsonPatches);
		} else {
			await Filesystem.worker.unregisterRawPatches(rawPatches);
			await Filesystem.worker.unregisterJSONPatches(jsonPatches);
		}
	}
}
