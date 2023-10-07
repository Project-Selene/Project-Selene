import { WORKER_COUNT } from './worker';

export class BroadcastCommunication {
	private readonly messageQueue = new Map<number, {count: number, results: unknown[], success: boolean, resolve: (arg: unknown[]) => void, reject:  (arg: unknown[]) => void}>();
	private readonly channel: BroadcastChannel;

	constructor(name: string) {
		this.channel = new BroadcastChannel(name);
		this.channel.onmessage = () => void 0; //Does nothing but is required for it to work
		this.channel.addEventListener('message', (event) => {
			if (event.origin !== location.origin) {
				return;
			}
			
			const data = event.data as { id: number; success: boolean; data: unknown; };

			const queue = this.messageQueue.get(data.id);
			if (queue && data.success !== undefined) {
				queue.count++;
				queue.results.push(data.data);
				if (!data.success) {
					queue.success = false;
				}
				if (queue.count >= WORKER_COUNT) {
					if (data.success) {
						queue.resolve(queue.results);
					} else {
						queue.reject(queue.results);
					}
					this.messageQueue.delete(data.id);
				}
			}
		});
	}

	send<T>(type: string, message: unknown) {
		return new Promise<T[]>((resolve, reject) => {
			const id = Math.random() * 1000000 + Math.random();
			this.messageQueue.set(id, {
				count: 0,
				results: [],
				success: true,
				resolve: resolve as (arg: unknown[]) => void,
				reject,
			});

			this.channel.postMessage(
				{
					id,
					data: message,
					type,
				},
			);
		});
	}

	on<T>(type: string, handle: (arg: T) => unknown | PromiseLike<unknown>) {
		this.channel.addEventListener('message', event => {
			if (event.origin !== location.origin) {
				return;
			}
			
			const data = event.data as { id: number; type: string; data: unknown; };
			if (data.type === type) {
				Promise.resolve()
					.then(() => handle(data.data as T))
					.then(result => this.channel.postMessage({id: data.id, success: true, data: result}))
					.catch(result => this.channel.postMessage({id: data.id, success: false, data: result}));
			}
		});
	}
}
