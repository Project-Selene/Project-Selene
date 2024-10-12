import { Box } from '@mui/material';
import { Background } from './Background/Background';
import { Character } from './Character/Character';
import { DevModHint } from './DevModHint';
import { HomeButtons } from './HomeButtons/HomeButtons';
import { InfoButton } from './InfoButton';
import { InfoDialog } from './InfoDialog';
import { ModsDialog } from './ModsDialog/ModsDialog';
import { OpenDialog } from './OpenDialog/OpenDialog';
import { OptionsDialog } from './OptionsDialog/OptionsDialog';
import { StatusNotification } from './StatusNotification';
import { Title } from './Title';

import React from 'react';

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
			<ModsDialog />
			<OptionsDialog />
			<OpenDialog />
			<InfoDialog />
			<InfoButton />
			<DevModHint />
			<StatusNotification />
		</Box>
	);
}
