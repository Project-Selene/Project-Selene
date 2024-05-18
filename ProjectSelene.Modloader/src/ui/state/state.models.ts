import { UserInfo } from '../../moddb/generated';
import { LoadingState } from './models/loading-state';
import { Mod, ModInfo } from './models/mod';

export interface State {
    gamesInfo: GamesInfo;

    modDb: ModDb;
    mods: LoadingState<Mods>;

    ui: UIState;

    user?: UserInfo;
}

export interface UIState {
    mods: {
        open: boolean,
        installedOpen: boolean,
        availableOpen: boolean,
    };
    infoOpen: boolean;
    openOpen: boolean;
    playing: boolean;
}

export interface GamesInfo {
    games: GameInfo[];
    selectedGame: number;
}

export type GameInfo = {
    id: number;
    type: 'handle';
    loaded: boolean;
} | {
    id: number;
    type: 'fs';
    path: string;
    loaded: boolean;
} | {
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
