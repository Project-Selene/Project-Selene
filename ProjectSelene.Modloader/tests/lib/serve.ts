import * as esbuild from 'esbuild';
import { options } from '../../scripts/options.mjs';

export async function serve() {
	const context = await esbuild.context(options)
		.catch(() => process.exit(1));

	await context.watch();
	const serve = await context.serve({
		servedir: './build/',
		port: 0,
	});

	const url = 'http://' + serve.host.replace('0.0.0.0', '127.0.0.1') + ':' + serve.port + '/';

	for (let i = 0; i < 10; i++) {
		try {
			await fetch(url);
			break;
		} catch {
			continue;
		}
	}

	return { context, url };
}