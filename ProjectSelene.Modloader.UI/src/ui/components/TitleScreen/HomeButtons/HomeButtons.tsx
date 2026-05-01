import { Stack } from '@mui/material';
import React from 'react';
import { DownloadButton } from './DownloadButton';
import { ModsButton } from './ModsButton';
import { PlayButton } from './PlayButton';

import './HomeButtons.scss';

export function HomeButtons() {
	return (
		<div className="home-buttons">
			<Stack direction="column" spacing={1} sx={{ justifyContent: "start", marginTop: 3 }}>
				<PlayButton />
				<DownloadButton />
				<ModsButton />
			</Stack>
		</div>
	);
}
