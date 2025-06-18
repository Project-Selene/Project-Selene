import Close from '@mui/icons-material/Close';
import { Button, Dialog, DialogContent, DialogTitle, Link, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectInfoDialogOpen, setInfoOpen } from '../../../state/misc.store';
import { theme } from '../../theme';

export function InfoDialog() {
	const open = useSelector(selectInfoDialogOpen);
	const dispatch = useDispatch();

	return (
		<Dialog open={open} maxWidth={false} fullWidth={false} onClose={() => dispatch(setInfoOpen(false))}>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between">
					<span>Info</span>
					<span></span>
				</Stack>
			</DialogTitle>
			<DialogContent>
				<Stack>
					<Typography variant="body1">Modloader by 2767mr</Typography>
					<Typography variant="body1">
						Juno art made by <Link href="https://twitter.com/RioleaArt/">Riolea</Link>
					</Typography>
					<Button
						sx={{ marginTop: theme.spacing(3), backgroundColor: '#66F3' }}
						variant="outlined"
						endIcon={<Close />}
						onClick={() => dispatch(setInfoOpen(false))}
					>
						Close
					</Button>
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
