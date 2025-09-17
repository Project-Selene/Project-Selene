import { Delete, Download } from '@mui/icons-material';
import { Avatar, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectModsSearch } from '../../../state/mod.store';
import { Mod } from '../../../state/models/mod';
import { FilterHighlight } from '../FilterHighlight';

export function ModsEntry(props: { mod: Mod }) {
	const searchString = useSelector(selectModsSearch);
	const mod = props.mod;

	// const dispatch = useDispatch<typeof store.dispatch>();

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
							<IconButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); } /*dispatch(installMod(versionId))*/}>
								<Download />
							</IconButton>
						)}
						{mod.isInstalled && (
							<IconButton onClick={() => null /*dispatch(deleteMod(mod.filename))*/}>
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
