import { root } from '../state';
import { useAppState } from './state';

export function usePlayLoading() {
	return useAppState(state => state.gamesInfo.loading !== false);
}

export function usePlay() {
	return () => {
		root.loader.play(('DEV' in window && !!window.DEV) || !!new URLSearchParams(window.location.search).get('dev'));
	};
}