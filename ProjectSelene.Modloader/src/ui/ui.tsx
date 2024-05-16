import './ui.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { OpenAPI } from '../moddb/generated';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { completeLogin, getUser, loadGames, loadModList, loadState, store } from './state/state.reducer';

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
	reportWebVitals(console.log);

	if (document.visibilityState as string === 'prerender') {
		return;
	}

	const url = new URL(location.href);
	if (url.searchParams.has('code') && url.searchParams.has('state')) {
		const state = JSON.parse(localStorage.getItem('loginstate') ?? '{}')[url.searchParams.get('state') ?? ''];
		if (state) {
			localStorage.removeItem('loginstate');
			store.dispatch(loadState(state));
		}

		const code = url.searchParams.get('code') ?? '';
		store.dispatch(completeLogin(code));

		url.searchParams.delete('code');
		url.searchParams.delete('state');
		history.replaceState({}, document.title, url.toString());
	}
	localStorage.removeItem('loginstate');

	if (localStorage.getItem('token')) {
		OpenAPI.TOKEN = localStorage.getItem('token') ?? '';
		store.dispatch(getUser());
	}

	store.dispatch(loadGames());
	store.dispatch(loadModList());
}