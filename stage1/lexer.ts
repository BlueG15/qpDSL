import { createToken, Lexer } from "chevrotain";
import { ireg, TokenStorage } from "../core/";
const FILLER_WORDS = [
    "would", "could", "should", "can", "may", "might", "must",
    "the", "a", "an", "then"
]

const sentence_separator = (
    createToken({
        name: "SENTENCE_SEPARATOR",
        pattern: {exec : (text, startOffset) => {
            if(!text) return null;
            if(
                text[startOffset] === "." && (
                    /\s/.test(text[startOffset + 1]) ||
                    text.length === startOffset + 1
                )
            ){
                return ["."] as RegExpExecArray
            }
            if(
                text.slice(startOffset, startOffset + 4) === "then" && (
                    /\s/.test(text[startOffset + 4]) ||
                    text.length === startOffset + 4
                )
            ){
                return ["then"] as RegExpExecArray
            }
            return null
        }},
        line_breaks: true
    })
)

const effect_prefix = createToken({
    name : "EFFECT_PREFIX",
    pattern : /e_/,
    // pop_mode : true,
    push_mode : "meta_data"
})

const tokens_meta_data = new TokenStorage()
.CUSTOM("EFFECT", "PREFIX", effect_prefix)
.CUSTOM("SYMBOL", "COLON", createToken({
    name : "SYMBOL_COLON",
    pattern : /:/,
    pop_mode : true,
    push_mode : "sentences"
}))
.SYMBOLS("ARROW", /[=\-]+>/)
.SYMBOLS("DOT", /\./)
.SYMBOLS("EQ", /=/)
.SKIPPED("WHITESPACE", /\s+/)
.ID("_NO_DOT", /[a-zA-Z0-9_]+/)

const tokens_sentences = new TokenStorage()
.SKIPPED("WHITESPACE", /\s+/)
.SKIPPED("FILLER", ireg(...FILLER_WORDS))
.CUSTOM("SENTENCE", "SEPARATOR", sentence_separator)
.CUSTOM("EFFECT", "PREFIX", effect_prefix)
//id with dot only allow dot 
//if there is SOMETHING after the dot
// else the dot is lex as a sentence_separator
.ID("_WITH_DOT", /[a-zA-Z0-9_,*!<>=?\(\)\[\]\{\}]+|.[a-zA-Z0-9_,*!<>=?\(\)\[\]\{\}]+/)

export const TOKENS = {
    ...tokens_meta_data.createStorageObj(),
    ...tokens_sentences.createStorageObj(),
}

console.log(Object.keys(TOKENS))
    
export const ALL_TOKENS = Object.values(TOKENS)

export const lexer = new Lexer({
    defaultMode : "meta_data",
    modes : {
        meta_data : tokens_meta_data.all,
        sentences : tokens_sentences.all,
    },
})