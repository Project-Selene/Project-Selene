import './App.scss';

import { ThemeProvider } from '@mui/material';
import React, { useState } from 'react';

import { Background } from './components/Background/Background';
import { Character } from './components/Character/Character';
import { HomeButtons } from './components/HomeButtons/HomeButtons';
import { ModsDialog } from './components/ModsDialog/ModsDialog';
import { Title } from './components/Title/Title';
import { doLoad } from './hooks/state';
import { root } from './state';
import { theme } from './theme';

export default function App() {
	doLoad(() => root.loader.finder.loadGames(), (state, value) => {
		state.gamesInfo = value;
		if (value.data?.games) {
			state.games = value.data?.games.map(() => ({}));
		}
	});

	doLoad(() => root.moddb.modList(), (state, value) => {
		state.modDb.mods = value;
	});

	const [modsOpen, setModsOpen] = useState(false);

	return <ThemeProvider theme={theme}>
		<div className="body">
			<Title />
			<HomeButtons onModsOpen={() => setModsOpen(true)} />
			<Character />
			<Background />
			<ModsDialog open={modsOpen} onClose={() => setModsOpen(false)} />
		</div>
	</ThemeProvider>;
}