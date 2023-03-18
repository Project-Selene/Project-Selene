import * as idb from 'idb-keyval';
import { castImmutable, current, Draft, Immutable } from 'immer';
import { filesystem } from './filesystem';
import { doAsync } from './hooks/state';
import { Game, Games, LoadingState, State } from './state';
import { transform } from './transformer';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

export async function loadGames(state: Draft<State>) {
	state.games = { loading: true };
	doAsync(async (state, games) => {
		state.games = {
			loading: false,
			success: true,
			data: {
				games: games,
				selectedGame: 0,
			},
		} as LoadingState<Games>;
	}, async () => {
		const games: Game[] = [];	
		for (const key of await idb.get('keys', gameStore) ?? []) {
			games.push({
				name: key + '',
				store: {
					type: 'handle',
					handle: await idb.get(key + '_handle', gameStore) ?? (() => { throw new Error('Failed to load game folder from storage'); })(),
				},
			});
		}
		return games;
	});
}

export function openGame() {
	doAsync(async (state, handle)  => {
		if ('data' in state.games) {
			state.selectedGame = state.games.data.games.push({
				name: 'Game',
				store: {
					type: 'handle',
					handle,
				},
			}) - 1;
		}

		const keys = await idb.get('keys', gameStore) as string[] ?? [];
		const key = Math.random();
		keys.push(key + '');
		await idb.set('keys', keys, gameStore);
		await idb.set(key + '_handle', handle, gameStore);
	}, () => window.showDirectoryPicker({
		id: 'game',
		mode: 'read',
	}));
}
export function playGame(state: Draft<State>) {
	console.log('play');
	prepareWindow();
	startGame(castImmutable(current(state)));
}

function prepareWindow() {
	Object.assign(window, {
		__projectSelene:  {
			classes: {},
			functions: {},
			consts: {},
			lets: {},
			gameReadyCallback: hookGameStart,
			symbol: Symbol('ProjectSelene'),
		},
		require(name: string) {
			if (name === 'fs') {
				return new Proxy({}, {
					get(target, prop) {
						console.log('fs', prop);
						return ({
							promises: new Proxy({}, {
								get(target, prop) {
									console.log('fs.promises', prop);
									return ({
										async readFile(name: string) {
											name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
											if (!name.startsWith('/fs/saves/')) {
												console.log('readFile', name);
											}
											return await (await fetch(name, {
												method: 'GET',
											})).text();
										},
										async stat(name: string) {
											name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
											console.log('stat', name);
											return {ctimeMs: 1673544664915.2834};
										},
										async writeFile(name: string, content: string) {
											console.log('writefile', name, content);
											name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
											const result = await (await fetch(name, {
												method: 'POST',
												headers: {
													'X-SW-Command': 'writeFile',
												},
												body: content,
											})).json();
											if (!result.success) {
												throw new Error('Failed to write file: ' + name);
											}
										},
										rename(from: string, to: string) {
											name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
											console.log('rename', from, to);

										},
									} as any)[prop];
								},
							}),
							existsSync() {
								// name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
								// console.info('existsSync', name);
								return false;
							},
							mkdirSync() {
								// name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
								// console.info('mkdirSync', name);
								// return;
							},
							async readdir(name: string, options: string, callback: (a: any, b: any) => void) {
								name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
								const path = '/fs/game/' + name.replace(/\\/g, '/').replace('data/local/terra/', '');
								console.log('readdir', path, options);
	
	
								const result =  await (await fetch(path, {
									method: 'GET',
									headers: {
										'X-SW-Command': 'readDir',
									},
								})).json();
								const mapped = result.map((e: any) => ({name: e.name, isDirectory(){return e.isDir;}, isFile(){return !e.isDir;}}));
								callback(undefined,mapped);
							},
						} as any)[prop];
					},
				});
			}
		},
		nw: {
			App: {
				argv: [],
				dataPath: '/fs/saves/',
			},
			Screen: {
				screens: [{
					bounds: {
						height: 720 * 2,
						width: 1280 * 2,
					},
				}],
			},
		},
		process: {
			versions: {
				'node-webkit': window.process?.versions?.['node-webkit'] ?? 'browser',
			},
		},
	});
}

async function startGame(state: Immutable<State>) {
	if (!('data' in state.games)) {
		return;
	}
	
	const game = state.games.data.games[state.selectedGame];
	if (game.store.type !== 'handle') {
		return;
	}
	
	await game.store.handle.requestPermission({ mode: 'read' });
	await filesystem.mountDirectoryHandle('/fs/internal/game/original/', game.store.handle);
	const code = await filesystem.readFile('/fs/internal/game/original/terra/dist/bundle.js');
	const prefix = await filesystem.readFile('/static/js/prefix.js');
	const injected = transform(code, prefix);
	
	await filesystem.mountInMemory('/fs/game/terra/dist/', 'injected-game');
	await filesystem.writeFile('/fs/game/terra/dist/bundle.js', injected);

	await filesystem.mountDirectoryHandle('/fs/game/', game.store.handle);
	await filesystem.mountInMemory('/fs/saves/', 'save-data');

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

async function hookGameStart(...args: unknown[]) {
	console.log('ready', ...args);
	await loadMods();
	return __projectSelene.functions['startGame'](...args);
}

async function loadMods() {
	//TODO: load logic
	try {
		const src = '/fs/game/dev-mods/jetpack/dist/main.js';
		const mod = await import(src);
		mod.default({
			inject(clazz: { new(...args: unknown[]): unknown}) {
				//Basically just does a linked list insert
				//Example: 
				// From: mod -> injectable -> hook -> original
				// To: hook -> mod -> original
				//
				//With second mod
				// From: modB -> injectable -> hook -> mod -> original
				// To: hook -> modB -> mod -> original

				let ctor = clazz;
				let proto = clazz.prototype;
				while (Object.getPrototypeOf(ctor)[__projectSelene.symbol] !== 'injected') {
					ctor = Object.getPrototypeOf(ctor);
					if (ctor === Function) {
						throw new Error('Can only hook classes that have an Injectable(...) super class');
					}
					proto = Object.getPrototypeOf(proto);
				}

				const injectableCtor = Object.getPrototypeOf(ctor);
				const injectableProto = Object.getPrototypeOf(proto);

				const hookCtor = Object.getPrototypeOf(injectableCtor);
				const hookProto = Object.getPrototypeOf(injectableProto);

				const currentCtor = Object.getPrototypeOf(hookCtor);
				const currentProto = Object.getPrototypeOf(hookProto);

				Object.setPrototypeOf(ctor, currentCtor);
				Object.setPrototypeOf(proto, currentProto);

				Object.setPrototypeOf(hookCtor, ctor);
				Object.setPrototypeOf(hookProto, proto);
			},
		});
	} catch(e) {
		console.error('could not load mod', e);
		return;
	}
	return;
}

