import React from 'react';
import { HomeButton } from '../HomeButton/HomeButton';

export function ModsButton(props: {
	onModsOpen: () => void
}) {
	return <HomeButton title="Mods" onClick={props.onModsOpen} />;
}