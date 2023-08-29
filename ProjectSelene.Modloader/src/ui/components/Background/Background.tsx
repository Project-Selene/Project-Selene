import './Background.scss';

import React from 'react';

export function Background() {
	return <div className="background-body">

		<div className="full-moon">
			<img src="full_moon.svg"></img>
		</div>

		<svg version="1.1"
			width="100vw" height="100vh"
			xmlns="http://www.w3.org/2000/svg"
			className="background-stars">
			{[...Array(100)].map((_, i) =>
				<circle key={i} cx={(Math.random() * 100) + '%'} cy={(Math.random() * 100) + '%'} r="1" fill="white"></circle>,
			)}
		</svg>
	</div >;
}
