import { CstNode, CstParser, ParserMethod, TokenType } from "chevrotain";
import {TOKENS, ALL_TOKENS} from "./lexer";
import { AstGenParser } from "../core/Utils/AstGenParser";
import * as AST from "../core/types";
import * as ERR from "../core/error";
import { Context } from "../core/Utils/Context";

function tryBindBackReference(unbindBackref : AST.Backreference): AST.BackreferenceBounded {
    const target = Context.cachedTargets.reverse()
        .find(t => unbindBackref.accept(t))
    if(!target) throw Context.error( new ERR.CannotBindBackreferenceError(unbindBackref.raw) )
    return new AST.BackreferenceBounded(unbindBackref, target);
}

class Parser extends AstGenParser {
    private boundedTarget?: AST.ExpectedTarget = undefined;

    constructor(){
        super(ALL_TOKENS, { nodeLocationTracking: 'onlyOffset' })
        this.performSelfAnalysis()
    }

    bindTarget(target: AST.ExpectedTarget) {
        this.boundedTarget = target
    }

    //helpers
    operator = this.RULE("operator", () => {
        let modifier: AST.AmountModifier
        this.OR([
            {ALT: () => {
                this.CONSUME(TOKENS.op_less_than_or_equal)
                this.ACTION(() => { modifier = AST.AmountModifier.LEQ })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.op_greater_than_or_equal)
                this.ACTION(() => { modifier = AST.AmountModifier.GEQ })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.op_greater_than)
                this.ACTION(() => { modifier = AST.AmountModifier.MORE })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.op_less_than)
                this.ACTION(() => { modifier = AST.AmountModifier.LESS })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.op_not_equal_to)
                this.ACTION(() => { modifier = AST.AmountModifier.NEQ })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.op_equal_to)
                this.ACTION(() => { modifier = AST.AmountModifier.EQ })
            }},
        ])
        return this.ACTION(() => modifier!)
    })

    amount_spec_no_op = this.RULE("amount_spec_no_op", () => {
        let result: string | number | undefined
        this.OR([
            {ALT: () => {
                const tok = this.CONSUME(TOKENS.IDBIG)
                this.ACTION(() => { result = tok.image })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.SYMBOL_LCB)
                const tok = this.CONSUME(TOKENS.ID)
                this.CONSUME(TOKENS.SYMBOL_RCB)
                this.ACTION(() => { result = tok.image })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_all)
                this.ACTION(() => { result = "all" })
            }},
            {ALT: () => {
                const tok = this.CONSUME(TOKENS.INT_LITERAL)
                this.ACTION(() => { result = parseInt(tok.image) })
            }}
        ])
        return this.ACTION(() => result)
    })

    amount_spec = this.RULE("amount_spec", () => {
        let modifier: AST.AmountModifier = AST.AmountModifier.EQ
        let amount: AST.INT_LIT | AST.VarReference | "all" | undefined

        this.OPTION(() => {
            const op = this.SUBRULE(this.operator)
            this.ACTION(() => { modifier = op })
        })

        const amountNoOpResult = this.SUBRULE(this.amount_spec_no_op)

        return this.ACTION(() => {
            const amountValue = amountNoOpResult
            let processedAmount: AST.INT_LIT | AST.VarReference | "all"

            if (typeof amountValue === 'string' && amountValue !== 'all') {
                // Runtime variable with IDBIG
                processedAmount = new AST.VarReference(this.boundedTarget!, amountValue)
            } else if (typeof amountValue === 'string' && amountValue === 'all') {
                processedAmount = "all"
            } else if (typeof amountValue === 'number') {
                processedAmount = new AST.INT_LIT(this.boundedTarget!, amountValue)
            } else {
                throw Context.error( new Error("Unknown amount in amount_spec") )
            }

            return new AST.AmountSpec(processedAmount, modifier)
        })
    })

    direction_spec = this.RULE("direction_spec", () => {
        this.CONSUME(TOKENS.SYMBOL_LSB)
        const directions: AST.Direction[] = []
        this.MANY_SEP({
            DEF : () => {
                const dir = this.CONSUME(TOKENS.keyword_direction_name)
                this.ACTION(() => {
                    switch(dir.image) {
                        case "up": directions.push(AST.Direction.up); break;
                        case "down": directions.push(AST.Direction.down); break;
                        case "left": directions.push(AST.Direction.left); break;
                        case "right": directions.push(AST.Direction.right); break;
                        default: throw Context.error( new Error("Unknown direction") )
                    }
                })
            },
            SEP : TOKENS.SYMBOL_CM
        })
        this.CONSUME(TOKENS.SYMBOL_RSB)
        
        return this.ACTION(() => new AST.DirectionSpec(directions))
    })

    card_flag = this.RULE("card_flag", () => {
        let flag: AST.CardFlag | undefined
        this.OR([
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_random)
                this.ACTION(() => { flag = new AST.RandomFlag() })
            }},
            {ALT: () => {
                const ext = this.CONSUME(TOKENS.IDEXTENSION)
                this.ACTION(() => { flag = new AST.ExtensionFlag(ext.image) })
            }},
            {ALT: () => {
                const rarity = this.CONSUME(TOKENS.keyword_card_rarity)
                this.ACTION(() => { flag = new AST.RarityFlag(rarity.image) })
            }},
            {ALT: () => {
                const id = this.CONSUME(TOKENS.ID)
                this.ACTION(() => { flag = new AST.ArchetypeFlag(id.image) })
            }},
            {ALT: () => {
                const stat = this.CONSUME(TOKENS.keyword_card_stat)
                const amountCtx = this.SUBRULE(this.amount_spec_no_op)
                this.ACTION(() => {
                    let statValue: AST.INT_LIT | AST.VarReference | "all"
                    if (typeof amountCtx === 'string' && amountCtx !== 'all') {
                        statValue = new AST.VarReference(this.boundedTarget!, amountCtx)
                    } else if (amountCtx === 'all') {
                        statValue = 'all'
                    } else if (typeof amountCtx === 'number') {
                        statValue = new AST.INT_LIT(this.boundedTarget!, amountCtx)
                    } else {
                        throw Context.error( new Error("Unknown stat value") )
                    }
                    flag = new AST.PropertyValueFLag(stat.image, new AST.AmountSpec(statValue))
                })
            }},
            {ALT: () => {
                const playerName = this.CONSUME(TOKENS.keyword_player_name)
                const playerIndex = this.OPTION(() => this.CONSUME(TOKENS.INT_LITERAL))
                this.ACTION(() => {
                    flag = new AST.PlayerFlag(playerName.image, playerIndex ? parseInt(playerIndex.image) : undefined)
                })
            }}
        ])
        return this.ACTION(() => flag!)
    })

    effect_flag = this.RULE("effect_flag", () => {
        let flag: AST.EffectFlag | undefined
        this.OR([
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_random)
                this.ACTION(() => { flag = new AST.RandomFlag() })
            }},
            {ALT: () => {
                const type = this.CONSUME(TOKENS.keyword_effect_type)
                this.ACTION(() => { flag = new AST.EffectTypeFlag(type.image) })
            }},
            {ALT: () => {
                const subtype = this.CONSUME(TOKENS.keyword_effect_subtype)
                this.ACTION(() => { flag = new AST.EffectSubtypeFlag(subtype.image) })
            }},
        ])
        return this.ACTION(() => flag!)
    })

    pos_flag = this.RULE("pos_flag", () => {
        let flag: AST.PosFlag | undefined
        this.OR([
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_random)
                this.ACTION(() => { flag = new AST.RandomFlag() })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_row)
                const rowSpecCtx = this.SUBRULE1(this.amount_spec_no_op)
                this.ACTION(() => {
                    let rowValue: AST.INT_LIT | AST.VarReference | "all"
                    if (typeof rowSpecCtx === 'string' && rowSpecCtx !== 'all') {
                        rowValue = new AST.VarReference(this.boundedTarget!, rowSpecCtx)
                    } else if (rowSpecCtx === 'all') {
                        rowValue = 'all'
                    } else if (typeof rowSpecCtx === 'number') {
                        rowValue = new AST.INT_LIT(this.boundedTarget!, rowSpecCtx)
                    } else {
                        throw Context.error( new Error("Unknown row value") )
                    }
                    flag = new AST.PropertyValueFLag("row", new AST.AmountSpec(rowValue))
                })
            }},
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_col)
                const colSpecCtx = this.SUBRULE2(this.amount_spec_no_op)
                this.ACTION(() => {
                    let colValue: AST.INT_LIT | AST.VarReference | "all"
                    if (typeof colSpecCtx === 'string' && colSpecCtx !== 'all') {
                        colValue = new AST.VarReference(this.boundedTarget!, colSpecCtx)
                    } else if (colSpecCtx === 'all') {
                        colValue = 'all'
                    } else if (typeof colSpecCtx === 'number') {
                        colValue = new AST.INT_LIT(this.boundedTarget!, colSpecCtx)
                    } else {
                        throw Context.error( new Error("Unknown col value") )
                    }
                    flag = new AST.PropertyValueFLag("col", new AST.AmountSpec(colValue))
                })
            }},
        ])
        return this.ACTION(() => flag!)
    })

    zone_flag = this.RULE("zone_flag", () => {
        let flag: AST.ZoneFlag | undefined
        this.OR([
            {ALT: () => {
                this.CONSUME(TOKENS.keyword_random)
                this.ACTION(() => { flag = new AST.RandomFlag() })
            }},
            {ALT: () => {
                const playerName = this.CONSUME(TOKENS.keyword_player_name)
                const playerIndex = this.OPTION(() => this.CONSUME(TOKENS.INT_LITERAL))
                this.ACTION(() => {
                    flag = new AST.PlayerFlag(playerName.image, playerIndex ? parseInt(playerIndex.image) : undefined)
                })
            }}
        ])
        return this.ACTION(() => flag!)
    })

    //main targets
    card_spec = this.RULE("card_spec", () => {
        const flags: AST.CardFlag[] = []
        let amount: AST.AmountSpec | undefined
        let fromClause: AST.ZoneTarget | AST.PosTarget | AST.Backreference | undefined
        const withClauses: AST.CardWithClause[] = []

        this.OPTION1(() => {
            const amt = this.SUBRULE1(this.amount_spec)
            this.ACTION(() => { amount = amt })
        })

        this.MANY1(() => {
            const flg = this.SUBRULE(this.card_flag)
            this.ACTION(() => flags.push(flg))
        })

        this.CONSUME(TOKENS.keyword_card)

        //from clause
        this.OPTION2(() => {
            this.CONSUME(TOKENS.prep_from)
            const from = this.SUBRULE(this.expect_pos_or_zone)
            this.ACTION(() => { fromClause = from })
        })

        //with clause (many)
        this.MANY2(() => {
            this.CONSUME(TOKENS.prep_with)
            this.OR([
                {
                    ALT: () => {
                        const eff = this.SUBRULE(this.expect_effect)
                        this.ACTION(() => { 
                            withClauses.push({ effect: eff })
                        })
                    }
                },
                {
                    ALT: () => {
                        const stat = this.SUBRULE2(this.amount_spec)
                        this.CONSUME(TOKENS.keyword_card_stat)
                        this.ACTION(() => {
                            withClauses.push({ stat: { statName: "", statValue: stat } })
                        })
                    },
                    GATE: this.BACKTRACK(() => {
                        this.SUBRULE2(this.amount_spec)
                        this.CONSUME(TOKENS.keyword_card_stat)
                    }) 
                }
            ])
        })

        return this.ACTION(() => new AST.CardTarget(this.boundedTarget!, amount, flags, fromClause, withClauses))
    })

    effect_spec = this.RULE("effect_spec", () => {
        const flags: AST.EffectFlag[] = []
        let amount: AST.AmountSpec | undefined
        let fromClause: AST.CardTarget | AST.Backreference | undefined

        this.OPTION1(() => {
            const amt = this.SUBRULE(this.amount_spec)
            this.ACTION(() => { amount = amt })
        })

        this.MANY(() => {
            const flg = this.SUBRULE(this.effect_flag)
            this.ACTION(() => flags.push(flg))
        })

        this.CONSUME(TOKENS.keyword_effect)

        //from clause
        this.OPTION2(() => {
            this.CONSUME(TOKENS.prep_from)
            const from = this.SUBRULE(this.expect_card)
            this.ACTION(() => { fromClause = from })
        })

        return this.ACTION(() => new AST.EffectTarget(this.boundedTarget!, amount, flags, fromClause))
    })

    pos_spec = this.RULE("pos_spec", () => {
        const flags: AST.PosFlag[] = []
        let amount: AST.AmountSpec | undefined
        let fromClause: AST.ZoneTarget | AST.Backreference | undefined
        let directionClause: AST.DirectionSpec[] | undefined
        let distanceClause: AST.PositionDistanceClause | undefined
        const withClauses: (AST.CardTarget | AST.Backreference)[] = []

        this.OPTION1(() => {
            const amt = this.SUBRULE1(this.amount_spec)
            this.ACTION(() => { amount = amt })
        })

        this.MANY1(() => {
            const flg = this.SUBRULE(this.pos_flag)
            this.ACTION(() => flags.push(flg))
        })

        //from clause
        this.OPTION2(() => {
            this.CONSUME1(TOKENS.prep_from)
            const from = this.SUBRULE(this.expect_zone)
            this.ACTION(() => { fromClause = from })
        })

        //in direction clause
        this.OPTION3(() => {
            this.CONSUME(TOKENS.prep_in)
            this.CONSUME(TOKENS.keyword_direction)
            this.CONSUME2(TOKENS.prep_from)
            const dirs: AST.DirectionSpec[] = []
            this.MANY_SEP({
                DEF : () => {
                    const dir = this.SUBRULE(this.direction_spec)
                    this.ACTION(() => dirs.push(dir))
                },
                SEP : TOKENS.SYMBOL_CM
            })
            this.ACTION(() => { directionClause = dirs })
        })

        //within distance clause
        this.OPTION4(() => {
            this.CONSUME(TOKENS.prep_within)
            this.CONSUME(TOKENS.keyword_distance)
            const dist = this.SUBRULE2(this.amount_spec)
            this.CONSUME3(TOKENS.prep_from)
            const card = this.SUBRULE1(this.expect_card)
            this.ACTION(() => { 
                distanceClause = { distance: dist, from: card }
            })
        })

        //with clause (many)
        this.MANY2(() => {
            this.CONSUME(TOKENS.prep_with)
            const card = this.SUBRULE2(this.expect_card)
            this.ACTION(() => withClauses.push(card))
        })

        return this.ACTION(() => new AST.PosTarget(this.boundedTarget!, amount, flags, fromClause, directionClause, distanceClause, withClauses))
    })

    zone_spec = this.RULE("zone_spec", () => {
        const flags: AST.ZoneFlag[] = []
        let amount: AST.AmountSpec | undefined
        
        this.OPTION(() => {
            const amt = this.SUBRULE(this.amount_spec)
            this.ACTION(() => { amount = amt })
        })

        this.MANY(() => {
            const flg = this.SUBRULE(this.zone_flag)
            this.ACTION(() => flags.push(flg))
        })

        const zoneName = this.CONSUME(TOKENS.keyword_zone_name)

        return this.ACTION(() => new AST.ZoneTarget(this.boundedTarget!, amount, flags, zoneName.image))
    })

    // entry points (top level rules)

    expect_pos_or_zone = this.RULE("expect_pos_or_zone", () => {
        let result: AST.ZoneTarget | AST.PosTarget | AST.BackreferenceBounded | undefined
        this.OR1([
            //backref with optional shape spec (pos or zone)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    this.OR2([
                        {
                            ALT: () => {
                                const spec = this.SUBRULE1(this.pos_spec)
                                const info = this.endRecordTokens()
                                this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                            },
                            GATE : () => this.lookaheadUntilToken(TOKENS.keyword_pos)
                        },
                        {ALT: () => {
                            const spec = this.SUBRULE1(this.zone_spec)
                            const info = this.endRecordTokens()
                            this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                        }}
                    ])
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {
                ALT: () => {
                    const spec = this.SUBRULE2(this.pos_spec)
                    this.ACTION(() => { result = spec })
                },
                GATE : () => this.lookaheadUntilToken(TOKENS.keyword_pos)
            },
            {ALT: () => {
                const spec = this.SUBRULE2(this.zone_spec)
                this.ACTION(() => { result = spec })
            }}
        ])
        return this.ACTION(() => result!)
    })

    expect_card = this.RULE("expect_card", () => {
        let result: AST.CardTarget | AST.BackreferenceBounded | undefined
        this.OR([
            //backref with optional shape spec (card)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    const spec = this.SUBRULE1(this.card_spec)
                    const info = this.endRecordTokens()
                    this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {ALT: () => {
                const spec = this.SUBRULE2(this.card_spec)
                this.ACTION(() => { result = spec })
            }}
        ])
        return this.ACTION(() => result!)
    })

    expect_effect = this.RULE("expect_effect", () => {
        let result: AST.EffectTarget | AST.BackreferenceBounded | undefined
        this.OR([
            //backref with optional shape spec (effect)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    const spec = this.SUBRULE1(this.effect_spec)
                    const info = this.endRecordTokens()
                    this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {ALT: () => {
                const spec = this.SUBRULE2(this.effect_spec)
                this.ACTION(() => { result = spec })
            }}
        ])
        return this.ACTION(() => result!)
    })

    expect_pos = this.RULE("expect_pos", () => {
        let result: AST.PosTarget | AST.BackreferenceBounded | undefined
        this.OR([
            //backref with optional shape spec (pos)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    const spec = this.SUBRULE1(this.pos_spec)
                    const info = this.endRecordTokens()
                    this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {ALT: () => {
                const spec = this.SUBRULE2(this.pos_spec)
                this.ACTION(() => { result = spec })
            }}
        ])
        return this.ACTION(() => result!)
    })

    expect_zone = this.RULE("expect_zone", () => {
        let result: AST.ZoneTarget | AST.BackreferenceBounded | undefined
        this.OR([
            //backref with optional shape spec (zone)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    const spec = this.SUBRULE1(this.zone_spec)
                    const info = this.endRecordTokens()
                    this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {ALT: () => {
                const spec = this.SUBRULE2(this.zone_spec)
                this.ACTION(() => { result = spec })
            }}
        ])
        return this.ACTION(() => result!)
    })

    expect_number = this.RULE("expect_number", () => {
        let result: AST.INT_LIT | AST.VarReference | undefined
        this.OR([
            {ALT: () => {
                const tok = this.CONSUME(TOKENS.INT_LITERAL)
                this.ACTION(() => { result = new AST.INT_LIT(this.boundedTarget!, parseInt(tok.image)) })
            }},
            //runtime var reference
            {ALT: () => {
                const tok = this.CONSUME(TOKENS.IDBIG)
                this.ACTION(() => { result = new AST.VarReference(this.boundedTarget!, tok.image) })
            }},
            //internal var reference with {}
            {ALT: () => {
                this.CONSUME(TOKENS.SYMBOL_LCB)
                const tok = this.CONSUME(TOKENS.ID)
                this.CONSUME(TOKENS.SYMBOL_RCB)
                this.ACTION(() => { result = new AST.VarReference(this.boundedTarget!, tok.image) })
            }}
        ])
        return this.ACTION(() => new AST.NumberTarget(this.boundedTarget!, result!))
    })

    expect_player = this.RULE("expect_player", () => {
        const playerName = this.CONSUME(TOKENS.keyword_player_name)
        const playerIndex = this.OPTION(() => this.CONSUME(TOKENS.INT_LITERAL))
        
        return this.ACTION(() => new AST.PlayerTarget(this.boundedTarget!, playerName.image, playerIndex ? parseInt(playerIndex.image) : undefined))
    })

    private lookaheadUntilToken(token : TokenType){
        let i = 1
        let nextToken = this.LA(i)
        while(nextToken.tokenType.name !== "EOF"){
            if(nextToken.tokenType === token){
                return true
            }
            i++
            nextToken = this.LA(i)
        }
        return false
    }

    expect_anything = this.RULE("expect_anything", () => {
        let result: AST.CardTarget | AST.EffectTarget | AST.PosTarget | AST.ZoneTarget | AST.BackreferenceBounded | undefined
        
        this.OR1([
            //backref with optional shape spec (card or effect or pos or zone)
            {ALT: () => {
                this.beginRecordTokens()
                this.CONSUME2(TOKENS.keyword_back_refrence)
                let ref: AST.Backreference | undefined
                this.OPTION(() => {
                    this.OR2([
                        {
                            ALT: () => {
                                const spec = this.SUBRULE1(this.card_spec)
                                const info = this.endRecordTokens()
                                this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                            },
                            GATE : () => this.lookaheadUntilToken(TOKENS.keyword_card)
                        },
                        {
                            ALT: () => {
                                const spec = this.SUBRULE1(this.effect_spec)
                                const info = this.endRecordTokens()
                                this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                            },
                            GATE : () => this.lookaheadUntilToken(TOKENS.keyword_effect)
                        },
                        {
                            ALT: () => {
                                const spec = this.SUBRULE1(this.pos_spec)
                                const info = this.endRecordTokens()
                                this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                            },
                            GATE : () => this.lookaheadUntilToken(TOKENS.keyword_pos)
                        },
                        {
                            ALT: () => {
                                const spec = this.SUBRULE1(this.zone_spec)
                                const info = this.endRecordTokens()
                                this.ACTION(() => { ref = new AST.Backreference(info.raw, spec) })
                            },
                            GATE : () => this.lookaheadUntilToken(TOKENS.keyword_zone_name)
                        },
                    ])
                })
                this.ACTION(() => {
                    if (!ref) {
                        const info = this.endRecordTokens()
                        ref = new AST.AnyBackreference(info.raw)
                    }
                    result = tryBindBackReference(ref)
                })
            }},
            //explicit new target spec
            {
                ALT: () => {
                    const spec = this.SUBRULE2(this.card_spec)
                    this.ACTION(() => { result = spec })
                },
                GATE : () => this.lookaheadUntilToken(TOKENS.keyword_card)
            },
            {
                ALT: () => {
                    const spec = this.SUBRULE2(this.effect_spec)
                    this.ACTION(() => { result = spec })
                },
                GATE : () => this.lookaheadUntilToken(TOKENS.keyword_effect)
            },
            {
                ALT: () => {
                    const spec = this.SUBRULE2(this.pos_spec)
                    this.ACTION(() => { result = spec })
                },
                GATE : () => this.lookaheadUntilToken(TOKENS.keyword_pos)
            },
            {
                ALT: () => {
                    const spec = this.SUBRULE2(this.zone_spec)
                    this.ACTION(() => { result = spec })
                },
                GATE : () => this.lookaheadUntilToken(TOKENS.keyword_zone_name)
            },
        ])
        
        return this.ACTION(() => result!)
    })
}

export const parser = new Parser()
export const visitor = parser.getBaseCstVisitorConstructor()