import { root } from '../state';
import { useAppState } from './state';

export function usePlayLoading() {
	return useAppState(state => state.gamesInfo.loading !== false);
}

export function usePlay() {
	return () => {
		root.loader.play(false);
	};
}