import * as b from './b';
import { Foo } from './test';

const x = {a:1};


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

	b.test(x);
	console.log(x);
	// console.log(b);
	new TestClient().target();
	new Foo().bar();
}
y();