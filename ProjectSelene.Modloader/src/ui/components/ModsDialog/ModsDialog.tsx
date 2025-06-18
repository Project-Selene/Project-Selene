import { OpenInNew, Refresh } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Slide,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { openDirectory, selectGameState } from '../../../state/game.store';
import {
	loadModsFromDb,
	searchForMod,
	selectAvailableModsLoading,
	selectMods,
	selectModsDialogOpen,
	selectModsSearch,
	setModsOpen,
} from '../../../state/mod.store';
import { GameState } from '../../../state/models/game';
import { store } from '../../../state/state.reducer';
import { ModsEntry } from './ModsEntry';

const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function ModsDialog() {
	const gameState = useSelector(selectGameState);

	const open = useSelector(selectModsDialogOpen);
	const mods = useSelector(selectMods);
	const searchString = useSelector(selectModsSearch);
	const availableModsLoading = useSelector(selectAvailableModsLoading);

	const installedMods = mods.filter(m => m.isInstalled);
	const availableMods = mods.filter(m => !m.isInstalled);

	const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<Dialog
			open={open}
			maxWidth={false}
			fullWidth={true}
			onClose={() => dispatch(setModsOpen(false))}
			hideBackdrop={true}
			TransitionComponent={Transition}
			transitionDuration={{ enter: 200, exit: 200 }}
			TransitionProps={{
				easing: 'ease-in-out',
			}}
		>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between">
					<span>Mods</span>
					<Stack direction="row" spacing={0.5}>
						<TextField
							id="outlined-basic"
							label="Search..."
							variant="outlined"
							value={searchString}
							onChange={e => dispatch(searchForMod(e.target.value))}
						/>
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<Refresh />}
							onClick={e => {
								// dispatch(loadMods());
								// dispatch(loadModList());
								dispatch(loadModsFromDb());
								e.stopPropagation();
							}}
						>
							Refresh
						</Button>
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<Close />}
							onClick={() => dispatch(setModsOpen(false))}
						>
							Close
						</Button>
					</Stack>
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ height: '80vh' }}>
				<Card sx={{ height: '100%', backgroundColor: 'hsl(0 0% 14%)' }}>
					<CardContent sx={{ height: '100%', padding: 0 }}>
						<Stack
							direction="column"
							sx={{ overflowY: 'auto', height: '100%', padding: 2, boxSizing: 'border-box' }}
						>
							<Box sx={{ maxHeight: 0 }}>
								<Stack direction="row" gap={2} sx={{ flexWrap: 'wrap', paddingBottom: 2 }}>
									{gameState !== GameState.READY ? (
										<Stack direction="row" sx={{ width: '100%', justifyContent: 'center' }}>
											<Button
												variant="outlined"
												style={{ backgroundColor: '#66F3' }}
												endIcon={<OpenInNew />}
												onClick={() => dispatch(openDirectory())}
												disabled={gameState !== GameState.PROMPT}
											>
												Open mods folder
											</Button>
										</Stack>
									) : (
										<></>
									)}

									{installedMods.length > 0 ? (
										<Box sx={{ width: '100%' }}>
											<Typography variant="body2">Installed mods</Typography>
										</Box>
									) : (
										<></>
									)}

									{installedMods.map(mod => (
										<ModsEntry key={'i' + mod.id} mod={mod} />
									))}

									<Stack direction="row" sx={{ width: '100%', justifyContent: 'center' }}>
										<Typography variant="body2">Available mods</Typography>
									</Stack>

									{availableModsLoading ? (
										<CircularProgress />
									) : (
										availableMods.map(mod => <ModsEntry key={'i' + mod.id} mod={mod} />)
									)}
								</Stack>
							</Box>
						</Stack>
					</CardContent>
				</Card>
			</DialogContent>
		</Dialog>
	);
}
