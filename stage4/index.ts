import { lexer, TOKENS } from "./lexer";
import { parser } from "./parser";
import * as AST from "../core/types"
import * as ERR from "../core/error"
import { Pipeline } from "../core/types";
import { Context } from "../core/Utils/Context";
import { CONFIG, getTokenStream } from "../core";

let IS_EXECUTING_RULE : (
    keyof typeof parser & `expect_${string}`
) = "expect_anything"

const ruleGetter = () => {
    return IS_EXECUTING_RULE
}

const targetClassifierPipe = Pipeline.lexParseASTGeneric<AST.AnyInferedTarget>(
    lexer,
    parser,
    ruleGetter,
    ERR.CannotTokenizeTarget
)

export const classifyTargetPipeline : Pipeline<AST.ExpectedTarget, AST.InferedTarget> = {
    accept(ctx){
        return ctx instanceof AST.ExpectedTarget
    },
    pipe(ctx){
        const raw = ctx.raw
        const type = ctx.expectedType

        const tokens = lexer.tokenize(raw).tokens
        if(CONFIG.VERBOSE) console.log("Classifying target with raw:", raw, "and expected type:", type);
        if(CONFIG.VERBOSE) console.log("Tokens for target classification:", tokens);

        //things already have a type like internal vars and stuff
        if(ctx instanceof AST.InferedTarget) {
            if(CONFIG.VERBOSE) console.log("Target already infered, skipping classification", ctx);
            return ctx
        }

        IS_EXECUTING_RULE = "expect_anything"

        switch(type){
            case AST.TargetType.Card     : {IS_EXECUTING_RULE = "expect_card";          break;}
            case AST.TargetType.Effect   : {IS_EXECUTING_RULE = "expect_effect";        break;}
            case AST.TargetType.Position : {IS_EXECUTING_RULE = "expect_pos";           break;}
            case AST.TargetType.Zone     : {IS_EXECUTING_RULE = "expect_zone";          break;}
            case AST.TargetType.Player   : {IS_EXECUTING_RULE = "expect_player";        break;}
            case AST.TargetType.Number   : {IS_EXECUTING_RULE = "expect_number_simple"; break;}
        }

        const R = targetClassifierPipe.pipe(raw)

        if(
            R instanceof AST.CardTarget   || 
            R instanceof AST.EffectTarget || 
            R instanceof AST.PosTarget    || 
            R instanceof AST.ZoneTarget   || 
            R instanceof AST.PlayerTarget
        ){
            Context.cache(R)
        }

        return R
    }
}

/**
 * Try parse 1 with expected type
 * if fail -> try again with expected type Any
 * if still fails -> return PREVIOUS error
 */
export function classifySingle(
    eff : AST.EffectDeclare<any>,
    t : AST.ExpectedTarget, 
    index : number,
    p : {
        action_name: string;
        targets: AST.ExpectedTarget[];
    },
    err : {
        path : (typeof p),
        target : AST.ExpectedTarget,
        target_index : number,
        error : Error
    }[],
    previous_error? : Error
) : AST.InferedTarget | undefined {

    let originalType = t.expectedType
    try{
        if(previous_error){
            //has prev errors -> is in try again mode
            t.expectedType = AST.TargetType.Any
        }
        const R = classifyTargetPipeline.pipe(t)
        if(R === undefined){
            throw previous_error? previous_error : new Error(`Failed to classify target "${t.raw}" for action "${p.action_name}". Classification pipe returns undefined`)
        }
        t.expectedType = originalType
        return R
    } catch(e1){
        const E = e1 instanceof Error ? e1 : new Error(String(e1));
        t.expectedType = originalType

        // test, dont recur
        // Result : recur incur a super negligible cost
        // ~ +20 - 30ms
        // so inefficiency lies elsewhere
        // if(!previous_error) return classifySingle(eff, t, index, p, err, E);

        err.push({
            path : p,
            target : t,
            target_index : index,
            error : E
        })
        return undefined
    }
}

function classifyPaths(
    eff : AST.EffectDeclare,
    paths : {
        action_name: string;
        targets: AST.ExpectedTarget[];
        anchor_length : number;
    }[],
){
    const err_arr : {
        path : (typeof paths)[number],
        target : AST.ExpectedTarget,
        target_index : number,
        error : Error
    }[] = []
    const P : {
        action_name: string;
        targets: (AST.AnyInferedTarget | AST.Backreference)[];
        anchor_length : number;
    }[] = []

    outer : for(const p of paths){
        const temp_err : typeof err_arr = []
        if(p.targets.length === 0){
            P.push({
                action_name : p.action_name,
                anchor_length : p.anchor_length,
                targets : [],
            })
            continue outer;
        }
        const inferedTargets : (AST.AnyInferedTarget | AST.Backreference)[] = []
        for(let index = 0; index < p.targets.length; index++){
            const t = p.targets[index]
            parser.bindTarget(t, eff)
            const R = classifySingle(eff, t, index, p, temp_err)
            if(CONFIG.VERBOSE) console.log(`[DEBUG] After classifySingle for target "${t.raw}":`, { R: R ? 'defined' : 'undefined', temp_err_length: temp_err.length });
            if(!R) {
                //early stop
                err_arr.push(...temp_err)
                continue outer; //path invalid
            }
            if(t.expectedType !== AST.TargetType.Any && t.expectedType !== R.inferredType){
                err_arr.push({
                    path : p,
                    target : t,
                    target_index : index,
                    error : new ERR.TargetTypeConflictError(AST.TargetType[t.expectedType], AST.TargetType[R.inferredType])
                })
                continue outer; //path invalid
            }
            inferedTargets.push(R as any)
        }
        P.push({
            action_name : p.action_name,
            anchor_length : p.anchor_length,
            targets : inferedTargets
        })
    }
    return [P, err_arr] as const
}

