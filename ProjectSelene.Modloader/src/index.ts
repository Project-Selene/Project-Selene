import { Filesystem } from './loader/filesystem';
import { root } from './ui/state';
import { startUI } from './ui/ui';

if (process.env.NODE_ENV === 'development') {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	import('../public/index.html'); import('../public/manifest.json'); import('../public/favicon.ico'); import('../public/logo192.png'); import('../public/logo512.png'); import('../public/character-halo-outline.png'); import('../public/character-outline.png'); import('../public/full_moon.svg');
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

console.log(root);
new Filesystem().setup();
startUI();


//directory allowdirs webkitdirectory