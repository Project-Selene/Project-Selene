import esbuild from 'esbuild';
import { options } from './options.mjs';

options.define['window.DEBUG'] = 'true';
options.define['process.env.NODE_ENV'] = '"development"';

const context = await esbuild.context(options)
	.catch(() => process.exit(1));

context.watch();
context.serve({
	servedir: './build/',
	port: +(process.argv[2] ?? 8080),
});
