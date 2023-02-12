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
		path: path.resolve(__dirname, 'dist', 'assets', 'js'),
        
	},
	resolve: {
		extensions: ['.ts']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	optimization: {
		concatenateModules: false, //The test game is small enough to optimize stuff it wouldn't in a big program
		minimize: false
	},
	plugins: [
		new CopyPlugin({
			patterns: [{
				from: 'static',
				to: '../..'
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