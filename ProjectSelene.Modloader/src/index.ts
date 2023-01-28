import { startUI } from './ui/ui';
import { worker } from './worker';

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import('../public/index.html'); import('../public/manifest.json'); import('../public/favicon.ico'); import('../public/logo192.png'); import('../public/logo512.png'); import('../public/character-halo-outline.png'); import('../public/character-outline.png'); import('../public/full_moon.svg');
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

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
							const path = '/fs/game/' + name.substring('/terra'.length).replace(/\\/g, '/').replace('data/local/terra/', '');
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

setTimeout(() => worker.registerSavesInMemory('saves'), 1000);
worker.setup().then(() => startUI());


//directory allowdirs webkitdirectory