// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { __injectClass, __injectConst, __injectLet } = (() => {
	window.__projectSelene = {
		registered: {},
		classes: {},
		consts: {},
		lets: {},
	};

	const registered = window.__projectSelene.registered;

	function __injectClass(name, clazz) {
		if (name in registered) {
			let current = clazz;
			for (const injected of registered[name] ?? []) {
				//constructor
				Object.setPrototypeOf(injected, current);
				//instance
				Object.setPrototypeOf(injected.prototype, clazz.current);
				current = injected;
			}
			//set class instance name (makes things a lot easier to debug)
			const result = {[name]: class extends current { } }[name];
			//static members
			for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(clazz))) {
				if (!['name', 'length', 'prototype'].includes(name)) {
					Object.defineProperty(result, name, desc);
				}
			}
			//constructor name
			Object.defineProperty(result, 'name', {configurable: true, value: name});
			clazz = result;
		}
		window.__projectSelene.classes[name] = clazz;
		return clazz;
	}

	function __injectConst(name, value) {
		if (name === 'tmp') {
			return value;
		}
		window.__projectSelene.consts[name] = value;
		return value;
	}

	function __injectLet(name, getter, setter) {
		if (name === 'tmp') {
			return;
		}
		if (name in window.__projectSelene.lets) {
			console.warn('duplicate let', name);
		}
		window.__projectSelene.lets[name] = {getter, setter, value: getter()};
	}

	return { __injectClass, __injectConst, __injectLet };
})();