import { AST_Node, INT_LITERAL, ID_LITERAL, Statement } from "./base";

export class Program extends AST_Node {
    constructor(public statements : Statement[]){
        super()
    }
}

export class EffectDecl extends Statement {
    constructor(public effect_id : ID_LITERAL, public meta_data : EffectMetaData, public segments : EffectSegment[]){
        super()
    }
}

export class EffectMetaData extends AST_Node {
    constructor(public type : ID_LITERAL, public subtypes : ID_LITERAL[] = [], public interval_vars : EffectVariable[] = []){
        super()
    }
}

export class EffectVariable extends AST_Node {
    constructor(public name : ID_LITERAL, public values : INT_LITERAL[] = []){
        super()
    }
}

export class EffectSegment extends AST_Node {
    constructor(public statements : Statement[] = []){
        super()
    }
}