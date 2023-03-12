import React from 'react';
import { useAppCallback } from '../../../../hooks/state';
import { loadMods } from '../../../../mods';
import { HomeButton } from '../HomeButton/HomeButton';

export function ModsButton() {
	const load = useAppCallback(() => loadMods());

	return <HomeButton title="Mods" onClick={load} />;
}