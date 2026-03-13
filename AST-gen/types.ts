import { CstNode } from "chevrotain"
import type * as AST from "../AST-def"

import { BaseVisitor } from "../Visitor"
import type { qpRemakeParser } from "../Parser"

export type BuilderFunc = (this : ASTGenerator, ctx : any) => AST.AST_Node | AST.AST_Node[] | undefined

export class ASTRegistry {
    constructor(private boundedGenerator : ASTGenerator){}
    register(str : keyof qpRemakeParser, func : BuilderFunc){
        (this.boundedGenerator as any)[`visit${str}`] = func.bind(this.boundedGenerator)
    }
}

export class ASTGenerator extends BaseVisitor {
    // private registeredBuilerMethods = new Map<keyof qpRemakeParser, BuilderFunc>()
    constructor(UsingASTNodes : (typeof AST.AST_Node)[]){
        super()
        const reg = new ASTRegistry(this)
        UsingASTNodes.forEach(node => node.register(reg))
        this.validateVisitor()
    }
    override visit(cstNode: CstNode | CstNode[] | undefined) : AST.AST_Node | AST.AST_Node[] | undefined {
        if(!cstNode) return;
        return super.visit(cstNode)
    }
    visitSpread(cstNode : CstNode | CstNode[] | undefined) : AST.AST_Node[] {
        if(!cstNode) return [];
        if(Array.isArray(cstNode)) return cstNode.flatMap(n => this.visitSpread(n));
        const res = this.visit(cstNode)
        return Array.isArray(res) ? res : (res ? [res] : [])
    }
    
}