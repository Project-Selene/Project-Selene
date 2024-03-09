
import { sassPlugin, postcssModules } from 'esbuild-sass-plugin';

/** @type {import('esbuild').BuildOptions} */
export const options = {
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
};