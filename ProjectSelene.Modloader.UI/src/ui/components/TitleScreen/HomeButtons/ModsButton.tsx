import React from 'react';
import { useDispatch } from 'react-redux';
import { loadModsFromDb, setModsOpen } from '../../../../state/mod.store';
import { store } from '../../../../state/state.reducer';
import { HomeButton } from './HomeButton';

export function ModsButton() {
	const dispatch = useDispatch<typeof store.dispatch>();

	const onClick = () => {
		dispatch(setModsOpen(true));
		dispatch(loadModsFromDb());
	}

	return <HomeButton title="Mods" onClick={onClick} />;
}
