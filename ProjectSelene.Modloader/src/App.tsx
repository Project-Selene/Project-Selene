import React from 'react';
import './App.scss';
import Background from './background/Background';

export default class App extends React.Component {
	render(): React.ReactNode {
		return <div className="mdc-typography body">

			<h1 className="mdc-typography--headline1 text-center">Project Selene</h1>
			<h2 className="mdc-typography--subtitle1 text-center">Project Terra modloader</h2>
			<div className="d-flex justify-content-center text-center">
				<div className="d-flex flex-column mdc-theme--background">
					<button className="mdc-button mdc-button--raised mdc-theme--primary-bg w-100" disabled>
						<span className="mdc-button__ripple"></span>
						<span className="mdc-button__label">Open</span>
					</button>
					<small className="mdc-typography--caption mdc-theme--secondary">
						<span className="material-icons material-icons-outlined align-bottom">warning_amber</span>
						Not available
					</small>
				</div>
				<div className="mx-1">
					<button className="mdc-button mdc-button--raised">
						<span className="mdc-button__ripple"></span>
						<span className="mdc-button__label">Download</span>
					</button>
				</div>
				<div className="d-flex flex-column mdc-theme--background">
					<button className="mdc-button mdc-button--raised mdc-theme--primary-bg w-100" disabled>
						<span className="mdc-button__ripple"></span>
						<span className="mdc-button__label">Mods</span>
					</button>
					<noscript>
						<small className="mdc-typography--caption mdc-theme--secondary">
							<span className="material-icons material-icons-outlined align-bottom">warning_amber</span>
						Not available
						</small>
					</noscript>
				</div>
			</div>
			<img src="character-halo-outline.png" className="character-halo-outline"></img>
			<img src="character-outline.png" className="character-outline"></img>
			
			<Background />
		</div>;
	}
}