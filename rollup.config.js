import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import path from 'path';
import json from '@rollup/plugin-json'


const outputPath = path.resolve(__dirname, 'dist');
const outputPathServer = path.resolve(__dirname, 'dist_server');

export default [
	{
		input: path.join(__dirname, 'src', 'client', 'index.js'),
		output: {
			dir: outputPath,
			format: 'cjs'
		},
		plugins: [
			nodeResolve(),
			commonjs({ include: 'node_modules/**' }),
			html({ input: path.join(__dirname, 'public', '*.html'), }),
		],
	},
	{
		input: path.join(__dirname, 'src', 'server', 'index.js'),
		output: {
			dir: outputPathServer,
			format: 'esm'
		},
		plugins: [
			nodeResolve(),
			commonjs({ include: 'node_modules/**' }),
			json({compact: true}),
		],
	}
];
