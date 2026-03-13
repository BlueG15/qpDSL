import { TargetType, Target, Specification, AST_Node, INT_LITERAL, AnyTarget, AmountType } from "./base";

//specifications - specific

/// Amount{}
export class AmountSpec extends Specification {
    constructor(public amount : INT_LITERAL | PropAccess | "all", public type : AmountType = AmountType.EQ, public isRandom = false){
        super();
    }
}

/// back references
export abstract class BackRef<T extends TargetType> extends Target<T> {}
export class BackRefAny extends BackRef<TargetType> {
    override type = undefined; 
}
export class BackRefWithType<T extends TargetType> extends BackRef<T> {
    constructor(public type : T){
        super()
    }
}

/// named identifiers

//// this card
export class ThisCard extends Target<TargetType.card> {
    override type = TargetType.card as const;
}
//// this effect
export class ThisEffect extends Target<TargetType.effect> {
    override type = TargetType.effect as const;
}
//// this player
export class ThisPlayer extends Target<TargetType.player> {
    override type = TargetType.player as const;
}

//// property acceess
export class PropAccess extends Target<TargetType.number> {
    override type = TargetType.number as const;
    get children() : [AnyTarget] {
        return [this.object];
    }
    constructor(public object : AnyTarget, public property : string){
        super()
    }
}

export class PropAccessInternalEffectVariable extends PropAccess {
    constructor(property : string){
        super(new ThisEffect(), property);
    }
}


//// target calc
export class NumberOfTarget extends Target<TargetType.number> {
    override type = TargetType.number as const;
    get children() : Target<TargetType>[] {
        return this.targets;
    }
    get count(){
        return this.children.length
    }
    constructor(public targets : Target<TargetType>[]){
        super()
    }
}