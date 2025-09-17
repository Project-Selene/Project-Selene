export interface Mod {
	id: string;
	isInstalled: boolean;
	hasUpdate: boolean;

	name: string;
	description: string;
	version: string;

	latestVersion?: string;
}

export interface ModManifest {
	id: string;
	name: string;
	description: string;
	version: string;
	patches?: ModPatch[];
}

export interface ModPatch {
	target: string;
	type: 'json' | 'raw';
}
