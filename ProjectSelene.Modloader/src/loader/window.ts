const originalRequire = window.require;

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

					const result: {name: string, isDir: boolean}[] =  await (await fetch(path, {
						method: 'GET',
						headers: {
							'X-SW-Command': 'readDir',
						},
					})).json();
					const mapped = result.map(e => ({
						name: e.name, 
						isDirectory(){return e.isDir;}, 
						isFile(){return !e.isDir;},
					}));
					callback(undefined,mapped);
				},
			} as Record<string | symbol, unknown>)[prop] ?? original[prop] ?? (() => {throw new Error('Cannot be used in browser');})();
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
			} as Record<string | symbol, unknown>)[prop] ?? (() => {throw new Error('Cannot be used in browser');})();
		},
	});
}