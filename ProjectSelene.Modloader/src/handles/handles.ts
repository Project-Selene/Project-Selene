import * as idb from 'idb-keyval';

const gameStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

export interface StoredGamesInfo {
	handles: Record<number, FileSystemDirectoryHandle>;
}

export class Handles {
	private info?: StoredGamesInfo;

	private async getHandles() {
		if (!this.info) {
			this.info = await idb.get('handles', gameStore) ?? { handles: {} };
		}

		return this.info.handles;
	}

	private async save() {
		await idb.set('handles', this.info, gameStore);
	}

	public async load() {
		await this.getHandles();
	}

	public async get(id: number) {
		return (await this.getHandles())[id];
	}

	public async set(id: number, handle: FileSystemDirectoryHandle) {
		(await this.getHandles())[id] = handle;
		await this.save();
	}

	public async queryPermission(id: number, descriptor: FileSystemHandlePermissionDescriptor, hasAtLeast: PermissionState) {
		const handle = await this.get(id);
		if (!handle) {
			return false;
		}

		const state = await handle.queryPermission(descriptor);
		switch (hasAtLeast) {
			case 'denied':
				return true;
			case 'prompt':
				return state === 'prompt' || state === 'granted';
			case 'granted':
				return state === 'granted';
			default:
				throw new Error('Invalid state');
		}
	}

	public async getWithPermission(id: number, descriptor: FileSystemHandlePermissionDescriptor) {
		const handle = await this.get(id);
		if (!handle) {
			throw new Error('No handle');
		}

		const state = await handle.queryPermission(descriptor);
		switch (state) {
			case 'granted':
				return handle;
			case 'prompt':
				if (await handle.requestPermission(descriptor) !== 'granted') {
					throw new Error('Permission denied');
				}
				return handle;
			case 'denied':
				throw new Error('Permission denied');
			default:
				throw new Error('Invalid state');
		}
	}

	public async requestPermission(id: number, descriptor: FileSystemHandlePermissionDescriptor) {
		const handle = await this.get(id);
		if (!handle) {
			return false;
		}

		const state = await handle.queryPermission(descriptor);
		switch (state) {
			case 'granted':
				return true;
			case 'prompt':
				return await handle.requestPermission(descriptor) === 'granted';
			case 'denied':
				return false;
			default:
				return false;
		}
	}
}