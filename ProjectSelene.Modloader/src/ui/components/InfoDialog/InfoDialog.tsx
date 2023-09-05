import Close from '@mui/icons-material/Close';
import { Button, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';


export function InfoDialog(props: {
	open: boolean,
	onClose: () => void
}) {
	return <Dialog open={props.open} maxWidth={false} fullWidth={false} onClose={props.onClose}>
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
				<Button className="mt-3" variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={props.onClose}>
					Close
				</Button>
			</Stack>
		</DialogContent>
	</Dialog>;
}