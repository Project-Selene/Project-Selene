import classes from './Moon.module.scss';

import React from 'react';

export function Background() {
	return (
		<div className={classes.moon}>
			<img src="static/images/full_moon.svg"></img>
		</div>
	);
}
