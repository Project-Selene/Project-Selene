import * as idb from 'idb-keyval';

const store = idb.createStore('SeleneDb-sw-cache', 'sw-cache');

declare const self: ServiceWorkerGlobalScope;

export class ServiceWorkerClients {
    private clients: string[] = [];

    public async load() {
        this.clients = ((await idb.get('clients', store)) as string[]) ?? [];
        await this.removeInactiveClients();
    }

    public async removeInactiveClients() {
        const ids = (await self.clients.matchAll({ type: 'window' }))
            .filter(c => this.clients.includes(c.id))
            .map(c => c.id)
            .sort();

        await idb.set('clients', ids, store);
        this.clients = ids;
    }

    public getClients() {
        return this.clients;
    }


    public async addClient(id: string) {
        this.clients.push(id);
        this.clients.sort();
        await idb.set('clients', this.clients, store);
    }
}