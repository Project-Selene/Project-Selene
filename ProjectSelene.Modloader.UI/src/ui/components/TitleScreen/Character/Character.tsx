import classes from './Character.module.scss';

import React from 'react';

export function Character() {
	return (
		<>
			<img src="static/images/juno.png" className={classes.character}></img>
			<img src="static/images/halo.png" className={classes.halo}></img>
		</>
	);
}
