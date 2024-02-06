import { Stack } from '@mui/material';
import React from 'react';
import { DownloadButton } from './DownloadButton/DownloadButton';

import './HomeButtons.scss';
import { ModsButton } from './ModsButton/ModsButton';
import { PlayButton } from './PlayButton/PlayButton';

export function HomeButtons() {
	return <div className="home-buttons">
		<Stack direction="column" spacing={1} justifyContent="start" className="mt-3">
			<PlayButton />
			<DownloadButton />
			<ModsButton />
		</Stack>
	</div>;
}