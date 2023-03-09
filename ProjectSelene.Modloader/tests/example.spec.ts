import { expect, test } from '@playwright/test';
import { serve } from './serve.spec';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		window.showDirectoryPicker = async (options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle> => {
			console.log(options);
			return {
			} as FileSystemDirectoryHandle;
		};
	});
	await serve();
});


test('open game directory', async ({ page }) => {
	test.setTimeout(0);
	await page.goto('http://localhost:8081/');
	const fileChooserPromise = page.waitForEvent('console');
	await page.getByRole('button', { name: 'Open' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});
