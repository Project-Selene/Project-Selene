import React from 'react';
import { useSelector } from 'react-redux';
import { useSupportsOpenFolder } from '../../../hooks/detect';
import { usePlay } from '../../../hooks/game';
import { selectGamesLoaded } from '../../../state/state.reducer';
import { HomeButton } from '../HomeButton/HomeButton';

export function PlayButton() {
	const playLoaded = useSelector(selectGamesLoaded);
	const play = usePlay();
	const supportsOpenFolder = useSupportsOpenFolder();

	return <HomeButton title={'Play'} onClick={play} loading={!playLoaded} disabled={!supportsOpenFolder} />;
}