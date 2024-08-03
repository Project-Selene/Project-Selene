import { ExpandMore, OpenInNew } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import { Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Dialog, DialogContent, DialogTitle, Stack, Switch, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout, openDirectory, selectDeveloperModeEnabled, selectDeveloperModeExpanded, selectInstalledModIds, selectIsLoggedIn, selectModsInitialized, selectOptionsOpen, selectUserAvatarUrl, setDeveloperModeEnabled, setOptionsOpen, store, toggleDeveloperMode } from '../../../state/state.reducer';
import { ModOptionsEntry } from './ModOptionsEntry/ModOptionsEntry';

export function OptionsDialog() {
	const open = useSelector(selectOptionsOpen);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const userAvatarUrl = useSelector(selectUserAvatarUrl);
	const developerModeExpanded = useSelector(selectDeveloperModeExpanded);
	const developerModeEnabled = useSelector(selectDeveloperModeEnabled);
	const modsInitialized = useSelector(selectModsInitialized);
	const installedModIds = useSelector(selectInstalledModIds);

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => dispatch(setOptionsOpen(false))}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Options</span>
				<Stack direction="row" spacing={0.5}>
					<Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={() => dispatch(setOptionsOpen(false))}>
						Close
					</Button>
				</Stack>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ height: '70vh' }}>
			<Stack direction="column" sx={{ height: '100%' }} gap={1}>
				<Stack direction="column">
					<Accordion expanded={developerModeExpanded} onClick={() => dispatch(toggleDeveloperMode())}>
						<AccordionSummary expandIcon={<ExpandMore />} sx={{ flexDirection: 'row-reverse', gap: 1 }}>
							<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
								<Typography variant="subtitle1">
									Developer Mode
								</Typography>
								<Switch checked={developerModeEnabled} onChange={(_, checked) => dispatch(setDeveloperModeEnabled(checked))} onClick={e => e.stopPropagation()} />
							</Stack>
						</AccordionSummary>
						<AccordionDetails>
							<Stack direction="column" spacing={1}>
								<Stack direction="row" spacing={1} alignItems="baseline">
									<Typography variant="body2">
										Account
									</Typography>
									<div>
										{
											isLoggedIn
												? <Button variant="outlined" onClick={() => dispatch(logout())}>
													<Avatar alt="User" src={userAvatarUrl ?? ''} />
												</Button>
												: <Button variant="outlined" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(login())}>
													Login
												</Button>
										}
									</div>
								</Stack>
							</Stack>
						</AccordionDetails>
					</Accordion>
					{
						installedModIds.map(id => <ModOptionsEntry id={id} key={id}></ModOptionsEntry>)
					}
				</Stack>
				{modsInitialized ? <></> : <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<OpenInNew />} onClick={() => dispatch(openDirectory())}>
					Open mods folder to show mod options
				</Button>}
			</Stack>
		</DialogContent>
	</Dialog >;
}