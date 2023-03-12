import * as b from './b';
import { Foo } from './test';

const x = {a:1};
let l;


class TestClient extends b.TestParent {
	constructor() {
		super();
		this.msg = 'hi2';
	}

	target(): void {
		console.log('test before super');
		super.target();
		console.log('test after super');
	}
}


function y() {
	l = 123;
	b.test(x);
	console.log(x);
	console.log(l);
	new TestClient().target();
	new Foo().bar();
}
y();