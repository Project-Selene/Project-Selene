import { useCallback } from 'react';

import * as game from '../loader/game';
import { useIsLocal, useSupportsOpenFolder } from './detect';

export function useStartText() {
	return useIsLocal() ? 'Start' : 'Open';
}

export function useStartDisabled() {
	return !useIsLocal() && !useSupportsOpenFolder();
}

export function useOnStart() {
	const isLocal = useIsLocal();

	return useCallback(async () => {
		if (isLocal) {
			throw new Error('Not implemented');
		} else {
			const gameInstance = await game.openInBrowser();
			gameInstance.start();
		}
	}, []);
}