import { Draft, Immutable, createDraft, finishDraft, produce } from 'immer';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { LoadingState, State } from '../../state';
import { root } from '../state';

interface StoredSelector<T> {
    selector: (state: Immutable<State>) => T,
    current: T,
    update: Dispatch<SetStateAction<T>>;
}

const selectors: StoredSelector<unknown>[] = [];

export function useCombinedSelector<I, O, T>(base: (input: I) => O, selector: (input: O) => T) {
	return (input: I) => selector(base(input));
}

export function useAppState<T>(selector: (state: Immutable<State>) => T) {
	const current = selector(root.state);
	const [result, update] = useState(current);

	useEffect(() => {
		const stored: StoredSelector<T> = {
			current,
			selector,
			update,
		};
		selectors.push(stored as StoredSelector<unknown>);

		const actual = stored.selector(root.state);
		if (actual !== stored.current) {
			stored.update(actual);
		}

		return () => { selectors.splice(selectors.indexOf(stored as StoredSelector<unknown>), 1); };
	}, [selector]);

	return result;
}

export function useAppCallback(callback: (state: Draft<State>) => void | Promise<void>) {
	return () => doAsync(callback);
}

export async function doAsync(callback: (state: Draft<State>) => void | Promise<void>): Promise<void>;
export async function doAsync<T>(callback: (state: Draft<State>, prepared: Awaited<T>) => void | Promise<void>, prepare: () => T | Promise<T>): Promise<void>;
export async function doAsync<T>(callback: (state: Draft<State>, prepared?: Awaited<T>) => void | Promise<void>, prepare?: () => T | Promise<T>) {
	const prepared = prepare ? await prepare() : undefined;
	const draft = createDraft(root.state);
	await callback(draft, prepared);
	root.state = finishDraft(draft);
	updateAppState();
}

export async function doLoad<T>(load: (state: Immutable<State>) => T | Promise<T>, assign: (state: Draft<State>, value: LoadingState<T>) => void, thenDo?: () => void): Promise<void> {
	root.state = produce(root.state, (state) => { assign(state, {loading: true}); });
	updateAppState();

	try {
		const data = await load(root.state);
		root.state = produce(root.state, (state) => { assign(state, {loading: false, success: true, data}); });
	} catch (error) {
		root.state = produce(root.state, (state) => { assign(state, {loading: false, success: false, error}); });
	}
	updateAppState();
	thenDo?.();
}

function updateAppState() {
	for (const stored of selectors) {
		const actual = stored.selector(root.state);
		if (actual !== stored.current) {
			stored.update(actual);
		}
	}
}