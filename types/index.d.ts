import { Node } from "estree";
declare type WalkerContext = {
    skip: () => void;
    replace: (node: Node) => void;
};
declare type WalkerHandler = (this: WalkerContext, node: Node, parent: Node, key: string, index: number) => void;
declare type Walker = {
    enter?: WalkerHandler;
    leave?: WalkerHandler;
};
export declare function walk(ast: Node, { enter, leave }: Walker): Node;
export declare const childKeys: Record<string, string[]>;
export {};
