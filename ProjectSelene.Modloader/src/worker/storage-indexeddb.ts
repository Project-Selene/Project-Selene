import { Storage } from './storage';

export class StorageIndexedDB implements Storage {
	public constructor(
        public readonly base: string,
	) {}
	readFile(path: string): Promise<string> {
		throw new Error('Method not implemented.');
	}
	readDir(path: string): Promise<string[]> {
		throw new Error('Method not implemented.');
	}
	writeGranted(): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
    
}