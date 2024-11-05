import { Close, OpenInNew } from '@mui/icons-material';
import { Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	selectCreateModForm,
	selectCreateModOpen,
	setCreateModForm,
	setCreateModOpen,
} from '../../state/state.reducer';
import { theme } from '../theme';

export function CreateModDialog() {
	const open = useSelector(selectCreateModOpen);
	const dispatch = useDispatch();
	const form = useSelector(selectCreateModForm);

	return (
		<Dialog open={open} maxWidth={false} fullWidth={false} onClose={() => dispatch(setCreateModOpen(false))}>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between">
					<span>Create mod</span>
					<Stack direction="row" spacing={0.5}>
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<Close />}
							onClick={() => dispatch(setCreateModOpen(false))}
						>
							Close
						</Button>
					</Stack>
				</Stack>
			</DialogTitle>
			<DialogContent>
				<Box sx={{ display: 'table', borderSpacing: theme.spacing(1) }}>
					<Box sx={{ display: 'table-row' }}>
						<Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
							<Typography variant="body1">Name</Typography>
						</Box>
						<Box sx={{ display: 'table-cell' }}>
							<Typography variant="body1">
								<TextField
									id="outlined-basic"
									variant="outlined"
									value={form.name}
									onChange={e => dispatch(setCreateModForm({ name: e.target.value }))}
								/>
							</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'table-row' }}>
						<Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
							<Typography variant="body1">Description</Typography>
						</Box>
						<Box sx={{ display: 'table-cell' }}>
							<Typography variant="body1">
								<TextField
									id="outlined-basic"
									variant="outlined"
									value={form.description}
									onChange={e => dispatch(setCreateModForm({ description: e.target.value }))}
								/>
							</Typography>
						</Box>
					</Box>
					<Box sx={{ display: 'table-row' }}>
						<Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
							<Typography variant="body1">Development folder</Typography>
						</Box>
						<Box sx={{ display: 'table-cell' }}>
							<Button variant="outlined" style={{ backgroundColor: '#66F3', width: '100%' }} endIcon={<OpenInNew />}>
								Open
							</Button>
						</Box>
					</Box>
					<Box sx={{ display: 'table-row' }}>
						<Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
							<Typography variant="body1">Create subfolder</Typography>
						</Box>
						<Box sx={{ display: 'table-cell' }}>
							<Checkbox
								checked={form.createSubfolder}
								onChange={e => dispatch(setCreateModForm({ createSubfolder: e.target.checked }))}
							/>
						</Box>
					</Box>
					<Box sx={{ display: 'table-row' }}>
						<Box sx={{ display: 'table-cell' }}></Box>
						<Box sx={{ display: 'table-cell' }}>
							<Stack
								direction="column"
								sx={{
									alignItems: 'flex-end',
								}}
							>
								<Button variant="outlined" style={{ backgroundColor: '#66F3' }}>
									Create
								</Button>
							</Stack>
						</Box>
					</Box>
				</Box>
			</DialogContent>
		</Dialog>
	);
}
