import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{ files: ['{src,tests,scripts}/**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
	{ languageOptions: { globals: { ...globals.browser, ...globals.node } } },
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	eslintConfigPrettier,
	pluginReact.configs.flat.recommended,
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error'],
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	{
		ignores: ['src/moddb/generated/', 'node_modules/'],
	},
];
