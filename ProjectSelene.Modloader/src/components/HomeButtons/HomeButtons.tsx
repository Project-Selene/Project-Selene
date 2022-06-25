import { WarningAmber } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';
import React from 'react';

import { useOnStart, useStartDisabled, useStartText } from '../../hooks/buttons';
import { useIsLocal, useJSAvailable } from '../../hooks/detect';
import { useDownloadLoader } from '../../hooks/download';
import { NOJSWarning } from '../NojsWarning/NojsWarning';

export function HomeButtons() {
	const jsAvailable = useJSAvailable();
	const isLocal = useIsLocal();
	const download = useDownloadLoader();

	const startText = useStartText();
	const startDisabled = useStartDisabled();
	const onStart = useOnStart();

	return <Stack direction="row" spacing={1} justifyContent="center" className="mt-3">
		<Stack>
			<Button variant="contained" className="w-100" disabled={!jsAvailable}>
				Mods
			</Button>
			<NOJSWarning />
		</Stack>
		<Stack>
			<Button variant="contained" onClick={download} disabled={isLocal}>
				{isLocal ? 'Update' : 'Download'}
			</Button>
		</Stack>
		<Stack>
			<Button variant="contained" className="w-100" disabled={startDisabled} onClick={onStart}>
				{startText}
			</Button>
			{
				startDisabled
					? <Box sx={{ color: 'warning.main', typography: 'caption' }}>
						<WarningAmber className="align-bottom" /> Not available
					</Box>
					: <></>
			}

		</Stack>
	</Stack>;
}