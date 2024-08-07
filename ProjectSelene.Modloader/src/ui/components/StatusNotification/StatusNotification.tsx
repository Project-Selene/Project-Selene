import CircularProgress from '@mui/material/CircularProgress';
import Slide from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectStatus } from '../../../state/state.reducer';


export function StatusNotification() {
	const status = useSelector(selectStatus);

	return <Snackbar
		open={!!status}
		TransitionComponent={Slide}
		anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
		message={<Typography variant="body1">{status}</Typography>}
		action={<CircularProgress />}
	/>;
}