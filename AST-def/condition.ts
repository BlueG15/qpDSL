import { AST_Node, ConditionStmt, ConditionPhrase, Target, TargetType, DamageType, INT_LITERAL, AmountType, CardKey } from "./base";
import { AmountSpec, ThisCard, ThisPlayer } from "./target";

// Condition part subclasses

export type Condition = IfCondition | UnlessCondition;

export class IfCondition extends ConditionStmt { 
    constructor(public conditionPhrases : ConditionPhrase[]){
        super();
    }
}

export class UnlessCondition extends ConditionStmt {
    constructor(public conditionPhrases : ConditionPhrase[]){
        super();
    }
}


// Condition phrase subclasses

/// Generics

export class OnCardExist extends ConditionPhrase {
    constructor(
        public target? : Target<TargetType.card>,
    ){
        super();
    }
}

export class OnEffectExist extends ConditionPhrase {
    constructor(
        public target? : Target<TargetType.effect>,
    ){
        super();
    }
}

export class OnCardHasSpecificStats extends ConditionPhrase {
    constructor(
        public target : Target<TargetType.card>,
        public stat : CardKey, //include counters
        public amount : AmountSpec,
    ){
        super();
    }
}

export class OnExprEqual extends ConditionPhrase {
    constructor(
        public expr1 : Target<TargetType.number>,
        public expr2 : Target<TargetType.number>,
    ){
        super();
    }
}

/// Action conditions

export class OnAnyAction extends ConditionPhrase {
    constructor(
        public ofPlayer : Target<TargetType.player> = new ThisPlayer()
    ){
        super();
    }
}

export class OnTurnStart extends ConditionPhrase { }

export class OnTurnEnd extends ConditionPhrase {}

class ConditionTargetCard extends ConditionPhrase {
    constructor(
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnDestroy extends ConditionTargetCard {}
export class OnVoid extends ConditionTargetCard {}
export class OnExecute extends ConditionTargetCard {}
export class OnDecompile extends ConditionTargetCard {}

export class OnDelay extends ConditionPhrase {    
    constructor(
        public delayAmount : number, //required
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnDamage extends ConditionPhrase {    
    constructor(
        public damageType : DamageType, //required
        public damageAmount : AmountSpec, //required
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnPlayerDamage extends ConditionPhrase {    
    constructor(
        public damageAmount : AmountSpec, //required
        public target : Target<TargetType.player> = new ThisPlayer(),
    ){
        super();
    }
}

export class OnEffectActivaion extends ConditionPhrase {    
    constructor(
        public target? : Target<TargetType.effect>, //no target is any effect activation
    ){
        super();
    }
}

export class OnMove extends ConditionPhrase {
    constructor(
        public target : Target<TargetType.card>,
        public from_where? : Target<TargetType.pos> | Target<TargetType.zone>,
        public to_where? : Target<TargetType.pos> | Target<TargetType.zone>,
    ){
        super();
    }
}

export class OnRemove extends OnMove {
    constructor(
        target : Target<TargetType.card>,
        from_where? : Target<TargetType.pos> | Target<TargetType.zone>,
    ){
        super(target, from_where);
    }
}

export class OnPlay extends OnMove {
    constructor(
        target : Target<TargetType.card>,
    ){     
        super(target);
    }
} //On play is a special case where the move keyword is "play"

export class OnDraw extends ConditionPhrase {    
    constructor(
        public target : Target<TargetType.player> = new ThisPlayer(),
        public amount : AmountSpec = new AmountSpec(new INT_LITERAL(1), AmountType.EQ)
    ){
        super();
    }
}

export class OnShuffle extends ConditionPhrase {    
    constructor(
        public target : Target<TargetType.zone>,
    ){
        super();
    }
}

export class OnStatChange extends ConditionPhrase {    
    constructor(
        public stat : CardKey, //include counters
        public amount : AmountSpec,
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnHeal extends ConditionPhrase {    
    constructor(
        public healAmount : AmountSpec, //required
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnStatOverride extends ConditionPhrase {    
    constructor(
        public stat : Exclude<CardKey, CardKey.counter>,
        public newAmount : AmountSpec,
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnCounterRemove extends ConditionPhrase {    
    constructor(
        public amount : AmountSpec,
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnReceiveEffect extends ConditionPhrase {    
    constructor(
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}

export class OnRemoveEffect extends ConditionPhrase {    
    constructor(
        public target : Target<TargetType.card> = new ThisCard(),
    ){
        super();
    }
}
