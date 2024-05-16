import { FileApi, setupDirectoryPicker } from './directory-picker.js';

let fileApi!: FileApi;

async function setupTest() {
	fileApi = await setupDirectoryPicker();
}

async function exeuteTestCommand(command: 'setup'): Promise<void>;
async function exeuteTestCommand(command: 'createFile', path: string, content: string): Promise<void>;
async function exeuteTestCommand(command: 'nextShowDirectoryPicker', folder?: string): Promise<void>;
async function exeuteTestCommand(command: 'setup' | 'createFile' | 'nextShowDirectoryPicker', ...args: unknown[]): Promise<void> {
	switch (command) {
		case 'setup':
			return setupTest();
		case 'createFile':
			return fileApi.createFile(args[0] as string, args[1] as string);
		case 'nextShowDirectoryPicker':
			return fileApi.nextShowDirectoryPicker(args[0] as string);
		default:
			throw new Error('unknown command');
	}
}

Object.assign(globalThis, {
	sendTestCommand: (args) => {
		return exeuteTestCommand(args.command, ...args.args);
	},
});