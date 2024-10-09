import { Box, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectOpenDialogOpen } from '../../../state/state.reducer';
import { InfoIcon } from './InfoIcon';
import { InfoPointer } from './InfoPointer';
import classes from './OpenDialog.module.scss';

export function OpenDialog() {
	const open = useSelector(selectOpenDialogOpen);

	return <Dialog open={open} maxWidth={false} fullWidth={false}>
		<DialogTitle>
			<Stack direction="row" justifyContent="space-between">
				<span>Finding the game directory using Steam</span>
			</Stack>
		</DialogTitle>
		<DialogContent sx={{ maxWidth: '100em' }}>
			<div>
				<Box sx={{ display: { sm: 'table', xs: 'flex' }, borderSpacing: 8, flexDirection: 'column' }}>
					<Box sx={{ display: { sm: 'table-row', xs: 'flex' }, flexDirection: 'column' }}>
						<Box sx={{
							display: 'table-cell',
							verticalAlign: 'middle',
							width: { sm: '30em', xs: '100%' },
							minWidth: '10em',
						}}>
							<Box sx={{
								width: 'fit-content',
								margin: 'auto',
							}}>
								<Typography variant="subtitle1">Step <InfoIcon text="1" />: Open Steam</Typography>
								<Typography variant="subtitle1">Step <InfoIcon text="2" />: Right Click on Game</Typography>
								<Typography variant="subtitle1">Step <InfoIcon text="3" />: Click properties</Typography>
							</Box>
						</Box>
						<Box sx={{
							display: 'table-cell',
							maxWidth: '50em',
							paddingTop: '60px',
							paddingLeft: { sm: 0, xs: '60px' },
							paddingRight: { sm: 0, xs: '60px' },
							boxSizing: 'border-box',
							width: { sm: '40em', xs: '100%' },
							minWidth: '10em',
						}}>
							<Box sx={{ width: 'fit-content' }}>
								<Typography variant="subtitle1" sx={{ position: 'relative', overflow: 'visible' }}>
									<InfoPointer x={5} y={4} rotate={0} text="2" />
									<InfoPointer x={90} y={53} rotate={90} text="3" />
								</Typography>
								<img src="static/images/open_guide_steam_properties.png" className={classes.property}></img>
							</Box>

						</Box>
					</Box>
					<Box sx={{ display: { sm: 'table-row', xs: 'flex' }, flexDirection: 'column' }}>
						<Box sx={{ display: 'table-cell', verticalAlign: 'middle' }}>
							<Box sx={{
								width: 'fit-content',
								margin: 'auto',
							}}>
								<Typography variant="subtitle1">Step <InfoIcon text="4" />: Click on Local Files</Typography>
								<Typography variant="subtitle1">Step <InfoIcon text="5" />: Click on Browse</Typography>
							</Box>
						</Box>
						<Box sx={{ display: 'table-cell', maxWidth: '50em' }}>
							<Box sx={{
								width: { sm: 'fit-content', xs: '100%' },
								maxWidth: '30em',
								padding: { sm: 0, xs: '60px' },
								boxSizing: 'border-box',
							}}>
								<Typography variant="subtitle1" sx={{ position: 'relative', overflow: 'visible' }}>
									<InfoPointer x={2} y={20} rotate={0} text="4" />
									<InfoPointer x={90} y={10} rotate={90} text="5" />
								</Typography>
								<img src="static/images/open_guide_steam_search.png" className={classes.search}></img>
							</Box>
						</Box>
					</Box>
				</Box>
			</div>
		</DialogContent>
	</Dialog >;
}