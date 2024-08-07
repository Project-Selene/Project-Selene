import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentDevMod } from '../../../state/state.reducer';


export function DevModHint() {
	const devMod = useSelector(selectCurrentDevMod);

	return <Snackbar
		open={!!devMod}
		TransitionComponent={Slide}
		message={<Typography variant="body1">Developer Mod: {devMod?.currentInfo?.name}</Typography>}
		sx={{ zIndex: 1100 }}
	/>;
}