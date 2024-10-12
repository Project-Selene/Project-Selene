import { ExpandMore, OpenInNew } from '@mui/icons-material';
import Close from '@mui/icons-material/Close';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Avatar,
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Stack,
	Typography,
} from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	login,
	logout,
	openDirectory,
	selectInstalledModIds,
	selectIsLoggedIn,
	selectModsInitialized,
	selectOptionsOpen,
	selectSeleneOptionsExpanded,
	selectUserAvatarUrl,
	setOptionsOpen,
	store,
	toggleSeleneOptionsExpanded,
} from '../../../state/state.reducer';
import { theme } from '../../theme';
import { ModOptionsEntry } from './ModOptionsEntry';

export function OptionsDialog() {
	const open = useSelector(selectOptionsOpen);
	const isLoggedIn = useSelector(selectIsLoggedIn);
	const userAvatarUrl = useSelector(selectUserAvatarUrl);
	const seleneOptionsExpanded = useSelector(selectSeleneOptionsExpanded);
	const modsInitialized = useSelector(selectModsInitialized);
	const installedModIds = useSelector(selectInstalledModIds);

	const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<Dialog open={open} maxWidth={false} fullWidth={true} onClose={() => dispatch(setOptionsOpen(false))}>
			<DialogTitle>
				<Stack direction="row" justifyContent="space-between">
					<span>Options</span>
					<Stack direction="row" spacing={0.5}>
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<Close />}
							onClick={() => dispatch(setOptionsOpen(false))}
						>
							Close
						</Button>
					</Stack>
				</Stack>
			</DialogTitle>
			<DialogContent sx={{ height: '70vh' }}>
				<Stack direction="column" sx={{ height: '100%' }} gap={1}>
					<Stack direction="column">
						<Accordion expanded={seleneOptionsExpanded} onClick={() => dispatch(toggleSeleneOptionsExpanded())}>
							<AccordionSummary expandIcon={<ExpandMore />} sx={{ flexDirection: 'row-reverse', gap: 1 }}>
								<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
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
												onClick={() => dispatch(openDirectory())}
											>
												Open
											</Button>
										</Box>
									</Box>
									<Box sx={{ display: 'table-row' }}>
										<Box sx={{ display: 'table-cell' }}>
											<Typography variant="body2">Account</Typography>
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
													endIcon={<OpenInNew />}
													onClick={() => dispatch(login())}
												>
													Login
												</Button>
											)}
										</Box>
									</Box>
								</Box>
							</AccordionDetails>
						</Accordion>
						{installedModIds.map(id => (
							<ModOptionsEntry id={id} key={id}></ModOptionsEntry>
						))}
					</Stack>
					{modsInitialized ? (
						<></>
					) : (
						<Button
							variant="outlined"
							style={{ backgroundColor: '#66F3' }}
							endIcon={<OpenInNew />}
							onClick={() => dispatch(openDirectory())}
						>
							Open mods folder to show mod options
						</Button>
					)}
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
