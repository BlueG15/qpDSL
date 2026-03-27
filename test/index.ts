import { ASTError } from "../core/error";
import { ASTNode, Pipeline, Program } from "../core/types";
import { Context } from "../core/Utils/Context";
import { stage1pipeline } from "../stage1";
import { stage2pipeline } from "../stage2";
import { stage3pipeline } from "../stage3";
import { stage4pipeline } from "../stage4";

function parse(str : string){
    Context.clear()
    try{
        const st1 = Pipeline.exec(str, stage1pipeline)
        const st2 = st1.map(stage2pipeline)
        const st3 = st2.map(stage3pipeline)
        const st4 = st3.map(stage4pipeline)
        return st4
    }catch(e : any){
        return e as ASTError
    }
}

const basic_test = "e_test.init: draw 2."

console.log("RUNNING BASIC TEST")
console.dir( parse(basic_test) , { depth : 20 } )
console.log("BASIC TEST COMPLETE")

//some light custom CLI to continuously auto test user input
// commented out since the basic test errors
const readline = require("readline").createInterface({
    input : process.stdin,
    output : process.stdout
})
const quitCommands = ["exit", "quit", "q", "--q", "-q", "end", "stop", "cls"]

readline.setPrompt("Enter a QPDSL sentence (or 'exit' to quit): ")

readline.on('line', (input : string) => {
    const trimmedInput = input.trim().toLowerCase()
    if(quitCommands.includes(trimmedInput)){
        if(trimmedInput === "cls"){
            console.clear()
        }
        readline.close()
        return;
    }
    const result = parse(input)
    console.dir(result, { depth : 20 })
    console.log("")
    readline.prompt()
})

readline.prompt()