import ArrowRight from '@mui/icons-material/ArrowRightAlt';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import { Avatar, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import React from 'react';
import { doLoad, useAppState } from '../../../hooks/state';
import { root } from '../../../state';

export function ModsEntry(props: {
	id: number
}) {
	const moddb = useAppState(state => state.modDb.mods.data?.find(m => m.id === props.id));

	const rawmod = useAppState(state => state.mods.data?.mods.find(m => m.currentInfo.id === props.id));
	const mod = rawmod ?? {
		enabled: false,
		internalName: -(moddb?.id ?? Number.MAX_VALUE) + '',
		currentInfo: moddb ?? {
			description: '',
			id: -Number.MAX_VALUE,
			name: 'None',
			version: '0.0.0',
		},
		filename: '',
	};


	const isInstalled = !!rawmod;
	const hasUpdate = !!moddb && moddb.version !== mod.currentInfo.version;

	const deleteMod = () => doLoad(() => root.game.deleteMod(mod.filename), (state, value) => {
		if (value.data) {
			state.mods = value;
		}
	});

	return <Card>
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
						{(hasUpdate || !isInstalled) && <Button variant="outlined" size="small" style={{ backgroundColor: '#66F3' }}>
							<Download />
						</Button>}
						{isInstalled && <Button variant="outlined" size="small" style={{ backgroundColor: '#66F3' }} onClick={deleteMod}>
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