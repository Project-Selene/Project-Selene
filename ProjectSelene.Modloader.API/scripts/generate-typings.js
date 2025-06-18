if (!globalThis.window || !globalThis.window.__projectSelene) {
	throw new Error('This script must be executed in the game');
}

const fs = globalThis?.require?.('fs');

let result = '/* eslint-disable @typescript-eslint/no-explicit-any */\n';
for (const [name] of Object.entries(window.__projectSelene.classes)) {
	if (name !== 'undefined') {
		result += 'export const ' + name + ' = /* @__PURE__ */ (() => __projectSelene.classes.' + name + ' as {new (...args: any[]): { [key: string]: any; } })();\n';
	}
}
for (const [name, value] of Object.entries(window.__projectSelene.consts)) {
	if (name in window.__projectSelene.enums) {
		continue;
	}
	const type = typeof value === 'number' ? 'number' : (typeof value === 'string' ? 'string' : 'any');
	result += 'export const ' + name + ': ' + type + ' = /* @__PURE__ */ (() => __projectSelene.consts.' + name + ' as any)();\n';
}
for (const [name] of Object.entries(window.__projectSelene.enums)) {
	result += 'const TerraContext_' + name + ': typeof ' + name + ' = /* @__PURE__ */ (() => __projectSelene.enums.' + name + ' as any)();\n';
	result += 'export { TerraContext_' + name + ' as ' + name + ' };\n';
}
// Do not generate let exports because they are probably not initialized yet
// for (const [name] of Object.entries(window.__projectSelene.lets)) {
// 	result += 'export const ' + name + ': any = /* @__PURE__ */ (() => __projectSelene.lets.' + name + '.getter())();\n';
// }

result += '\n';
result += 'export interface TerraContext {\n';
for (const name of Object.keys(window.__projectSelene.classes)) {
	result += '\treadonly ' + name + ': typeof ' + name + ';\n';
}
for (const [name] of Object.entries(window.__projectSelene.consts)) {
	if (name in window.__projectSelene.enums) {
		continue;
	}
	result += '\treadonly ' + name + ': any;\n';
}
for (const [name] of Object.entries(window.__projectSelene.lets)) {
	result += '\t' + name + ': any;\n';
}
for (const [name] of Object.entries(window.__projectSelene.enums)) {
	result += '\treadonly ' + name + ': typeof ' + name + ';\n';
}
result += '}\n';
result += '\n';
for (const [name, value] of Object.entries(window.__projectSelene.enums)) {
	result += 'const enum ' + name + ' {\n';
	for (const key of Object.keys(value)) {
		if (isNaN(+key)) {
			const entry = value[key];
			if (typeof entry === 'string') {
				result += '\t\'' + key.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\' = \'' + entry.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\n/g, '\\t') + '\',\n';
			} else {
				result += '\t\'' + key.replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\' = ' + entry + ',\n';
			}
		}
	}
	result += '}\n';
}
result += '\n';

globalThis.copy?.(result);
fs?.writeFile?.('terra.ts', result);