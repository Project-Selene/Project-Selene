import patch from 'fast-json-patch';
import * as fs from 'fs';
import * as path from 'path';
import { diffAsset } from './diff-assets.js';

export async function getAssets(folder: string) {
	if (!fs.existsSync(folder)) {
		return [];
	}

	const files = await fs.promises.readdir(folder, { withFileTypes: true });

	const result = [
		...files.filter(f => f.isFile())
			.map(f => path.join(folder, f.name))
			.map((relative): ModPatch => {
				const subdir = path.relative('assets', relative).replace(/\\/g, '/');
				if (relative.endsWith('.json-patch')) {
					return { type: 'json', target: 'terra/' + subdir.substring(0, subdir.length - '-patch'.length)};
				} else {
					return { type: 'raw', target: 'terra/' + subdir };
				}
			}),
		...(await Promise.all(files.filter(f => f.isDirectory()).map(f => getAssets(path.join(folder, f.name)))))
			.flat(1),
	];
	return result;
}

export async function copyContents(target: string, source: string) {
	if (!fs.existsSync(source)) {
		return;
	}

	const files = await fs.promises.readdir(source, { withFileTypes: true });
	await Promise.all(files.map(async file => {
		const dst = path.join(target, file.name);
		const src = path.join(source, file.name);
		if (file.isFile()) {
			await fs.promises.copyFile(src, dst, fs.constants.COPYFILE_FICLONE);
		} else if (file.isDirectory()) {
			await fs.promises.mkdir(dst, { recursive: true });
			await copyContents(dst, src);
		}
	}));
}

export async function applyPatches() {
	const assets = await getAssets('assets');
	await Promise.all(assets.map(async asset => {
		if (asset.type === 'json') {
			try {
				const originalFile = path.join('rawAssets', asset.target.substring('terra/'.length));
				const patchFile = path.join('assets', asset.target.substring('terra/'.length) + '-patch');
				const originalData = JSON.parse(await fs.promises.readFile(originalFile) as unknown as string);
				const patchData = JSON.parse(await fs.promises.readFile(patchFile) as unknown as string);
				patch.applyPatch(originalData, patchData, true, true, false);
				await fs.promises.writeFile(originalFile, JSON.stringify(originalData));
			} catch {
				console.error('could not patch asset', asset);
			}
		} else if (asset.type === 'raw') {
			const originalFile = path.join('rawAssets', asset.target.substring('terra/'.length));
			const patchFile = path.join('assets', asset.target.substring('terra/'.length));
			await fs.promises.copyFile(patchFile, originalFile, fs.constants.COPYFILE_FICLONE);
		}
	}));
}

async function getAllAssets(folder: string) {
	const files = await fs.promises.readdir(folder, { withFileTypes: true });

	const result: string[] = [
		...files.filter(f => f.isFile())
			.map(f => path.join(folder, f.name))
			.map(relative => path.resolve(relative)),
		...(await Promise.all(files.filter(f => f.isDirectory()).map(f => getAllAssets(path.join(folder, f.name)))))
			.flat(1),
	];
	return result;
}

export async function generatePatches(gamePath: string) {
	const rawAssets = await getAllAssets('rawAssets');
	await Promise.all(rawAssets.map(async asset => {
		const assetPath = path.relative('rawAssets', asset);
		await diffAsset(gamePath, assetPath);
	}));
}