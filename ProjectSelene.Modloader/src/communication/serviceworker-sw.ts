
declare const self: ServiceWorkerGlobalScope;

export class ServiceWorkerCommunication {
	private nextId = 1;
	private readonly messageQueue = new Map<
		number,
		{
			count: number;
			results: unknown[];
			success: boolean;
			resolve: (arg: unknown[] | unknown) => void;
			reject: (arg: unknown[] | unknown) => void;
		}
	>();
	constructor() {
		self.onmessage = () => void 0; //Does nothing but is required for it to work
		self.addEventListener('message', event => {
			if (event.origin !== location.origin) {
				return;
			}

			this.handleCallback(event.data);
		});
	}

	private handleCallback(data: { id: number; success: boolean; data: unknown; }) {
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
	}

	on<T>(type: string, handle: (arg: T, sourceId: string) => unknown | PromiseLike<unknown>) {
		self.addEventListener('message', event => {
			if (event.origin !== location.origin) {
				return;
			}

			if (!(event.source instanceof Client)) {
				event.source?.postMessage({
					id: event.data?.id,
					success: false,
					data: {
						sourceId: (event?.source as unknown as { id?: string })?.id,
						message: 'Can only process messages from clients',
					},
				});
				return;
			}

			const data = event.data as { id: number; type: string; data: unknown };
			if (data.type === type) {
				event.waitUntil(
					Promise.resolve()
						.then(() => handle(data.data as T, event.source instanceof Client ? event.source.id + '' : ''))
						.then(result =>
							event.source?.postMessage({
								id: data.id,
								success: true,
								data: result,
							}),
						)
						.catch(result =>
							event.source?.postMessage({
								id: data.id,
								success: false,
								data: result,
							}),
						),
				);
			}
		});
	}

	sendToClients<T>(type: string, message: unknown, clientIds: string[], maxDelay = 300) {
		const id = this.nextId++;
		const cIds = new Set(clientIds);
		return Promise.race([self.clients
			.matchAll({
				type: 'window',
			})
			.then(clients => {
				clients = clients.filter(c => cIds.has(c.id));
				if (clients.length === 0) {
					return [];
				}

				return this.internalSendToClients<T>(id, clients, type, message);
			}), this.deleteAfterDelay<T>(id, maxDelay)]);
	}

	private internalSendToClients<T>(id: number, clients: readonly WindowClient[], type: string, message: unknown) {
		return new Promise<T[]>((resolve, reject) => {
			this.messageQueue.set(id, {
				count: clients.length,
				results: [],
				success: true,
				resolve: resolve as (arg: unknown[] | unknown) => void,
				reject,
			});

			for (const client of clients) {
				client.postMessage({
					id,
					data: message,
					type,
				});
			}
		});
	}

	private deleteAfterDelay<T>(id: number, delay: number) {
		return new Promise<T[]>((_, reject) => {
			setTimeout(() => {
				this.messageQueue.delete(id);
				console.error(`Failed to receive response after ${delay} ms`);
				reject(new Error('Timeout'));
			}, delay);
		})
	}
}
