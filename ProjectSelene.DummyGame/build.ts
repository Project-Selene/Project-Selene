import fs = require('fs');
import http = require('https');
import path = require('path');
import stream = require('stream');
import { promisify } from 'util';
import yauzl = require('yauzl');

const CACHE = './cache/';
const DIST = './dist/';
const NWJS_EXE = 'nw.exe';
const NWJS_VERSION = 'v0.67.1';
const NWJS_ZIP = `nwjs-${NWJS_VERSION}-win-x64.zip`;
const NWJS_URL = `https://dl.nwjs.io/${NWJS_VERSION}/nwjs-${NWJS_VERSION}-win-x64.zip`;
const NWJS_ROOT = `nwjs-${NWJS_VERSION}-win-x64/`;

export async function downloadNWJS() {
	if (fs.existsSync(DIST + NWJS_EXE)) {
		return;
	}

	if (!fs.existsSync(CACHE + NWJS_ZIP)) {
		await fs.promises.mkdir('cache', { recursive: true });

		console.log('Downloading NWJS v0.35.5 from ' + NWJS_URL);
		await download(NWJS_URL, CACHE + NWJS_ZIP);
	}

	await extract(CACHE + NWJS_ZIP, DIST, NWJS_ROOT);
}

function download(url: string, filename: string) {
	return new Promise<void>((resolve, reject) => {
		const file = fs.createWriteStream(filename);
		const request = http.get(url, response => {
			response.pipe(file);

			file.on('finish', () => {
				file.close();
				resolve();
			});
		});

		request.on('error', err => {
			file.close();
			reject(err);
		});
	});
}

async function extract(zipPath: string, outputFolder: string, subFolderTo: string) {
	await fs.promises.mkdir(outputFolder, { recursive: true });
	outputFolder = await fs.promises.realpath(path.resolve(outputFolder));


	return new Promise<void>((resolve, reject) => {
		let canceled = false;

		yauzl.open(zipPath, {lazyEntries: true}, (err, zipfile) => {
			if (err) {
				return reject(err);
			}

			zipfile.on('error', err => {
				canceled = true;
				reject(err);
			});
			zipfile.on('close', () => {
				if (!canceled) {
					resolve();
				}
			});
			zipfile.on('entry', async (entry: import('yauzl').Entry) => {
				if (canceled) {
					return;
				}
      
				if (!entry.fileName.startsWith(subFolderTo)) {
					zipfile.readEntry();
					return;
				}
      
				const dest = path.join(outputFolder, entry.fileName.substring(subFolderTo.length));
				const destDir = path.dirname(dest);
      
				try {
					await fs.promises.mkdir(destDir, { recursive: true });
      
					const canonicalDestDir = await fs.promises.realpath(destDir);
					const relativeDestDir = path.relative(outputFolder, canonicalDestDir);
      
					if (relativeDestDir.split(path.sep).includes('..')) {
						throw new Error(`Out of bound path "${canonicalDestDir}" found while processing file ${entry.fileName}`);
					}

					if (!entry.fileName.endsWith('/')) {
						const readStream = await promisify(zipfile.openReadStream.bind(zipfile))(entry);
						await promisify(stream.pipeline)(readStream, fs.createWriteStream(dest));
					}
      
					zipfile.readEntry();
				} catch (err) {
					canceled = true;
					zipfile.close();
					reject(err);
				}
			});

			zipfile.readEntry();
		});
	});
}