import { BaseNode } from "estree";
import { SyncWalkerClass, SyncWalker } from "./sync";
import { AsyncWalkerClass, AsyncWalker } from "./async";

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
) => Promise<void>;

export function walk(ast: BaseNode, walker: SyncWalker): BaseNode {
  const instance = new SyncWalkerClass(walker);
  return instance.visit(ast, null, walker.enter, walker.leave);
}

export async function asyncWalk(
  ast: BaseNode,
  walker: AsyncWalker
): Promise<BaseNode> {
  const instance = new AsyncWalkerClass(walker);
  return await instance.visit(ast, null, walker.enter, walker.leave);
}
