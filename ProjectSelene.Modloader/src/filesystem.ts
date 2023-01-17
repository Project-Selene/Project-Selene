export class Filesystem {
	public game = '';
	public nwjs = '';
	public mods = '';
	public config = '';

	public async readFile(path: string): Promise<string> {
		return await (await fetch(path)).text();
	}

	public async writeFile(path: string, content: string): Promise<boolean> {
		return (await (await fetch(path, {
			method: 'POST',
			body: content,
			headers: {
				'X-SW-Command': 'writeFile',
			},
		})).json())?.success;
	}

	public async readDir(path: string): Promise<{name: string, isDir: boolean}[]> {
		return await (await fetch(path, {
			method: 'GET',
			headers: {
				'X-SW-Command': 'readDir',
			},
		})).json();
	}

	public async isWritable(path: string): Promise<boolean> {
		return await (await fetch(path, {
			method: 'GET',
			headers: {
				'X-SW-Command': 'isWritable',
			},
		})).json();
	}
}

export const filesystem = new Filesystem();