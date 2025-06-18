export function waitForCodeChange() {
	return new Promise<void>((resolve) => {
		const esEsbuild = new EventSource('http://localhost:8182/esbuild');
		let once = true;
		esEsbuild.addEventListener('change', () => {
			if (once) {
				once = false;
				esEsbuild.close();
				resolve();
			}	
		});
	});
}