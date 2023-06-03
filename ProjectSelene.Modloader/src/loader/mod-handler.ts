import { Mod } from '../state';

export class ModInfo {
	private registryCtor = new Map<unknown, {injected: unknown, lowest: unknown}>(); 
	private registryProto = new Map<unknown, {injected: unknown, lowest: unknown}>(); 
	constructor(
        private readonly mod: Mod,
	) {

	}

	public inject(clazz: { new(...args: unknown[]): unknown}) {
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

		this.registryCtor.set(hookCtor, {injected: clazz, lowest: ctor});
		this.registryProto.set(hookProto, {injected: clazz.prototype, lowest: proto});
	}

	public uninject() {
		for (const [hook, {injected, lowest}] of this.registryCtor) {
			this.uninjectTarget(hook, injected, lowest);
		}
		for (const [hook, {injected, lowest}] of this.registryProto) {
			this.uninjectTarget(hook, injected, lowest);
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
