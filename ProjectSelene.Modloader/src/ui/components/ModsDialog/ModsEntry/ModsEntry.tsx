import { Delete, Download } from '@mui/icons-material';
import { Avatar, Card, CardContent, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, deleteMod, installMod, selectAvailableMod, selectInstalledMod, selectSearchString, store } from '../../../state/state.reducer';
import { FilterHighlight } from '../../FilterHighlight/FilterHighlight';

export function ModsEntry(props: {
	id: string
}) {
	const searchString = useSelector(selectSearchString);
	const moddb = useSelector((state: RootState) => selectAvailableMod(state, props.id));

	const rawmod = useSelector((state: RootState) => selectInstalledMod(state, props.id));
	const mod = rawmod ?? {
		enabled: false,
		internalName: -(moddb?.id ?? Number.MAX_VALUE) + '',
		currentInfo: moddb ?? {
			description: '',
			id: -Number.MAX_VALUE,
			name: 'None',
			version: '0.0.0',
		},
		filename: moddb?.name + '.mod.zip',
	};

	const versionId = { filename: mod.filename, id: moddb?.id ?? '', version: moddb?.version ?? '' };


	const isInstalled = !!rawmod;
	const hasUpdate = !!moddb && moddb.version !== mod.currentInfo.version;

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Card key={props.id}>
		<CardHeader
			avatar={<Avatar>{mod?.currentInfo.name[0] || 'M'}</Avatar>}
			title={<FilterHighlight filter={searchString}>{mod.currentInfo.name}</FilterHighlight>}
			subheader={'author' in mod.currentInfo
				? <>{mod.currentInfo.version} by <i><>{mod.currentInfo.author}</></i></>
				: <>{mod.currentInfo.version}</>}
			action={<>
				{(hasUpdate || !isInstalled) && <IconButton onClick={() => dispatch(installMod(versionId))}>
					<Download />
				</IconButton>}
				{isInstalled && <IconButton onClick={() => dispatch(deleteMod(mod.filename))}>
					<Delete />
				</IconButton>}
			</>}
		/>
		<CardContent sx={{ minWidth: 200 }}>
			<Stack direction="row">
				<Typography variant="body2" color="text.secondary" sx={{ width: 0, flexGrow: 1 }}>
					<FilterHighlight filter={searchString}>{mod.currentInfo.description}</FilterHighlight>
				</Typography>
			</Stack>
		</CardContent>
	</Card>;
}