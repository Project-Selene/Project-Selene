//Never actually used in runtime code
const InjectableClass = /* @__PURE__ */  (() => Symbol('InjectableClass'))();
//Indicates that a class can be injected into (and therefore has the injectable layer)
//Does not actually exist at runtime
export type InjectableClass = { [InjectableClass]: 'Result of Injectable(...)' & never };

export function Injectable<T extends new (...args: unknown[]) => unknown>(clazz: T):
	//This monstrosity is necessary to convince ts that the result can be extended with proper types but no static members 
	T extends new (...args: unknown[]) => infer P
	? (new (...args: unknown[]) => P) & InjectableClass
	: (new (...args: unknown[]) => Record<string, unknown>) & InjectableClass {

	//@ts-expect-error TS doesn't like prototype manipulation
	const result = class extends clazz { } as T;

	//Make sure we can find it in Mod.inject
	//@ts-expect-error Avoid implicit any error
	result[__projectSelene.symbol] = 'injected';

	//@ts-expect-error We know that the type is correct but typescript doesn't believe us
	return result
}