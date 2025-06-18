import { Box } from '@mui/material';

import React from 'react';
import { StatusNotification } from './common/StatusNotification';
import { LoadingScreen } from './LoadingScreen/LoadingScreen';
import { ModsDialog } from './ModsDialog/ModsDialog';
import { OptionsDialog } from './OptionsDialog/OptionsDialog';
import { TitleScreen } from './TitleScreen/TitleScreen';

export function Main() {
	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100vw',
				height: '100vh',
				overflow: 'hidden',
			}}
		>
			<TitleScreen />
			<ModsDialog />

			<OptionsDialog />
			<StatusNotification />
			<LoadingScreen />
		</Box>
	);
}
