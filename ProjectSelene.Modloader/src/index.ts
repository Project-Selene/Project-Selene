import { Filesystem } from './loader/filesystem';
import { root } from './ui/state';
import { startUI } from './ui/ui';

if (process.env.NODE_ENV === 'development') {
	import('./import.esbuild.js').catch(() => {/* This will cause errors but we don't actually want to run it */});
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

console.log(root);
new Filesystem().setup().then(() => startUI());