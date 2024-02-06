import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSupportsOpenFolder } from '../../../hooks/detect';
import { play, selectPlaying, store } from '../../../state/state.reducer';
import { HomeButton } from '../HomeButton/HomeButton';

export function PlayButton() {
	const dispatch = useDispatch<typeof store.dispatch>();
	const playing = useSelector(selectPlaying);
	const supportsOpenFolder = useSupportsOpenFolder();

	return <HomeButton title={'Play'} onClick={() => dispatch(play())} disabled={!supportsOpenFolder || playing} />;
}