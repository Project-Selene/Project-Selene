import { Slide, Snackbar, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentDevMod } from '../../state/state.reducer';


export function DevModHint() {
	const devMod = useSelector(selectCurrentDevMod);

	return <Snackbar
		open={!!devMod}
		TransitionComponent={Slide}
		message={<Typography variant="body1">Developer Mod: {devMod?.currentInfo?.name}</Typography>}
		sx={{ zIndex: 1100 }}
	/>;
}