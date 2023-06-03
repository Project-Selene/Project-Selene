import { Draft, Immutable } from 'immer';

export const root = {
	state: {
		games: {},
		selectedGame: 0,
		mods: {},
		modDb: {
			mods: {},
			modDetails: {},
			versionDetails: {},
		},
	} as Immutable<State>,
};

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
    data: T;
    error: unknown;
};

export interface State {
    games: LoadingState<Games>;

    modDb: ModDb;
    mods: LoadingState<Mods>;
}

export type AppState = Draft<State>;

export interface Games {
    games: Game[];
    selectedGame: number;
}

export interface Game {
    internalName: string;
    name: string;
}

export interface Mods {
    mods: Mod[];
}

export interface Mod {
    internalName: string;
    currentInfo: ModInfo;
    enabled: boolean;
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