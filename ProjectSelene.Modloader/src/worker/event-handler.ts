
declare const self: WorkerGlobalScope;

export class WorkerEventHandler {
	private readonly resolveQueue = new Map<number, (arg: unknown) => void>();
	private readonly rejectQueue = new Map<number, (arg: unknown) => void>();

	constructor() {
		self.addEventListener('message', event => {
			const data = (event as MessageEvent).data as {
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


	on<T>(type: string, handle: (arg: T) => unknown | PromiseLike<unknown>) {
		self.addEventListener('message', event => {
			const data = (event as MessageEvent).data as { id: number; type: string; data: unknown };
			if (data.type === type) {
				Promise.resolve()
					.then(() => handle(data.data as T))
					.then(result =>
						postMessage({
							id: data.id,
							success: true,
							data: result,
						}),
					)
					.catch(result =>
						postMessage({
							id: data.id,
							success: false,
							data: result,
						}),
					);
			}
		});
	}
}
