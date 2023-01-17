// import * as filesystem from '../../filesystem';
import { filesystem } from '../../filesystem';
import { Game } from '../../game';
import { worker } from '../../worker';
import * as indexedDB from './indexedDB';

export async function openInBrowser() {
	const handles = await indexedDB.getFolderHandles();
	if (handles.length === 0) {
		if (!window.showDirectoryPicker) {
			const picker = document.createElement('input');
			picker.type = 'file';
			(picker as unknown as {allowdirs: boolean}).allowdirs = true;
			(picker as unknown as {directory: boolean}).directory = true;
			picker.webkitdirectory = true;
			document.body.appendChild(picker);
			const files = await new Promise<FileList | null>((resolve, reject) => {
				picker.addEventListener('change', () => resolve(picker.files));
				//TODO: cancel with blour event
				picker.addEventListener('cancel', () => reject());
				picker.click();
			});

			if (!files) {
				return new Game(filesystem);
			}

			await worker.registerGameDirectoryOnDemand(files);
			const text = await (await fetch('fs/game/node-webkit.html')).text();
			const dom = new DOMParser().parseFromString(text, 'text/html');
			const base = dom.createElement('base');
			base.href = location.origin + '/fs/game/';
			dom.head.insertBefore(base, dom.head.firstChild);
			// document.replaceChild(dom.documentElement, document.documentElement);
			const doc = document.open('text/html');
			doc.write(dom.documentElement.innerHTML);
			doc.close();

			console.log(files);
			document.body.removeChild(picker);
			return new Game(filesystem);
		}

		const folder = await window.showDirectoryPicker({
			id: 'gameFolder',
		});

		await indexedDB.storeFolderHandle(folder, false);

		return await openFolder(folder);
	} else {
		const folder = await findBestHandle(handles);
		return await openFolder(folder);
	}
}

async function findBestHandle(handles: {  handle: FileSystemDirectoryHandle, writable: boolean,  id: number }[]) {
	let bestHandle: FileSystemDirectoryHandle | undefined;
	for (const handle of handles) {
		if (await handle.handle.queryPermission() === 'granted') {
			if (handle.writable) {
				return handle.handle;
			} else {
				bestHandle = handle.handle;
			}
		}
	}
	if (bestHandle) {
		return bestHandle;
	}
	
	for (const handle of handles) {
		if (handle.writable && await handle.handle.requestPermission() === 'granted') {
			return handle.handle;
		}
	}
	
	for (const handle of handles) {
		if (!handle.writable && await handle.handle.requestPermission() === 'granted') {
			return handle.handle;
		}
	}
	
	throw new Error('Permission denied');
}


async function openFolder(folder: FileSystemDirectoryHandle): Promise<Game> {
	await worker.registerGameDirectoryHandle(folder);
	const text = await (await fetch('fs/game/index-release.html')).text();
	const dom = new DOMParser().parseFromString(text, 'text/html');
	const base = dom.createElement('base');
	base.href = location.origin + '/fs/game/';
	dom.head.insertBefore(base, dom.head.firstChild);
	// document.replaceChild(dom.documentElement, document.documentElement);
	const doc = document.open('text/html');
	doc.write(dom.documentElement.innerHTML);
	doc.close();
	// return new Game(filesystem.fromFolderHandle(folder));
	return new Game(filesystem);
}
