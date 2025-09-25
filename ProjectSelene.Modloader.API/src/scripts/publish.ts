#!/usr/bin/env node

import fs from 'fs';
import { createInterface } from 'readline';
import { ModsClient } from '../internal/moddb/generated/selene-api.js';
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
	try {
		console.log('Registering version');
		await createDraft(token, manifest);
	} catch (ex) {
		console.error(ex);
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

function withToken(token: string) {
	return {
		fetch: (url, request) => {
			if (request) {
				return fetch(url, {
					...request,
					headers: {
						...(request.headers ?? {}),
						'X-API-Key': token,
					}
				});
			}
			return fetch(url);
		}
	};
}

async function createDraft(token: string, manifest: Manifest) {
	const mods = new ModsClient(url(), withToken(token));

	await mods.registerVersion(manifest.id, {
		name: manifest.name,
		modId: manifest.id,
		description: manifest.description,
		version: manifest.version,
	});
}

async function upload(token: string, manifest: Manifest): Promise<void> {
	const data = await createZipBundle();

	const formData = new FormData();
	formData.append('file', new Blob([data], { type: 'application/zip' }), 'mod.zip');

	const resp = await fetch(`${url()}/api/Storage/${manifest.id}/${manifest.version}`, {
		method: 'PUT',
		headers: {
			'X-API-Key': token,
		},
		body: formData,
	});

	if (resp.status !== 200) {
		throw new Error('Failed to upload: ' + await resp.text());
	}
}

async function submit(token: string, manifest: Manifest) {
	const mods = new ModsClient(url(), withToken(token));

	await mods.submitVersion(manifest.id, { modId: manifest.id, version: manifest.version });
}