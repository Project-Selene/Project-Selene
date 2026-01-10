import { Box } from '@mui/material';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectPlayAnimation } from '../../../state/misc.store';

export function Stars() {
	const points = useMemo(
		() =>
			Array(100)
				.fill(0)
				.map(() => calculatePoint()),
		[],
	);

	const playAnimation = useSelector(selectPlayAnimation);

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
						style={{
							offsetPath: `shape(from ${points[i].x * 100 + 'vw'} ${points[i].y * 100 + 'vh'}, line to ${(points[i].edgeX * 100) + 2 + 'vw'} ${points[i].edgeY * 100 + 'vh'}, move to 50vw 50vh, line to ${points[i].x * 100 + 'vw'} ${points[i].y * 100 + 'vh'})`,
							animation: `moveStars ${points[i].animationTime} cubic-bezier(0.05,0,0,0) forwards, moveStars ${points[i].animationTime} linear infinite ${points[i].animationTime}`,
							animationPlayState: playAnimation ? 'running' : 'paused',
						}}
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