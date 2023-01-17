export interface Storage {
	readonly base: string;
    readFile(path: string): Promise<string>;
	readDir(path: string): Promise<string[]>;
	writeGranted(): Promise<boolean>;
}

export type StorageInfo = {
    fsType: 'fs',
    path: string,
    target: string,
} | {
    fsType: 'handles',
    path: string,
    target: FileSystemDirectoryHandle,
} | {
    fsType: 'indexed',
    path: string,
    target: string,
};