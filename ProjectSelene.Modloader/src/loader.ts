import { castImmutable, current, Draft, Immutable } from 'immer';
import { filesystem } from './filesystem';
import { loadGamesFromStore, loadModsFromStore, openGameFolder } from './finder';
import { inject } from './inject';
import { Mod, State } from './state';
import { transform } from './transformer';
import { prepareWindow } from './window';

export function playGame(state: Draft<State>) {
	console.log('play');
	prepareWindow((...args) => hookGameStart(state, ...args));
	startGame(castImmutable(current(state)));
}

async function startGame(state: Immutable<State>) {
	// if (!state.games?.data) {
	// 	return;
	// }
	// if (!state.mods?.data) {
	// 	return;
	// }

	let games = await loadGamesFromStore();
	if (!games || !games.games || games.games.length === 0) {
		games = await openGameFolder(games);
	}

	const mods = await loadModsFromStore(games);
	const game = games.games[games.selectedGame];
	
	// const game = state.games.data.games[state.games.data.selectedGame];
	
	console.log('starting game with state', state);

	const code = await filesystem.readFile('/fs/internal/game/' + game.internalName +  '/terra/dist/bundle.js');
	const prefix = await filesystem.readFile('/static/js/prefix.js');
	const injected = transform(code, prefix);

	await filesystem.mountLink('/fs/game/', '/fs/internal/game/' + game.internalName +  '/');
	await filesystem.mountInMemory('/fs/saves/', 'save-data');
	
	await filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
	await filesystem.writeFile('/fs/game/terra/dist/bundle.js', injected);

	for (const mod of mods.mods) {
		await filesystem.mountLink('/fs/mods/' + mod.internalName + '/', '/fs/internal/mods/' + mod.internalName + '/');
	}

	// await filesystem.mountZip('/fs/mods/jetpack/', '/fs/game/dev-mods/jetpack/dist/main.zip');

	const entryPointResponse = await fetch('/fs/game/terra/index-release.html');
	const parser = new DOMParser();
	const doc = parser.parseFromString(await entryPointResponse.text(), 'text/html');
	const base = doc.createElement('base');
	base.href = '/fs/game/terra/';
	doc.head.prepend(base);
	
	document.open();
	document.write(doc.documentElement.innerHTML);
	document.close();
}

async function hookGameStart(state: Immutable<State>, ...args: unknown[]) {
	console.log('ready', ...args);
	await loadMods(state);
	return __projectSelene.functions['startGame'](...args);
}

async function loadMods(state: Immutable<State>) {
	// if (state.mods.loading !== false || state.mods.success !== true) {
	// 	return; //We don't know about any mods
	// }
	// for (const mod of state.mods.data.mods) {
	// 	if (mod.enabled) {
	// 		await loadMod(mod);
	// 	}
	// }
	console.log(state);
	
	const games = await loadGamesFromStore();
	const mods = await loadModsFromStore(games);
	for (const mod of mods.mods) {
		if (mod.enabled) {
			await loadMod(mod);
		}
	}
}

async function loadMod(mod: Mod) {
	try {
		const src = `/fs/mods/${mod.internalName}/main.js`;
		const imported = await import(src);
		imported.default({
			inject,
		});
	} catch(e) {
		console.error('could not load mod', e);
		return;
	}
	return;
}