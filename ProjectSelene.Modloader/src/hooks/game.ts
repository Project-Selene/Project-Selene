import { useAppState } from './state';

export function useNeedsOpen() {
	const games = useAppState(state => state.games);

	return games.loading 
    || games.loading === undefined
    || !games.success
    || games.data.games.length === 0;
}