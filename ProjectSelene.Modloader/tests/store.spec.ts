import 'fake-indexeddb/auto';

import { expect, test } from '@playwright/test';
import { LoginType } from '../src/moddb/generated';
import { Mod } from '../src/state/models/mod';
import type { RootState } from '../src/state/state.reducer';
import * as actions from '../src/state/state.reducer';
import { setupTests } from './lib/setup';

const commands = setupTests();

const initial = actions.store.getState().state;
const filled: actions.RootState['state'] = {
	gamesInfo: {
		games: [
			{
				id: 1,
				loaded: true,
				path: '',
				type: 'fs',
			},
		],
		selectedGame: 1,
	},
	modDb: {
		mods: {
			data: [
				{
					id: '1',
					name: 'Test Mod',
					description: 'Test Description',
					version: '1.0.0',
					versions: ['1.0.0'],
				},
				{
					id: '2',
					name: 'Test Mod 2',
					description: 'Test Description 2',
					version: '1.1.0',
					versions: ['1.1.0'],
				},
				{
					id: '3',
					name: 'Test Mod 3',
					description: 'Test Description 3',
					version: '1.2.0',
					versions: ['1.2.0'],
				},
			],
			loading: false,
		},
	},
	devMod: {},
	mods: {
		data: {
			mods: [
				{
					currentInfo: {
						id: '3',
						name: 'Test Mod 3',
						description: 'Test Description 3',
						version: '1.2.0',
						versions: ['1.2.0'],
					},
					enabled: true,
					filename: 'mod3.mod.zip',
					internalName: '1',
				},
				{
					currentInfo: {
						id: '4',
						name: 'Test Mod 4',
						description: 'Description 4',
						version: '1.3.0',
						versions: ['1.3.0'],
					},
					enabled: true,
					filename: 'mod3.mod.zip',
					internalName: '2',
				},
				{
					currentInfo: {
						id: '5',
						name: 'X Test Mod 5',
						description: 'Y Description 5',
						version: '1.3.0',
						versions: ['1.3.0'],
					},
					enabled: true,
					filename: 'mod3.mod.zip',
					internalName: '3',
				},
			],
		},
		loading: false,
	},
	options: {
		mods: {},
	},
	ui: {
		mods: {
			open: false,
			search: '',
			availableOpen: true,
			installedOpen: true,
		},
		options: {
			open: false,
			seleneOptionsExpanded: false,
			modsExpanded: {},
		},
		openOpen: false,
		playing: false,
		infoOpen: false,
	},
	user: {
		avatarUrl:
			'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAC0UExURf////Pz87Ozs4ODg1hYWDQ0NCAgIAQEBAAAAOPj44+Pj0BAQL+/v0xMTKenpxAQEPv7+2xsbEREROfn5ywsLCgoKDw8PLe3t4uLi6+vr1RUVDAwMHx8fO/v7zg4ON/f31BQUEhISAwMDJ+fn5eXl1xcXMvLy6urq2BgYAgICH9/f5OTk8fHx+vr69PT03h4eHBwcNfX1/f39xgYGGRkZHR0dIeHhxQUFMPDwxwcHM/Pz2hoaNNTm7YAAAAJcEhZcwAADsMAAA7DAcdvqGQAAANQSURBVHhe7drZQuIwGAVgtm6UpVAVaBEEHRY3xtHRceb932uKHEGQ0uTPn/Ym35Vic1JLtrYpGYZhGIZhGAZVuVKtWbbjuo5t1aqVMj7OiVf3k6q/cvy6hz/q12ge1L7hNBs4QK+GjwqP8PWfgldDXSlqmr+IVhsVpWq3cKgOQQe1nNQJcDi7chdVZOhq6pPhGSrIdBaiCKuycP2ue67hGgSC13+jy98OhNrfTgfF2LQQLIy5N3qZ/f9Qm3dEyhj/jqmhKIsGQqVwzgsn5p90FyjMgHQBXLeH4uqaSJTURHFl3tH1hwCujlBHnrQ+AlSRmuAaUzMsU78B1+GZkyqIIxggQk0VaQRVRKghDMOfIkSosZBGYCFCjY00AhsRasidIIEINcgiQYQaZJEgQg2ySBChpvBGqNANY0SoiZBGwDMQDZFGMESEmgHSCHgmo0v6SHSJCEUXiJM2QoAq8nzMMxsni1LkSRsjQJnUnflOF8XV9ZAoie/GpBQjUgrPMLhBugQVFGZxhVAJExTlIf+AYsrWBTaukSvsBgXZ/ECwINbnIx/KUssCS8ODwvAc4QLOtTwqFT8DPfUnZyD4LVia6k/agdBtYk3nC6ybKWpJNWXvf/vGE1SUYsI8/hxROTEzxazjf6peyvqgyzj/ZhhXR6h0a1TVf/H3XA6GUfxx12bH0XDAtP41DMMwDBHebF4fLq782F7vIlpb2nbsR4vbu8H9Aw7SInicr6I4Y002taLbuYaJORz8HGUuB3fa/mrOtzR+aC0k7kl24s6cYX381P+29pHgdO+Uvg7vlvRoZN+oTmyZv64PN6yRTebyW0rClfQjiVOeh3KLxscF1z+/tXwRbw1PCm8KT3AWYqcQvrD/95+c39ntMXiVGG/kvWXdus4Y+t1pF0+o6pigqu3q7yz7qX0yJL8YkNNMmSb+vOEA7d7/oso9rSX+nIPpkZdJ5J0qJM633pBv/Yk7VAzSj4KVOXv7/Xo5dL9DzpfNbmPWmU/U83ajVZBT/z+0fan1ig9yh61eYY4DwL7pZkh8wa8F+Leu3yvsAiQT0/oSrPBLIdYbDN7xcyHsUukePxZkVlwf3OhT3olyikqk+04+ZyWti+BsbaWNWhwKPgHX/Q+2weKkPg9r1gAAAABJRU5ErkJggg==',
		loginType: LoginType.GITHUB,
		name: 'Test User',
	},
};

