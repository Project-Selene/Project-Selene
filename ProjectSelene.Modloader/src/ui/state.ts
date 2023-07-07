import { Immutable } from 'immer';
import { Loader } from '../loader/loader';
import { ModDB } from '../moddb/moddb';
import { State } from '../state';

export const root = {
	state: {
		gamesInfo: {},
		games: [],
		selectedGame: 0,
		mods: {},
		modDb: {
			mods: {},
			modDetails: {},
			versionDetails: {},
		},
		ui: {
			modsOpen: false,
		},
	} as Immutable<State>,
	loader: new Loader(),
	moddb: new ModDB(),
};
