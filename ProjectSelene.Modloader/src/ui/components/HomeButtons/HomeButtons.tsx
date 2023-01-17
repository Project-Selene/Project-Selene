import { Stack } from '@mui/material';
import React from 'react';
import { useOnStart } from '../../hooks/buttons';
import { HomeButton } from '../HomeButton/HomeButton';

import './HomeButtons.scss';

export function HomeButtons() {
	// const jsAvailable = useJSAvailable();
	// const isLocal = useIsLocal();
	// const download = useDownloadLoader();

	// const startText = useStartText();
	// const startDisabled = useStartDisabled();
	const onStart = useOnStart();

	return <div className="home-buttons ms-5">
		<Stack direction="column" spacing={1} justifyContent="start" className="mt-3 home-buttons">
			<HomeButton title="Open" onClick={onStart} />
			<HomeButton title="Download" />
			<HomeButton title="Mods" />
		</Stack>
	</div>;
}