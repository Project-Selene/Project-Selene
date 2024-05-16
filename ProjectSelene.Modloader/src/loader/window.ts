const originalRequire = globalThis.require;

declare global {
	interface Navigator {
		keyboard: unknown;
	}
}

export function prepareWindow(hookGameStart: (...args: unknown[]) => unknown) {
	const global: ProjectSeleneGlobal = {
		classes: {},
		functions: {},
		consts: {},
		lets: {},
		enums: {},
		gameReadyCallback: hookGameStart,
		symbol: Symbol('ProjectSelene'),
	};

	Object.assign(window, {
		__projectSelene: global,
		require: require,
		nw: 'nw' in window ? window.nw : browserNW,
		process: window.process ?? browserProcess,
	});

	if (!navigator.keyboard) {
		Object.assign(navigator, {
			//Firefox and Safari do not support this
			keyboard: navigator.keyboard ?? {
				async getLayoutMap() {
					return {
						has() {
							return false;
						},
					};
				},
			},
		});
	}

	if (!AudioParam.prototype.cancelAndHoldAtTime) {
		//Firefox does not support this
		Object.assign(AudioParam.prototype, {
			cancelAndHoldAtTime(this: AudioParam, time: number) {
				this.cancelScheduledValues(time);
				this.setValueAtTime(this.value, time);
			},
		});
	}
	if (!('positionX' in AudioListener.prototype)) {
		const original = AudioContext;
		//Firefox does not support this
		Object.assign(globalThis, {
			AudioContext: function () {
				const ctx = new original();
				Object.defineProperty(ctx, 'listener', {
					value: {
						positionX: ctx.listener.positionX ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						positionY: ctx.listener.positionY ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						positionZ: ctx.listener.positionZ ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						forwardX: ctx.listener.forwardX ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						forwardY: ctx.listener.forwardY ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						forwardZ: ctx.listener.forwardZ ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						upX: ctx.listener.upX ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						upY: ctx.listener.upY ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
						upZ: ctx.listener.upZ ?? { linearRampToValueAtTime: () => { } } as unknown as AudioParam,
					},
					enumerable: true,
				});
				return ctx;
			},
		});
	}
}

const browserNW = {
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
	Window: {
		get: () => ({
			on: () => { return; },
			close: () => window.close(),
			enterFullscreen: () => document.body.requestFullscreen(),
			leaveFullscreen: () => document.exitFullscreen(),
		}),
	},
};

const browserProcess = {
	versions: {
		'node-webkit': 'browser',
	},
};

let fs: unknown;
function require(name: string) {
	if (originalRequire) {
		return originalRequire(name);
	}

	if (name === 'fs') {
		if (fs) {
			return fs;
		}
		fs = requireFS();
		return fs;
	}
}

function pathToUrl(path: string) {
	return path.replace(/\\/g, '/').replace(/[/]+/g, '/');
}

function requireFS() {
	return new Proxy({} as Record<string | symbol, unknown>, {
		get(original, prop) {
			// console.log('fs', prop);
			return ({
				promises: requireFSPromises(),
				existsSync() {
					return false; //We cannot emulate sync fs access.
				},
				mkdirSync() {
					//We cannot emulate sync fs access.
				},
				async readdir(name: string, options: string, callback: (err: unknown, result: unknown) => void) {
					name = pathToUrl(name);
					const path = '/fs/game/' + name.replace('data/local/terra/', '');
					// console.log('readdir', path, options);

					const result: { name: string, isDir: boolean }[] = await (await fetch(path, {
						method: 'GET',
						headers: {
							'X-SW-Command': 'readDir',
						},
					})).json();
					const mapped = result.map(e => ({
						name: e.name,
						isDirectory() { return e.isDir; },
						isFile() { return !e.isDir; },
					}));
					callback(undefined, mapped);
				},
			} as Record<string | symbol, unknown>)[prop] ?? original[prop] ?? (() => { throw new Error('Cannot be used in browser'); })();
		},
		set(original, p, newValue) {
			original[p] = newValue;
			return true;
		},
	});
}

function requireFSPromises() {
	return new Proxy({}, {
		get(_, prop) {
			// console.log('fs.promises', prop);
			return ({
				async readFile(name: string) {
					return await (await fetch(pathToUrl(name), {
						method: 'GET',
					})).text();
				},
				async stat(name: string) {
					console.log('stat', pathToUrl(name));
					const result = await (await fetch(pathToUrl(name), {
						method: 'GET',
						headers: {
							'X-SW-Command': 'stat',
						},
					})).json();
					if (!result) {
						throw new Error('Failed to get stat of file: ' + name);
					}
					return result;
				},
				async writeFile(name: string, content: string) {
					console.log('writefile', name, content);
					const result = await (await fetch(pathToUrl(name), {
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
					console.log('rename', from, to);
				},
			} as Record<string | symbol, unknown>)[prop] ?? (() => { throw new Error('Cannot be used in browser'); })();
		},
	});
}