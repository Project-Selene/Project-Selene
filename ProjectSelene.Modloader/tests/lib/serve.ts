import esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

export async function serve() {
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
				'.esbuild.ts': 'js', //Workaround for https://github.com/evanw/esbuild/issues/3319
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
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		//@ts-ignore
		.catch(() => process.exit(1));
    
	context.watch();
	context.serve({
		servedir: './build/',
		port: 8081,
	});
    
	for (let i = 0; i < 10; i++) {
		try {
			await fetch('http://localhost:8081/');
			break;
		} catch {
			continue;
		}
	}
}