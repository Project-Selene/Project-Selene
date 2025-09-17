import { ServiceWorkerCommunication } from '../communication/serviceworker-sw';
import { SingleCommunication } from '../communication/single';
import { ServiceWorkerClients } from './sw-clients';

// export empty type because of tsc --isolatedModules flag
export type { };

declare const self: ServiceWorkerGlobalScope;

interface WorkerRegistration {
	workers: SingleCommunication[];
	lastWorker: number;
}
const workers = new Map<string, WorkerRegistration>();

const swClients = new ServiceWorkerClients();

const coms = new ServiceWorkerCommunication();
coms.on('workers', async (worker: MessagePort[], id) => {
	workers.set(id, {
		lastWorker: 0,
		workers: worker.map(port => new SingleCommunication(port))
	});

	await swClients.addClient(id);
});

self.addEventListener('install', (event) => {
	if ('addRoutes' in event) {
		// @ts-expect-error There are no types for addRoutes yet
		event.addRoutes([
			{
				condition: { urlPattern: 'http://localhost:8182/*' },
				source: 'network',
			},
			{
				condition: { urlPattern: 'http://127.0.0.1:8182/*' },
				source: 'network',
			},
			{
				condition: { urlPattern: self.origin + '/api/*' },
				source: 'race-network-and-fetch-handler',
			},
		]);
	}
	self.skipWaiting();
	return event.waitUntil(
		caches
			.open('selene-loader')
			.then(cache => cache.add('static/js/prefix.js'))
			.catch(() => {
				/* Ignore error that happens if we are local - we don't need a cache for local */
			})
	);
},
);

async function install() {
	await swClients.load();
	await coms.sendToClients('install', {}, swClients.getClients(), 300);
}
const installed = install().catch(err => console.error(err));

self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', event =>
	event.respondWith(
		installed.then(() => {
			if (event.request.headers.get('Accept') === 'text/event-stream') {
				return fetch(event.request);
			}

			const reg = workers.get(event.clientId);
			if (!reg) {
				return fromNetworkOrCached(event.request);
			}

			return sendToWorker(event, reg);
		})
	),
);

async function sendToWorker(event: FetchEvent, reg: WorkerRegistration) {
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

		event.request
			.arrayBuffer()
			.then(buffer => {
				writer.write(new Uint8Array(buffer));
				writer.close();
			})
			.catch(() => writer.abort());
	}

	const response = worker.send(
		'fetch',
		{
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

	return new Response(stream.readable, await response);
}

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
	headers.forEach((value, key) => (result[key] = value));
	return result;
}
