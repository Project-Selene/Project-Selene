import { test } from './b';

const x = {a:1};
export function cylcic() {
	for (let i = 0; i < globalThis['a']; i++) {
		if (globalThis['continue']) {
			test(x);
			console.log(x);
		}
	}
}