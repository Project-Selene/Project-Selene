import React from 'react';
import { usePlay, usePlayLoading } from '../../../hooks/game';
import { HomeButton } from '../HomeButton/HomeButton';

export function PlayButton() {
	const playLoading = usePlayLoading();
	const play = usePlay();

	return <HomeButton title={'Play'} onClick={play} loading={playLoading} />;
}