import { WarningAmber } from '@mui/icons-material';
import { Box } from '@mui/material';
import React from 'react';
import { useJSAvailable } from '../hooks/detect';


export function NOJSWarning() {
	const jsAvailable = useJSAvailable();

	return jsAvailable
		? <></>
		: <Box sx={{ color: 'warning.main', typography: 'caption' }}>
			<WarningAmber sx={{ verticalAlign: 'bottom' }} /> Requires Javascript
		</Box>;
}