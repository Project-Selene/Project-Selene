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
	const reg = workers.get(event.clientId);
	if (!reg) {
		return await fetch(event.request);
	}

	for (const filter of reg.filter) {
		if (new URL(event.request.url).pathname.startsWith(filter)) {
			const next = ((reg.lastWorker ?? 0) + 1) % reg.workers.length;
			const worker = reg.workers[next];
			reg.lastWorker = next;

			const stream = new TransformStream();

			worker.postMessage({
				type: 'fetch',
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
				{ status: 200 },
			);
		}
	}
	return await fetch(event.request);
})()));

function toObject(headers: Headers) {
	const result: Record<string, string> = {};
	headers.forEach((value, key) => result[key] = value);
	return result;
}