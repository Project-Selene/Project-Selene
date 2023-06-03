
// export function useNeedsOpen() {
// 	return useAppState(state => state.games?.data?.games?.[state.games?.data.selectedGame].success);
// }
import { createDraft } from 'immer';
import { root } from '../state';
import { useAppState } from './state';

export function usePlayLoading() {
	return useAppState(state => state.gamesInfo.loading !== false);
}

export function usePlay() {
	return () => {
		root.loader.play(createDraft(root.state));
	};
}