const devMod: Mod = {
	currentInfo: {
		description: 'Dev Mod Description',
		id: 'dev',
		name: 'Dev Mod',
		version: '1.0.0',
		versions: ['1.0.0'],
	},
	internalName: '',
	filename: '',
	enabled: true,
};

const all: Action[] = [
	{
		action: actions.loadState(initial),
	},
	{
		action: actions.loadState(filled),
	},
	{
		action: actions.setModsOpen(true),
	},
	{
		action: actions.setModsOpen(false),
	},
	{
		action: actions.setInfoOpen(true),
	},
	{
		action: actions.setInfoOpen(false),
	},
	{
		action: actions.play.pending(''),
	},
	{
		action: actions.openDirectory.pending(''),
	},
	{
		action: actions.toggleModsAvailable(),
		prepare: [actions.setModsOpen(true)],
	},
	{
		action: actions.toggleModsAvailable(),
		prepare: [actions.setModsOpen(true), actions.toggleModsAvailable()],
	},
	{
		action: actions.setModsOpen(true),
		prepare: [actions.loadState(filled)],
	},
	{
		action: actions.toggleModsAvailable(),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.toggleModsInstalled(),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.toggleModsAvailable(),
		prepare: [actions.loadState(filled), actions.setModsOpen(true), actions.toggleModsInstalled()],
	},
	{
		action: actions.setOptionsOpen(true),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.toggleSeleneOptionsExpanded(),
		prepare: [actions.loadState(filled), actions.setModsOpen(true), actions.setOptionsOpen(true)],
	},
	{
		action: actions.toggleSeleneOptionsExpanded(),
		prepare: [
			actions.loadState(filled),
			actions.setModsOpen(true),
			actions.setOptionsOpen(true),
			actions.toggleSeleneOptionsExpanded(),
		],
	},
	{
		action: actions.openDirectory.pending(''),
		prepare: [
			actions.loadState(filled),
			actions.setModsOpen(true),
			actions.setOptionsOpen(true),
			actions.toggleSeleneOptionsExpanded(),
		],
	},
	{
		action: actions.toggleModOptionsExpanded('3'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true), actions.setOptionsOpen(true)],
	},
	{
		action: actions.toggleModOptionsExpanded('3'),
		prepare: [
			actions.loadState(filled),
			actions.setModsOpen(true),
			actions.setOptionsOpen(true),
			actions.toggleModOptionsExpanded('3'),
		],
	},
	{
		action: actions.setModEnabled({ id: '3', enabled: false }),
		prepare: [
			actions.loadState(filled),
			actions.setModsOpen(true),
			actions.setOptionsOpen(true),
			actions.toggleModOptionsExpanded('3'),
		],
	},
	{
		action: actions.searchForMod('mo'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('mod test'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('de esc cript'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('2'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('2 3'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('DESCRIPTION'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('x test'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.searchForMod('y desc'),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
	},
	{
		action: actions.foundDevMod(devMod),
	},
	{
		action: actions.foundDevMod(devMod),
		prepare: [actions.loadState(filled), actions.setModsOpen(true)],
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

	actions.store.dispatch(actions.loadState(initial));
	if (prepare) {
		for (const prep of prepare) {
			actions.store.dispatch(prep);
		}
	}
	actions.store.dispatch(action);

	const filename = name ?? action.type.replace(/\//g, '_');
	checkScreenshot(actions.store.getState().state, (i + 1).toString().padStart(3, '0') + '_' + filename);
}

function checkScreenshot(state: RootState['state'], name: string) {
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
