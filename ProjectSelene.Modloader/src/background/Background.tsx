import React from 'react';
import './Background.scss';

export default class Background extends React.Component {
	render(): React.ReactNode {
		return <>
			<div className="full-moon-placeholder"></div>
			<div className="full-moon">
				<div>
					<div>
						<img src="full_moon.svg"></img>
					</div>
				</div>
			</div>
			
			
			<svg version="1.1"
				width="100vw" height="100vh"
				xmlns="http://www.w3.org/2000/svg"
				className="background-stars">
				{[...Array(100)].map((_, i) => 
					<circle key={i} cx={(Math.random() * 100) + '%'} cy={(Math.random() * 100) + '%'} r="1" fill="white"></circle>,
				)}
			</svg>
		</>;
	}
}