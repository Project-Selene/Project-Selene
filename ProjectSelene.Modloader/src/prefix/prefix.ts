function __injectClass<T extends Record<string, unknown>>(name: string, clazz: new (...args: unknown[]) => T) {
	//set class instance name (makes things a lot easier to debug)
	const result = {[name]: class extends clazz { } }[name];
	//static members
	for (const [name, desc] of Object.entries(Object.getOwnPropertyDescriptors(clazz))) {
		if (!['name', 'length', 'prototype'].includes(name)) {
			Object.defineProperty(result, name, desc);
		}
	}
	//constructor name
	Object.defineProperty(result, 'name', {configurable: true, value: name});
	clazz = result;
    
	__projectSelene.classes[name] = clazz;
	return clazz;
}

function __injectFunction(name: string, value: (...args: unknown[]) => unknown) {
	if (name === 'startGame') {
		__projectSelene.functions[name] = value;
		return __projectSelene.gameReadyCallback;
	}

	__projectSelene.functions[name] = value;
	return value;
}

function __injectConst(name: string, value: unknown) {
	if (name === 'tmp') {
		return value;
	}
	__projectSelene.consts[name] = value;
	return value;
}

function __injectLet(name: string, getter: () => unknown, setter: (value: unknown) => void) {
	if (name === 'tmp') {
		return;
	}
	if (name in __projectSelene.lets) {
		console.warn('duplicate let', name);
	}
	__projectSelene.lets[name] = {getter, setter};
}

Object.assign(window, { __injectClass, __injectFunction, __injectConst, __injectLet });

export { };

