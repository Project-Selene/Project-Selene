import React from 'react';
import { useDispatch } from 'react-redux';
import { setModsOpen } from '../../../state/state.reducer';
import { HomeButton } from './HomeButton';

export function ModsButton() {
	const dispatch = useDispatch();

	return <HomeButton title="Mods" onClick={() => dispatch(setModsOpen(true))} />;
}
