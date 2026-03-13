import { ASTRegistry } from "../AST-gen/types";
import { CardKey, DamageType, INT_LITERAL, Target, TargetType, AmountType } from "./base"
import { AST_Node, Statement, ConditionStmt, Action } from "./base";
import { AmountSpec } from "./target";
import * as CTX from "../AST-gen/grammar-types";
import { IDClassifier } from "../AST-gen/IDClassifier";

export class ActionStmt extends Statement {
    constructor(public actionPart : Action, public conditionParts : ConditionStmt[] = []){
        super();
    }

    static override register(registry: ASTRegistry): void {
        registry.register("action_stmt", function(this, ctx : CTX.action_stmt){
            return this.visit(ctx.children[0] as any) as Action;
        });

        registry.register("action_stmt_with_cond", function(this, ctx : CTX.action_stmt_with_cond){
            const action = this.visit(ctx.action_stmt) as Action;
            const conditions = this.visitSpread(ctx.condition_stmt) as ConditionStmt[];
            return new ActionStmt(action, conditions);
        })
    }
}

export class ForceEndGameAction extends Action {
    static override register(registry: ASTRegistry): void {
        registry.register("action_lose", function(this, ctx : CTX.action_lose){
            return new ForceEndGameAction();
        });
    }
}

export class ReprogramAction extends Action {
    static override register(registry: ASTRegistry): void {
        registry.register("action_reprogram", function(this, ctx : CTX.action_reprogram){
            return new ReprogramAction();
        });
    }
}

export class NegateAction extends Action {
    constructor(public actionsToDoInstead? : Action[]){
        super();
    }

    static override register(registry: ASTRegistry): void {
        registry.register("action_negate_action", function(this, ctx : CTX.action_negate_action){
            return new NegateAction();
        });

        registry.register("action_negate_with_instead", function(this, ctx : CTX.action_negate_with_instead){
            const actions = this.visitSpread(ctx.action_stmt_no_negate) as Action[];
            return new NegateAction(actions);
        })
    }
}

export class ClearAllStatusAction extends Action {
    constructor(
        public from_what : Target<TargetType.card>
    ){
        super()
    }

    static override register(registry: ASTRegistry): void {
        registry.register("action_clear_all_status", function(this, ctx : CTX.action_clear_all_status){
            const target = this.visit(ctx.card_spec) as Target<TargetType.card>;
            return new ClearAllStatusAction(target);
        });
    }
}

export class ClearAllEffectsAction extends Action {
    constructor(
        public from_what : Target<TargetType.card>
    ){
        super()
    }

    static override register(registry: ASTRegistry): void {
        registry.register("action_remove_all_effects", function(this, ctx : CTX.action_remove_all_effects){
            const target = this.visit(ctx.card_spec) as Target<TargetType.card>;
            return new ClearAllEffectsAction(target);
        });
    }
}

export class RemoveStatAction extends Action {
    constructor(
        public from_what : Target<TargetType.card>,
        public statName : string,
        public amount : AmountSpec
    ){
        super()
    }

    static override register(registry: ASTRegistry): void {
        registry.register("action_remove_stat", function(this, ctx : CTX.action_remove_stat){
            const target = this.visit(ctx.card_spec) as Target<TargetType.card>;
            const statName = ctx.ID[0].image!; 

            const amount = this.visit(ctx.amount_spec_with_all) as AmountSpec;
            return new RemoveStatAction(target, statName, amount);
        });
    }
}

class ActionTargetCard extends Action {
    constructor(
        public what : Target<TargetType.card>
    ){
        super()
    }
}

export class DetroyAction extends ActionTargetCard {}
export class VoidAction extends ActionTargetCard {}
export class ExecuteAction extends ActionTargetCard {}
export class DecompileAction extends ActionTargetCard {}
export class DisableAction extends ActionTargetCard {}
export class ResetAction extends ActionTargetCard {}

export class DelayAction extends Action {
    constructor(
        public what : Target<TargetType.card>,
        public delayAmount : AmountSpec,
    ){
        super() 
    }
}

export class DealDamageAction extends Action {
    constructor(
        public damageType : DamageType,
        public target : Target<TargetType.card>,
        public damageAmount : AmountSpec,
    ){
        super() 
    }
}

export class DealDamageAheadAction extends DealDamageAction {}
export class DealHeartDamageAction extends Action {
    constructor(
        public target : Target<TargetType.player>,
        public damageAmount : AmountSpec,
    ){
        super() 
    }
}


export class ActivateEffectAction extends Action {
    constructor(
        public target : Target<TargetType.effect>,
    ){
        super()
    }
}

export class MoveAction extends Action {
    constructor(
        public what : Target<TargetType.card>,
        public to_where : Target<TargetType.pos> | Target<TargetType.zone>
    ){
        super()
    }
}

export class DrawAction extends Action {
    constructor(
        public isTurnDraw : boolean,
        public amount : AmountSpec = new AmountSpec(new INT_LITERAL(1), AmountType.EQ),
    ){
        super()
    }
}

export class ShuffleAction extends Action {
    constructor(
        public what : Target<TargetType.zone>
    ){
        super()
    }
}

export class AddEffectAction extends Action {
    constructor(
        public what : string,
        public to_where : Target<TargetType.card>,
        public type? : string,
        public subtype? : string,
        public is_type_subtype_override = false //if not it is add
    ){
        super()
    }
}

export class DuplicateEffectAction extends Action {
    constructor(
        public what : Target<TargetType.effect>,
        public to_where : Target<TargetType.card>,
        public type? : string,
        public subtype? : string,
        public is_type_subtype_override = false //if not it is add
    ){
        super()
    }
}

export class RemoveEffectAction extends Action {
    constructor(
        public what : Target<TargetType.effect>,
        public from_what : Target<TargetType.card>
    ){
        super()
    }
}

export class DuplicateCardAction extends Action {
    constructor(
        public what : Target<TargetType.card>,
        public to_where : Target<TargetType.zone>
    ){
        super()
    }
}

export class ResetAllOnceEffectOfCardAction extends Action {
    constructor(
        public target : Target<TargetType.card>
    ){
        super()
    }
}

export class ResetSingleOnceEffectAction extends Action {
    constructor(
        public target : Target<TargetType.effect>
    ){
        super()
    }
}