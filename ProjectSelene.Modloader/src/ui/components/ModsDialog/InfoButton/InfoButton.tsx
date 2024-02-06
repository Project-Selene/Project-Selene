import Info from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { setInfoOpen } from '../../../state/state.reducer';
import './InfoButton.module.scss';


export function InfoButton() {
	const dispatch = useDispatch();

	return <IconButton className="infoButton text-primary" onClick={() => dispatch(setInfoOpen(true))}>
		<Info />
	</IconButton >;
}