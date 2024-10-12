import { Box } from '@mui/material';
import React from 'react';

export function InfoPointer(props: { x: number; y: number; rotate: number; text: string }) {
	return (
		<Box
			sx={{
				position: 'absolute',
				width: 0,
				height: 0,
				marginTop: `calc(-60px + ${props.y}%)`,
				marginLeft: `calc(-60px + ${props.x}%)`,
				filter: 'drop-shadow(1px 1px 1px #000)',
			}}
		>
			<Box
				sx={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: 60,
					height: 60,
					transformOrigin: 'bottom right',
					transform: `rotate(${props.rotate}deg)`,
					fill: '#D43C5D',
				}}
			>
				<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
					<circle cx="20" cy="20" r="20" strokeWidth="0" />
					<polygon
						points="15.75,24.25 24.25,15.75 54.25,45.75 59.25,40.75 60,60 40.75,59.25 45.75,54.25"
						strokeWidth="0"
					/>
					<text
						x="20"
						y="20"
						textAnchor="middle"
						alignmentBaseline="central"
						fill="currentcolor"
						transform={`rotate(-${props.rotate} 20 20)`}
					>
						{props.text}
					</text>
				</svg>
			</Box>
		</Box>
	);
}
