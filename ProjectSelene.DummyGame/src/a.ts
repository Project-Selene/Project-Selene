import { test } from './b';

export function cylcic() {
	for (let i = 0; i < globalThis['a']; i++) {
		if (globalThis['continue']) {
			test();
		}
	}
}