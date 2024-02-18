import ArrowRight from '@mui/icons-material/ArrowRightAlt';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, deleteMod, installMod, selectAvailableMod, selectInstalledMod, store } from '../../../state/state.reducer';

export function ModsEntry(props: {
	id: string
}) {
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


	const isInstalled = !!rawmod;
	const hasUpdate = !!moddb && moddb.version !== mod.currentInfo.version;

	const dispatch = useDispatch<typeof store.dispatch>();

	return <Card key={props.id}>
		<CardContent>
			<Stack direction="row" spacing={2}>
				<Stack direction="column" justifyContent="center" alignItems="center" spacing={1}>
					<Avatar>{mod?.currentInfo.name[0] || 'M'}</Avatar>
				</Stack>
				<Stack direction="column" sx={{ flexGrow: 1, minWidth: 0 }}>
					<Stack direction="row" sx={{ alignItems: 'baseline' }} spacing={1}>
						<Typography variant="h6" component="div" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
							{mod.currentInfo.name}
						</Typography>
						<Typography variant="body2" component="div" sx={{ color: 'text.secondary', flexGrow: 1 }}>
							{mod.currentInfo.version}{
								hasUpdate ?
									<><ArrowRight fontSize="inherit" sx={{ verticalAlign: 'middle' }} /> {moddb.version}</>
									: <></>
							}
						</Typography>
						{(hasUpdate || !isInstalled) && <Button variant="outlined" size="small" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(installMod({ filename: mod.filename, id: moddb?.id ?? '', version: moddb?.version ?? '' }))}>
							<Download />
						</Button>}
						{isInstalled && <Button variant="outlined" size="small" style={{ backgroundColor: '#66F3' }} onClick={() => dispatch(deleteMod(mod.filename))}>
							<Delete />
						</Button>}
					</Stack>
					<Stack direction="row" sx={{ alignItems: 'baseline' }} spacing={1}>
						<Typography variant="subtitle1" component="div" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
							{mod.currentInfo.description}
						</Typography>
						<Typography variant="body2" component="div" sx={{ whiteSpace: 'nowrap', textDecoration: 'underline', cursor: 'pointer', userSelect: 'none', '&:active': { color: 'text.secondary' } }} onClick={() => console.log('hi')}>
							More info
						</Typography>
					</Stack>
				</Stack>
			</Stack>
		</CardContent>
	</Card>;
}