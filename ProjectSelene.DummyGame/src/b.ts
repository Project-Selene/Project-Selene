import { cylcic } from './a';
import { Foo } from './test';

export function test(asdfasdasd) {
	console.log('x');
	new Foo().bar();
	cylcic();
}

export class TestParent {
	msg = 'hi';
	
	target() {
		console.log(this.msg);
	}
}

export const harmony = () => 42;