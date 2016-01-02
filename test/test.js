import { describe, it } from 'mocha';
import * as assert from 'assert';
import * as acorn from 'acorn';
import { walk } from '..';

function parse ( code ) {
	return acorn.parse( code, {
		ecmaVersion: 6
	});
}

describe( 'estree-walker', () => {
	it( 'walks an AST', () => {
		const ast = {
			type: 'Program',
			body: [{
				type: 'VariableDeclaration',
				declarations: [{
					type: 'VariableDeclarator',
					id: { type: 'Identifier', name: 'a' },
					init: { type: 'Literal', value: 1, raw: '1' }
				}],
				kind: 'var'
			}],
			sourceType: 'module'
		};

		let entered = [];
		let left = [];

		walk( ast, {
			enter ( node ) {
				entered.push( node );
			},
			leave ( node ) {
				left.push( node );
			}
		});

		assert.equal( entered.length, 5 );
		assert.equal( left.length, 5 );

		[
			ast,
			ast.body[0],
			ast.body[0].declarations[0],
			ast.body[0].declarations[0].id,
			ast.body[0].declarations[0].init
		].forEach( node => {
			assert.ok( ~entered.indexOf( node ) );
			assert.ok( ~left.indexOf( node ) );
		});
	});
});
