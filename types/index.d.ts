import { BaseNode } from "estree";
declare type WalkerContext = {
    skip: () => void;
    remove: () => void;
    replace: (node: BaseNode) => void;
};
declare type WalkerHandler = (this: WalkerContext, node: BaseNode, parent: BaseNode, key: string, index: number) => Promise<void>;
declare type Walker = {
    enter?: WalkerHandler;
    leave?: WalkerHandler;
};
export declare function walk(ast: BaseNode, { enter, leave }: Walker): Promise<BaseNode>;
export {};
