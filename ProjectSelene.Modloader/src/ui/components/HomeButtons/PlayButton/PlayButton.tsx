import React from 'react';
import { useSupportsOpenFolder } from '../../../hooks/detect';
import { usePlay, usePlayLoading } from '../../../hooks/game';
import { HomeButton } from '../HomeButton/HomeButton';

export function PlayButton() {
	const playLoading = usePlayLoading();
	const play = usePlay();
	const supportsOpenFolder = useSupportsOpenFolder();

	return <HomeButton title={'Play'} onClick={play} loading={playLoading} disabled={!supportsOpenFolder} />;
}