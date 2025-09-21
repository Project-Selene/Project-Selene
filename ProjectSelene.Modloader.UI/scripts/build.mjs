import esbuild from 'esbuild';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import JsZip from 'jszip';
import { options } from './options.mjs';

const html = await prerender();

await fs.promises.rm('./build/', { recursive: true, force: true });

const context = await esbuild.context(options).catch(() => process.exit(1));

await context.rebuild();
await context.dispose();

await fs.promises.rm('build/package.json');
await fs.promises.writeFile('build/index.html', html);

async function addFolderToZip(zip, folderPath, parentFolder = '') {
	try {
		const files = await fs.promises.readdir(folderPath);
		for (const file of files) {
			const filePath = `${folderPath}/${file}`;
			const stats = await fs.promises.stat(filePath);

			if (stats.isDirectory()) {
				await addFolderToZip(zip, filePath, parentFolder ? `${parentFolder}/${file}` : file);
			} else {
				const fileData = await fs.promises.readFile(filePath);
				const relativePath = parentFolder ? `${parentFolder}/${file}` : file;
				zip.file(relativePath, fileData);
			}
		}
	} catch (error) {
		console.error('Error adding folder to ZIP:', error);
	}
}

const zip = new JsZip();
await addFolderToZip(zip, 'build/', 'selene');
zip.file('package.json', await fs.promises.readFile('./public/package.json'));
const buffer = await zip.generateAsync({ type: 'nodebuffer' });
await fs.promises.writeFile('build/project-selene.zip', buffer);

await fs.promises.copyFile('public/package.json', 'build/package.json');

async function prerender() {
	await fs.promises.rm('./build/', { recursive: true, force: true });

	const context = await esbuild
		.context({
			...options,
			format: 'iife',
		})
		.catch(() => process.exit(1));

	await context.rebuild();
	await context.dispose();

	console.log('prerendering...');

	const jsdom = await JSDOM.fromFile('build/index.html', {
		runScripts: 'dangerously',
		resources: 'usable',
	});

	jsdom.window.indexedDB = {
		open() {
			return {};
		},
	};

	const script = jsdom.window.document.createElement('script');
	script.src = 'main.js';
	script.type = 'text/javascript';
	jsdom.window.document.head.appendChild(script);

	let i = 0;
	while (jsdom.window.document.querySelector('img') === null) {
		await new Promise(resolve => setTimeout(resolve, 100));
		i++;
		if (i > 100) {
			break;
		}
	}

	if (jsdom.window.document.querySelector('img') === null) {
		console.error('Prerendering failed');
		process.exit(1);
	}

	function extractCSS() {
		const allCSS = [...jsdom.window.document.styleSheets]
			.filter(s => !s.disabled && s.href == null && !s.ownerNode?.innerText)
			.map(s => {
				try {
					return [...s.cssRules].map(rule => rule.cssText).join(' ');
				} catch {
					//Ignore
				}
			})
			.filter(Boolean)
			.join(' ');

		return allCSS;
	}

	const style = jsdom.window.document.createElement('style');
	style.textContent = extractCSS();
	jsdom.window.document.head.appendChild(style);

	jsdom.window.document.head.removeChild(script);
	return jsdom.serialize();
}
