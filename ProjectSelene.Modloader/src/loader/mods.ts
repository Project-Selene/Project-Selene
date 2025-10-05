import { filesystem } from "./filesystem";

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


export class Mods {
    private static nextId = 0;
    private nextModId = 0;

    private readonly mountedMods: Record<string, number> = {};
    private constructor(
        private readonly id: number,
        private readonly mode: FileSystemPermissionMode,
    ) { }

    public static async fromFileHandle(handle: FileSystemDirectoryHandle, mode: FileSystemPermissionMode = 'readwrite') {
        const id = this.nextId++;
        await filesystem.mountDirectoryHandle('/fs/internal/mods/' + id + '/folder', handle);
        return new Mods(id, mode);
    }

    public static async fromLocalPath(path: string, mode: FileSystemPermissionMode = 'readwrite') {
        const id = this.nextId++;
        await filesystem.mountDirectoryFS('/fs/internal/mods/' + id + '/folder', path);
        return new Mods(id, mode);
    }

    public static async fromFileList(files: FileList) {
        const id = this.nextId++;
        await filesystem.mountFileList('/fs/internal/mods/' + id + '/folder', files);
        return new Mods(id, 'read');
    }

    public getCollectionId() {
        return this.id;
    }

    public async deleteMod(id: string) {
        if (this.mode === 'read') {
            throw new Error('Cannot delete mod from a readonly mods folder');
        }

        let filename: string | undefined;
        try {
            const manifests = await this.readManifests();
            const internalId = Object.entries(manifests).find(m => m[1].id === id)?.[0];
            if (!internalId) {
                console.warn('Could not find mod with id ' + id);
                return;
            }
            filename = Object.entries(this.mountedMods).find(m => m[1] === +internalId)?.[0];
        } catch {
            //Could not find mod name -> assume it's not installed
        }
        if (!filename) {
            console.warn('Could not find mod with id ' + id);
            return;
        }

        await filesystem.delete('/fs/internal/mods/' + this.id + '/folder/' + filename);
        await this.unmountMod(filename);
    }

    public async installMod(name: string, content: ReadableStream<Uint8Array>) {
        if (this.mode === 'read') {
            throw new Error('Cannot install mod into a readonly mods folder');
        }

        await filesystem.writeFile('/fs/internal/mods/' + this.id + '/folder/' + name, content);
        await this.mountMod(name);
    }


    public async refreshMods(): Promise<ModManifest[]> {
        const leftOverMods = new Set(Object.keys(this.mountedMods));
        const result: ModManifest[] = [];
        try {
            const zipMods = await filesystem.readDir('/fs/internal/mods/' + this.id + '/folder/');
            for (const mod of zipMods) {
                if (!mod.isDir && mod.name.endsWith('.mod.zip')) {
                    const modId = await this.mountMod(mod.name);

                    try {
                        result.push(await this.readManifest(modId));
                    } catch {
                        console.warn('Invalid mod: ' + mod.name);
                        this.unmountMod(mod.name);
                    }

                    leftOverMods.delete(mod.name);
                }
            }

            for (const filename of leftOverMods) {
                this.unmountMod(filename);
            }
        } catch {
            //This happens mostly if the mod directory doesn't exist. Ignore.
        }

        return result;
    }

    private async mountMod(filename: string) {
        if (filename in this.mountedMods) {
            return this.mountedMods[filename];
        }

        const modId = this.nextModId++;

        await filesystem.mountZip(
            '/fs/internal/mods/' + this.id + '/mods/' + modId + '/',
            '/fs/internal/mods/' + this.id + '/folder/' + filename,
        );
        this.mountedMods[filename] = modId;
        return modId;
    }

    private async unmountMod(filename: string) {
        if (!(filename in this.mountedMods)) {
            return;
        }

        delete this.mountedMods[filename]
        //TODO: unmount mod files
    }

    public async readManifests() {
        const mods: Record<number, ModManifest> = {};
        for (const [filename, modId] of Object.entries(this.mountedMods)) {
            try {
                const manifest = await this.readManifest(modId);
                mods[modId] = manifest;
            } catch (e) {
                console.error('Invalid mod: ' + filename, e);
            }
        }
        return mods;
    }

    private async readManifest(modId: number): Promise<ModManifest> {
        const manifestText = await filesystem.readFile(
            '/fs/internal/mods/' + this.id + '/mods/' + modId + '/manifest.json',
        );
        const manifest = JSON.parse(manifestText);
        return manifest;
    }
}