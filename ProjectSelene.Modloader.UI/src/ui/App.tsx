import { ThemeProvider } from '@mui/material';
import React from 'react';

import { Provider } from 'react-redux';
import { store } from './../state/state.reducer';
import { Main } from './components/Main';
import { theme } from './theme';

export default function App() {
	return (
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<Main />
			</ThemeProvider>
		</Provider>
	);
}
