import React from 'react';
import { useDispatch } from 'react-redux';
import { setModsOpen } from '../../../../state/mod.store';
import { store } from '../../../../state/state.reducer';
import { HomeButton } from './HomeButton';

export function ModsButton() {
	const dispatch = useDispatch<typeof store.dispatch>();

	return <HomeButton title="Mods" onClick={() => dispatch(setModsOpen(true))} />;
}
