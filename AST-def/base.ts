// Const enums

import type { ASTRegistry } from "../AST-gen/types";
import type * as CTX from "../AST-gen/grammar-types"
import { IDClassifier } from "../AST-gen/IDClassifier";

export const enum TargetType {
    "card",
    "effect",
    "zone",
    "pos",
    "player",
    "number",
}

export const enum Direction {
    up,
    down,
    left, 
    right
}

export const enum CardKey {
    "atk",
    "hp",
    "level",
    "counter",
}

export const enum DamageType {
    "physical",
    "magic"
}

export const enum AmountType {
    "EQ",
    "NEQ",
    "GT",
    "LT",
    "GEQ",
    "LEQ",
}

/// Abstracts
export abstract class AST_Node {
    is<T extends AST_Node>(Class : new (...args : any[]) => T) : this is T {
        return this instanceof Class;
    }
    static register(registry : ASTRegistry){}
}

export abstract class Action extends AST_Node {}

export abstract class Statement extends AST_Node {}

//condition
export abstract class ConditionStmt extends Statement {}
export abstract class ConditionPhrase extends AST_Node {}

//specifications - broad
export abstract class Specification extends AST_Node {}

export abstract class Target<T extends TargetType> extends Specification {
    abstract type : T | undefined; //undefined is a standin for "any" type, which is collapsed to a concrete type after static type analysis
    isArray = false; //unknown until static type analysis
}

export abstract class AnyTargetClass extends Target<TargetType> {
    override type = undefined; //any type
}
export type AnyTarget = Target<TargetType>

export class INT_LITERAL extends Target<TargetType.number> {
    override type = TargetType.number as const;
    constructor(
        public readonly number : number
    ){
        super()
    }
}

export class ID_LITERAL extends AST_Node {
    constructor(
        public readonly name : string,
        public readonly type : string
    ){
        super()
    }

    static override register(registry: ASTRegistry): void {
        const F = function(ctx : CTX.id_list | CTX.id_list_no_sep){
            return IDClassifier.classify(...ctx.ID.map(i => i.image)).map(t => new ID_LITERAL(t.str, t.category))
        }
        registry.register("id_list", F)
        registry.register("id_list_no_sep", F)
    }
}
