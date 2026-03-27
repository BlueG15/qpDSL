import { Lexer, } from "chevrotain";
import { TokenStorage } from "../core"

const tokens = new TokenStorage()
.SKIPPED("whitespace", /\s+/)
.ID("EXTENSION", /\.[a-zA-Z0-9_]+/)
.ID("", /[a-z_]+/)
.ID("BIG", /[A-Z]+/)
.LITERAL("INT", /\d+/)

.SYMBOLS("SIGN", /[\+\-]/)
.SYMBOLS("LCB", /{/)
.SYMBOLS("RCB", /}/)
.SYMBOLS("LSB", /\[/)
.SYMBOLS("RSB", /\]/)

.SYMBOLS("CM", /,/)

.OP("less_than_or_equal", "<=", "no more", "no more than", "maximum")
.OP("greater_than_or_equal", ">=", "at least", "at least more than", "minimum")
.OP("greater_than", ">", "more", "more than")
.OP("less_than", "<", "less", "fewer", "less than", "fewer than")
.OP("not_equal_to", "!=", "!==", "not", "not exactly", "not exactly as", "not equal to", "different", "different to")
.OP("equal_to", "==", "===", "exactly", "exactly as")

.KEYWORD("card", "cards")
.KEYWORD("effect", "effects")
.KEYWORD("pos", "position", "positions")
.KEYWORD("player", "players", "enemy", "enemies")
.KEYWORD("action")

.KEYWORD("back_refrence", "it", "that", "targeted", "those", "they", "them")

//flags
.KEYWORD("zone_name", "hand", "deck", "field", "grave", "void", "storage")
.KEYWORD("card_stat", "atk", "hp", "level")
.KEYWORD("card_rarity", "red", "green", "blue", "artifact", "potion", "ability")
.KEYWORD("effect_type", "init", "passive", "trigger", "death", "lock")
.KEYWORD("effect_subtype", "unique", "once", "chained", "delayed", "hard unique", "bonded")
.KEYWORD("random")
.KEYWORD("all")
.KEYWORD("row")
.KEYWORD("col", "column")
.KEYWORD("heart")
.KEYWORD("player_name", "player", "enemy")
.KEYWORD("direction", "directions")
.KEYWORD("distance", "distances")
.KEYWORD("direction_name", "up", "down", "left", "right")

.PREPOSITION("from", "on", "by", "in", "of")
.PREPOSITION("within")
.PREPOSITION("with")
.PREPOSITION("in")


//insert generaion here

export const ALL_TOKENS = tokens.all
export const TOKENS = tokens.createStorageObj()
export const lexer = new Lexer(ALL_TOKENS)