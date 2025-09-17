import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
	{ files: ['src/**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { tsconfigRootDir: import.meta.dirname },
		},
	},
	pluginJs.configs.recommended,
	...tseslint.configs.recommended,
	{
		rules: {
			indent: ['error', 'tab'],
			quotes: ['error', 'single'],
			'jsx-quotes': ['error', 'prefer-double'],
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': ['error'],
			semi: 'off',
		},
	},
	{
		ignores: ['src/moddb/generated/', 'node_modules/'],
	},
	eslintConfigPrettier,
];
