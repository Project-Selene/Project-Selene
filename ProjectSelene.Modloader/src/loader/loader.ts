import { Mod, State } from '../state';
import { Filesystem } from './filesystem';
import { Finder } from './finder';
import { ModInfo as ModHandler } from './mod-handler';
import { transform } from './transformer';
import { prepareWindow } from './window';

export class Loader {
	public readonly finder = new Finder();
	private readonly filesystem = new Filesystem();
	private prefix = '';
	
	constructor() {
		this.filesystem.readFile('/static/js/prefix.js').then(prefix => this.prefix = prefix);
	}

	public async play(state: State) {
		if (!state.gamesInfo.success) {
			const gamesInfo = await this.finder.loadGames();
			state.gamesInfo = {data: gamesInfo, success: true, loading: false};
			state.games = gamesInfo.games.map(() => ({}));
		}

		if (!state.games[state.gamesInfo.data.selectedGame]) {
			const [game, gamesInfo, mods] = await this.finder.openGame(state);
			state.games = [...state.games, {data: game, success: true, loading: false}];
			state.gamesInfo = {data: gamesInfo, success: true, loading: false};
			state.mods = mods ? {data: mods, success: true, loading: false} : state.mods;
		}

		const selectedGameInfo = state.gamesInfo.data.games[state.gamesInfo.data.selectedGame];

		if (!state.games[state.gamesInfo.data.selectedGame].success) {
			const game = await this.finder.loadGame(state, selectedGameInfo.id);
			state.games[state.gamesInfo.data.selectedGame] = { data: game, loading: false, success: true };
		}

		if (!state.games[state.gamesInfo.data.selectedGame].success) {
			throw new Error('Selected game isn\'t loaded');
		}

		if (!state.mods.success) {
			state.mods = {data: await this.finder.loadMods(state, selectedGameInfo.id), loading: false, success: true};
		}

		const code = await this.filesystem.readFile('/fs/internal/game/' + selectedGameInfo.id +  '/terra/dist/bundle.js');
		const injected = transform(code, this.prefix);
		
		await this.filesystem.mountLink('/fs/game/', '/fs/internal/game/' + selectedGameInfo.id +  '/');
		await this.filesystem.mountInMemory('/fs/saves/', 'save-data');
			
		await this.filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
		await this.filesystem.writeFile('/fs/game/terra/dist/bundle.js', injected);
		
		for (const mod of state.mods.data.mods) {
			await this.filesystem.mountLink('/fs/mods/' + mod.internalName + '/', '/fs/internal/mods/' + mod.internalName + '/');
		}
		
		const entryPointResponse = await fetch('/fs/game/terra/index-release.html');
		const parser = new DOMParser();
		const doc = parser.parseFromString(await entryPointResponse.text(), 'text/html');
		const base = doc.createElement('base');
		base.href = '/fs/game/terra/';
		doc.head.prepend(base);

		prepareWindow((...args: unknown[]) => this.hookGameStart(state, ...args));
			
		document.open();
		document.write(doc.documentElement.innerHTML);
		document.close();
	}
	

	async hookGameStart(state: State, ...args: unknown[]) {
		console.log('ready', ...args);
		await this.loadMods(state);
		return __projectSelene.functions['startGame'](...args);
	}

	async loadMods(state: State) {
		if (state.mods.data?.mods) {
			for (const mod of state.mods.data.mods) {
				if (mod.enabled) {
					console.log('loading mod', mod);
					await this.loadMod(mod);
				}
			}
		}
	}


	async loadMod(mod: Mod) {
		try {
			const src = `/fs/mods/${mod.internalName}/main.js`;
			const imported = await import(src);
			imported.default(new ModHandler(mod));
		} catch(e) {
			console.error('could not load mod', e);
			return;
		}
		return;
	}
}
