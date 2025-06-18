import fs from 'fs';
import JSZip from 'jszip';
import path from 'path';

export async function createZipBundle() {
	const jszip = new JSZip();

	await addFolderToZip(jszip, './dist/unpacked/');
	return await jszip.generateAsync({ type: 'nodebuffer' });
}

async function addFolderToZip(zip: JSZip, folderPath: string, prefix = '') {
	const files = await fs.promises.readdir(folderPath);
	const promises = files.map(async (file) => {
		const filePath = path.join(folderPath, file);
		const relativePath = path.join(prefix, file);

		if (fs.lstatSync(filePath).isDirectory()) {
			await addFolderToZip(zip.folder(file), filePath, relativePath);
			return;
		}

		const fileContent = fs.readFileSync(filePath);
		zip.file(relativePath, fileContent);
	});
	await Promise.all(promises);
}