import { Box } from '@mui/material';
import { ModsDialog } from '../ModsDialog/ModsDialog';
import { OpenDialog } from '../OpenDialog/OpenDialog';
import { OptionsDialog } from '../OptionsDialog/OptionsDialog';
import { StatusNotification } from '../common/StatusNotification';
import { Character } from './Character/Character';
import { HomeButtons } from './HomeButtons/HomeButtons';
import { InfoButton } from './InfoButton';
import { InfoDialog } from './InfoDialog';
import { Background } from './Moon/Moon';
import { Title } from './Title';

import React from 'react';
import { Stars } from '../common/Stars';

export function TitleScreen() {
	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
			}}
		>
			<Title />
			<HomeButtons />
			<Character />
			<Background />
			<Stars />
			<ModsDialog />
			<OptionsDialog />
			<OpenDialog />
			<InfoDialog />
			<InfoButton />
			<StatusNotification />
		</Box>
	);
}
