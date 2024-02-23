import Close from '@mui/icons-material/Close';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Refresh from '@mui/icons-material/Refresh';
import { Avatar, Box, Button, Dialog, DialogContent, DialogTitle, Stack, Tab, Tabs, TextField } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changeModsTab, loadModList, loadMods, login, logout, openDirectory, selectAvailableModIds, selectInstalledModIds, selectIsLoggedIn, selectModsDialogOpen, selectModsInitialized, selectModsTab, selectUserAvatarUrl, setModsOpen, store } from '../../state/state.reducer';
import { ModsEntry } from './ModsEntry/ModsEntry';

export function ModsDialog() {
	const open = useSelector(selectModsDialogOpen);
	const modsInitialized = useSelector(selectModsInitialized);
	const currentTab = useSelector(selectModsTab);
	const installedModIds = useSelector(selectInstalledModIds);
	const availableModIds = useSelector(selectAvailableModIds);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const userAvatarUrl = useSelector(selectUserAvatarUrl);

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => dispatch(setModsOpen(false))}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Mods</span>
				<Stack direction="row" spacing={0.5}>
					<TextField id="outlined-basic" label="Search..." variant="outlined" />
					{modsInitialized
						? <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Refresh />} onClick={() => { dispatch(loadMods()); dispatch(loadModList()); }}>
							Refresh
						</Button>
						: <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<OpenInNew />} onClick={() => dispatch(openDirectory())}>
							Open mods folder
						</Button>}
					<Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={() => dispatch(setModsOpen(false))}>
						Close
					</Button>
					{
						isLoggedIn
							? <Button variant="outlined" onClick={() => dispatch(logout())}>
								<Avatar alt="User" src={userAvatarUrl ?? ''} />
							</Button>
							: <Button variant="outlined" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(login())}>
								Login
							</Button>
					}
				</Stack>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ height: '80vh' }}>
			<Stack direction="column" sx={{ height: '100%' }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 1 }}>
					<Tabs value={currentTab} onChange={(_, value) => dispatch(changeModsTab(value))}>
						<Tab label="Installed" />
						<Tab label="Available" />
					</Tabs>
				</Box>
				{currentTab === 0 && !modsInitialized && <Stack direction="row" justifyContent="center" alignItems="center" sx={{ flexGrow: 1 }}>
					<Stack direction="column">
						<Button variant="outlined" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(openDirectory())}>
							Open mods folder
						</Button>
					</Stack>
				</Stack>}
				{currentTab === 0 && modsInitialized && <Stack spacing={1}>
					{
						installedModIds.map(id => (<ModsEntry key={'i' + id} id={id} />))
					}
				</Stack>}
				{currentTab === 1 && <Stack spacing={1}>
					{
						availableModIds.map(id => (<ModsEntry key={'a' + id} id={id} />))
					}
				</Stack>}
			</Stack>
		</DialogContent>
	</Dialog >;
}