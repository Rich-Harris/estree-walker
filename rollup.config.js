import pkg from './package.json';

export default {
	input: 'src/estree-walker.js',
	output: {
		file: pkg.main,
		format: 'umd',
		name: 'estreeWalker',
		sourcemap: true
	}
};
