import { test } from '@playwright/test';
import { BuildContext, BuildOptions } from 'esbuild';
import * as commands from './commands';
import { serve } from './serve';

export function setupTests() {
	let esbuildContext: BuildContext<BuildOptions>;
	let url: string;

	test.beforeAll(async () => {
		const result = await serve();
		esbuildContext = result.context;
		url = result.url;
	});

	test.beforeEach(async ({ page }) => {
		await page.addInitScript({
			path: 'build/test-runtime.js',
		});
		await page.goto(url);
		await commands.setup(page);
	});

	test.afterAll(async () => {
		await esbuildContext.dispose();
	});

	return commands;
}