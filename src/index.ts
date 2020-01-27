import { BaseNode } from "estree";

type WalkerContext = {
	skip: () => void;
	remove: () => void;
	replace: (node: BaseNode) => void;
};

type WalkerHandler = (
	this: WalkerContext,
	node: BaseNode,
	parent: BaseNode,
	key: string,
	index: number
) => Promise<void>

type Walker = {
	enter?: WalkerHandler;
	leave?: WalkerHandler;
}

export async function walk(ast: BaseNode, walker: Walker): Promise<BaseNode> {
	const instance = new WalkerClass(walker);
	return await instance.visit(ast, null, walker.enter, walker.leave);
}

class WalkerClass {
	private enter: Walker["enter"];
	private leave: Walker["leave"];
	private should_skip: boolean = false;
	private should_remove: boolean = false;
	private replacement: BaseNode = null;

	constructor(walker: Walker) {
		this.enter = walker.enter;
		this.leave = walker.leave;
	}
 
	public context: WalkerContext = {
		skip: () => this.should_skip = true,
		remove: () => this.should_remove = true,
		replace: (node: BaseNode) => this.replacement = node
	}

	public replace(parent: any, prop: string, index: number, node: BaseNode) {
		if (parent) {
			if (index !== null) {
				parent[prop][index] = node;
			} else {
				parent[prop] = node;
			}
		}
	}

	public remove(parent: any, prop: string, index: number) {
		if (parent) {
			if (index !== null) {
				parent[prop].splice(index, 1);
			} else {
				delete parent[prop];
			}
		}
	}

	public async visit(
		node: BaseNode,
		parent: BaseNode,
		enter: WalkerHandler,
		leave: WalkerHandler,
		prop?: string,
		index?: number
	): Promise<BaseNode> {
		if (node) {
			if (enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				await enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const skipped = this.should_skip;
				const removed = this.should_remove;

				this.should_skip = _should_skip;
				this.should_remove = _should_remove;
				this.replacement = _replacement;

				if (skipped) return node;
				if (removed) return null;
			}

			for (const key in node) {
				const value = (node as any)[key];

				if (typeof value !== 'object') {
					continue;
				}

				else if (Array.isArray(value)) {
					for (let j = 0, k = 0; j < value.length; j += 1, k += 1) {
						if (value[j] !== null && typeof value[j].type === 'string') {
							if (!await this.visit(value[j], node, enter, leave, key, k)) {
								// removed
								j--;
							}
						}
					}
				}

				else if (value !== null && typeof value.type === 'string') {
					await this.visit(value, node, enter, leave, key, null);
				}
			}

			if (leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				await leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}

				if (this.should_remove) {
					this.remove(parent, prop, index);
				}

				const removed = this.should_remove;

				this.replacement = _replacement;
				this.should_remove = _should_remove;

				if (removed) return null;
			}
		}

		return node;
	}
}


