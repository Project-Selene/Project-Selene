import { ExpandMore, OpenInNew } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	Typography,
} from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectGameState } from '../../../state/game.store';
import { selectMods } from '../../../state/mod.store';
import { GameState } from '../../../state/models/game';
import { theme } from '../../theme';
import { ModOptionsEntry } from './ModOptionsEntry';

export function OptionsDialog() {
	const gameState = useSelector(selectGameState);

	const modsInitialized = gameState !== GameState.PROMPT;
	const open = false; //useSelector(selectOptionsOpen);
	const seleneOptionsExpanded = false; //useSelector(selectSeleneOptionsExpanded);
	const mods = useSelector(selectMods);

	// const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => null /*dispatch(setOptionsOpen(false))*/}>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between">
					<span>Options</span>
					<Stack direction="row" spacing={0.5}>
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<Close />}
							onClick={() => null /*dispatch(setOptionsOpen(false))*/}
						>
							Close
						</Button>
					</Stack>
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ height: '70vh' }}>
				<Stack direction="column" sx={{ height: '100%' }} gap={1}>
					<Stack direction="column">
						<Accordion
							expanded={seleneOptionsExpanded}
							onClick={() => null /*dispatch(toggleSeleneOptionsExpanded())*/}
						>
							<AccordionSummary expandIcon={<ExpandMore />} sx={{ flexDirection: 'row-reverse', gap: 1 }}>
								<Stack
									direction="row"
									alignItems="baseline"
									justifyContent="space-between"
									width="100%"
								>
									<Typography variant="subtitle1">Project Selene</Typography>
								</Stack>
							</AccordionSummary>
							<AccordionDetails>
								<Box sx={{ display: 'table', borderSpacing: theme.spacing(1) }}>
									<Box sx={{ display: 'table-row' }}>
										<Box sx={{ display: 'table-cell' }}>
											<Typography variant="body2">Open a different folder</Typography>
										</Box>
										<Box sx={{ display: 'table-cell' }}>
											<Button
												variant="outlined"
												style={{ backgroundColor: '#66F3' }}
												endIcon={<OpenInNew />}
												onClick={e => {
													e.stopPropagation();
													// dispatch(openDirectory());
												}}
											>
												Open
											</Button>
										</Box>
									</Box>
									{/* <Box sx={{ display: 'table-row' }}>
										<Box sx={{ display: 'table-cell' }}>
											<Typography variant="body2">Create a mod</Typography>
										</Box>
										<Box sx={{ display: 'table-cell' }}>
											{isLoggedIn ? (
												<Button variant="outlined" onClick={() => dispatch(logout())}>
													<Avatar alt="User" src={userAvatarUrl ?? ''} />
												</Button>
											) : (
												<Button
													variant="outlined"
													style={{ backgroundColor: '#66F3' }}
													endIcon={<Add />}
													onClick={e => {
														e.stopPropagation();
														dispatch(setCreateModOpen(true));
													}}
												>
													Create
												</Button>
											)}
										</Box>
									</Box> */}
								</Box>
							</AccordionDetails>
						</Accordion>
						{mods.map(mod => (
							<ModOptionsEntry mod={mod} key={mod.id}></ModOptionsEntry>
						))}
					</Stack>
					{modsInitialized ? (
						<></>
					) : (
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<OpenInNew />}
							onClick={() => null /*dispatch(openDirectory())*/}
						>
							Open mods folder to show mod options
						</Button>
					)}
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
