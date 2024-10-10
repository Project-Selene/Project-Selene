import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';


export default [
  {files: ['{src,tests,scripts}/**/*.{js,mjs,cjs,ts,jsx,tsx}']},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    'rules': {
        'quotes': [
            'error',
            'single'
        ],
        'jsx-quotes': [
            'error', 
            'prefer-double'
        ],
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error']
    },
    settings: {
        react: {
            version: 'detect'
        }
    }
  },
  {
    ignores: [
        'src/moddb/generated/',
        'node_modules/'
    ]
  }
];