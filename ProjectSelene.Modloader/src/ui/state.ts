import { Immutable } from 'immer';
import { Loader } from '../loader/loader';
import { State } from '../state';

export const root = {
	state: {
		gamesInfo: {},
		games: [],
		selectedGame: 0,
		mods: {
			loading: false,
			success: true,
			data: {
				mods: [{
					internalName: 'asd',
					enabled: true,
					currentInfo: {
						name: 'b',
						description: 'lorem ipsum',
						id: 2,
						version: '0.0.0',
					},
				}, {
					internalName: 'example',
					enabled: true,
					currentInfo: {
						name: 'a',
						description: 'lorem ipsum',
						id: 1,
						version: '1.0.0',
					},
				}],
			},
		},
		modDb: {
			mods: {
				loading: false,
				success: true,
				data: [{
					id: 1,
					description: 'asdf',
					name: 'a',
					version: '1.1.1',
				}, {
					id: 3,
					description: 'coolMod description',
					name: 'c',
					version: '1.1.1',
				}],
			},
			modDetails: {},
			versionDetails: {},
		},
		ui: {
			modsOpen: false,
		},
	} as Immutable<State>,
	loader: new Loader(),
};
