import { Draft, Immutable } from 'immer';

export const root = {
	state: {
		games: { loading: undefined },
		mods: { loading: undefined },
		modDb: {
			mods: { loading: undefined },
			modDetails: {},
			versionDetails: {},
		},
	} as Immutable<State>,
};

export type LoadingState<T> = {
    loading: undefined; //Not yet loaded
} | {
    loading: true; //Loading
} | {
    loading: false; //Loaded successfully
    success: true;
    data: T;
} | {
    loading: false; //Failed to load
    success: false;
    error: unknown;
};

export interface State {
    games: LoadingState<Games>;

    modDb: ModDb;
    mods: LoadingState<Mods>;
}

export type AppState = Draft<State>;

export type Store = {
    type: 'indexedDb';
    key: string;
} | {
    type: 'fs'; //Nodejs fs
    directory: string;
} | {
    type: 'handle';
    handle: FileSystemDirectoryHandle;
};

export interface Games {
    games: Game[];
    selectedGame: number;
}

export interface Game {
    store: Store;
    name: string;
}

export interface Mods {
    store: Store;
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