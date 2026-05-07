import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gameManager } from '../../../../state/game-manager';
import { selectGameState } from '../../../../state/game.store';
import { setPlayAnimation, setStatus } from '../../../../state/misc.store';
import { GameState } from '../../../../state/models/game';
import { store } from '../../../../state/state.reducer';
import { useSupportsOpenFolder } from '../../../hooks/detect';
import { HomeButton } from './HomeButton';

export function PlayButton() {
	const gameState = useSelector(selectGameState);

	const playing = gameState === GameState.LOADING || gameState === GameState.PLAYING;
	const dispatch = useDispatch<typeof store.dispatch>();
	const supportsOpenFolder = useSupportsOpenFolder();

	return <HomeButton title={'Play'} onClick={async () => {
		dispatch(setPlayAnimation(true));
		dispatch(setStatus({ status: 'Launching game...', visible: true, icon: 'loading' }));
		try {
			await gameManager.play(new URLSearchParams(window.location.search).get('dev') === 'true');
		} catch {
			dispatch(setStatus({ status: 'Failed to launch game.', visible: true, icon: 'error' }));
		} finally {
			dispatch(setPlayAnimation(false));
		}
	}} disabled={!supportsOpenFolder || playing} />;
}
