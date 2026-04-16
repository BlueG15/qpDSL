import { lexer } from "./lexer";
import { parser } from "./parser";
import { Pipeline } from "../core/types";
import { Context } from "../core/Utils/Context";
import { preprocess } from "./preprocessor";
import { CONFIG } from "../core";

const stage1pipeline = Pipeline.pipe(
    preprocess,
    Pipeline.pipe(
        Pipeline.LexParseAST(
            lexer,
            parser,
            "program"
        ),
        (program) => {
            if(!program){
                let helper_str : string;
                try{
                    const lexer_output = lexer.tokenize(Context.raw)
                    helper_str = `Lexer output tokens: ${lexer_output.tokens.map(t => t.image + "(" + t.tokenType.name + ")").join(", ")}`
                }catch(e){
                    helper_str = `Lexer failed with error: ${(e as Error).message}`
                }
                throw new Error("Phase 1 Parsing failed, no program generated." + (helper_str ? "\n" + helper_str : ""))
            }
            if(CONFIG.VERBOSE) console.log("Program after parsing:", program);
            for(const eff of program.effects) Context.registerEffectName(eff.name);
            return program
        }
    )
)

export {
    stage1pipeline,
    lexer,
    parser,
}