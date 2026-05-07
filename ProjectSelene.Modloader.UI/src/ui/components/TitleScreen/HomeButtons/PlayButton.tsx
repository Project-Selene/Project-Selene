import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gameManager } from '../../../../state/game-manager';
import { selectGameState, setGameState } from '../../../../state/game.store';
import { setPlayAnimation, setStatus } from '../../../../state/misc.store';
import { GameState } from '../../../../state/models/game';
import { store } from '../../../../state/state.reducer';
import { useIsLocal, useSupportsOpenFolder } from '../../../hooks/detect';
import { HomeButton } from './HomeButton';

export function PlayButton() {
	const gameState = useSelector(selectGameState);

	const playing = gameState === GameState.LOADING || gameState === GameState.PLAYING;
	const dispatch = useDispatch<typeof store.dispatch>();
	const supportsOpenFolder = useSupportsOpenFolder();
	const isLocal = useIsLocal();

	return <HomeButton title={'Play'} onClick={async () => {
		dispatch(setPlayAnimation(true));
		dispatch(setStatus({ status: 'Launching game...', visible: true, icon: 'loading' }));
		if (!isLocal) {
			dispatch(setGameState(GameState.OPENING));
		}
		try {
			await gameManager.getOrOpenGame();
			if (!isLocal) {
				dispatch(setGameState(GameState.PLAYING));
			}

			await gameManager.play(new URLSearchParams(window.location.search).get('dev') === 'true');
		} catch {
			dispatch(setStatus({ status: 'Failed to launch game.', visible: true, icon: 'error' }));
			if (!isLocal) {
				dispatch(setGameState(GameState.PROMPT));
			}
		} finally {
			dispatch(setPlayAnimation(false));
		}
	}} disabled={!supportsOpenFolder || playing} />;
}
