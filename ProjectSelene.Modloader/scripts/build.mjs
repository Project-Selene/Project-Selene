import esbuild from 'esbuild';
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';
import fs from 'fs';
import snap from 'react-snap';
import JsZip from 'jszip';

await fs.promises.rm('./build/', { recursive: true, force: true });

const context = await esbuild.context(
	{
		entryPoints: {
			main: './src/index.ts',
			'static/js/worker': './src/worker/worker.ts',
			serviceworker: './src/serviceworker/serviceworker.ts',
			'static/js/prefix': './src/prefix/prefix.ts',
		},
		loader: {
			'.html': 'file',
			'.png': 'file',
			'.svg': 'file',
			'.json': 'file',
			'.ico': 'file',
			'.txt': 'file',
			'.md': 'file',
		},
		assetNames: '[dir]/[name]',
		outbase: './public/',
		outdir: './build/',
		bundle: true,
		minify: true,
		sourcemap: true,
		logLevel: 'info',
		platform: 'node',
		format: 'esm',
		target: 'es2018',
		plugins: [
			sassPlugin({
				filter: /.module.s?css$/,
				type: 'style',
				transform: postcssModules({}),
			}),
			sassPlugin({
				filter: /.s?css$/,
				type: 'style',
			}),
		],
		define: {
			'window.DEBUG': 'false',
			'__filename': '"some.js"',
			'process.env.NODE_ENV': '"production"',
		},
	})
	.catch(() => process.exit(1));

await context.rebuild();
await context.dispose();

console.log('running snap');

await snap.run({
	puppeteerArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
});

await fs.promises.rm('build/project-selene.zip', { recursive: true, force: true });
await fs.promises.rm('build/package.json');

async function addFolderToZip(zip, folderPath, parentFolder = '') {
	try {
		const files = await fs.promises.readdir(folderPath);
		for (const file of files) {
			const filePath = `${folderPath}/${file}`;
			const stats = await fs.promises.stat(filePath);

			if (stats.isDirectory()) {
				await addFolderToZip(zip, filePath, parentFolder ? `${parentFolder}/${file}` : file);
			} else {
				const fileData = await fs.promises.readFile(filePath);
				const relativePath = parentFolder ? `${parentFolder}/${file}` : file;
				zip.file(relativePath, fileData);
			}
		}
	} catch (error) {
		console.error('Error adding folder to ZIP:', error);
	}
}

const zip = new JsZip();
await addFolderToZip(zip, 'build/', 'selene');
zip.file('package.json', await fs.promises.readFile('./public/package.json'));
const buffer = await zip.generateAsync({ type: 'nodebuffer' });
await fs.promises.writeFile('build/project-selene.zip', buffer);

await fs.promises.rm('build/200.html');
await fs.promises.rm('build/404.html');

await fs.promises.copyFile('public/package.json', 'build/package.json');
await fs.promises.rename('build/index.html', 'build/4242241770799142.html'); //TODO: remove for public release