import patch from 'fast-json-patch';
import * as fs from 'fs';
import * as path from 'path';


export async function diffAsset(gamePath: string, filePath: string) {
	if (filePath.endsWith('.json')) {
		const diffPath = path.join('./assets/', filePath + '-patch');
		const [srcBuf, dstBuf, diff] = await Promise.all([
			fs.promises.readFile(path.join(gamePath, filePath)).catch(() => null),
			fs.promises.readFile(path.join('./rawAssets/', filePath)),
			fs.promises.readFile(diffPath).then(buf => JSON.parse(buf as unknown as string)).catch(() => '[]'),
		]);
		if (!srcBuf) {
			await fs.promises.mkdir(path.dirname(diffPath), { recursive: true });
			await fs.promises.copyFile(path.join('./rawAssets/', filePath), path.join('./assets/', filePath), fs.constants.COPYFILE_FICLONE);
			return;
		}
		const newDiff = patch.compare(JSON.parse(srcBuf as unknown as string), JSON.parse(dstBuf as unknown as string));
		const newDiffText = JSON.stringify(newDiff);
		const oldDiffText = JSON.stringify(diff);
		if (newDiff.length === 0) {
			if (fs.existsSync(diffPath)) {
				await fs.promises.unlink(diffPath);
			}
		} else if (newDiffText !== oldDiffText) {
			await fs.promises.mkdir(path.dirname(diffPath), { recursive: true });
			await fs.promises.writeFile(diffPath, stringifyDiff(newDiff));
		}  
	}
}

function stringifyDiff(diffs: unknown[]) {
	return [
		'[\n\n',
		diffs.map(d => JSON.stringify(d)).join(',\n\n'),
		'\n\n]',
	].join('');
}