import esbuild, { Plugin } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';

export async function serve() {
	const context = await esbuild.context(
		{
			entryPoints: {
				main: './src/index.ts',
				'static/js/worker': './src/worker/worker.ts',
				serviceworker: './src/serviceworker/serviceworker.ts',
			},
			loader: {
				'.html': 'file',
				'.png': 'file',
				'.svg': 'file',
				'.json': 'file',
				'.ico': 'file',
			},
			assetNames: '[name]',
			outdir: './build/',
			bundle: true,
			sourcemap: true,
			logLevel: 'info',
			plugins: [
                sassPlugin() as unknown as Plugin,
			],
		})
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