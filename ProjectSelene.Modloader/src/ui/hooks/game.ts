import { loader } from '../state/state.reducer';

export function usePlay() {
	return () => {
		loader.play(('DEV' in window && !!window.DEV) || !!new URLSearchParams(window.location.search).get('dev'));
	};
}