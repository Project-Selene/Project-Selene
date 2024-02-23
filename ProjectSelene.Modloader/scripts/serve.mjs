import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

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
		sourcemap: true,
		logLevel: 'info',
		platform: 'node',
		format: 'esm',
		plugins: [
			sassPlugin(),
		],
		define: {
			'window.DEBUG': 'true',
			'__filename': '"some.js"',
			'process.env.NODE_ENV': '"development"',
		},
	})
	.catch(() => process.exit(1));

context.watch();
context.serve({
	servedir: './build/',
	port: +(process.argv[2] ?? 8080),
});
