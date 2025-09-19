#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline/promises';
import { applyPatches, copyContents } from './lib/assets.js';

copyAssets()
	.catch(err => console.error(err));

async function copyAssets() {
	let dir = await getGameDir();
	if (fs.existsSync(path.join(dir, 'terra', 'index-release.html'))) {
		dir = path.join(dir, 'terra');
	}

	if (!fs.existsSync(path.join(dir, 'index.html'))) {
		console.error('Could not find game in specified folder.');
		process.exit(1);
		return;
	}

	console.log('Copying directory ', dir);

	await fs.promises.mkdir('./rawAssets/', { recursive: true });
	await copyContents('./rawAssets/', dir);
	await fs.promises.writeFile('./rawAssets/.game', path.resolve(dir));

	console.log('Applying patches');

	await applyPatches();

	console.log('Done');
	process.exit(0);
}

async function getGameDir() {
	if (process.argv.length > 2) {
		return process.argv[0];
	}

	if (fs.existsSync('./rawAssets/.game')) {
		return await fs.promises.readFile('./rawAssets/.game', 'utf-8');
	}

	return await readline.createInterface(process.stdin, process.stdout).question('Please enter the directory of Alabaster Dawn: ');
}
