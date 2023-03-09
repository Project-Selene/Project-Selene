import React from 'react';
import { useNeedsOpen } from '../../../../hooks/game';
import { useAppCallback } from '../../../../hooks/state';
import { openGame, playGame } from '../../../../loader';
import { HomeButton } from '../HomeButton/HomeButton';

export function PlayButton() {
	const needsOpen = useNeedsOpen();
	const open = useAppCallback(state => needsOpen ? openGame(state) : playGame(state));

	return <HomeButton title={needsOpen ? 'Open' : 'Play'} onClick={open} />;
}