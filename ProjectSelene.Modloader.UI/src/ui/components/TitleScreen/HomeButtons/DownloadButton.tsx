import { ButtonGroup } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { gameManager } from '../../../../state/game-manager';
import { store } from '../../../../state/state.reducer';
import { HomeButton } from './HomeButton';

export function DownloadButton() {
	const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<ButtonGroup className="home-button-group">
			<HomeButton title="Download" href="project-selene.zip" />
			<HomeButton title="Install" onClick={() => gameManager.getOrOpenGame().then(game => game.installModLoader())} />
		</ButtonGroup>
	);
}
