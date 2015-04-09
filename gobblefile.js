var gobble = require( 'gobble' );

module.exports = gobble( 'src' )
	.transform( 'babel', {
		blacklist: [ 'es6.modules', 'useStrict' ]
	})
	.transform( 'esperanto', {
		type: 'umd',
		name: 'estreeWalker',
		strict: true
	})
	.transform( 'sorcery' );