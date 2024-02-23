import { UserInfo } from '../../moddb/generated';
import { LoadingState } from './models/loading-state';
import { Mod, ModDetails, ModInfo, VersionDetails } from './models/mod';

export interface State {
    gamesInfo: GamesInfo;

    modDb: ModDb;
    mods: LoadingState<Mods>;

    ui: UIState;

    user?: UserInfo;
}

export interface UIState {
    modsOpen: boolean;
    modsTab: number;
    infoOpen: boolean;
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
};

export interface Mods {
    mods: Mod[];
}

export interface ModDb {
    mods: LoadingState<ModInfo[]>;
    modDetails: Record<number, LoadingState<ModDetails>>
    versionDetails: Record<number, Record<string, LoadingState<VersionDetails>>>;
}
