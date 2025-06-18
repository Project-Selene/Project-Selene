import type { TerraContext } from './terra.js';

export const terra: TerraContext = /* @__PURE__ */ (() => new Proxy({}, {
	get(_, name) {
		if (name in __projectSelene.classes) {
			return __projectSelene.classes[name];
		} else if (name in __projectSelene.consts) {
			return __projectSelene.consts[name];
		} else if (name in __projectSelene.lets) {
			return __projectSelene.lets[name].getter();
		} else if (name in __projectSelene.enums) {
			return __projectSelene.enums[name as string];
		} else {
			throw new Error('Identitifer does not exist in game scope');
		}
	},
	set(_, name, value) {
		if (name in __projectSelene.lets) {
			__projectSelene.lets[name].setter(value);
			return true;
		} else {
			return false;
		}
	},
	ownKeys() {
		const keys = [];
		keys.push(...Object.keys(__projectSelene.classes));
		keys.push(...Object.keys(__projectSelene.consts));
		keys.push(...Object.keys(__projectSelene.lets));
		keys.push(...Object.keys(__projectSelene.enums));
		keys.sort();
		return keys.filter((value, index, array) => array.indexOf(value) === index);
	},
	getOwnPropertyDescriptor() {
		return { enumerable: true, configurable: true };
	},
}) as TerraContext)();