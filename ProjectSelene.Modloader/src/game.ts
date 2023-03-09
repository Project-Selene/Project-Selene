export class Game {
	constructor(
        public readonly key: number,
		public readonly version: string,
        public readonly handle: FileSystemDirectoryHandle,
	) {}
}