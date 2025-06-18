import esbuild from 'esbuild';
import { existsSync, promises as fs } from 'fs';
import { copyContents, generatePatches, getAssets } from './assets.js';

export async function build() {
	const sassPlugin = await (async () => {
		try {
			return (await import('esbuild-sass-plugin')).sassPlugin;
		} catch {
			return null;
		}
	})();

	await esbuild.build({
		bundle: true,
		format: 'esm',
		sourcemap: 'inline',
		outfile: './dist/unpacked/main.js',
		target: 'es2020',
		entryPoints: ['./src/main.ts'],
		logLevel: 'info',
		define: {
			'globalThis.IS_DEVELOPMENT': 'false',
		},
		plugins: sassPlugin ? [sassPlugin()] : [],
		external: ['*.woff', '*.woff2'],
	});

	const packageText = await fs.readFile('./package.json', 'utf-8');
	const pkg = JSON.parse(packageText);

	if (existsSync('rawAssets/.game')) {
		const gamePath = await fs.readFile('rawAssets/.game', 'utf-8');
		await generatePatches(gamePath);
	}

	const assets = await getAssets('assets');
	if (existsSync('dist/unpacked/assets')) {
		await fs.rm('dist/unpacked/assets', { recursive: true });
	}
	await copyContents('dist/unpacked/assets', 'assets');
	await fs.writeFile('./dist/unpacked/manifest.json', JSON.stringify({
		id: pkg?.['project-selene']?.id,
		name: pkg?.['project-selene']?.name ?? pkg?.name,
		description: pkg?.description,
		version: pkg?.version,
		patches: assets,
	}, undefined, '\t'));
}
