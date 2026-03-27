import { ASTNode } from "../types/generic";
import util from 'node:util';

export abstract class ASTError extends Error {
    causeStack : (ASTNode | string)[] = []
    messageStack : string[] = []
    nameStack : string[] = []

    override get message(){
        return this.messageStack.join("\n")
    }

    override set message(str : string){
        this.messageStack.unshift(str)
    }

    override get name(){
        const [first, ...rest] = this.nameStack
        if(!first) return "Unknown Error";
        if(!rest.length) return `${first}`; 
        return `${first} (As one of ${rest.join(", ")})`
    }

    override set name(str : string){
        this.nameStack.unshift(str)
    }

    constructor(){
        super(`Unknown Error at stage`);
    }

    blame(...node : (ASTNode | string)[]) : void {
        this.causeStack.unshift(...node) //more recent location is up top
    }

    override toString() : string {
        let result = this.name + "\n" + this.message
        let i = 2;
        for (const node of this.causeStack) {
            const arrowStr = "-".repeat(i++) + "> "
            result += "\n"
            result += arrowStr
            if(typeof node === "string"){
                result += `At : (str)"${node}"\n`
            }
            else {
                const str = util.formatWithOptions({depth : 10, maxArrayLength : 5}, node)
                result += `At : (node)"${str}"\n`
            }
        }
        return result
    }
}