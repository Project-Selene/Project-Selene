import Info from '@mui/icons-material/InfoOutlined';
import { IconButton } from '@mui/material';
import React from 'react';
import './InfoButton.module.scss';


export function InfoButton(props: {
	onClick: () => void
}) {
	return <IconButton className="infoButton text-primary" onClick={props.onClick}>
		<Info />
	</IconButton >;
}