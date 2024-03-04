import { Box, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setModsOpen, store } from '../../state/state.reducer';
import { InfoPointer } from './InfoPointer';
import classes from './OpenDialog.module.scss';

export function OpenDialog() {
	const open = true;

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => dispatch(setModsOpen(false))}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Open Game</span>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ height: '80vh' }}>
			<Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', gap: 3 }}>
				<Box sx={{ flexBasis: '40%', alignSelf: 'center' }}>
					<p>
						<Typography variant="subtitle1">Step 1: Open Steam</Typography>
						<Typography variant="body1">Open Steam and navigate to the library tab.</Typography>
					</p>
					<p>
						<Typography variant="subtitle1">Step 2: Right Click on Game</Typography>
						<Typography variant="body1">Right click on the game you want to open and select properties.</Typography>
					</p>
				</Box>
				<Box sx={{ flexBasis: '40%' }}>
					<Typography variant="subtitle1">
						<InfoPointer x={10} y={0.5} rotate={0} text="1" />
					</Typography>
					<img src="static/images/open_guide_steam_properties.png" className={classes.property}></img>

				</Box>
				<Box sx={{ flexBasis: '40%', alignSelf: 'center' }}>
					<p>
						<Typography variant="subtitle1">Step 3: Click on Local Files</Typography>
						<Typography variant="body1">Click on the Local Files tab and then click on the Browse Local Files button.</Typography>
					</p>
				</Box>
				<Box sx={{ flexBasis: '40%' }}>
					<img src="static/images/open_guide_steam_search.png" className={classes.search}></img>
				</Box>
			</Box>
		</DialogContent>
	</Dialog >;
}