export class ServiceWorkerCommunicationClient {
	private nextId = 1;
	private readonly messageQueue = new Map<
		number,
		{
			resolve: (arg: unknown[] | unknown) => void;
			reject: (arg: unknown[] | unknown) => void;
		}
	>();

	constructor() {
		navigator.serviceWorker.onmessage = () => void 0; //Does nothing but is required for it to work
		navigator.serviceWorker.addEventListener('message', event => {
			if (event.origin !== location.origin) {
				return;
			}

			this.handleCallback(event.data);
		});
	}

	private handleCallback(data: { id: number; success: boolean; data: unknown; }) {
		const queue = this.messageQueue.get(data.id);
		if (queue && data.success !== undefined) {
			if (data.success) {
				queue.resolve(data.data);
			} else {
				queue.reject(data.data);
			}
			this.messageQueue.delete(data.id);
		}
	}

	sendToSW<T>(type: string, message: unknown, ...transferables: unknown[]) {
		return new Promise<T[]>((resolve, reject) => {
			const id = this.nextId++;
			this.messageQueue.set(id, {
				resolve: resolve as (arg: unknown[] | unknown) => void,
				reject,
			});

			navigator.serviceWorker.ready.then(sw =>
				sw.active?.postMessage(
					{
						id,
						data: message,
						type,
					},
					transferables as Transferable[],
				),
			);
		});
	}

	on<T>(type: string, handle: (arg: T, sourceId: string) => unknown | PromiseLike<unknown>) {
		navigator.serviceWorker.addEventListener('message', event => {
			const source = event.source;
			if (event.origin !== location.origin || !source) {
				return;
			}

			const data = event.data as { id: number; type: string; data: unknown };
			if (data.type === type) {
				Promise.resolve()
					.then(() => handle(data.data as T, ''))
					.then(result =>
						source.postMessage({
							id: data.id,
							success: true,
							data: result,
						}),
					)
					.catch(result =>
						source.postMessage({
							id: data.id,
							success: false,
							data: result,
						}),
					);
			}
		});
	}
}
