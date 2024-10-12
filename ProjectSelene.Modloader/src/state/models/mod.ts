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

export interface ModInfo {
	id: string;
	name: string;
	description: string;
	version: string;
	versions: string[];
	patches?: ModPatch[];
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
