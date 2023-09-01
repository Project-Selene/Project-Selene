import { Filesystem } from './loader/filesystem';
import { root } from './ui/state';
import { startUI } from './ui/ui';

import('./import.esbuild.js').catch(() => {/* We don't actually want to run it */});
if (process.env.NODE_ENV === 'development') {
	new EventSource('/esbuild').addEventListener('change', () => location.reload());
}

if (navigator.userAgent === 'ReactSnap') {
	if (location.href.endsWith('404.html') ) {
		document.title = 'Project Selene 404';
	}
} else {
	console.log(root);
}
new Filesystem().setup().then(() => startUI());