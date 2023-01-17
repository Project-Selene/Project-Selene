let db!: IDBDatabase;

async function open() {
	if (db) {
		return db;
	}
	db = await new Promise<IDBDatabase>((resolve, reject) => {
		const request = window.indexedDB.open('SeleneDB', 1);
		request.onerror = () => {
			reject(request.error);
		};
		request.onsuccess = () => {
			resolve(request.result);
		};
		request.onupgradeneeded = () => {
			const db = request.result;

			const gameHandles = db.createObjectStore('gameHandles', { keyPath: 'id', autoIncrement: true });

			gameHandles.createIndex('handle', 'handle', { unique: false });
			gameHandles.createIndex('writable', 'handle', { unique: false });
		};
	}); 
	return db;   
}

export async function storeFolderHandle(handle: FileSystemDirectoryHandle, writable: boolean, id?: number) {
	const db = await open();
	await new Promise((resolve, reject) => {
		const transaction = db.transaction('gameHandles', 'readwrite');
		const store = transaction.objectStore('gameHandles');
		if (id === undefined) {
			store.put({
				handle,
				writable,
			});
		} else {
			store.add({
				id,
				handle,
				writable,
			});
		}

		transaction.oncomplete = resolve;
		transaction.onerror = reject;
	});
}

export async function getFolderHandles() {
	const db = await open();
	return await new Promise<{ 
		handle: FileSystemDirectoryHandle,
		writable: boolean, 
		id: number
	}[]>((resolve, reject) => {
		const request = db.transaction('gameHandles', 'readonly')
			.objectStore('gameHandles')
			.getAll();

		request.onsuccess = () => resolve(request.result);
		request.onerror = reject;
	});
}