import { Button, Stack } from '@mui/material';
import React from 'react';

import './HomeButton.scss';


export function HomeButton(props: { title: string, onClick?: React.MouseEventHandler<HTMLButtonElement> }) {
	// const jsAvailable = useJSAvailable();
	// const isLocal = useIsLocal();
	// const download = useDownloadLoader();

	// const startText = useStartText();
	// const startDisabled = useStartDisabled();
	// const onStart = useOnStart();

	return <Stack direction="column" spacing={1} justifyContent="start" className="mt-3 home-button text-center align-items-center">
		<Button variant="outlined" onClick={props.onClick} className="w-100">{props.title}</Button>
	</Stack>;
}