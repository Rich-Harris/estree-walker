import babel from 'rollup-plugin-babel';

export default {
	entry: 'src/estree-walker.js',
	moduleName: 'estreeWalker',
	plugins: [ babel() ],
	sourceMap: true
};
