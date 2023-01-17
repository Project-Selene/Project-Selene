import { Storage } from './storage';

export class StorageHandles implements Storage {
	public constructor(
        public readonly base: string,
        private readonly dir: FileSystemDirectoryHandle,
	) {
        
	}
	public async readFile(path: string): Promise<string> {
		const parts = path.split('/');
		let dir = this.dir;
		for (let i = 0; i < parts.length - 1; i++) {
			const part = parts[i];

			const state = await dir.queryPermission({ mode: 'read' });
			if (state !== 'granted') {
				await dir.requestPermission({ mode: 'read' });
			}

			dir = await dir.getDirectoryHandle(part, {create: false});
		}
        
		const dirState = await dir.queryPermission({ mode: 'read' });
		if (dirState !== 'granted') {
			await dir.requestPermission({ mode: 'read' });
		}

		const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: false });
        
		const fileState = await fileHandle.queryPermission({ mode: 'read' });
		if (fileState !== 'granted') {
			await fileHandle.requestPermission({ mode: 'read' });
		}

		const file = await fileHandle.getFile();

		const reader = new FileReader();
		const result = new Promise<string>((resolve, reject) => {
			reader.onload = ev => resolve(ev.target?.result as string);
			reader.onerror = err => reject(err);
			reader.readAsText(file);
		});
		return await result;
	}
	public async readDir(path: string): Promise<string[]> {
		const parts = path.split('/');
		let dir = this.dir;
		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];

			const state = await dir.queryPermission({ mode: 'read' });
			if (state !== 'granted') {
				await dir.requestPermission({ mode: 'read' });
			}

			dir = await dir.getDirectoryHandle(part, {create: false});
		}
        
		const dirState = await dir.queryPermission({ mode: 'read' });
		if (dirState !== 'granted') {
			await dir.requestPermission({ mode: 'read' });
		}

		const result: string[] = [];
		for await (const [name] of dir.entries()) {
			result.push(name);
		}
		return result;
	}
	public async writeGranted(): Promise<boolean> {
		return await this.dir.queryPermission({ mode: 'readwrite' }) === 'granted';
	}
}