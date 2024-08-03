/// <reference lib="WebWorker" />

import * as idb from 'idb-keyval';
import { SingleCommunication } from '../communication/single';
import { SWCommunication } from '../communication/sw';

// export empty type because of tsc --isolatedModules flag
export type { };
declare const self: ServiceWorkerGlobalScope;

interface WorkerRegistration {
	filter: string[];
	workers: SingleCommunication[];
	lastWorker: number;
}
const workers = new Map<string, WorkerRegistration>();

const store = idb.createStore('SeleneDb-sw-cache', 'sw-cache');

const coms = new SWCommunication();
coms.on('workers', async (worker: MessagePort[], id) => {
	const reg = workers.get(id) ?? { filter: [], workers: [], lastWorker: 0 } as WorkerRegistration;
	reg.workers = worker.map(port => new SingleCommunication(port));
	workers.set(id, reg);

	await idb.set('clients', [...workers.keys()], store);
});

coms.on('filter', async (filter: string, id) => {
	const reg = workers.get(id) ?? { filter: [], workers: [], lastWorker: 0 } as WorkerRegistration;
	reg.filter.push(filter);
	workers.set(id, reg);

	await idb.set('clients', [...workers.keys()], store);
});

self.addEventListener('install', event => event.waitUntil((async () => {
	if ('addRoutes' in event) {
		// @ts-expect-error There are no types for addRoutes yet
		event.addRoutes([{
			condition: { urlPattern: 'http://localhost:8182/*' },
			source: 'network',
		}, {
			condition: { urlPattern: 'http://127.0.0.1:8182/*' },
			source: 'network',
		}, {
			condition: { urlPattern: self.origin + '/api/*' },
			source: 'race-network-and-fetch-handler',
		}]);
	}

	caches.open('selene-loader')
		.then(cache => cache.add('static/js/prefix.js'))
		.catch(() => {/* Ignore error that happens if we are local - we don't need a cache for local */ });
	await self.skipWaiting();
})()));

async function install() {
	const ids = new Set(await idb.get('clients', store) as string[] ?? []);
	const activeIds = (await self.clients.matchAll({ type: 'window' })).filter(c => ids.has(c.id)).map(c => c.id);
	await idb.set('clients', activeIds, store);
	await coms.sendToClients('install', {}, activeIds);
}
const installed = install().catch(err => console.error(err));

self.addEventListener('activate', event => event.waitUntil((async () => {
	await installed;
	await self.clients.claim();
})()));

self.addEventListener('fetch', event => event.respondWith((async () => {
	await installed;
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

			const stream = new TransformStream();

			let body: ReadableStream<Uint8Array> | null = event.request.body;
			if ((event.request.method === 'POST' || event.request.method === 'PUT') && !body) {
				//Firefox doesn't support body so just read everything and turn it into a stream
				const tstream = new TransformStream();
				body = tstream.readable;

				const writer = tstream.writable.getWriter();

				event.request.arrayBuffer()
					.then(buffer => {
						writer.write(new Uint8Array(buffer));
						writer.close();
					})
					.catch(() => writer.abort());
			}

			const response = worker.send('fetch', {
				request: {
					method: event.request.method,
					url: event.request.url,
					headers: toObject(event.request.headers),
					body,
					clientId: event.clientId,
				},
				response: stream.writable,
			},
			stream.writable,
			body,
			) as Promise<ResponseInit>;

			return new Response(
				stream.readable,
				await response,
			);
		}
	}

	return await fromNetworkOrCached(event.request);
})()));

async function fromNetworkOrCached(request: Request) {
	if (request.url.startsWith('chrome-extension') || request.method !== 'GET') {
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