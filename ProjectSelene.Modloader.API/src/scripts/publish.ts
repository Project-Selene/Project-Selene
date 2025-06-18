#!/usr/bin/env node

import fs from 'fs';
import { createInterface } from 'readline';
import { build } from './lib/build.js';
import { createZipBundle } from './lib/bundle.js';

interface Manifest {
	id: string,
	name: string,
	description: string,
	version: string,
}

(async () => {
	const token = await getAPIToken();

	console.log('Building');
	await build();

	const manifest = getModManifest();

	console.log('Checking if mod already exists');
	const exists = await modExists(token, manifest);

	if (!exists) {
		console.log('Registering new mod');
		await createNewMod(token, manifest);
	}

	try {
		console.log('Registering version');
		await createDraft(token, manifest);
	} catch {
		console.log('Failed to register version. Does it already exist?');
	}

	console.log('Uploading');
	await upload(token, manifest);

	console.log('Publishing version');
	await submit(token, manifest);

})().catch(err => {
	console.error('Failed to publish mod: ' + err);
	process.exit(1);
});

function getModManifest(): Manifest {
	return JSON.parse(fs.readFileSync('./dist/unpacked/manifest.json') as unknown as string);
}

async function getAPIToken() {
	if (process.env.PROJECT_SELENE_TOKEN) {
		return process.env.PROJECT_SELENE_TOKEN;
	}

	const readline = createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	const token = await new Promise<string>((resolve, reject) => {
		readline.question('Please enter you Project Selene API Token: ', (token) => {
			if (!token) {
				return reject(new Error('No token provided'));
			}

			resolve(token);
			readline.close();
		});
	});

	return token;
}

function url() {
	if (process.argv.length > 2 && URL.canParse(process.argv[2])) {
		return process.argv[2];
	}

	return 'https://projectselene.org';
}

async function modExists(token: string, manifest: Manifest) {
	const resp = await fetch(`${url()}/api/Mod/list`, {
		headers: {
			'Authorization': 'Bearer ' + token,
		},
	});

	const { entries } = await resp.json();
	for (const entry of entries) {
		if (entry.id === manifest.id) {
			return true;
		}
	}

	return false;
}

async function createNewMod(token: string, manifest: Manifest) {
	const resp = await fetch(`${url()}/api/Mod/create`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			id: manifest.id,
			name: manifest.name,
			description: manifest.description,
			version: manifest.version,
		}),
	});

	if (resp.status === 409) {
		throw new Error('Failed to create mod: Mod already exists');
		return;
	}

	if (resp.status !== 200) {
		throw new Error('Failed to create mod: ' + await resp.text());
	}
}

async function createDraft(token: string, manifest: Manifest) {
	const resp = await fetch(`${url()}/api/Mod/draft/${manifest.id}/create`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			version: manifest.version,
		}),
	});

	if (resp.status === 409) {
		throw new Error('Failed to create version draft: Version already exists');
		return;
	}

	if (resp.status !== 200) {
		throw new Error('Failed to register version: ' + await resp.text());
	}
}

async function upload(token: string, manifest: Manifest): Promise<void> {
	const data = await createZipBundle();

	const formData = new FormData();
	formData.append('data', new Blob([data], { type: 'application/zip' }), 'mod.zip');

	const resp = await fetch(`${url()}/api/Artifact/${manifest.id}/${manifest.version}/upload`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
		},
		body: formData,
	});

	if (resp.status !== 200) {
		throw new Error('Failed to upload: ' + await resp.text());
	}
}

async function submit(token: string, manifest: Manifest) {
	const resp = await fetch(`${url()}/api/Mod/draft/${manifest.id}/${manifest.version}/submit`, {
		method: 'POST',
		headers: {
			'Authorization': 'Bearer ' + token,
		},
	});

	if (resp.status !== 200) {
		throw new Error('Failed to publish: ' + await resp.text());
	}
}