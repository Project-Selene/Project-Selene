import { OpenInNew, Refresh } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadModList, loadMods, openDirectory, selectAvailableModIds, selectInstalledModIds, selectModsAvailableExpanded, selectModsDialogOpen, selectModsInitialized, selectModsInstalledExpanded, setModsOpen, setOptionsOpen, store, toggleModsAvailable, toggleModsInstalled } from '../../state/state.reducer';
import { ModsEntry } from './ModsEntry/ModsEntry';

export function ModsDialog() {
	const open = useSelector(selectModsDialogOpen);
	const modsInitialized = useSelector(selectModsInitialized);
	const installedExpanded = useSelector(selectModsInstalledExpanded);
	const availableExpanded = useSelector(selectModsAvailableExpanded);
	const installedModIds = useSelector(selectInstalledModIds);
	const availableModIds = useSelector(selectAvailableModIds);

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => dispatch(setModsOpen(false))}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Mods</span>
				<Stack direction="row" spacing={0.5}>
					<TextField id="outlined-basic" label="Search..." variant="outlined" />
					<Button variant="outlined" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(setOptionsOpen(true))}>
						Options
					</Button>
					<Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={() => dispatch(setModsOpen(false))}>
						Close
					</Button>
				</Stack>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ height: '80vh' }}>
			<Stack direction="column" sx={{ height: '100%' }}>
				<Accordion expanded={installedExpanded} onChange={() => { dispatch(toggleModsInstalled()); }}>
					<AccordionSummary>
						<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
							<Typography variant="body2">
								Installed mods
							</Typography>
							{modsInitialized
								? <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Refresh />} onClick={e => { dispatch(loadMods()); dispatch(loadModList()); e.stopPropagation(); }}>
									Refresh
								</Button>
								: <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<OpenInNew />} onClick={() => dispatch(openDirectory())}>
									Open mods folder
								</Button>}
						</Stack>
					</AccordionSummary>
					<AccordionDetails>
						<Stack direction="row" spacing={1}>
							{
								installedModIds.map(id => (<ModsEntry key={'i' + id} id={id} />))
							}
						</Stack>
					</AccordionDetails>
				</Accordion>
				<Accordion expanded={availableExpanded} onChange={() => { dispatch(toggleModsAvailable()); }}>
					<AccordionSummary>
						<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
							<Typography variant="body2">
								Available mods
							</Typography>
							<Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Refresh />} onClick={e => { dispatch(loadMods()); dispatch(loadModList()); e.stopPropagation(); }}>
								Refresh
							</Button>
						</Stack>
					</AccordionSummary>
					<AccordionDetails>
						<Stack direction="row" spacing={1}>
							{
								availableModIds.map(id => (<ModsEntry key={'a' + id} id={id} />))
							}
						</Stack>
					</AccordionDetails>
				</Accordion>
			</Stack>
		</DialogContent>
	</Dialog >;
}