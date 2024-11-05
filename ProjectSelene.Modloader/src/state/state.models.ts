import { UserInfo } from '../moddb/generated';
import { LoadingState } from './models/loading-state';
import { Mod, ModInfo } from './models/mod';

export interface State {
	gamesInfo: GamesInfo;

	modDb: ModDb;
	mods: LoadingState<Mods>;
	devMod: LoadingState<Mod>;

	options: Options;
	ui: UIState;

	user?: UserInfo;
}

export interface Options {
	mods: Record<
		string,
		{
			enabled: boolean;
		}
	>;
}

export interface UIState {
	mods: {
		open: boolean;
		search: string;
		installedOpen: boolean;
		availableOpen: boolean;
	};
	options: {
		open: boolean;
		seleneOptionsExpanded: boolean;
		modsExpanded: Record<string, boolean>;
	};
	createMod: {
		open: boolean;
		name: string;
		description: string;
		folderSelected: boolean;
		createSubfolder: boolean;
	};
	infoOpen: boolean;
	openOpen: boolean;
	playing: boolean;
	status?: string;
}

export interface GamesInfo {
	games: GameInfo[];
	selectedGame: number;
}

export type GameInfo =
	| {
			id: number;
			type: 'handle';
			loaded: boolean;
	  }
	| {
			id: number;
			type: 'fs';
			path: string;
			loaded: boolean;
	  }
	| {
			id: number;
			type: 'filelist';
			loaded: boolean;
	  };

export interface Mods {
	mods: Mod[];
}

export interface ModDb {
	mods: LoadingState<ModInfo[]>;
}
