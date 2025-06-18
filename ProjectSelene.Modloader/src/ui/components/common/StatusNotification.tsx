import { CircularProgress, Slide, Snackbar, Typography } from '@mui/material';
import React from 'react';

export function StatusNotification() {
	const status = ''; //useSelector(selectStatus);

	return (
		<Snackbar
			open={!!status}
			TransitionComponent={Slide}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			message={<Typography variant="body1">{status}</Typography>}
			action={<CircularProgress />}
		/>
	);
}
