export interface FileApi {
	createFile: (path: string, content: string) => Promise<void>;
	nextShowDirectoryPicker: (folder?: string) => Promise<void>;
}

export async function setupDirectoryPicker(): Promise<FileApi> {
	const root = await navigator.storage.getDirectory();
	for await (const entry of root.keys()) {
		await root.removeEntry(entry, { recursive: true });
	}

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
		showDirectoryPicker: async (): Promise<FileSystemDirectoryHandle> => {
			const next = newOpenDir.shift();
			if (next === undefined) {
				throw new DOMException('User aborted', 'AbortError');
			}
			next[1]();
			return next[0];
		},
	});

	return {
		createFile: async (path: string, content: string) => {
			const fileHandle = await resolveFile(path, { create: true }, { create: true });
			const writable = await fileHandle.createWritable();
			await writable.write(content);
		},
		nextShowDirectoryPicker: async (folder?: string) => {
			if (!folder) {
				newOpenDir.push(undefined);
			} else {
				const entry = await resolveFolder(folder);
				return new Promise<void>((resolve) => {
					newOpenDir.push([entry, resolve]);
				});
			}
		},
	};
}
