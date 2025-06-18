import { terra } from '../game-proxy.js';
import { Injectable } from '../inject.js';

declare let XG_GAME_DEBUG: boolean;

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

export function reloadAssetsOnChange() {
	__projectSelene.devMod.afterMain = mod => {
		mod.inject(AssetChangeEvents);
	};

	__projectSelene.devMod.watchers ??= new Map<string, () => void>();
	window['require']('fs').watch = function(name: string, callback: () => void) {
		name = name.replace(/\\/g, '/').replace(/[/]+/g, '/');
		__projectSelene.devMod.watchers.set(name, callback);
		return { close() { __projectSelene.devMod.watchers.delete(name); } };
	};
    
	const esAssets = new EventSource('http://localhost:8182/asset-changes');
	esAssets.addEventListener('change', async (ev) => {
		const files: string[] = JSON.parse(ev.data);
		await __projectSelene.devMod.registerPatches(files.map(target => ({ type: 'json', target })));
		for (const file of files) {
			console.log('reloading', file);
			__projectSelene.devMod.watchers.get(file)?.();
		}
	});
	esAssets.addEventListener('remove', async (ev) => {
		const files: string[] = JSON.parse(ev.data);

		await __projectSelene.devMod.unregisterPatches(files.map(target => ({ type: 'json', target })));
		for (const file of files) {
			console.log('reloading', file);
			__projectSelene.devMod.watchers.get(file)?.();
		}
	});

	return esAssets;
}