const classifySegmentPipeline : Pipeline<{
    possibleClassificationPaths: {
        action_name: string;
        targets: AST.ExpectedTarget[];
        anchor_length : number;
    }[]
} & AST.SentenceSegment, {
    action_name: string;
    targets: AST.InferedTarget[]; 
}> = {
    accept(ctx){
        return ctx instanceof AST.SentenceSegment && 'possibleClassificationPaths' in ctx
    },
    pipe(ctx){
        // if(
        //     !ctx.owner
        // ){
        //     throw new Error("Segment has no owner, skipping classification")
        // }

        // if(
        //     !ctx.owner!.owner
        // ){
        //     throw new Error("Sentece has no owner, skipping classification")
        // }

        // if(
        //     !ctx.owner!.owner!.owner
        // ){
        //     throw new Error("Effect body segment has no owner, skipping classification")
        // }
        
        let [paths, ERR2] = classifyPaths(ctx.owner!.owner!.owner!, ctx.possibleClassificationPaths)

        if(!paths.length){
            const msg : string[] = []
            msg.push(`Classified ${ctx.possibleClassificationPaths.length} possible paths for action "${ctx.raw}".`)
            msg.push(`Encountered ${ERR2.length} errors while classifying targets for action "${ctx.raw}":`)
            for(const err of ERR2){
                msg.push(`Failed to classify target #${err.target_index + 1} for action "${err.path.action_name}":`)
                msg.push(`Error message: ${err.error.message}`)
                msg.push(`Target "${err.target.raw}":`)
                msg.push(...err.target.stringify(2))
                msg.push(`Expected type: ${AST.TargetType[err.target.expectedType]}`)
            }
            Context.in(ctx)
            throw Context.error(new ERR.TargetClassificationError(msg.join("\n")))
        }

        if(paths.length > 1){
            // chevrotain DOES not throw an error for unconsumed inputs for some reason
            // so we try to pick the longest match here

            let best_paths : typeof paths = []
            let best_score = -1

            const best_anchor_length = Math.max(...paths.map(p => p.anchor_length))
            const best_paths_init = paths.filter(p => p.anchor_length === best_anchor_length)

            for(const p of best_paths_init){
                const score = p.targets.flatMap(p => p.stringify()).join("").length
                if(score > best_score){
                    best_score = score
                    best_paths = [p]
                } else if (score === best_score){
                    best_paths.push(p)
                }
            }

            if(best_paths.length > 1){
                Context.in(ctx)
                throw Context.error( new ERR.AmbiguousClassificationError(
                    Object.fromEntries(best_paths.map(p => [p.action_name, p.targets.map(t => t.stringify().join("\n"))]))
                ))
            }

            paths = best_paths
        }

        const ret = paths[0]
        const non_backref_targets = ret.targets.filter(t => !(t instanceof AST.Backreference)) as AST.AnyInferedTarget[]
        Context.cache(...non_backref_targets)
        return paths[0]
    }
}

export const stage4pipeline : Pipeline<
    AST.EffectDeclare<AST.EffectBodySegment<AST.ConditionSegment, AST.TargetSegment, AST.ActionSegment>>,
    AST.EffectDeclare<AST.EffectBodySegment<AST.InferedConditionSegment, AST.InferedTargetSegment, AST.InferedActionSegment>>
> = {
    accept(ctx){
        return ctx instanceof AST.EffectDeclare
    },
    pipe(eff){
        const newEff = eff.map(body => {
            // clear cache
            const newBody = body.map(
                condition => {
                    return condition.map(cond => {
                        const classificationPaths = classifySegmentPipeline.pipe(cond)
                        return new AST.InferedConditionSegment(
                            cond, 
                            classificationPaths.action_name,
                            classificationPaths.targets
                        )
                    })
                },
                target => {
                    return target.map(t => {
                        // console.log("segment", t)
                        const inferedTarget = t.targets.map((target, index) => {
                            parser.bindTarget(target, eff)
                            try {
                                const R = classifyTargetPipeline.pipe(target)
                                if(R === undefined){
                                    throw new Error(`Failed to classify target "${target.raw}" for target segment. Classification pipe returns undefined`)
                                }
                                return R
                            } catch(err) {
                                // console.error("Error classifying target in target segment:", target.raw, err instanceof Error ? err.message : err)
                                throw err
                            }
                        })
                        return new AST.InferedTargetSegment(t, inferedTarget)
                    })
                },
                action => {
                    return action.map(a => {

                        const classificationPaths = classifySegmentPipeline.pipe(a)
                        return new AST.InferedActionSegment(
                            a, 
                            classificationPaths.action_name,
                            classificationPaths.targets
                        )
                    })
                }
            )
            return [newBody]
        })
        IS_EXECUTING_RULE = "expect_number_extended"
        newEff.variables = Object.fromEntries(
            Object.entries(newEff.variables).map(([k, v]) => {
                if(v instanceof AST.RuntimeVariable && v.value instanceof AST.ExpectedTarget){
                    parser.bindTarget(v.value, newEff)
                    const inferedTarget = targetClassifierPipe.pipe(v.value.raw)
                    return [k, new AST.RuntimeVariable(v.raw, v.name, inferedTarget)] as const
                }
                return [k, v]
            })
        ) 
        return newEff
    }
}