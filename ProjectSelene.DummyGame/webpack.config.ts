import CopyPlugin = require('copy-webpack-plugin');
import path = require('path');
import TerserPlugin = require('terser-webpack-plugin');

import { downloadNWJS } from './build';

import type { Compiler, Configuration } from 'webpack';

module.exports = {
	mode: 'production',
	entry: './src/main.ts',
	output: {
		filename: 'game.compiled.js',
		path: path.resolve(__dirname, 'dist'),
        
	},
	resolve: {
		extensions: ['.ts']
	},
	optimization: {
		minimizer: [new TerserPlugin({
			terserOptions: {
				keep_classnames: true,
				keep_fnames: true,
				//mangle: false,
				format: {
					beautify: true,
				}
			}
		})]
	},
	plugins: [
		new CopyPlugin({
			patterns: [{
				from: 'static',
				to: '.'
			}]
		}),
		{
			apply(compiler: Compiler) {
				compiler.hooks.afterEmit.tapPromise('Download NWJS', async () => {
					await downloadNWJS();
				});
			},
		}
	]
} as Configuration;