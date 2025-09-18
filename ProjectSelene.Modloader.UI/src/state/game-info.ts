import { Game, Mods } from '@project-selene/selene';
import * as idb from 'idb-keyval';
import { GameInfo } from './models/game';

const gameInfoStore = idb.createStore('SeleneDb-gameInfo', 'gameInfo');
const gameHandleStore = idb.createStore('SeleneDb-gameHandles', 'gameHandles');

export async function loadGameInfo(): Promise<GameInfo[]> {
    return (await idb.get('infos', gameInfoStore)) ?? [];
}


export async function ensureGameInfoMode(gameInfo: GameInfo, mode: FileSystemPermissionMode = 'read'): Promise<void> {
    if (gameInfo.type === 'filelist') {
        if (mode === 'readwrite') {
            throw new Error('Access denied');
        }
        return;
    }

    if (gameInfo.type === 'handle') {
        const handle: FileSystemDirectoryHandle | undefined = await idb.get(gameInfo.id, gameHandleStore);
        if (!handle || (await handle.requestPermission({ mode })) !== 'granted') {
            throw new Error('Access denied');
        }
        return;
    }
}


export async function openGame(mode: FileSystemPermissionMode = 'read'): Promise<GameInfo> {
    const infos = await loadGameInfo();
    const id = infos.reduce((a, b) => Math.max(a, b.id), 0) + 1;

    if ("require" in window) {
        //TODO: Folder picker
        return {
            id,
            type: 'fs',
            loaded: true,
            path: '.'
        }
    }

    const folder = await showDirectoryPicker({
        id: 'game',
        mode,
    });

    await idb.set(id, folder, gameHandleStore);

    const result: GameInfo = {
        id,
        type: 'handle',
        loaded: true,
    }

    infos.push(result);
    await idb.set('infos', infos, gameInfoStore);

    return result;
}

export async function gameFromGameInfo(gameInfo: GameInfo) {
    switch (gameInfo.type) {
        case 'handle': {
            const handle: FileSystemDirectoryHandle | undefined = await idb.get(gameInfo.id, gameHandleStore);
            if (!handle || (await handle.requestPermission({ mode: 'read' })) !== 'granted') {
                throw new Error('Access denied');
            }
            return await Game.fromFileHandle(handle);
        }
        case 'fs': {
            return await Game.fromLocalPath(gameInfo.path);
        }
        case 'filelist': throw new Error('Not implement yet');
        default: throw new Error('Unknown GameInfo type');
    }
}

export async function getDefaultModFolder(gameInfo: GameInfo): Promise<Mods> {
    switch (gameInfo.type) {
        case 'handle': {
            const handle: FileSystemDirectoryHandle | undefined = await idb.get(gameInfo.id, gameHandleStore);
            if (!handle || (await handle.requestPermission({ mode: 'read' })) !== 'granted') {
                throw new Error('Access denied');
            }
            return await Mods.fromFileHandle(await handle.getDirectoryHandle('mods'));
        }
        case 'fs': {
            return await Mods.fromLocalPath(gameInfo.path + '/mods');
        }
        case 'filelist': throw new Error('Not implement yet');
        default: throw new Error('Unknown GameInfo type');
    }
}