import { RootState } from '../../src/state/state.reducer.js';
import { FileApi, setupDirectoryPicker } from './directory-picker.js';
import { loadStoreState } from './store.js';

let fileApi!: FileApi;

async function setupTest() {
	fileApi = await setupDirectoryPicker();
}

async function exeuteTestCommand(command: 'setup'): Promise<void>;
async function exeuteTestCommand(command: 'createFile', path: string, content: string): Promise<void>;
async function exeuteTestCommand(command: 'nextShowDirectoryPicker', folder?: string): Promise<void>;
async function exeuteTestCommand(command: 'loadStoreState', state: RootState['state']): Promise<void>;
async function exeuteTestCommand(
	command: 'setup' | 'createFile' | 'nextShowDirectoryPicker' | 'loadStoreState',
	...args: unknown[]
): Promise<void> {
	switch (command) {
		case 'setup':
			return setupTest();
		case 'createFile':
			return fileApi.createFile(args[0] as string, args[1] as string);
		case 'nextShowDirectoryPicker':
			return fileApi.nextShowDirectoryPicker(args[0] as string);
		case 'loadStoreState':
			return loadStoreState(args[0] as RootState['state']);
		default:
			throw new Error('unknown command: ' + command);
	}
}

Object.assign(globalThis, {
	sendTestCommand: args => {
		return exeuteTestCommand(args.command, ...args.args);
	},
});
