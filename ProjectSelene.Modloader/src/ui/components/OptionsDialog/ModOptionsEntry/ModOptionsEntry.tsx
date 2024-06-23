import { Accordion, AccordionDetails, AccordionSummary, Stack, Switch, Typography } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, selectInstalledMod, selectModEnabled, selectModExpanded, setModEnabled, store, toggleModOptionsExpanded } from '../../../state/state.reducer';

export function ModOptionsEntry(props: {
	id: string
}) {
	const modExpanded = useSelector((state: RootState) => selectModExpanded(state, props.id));
	const modEnabled = useSelector((state: RootState) => selectModEnabled(state, props.id));
	const modInfo = useSelector((state: RootState) => selectInstalledMod(state, props.id));
	const dispatch = useDispatch<typeof store.dispatch>();

	if (!modInfo) {
		return <></>;
	}

	return <Accordion expanded={modExpanded} onClick={() => dispatch(toggleModOptionsExpanded(props.id))}>
		<AccordionSummary>
			<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
				<Typography variant="subtitle1">
					{modInfo.currentInfo.name}
				</Typography>
				<Switch checked={modEnabled} onChange={(_, checked) => dispatch(setModEnabled({ id: props.id, enabled: checked }))} onClick={e => e.stopPropagation()} />
			</Stack>
		</AccordionSummary>
		<AccordionDetails>
		</AccordionDetails>
	</Accordion >;
}