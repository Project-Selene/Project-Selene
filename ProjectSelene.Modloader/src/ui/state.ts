import { Immutable } from 'immer';
import { Filesystem } from '../loader/filesystem';
import { Game } from '../loader/game';
import { Loader } from '../loader/loader';
import { ModDB } from '../moddb/moddb';
import { State } from '../state';

const filesystem = new Filesystem();
const game = new Game(filesystem);
const loader = new Loader(filesystem, game);

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
	filesystem,
	game,
	loader,
	moddb: new ModDB(),
};
