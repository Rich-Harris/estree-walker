import buble from 'rollup-plugin-buble';

const pkg = require( './package.json' );

export default {
	entry: 'src/estree-walker.js',
	targets: [
		{ dest: pkg.main, format: 'umd' },
		{ dest: pkg.module, format: 'es' }
	],
	moduleName: 'estreeWalker',
	plugins: [ buble() ],
	sourceMap: true
};
