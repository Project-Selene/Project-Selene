import Info from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setInfoOpen } from '../../state/state.reducer';


export function InfoButton() {
	const dispatch = useDispatch();

	return <IconButton sx={{ color: 'primary.dark', position: 'absolute', bottom: 0, right: 0 }} onClick={() => dispatch(setInfoOpen(true))}>
		<Info />
	</IconButton >;
}