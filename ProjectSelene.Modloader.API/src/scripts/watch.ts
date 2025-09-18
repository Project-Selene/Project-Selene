#!/usr/bin/env node

import * as chokidar from 'chokidar';
import esbuild from 'esbuild';
import * as fs from 'fs';
import * as http from 'node:http';
import * as path from 'path';
import { copyContents, getAssets } from './lib/assets.js';
import { diffAsset } from './lib/diff-assets.js';

(async () => {
	const sassPlugin = await (async () => {
		try {
			return (await import('esbuild-sass-plugin')).sassPlugin;
		} catch {
			return null;
		}
	})();

	const ctx = await esbuild.context({
		bundle: true,
		format: 'esm',
		sourcemap: 'inline',
		outfile: 'dist/unpacked/main.js',
		target: 'es2020',
		entryPoints: ['src/main.ts'],
		logLevel: 'info',
		define: {
			'globalThis.IS_DEVELOPMENT': 'true',
		},
		plugins: sassPlugin ? [sassPlugin()] : [],
		loader: {
			'.woff': 'dataurl',
			'.woff2': 'dataurl',
		},
	});

	ctx.watch();
	const { hosts, port } = await ctx.serve({
		servedir: './dist/unpacked/',
		port: 8183,
	});


	const packageText = await fs.promises.readFile('./package.json', 'utf-8');
	const pkg = JSON.parse(packageText);
	const assets = await getAssets('assets');
	if (fs.existsSync('dist/unpacked/assets')) {
		await fs.promises.rm('dist/unpacked/assets', { recursive: true });
	}
	await copyContents('dist/unpacked/assets', 'assets');
	await fs.promises.writeFile('./dist/unpacked/manifest.json', JSON.stringify({
		id: pkg?.['project-selene']?.id,
		name: pkg?.['project-selene']?.name ?? pkg?.name,
		description: pkg?.description,
		version: pkg?.version,
		patches: assets,
	}, undefined, '\t'));

	const updateAssetsResponses: http.ServerResponse<http.IncomingMessage>[] = [];

	http.createServer((req, res) => {
		if (req.method === 'OPTIONS') {
			res.writeHead(204, {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Max-Age': 2592000, // 30 days
			});
			res.end();
			return;
		}

		if (req.url === '/asset-changes') {
			res.writeHead(200, {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Max-Age': 2592000, // 30 days
				'Content-Type': 'text/event-stream',
				'Connection': 'keep-alive',
				'Cache-Control': 'no-cache',
			});
			updateAssetsResponses.push(res);
			return;
		}

		if (req.url === '/health') {
			res.writeHead(200, {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Max-Age': 2592000, // 30 days
				'Content-Type': 'text/plain',
			});
			res.end('OK');
			return;
		}

		const options: http.RequestOptions = {
			hostname: hosts[0],
			port: port,
			path: req.url,
			method: req.method,
			headers: req.headers,
		};

		const proxyReq = http.request(options, proxyRes => {
			res.writeHead(proxyRes.statusCode, {
				...proxyRes.headers,
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
				'Access-Control-Allow-Headers': '*',
				'Access-Control-Max-Age': 2592000, // 30 days
			});
			proxyRes.pipe(res, { end: true });
		});

		req.pipe(proxyReq, { end: true });
	}).listen(8182);

	function updateAssets(type: string, files: string[]) {
		const closed = updateAssetsResponses.filter(res => !res.writable);
		for (const res of closed) {
			const index = updateAssetsResponses.indexOf(res);
			if (index >= 0) {
				const [res] = updateAssetsResponses.splice(index, 1);
				try {
					res.end();
				} catch {
					// ignore
				}
			}
		}

		for (const res of updateAssetsResponses) {
			try {
				res.write(`event: ${type}\ndata: ${JSON.stringify(files)}\n\n`);
			} catch {
				try {
					res.end();
				} catch {
					// ignore
				}
			}
		}
	}
	if (fs.existsSync('./rawAssets/.game')) {
		const gamePath = await fs.promises.readFile('./rawAssets/.game', 'utf-8');
		chokidar.watch('./rawAssets/**/*.json').on('change', (filePath) => {
			const relative = path.relative('rawAssets', filePath);

			async function updateAssetsIfNeeded(relative: string) {
				if (fs.existsSync(path.join('assets', relative) + '-patch')) {
					await fs.promises.mkdir(path.dirname(path.join('assets', relative)), { recursive: true });
					await fs.promises.copyFile(path.join('assets', relative) + '-patch', path.join('dist/unpacked/assets', relative) + '-patch', fs.constants.COPYFILE_FICLONE);
					updateAssets('change', ['terra/' + relative.replace(/\\/g, '/')]);
				}
			}

			setTimeout(() => {
				diffAsset(gamePath, relative)
					.then(() => updateAssetsIfNeeded(relative))
					.catch(err => console.warn('Could not compare file', filePath, err.message ?? err));
			}, 100);
		});
		chokidar.watch('./package.json').on('change', async () => {
			try {
				const packageText = await fs.promises.readFile('./package.json', 'utf-8');
				const pkg = JSON.parse(packageText);
				await fs.promises.writeFile('./dist/unpacked/manifest.json', JSON.stringify({
					id: pkg?.['project-selene']?.id,
					name: pkg?.['project-selene']?.name ?? pkg?.name,
					description: pkg?.description,
					version: pkg?.version,
					patches: assets,
				}, undefined, '\t'));
				updateAssets('change', ['manifest.json']);
			} catch {
				console.error('Failed to update manifest');
			}
		});
		const watcher = chokidar.watch('./assets/**/*.json-patch');
		watcher.on('add', filePath => {
			const relative = path.relative('assets', filePath);
			const target = 'terra/' + relative.substring(0, relative.length - '-patch'.length).replace(/\\/g, '/');
			setTimeout(async () => {
				assets.push({ type: 'raw', target } as ModPatch);
				await fs.promises.mkdir(path.dirname(path.join('assets', relative)), { recursive: true });
				await fs.promises.copyFile(path.join('assets', relative), path.join('dist/unpacked/assets', relative), fs.constants.COPYFILE_FICLONE);
				await fs.promises.writeFile('./dist/unpacked/manifest.json', JSON.stringify({
					id: pkg?.['project-selene']?.id,
					name: pkg?.['project-selene']?.name ?? pkg?.name,
					description: pkg?.description,
					version: pkg?.version,
					patches: assets,
				}, undefined, '\t'));
			}, 300);
		});
		watcher.on('unlink', filePath => {
			const relative = path.relative('assets', filePath);
			const target = 'terra/' + relative.substring(0, relative.length - '-patch'.length).replace(/\\/g, '/');
			setTimeout(async () => {
				const index = assets.findIndex(a => a.target === target);
				if (index >= 0) {
					assets.splice(index, 1);
				}
				updateAssets('remove', [target]);
				await fs.promises.unlink(path.join('dist/unpacked/assets', relative));
				await fs.promises.writeFile('./dist/unpacked/manifest.json', JSON.stringify({
					id: pkg?.['project-selene']?.id,
					name: pkg?.['project-selene']?.name ?? pkg?.name,
					description: pkg?.description,
					version: pkg?.version,
					patches: assets,
				}, undefined, '\t'));
			}, 300);
		});
	}

})().catch(err => console.error(err));
