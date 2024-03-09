import { Browser, Page, expect, test } from '@playwright/test';
import type { BuildContext, BuildOptions } from 'esbuild';
import * as fileApi from './lib/file-api';
import { serve } from './lib/serve';

let esbuildContext: BuildContext<BuildOptions>;
let url: string;

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
	const result = await serve();
	esbuildContext = result.context;
	url = result.url;
});

test.beforeEach(async ({ browserName, context }) => {
	browser = await context.browser()!.browserType().launch();
	page = await browser.newPage();
	await page.addInitScript(fileApi.mockFileApi(browserName));
});

test.afterEach(async () => {
	await page.close();
	await browser.close();
});

test.afterAll(async () => {
	await esbuildContext.dispose();
});


test('open game directory', async () => {
	await page.goto(url);
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await fileApi.createFile(page, '/terra/terra/index-release.html', '<html><body><h1>hi</h1></body></html>');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});

test('open game directory after mods dialog', async () => {
	await page.goto(url);
	await page.getByRole('button', { name: 'Mods' }).click();
	await page.getByRole('button', { name: 'Close' }).click();
	await page.getByRole('button', { name: 'Play' }).click();
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	await page.locator('text=Play').waitFor({ state: 'visible', timeout: 1000 });
});

test('open game directory in mods dialog', async () => {
	await page.goto(url);
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	await page.getByRole('button', { name: 'Mods' }).click();
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '/terra');
	await page.getByRole('heading').getByRole('button', { name: 'Open mods folder' }).click();
	await fileChooserPromise;
});

test('open game directory aborted', async () => {
	await page.goto(url);
	await fileApi.createFile(page, '/terra/terra/dist/bundle.js', 'console.log("hi")');
	const fileChooserPromise = fileApi.nextShowDirectoryPicker(page, '');
	await page.getByRole('button', { name: 'Play' }).click();
	await fileChooserPromise;
	expect(await page.getByRole('button', { name: 'Play' }).elementHandle()).toBeTruthy();
});