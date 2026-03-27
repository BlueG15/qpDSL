import { lexer } from "./lexer";
import { parser } from "./parser";
import { Pipeline } from "../core/types";
import * as AST from "../core/types";
import * as ERR from "../core/error"
import { Context } from "../core/Utils/Context";

const sentenceLabelerPipeline = Pipeline.LexParseAST(
    lexer,
    parser,
    "sentences"
)

const stage2pipeline : Pipeline<AST.EffectDeclare, AST.EffectDeclare<AST.EffectBodySegment>> = {
    accept(ctx){
        return ctx instanceof AST.EffectDeclare
    },
    pipe(eff){
        return eff.map(sentence => {
            const inferedSenteces = sentenceLabelerPipeline.pipe(sentence)

            const segmentConstructorInfo : {
                conditions : AST.ConditionSentence[], 
                targets : AST.TargetSentence[], 
                actions : AST.ActionSentence[]
            }[] = []
            
            let currentConditions : AST.ConditionSentence[] = []
            let currentTargets : AST.TargetSentence[] = []
            let currentActions : AST.ActionSentence[] = []
            let lastIfCondition : AST.ConditionSentence | undefined = undefined; // for else binding

            // simple binding

            for(const sentence of inferedSenteces){
                if(sentence instanceof AST.RuntimeVariableDeclareSentence){
                    const v = sentence.value
                    const V = eff.getVariable(v.name)
                    if(V){
                        Context.in(sentence)
                        throw Context.error( new ERR.RuntimeVariableClashError(v.name, V) )
                    }
                    eff.addVariable(v)
                    continue;
                }

                if(sentence instanceof AST.ConditionSentence){
                    // else binding
                    if(sentence.conditionType === AST.ConditionType.Else){
                        if(!lastIfCondition){
                            Context.in(sentence)
                            throw Context.error( new ERR.DanglingElseError() )
                        }
                        sentence.boundedIf = lastIfCondition;
                        lastIfCondition = undefined; // 1 else can only bind to 1 if
                    } else if(
                        sentence.conditionType === AST.ConditionType.If ||
                        sentence.conditionType === AST.ConditionType.Unless
                    ){
                        lastIfCondition = sentence;
                    }

                    //condition binds to the current segment
                    currentConditions.push(sentence);
                    continue;
                }

                if(sentence instanceof AST.TargetSentence){
                    //target binds to the current segment if and only if tere are NO ACTION in the current segment, otherwise it binds to the next segment
                    if(currentActions.length > 0){
                        segmentConstructorInfo.push(
                            {
                                conditions : currentConditions,
                                targets : currentTargets,
                                actions : currentActions,
                            }
                        )
                        currentConditions = []
                        currentTargets = []
                        currentActions = []
                    }
                    currentTargets.push(sentence);
                    continue;
                }

                //default : action sentence, action always binds to the current segment
                // just push
                currentActions.push(sentence);
            }

            const hasAction = currentActions.length > 0;
            const hasTarget = currentTargets.length > 0;
            const hasCondition = currentConditions.length > 0;

            //dangling target and condition is overlapping
            // but target is prefered

            if(hasAction || hasCondition || hasTarget){
                // if(!hasAction){
                //     //dangling target is throw if there are targets but no action
                //     if(hasTarget){
                //         Context.in(...currentTargets)
                //         throw Context.error( new ERR.DanglingTargetError() )
                //     }
            
                //     //dangling condition is throw if there are conditions but no action
                //     else {
                //         Context.in(...currentConditions)
                //         throw Context.error( new ERR.DanglingConditionError() )
                //     }
                // }

                // else {
                    segmentConstructorInfo.push(
                        {
                            conditions : currentConditions,
                            targets : currentTargets,
                            actions : currentActions,
                        }
                    )
                // }
            }

            const segments = segmentConstructorInfo.map((info, i) => new AST.EffectBodySegment(
                i,
                sentence,
                info.conditions,
                info.targets,
                info.actions,
            ))

            return segments
        })
    }
}

export {
    stage2pipeline,
    lexer,
    parser,
}