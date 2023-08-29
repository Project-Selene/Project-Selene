import { Mod, ModPatch, Mods } from '../state';
import { Filesystem } from './filesystem';
import { Game } from './game';
import { ModInfo as ModHandler } from './mod-handler';
import { transform } from './transformer';
import { prepareWindow } from './window';

export class Loader {
	private prefix = '';
	private devModIteration = 0;
	
	constructor(
		private readonly filesystem: Filesystem,
		private readonly game: Game,
	) {
		this.filesystem.readFile('/static/js/prefix.js').then(prefix => this.prefix = prefix);
	}

	public async play() {
		const id = this.game.getSelectedGame();
		await this.game.mountGame();

		const code = await this.filesystem.readFile('/fs/internal/game/' + id +  '/terra/dist/bundle.js');
		const injected = transform(code, this.prefix);
		
		await this.filesystem.mountLink('/fs/game/', '/fs/internal/game/' + id +  '/');
		await this.filesystem.mountInMemory('/fs/saves/', 'save-data');
			
		await this.filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
		await this.filesystem.writeFile('/fs/game/terra/dist/bundle.js', injected);

		await this.filesystem.mountHttp('/fs/internal/dev-mod/', 'http://localhost:8182/');
		
		const mods = await this.game.getMods();
		for (const mod of mods.mods) {
			await this.filesystem.mountLink('/fs/mods/' + mod.internalName + '/', '/fs/internal/mods/' + mod.internalName + '/');
		}
		
		const entryPointResponse = await fetch('/fs/game/terra/index-release.html');
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
	

	async hookGameStart(mods: Mods, ...args: unknown[]) {
		console.log('ready', ...args);
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
		await this.loadDevMod();
	}
	
	async loadMod(mod: Mod) {
		try {
			this.registerPatches(`/fs/mods/${mod.internalName}/`, mod.currentInfo.patches, true);
			const src = `/fs/mods/${mod.internalName}/main.js`;
			const imported = await import(src);
			imported.default(new ModHandler(mod));
		} catch(e) {
			console.error('could not load mod', e);
			return;
		}
		return;
	}

	async loadDevMod() {
		try {
			await fetch('http://localhost:8182/manifest.json'); //Check if mod exists

			const devModPath = '/fs/dev-mod/' + (this.devModIteration++) + '/';

			await this.filesystem.mountLink(devModPath, '/fs/internal/dev-mod/');

			const manifestText = await this.filesystem.readFile(devModPath + 'manifest.json');
			const manifest = JSON.parse(manifestText);
			const mod: Mod = {
				currentInfo: manifest,
				enabled: true,
				internalName: 'dev',
			};
			const handler = new ModHandler(mod);

			const src = devModPath + 'main.js';

			__projectSelene.devMod ??= {
				async hotreload() {return;},
				registerPatches: (patches) => {
					return this.registerPatches(devModPath, patches, true);
				},
				unregisterPatches: (patches) => {
					return this.registerPatches(devModPath, patches, false);
				},
				
			};
			__projectSelene.devMod.hotreload = async () => {
				console.log('Reloading development mod');

				const imported = await import(src);
				imported.unload?.();
				handler.uninject();
				await this.registerPatches(devModPath, mod.currentInfo.patches, false);

				this.loadDevMod();
			};

			this.registerPatches(devModPath, mod.currentInfo.patches, true);
			const imported = await import(src);
			imported.default(handler);
			__projectSelene.devMod.afterMain?.(handler);
		} catch (e) {
			console.log('No dev mod found', e);
		}
	}

	private async registerPatches(base: string, patches: ModPatch[], register: boolean) {
		const rawPatches = patches
			.filter(p => p.type === 'raw')
			.map(p => ({ target: '/fs/game/' + p.target, source: base + 'assets/' + p.target.substring('terra/'.length)}));
		const jsonPatches = patches
			.filter(p => p.type === 'json')
			.map(p => ({ target: '/fs/game/' + p.target, source: base + 'assets/' + p.target.substring('terra/'.length) + '-patch'}));

		if (register) {
			await Filesystem.worker.registerRawPatches(rawPatches);
			await Filesystem.worker.registerJSONPatches(jsonPatches);
		} else {
			await Filesystem.worker.unregisterRawPatches(rawPatches);
			await Filesystem.worker.unregisterJSONPatches(jsonPatches);
		}
	}
}
