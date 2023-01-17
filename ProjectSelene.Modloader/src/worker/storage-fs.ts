import { Storage } from './storage';

export class StorageFS implements Storage {
	private readonly fs: typeof import('fs');
	private readonly path: typeof import('path');
	public constructor(
        public readonly base: string,
        private readonly dir: string,
	) {
		this.fs = require('fs');
		this.path = require('path');
	}
	public readFile(path: string): Promise<string> {
		return this.fs.promises.readFile(this.path.join(this.dir, path), 'utf-8');
	}
	public readDir(path: string): Promise<string[]> {
		return this.fs.promises.readdir(this.path.join(this.dir, path), 'utf-8');
	}
	public writeGranted(): Promise<boolean> {
		return Promise.resolve(true);
	}
}
