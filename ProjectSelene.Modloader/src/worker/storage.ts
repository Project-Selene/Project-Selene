export abstract class Storage {
	abstract readonly target: string;
	abstract readFile(path: string, response: WritableStream<Uint8Array>): Promise<boolean>;
	abstract readDir(path: string, response: WritableStream<Uint8Array>): Promise<boolean>;
    abstract writeGranted(response: WritableStream<Uint8Array>): Promise<boolean>;
	abstract writeFile(path: string, content: ReadableStream<Uint8Array>, response: WritableStream<Uint8Array>): Promise<boolean>;
    abstract stat(path: string, response: WritableStream<Uint8Array>): Promise<boolean>;
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
} | {
    fsType: 'link',
    path: string,
    target: string,
};