import { Immutable } from 'immer';

export type LoadingState<T> = {
    loading?: undefined; //Not yet loaded
    success?: undefined;
    data?: T;
    error?: unknown;
} | {
    loading: true; //Loading
    success?: undefined;
    data?: T;
    error?: unknown;
} | {
    loading: false; //Loaded successfully
    success: true;
    data: T;
    error?: unknown;
} | {
    loading: false; //Failed to load
    success: false;
    data?: T;
    error: unknown;
};

export type AppState = Immutable<State>;

export interface State {
    gamesInfo: LoadingState<GamesInfo>;

    modDb: ModDb;
    mods: LoadingState<Mods>;

    ui: UIState;
}

export interface UIState {
    modsOpen: boolean;
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

export interface Mod {
    internalName: string;
    filename: string;
    currentInfo: ModInfo;
    enabled: boolean;
}

export interface ModPatch {
    target: string;
    type: 'json' | 'raw';
}

export interface ModDb {
    mods: LoadingState<ModInfo[]>;
    modDetails: Record<number, LoadingState<ModDetails>>
    versionDetails: Record<number, Record<string, LoadingState<VersionDetails>>>;
}

export interface ModInfo {
    id: number;
    name: string;
    description: string;
    version: string;
    patches: ModPatch[];
}

export interface ModDetails {
    name: string;
    description: string;
    author: string;
    versions: string[];
}

export interface VersionDetails {
    version: string;
    submittedBy: string;
    submittedOn: number; //TODO: Check type
    verified: boolean;
    artifacts: Artifact[];
}

export interface Artifact {
    id: number;
    url: string;
}