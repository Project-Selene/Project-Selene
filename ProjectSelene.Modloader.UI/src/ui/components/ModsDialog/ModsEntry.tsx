import { Delete, Download } from '@mui/icons-material';
import { Avatar, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ModDB } from '../../../moddb/moddb';
import { gameManager } from '../../../state/game-manager';
import { setInstalledMods, setInstalledModsLoading } from '../../../state/game.store';
import { selectModsSearch } from '../../../state/mod.store';
import { Mod } from '../../../state/models/mod';
import { store } from '../../../state/state.reducer';
import { FilterHighlight } from '../FilterHighlight';

export function ModsEntry(props: { mod: Mod }) {
	const searchString = useSelector(selectModsSearch);
	const mod = props.mod;

	const dispatch = useDispatch<typeof store.dispatch>();

	const refresh = async () => {
		try {
			dispatch(setInstalledModsLoading(true));
			dispatch(setInstalledMods(await gameManager.refreshModManifests()));
		} finally {
			dispatch(setInstalledModsLoading(false));
		}
	};

	const install = async (mod: Mod) => {
		if (!mod.latestVersion) {
			return;
		}
		if (gameManager.getMods().length === 0) {
			await gameManager.openModDirectory('readwrite');
		}
		const mods = gameManager.getMods()[0];
		const stream = await new ModDB().download(mod.id, mod.latestVersion);
		await mods.installMod(mod.name + '.mod.zip', stream);
		await refresh();
	}

	const deleteMod = async (mod: Mod) => {
		for (const mods of gameManager.getMods()) {
			try {
				await mods.deleteMod(mod.id);
			} catch (e) {
				console.error('Failed to delete mod', e);
			}
		}
		await refresh();
	}

	return (
		<Card key={mod.id} sx={{ border: '1px solid hsl(0 0% 14%)', width: '20em' }}>
			<CardHeader
				avatar={<Avatar>{mod.name?.[0] || 'M'}</Avatar>}
				title={<FilterHighlight filter={searchString}>{mod.name}</FilterHighlight>}
				subheader={
					'author' in mod && typeof mod.author === 'string' ? (
						<>
							{mod.version} by{' '}
							<i>
								<>{mod.author}</>
							</i>
						</>
					) : (
						<>{mod.version}</>
					)
				}
				action={
					<>
						{(mod.hasUpdate || !mod.isInstalled) && (
							<IconButton onClick={(e) => { install(mod); e.preventDefault(); e.stopPropagation(); }}>
								<Download />
							</IconButton>
						)}
						{mod.isInstalled && (
							<IconButton onClick={(e) => { deleteMod(mod); e.preventDefault(); e.stopPropagation(); }}>
								<Delete />
							</IconButton>
						)}
					</>
				}
			/>
			<CardContent sx={{ minWidth: 200 }}>
				<Stack direction="row">
					<Typography variant="body2" color="text.secondary" sx={{ width: 0, flexGrow: 1, color: 'white' }}>
						<FilterHighlight filter={searchString}>{mod.description}</FilterHighlight>
					</Typography>
				</Stack>
			</CardContent>
		</Card>
	);
}
