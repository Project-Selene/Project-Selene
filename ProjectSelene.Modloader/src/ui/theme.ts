import { createTheme } from '@mui/material';

export const theme = createTheme({
	palette: {
		mode: 'dark',
	},
});

theme.typography.h1 = {
	...theme.typography.h1,
	[theme.breakpoints.down('md')]: {
		...theme.typography.h1,
		fontSize: '3rem',
	},
};