import { test } from '@playwright/test';
import * as commands from './commands';

export function setupTests() {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript({
			path: 'build/test-runtime.js',
		});
		await page.goto('http://127.0.0.1:8082/');
		await commands.setup(page);
	});

	return commands;
}