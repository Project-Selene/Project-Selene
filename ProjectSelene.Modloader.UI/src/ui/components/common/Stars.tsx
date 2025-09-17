import { Box } from '@mui/material';
import React, { useMemo } from 'react';

export function Stars() {
	const x = useMemo(
		() =>
			Array(100)
				.fill(0)
				.map(() => Math.random()),
		[],
	);
	const y = useMemo(
		() =>
			Array(100)
				.fill(0)
				.map(() => Math.random()),
		[],
	);

	return (
		<Box
			sx={{
				position: 'absolute',
				top: 0,
				bottom: 0,
				left: 0,
				right: 0,
				zIndex: -200,
			}}
		>
			<svg className="background-stars" version="1.1" width="100vw" height="100vh" xmlns="http://www.w3.org/2000/svg">
				{[...Array(100)].map((_, i) => (
					<circle key={i} cx={x[i] * 100 + '%'} cy={y[i] * 100 + '%'} r="1" fill="white"></circle>
				))}
			</svg>
		</Box>
	);
}
