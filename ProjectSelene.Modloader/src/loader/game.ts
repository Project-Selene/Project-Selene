import { filesystem } from './filesystem';

export class Game {
	private static nextId = 0;

	private constructor(
		private readonly id: number,
		private readonly mode: FileSystemPermissionMode
	) { }

	public static async fromFileHandle(handle: FileSystemDirectoryHandle, mode: FileSystemPermissionMode = 'readwrite') {
		const id = this.nextId++;
		await filesystem.mountDirectoryHandle('/fs/internal/game/' + id + '/', handle);
		return new Game(id, mode);
	}

	public static async fromLocalPath(path: string, mode: FileSystemPermissionMode = 'readwrite') {
		const id = this.nextId++;
		await filesystem.mountDirectoryFS('/fs/internal/game/' + id + '/', path);
		return new Game(id, mode);
	}

	public static async fromFileList(files: FileList) {
		const id = this.nextId++;
		await filesystem.mountFileList('/fs/internal/game/' + id + '/', files);
		return new Game(id, 'read');
	}

	public getGameId() {
		return this.id;
	}

	public async installModLoader() {
		if (this.mode === 'read') {
			throw new Error('Cannot install modloader in a readonly folder');
		}

		//Download
		await filesystem.mountHttp('/fs/internal/project-selene/', '//' + location.host + '/');
		const stream = await filesystem.openFile('/fs/internal/project-selene/project-selene.zip');
		await filesystem.writeFile('/fs/internal/game/' + this.id + '/project-selene.zip', stream);

		//Extract
		await filesystem.mountZip(
			'/fs/internal/game/' + this.id + '/project-selene/',
			'/fs/internal/game/' + this.id + '/project-selene.zip',
		);
		await this.copyFolder(
			'/fs/internal/game/' + this.id + '/project-selene/',
			'/fs/internal/game/' + this.id + '/',
		);

		//Cleanup
		await filesystem.delete('/fs/internal/game/' + this.id + '/project-selene.zip');
	}

	private async copyFolder(from: string, to: string) {
		const files = await filesystem.readDir(from);
		for (const file of files) {
			if (file.isDir) {
				await this.copyFolder(from + file.name + '/', to + file.name + '/');
			} else {
				const content = await filesystem.openFile(from + file.name);
				await filesystem.writeFile(to + file.name, content);
			}
		}
	}
}
