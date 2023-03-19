import nodeResolve from 'rollup-plugin-node-resolve';
import { rollupPluginHTML as html } from '@web/rollup-plugin-html';
import path from 'path';

const outputPath = path.resolve(__dirname, 'dist');

export default {
	input: path.join(__dirname, 'src', 'index.js'),
	output: {
		dir: outputPath,
		format: 'cjs'
	},
	plugins: [
		nodeResolve({
			jsnext: true
		}),
		html({ input: path.join(__dirname, 'public', '*.html'), })
	],
};
