import Close from '@mui/icons-material/Close';
import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInfoDialogOpen, setInfoOpen } from '../../state/state.reducer';


export function InfoDialog() {
	const open = useSelector(selectInfoDialogOpen);
	const dispatch = useDispatch();

	return <Dialog open={open} maxWidth={false} fullWidth={false} onClose={() => dispatch(setInfoOpen(false))}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Info</span>
				<span></span>
			</Stack>
		</DialogTitle>
		<DialogContent>
			<Stack>
				<Typography variant="body1">Modloader by 2767mr</Typography>
				<Typography variant="body1">Juno art made by <a href="https://twitter.com/RioleaArt/" className="text-primary">Riolea</a></Typography>
				<Button className="mt-3" variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={() => dispatch(setInfoOpen(false))}>
					Close
				</Button>
			</Stack>
		</DialogContent>
	</Dialog>;
}