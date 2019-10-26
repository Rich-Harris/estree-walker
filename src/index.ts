import { Node } from "estree";

type WalkerContext = {
	skip: () => void;
	remove: () => void;
	replace: (node: Node) => void;
};

type WalkerHandler = (
	this: WalkerContext,
	node: Node,
	parent: Node,
	key: string,
	index: number
) => void

type Walker = {
	enter?: WalkerHandler;
	leave?: WalkerHandler;
}

export function walk(ast: Node, { enter, leave }: Walker) {
	return visit(ast, null, enter, leave);
}

let should_skip = false;
let should_remove = false;
let replacement: Node = null;
const context: WalkerContext = {
	skip: () => should_skip = true,
	remove: () => should_remove = true,
	replace: (node: Node) => replacement = node
};

export const childKeys: Record<string, string[]> = {};

function replace(parent: any, prop: string, index: number, node: Node) {
	if (parent) {
		if (index !== null) {
			parent[prop][index] = node;
		} else {
			parent[prop] = node;
		}
	}
}

function remove(parent: any, prop: string, index: number) {
	if (parent) {
		if (index !== null) {
			parent[prop].splice(index, 1);
		} else {
			delete parent[prop];
		}
	}
}

function visit(
	node: Node,
	parent: Node,
	enter: WalkerHandler,
	leave: WalkerHandler,
	prop?: string,
	index?: number
) {
	if (node) {
		if (enter) {
			const _should_skip = should_skip;
			const _should_remove = should_remove;
			const _replacement = replacement;
			should_skip = false;
			should_remove = false;
			replacement = null;

			enter.call(context, node, parent, prop, index);

			if (replacement) {
				node = replacement;
				replace(parent, prop, index, node);
			}

			if (should_remove) {
				remove(parent, prop, index);
			}

			const skipped = should_skip;
			const removed = should_remove;

			should_skip = _should_skip;
			should_remove = _should_remove;
			replacement = _replacement;

			if (skipped) return node;
			if (removed) return null;
		}

		const keys = node.type && childKeys[node.type] || (
			childKeys[node.type] = Object.keys(node).filter(key => typeof (node as any)[key] === 'object')
		);

		for (let i = 0; i < keys.length; i += 1) {
			const key = keys[i];
			const value = (node as any)[key];

			if (Array.isArray(value)) {
				for (let j = 0, k = 0; j < value.length; j += 1, k += 1) {
					if (value[j] && value[j].type) {
						if (!visit(value[j], node, enter, leave, key, k)) {
							// removed
							j--;
						}
					}
				}
			}

			else if (value && value.type) {
				visit(value, node, enter, leave, key, null);
			}
		}

		if (leave) {
			const _replacement = replacement;
			const _should_remove = should_remove;
			replacement = null;
			should_remove = false;

			leave.call(context, node, parent, prop, index);

			if (replacement) {
				node = replacement;
				replace(parent, prop, index, node);
			}

			if (should_remove) {
				remove(parent, prop, index);
			}

			const removed = should_remove;
			
			replacement = _replacement;
			should_remove = _should_remove;

			if (removed) return null;
		}
	}

	return node;
}
