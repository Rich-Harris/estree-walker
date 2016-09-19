const { describe, it } = require( 'mocha' );
const assert = require( 'assert' );
const { walk } = require( '..' );

describe( 'estree-walker', () => {
	it( 'walks an AST', () => {
		const ast = {
			type: 'Program',
			body: [{
				type: 'VariableDeclaration',
				declarations: [
					{
						type: 'VariableDeclarator',
						id: { type: 'Identifier', name: 'a' },
						init: { type: 'Literal', value: 1, raw: '1' }
					},
					{
						type: 'VariableDeclarator',
						id: { type: 'Identifier', name: 'b' },
						init: { type: 'Literal', value: 2, raw: '2' }
					}
				],
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

		assert.deepEqual( entered, [
			ast,
			ast.body[0],
			ast.body[0].declarations[0],
			ast.body[0].declarations[0].id,
			ast.body[0].declarations[0].init,
			ast.body[0].declarations[1],
			ast.body[0].declarations[1].id,
			ast.body[0].declarations[1].init
		]);

		assert.deepEqual( left, [
			ast.body[0].declarations[0].id,
			ast.body[0].declarations[0].init,
			ast.body[0].declarations[0],
			ast.body[0].declarations[1].id,
			ast.body[0].declarations[1].init,
			ast.body[0].declarations[1],
			ast.body[0],
			ast
		]);
	});

	it( 'handles null literals', () => {
		const ast = {
			type: 'Program',
			start: 0,
			end: 8,
			body: [
				{
					type: 'ExpressionStatement',
					start: 0,
					end: 5,
					expression: {
						type: 'Literal',
						start: 0,
						end: 4,
						value: null,
						raw: 'null'
					}
				},
				{
					type: 'ExpressionStatement',
					start: 6,
					end: 8,
					expression: {
						type: 'Literal',
						start: 6,
						end: 7,
						value: 1,
						raw: '1'
					}
				}
			],
			sourceType: 'module'
		};

		walk( ast, {
			enter () {},
			leave () {}
		});

		assert.ok( true );
	});
});
