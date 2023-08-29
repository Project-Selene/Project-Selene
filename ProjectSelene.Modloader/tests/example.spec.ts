import { expect, test } from '@playwright/test';
import * as fileApi from './lib/file-api';
import { serve } from './lib/serve';

test.beforeEach(async ({ page, browserName }) => {
	await page.addInitScript(fileApi.mockFileApi(browserName));
	await serve();

});


test('open game directory', async ({ page }) => {
	test.setTimeout(0);
	await page.goto('http://localhost:8081/');
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await fileApi.createFile(page, '/terra/terra/index-release.html', '<html><body><h1>hi</h1></body></html>');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});

test('open game directory after mods dialog', async ({ page }) => {
	test.setTimeout(0);
	await page.goto('http://localhost:8081/');
	await page.getByRole('button', { name: 'Mods' }).click();
	await page.getByRole('button', { name: 'Close' }).click();
	await page.getByRole('button', { name: 'Play' }).click();
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});

test('open game directory in mods dialog', async ({ page }) => {
	test.setTimeout(0);
	await page.goto('http://localhost:8081/');
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await page.getByRole('button', { name: 'Mods' }).click();
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('heading').getByRole('button', { name: 'Open mods folder' }).click();
	await fileChooserPromise;
});

test('open game directory aborted', async ({ page }) => {
	test.setTimeout(0);
	await page.goto('http://localhost:8081/');
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});