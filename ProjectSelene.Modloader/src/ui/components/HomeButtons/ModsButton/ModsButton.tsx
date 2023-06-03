import React from 'react';
import { loadMods } from '../../../../finder';
import { useAppCallback } from '../../../../hooks/state';
import { HomeButton } from '../HomeButton/HomeButton';

export function ModsButton() {
	const load = useAppCallback((state) => loadMods(state));

	return <HomeButton title="Mods" onClick={load} />;
}