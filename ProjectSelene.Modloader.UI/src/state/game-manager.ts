import { Game, loader, ModManifest, Mods } from '@project-selene/selene';
import * as idb from 'idb-keyval';

const gameInfoStore = idb.createStore('SeleneDb-gameInfo', 'gameInfo');

interface GameInfo {
    game?: HandleInfo;
    mods: HandleInfo[];
}

type HandleInfo = {
    type: 'handle';
    handle: FileSystemDirectoryHandle;
} | {
    type: 'fs';
    path: string;
};



declare global {
    interface HTMLInputElement {
        nwdirectory: boolean;
    }
}

export class GameManager {
    private gameInfo: GameInfo = { mods: [] };

    private game: Game | null = null;
    private mods: Mods[] = [];

    public async load(): Promise<boolean> {
        const info = await idb.get('0', gameInfoStore);
        if (!info) {
            return false;
        }

        this.gameInfo = info;

        if (this.gameInfo.game) {
            switch (this.gameInfo.game.type) {
                case 'handle':
                    this.game = await Game.fromFileHandle(this.gameInfo.game.handle);
                    break;
                case 'fs':
                    this.game = await Game.fromLocalPath(this.gameInfo.game.path);
                    break;
            }
        }

        for (const modInfo of this.gameInfo.mods) {
            switch (modInfo.type) {
                case 'handle':
                    this.mods.push(await Mods.fromFileHandle(modInfo.handle));
                    break;
                case 'fs':
                    this.mods.push(await Mods.fromLocalPath(modInfo.path));
                    break;
            }
        }

        return true;
    }

    public async save(): Promise<void> {
        await idb.set('0', this.gameInfo, gameInfoStore);
    }

    public getGame(): Game | null {
        return this.game;
    }

    public getMods(): Mods[] {
        return this.mods;
    }

    public getOrOpenGame(): Promise<Game> {
        if (this.game) {
            return Promise.resolve(this.game);
        }

        return this.openGameDirectory().then(() => {
            if (!this.game) {
                throw new Error('Game not opened');
            }
            return this.game;
        });
    }

    public async openGameDirectory(mode: FileSystemPermissionMode = 'read'): Promise<void> {
        if ("require" in window) {
            this.gameInfo.game = {
                type: 'fs',
                path: '.',
            };
            this.game = await Game.fromLocalPath(this.gameInfo.game.path, mode);
            if (this.mods.length === 0) {
                await this.openDefaultModDirectory();
            }

            await this.save();
            return;
        }

        this.gameInfo.game = await this.openDirectory('game', mode);
        switch (this.gameInfo.game.type) {
            case 'handle':
                this.game = await Game.fromFileHandle(this.gameInfo.game.handle);
                if (this.mods.length === 0) {
                    await this.openDefaultModDirectory();
                }
                break;
            case 'fs':
                this.game = await Game.fromLocalPath(this.gameInfo.game.path);
                if (this.mods.length === 0) {
                    await this.openDefaultModDirectory();
                }
                break;
        }
        await this.save();
    }

    public async openDefaultModDirectory(): Promise<void> {
        switch (this.gameInfo.game?.type) {
            case 'handle':
                {
                    let handle: FileSystemDirectoryHandle;
                    try {
                        handle = await this.gameInfo.game.handle.getDirectoryHandle('mods');
                    } catch {
                        console.warn('Could not open mods directory.');
                        return;
                    }

                    this.mods.push(await Mods.fromFileHandle(handle));
                    this.gameInfo.mods.push({ type: 'handle', handle });
                    break;
                }
            case 'fs':
                this.mods.push(await Mods.fromLocalPath(this.gameInfo.game.path + '/mods'));
                this.gameInfo.mods.push({ type: 'fs', path: this.gameInfo.game.path + '/mods' });
                break;
            default:
                throw new Error('Game directory not opened');
        }
    }


    public async openModDirectory(mode: FileSystemPermissionMode = 'read'): Promise<void> {
        const mod = await this.openDirectory('mod-' + this.gameInfo.mods.length, mode);
        this.gameInfo.mods.push(mod);
        switch (mod.type) {
            case 'handle':
                this.mods.push(await Mods.fromFileHandle(mod.handle));
                break;
            case 'fs':
                this.mods.push(await Mods.fromLocalPath(mod.path));
                break;
        }
        await this.save();
    }

    private async openDirectory(id: string, mode: FileSystemPermissionMode = 'read'): Promise<HandleInfo> {
        if ("require" in window) {
            const { promise, reject, resolve } = Promise.withResolvers<HandleInfo>();

            const input = document.createElement('input');
            input.type = 'file';
            input.nwdirectory = true;
            input.onchange = () => resolve({
                type: 'fs',
                path: input.value,
            })
            input.onerror = () => reject(new Error('User cancelled the dialog'));
            input.click();

            return promise;
        }

        const folder = await showDirectoryPicker({
            id,
            mode,
        });
        return {
            type: 'handle',
            handle: folder,
        };
    }

    public async refreshModManifests(): Promise<ModManifest[]> {
        const manifests: Record<string, ModManifest> = {};
        for (const mod of this.mods) {
            try {
                const modManifests = await mod.refreshMods();
                for (const [id, manifest] of Object.entries(modManifests)) {
                    manifests[id] = manifest;
                }
            } catch (e) {
                console.warn('Error occurred loading mods. Proceeding without mods.', e)
            }
        }
        return Object.values(manifests).sort((a, b) => a.name.localeCompare(b.name));
    }

    async play(withDevMod: boolean): Promise<void> {
        if (!this.game) {
            await this.openGameDirectory('read');
        }

        try {
            for (const mod of this.mods) {
                await mod.refreshMods();
            }
        } catch {
            console.warn('Error occurred loading mods. Proceeding without mods.')
        }

        return await loader.play(this.game!, withDevMod, ...this.mods);
    }
}

export const gameManager = new GameManager();