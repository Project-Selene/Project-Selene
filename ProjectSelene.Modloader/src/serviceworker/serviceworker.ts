/// <reference lib="WebWorker" />

import { WorkerMessage } from '../worker/worker-message';
import { SWMessage, SWMessageResponse } from './sw-message';

// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: ServiceWorkerGlobalScope;

interface WorkerRegistration {
	filter: string[];
	workers: MessagePort[];
	lastWorker: number;
}
const workers = new Map<string, WorkerRegistration>();
const callbacks = new Map<number, (data: unknown) => void>();

const workerBroadcast = new BroadcastChannel('project-selene-worker-broadcast');
workerBroadcast.addEventListener('message', event => {
	if (event.data?.type === 'response') {
		callbacks.get(event.data.id)?.(event.data);
	}
});

self.addEventListener('install', event => event.waitUntil((async () => {
	await self.skipWaiting();
})()));

self.addEventListener('activate', event => event.waitUntil((async () => {
	await self.clients.claim();
})()));


self.addEventListener('message', event => {
	
	event.source?.postMessage({ type: 'ok' } as SWMessageResponse);
	event.waitUntil((async () => {
		if (!(event.source instanceof Client)) {
			event.source?.postMessage({ type: 'error', sourceId: (event?.source as unknown as {id?: string})?.id, message: 'Can only process messages from clients'  } as SWMessageResponse);
			return;
		}
		
		const data: SWMessage = event.data;
		const source = event.source as Client;
	
		switch (data.type) {
		case 'workers': {
			const reg = workers.get(source.id) ?? {filter: [], workers: [], lastWorker: 0} as WorkerRegistration; 
			reg.workers = data.workers;
			workers.set(source.id, reg);
			source.postMessage({ type: 'ok', sourceId: source.id } as SWMessageResponse);
			break;
		}
		case 'filter': {
			const reg = workers.get(source.id) ?? {filter: [], workers: [], lastWorker: 0} as WorkerRegistration; 
			reg.filter.push(data.start);
			workers.set(source.id, reg);
			source.postMessage({ type: 'ok', sourceId: source.id } as SWMessageResponse);
			break;
		}
		default:
			source.postMessage({ type: 'error', sourceId: source.id, message: 'Unknown message type: ' + (data as unknown as {type: string}).type } as SWMessageResponse);
			break;
		}
	
	})());});

self.addEventListener('fetch', event => event.respondWith((async () => {
	if (event.request.headers.get('Accept') === 'text/event-stream') {
		return fetch(event.request);
	}

	const reg = workers.get(event.clientId);
	if (!reg) {
		return await fromNetworkOrCached(event.request);
	}

	for (const filter of reg.filter) {
		if (new URL(event.request.url).pathname.startsWith(filter)) {
			const next = ((reg.lastWorker ?? 0) + 1) % reg.workers.length;
			const worker = reg.workers[next];
			reg.lastWorker = next;

			const id = Math.random();
			const wait = waitForResponse<{response: ResponseInit}>(id);

			const stream = new TransformStream();

			worker.postMessage({
				type: 'fetch',
				id,
				request: {
					method: event.request.method,
					url: event.request.url,
					headers: toObject(event.request.headers),
					body: event.request.body,
					clientId: event.clientId,
				},
				response: stream.writable,
			} as WorkerMessage,
			[
				stream.writable,
				...(event.request.body ? [event.request.body] : []),
			]);

			return new Response(
				stream.readable,
				(await wait).response,
			);
		}
	}

	return await fromNetworkOrCached(event.request);
})()));

async function fromNetworkOrCached(request: Request) {
	if (request.url.startsWith('chrome-extension')) {
		return fetch(request);
	}
	
	if (!navigator.onLine) {
		const cached = await caches.match(request);
		if (cached) {
			return cached;
		}
	}

	try {
		const response = await fetch(request);
		
		const cache = await caches.open('selene-loader');
		await cache.put(request, response.clone());

		return response;
	} catch {
		const cached = await caches.match(request);
		if (cached) {
			return cached;
		}

		return new Response('Network error happened', {
			status: 408,
			headers: { 'Content-Type': 'text/plain' },
		});
	}
}

function toObject(headers: Headers) {
	const result: Record<string, string> = {};
	headers.forEach((value, key) => result[key] = value);
	return result;
}

function waitForResponse<T>(id: number): Promise<T> {
	return new Promise(resolve => callbacks.set(id, resolve as unknown as (data: unknown) => void));
}