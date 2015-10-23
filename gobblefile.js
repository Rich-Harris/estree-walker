var gobble = require( 'gobble' );

module.exports = gobble([
	// UMD build
	gobble( 'src' ).transform( 'rollup-babel', {
		entry: 'estree-walker.js',
		dest: 'estree-walker.umd.js',
		format: 'umd',
		moduleName: 'estreeWalker',
		sourceMap: true
	}),

	// ES6 build
	gobble( 'src' ).transform( 'rollup-babel', {
		entry: 'estree-walker.js',
		dest: 'estree-walker.es6.js',
		format: 'es6',
		sourceMap: true
	})
]);
