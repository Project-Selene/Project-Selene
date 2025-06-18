import { ExpandMore } from '@mui/icons-material';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Switch, Typography } from '@mui/material';
import React from 'react';
import { Mod } from '../../../state/models/mod';

export function ModOptionsEntry({ mod }: { mod: Mod }) {
	const modExpanded = false; //useSelector((state: RootState) => selectModExpanded(state, props.id));
	const modEnabled = true; //useSelector((state: RootState) => selectModEnabled(state, props.id));

	// const dispatch = useDispatch<typeof store.dispatch>();

	return (
		<Accordion expanded={modExpanded} onClick={() => null /*dispatch(toggleModOptionsExpanded(props.id))*/}>
			<AccordionSummary expandIcon={<ExpandMore />} sx={{ flexDirection: 'row-reverse', gap: 1 }}>
				<Stack direction="row" alignItems="baseline" justifyContent="space-between" width="100%">
					<Typography variant="subtitle1">{mod.name}</Typography>
					<Switch
						checked={modEnabled}
						onChange={
							(/*_, checked*/) => null /*dispatch(setModEnabled({ id: props.id, enabled: checked }))*/
						}
						onClick={e => e.stopPropagation()}
					/>
				</Stack>
			</AccordionSummary>
			<AccordionDetails></AccordionDetails>
		</Accordion>
	);
}
