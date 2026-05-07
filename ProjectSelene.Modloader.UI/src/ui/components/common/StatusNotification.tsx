import { CheckCircle, Error } from '@mui/icons-material';
import { CircularProgress, Slide, Snackbar, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectStatus, selectStatusIcon, selectStatusVisible } from '../../../state/misc.store';

export function StatusNotification() {
	const status = useSelector(selectStatus);
	const statusVisible = useSelector(selectStatusVisible);
	const statusIcon = useSelector(selectStatusIcon);

	return (
		<Snackbar
			open={statusVisible}
			slotProps={{
				transition: Slide
			}}
			anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
			message={<Typography variant="body1">{status}</Typography>}
			action={statusIcon === 'loading' ? <CircularProgress /> : statusIcon === 'success' ? <CheckCircle /> : <Error />}
		/>
	);
}
