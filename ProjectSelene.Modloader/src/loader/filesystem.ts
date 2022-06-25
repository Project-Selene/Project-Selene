export abstract class FS {

}

export function fromFS(): FS {
	return new class extends FS {};
}

export function fromFolder(folder: FileSystemDirectoryHandle): FS {
	return new class extends FS {
		constructor(private folder: FileSystemDirectoryHandle) {
			super();
		}
	}(folder);
}

