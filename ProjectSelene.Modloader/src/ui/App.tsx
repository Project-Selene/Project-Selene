import './App.scss';

import { ThemeProvider } from '@mui/material';
import React from 'react';

import { Background } from './components/Background/Background';
import { Character } from './components/Character/Character';
import { HomeButtons } from './components/HomeButtons/HomeButtons';
import { Title } from './components/Title/Title';
import { theme } from './theme';

export default function App() {
	// useEffect(() => {
	// 	const initialize = useAppCallback(async state => {
	// 		await loadGames(state);
	// 		await loadMods(state);
	// 	});
	// 	initialize();
	// });

	return <ThemeProvider theme={theme}>
		<div className="body">
			<Title />
			<HomeButtons />
			<Character />
			<Background />
		</div>
	</ThemeProvider>;
}