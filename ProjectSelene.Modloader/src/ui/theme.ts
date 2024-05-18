import { createTheme } from '@mui/material';

export const theme = createTheme({
	palette: {
		mode: 'dark',
	},
	components: {
		MuiDialog: {
			styleOverrides: {
				paper: {
					backgroundColor: 'hsl(0 0% 14%)', //Material design 12dp
					backgroundImage: 'none',
				},
			},
		},
		MuiAccordion: {
			styleOverrides: {
				root: {
					backgroundColor: 'hsl(0 0% 14%)', //Material design 12dp
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					backgroundColor: 'hsl(0 0% 16%)', //Material design 24dp
				},
			},
		},
	},
});

theme.typography.h1 = {
	...theme.typography.h1,
	[theme.breakpoints.down('md')]: {
		...theme.typography.h1,
		fontSize: '3rem',
	},
};