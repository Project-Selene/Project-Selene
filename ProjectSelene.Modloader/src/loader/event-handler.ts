export class ClientEventHandler {
	private readonly resolveQueue = new Map<number, (arg: unknown) => void>();
	private readonly rejectQueue = new Map<number, (arg: unknown) => void>();

	constructor(private readonly messagePort: {
		onmessage: null | ((event: MessageEvent) => unknown),
		addEventListener: (type: 'message', cb: (event: MessageEvent) => unknown) => unknown,
		postMessage: (message: unknown, transferables: Transferable[]) => unknown,
	}) {
		this.messagePort.onmessage = () => void 0; //Does nothing but is required for it to work
		this.messagePort.addEventListener('message', event => {
			const data = event.data as {
				id: number;
				success: boolean;
				data: unknown;
			};
			if (data.success) {
				this.resolveQueue.get(data.id)?.(data.data);
			} else {
				this.rejectQueue.get(data.id)?.(data.data);
			}
			this.resolveQueue.delete(data.id);
			this.rejectQueue.delete(data.id);
		});
	}

	send<T>(type: string, message: unknown, ...transferables: unknown[]) {
		return new Promise<T>((resolve, reject) => {
			const id = Math.random() * 1000000 + Math.random();
			this.resolveQueue.set(id, resolve as (arg: unknown) => void);
			this.rejectQueue.set(id, reject);

			this.messagePort.postMessage(
				{
					id,
					data: message,
					type,
				},
				transferables.filter(t => t) as Transferable[],
			);
		});
	}

	on<T>(type: string, handle: (arg: T) => unknown | PromiseLike<unknown>) {
		this.messagePort.addEventListener('message', event => {
			const data = event.data as { id: number; type: string; data: unknown };
			if (data.type === type) {
				Promise.resolve()
					.then(() => handle(data.data as T))
					.then(result =>
						this.messagePort.postMessage({
							id: data.id,
							success: true,
							data: result,
						}, []),
					)
					.catch(result =>
						this.messagePort.postMessage({
							id: data.id,
							success: false,
							data: result,
						}, []),
					);
			}
		});
	}
}
