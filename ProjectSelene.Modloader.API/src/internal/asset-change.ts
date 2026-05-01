import { terra } from '../game-proxy.js';
import { Injectable } from '../inject.js';

declare let XG_GAME_DEBUG: boolean;

export function reloadAssetsOnChange() {
	class AssetChangeEvents extends Injectable(terra.FileWatcher) {
		watchFile(...args: unknown[]) {
			const original = XG_GAME_DEBUG;
			XG_GAME_DEBUG = true;
			const result = super.watchFile(...args);
			XG_GAME_DEBUG = original;
			return result;
		}
		unwatchFile(...args: unknown[]) {
			const original = XG_GAME_DEBUG;
			XG_GAME_DEBUG = true;
			const result = super.unwatchFile(...args);
			XG_GAME_DEBUG = original;
			return result;
		}
		startFileWatching(...args: unknown[]) {
			const original = XG_GAME_DEBUG;
			XG_GAME_DEBUG = true;
			const result = super.startFileWatching(...args);
			XG_GAME_DEBUG = original;
			return result;
		}
	}

	if (!__projectSelene.devMod) {
		throw new Error('Dev mod is not enabled. Make sure to enable it in the config and restart the game.');
	}
	const devMod = __projectSelene.devMod;

	__projectSelene.devMod.afterMain = mod => {
		mod.inject(AssetChangeEvents);
	};

	__projectSelene.devMod.watchers ??= new Map<string, () => void>();
	window['require']('fs').watch = function (name: string, callback: () => void) {
		name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
		devMod.watchers?.set(name, callback);
		return { close() { devMod.watchers?.delete(name); } };
	};

	const esAssets = new EventSource('http://localhost:8182/asset-changes');
	esAssets.addEventListener('change', async (ev) => {
		const files: string[] = JSON.parse(ev.data);
		await devMod.registerPatches(files.map(target => ({ type: 'json', target })));
		for (const file of files) {
			console.log('reloading', file);
			devMod.watchers?.get(file)?.();
		}
	});
	esAssets.addEventListener('remove', async (ev) => {
		const files: string[] = JSON.parse(ev.data);

		await devMod.unregisterPatches(files.map(target => ({ type: 'json', target })));
		for (const file of files) {
			console.log('reloading', file);
			devMod.watchers?.get(file)?.();
		}
	});

	return esAssets;
}