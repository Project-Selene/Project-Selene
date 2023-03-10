import * as idb from 'idb-keyval';
import { castImmutable, current, Draft, Immutable } from 'immer';
import { filesystem } from './filesystem';
import { doAsync } from './hooks/state';
import { Games, LoadingState, State, Game } from './state';

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
		const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');
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

export async function openGame(state: Draft<State>) {
	state.games = { loading: true };
	doAsync(state => openGameFromHandle(state));
}

async function openGameFromHandle(state: Draft<State>) {
	console.log('open');
	const result = await window.showDirectoryPicker({
		id: 'game',
		mode: 'read',
	});
	state.games = {
		loading: false,
		success: true,
		data: {
			games: [{
				name: 'Game',
				store: {
					type: 'handle',
					handle: result,
				},
			}],
			selectedGame: 0,
		},
	};
}

export function playGame(state: Draft<State>) {
	console.log('play');
	prepareWindow();
	startGame(castImmutable(current(state)));
}

function prepareWindow() {
	Object.assign(window, {
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
				'node-webkit': '0.67.1',
			},
		},
	});
}

async function startGame(state: Immutable<State>) {
	if (!('data' in state.games) || state.games.data.games[0].store.type !== 'handle') {
		return;
	}
	
	await filesystem.mountDirectoryHandle('/fs/game/', state.games.data.games[0].store.handle);
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