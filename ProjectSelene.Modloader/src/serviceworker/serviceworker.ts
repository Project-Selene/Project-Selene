// export empty type because of tsc --isolatedModules flag
export type { };

declare const self: ServiceWorkerGlobalScope;


self.addEventListener('install', (event) => {
	if ('addRoutes' in event) {
		// @ts-expect-error There are no types for addRoutes yet
		event.addRoutes([
			{
				condition: { urlPattern: 'http://localhost:8182/.*' },
				source: 'network',
			},
			{
				condition: { urlPattern: 'http://127.0.0.1:8182/.*' },
				source: 'network',
			},
			{
				condition: { urlPattern: { baseURL: self.origin, pathname: '/project-selene.zip' } },
				source: 'network',
			},
			{
				condition: { urlPattern: { pathname: '/static/*', hostname: '*' } },
				source: { cacheName: "selene-loader" }
			},
			{
				condition: { urlPattern: { pathname: '/index.html', hostname: '*' } },
				source: { cacheName: "selene-loader" }
			},
			{
				condition: { urlPattern: { pathname: '/main.css', hostname: '*' } },
				source: { cacheName: "selene-loader" }
			},
			{
				condition: { urlPattern: { pathname: '/favicon.ico', hostname: '*' } },
				source: { cacheName: "selene-loader" }
			},
			{
				condition: { urlPattern: { pathname: '/api/*', hostname: '*' } },
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

self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event =>
	event.respondWith(
		(() => {
			if (event.request.headers.get('Accept') === 'text/event-stream') {
				return fetch(event.request);
			}

			if (!new URL(event.request.url).pathname.startsWith('/fs/')) {
				return fromNetworkOrCached(event.request);
			}

			return sendToClient(event);
		})()
	),
);

let nextId = 0;
const responseMap: Record<number, PromiseWithResolvers<ResponseInit>> = {};
self.addEventListener('message', event => {
	if (event.origin !== self.origin) {
		return;
	}

	if (event.data.type === 'response') {
		const data: { type: 'response', success: boolean, id: number, response: ResponseInit } = event.data;
		if (data.success) {
			responseMap[data.id]?.resolve?.(data.response);
		} else {
			responseMap[data.id]?.reject?.(data.response);
		}
		delete responseMap[data.id];
	}
})

async function sendToClient(event: FetchEvent) {
	const client = await self.clients.get(event.clientId);
	if (!client || client.type !== 'window') {
		return fetch(event.request);
	}

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

	const id = nextId++;
	const { promise } = responseMap[id] = Promise.withResolvers<ResponseInit>();

	client.postMessage({
		type: 'fetch',
		id,
		data: {
			request: {
				method: event.request.method,
				url: event.request.url,
				headers: toObject(event.request.headers),
				body,
				clientId: event.clientId,
			},
			response: stream.writable,
		}
	}, body ? [stream.writable, body] : [stream.writable])

	return new Response(stream.readable, await promise);
}

function toObject(headers: Headers) {
	const result: Record<string, string> = {};
	headers.forEach((value, key) => (result[key] = value));
	return result;
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