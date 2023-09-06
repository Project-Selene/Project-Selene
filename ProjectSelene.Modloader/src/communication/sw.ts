declare const self: ServiceWorkerGlobalScope;

export class SWCommunication {
	private readonly messageQueue = new Map<number, {count: number, results: unknown[], success: boolean, resolve: (arg: unknown[] | unknown) => void, reject:  (arg: unknown[] | unknown) => void}>();
	private readonly swResponse = new BroadcastChannel('project-selene-worker-response');

	constructor() {
		if (!globalThis.self || !self.clients) {
			navigator.serviceWorker.onmessage = () => void 0; //Does nothing but is required for it to work
			navigator.serviceWorker.addEventListener('message', (event) => {
				const data = event.data as { id: number; success: boolean; data: unknown; };
	
				const queue = this.messageQueue.get(data.id);
				if (queue && data.success !== undefined) {
					if (data.success) {
						queue.resolve(data.data);
					} else {
						queue.reject(data.data);
					}
					this.messageQueue.delete(data.id);
				}
			});
		} else {
			self.onmessage = () => void 0; //Does nothing but is required for it to work
			self.addEventListener('message', (event) => {
				const data = event.data as { id: number; success: boolean; data: unknown; };
	
				const queue = this.messageQueue.get(data.id);
				if (queue && data.success !== undefined) {
					queue.count--;
					queue.results.push(data.data);
					if (!data.success) {
						queue.success = false;
					}
					if (queue.count <= 0) {
						if (data.success) {
							queue.resolve(queue.results);
						} else {
							queue.reject(queue.results);
						}
						this.messageQueue.delete(data.id);
					}
				}
			});
			this.swResponse.onmessage = ((event: ExtendableMessageEvent) => {
				const data = event.data as { id: number; success: boolean; data: unknown; };
	
				const queue = this.messageQueue.get(data.id);
				if (queue && data.success !== undefined) {
					queue.count--;
					queue.results.push(data.data);
					if (!data.success) {
						queue.success = false;
					}
					if (queue.count <= 0) {
						if (data.success) {
							queue.resolve(queue.results);
						} else {
							queue.reject(queue.results);
						}
						this.messageQueue.delete(data.id);
					}
				}
			}) as () => void;
		}
	}

	sendToClients<T>(type: string, message: unknown, clientIds: string[]) {
		const cIds = new Set(clientIds);
		return self.clients.matchAll({
			type: 'window',
		})
			.then(clients => {
				clients = clients.filter(c => cIds.has(c.id));
				if (clients.length === 0) {
					return [];
				}

				return new Promise<T[]>((resolve, reject) => {
					const id = Math.random() * 1000000 + Math.random();
					this.messageQueue.set(id, {
						count: clients.length,
						results: [],
						success: true,
						resolve: resolve as (arg: unknown[] | unknown) => void,
						reject,
					});
		
					for (const client of clients) {
						client.postMessage(
							{
								id,
								data: message,
								type,
							},
						);
					}
				});
			});
	}

	sendToSW<T>(type: string, message: unknown, ...transferables: unknown[]) {
		return new Promise<T[]>((resolve, reject) => {
			const id = Math.random() * 1000000 + Math.random();
			this.messageQueue.set(id, {
				count: 0,
				results: [],
				success: true,
				resolve: resolve as (arg: unknown[] | unknown) => void,
				reject,
			});
		
			navigator.serviceWorker.ready.then(sw => sw.active?.postMessage({
				id,
				data: message,
				type,
			}, transferables as Transferable[]));
		});
	}

	on<T>(type: string, handle: (arg: T, sourceId: string) => unknown | PromiseLike<unknown>) {
		if (!globalThis.self || !self.clients) {
			navigator.serviceWorker.addEventListener('message', event => {
				const data = event.data as { id: number; type: string; data: unknown; };
				if (data.type === type) {
					Promise.resolve()
						.then(() => handle(data.data as T, ''))
						.then(result => this.swResponse.postMessage({id: data.id, success: true, data: result}))
						.catch(result => this.swResponse.postMessage({id: data.id, success: false, data: result}));
				}
			});
		} else {
			self.addEventListener('message', event => {
				if (!(event.source instanceof Client)) {
					event.source?.postMessage({ id: event.data?.id, success: false, data: {sourceId: (event?.source as unknown as {id?: string})?.id, message: 'Can only process messages from clients'}  });
					return;
				}
				
				const data = event.data as { id: number; type: string; data: unknown; };
				if (data.type === type) {
					event.waitUntil(
						Promise.resolve()
							.then(() => handle(data.data as T, event.source instanceof Client ? event.source.id + '' : ''))
							.then(result => event.source?.postMessage({id: data.id, success: true, data: result}))
							.catch(result => event.source?.postMessage({id: data.id, success: false, data: result})),
					);
				}
			});
		}
	}
}
