import { LoadingState } from './models/loading-state';
import { Mod, ModDetails, ModInfo, VersionDetails } from './models/mod';

export interface State {
    gamesInfo: LoadingState<GamesInfo>;

    modDb: ModDb;
    mods: LoadingState<Mods>;

    ui: UIState;
}

export interface UIState {
    modsOpen: boolean;
    modsTab: number;
    infoOpen: boolean;
}

export interface GamesInfo {
    games: Array<{
        id: number;
    }>;
    selectedGame: number;
}

export interface Mods {
    mods: Mod[];
}

export interface ModDb {
    mods: LoadingState<ModInfo[]>;
    modDetails: Record<number, LoadingState<ModDetails>>
    versionDetails: Record<number, Record<string, LoadingState<VersionDetails>>>;
}
