// @ts-check
import * as uvu from 'uvu';
import * as assert from 'uvu/assert';
import { walk, asyncWalk } from '../src/index.js';

function describe(name, fn) {
	const suite = uvu.suite(name);
	fn(suite);
	suite.run();
}

describe('sync estree-walker', it => {
	it('walks a malformed node', () => {
		const block = [
			{
				type: 'Foo',
				answer: undefined
			},
			{
				type: 'Foo',
				answer: {
					type: 'Answer',
					value: 42
				}
			}
		];

		let answer;

		walk(
			{ type: 'Test', block },
			{
				enter(node) {
					if (node.type === 'Answer') answer = node;
				}
			}
		);

		assert.equal(answer, block[1].answer);
	});

	it('walks an AST', () => {
		const ast = {
			type: 'Program',
			body: [
				{
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
				}
			],
			sourceType: 'module'
		};

		let entered = [];
		let left = [];

		walk(ast, {
			enter(node) {
				entered.push(node);
			},
			leave(node) {
				left.push(node);
			}
		});

		assert.equal(entered, [
			ast,
			ast.body[0],
			ast.body[0].declarations[0],
			ast.body[0].declarations[0].id,
			ast.body[0].declarations[0].init,
			ast.body[0].declarations[1],
			ast.body[0].declarations[1].id,
			ast.body[0].declarations[1].init
		]);

		assert.equal(left, [
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

	it('handles null literals', () => {
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

		walk(ast, {
			enter() {},
			leave() {}
		});

		assert.ok(true);
	});

	it('allows walk() to be invoked within a walk, without context corruption', () => {
		const ast = {
			type: 'Program',
			start: 0,
			end: 8,
			body: [
				{
					type: 'ExpressionStatement',
					start: 0,
					end: 6,
					expression: {
						type: 'BinaryExpression',
						start: 0,
						end: 5,
						left: {
							type: 'Identifier',
							start: 0,
							end: 1,
							name: 'a'
						},
						operator: '+',
						right: {
							type: 'Identifier',
							start: 4,
							end: 5,
							name: 'b'
						}
					}
				}
			],
			sourceType: 'module'
		};

		const identifiers = [];

		walk(ast, {
			enter(node) {
				if (node.type === 'ExpressionStatement') {
					walk(node, {
						enter() {
							this.skip();
						}
					});
				}

				if (node.type === 'Identifier') {
					identifiers.push(node.name);
				}
			}
		});

		assert.equal(identifiers, ['a', 'b']);
	});

	it('replaces a node', () => {
		const phases = ['enter', 'leave'];
		for (const phase of phases) {
			const ast = {
				type: 'Program',
				start: 0,
				end: 8,
				body: [
					{
						type: 'ExpressionStatement',
						start: 0,
						end: 6,
						expression: {
							type: 'BinaryExpression',
							start: 0,
							end: 5,
							left: {
								type: 'Identifier',
								start: 0,
								end: 1,
								name: 'a'
							},
							operator: '+',
							right: {
								type: 'Identifier',
								start: 4,
								end: 5,
								name: 'b'
							}
						}
					}
				],
				sourceType: 'module'
			};

			const forty_two = {
				type: 'Literal',
				value: 42,
				raw: '42'
			};

			walk(ast, {
				[phase](node) {
					if (node.type === 'Identifier' && node.name === 'b') {
						this.replace(forty_two);
					}
				}
			});

			assert.equal(ast.body[0].expression.right, forty_two);
		}
	});

	it('replaces a top-level node', () => {
		const ast = {
			type: 'Identifier',
			name: 'answer'
		};

		const forty_two = {
			type: 'Literal',
			value: 42,
			raw: '42'
		};

		const node = walk(ast, {
			enter(node) {
				if (node.type === 'Identifier' && node.name === 'answer') {
					this.replace(forty_two);
				}
			}
		});

		assert.equal(node, forty_two);
	});

	it('removes a node property', () => {
		const phases = ['enter', 'leave'];
		for (const phase of phases) {
			const ast = {
				type: 'Program',
				start: 0,
				end: 8,
				body: [
					{
						type: 'ExpressionStatement',
						start: 0,
						end: 6,
						expression: {
							type: 'BinaryExpression',
							start: 0,
							end: 5,
							left: {
								type: 'Identifier',
								start: 0,
								end: 1,
								name: 'a'
							},
							operator: '+',
							right: {
								type: 'Identifier',
								start: 4,
								end: 5,
								name: 'b'
							}
						}
					}
				],
				sourceType: 'module'
			};

			walk(ast, {
				[phase](node) {
					if (node.type === 'Identifier' && node.name === 'b') {
						this.remove();
					}
				}
			});

			assert.equal(ast.body[0].expression.right, undefined);
		}
	});

	it('removes a node from array', () => {
		const phases = ['enter', 'leave'];
		for (const phase of phases) {
			const ast = {
				type: 'Program',
				body: [
					{
						type: 'VariableDeclaration',
						declarations: [
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'a'
								},
								init: null
							},
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'b'
								},
								init: null
							},
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'c'
								},
								init: null
							}
						],
						kind: 'let'
					}
				],
				sourceType: 'module'
			};

			const visitedIndex = [];

			walk(ast, {
				[phase](node, parent, key, index) {
					if (node.type === 'VariableDeclarator') {
						visitedIndex.push(index);
						if (node.id.name === 'a' || node.id.name === 'b') {
							this.remove();
						}
					}
				}
			});

			assert.equal(ast.body[0].declarations.length, 1);
			assert.equal(visitedIndex.length, 3);
			assert.equal(visitedIndex, [0, 0, 0]);
			assert.equal(ast.body[0].declarations[0].id.name, 'c');
		}
	});
});

