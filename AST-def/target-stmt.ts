import { AST_Node, Statement, ConditionStmt, TargetType, Target, INT_LITERAL, AnyTarget, Direction, AmountType, ID_LITERAL } from "./base";
import { AmountSpec, PropAccess } from "./target";

export class TargetStmt extends Statement {
    constructor(public target : AnyTarget, public conditions : ConditionStmt[] = []){
        super();
    }
}

export abstract class InlineTarget<T extends TargetType> extends Target<T> {
    target : Target<T>[] = [] //unknown until type analysis
    abstract from? : AnyTarget
    abstract amount : AmountSpec
}

export interface CardFlags {
    rarity? : string[],
    extension? : string[],  //without DOT version
    positional? : string[], //exposed, covered
    variant? : string[],
    stat_requirements? : Record<string, number>,
    random_flag? : boolean,
    archtype? : string[] //assume archtype if fails to match against the above
}

export class InlineCard extends InlineTarget<TargetType.card> {
    override type = TargetType.card as const;
    constructor(
        public from : Target<TargetType.zone | TargetType.pos>, //only mandatory param
        public amount : AmountSpec = new AmountSpec(new INT_LITERAL(1), AmountType.EQ), 
        public flags : CardFlags = {}, 
        public withEffect? : Target<TargetType.effect>
    ){
        super();
    }
}

export class EffectPositionalSpec extends AST_Node {
    constructor(
        public readonly position : number
    ){
        super()
    }
}

export interface EffectFlags {
    type? : string[],
    subtype? : string[],
    random_flag? : boolean,
}

export class InlineEffect extends InlineTarget<TargetType.effect> {
    override type = TargetType.effect as const;
    override amount: AmountSpec;
    posSpec? : EffectPositionalSpec 
    constructor(
        public from? : Target<TargetType.card>,
        amount : EffectPositionalSpec | AmountSpec = new AmountSpec(new INT_LITERAL(1), AmountType.EQ), 
        public flags : EffectFlags = {},
    ){
        super()
        if(amount instanceof AmountSpec) this.amount = amount;
        else {
            this.amount = new AmountSpec(new INT_LITERAL(1));
            this.posSpec = amount
        }
    }
}

export interface PosFlags {
    property_requirements? : Record<string, number>, //e.g. row: 2, col: 3
    positional? : string[], //empty, covered, exposed
    random_flag? : boolean,
}

export class InlinePos_fromZone extends InlineTarget<TargetType.pos> {
    override type = TargetType.pos as const;
    constructor(
        public from : Target<TargetType.zone>, //required
        public amount : AmountSpec = new AmountSpec(new INT_LITERAL(1), AmountType.EQ),
        public flags : PosFlags = {},
    ){
        super()
    }
}

export class InlinePos_fromDirs extends InlineTarget<TargetType.pos> {
    override type = TargetType.pos as const;
    amount = new AmountSpec("all", AmountType.EQ)
    constructor(
        public dirs : Direction[][], // required
        public from : Target<TargetType.card>, //required
        public flags : PosFlags = {},
        public distance = Infinity
    ){
        super()
    }
}
 
export class InlinePos_aroundCard extends InlineTarget<TargetType.pos> {
    override type = TargetType.pos as const;
    override amount = new AmountSpec(new INT_LITERAL(1), AmountType.EQ)
    constructor(
        public dir : Direction, // required
        public from :Target<TargetType.card>, //required
    ){
        super()
    }
}

export type InlinePos = InlinePos_fromZone | InlinePos_fromDirs | InlinePos_aroundCard

export class InlineZone extends InlineTarget<TargetType.zone> {
    override amount = new AmountSpec(new INT_LITERAL(1), AmountType.EQ);
    override type = TargetType.zone as const;
    constructor(
        public name : ID_LITERAL,
        public from? : Target<TargetType.player>,
    ){
        super()
    }
}
