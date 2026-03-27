import { lexer } from "./lexer";
import { parser } from "./parser";
import * as AST from "../core/types"
import * as ERR from "../core/error"
import { Pipeline } from "../core/types";
import { Context } from "../core/Utils/Context";

const expectCardPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_card",
    ERR.CannotTokenizeTarget,
)

const expectEffectPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_effect",
    ERR.CannotTokenizeTarget
)

const expectPosPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_pos",
    ERR.CannotTokenizeTarget
)

const expectZonePipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_zone",
    ERR.CannotTokenizeTarget
)

const expectPlayerPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_player",
    ERR.CannotTokenizeTarget
)

const expectNumberPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_number",
    ERR.CannotTokenizeTarget
)

const expectAnythingPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "expect_anything",
    ERR.CannotTokenizeTarget
)

const classifyTargetPipeline : Pipeline<AST.ExpectedTarget, AST.InferedTarget> = {
    accept(ctx){
        return ctx instanceof AST.ExpectedTarget
    },
    pipe(ctx){
        const raw = ctx.raw
        const type = ctx.expectedType

        let target : AST.InferedTarget | undefined = undefined

        //things already have a type like internal vars and stuff
        if(ctx instanceof AST.InferedTarget) target = (ctx as any);

        function classifyAST(ctx : AST.ExpectedTarget){
            parser.bindTarget(ctx)
            switch(type){
                case AST.TargetType.Card: return expectCardPipeline.pipe(raw)
                case AST.TargetType.Effect: return expectEffectPipeline.pipe(raw)
                case AST.TargetType.Position: return expectPosPipeline.pipe(raw)
                case AST.TargetType.Zone: return expectZonePipeline.pipe(raw)
                case AST.TargetType.Player: return expectPlayerPipeline.pipe(raw)
                case AST.TargetType.Number: return expectNumberPipeline.pipe(raw)
                default: return expectAnythingPipeline.pipe(raw)
            }
        }

        return target || classifyAST(ctx)
    }
}

const classifySegmentPipeline : Pipeline<{
    possibleClassificationPaths: {
        action_name: string;
        targets: AST.ExpectedTarget[];
    }[]
} & AST.SentenceSegment, {
    action_name: string;
    targets: AST.InferedTarget[];  
}> = {
    accept : (ctx) => {
        return ctx instanceof AST.SentenceSegment && "possibleClassificationPaths" in ctx
    },
    pipe(ctx){
        const paths = ctx.possibleClassificationPaths.map(p => {
            const inferedTargets = p.targets.map(t => {
                try{
                    return classifyTargetPipeline.pipe(t)
                } catch(e){
                    return undefined
                }
            })
            if(inferedTargets.some(t => t === undefined)) return undefined
            return {
                action_name : p.action_name,
                targets : inferedTargets as (AST.AnyBackreference | AST.Backreference)[]
            }
        }).filter(p => p !== undefined) as {
            action_name : string,
            targets : (AST.AnyBackreference | AST.Backreference)[]
        }[]

        if(!paths.length){
            Context.in(ctx)
            //TODO : replace this with more specific error message
            throw Context.error( new ERR.TargetClassificationError(ctx.raw) )
        }

        if(paths.length > 1){
            Context.in(ctx)
            throw Context.error( new ERR.AmbiguousClassificationError(
                Object.fromEntries(paths.map(p => [p.action_name, p.targets.map(t => t.raw)]))
            ))
        }

        const ret = paths[0]
        Context.cache(...ret.targets.filter(t => !(t instanceof AST.Backreference)))
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
        return eff.map(body => {
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
                        const inferedTarget = t.targets.map(classifyTargetPipeline.pipe)
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
    }
}