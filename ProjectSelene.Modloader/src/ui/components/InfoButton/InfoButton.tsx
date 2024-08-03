import Info from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setInfoOpen } from '../../../state/state.reducer';


export function InfoButton() {
	const dispatch = useDispatch();

	return <IconButton className="text-primary position-absolute bottom-0 end-0" onClick={() => dispatch(setInfoOpen(true))}>
		<Info />
	</IconButton >;
}