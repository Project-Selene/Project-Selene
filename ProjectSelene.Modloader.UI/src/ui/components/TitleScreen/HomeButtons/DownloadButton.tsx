import { ButtonGroup } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { gameManager } from '../../../../state/game-manager';
import { setStatus } from '../../../../state/misc.store';
import { store } from '../../../../state/state.reducer';
import { HomeButton } from './HomeButton';

export function DownloadButton() {
	const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<ButtonGroup className="home-button-group">
			<HomeButton title="Download" href="project-selene.zip" />
			<HomeButton title="Install" onClick={async () => {
				dispatch(setStatus({ status: 'Installing modloader...', visible: true, icon: 'loading' }));
				try {
					const game = await gameManager.openGameDirectory('readwrite');
					await game.installModLoader();
					dispatch(setStatus({ status: 'Modloader installed successfully!', visible: true, icon: 'success' }));
				} catch {
					dispatch(setStatus({ status: 'Failed to install modloader.', visible: true, icon: 'error' }));
				}
			}} />
		</ButtonGroup>
	);
}
