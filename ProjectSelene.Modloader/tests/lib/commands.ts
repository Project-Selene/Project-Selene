import { Page } from '@playwright/test';

export async function sendTestCommand(page: Page, command: 'setup'): Promise<void>;
export async function sendTestCommand(page: Page, command: 'createFile', path: string, content: string): Promise<void>;
export async function sendTestCommand(page: Page, command: 'nextShowDirectoryPicker', folder?: string): Promise<void>;
export async function sendTestCommand(page: Page, command: 'setup' | 'createFile' | 'nextShowDirectoryPicker', ...args: unknown[]): Promise<void> {
	await page.evaluate(`globalThis.sendTestCommand(${JSON.stringify({ command, args })})`);
}

export function setup(page: Page) {
	return sendTestCommand(page, 'setup');
}
export function createFile(page: Page, path: string, content: string) {
	return sendTestCommand(page, 'createFile', path, content);
}
export function nextShowDirectoryPicker(page: Page, path: string) {
	return sendTestCommand(page, 'nextShowDirectoryPicker', path);
}
