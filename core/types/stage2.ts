import { ASTNode, SentenceType, ConditionType, BinOpType, VariableType } from "./generic";
import { Variable, Target } from "./stage1";

export class SentenceSegment implements ASTNode {
    constructor(
        public raw : string,
    ){}
}

// Not a segment, but a wrapper for segment with operator
export class BinOp<T extends SentenceSegment = SentenceSegment> implements ASTNode {
    constructor(
        public raw : string,
        public left : T,
        public right : T,
        public operator : BinOpType,
    ){}
}

export class Sentence<T extends SentenceSegment = SentenceSegment> implements ASTNode {
    owner? : EffectBodySegment // the segment this sentence belongs to, will be set if not a declare runtime variable sentence
    protected constructor(
        public raw : string,
        public type : SentenceType = SentenceType.Action,
        public segments : (T | BinOp<T>)[] = [],
    ){}

    map<T2 extends SentenceSegment>(f : (segment : T) => T2){
        for(let i = 0; i < this.segments.length; i++){
            if(this.segments[i] instanceof BinOp){
                const binOp = this.segments[i] as BinOp<T>
                binOp.left = f(binOp.left) as any
                binOp.right = f(binOp.right) as any
            } else {
                this.segments[i] = f(this.segments[i] as T) as any
            }
        }
        return this as any as Sentence<T2>
    }
}

export class RuntimeVariable implements Variable {
    type = VariableType.Runtime
    constructor(
        public raw : string,
        public name : string,
        public value : Target,
    ){}
}

export class RuntimeVariableDeclareSentence extends Sentence<never> {
    constructor(
        raw : string,
        public name : string,
        public value : RuntimeVariable,
    ){
        super(raw, SentenceType.DeclareRuntimeVar, [])
    }
}

export class ConditionSentence<T extends SentenceSegment = SentenceSegment> extends Sentence<T> {
    boundedIf? : ConditionSentence<T> // only for else condition
    constructor(
        raw : string,
        public conditionType : ConditionType,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, SentenceType.Condition, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): ConditionSentence<T2> {
        return super.map(f) as any
    }
}

export class IfSentence<T extends SentenceSegment = SentenceSegment> extends ConditionSentence<T> {
    constructor(
        raw : string,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, ConditionType.If, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): IfSentence<T2> {
        return super.map(f) as any
    }
}

export class ElseSentence<T extends SentenceSegment = SentenceSegment> extends ConditionSentence<T> {
    constructor(
        raw : string,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, ConditionType.Else, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): IfSentence<T2> {
        return super.map(f) as any
    }
}

export class UnlessSentence<T extends SentenceSegment = SentenceSegment> extends ConditionSentence<T> {
    constructor(
        raw : string,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, ConditionType.Unless, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): IfSentence<T2> {
        return super.map(f) as any
    }
}

export class TargetSentence<T extends SentenceSegment = SentenceSegment> extends Sentence<T> {
    constructor(
        raw : string,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, SentenceType.Target, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): TargetSentence<T2> {
        return super.map(f) as any
    }
}

export class ActionSentence<T extends SentenceSegment = SentenceSegment> extends Sentence<T> {
    constructor(
        raw : string,
        segments : (T | BinOp<T>)[] = [],
    ){
        super(raw, SentenceType.Action, segments)
    }

    override map<T2 extends SentenceSegment>(f: (segment: T) => T2): ActionSentence<T2> {
        return super.map(f) as any
    }
}

export class EffectBodySegment<
    T_cond extends SentenceSegment = SentenceSegment,
    T_target extends SentenceSegment = SentenceSegment,
    T_action extends SentenceSegment = SentenceSegment,
> implements ASTNode {
    constructor(
        public segmentID : number, //index on the body array of the effect declare
        public raw : string,
        public conditions : ConditionSentence<T_cond>[],
        public targets : TargetSentence<T_target>[],
        public actions : ActionSentence<T_action>[],
    ){
        conditions.forEach(c => c.owner = this)
        targets.forEach(t => t.owner = this)
        actions.forEach(a => a.owner = this)
    }

    map<
        T_cond2 extends SentenceSegment,
        T_target2 extends SentenceSegment,
        T_action2 extends SentenceSegment,
    >(
        f_cond : (segment : ConditionSentence<T_cond>) => ConditionSentence<T_cond2>,
        f_target : (segment : TargetSentence<T_target>) => TargetSentence<T_target2>,
        f_action : (segment : ActionSentence<T_action>) => ActionSentence<T_action2>,
    ){
        const $ = this as any as EffectBodySegment<T_cond2, T_target2, T_action2>
        $.conditions = this.conditions.map(f_cond)
        $.targets = this.targets.map(f_target)
        $.actions = this.actions.map(f_action)
        return $;
    }
}
