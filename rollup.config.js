import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import path from 'path';

const outputPath = path.resolve(__dirname, 'dist');

export default {
	input: path.join(__dirname, 'src', 'client', 'index.js'),
	output: {
		dir: outputPath,
		format: 'cjs'
	},
	plugins: [
		nodeResolve({
			main: true
		}),
		commonjs({ include: 'node_modules/**' }),
		html({ input: path.join(__dirname, 'public', '*.html'), })
	],
};
