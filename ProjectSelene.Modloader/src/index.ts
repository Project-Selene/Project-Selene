import { Filesystem } from './loader/filesystem';
import { root } from './ui/state';
import { startUI } from './ui/ui';

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import('../public/index.html'); import('../public/manifest.json'); import('../public/favicon.ico'); import('../public/static/images/halo.png'); import('../public/static/images/juno.png'); import('../public/static/images/full_moon.svg');
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

console.log(root);
new Filesystem().setup().then(() => startUI());


//directory allowdirs webkitdirectory