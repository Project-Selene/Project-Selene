import './ui.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import reportWebVitals from './reportWebVitals';

export function startUI() {
	const root = document.getElementById('root');
	if (root) {
		ReactDOM.createRoot(root).render(
			<React.StrictMode>
				<App />
			</React.StrictMode>,
		);
	}

	// If you want to start measuring performance in your app, pass a function
	// to log results (for example: reportWebVitals(console.log))
	// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
	reportWebVitals();

	if (window.TEST || (document.visibilityState as string) === 'prerender') {
		return;
	}

	// store.dispatch(loadGames());
	// store.dispatch(loadModList());
}

if (window.TEST) {
	Object.assign(window, { startUI });
}
