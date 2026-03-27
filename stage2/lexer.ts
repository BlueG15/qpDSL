import { Lexer } from "chevrotain";
import { TokenStorage } from "../core/";

const tokens = new TokenStorage()
.SKIPPED("WHITESPACE", /\s+/)
.KEYWORD("if", "iff", "when", "whenever", "before", "after")
.KEYWORD("else", "otherwise")
.KEYWORD("unless")
.KEYWORD("target", "targets")
.KEYWORD("where")
.KEYWORD("is")
.OP("and")
.OP("or")
.ID("", /[a-zA-Z0-9_,*!<>=?\(\)\[\]\{\}]+|.[a-zA-Z0-9_,*!<>=?\(\)\[\]\{\}]+/)

export const TOKENS = tokens.createStorageObj()
export const ALL_TOKENS = tokens.all
export const lexer = new Lexer(ALL_TOKENS)