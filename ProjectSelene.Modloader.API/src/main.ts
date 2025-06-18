import { reloadAssetsOnChange } from './internal/asset-change.js';
import { waitForCodeChange } from './internal/code-change.js';
import { IsDevelopment } from './internal/consts.js';

export { terra } from './game-proxy.js';
export { Injectable } from './inject.js';
export { IsDevelopment } from './internal/consts.js';
export { Mod } from './mod.js';


if (IsDevelopment) {
	const watcher = reloadAssetsOnChange();
	waitForCodeChange().then(() => {
		watcher.close();
		__projectSelene.devMod.hotreload();
	});
}