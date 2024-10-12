import { Stack } from '@mui/material';
import React from 'react';
import { DownloadButton } from './DownloadButton';

import { theme } from '../../theme';
import './HomeButtons.scss';
import { ModsButton } from './ModsButton';
import { PlayButton } from './PlayButton';

export function HomeButtons() {
	return (
		<div className="home-buttons">
			<Stack direction="column" spacing={1} justifyContent="start" sx={{ marginTop: theme.spacing(3) }}>
				<PlayButton />
				<DownloadButton />
				<ModsButton />
			</Stack>
		</div>
	);
}
