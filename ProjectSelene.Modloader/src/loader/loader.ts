import { ModHandler } from '../runtime/mod-handler';
import { stopPollForDevMod } from './dev-poll';
import { filesystem } from './filesystem';
import { Game } from './game';
import { ModManifest, ModPatch, Mods } from './mods';
import { transform } from './transformer';
import { prepareWindow } from './window';

class Loader {
	private devModIteration = 0;
	private hasDevMod = false;

	public async play(game: Game, loadDevMod: boolean, ...modCollections: Mods[]) {
		this.hasDevMod = loadDevMod;

		const id = game.getGameId();
		const injected = await this.transformCached(id);

		await filesystem.mountLink('/fs/game/', '/fs/internal/game/' + id + '/');
		await filesystem.mountInMemory('/fs/saves/', 'save-data');

		await filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
		await filesystem.mountLink('/fs/game/terra/dist/bundle.js', injected);

		if (this.hasDevMod) {
			await filesystem.mountHttp('/fs/internal/dev-mod/', 'http://localhost:8182/');
		}

		const mods: ModManifest[] = [];
		for (const collection of modCollections) {
			const modsId = collection.getCollectionId();
			for (const [id, manifest] of Object.entries(await collection.readManifests())) {
				await filesystem.mountLink(
					'/fs/mods/' + manifest.id + '/',
					'/fs/internal/mods/' + modsId + '/mods/' + id + '/',
				);
				mods.push(manifest);
			}
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

		await filesystem.mountInMemory('/cache', 'cache');
		const files = await filesystem.readDir('/cache/');
		const existing = files.find(f => f.name === 'game-' + hashString + '.js');
		if (existing) {
			return '/cache/' + existing.name;
		}

		//Limit cache size
		if (files.length > 3) {
			const dates = await Promise.all(files.map(async f => (await filesystem.stat('/cache/' + f.name)).ctimeMs));
			const oldest = files[dates.indexOf(Math.min(...dates))];
			await filesystem.delete('/cache/' + oldest.name);
		}

		const code = await filesystem.readFile('/fs/internal/game/' + id + '/terra/dist/bundle.js');
		const prefix = await filesystem.readFile('static/js/prefix.js');
		const result = transform(code, prefix);
		await filesystem.writeFile('/cache/game-' + hashString + '.js', result);
		return '/cache/game-' + hashString + '.js';
	}

	async hookGameStart(mods: ModManifest[], ...args: unknown[]) {
		this.hookAnalytics();
		await this.loadMods(mods);
		return __projectSelene.functions['startGame'](...args);
	}

	private async hookAnalytics() {
		const apiRoot = __projectSelene.consts.API_ROOT as string;
		const prototype = __projectSelene.classes.AjaxUtils as Record<string, (...args: unknown[]) => unknown>;

		const originalPost = prototype.post;
		prototype.post = function (...args: unknown[]) {
			if (args.length >= 2
				&& typeof args[0] === 'string'
				&& args[0].startsWith(apiRoot)
				&& typeof args[1] === 'object'
			) {
				(args[1] as Record<string, unknown>)['modDisabled'] = true
			}

			return originalPost.apply(this, args);
		}

		const originalGetJson = prototype.getJson;
		prototype.getJson = function (...args: unknown[]) {
			if (args.length >= 1
				&& typeof args[0] === 'string'
				&& args[0].startsWith(apiRoot)
			) {
				args[0] += '&modDisabled=true'
			}

			return originalGetJson.apply(this, args);
		}
	}

	async loadMods(mods: ModManifest[]) {
		for (const mod of mods) {
			console.log('loading mod', mod);
			await this.loadMod(mod);
		}

		if (this.hasDevMod) {
			stopPollForDevMod();
			await this.loadDevMod();
		}
	}

	async loadMod(mod: ModManifest) {
		try {
			this.registerPatches(`/fs/mods/${mod.id}/`, mod.patches ?? [], true);
			const src = `/fs/mods/${mod.id}/main.js`;
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

			await filesystem.mountLink(devModPath, '/fs/internal/dev-mod/');

			const manifestText = await filesystem.readFile(devModPath + 'manifest.json');
			const manifest = JSON.parse(manifestText) as ModManifest;
			const handler = new ModHandler(manifest);

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
				await this.registerPatches(devModPath, manifest.patches ?? [], false);

				this.loadDevMod();
			};

			this.registerPatches(devModPath, manifest.patches ?? [], true);
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
			await filesystem.registerRawPatches(rawPatches);
			await filesystem.registerJSONPatches(jsonPatches);
		} else {
			await filesystem.unregisterRawPatches(rawPatches);
			await filesystem.unregisterJSONPatches(jsonPatches);
		}
	}
}

export const loader = new Loader();