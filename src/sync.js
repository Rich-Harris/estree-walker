import { WalkerBase } from './walker.js';

/**
 * @typedef { import('estree').Node} Node
 * @typedef { import('./walker.js').WalkerContext} WalkerContext
 * @typedef {(
 *    this: WalkerContext,
 *    node: Node,
 *    parent: Node,
 *    key?: string | number | symbol | undefined,
 *    index?: number | undefined
 * ) => void} SyncHandler
 */

export class SyncWalker extends WalkerBase {
	/**
	 *
	 * @param {SyncHandler} [enter]
	 * @param {SyncHandler} [leave]
	 */
	constructor(enter, leave) {
		super();

		/** @type {boolean} */
		this.should_skip = false;

		/** @type {boolean} */
		this.should_remove = false;

		/** @type {Node | null} */
		this.replacement = null;

		/** @type {WalkerContext} */
		this.context = {
			skip: () => (this.should_skip = true),
			remove: () => (this.should_remove = true),
			replace: (node) => (this.replacement = node)
		};

		/** @type {SyncHandler | undefined} */
		this.enter = enter;

		/** @type {SyncHandler | undefined} */
		this.leave = leave;
	}

	/**
	 * @template {Node} Parent
	 * @param {Node} node
	 * @param {Parent} parent
	 * @param {keyof Parent} prop
	 * @param {number} index
	 * @returns {Node | null}
	 */
	visit(node, parent, prop, index) {
		if (node) {
			if (this.enter) {
				const _should_skip = this.should_skip;
				const _should_remove = this.should_remove;
				const _replacement = this.replacement;
				this.should_skip = false;
				this.should_remove = false;
				this.replacement = null;

				this.enter.call(this.context, node, parent, prop, index);

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
				const value = node[/** @type {keyof Node} */(key)];

				if (typeof value !== "object") {
					continue;
				} else if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i += 1) {
						if (value[i] !== null && typeof value[i].type === 'string') {
							if (!this.visit(value[i], node, key, i)) {
								// removed
								i--;
							}
						}
					}
				} else if (value !== null && typeof value.type === "string") {
					this.visit(value, node, key, null);
				}
			}

			if (this.leave) {
				const _replacement = this.replacement;
				const _should_remove = this.should_remove;
				this.replacement = null;
				this.should_remove = false;

				this.leave.call(this.context, node, parent, prop, index);

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
