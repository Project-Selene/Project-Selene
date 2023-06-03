import React from 'react';
import { HomeButton } from '../HomeButton/HomeButton';

export function ModsButton() {
	// const load = useAppCallback((state) => loadMods(state));
	const load = () => 0;

	return <HomeButton title="Mods" onClick={load} />;
}