import * as filesystem from './filesystem';
import * as indexedDB from './indexedDB';

export interface Game {
	filesystem: filesystem.FS
}

export async function openInBrowser() {
	const handles = await indexedDB.getFolderHandles();
	if (handles.length === 0) {
		const folder = await window.showDirectoryPicker({
			id: 'gameFolder',
		});

		await indexedDB.storeFolderHandle(folder, false);

		return openFolder(folder);
	} else {
		const folder = await findBestHandle(handles);
		return openFolder(folder);
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


function openFolder(folder: FileSystemDirectoryHandle): Game {
	return {
		filesystem: filesystem.fromFolder(folder),
	};
}
