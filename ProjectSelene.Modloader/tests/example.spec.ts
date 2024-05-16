import { expect, test } from '@playwright/test';
import { setupTests } from './lib/setup';

const commands = setupTests();

test('open game directory', async ({ page }) => {
	await commands.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await commands.createFile(page, '/terra/terra/index-release.html', '<html><body><h1>hi</h1></body></html>');
	const fileChooserPromise = commands.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});

test('open game directory after mods dialog', async ({ page }) => {
	await page.getByRole('button', { name: 'Mods' }).click();
	await page.getByRole('button', { name: 'Close' }).click();
	await page.getByRole('button', { name: 'Play' }).click();
	await commands.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = commands.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	await page.locator('text=Play').waitFor({ state: 'visible', timeout: 1000 });
});

test('open game directory in mods dialog', async ({ page }) => {
	await commands.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await page.getByRole('button', { name: 'Mods' }).click();
	const fileChooserPromise = commands.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('heading').getByRole('button', { name: 'Open mods folder' }).click();
	await fileChooserPromise;
});

test('open game directory aborted', async ({ page }) => {
	await commands.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = commands.nextShowDirectoryPicker(page, '');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});