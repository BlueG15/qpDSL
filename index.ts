import { Pipeline } from "./core/types";
import { Context } from "./core/Utils/Context";
import { stage1pipeline } from "./stage1";
import { stage2pipeline } from "./stage2";
import { stage3pipeline } from "./stage3";
import { stage4pipeline } from "./stage4";
import { ASTNode } from "./core/types/generic";
import { CONFIG } from "./core";

export function parse(
  str: string,
  onphase? : (n : number) => void //optional callback
) {
  Context.clear()
  let lastASTOBJ : ASTNode | undefined = undefined
  try {
    // const st1 = Pipeline.exec(str, stage1pipeline)
    const st1 = stage1pipeline.pipe(str)
    Context.advanceStage(1)
    lastASTOBJ = st1
    if(CONFIG.VERBOSE) console.log("Stage 1 complete");
    if(onphase) onphase(1);

    const st2 = st1.map(stage2pipeline)
    Context.advanceStage(2)
    lastASTOBJ = st2
    if(CONFIG.VERBOSE) console.log("Stage 2 complete");
    if(onphase) onphase(2);

    const st3 = st2.map(stage3pipeline)
    Context.advanceStage(3)
    lastASTOBJ = st3
    if(CONFIG.VERBOSE) console.log("Stage 3 complete");
    if(onphase) onphase(3);

    const st4 = st3.map(stage4pipeline)
    Context.advanceStage(4)
    lastASTOBJ = st4
    if(CONFIG.VERBOSE) console.log("Stage 4 complete");
    if(onphase) onphase(4);

    return st4
  } catch (e: any) {
    if(lastASTOBJ) Context.in(lastASTOBJ);
    return Context.error(e)
  }
}