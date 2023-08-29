import Close from '@mui/icons-material/Close';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Refresh from '@mui/icons-material/Refresh';
import { Box, Button, Dialog, DialogContent, DialogTitle, Stack, Tab, Tabs, TextField } from '@mui/material';
import React, { useState } from 'react';
import { doLoad, useAppState } from '../../hooks/state';
import { root } from '../../state';
import { ModsEntry } from './ModsEntry/ModsEntry';

export function ModsDialog(props: {
	open: boolean,
	onClose: () => void
}) {
	const mods = useAppState(state => state.mods.data?.mods);
	const modsLoading = useAppState(state => state.mods.loading);
	const moddb = useAppState(state => state.modDb.mods.data);

	const installedModIds: number[] = mods
		?.map(m => m)
		.sort((a, b) => a.currentInfo.name.localeCompare(b.currentInfo.name))
		.map(m => m.currentInfo.id) ?? [];
	const installedModIdsSet = new Set(installedModIds);
	const availableModIds: number[] = moddb
		?.filter(m => !installedModIdsSet.has(m.id))
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(m => m.id) ?? [];

	const [currentTab, setCurrentTab] = useState(0);

	const openDirectory = () => doLoad(() => root.game.getMods(), (state, value) => {
		state.mods = value;
	});

	return <Dialog open={props.open} maxWidth={false} fullWidth={true} onClose={props.onClose}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Mods</span>
				<Stack direction="row" spacing={0.5}>
					<TextField id="outlined-basic" label="Search..." variant="outlined" />
					{(mods || modsLoading)
						? <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Refresh />} onClick={openDirectory}>
							Refresh
						</Button>
						: <Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<OpenInNew />} onClick={openDirectory}>
							Open mods folder
						</Button>}
					<Button variant="outlined" style={{ backgroundColor: '#66F3' }} endIcon={<Close />} onClick={props.onClose}>
						Close
					</Button>
				</Stack>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ height: '80vh' }}>
			<Stack direction="column" sx={{ height: '100%' }}>
				<Box sx={{ borderBottom: 1, borderColor: 'divider', marginBottom: 1 }}>
					<Tabs value={currentTab} onChange={(_, value) => setCurrentTab(value)}>
						<Tab label="Installed" />
						<Tab label="Available" />
					</Tabs>
				</Box>
				{currentTab === 0 && !mods && !modsLoading && <Stack direction="row" justifyContent="center" alignItems="center" sx={{ flexGrow: 1 }}>
					<Stack direction="column">
						<Button variant="outlined" style={{ backgroundColor: '#66F3' }} onClick={openDirectory}>
							Open mods folder
						</Button>
					</Stack>
				</Stack>}
				{currentTab === 0 && mods && <Stack spacing={1}>
					{
						installedModIds.map(id => (<ModsEntry key={id} id={id} />))
					}
				</Stack>}
				{currentTab === 1 && <Stack spacing={1}>
					{
						availableModIds.map(id => (<ModsEntry key={id} id={id} />))
					}
				</Stack>}
			</Stack>
		</DialogContent>
	</Dialog>;
}