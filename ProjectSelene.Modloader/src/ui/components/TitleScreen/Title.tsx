import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { theme } from '../../theme';

export function Title() {
	return (
		<Box
			sx={{
				marginTop: 'calc(15vh)',
				marginLeft: { md: '28vw' },
				width: { md: '65vw' },
			}}
		>
			<Stack sx={{ marginTop: theme.spacing(5), textAlign: 'center' }}>
				<Typography variant="h1">Project Selene</Typography>
				<Typography variant="subtitle1">Alabaster Dawn modloader</Typography>
			</Stack>
		</Box>
	);
}
