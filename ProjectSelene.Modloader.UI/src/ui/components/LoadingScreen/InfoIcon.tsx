import { Box } from '@mui/material';
import React from 'react';

export function InfoIcon(props: { text: string }) {
	return (
		<Box
			sx={{
				display: 'inline-block',
				filter: 'drop-shadow(1px 1px 1px #000)',
				width: '41px',
				height: '42px',
				verticalAlign: 'middle',
			}}
		>
			<Box
				sx={{
					fill: '#D43C5D',
				}}
			>
				<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
					<circle cx="20" cy="20" r="20" strokeWidth="0" />
					<text x="20" y="20" textAnchor="middle" alignmentBaseline="central" fill="currentcolor">
						{props.text}
					</text>
				</svg>
			</Box>
		</Box>
	);
}
