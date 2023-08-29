import { Box, Stack, Typography } from '@mui/material';
import React from 'react';

export function Title() {
	return <Box sx={{ marginTop: 'calc(15vh)', marginLeft: '28vw', width: '65vw' }}>
		{/* left: 28vw;
	width: 65vw; */}
		<Stack className="mt-5 text-center">
			<Typography variant="h1">Project Selene</Typography>
			<Typography variant="subtitle1">Project Terra modloader</Typography>
		</Stack>
	</Box>;
}