import { OpenInNew, Refresh } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Dialog,
	DialogContent,
	Fade,
	Paper,
	Slide,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { gameManager } from '../../../state/game-manager';
import { selectGameState, setInstalledMods, setInstalledModsLoading } from '../../../state/game.store';
import {
	loadModsFromDb,
	searchForMod,
	selectAvailableModsLoading,
	selectMods,
	selectModsDialogOpen,
	selectModsSearch,
	setModsOpen
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

	const backdropRef = useRef<HTMLElement>(null);
	useEffect(() => {
		if (open) {
			backdropRef.current?.focus()
		}
	}, [open])

	const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
		if (e.key === "Escape") {
			dispatch(setModsOpen(false))
		}
	}

	const refresh = async () => {
		try {
			dispatch(setInstalledModsLoading(true));
			dispatch(setInstalledMods(await gameManager.refreshModManifests()));
		} finally {
			dispatch(setInstalledModsLoading(false));
		}
	};
	const openModsFolder = async () => {
		await gameManager.openModDirectory();
		await refresh();
	};

	useEffect(() => {
		refresh().catch(err => console.error('Failed to refresh mods', err));
	}, [open]);

	return <Fade in={open}>
		<Box onKeyDown={onKeyDown} tabIndex={0} ref={backdropRef}
			sx={{ backdropFilter: 'blur(5px)', backgroundColor: 'rgba(0,0,16,0.3)', backgroundSize: '5px 5px', backgroundImage: 'linear-gradient(45deg,#0000007F 4.55%,#0000 4.55%,#0000 50%,#0000007F 50%,#0000007F 54.55%,#0000 54.55%,#0000 100%),linear-gradient(135deg,#0000007F 4.55%,#0000 4.55%,#0000 50%,#0000007F 50%,#0000007F 54.55%,#0000 54.55%,#0000 100%)', position: 'fixed', top: 0, bottom: 0, left: 0, right: 0 }}>
			<Stack direction='column' justifyContent='space-between' gap={3} sx={{ height: '100%' }} >
				<Slide in={open} direction='down' style={{ transformOrigin: 'top center' }}>
					<Paper sx={{ width: '100vw' }} elevation={6} square={true}>
						<Container>
							<Stack direction='row' justifyContent='space-between' alignItems='center'>
								<Typography variant="h2">Mods</Typography>

								<Stack direction='row' gap={0.5}>
									{gameState !== GameState.READY
										? <Button
											variant="outlined"
											style={{ backgroundColor: '#66F3' }}
											endIcon={<OpenInNew />}
											onClick={openModsFolder}
											disabled={gameState !== GameState.PROMPT}
										>
											Open mods folder
										</Button>
										: <></>}
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
											refresh();
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
						</Container>
					</Paper>
				</Slide>

				<Slide in={open} direction='up' style={{ transformOrigin: 'bottom center' }} timeout={100}>
					<Container sx={{ flexGrow: 1 }}>
						<Stack direction='row' justifyContent='center'>
							<Stack direction='column' gap={3} justifyContent='start' sx={theme => ({ width: `calc(100% - rem(100%, 20em + 2px + ${theme.spacing(3)}) - ${theme.spacing(3)})` })}>
								{installedMods.length > 0 ? <>
									<Typography variant="h4">Installed mods</Typography>
									<Stack direction='row' flexWrap='wrap' spacing={3}>
										{installedMods.map(mod => (
											<ModsEntry key={'i' + mod.id} mod={mod} />
										))}
									</Stack>
								</> : <></>}
								<Typography variant="h4" sx={{ width: 'fit-available' }}>Available mods</Typography>
								<Stack direction='row' flexWrap='wrap' gap={3} justifyContent='start' sx={{ width: 'fit-available' }}>
									{availableMods.map(mod => (
										<ModsEntry key={'i' + mod.id} mod={mod} />
									))}
								</Stack>
							</Stack>
						</Stack>
					</Container>
				</Slide>

				<Slide in={open} direction='up' style={{ transformOrigin: 'top center' }}>
					<Paper sx={{ width: '100vw' }} elevation={6} square={true}><Typography variant="h4">&nbsp;</Typography></Paper>
				</Slide>
			</Stack>
		</Box>
	</Fade >

	return (
		<Dialog
			open={open}
			maxWidth={false}
			fullWidth={true}
			onClose={() => dispatch(setModsOpen(false))}
			hideBackdrop={true}
			slots={{ transition: Transition }}
			slotProps={{ transition: { easing: 'ease-in-out' } }}
			transitionDuration={{ enter: 200, exit: 200 }}
		>
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
