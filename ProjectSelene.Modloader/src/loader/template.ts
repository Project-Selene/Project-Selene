import { Filesystem } from "./filesystem";

export class Template {
    constructor(
        private readonly filesystem: Filesystem
    ) {
        
    }
    async openModFolder(): Promise<void> {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        if (!handle || (await handle.queryPermission({ mode: 'readwrite' }) !== 'granted')) {
            throw new Error('Could not access folder');
        }

        await this.filesystem.mountDirectoryHandle('/fs/internal/template/mod', handle);
    }
}