describe('async estree-walker', it => {
	it('walks a malformed node', async () => {
		const block = [
			{
				type: 'Foo',
				answer: undefined
			},
			{
				type: 'Foo',
				answer: {
					type: 'Answer',
					value: 42
				}
			}
		];

		let answer;

		await asyncWalk(
			{ type: 'Test', block },
			{
				enter(node) {
					if (node.type === 'Answer') answer = node;
				}
			}
		);

		assert.equal(answer, block[1].answer);
	});

	it('walks an AST', async () => {
		const ast = {
			type: 'Program',
			body: [
				{
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
				}
			],
			sourceType: 'module'
		};

		let entered = [];
		let left = [];

		await asyncWalk(ast, {
			async enter(node) {
				entered.push(node);
			},
			async leave(node) {
				left.push(node);
			}
		});

		assert.equal(entered, [
			ast,
			ast.body[0],
			ast.body[0].declarations[0],
			ast.body[0].declarations[0].id,
			ast.body[0].declarations[0].init,
			ast.body[0].declarations[1],
			ast.body[0].declarations[1].id,
			ast.body[0].declarations[1].init
		]);

		assert.equal(left, [
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

	it('handles null literals', async () => {
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

		await asyncWalk(ast, {
			enter() {},
			leave() {}
		});

		assert.ok(true);
	});

	it('allows asyncWalk() to be invoked within a walk, without context corruption', async () => {
		const ast = {
			type: 'Program',
			start: 0,
			end: 8,
			body: [
				{
					type: 'ExpressionStatement',
					start: 0,
					end: 6,
					expression: {
						type: 'BinaryExpression',
						start: 0,
						end: 5,
						left: {
							type: 'Identifier',
							start: 0,
							end: 1,
							name: 'a'
						},
						operator: '+',
						right: {
							type: 'Identifier',
							start: 4,
							end: 5,
							name: 'b'
						}
					}
				}
			],
			sourceType: 'module'
		};

		const identifiers = [];

		await asyncWalk(ast, {
			async enter(node) {
				if (node.type === 'ExpressionStatement') {
					await asyncWalk(node, {
						enter() {
							this.skip();
						}
					});
				}

				if (node.type === 'Identifier') {
					identifiers.push(node.name);
				}
			}
		});

		assert.equal(identifiers, ['a', 'b']);
	});

	it('replaces a node', async () => {
		const phases = ['enter', 'leave'];
		for await (const phase of phases) {
			const ast = {
				type: 'Program',
				start: 0,
				end: 8,
				body: [
					{
						type: 'ExpressionStatement',
						start: 0,
						end: 6,
						expression: {
							type: 'BinaryExpression',
							start: 0,
							end: 5,
							left: {
								type: 'Identifier',
								start: 0,
								end: 1,
								name: 'a'
							},
							operator: '+',
							right: {
								type: 'Identifier',
								start: 4,
								end: 5,
								name: 'b'
							}
						}
					}
				],
				sourceType: 'module'
			};

			const forty_two = {
				type: 'Literal',
				value: 42,
				raw: '42'
			};

			await asyncWalk(ast, {
				[phase](node) {
					if (node.type === 'Identifier' && node.name === 'b') {
						this.replace(forty_two);
					}
				}
			});

			assert.equal(ast.body[0].expression.right, forty_two);
		}
	});

	it('replaces a top-level node', async () => {
		const ast = {
			type: 'Identifier',
			name: 'answer'
		};

		const forty_two = {
			type: 'Literal',
			value: 42,
			raw: '42'
		};

		const node = await asyncWalk(ast, {
			enter(node) {
				if (node.type === 'Identifier' && node.name === 'answer') {
					this.replace(forty_two);
				}
			}
		});

		assert.equal(node, forty_two);
	});

	it('removes a node property', async () => {
		const phases = ['enter', 'leave'];
		for await (const phase of phases) {
			const ast = {
				type: 'Program',
				start: 0,
				end: 8,
				body: [
					{
						type: 'ExpressionStatement',
						start: 0,
						end: 6,
						expression: {
							type: 'BinaryExpression',
							start: 0,
							end: 5,
							left: {
								type: 'Identifier',
								start: 0,
								end: 1,
								name: 'a'
							},
							operator: '+',
							right: {
								type: 'Identifier',
								start: 4,
								end: 5,
								name: 'b'
							}
						}
					}
				],
				sourceType: 'module'
			};

			await asyncWalk(ast, {
				[phase](node) {
					if (node.type === 'Identifier' && node.name === 'b') {
						this.remove();
					}
				}
			});

			assert.equal(ast.body[0].expression.right, undefined);
		}
	});

	it('removes a node from array', async () => {
		const phases = ['enter', 'leave'];
		for await (const phase of phases) {
			const ast = {
				type: 'Program',
				body: [
					{
						type: 'VariableDeclaration',
						declarations: [
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'a'
								},
								init: null
							},
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'b'
								},
								init: null
							},
							{
								type: 'VariableDeclarator',
								id: {
									type: 'Identifier',
									name: 'c'
								},
								init: null
							}
						],
						kind: 'let'
					}
				],
				sourceType: 'module'
			};

			const visitedIndex = [];

			await asyncWalk(ast, {
				[phase](node, parent, key, index) {
					if (node.type === 'VariableDeclarator') {
						visitedIndex.push(index);
						if (node.id.name === 'a' || node.id.name === 'b') {
							this.remove();
						}
					}
				}
			});

			assert.equal(ast.body[0].declarations.length, 1);
			assert.equal(visitedIndex.length, 3);
			assert.equal(visitedIndex, [0, 0, 0]);
			assert.equal(ast.body[0].declarations[0].id.name, 'c');
		}
	});
});
