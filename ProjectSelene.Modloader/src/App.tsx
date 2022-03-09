import { WarningAmber } from '@mui/icons-material';
import { Box, Button, createTheme, ThemeProvider, Typography } from '@mui/material';
import React from 'react';
import './App.scss';
import Background from './background/Background';

export default class App extends React.Component {
	jsDisabled = navigator.userAgent === 'ReactSnap';

	darkTheme = createTheme({
		palette: {
			mode: 'dark',
		},
	});

	render(): React.ReactNode {
		const nojsWarning = this.jsDisabled ?
			<Box sx={{ color: 'warning.main', typography: 'caption' }}>
				<WarningAmber className="align-bottom" /> Requires Javascript
			</Box>
			: <></>;


		return <ThemeProvider theme={this.darkTheme}>
			<div className="body">
				<Typography variant="h1" className="text-center mt-5">Project Selene</Typography>
				<Typography variant="subtitle1" className="text-center">Project Terra modloader</Typography>

				<div className="d-flex justify-content-center text-center">
					<div className="d-flex flex-column">
						<Button variant="contained" className="w-100" disabled>
							Open
						</Button>
						<Box sx={{ color: 'warning.main', typography: 'caption' }}>
							<WarningAmber className="align-bottom" /> Not available
						</Box>
					</div>
					<div className="mx-1">
						<Button variant="contained">
							Download
						</Button>
					</div>
					<div className="d-flex flex-column">
						<Button variant="contained" className="w-100" disabled={this.jsDisabled}>
							Mods
						</Button>
						{nojsWarning}
					</div>
				</div>
				<img src="character-halo-outline.png" className="character-halo-outline"></img>
				<img src="character-outline.png" className="character-outline"></img>

				<Background />
			</div>
		</ThemeProvider>;
	}
}