import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default {
	input: 'src/estree-walker.js',
	output: [
		{ file: pkg.main, format: 'umd', name: 'estreeWalker' },
		{ file: pkg.module, format: 'es' }
	],
	plugins: [ buble() ],
	sourcemap: true
};
