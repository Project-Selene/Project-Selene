import { Mod } from '../ui/state/models/mod';

export class ModInfo {
	private registryCtor = new Map<unknown, { injected: unknown, lowest: unknown }[]>();
	private registryProto = new Map<unknown, { injected: unknown, lowest: unknown }[]>();
	constructor(
		private readonly mod: Mod,
	) {

	}

	public inject(clazz: { new(...args: unknown[]): unknown }) {
		//Basically just does a linked list insert
		//Example: 
		// From: mod -> injectable -> hook -> original
		// To: hook -> mod -> original
		//
		//With second mod
		// From: modB -> injectable -> hook -> mod -> original
		// To: hook -> modB -> mod -> original

		if (!(__projectSelene.symbol in Object.getPrototypeOf(clazz))) {
			throw new Error('Can only hook classes that have an Injectable(...) super class. Directly injecting the result of Injectable(...) does not make sense.');
		}

		let ctor = clazz;
		let proto = clazz.prototype;
		while (Object.getPrototypeOf(ctor)[__projectSelene.symbol] !== 'injected') {
			ctor = Object.getPrototypeOf(ctor);
			if (ctor === Function) {
				throw new Error('Can only hook classes that have an Injectable(...) super class.');
			}
			proto = Object.getPrototypeOf(proto);
		}

		const injectableCtor = Object.getPrototypeOf(ctor);
		const injectableProto = Object.getPrototypeOf(proto);

		const hookCtor = Object.getPrototypeOf(injectableCtor);
		const hookProto = Object.getPrototypeOf(injectableProto);

		const currentCtor = Object.getPrototypeOf(hookCtor);
		const currentProto = Object.getPrototypeOf(hookProto);

		Object.setPrototypeOf(ctor, currentCtor);
		Object.setPrototypeOf(proto, currentProto);

		Object.setPrototypeOf(hookCtor, clazz);
		Object.setPrototypeOf(hookProto, clazz.prototype);

		const existingCtors = this.registryCtor.get(hookCtor);
		if (existingCtors) {
			existingCtors.push({ injected: clazz, lowest: ctor });
		} else {
			this.registryCtor.set(hookCtor, [{ injected: clazz, lowest: ctor }]);
		}
		const existingProtos = this.registryProto.get(hookProto);
		if (existingProtos) {
			existingProtos.push({ injected: clazz.prototype, lowest: proto });
		} else {
			this.registryProto.set(hookProto, [{ injected: clazz.prototype, lowest: proto }]);
		}
	}

	public uninject() {
		for (const [hook, list] of this.registryCtor) {
			for (const { injected, lowest } of list) {
				this.uninjectTarget(hook, injected, lowest);
			}
		}
		for (const [hook, list] of this.registryProto) {
			for (const { injected, lowest } of list) {
				this.uninjectTarget(hook, injected, lowest);
			}
		}
		this.registryCtor.clear();
		this.registryProto.clear();
	}

	private uninjectTarget(hook: unknown, injected: unknown, lowest: unknown) {
		let current = hook;
		while (current !== Function && current !== Object.prototype && Object.getPrototypeOf(current) !== injected) {
			current = Object.getPrototypeOf(current);
		}

		if (current === Function || current === Object.prototype) {
			console.error('Cannot find injected: ', injected, hook);
		}

		const above = current;

		while (current !== Function && current !== Object.prototype && current !== lowest) {
			current = Object.getPrototypeOf(current);
		}

		if (current === Function || current === Object.prototype) {
			console.error('Cannot find lowest injected: ', injected, hook);
		}

		const below = Object.getPrototypeOf(current);

		Object.setPrototypeOf(above, below);
	}
}
