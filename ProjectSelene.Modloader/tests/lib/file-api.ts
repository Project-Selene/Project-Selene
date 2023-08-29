import { Page, firefox, webkit } from '@playwright/test';

export function mockFileApi(browserName: string) {
	if (browserName !== firefox.name() && browserName !== webkit.name()) {
		return {
			content: '(' + injected.toString() + ')()',
		};
	} else {
		return {
			content: 'window.showDirectoryPicker = undefined',
		};
	}
}

export function createFile(page: Page, path: string, content: string) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	return page.evaluate(({path, content}: {path: string, content: string}) => window.__createFile(path, content), {path, content});
}
export function nextShowDirectoryPicker(page: Page, path: string) {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	//@ts-ignore
	return page.evaluate((path: string) => window.__nextShowDirectoryPicker(path), path);
}

const injected = async () => {
	await navigator.serviceWorker.register('serviceworker.js');

	const root = await navigator.storage.getDirectory();
	const newOpenDir: ([FileSystemDirectoryHandle, () => void] | undefined)[] = [];

	async function resolveFile(path: string, dirCreate: FileSystemGetDirectoryOptions = {}, fileCreate: FileSystemGetFileOptions = {}): Promise<FileSystemFileHandle> {
		const parts = path.slice(1).split('/');
		let result: FileSystemDirectoryHandle = root;
		for (const part of parts.slice(0, parts.length - 1)) {
			result = await result.getDirectoryHandle(part, dirCreate);
		}
		return await result.getFileHandle(parts[parts.length - 1], fileCreate);
	}
	async function resolveFolder(path: string, dirCreate: FileSystemGetDirectoryOptions = {}): Promise<FileSystemDirectoryHandle> {
		const parts = path.slice(1).split('/');
		let result: FileSystemDirectoryHandle = root;
		for (const part of parts) {
			result = await result.getDirectoryHandle(part, dirCreate);
		}
		return result;
	}

	Object.assign(window, {
		__createFile: async (path: string, content: string) => {
			const fileHandle = await resolveFile(path, {create: true}, {create: true});
			const writable = await fileHandle.createWritable();
			await writable.write(content);
		},
		__nextShowDirectoryPicker: async (folder?: string) => {
			if (!folder) {
				newOpenDir.push(undefined);
			} else {
				const entry = await resolveFolder(folder);
				return new Promise<void>((resolve) => {
					newOpenDir.push([entry, resolve]);
				});
			}
		},
		showDirectoryPicker: async (): Promise<FileSystemDirectoryHandle> => {
			const next = newOpenDir.shift();
			if (next === undefined) {
				throw new DOMException('User aborted', 'AbortError');
			}
			next[1]();
			return next[0];
		},
	});
};
