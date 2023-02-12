import { Stack } from '@mui/material';
import React, { useState } from 'react';
import { loader } from '../../../loader';
import { HomeButton } from '../HomeButton/HomeButton';
import { PlayButton } from '../PlayButton/PlayButton';

import './HomeButtons.scss';

export function HomeButtons() {
	const [needsOpen, setNeedsOpen] = useState(false); //loader.needsOpen()
	const isLocal = loader.isLocal();

	const open = async () => {
		await loader.open();
		setNeedsOpen(loader.needsOpen());
	};

	return <div className="home-buttons ms-5">
		<Stack direction="column" spacing={1} justifyContent="start" className="mt-3 home-buttons">
			{needsOpen ? <HomeButton title="Open" onClick={open} /> : <PlayButton title="Play" />}
			{isLocal ? <></> : <HomeButton title="Download" />}
			<HomeButton title="Mods" />
		</Stack>
	</div>;
}