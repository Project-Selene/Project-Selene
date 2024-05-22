import * as esbuild from 'esbuild';
import { options } from '../../scripts/options.mjs';

let context!: esbuild.BuildContext<esbuild.BuildOptions>;

export async function serve() {
	options.entryPoints!['test-runtime'] = 'tests/runtime/test.ts';
	options.minify = false;
	options.define!['window.TEST'] = 'true';
	context = await esbuild.context(options)
		.catch(() => process.exit(1));

	await context.watch();
	await context.serve({
		servedir: './build/',
		port: 8082,
	});

	const url = 'http://127.0.0.1:8082/';

	for (let i = 0; i < 10; i++) {
		try {
			await fetch(url);
			break;
		} catch {
			continue;
		}
	}
}

export async function stopServing() {
	await context.dispose();
}