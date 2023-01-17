import { useCallback, useEffect, useRef, useState } from 'react';

const AbortControllerClass = window.AbortController ?? class AbortControllerStub {
	readonly signal = {
		aborted: false,
		listeners: [] as ((ev: Event) => unknown)[],
		addEventListener(_: 'abort', event: unknown) {
			this.listeners.push(event as ((ev: Event) => unknown));
		},
		dispatchEvent(event: Event) {
			this.listeners.forEach(l => l(event));
			return true;
		},
		onabort: null,
		reason: undefined,
		removeEventListener(_: 'abort', event: unknown) {
			this.listeners.splice(this.listeners.indexOf(event as ((ev: Event) => unknown)));
		},
		throwIfAborted() {
			if (this.aborted) {
				throw new Error('asd');
			}
		},
	};
	abort() {
		if (!this.signal.aborted) {
			this.signal.aborted = true;
			this.signal.dispatchEvent(new Event('abort'));
		}
	}
} as typeof AbortController;

export function useAsync<T>(asyncFunction: (signal: AbortSignal) => Promise<T>, immediate = true) {
	const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
	const [value, setValue] = useState<T | null>(null);
	const [error, setError] = useState(null);
	const ref = useRef<{ controller: AbortController }>({} as { controller: AbortController });
	ref.current.controller ??= new AbortControllerClass();

	const execute = useCallback(() => {
		if (ref.current.controller.signal.aborted) {
			return;
		}

		setStatus('pending');
		setValue(null);
		setError(null);

		return asyncFunction(ref.current.controller.signal)
			.then((response) => {
				if (ref.current.controller.signal.aborted) {
					return;
				}

				setValue(response);
				setStatus('success');
			})
			.catch((error) => {
				if (ref.current.controller.signal.aborted) {
					return;
				}

				setError(error);
				setStatus('error');
			});
	}, [asyncFunction]);

	useEffect(() => {
		if (immediate) {
			execute();
		}

		return () => {
			ref.current.controller.abort();
		};
	}, [execute, immediate]);

	return { execute, status, value, error };
}