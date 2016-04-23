import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/estree-walker.js',
	moduleName: 'estreeWalker',
	plugins: [ buble() ],
	sourceMap: true
};
