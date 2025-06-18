import { InjectableClass } from './inject.js';

export interface Mod {
    inject(clazz: { new (...args: unknown[]): unknown } & InjectableClass): void;
    uninject(): void;
}