import 'fake-indexeddb/auto';

import { expect, test } from '@playwright/test';
import { createAction } from '@reduxjs/toolkit';
import * as game from '../src/state/game.store';
import * as misc from '../src/state/misc.store';
import * as mod from '../src/state/mod.store';
import type { RootState } from '../src/state/state.reducer';
import * as actions from '../src/state/state.reducer';
import { setupTests } from './lib/setup';

const commands = setupTests();

const initial = actions.store.getState();
const filled: actions.RootState = {
	game: {
		games: [
			{
				id: 1,
				loaded: true,
				path: '',
				type: 'fs',
			},
		],
		selectedGame: 1,
		installedMods: {
			"1": {
				loading: false,
				data: [
					{
						id: '3',
						name: 'Test Mod 3',
						description: 'Test Description 3',
						version: '1.2.0',
					},
					{
						id: '4',
						name: 'Test Mod 4',
						description: 'Description 4',
						version: '1.3.0',
					},
					{
						id: '5',
						name: 'X Test Mod 5',
						description: 'Y Description 5',
						version: '1.3.0',
					},
				],
			}
		},
		loading: false,
		opening: false,
		playing: false,
	},
	mod: {
		mods: {
			loading: false, data: [
				{
					id: '1',
					name: 'Test Mod',
					description: 'Test Description',
					version: '1.0.0',
					versions: ['1.0.0'],
					author: '',
				},
				{
					id: '2',
					name: 'Test Mod 2',
					description: 'Test Description 2',
					version: '1.1.0',
					versions: ['1.1.0'],
					author: '',
				},
				{
					id: '3',
					name: 'Test Mod 3',
					description: 'Test Description 3',
					version: '1.2.0',
					versions: ['1.2.0'],
					author: '',
				},
			]
		},
		dialogOpen: false,
		search: '',
	},
	misc: {
		infoOpen: false,
	},
};

const loadState = createAction<actions.RootState>('loadState');

const all: Action[] = [
	{
		action: loadState(initial),
	},
	{
		action: loadState(filled),
	},
	{
		action: mod.setModsOpen(true),
	},
	{
		action: mod.setModsOpen(false),
	},
	{
		action: misc.setInfoOpen(true),
	},
	{
		action: misc.setInfoOpen(false),
	},
	{
		action: game.play.pending(''),
	},
	{
		action: game.openDirectory.pending(''),
	},
	{
		action: mod.setModsOpen(true),
		prepare: [loadState(filled)],
	},
	{
		action: mod.searchForMod('mo'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('mod test'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('de esc cript'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('2'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('2 3'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('DESCRIPTION'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('x test'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
	{
		action: mod.searchForMod('y desc'),
		prepare: [loadState(filled), mod.setModsOpen(true)],
	},
];

interface Action {
	name?: string;
	action: { payload: unknown; type: string };
	prepare?: { payload: unknown; type: string }[];
}

test.describe.configure({ mode: 'parallel' });


for (let i = 0; i < all.length; i++) {
	const testAction = all[i];
	const { action, prepare, name } = testAction;

	actions.store.dispatch(loadState(initial));
	if (prepare) {
		for (const prep of prepare) {
			actions.store.dispatch(prep);
		}
	}
	actions.store.dispatch(action);

	const filename = name ?? action.type.replace(/\//g, '_');
	checkScreenshot(actions.store.getState(), (i + 1).toString().padStart(3, '0') + '_' + filename);
}

function checkScreenshot(state: RootState, name: string) {
	test('screenshot for state ' + name, async ({ page }) => {
		await commands.loadStoreState(page, state);
		await page.waitForLoadState('domcontentloaded');
		await new Promise(resolve => setTimeout(resolve, 100));
		const locators = await page.locator('//img').all();
		await Promise.all(
			locators.map(l =>
				l.evaluate((e: HTMLImageElement) => e.complete || new Promise(resolve => (e.onload = resolve))),
			),
		);

		await page.evaluate(
			() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
		);
		await new Promise(resolve => setTimeout(resolve, 100));
		try {
			await expect(page).toHaveScreenshot(name + '.png');
		} catch {
			await new Promise(resolve => setTimeout(resolve, 10000));
			await expect(page).toHaveScreenshot(name + '.png');
		}
	});
}
