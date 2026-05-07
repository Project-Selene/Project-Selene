import { Box } from '@mui/material';
import React, { useMemo } from 'react';

export function Stars() {
	const points = useMemo(
		() =>
			Array(100)
				.fill(0)
				.map(() => calculatePoint()),
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
					<circle
						key={i}
						cx={points[i].x * 100 + 'vw'}
						cy={points[i].y * 100 + 'vh'}
						className='star'
						r="1"
						fill="white"
					></circle>
				))}
				<defs>
					<radialGradient id="fade" cx="50%" cy="50%" r="50%">
						<stop offset="5%" stopColor="var(--mdc-theme-background, #333)" stopOpacity="1" />
						<stop offset="100%" stopColor="var(--mdc-theme-background, #333)" stopOpacity="0" />
					</radialGradient>
				</defs>
				<circle cx="50vw" cy="50vh" r="80" fill="url(#fade)" />
			</svg>
		</Box>
	);
}

function calculatePoint() {
	const x = Math.random();
	const y = Math.random();

	const edgeX = clamp(0.5 - ((0.5 - x) * 0.5) / Math.abs(0.5 - y), 0, 1);
	const edgeY = clamp(0.5 - ((0.5 - y) * 0.5) / Math.abs(0.5 - x), 0, 1);

	const offsetX = Math.abs(0.5 - edgeX);
	const offsetY = Math.abs(0.5 - edgeY);
	const speed = Math.random() * 0.5 + 0.5;

	const animationTime = `calc(sqrt(pow(${offsetX}vw / 1px, 2) + pow(${offsetY}vh / 1px, 2)) * ${speed} * 1s)`;

	return { x, y, edgeX, edgeY, animationTime };
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}