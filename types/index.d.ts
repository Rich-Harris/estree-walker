import { AsyncWalker } from "./async";
import { SyncWalker } from "./sync";
import type { BaseNode } from "estree";
export declare function walk(ast: BaseNode, walker: SyncWalker): BaseNode;
export declare function asyncWalk(ast: BaseNode, walker: AsyncWalker): Promise<BaseNode>;
