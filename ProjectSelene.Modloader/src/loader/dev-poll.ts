const minimumTime = 100;
let timeout = 2000;
let intervalId: NodeJS.Timeout | number = 0;

export function pollForDevMod() {
	if (intervalId) {
		clearInterval(intervalId);
	}
	// store.dispatch(startPollingDevMod());
	intervalId = setInterval(poll, 4000);
}

export function stopPollForDevMod() {
	clearInterval(intervalId);
	intervalId = 0;
}

async function poll() {
	const start = Date.now();
	try {
		await fetchDevMod();

		const source = new EventSource('http://localhost:8182/asset-changes');
		source.addEventListener('error', () => {
			source.close();
			if (intervalId) {
				pollForDevMod();
			}
		});
		source.addEventListener('change', async () => {
			try {
				await fetchDevMod();
			} catch {
				console.error('Failed to update dev mod information');
				if (intervalId) {
					pollForDevMod();
				}
			}
		});
	} catch (e) {
		if (e instanceof TypeError) {
			// e is "TypeError: Failed to fetch" / "net::ERR_CONNECTION_REFUSED"
			const elapsed = Date.now() - start;

			// Reduce the timeout so we don't fill the console with errors.
			timeout = Math.min(timeout - 100, elapsed - 100);

			if (timeout < minimumTime) {
				// The request failed basicly instantly. We can't reliably poll for the dev mod without filling the console with errors.
				clearInterval(intervalId);
				intervalId = 0;
				// store.dispatch(stopPollingDevMod('Timeout too low'));
			}
		}
	}
}

async function fetchDevMod() {
	//The timeout prevents errors from filling the console.
	await fetch('http://localhost:8182/health', {
		signal: AbortSignal.timeout(timeout),
	});

	// const result = await fetch('http://localhost:8182/manifest.json');
	// const manifest = await result.json();
	// const mod: Mod = {
	// 	currentInfo: manifest,
	// 	enabled: true,
	// 	internalName: 'dev',
	// 	filename: '',
	// };
	// store.dispatch(foundDevMod(mod));
	clearInterval(intervalId);
}
