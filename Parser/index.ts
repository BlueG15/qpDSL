import { CstParser, IParserConfig } from "chevrotain";
import { TOKENS, ALL_TOKENS } from "../Lexer";

class qpRemakeParserClass extends CstParser {
    constructor(config? : IParserConfig){
        super(ALL_TOKENS, config)
        this.performSelfAnalysis()
    }

    // ===== TOP LEVEL SYNTAX =====

    program = this.RULE("program", () => {
        this.MANY(() => {
            this.SUBRULE(this.effect_decl)
        })
    })

    effect_decl = this.RULE("effect_decl", () => {
        this.SUBRULE(this.effect_id)
        this.CONSUME(TOKENS.SYMBOL_DOT)
        this.SUBRULE(this.effect_meta_data)
        this.CONSUME(TOKENS.SYMBOL_COLON)
        this.SUBRULE(this.effect_segments)
    })

    effect_segments = this.RULE("effect_segments", () => {
        this.OPTION(() => {
            this.SUBRULE(this.target_stmt_list)
            this.CONSUME(TOKENS.SYMBOL_DOT)
        })
        this.SUBRULE(this.action_stmt_list)
    })

    target_stmt_list = this.RULE("target_stmt_list", () => {
        this.AT_LEAST_ONE_SEP({
            DEF : () => this.SUBRULE(this.target_stmt_with_cond),
            SEP : TOKENS.SYMBOL_DOT
        })
    })

    target_stmt_with_cond = this.RULE("target_stmt_with_cond", () => {
        this.OPTION(() => {
            this.SUBRULE(this.condition_stmt)
        })
        this.SUBRULE(this.target_stmt)
        this.OPTION2(() => {
            this.SUBRULE2(this.condition_stmt)
        })
    })

    action_stmt_list = this.RULE("action_stmt_list", () => {
        this.AT_LEAST_ONE_SEP({
            DEF : () => this.SUBRULE(this.action_stmt_with_cond),
            SEP : TOKENS.SYMBOL_DOT
        })
    })

    action_stmt_with_cond = this.RULE("action_stmt_with_cond", () => {
        this.OPTION(() => {
            this.SUBRULE(this.condition_stmt)
        })
        this.SUBRULE(this.action_stmt)
        this.OPTION2(() => {
            this.SUBRULE2(this.condition_stmt)
        })
    })

    effect_id = this.RULE("effect_id", () => {
        this.CONSUME(TOKENS.ID)
        this.MANY(() => {
            this.OR([
                { ALT: () => this.CONSUME1(TOKENS.ID) },
                { ALT: () => this.CONSUME1(TOKENS.INT_LITERAL) },
                { ALT: () =>this.CONSUME(TOKENS.SYMBOL_UNDER_SCORE)}
            ])
        })
    })

    effect_meta_data = this.RULE("effect_meta_data", () => {
        this.AT_LEAST_ONE_SEP({
            DEF: () => this.OR([
                {
                    GATE: this.BACKTRACK(this.internal_var_decl),
                    ALT: () => this.SUBRULE(this.internal_var_decl)
                },
                { ALT: () => this.CONSUME(TOKENS.ID) }
            ]),
            SEP: TOKENS.SYMBOL_DOT
        })
    })

    internal_var_decl = this.RULE("internal_var_decl", () => {
        this.CONSUME(TOKENS.ID)
        this.CONSUME(TOKENS.SYMBOL_EQ)
        this.CONSUME(TOKENS.INT_LITERAL)
        this.OPTION(() => {
            this.CONSUME(TOKENS.SYMBOL_ARROW)
            this.CONSUME1(TOKENS.INT_LITERAL)
        })
    })

    // ===== GLOBAL RULES =====

    id_list = this.RULE("id_list", () => {
        this.AT_LEAST_ONE_SEP({
            DEF : () => this.CONSUME(TOKENS.ID),
            SEP : TOKENS.SYMBOL_COMMA
        })
    })
    id_list_no_sep = this.RULE("id_list_no_sep", () => {
        this.AT_LEAST_ONE(() => this.CONSUME(TOKENS.ID))
    })

    op_compare = this.RULE("op_compare", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.op_equal_to) },
            { ALT: () => this.CONSUME(TOKENS.op_not_equal_to) },
            { ALT: () => this.CONSUME(TOKENS.op_less_than_or_equal) },
            { ALT: () => this.CONSUME(TOKENS.op_greater_than_or_equal) },
            { ALT: () => this.CONSUME(TOKENS.op_greater_than) },
            { ALT: () => this.CONSUME(TOKENS.op_less_than) }
        ])
    })

    internal_var_ref = this.RULE("internal_var_ref", () => {
        this.CONSUME(TOKENS.SYMBOL_LCB)
        this.CONSUME(TOKENS.ID)
        this.CONSUME(TOKENS.SYMBOL_RCB)
    })

    amount_spec = this.RULE("amount_spec", () => {
        this.OPTION(() => {
            this.SUBRULE(this.op_compare)
        })
        this.SUBRULE(this.amount_spec_no_op)
    })

    amount_spec_no_op = this.RULE("amount_spec_no_op", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.INT_LITERAL) },
            { ALT: () => this.SUBRULE(this.internal_var_ref) }
        ])
    })

    amount_spec_with_all = this.RULE("amount_spec_with_all", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.keyword_all) },
            { ALT: () => this.SUBRULE(this.amount_spec) }
        ])
    })

    backref = this.RULE("backref", () => {
        this.CONSUME(TOKENS.keyword_back_reference)
        this.OPTION(() => 
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.keyword_card) },
                { ALT: () => this.CONSUME(TOKENS.keyword_effect) },
                { ALT: () => this.CONSUME(TOKENS.keyword_zone) },
                { ALT: () => this.CONSUME(TOKENS.keyword_position) },
            ])
        )
    })

    from_word = this.RULE("from_word", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.prep_from) },
            { ALT: () => this.CONSUME(TOKENS.prep_on) },
            { ALT: () => this.CONSUME(TOKENS.prep_in) },
            { ALT: () => this.CONSUME(TOKENS.prep_within) }
        ])
    })

    card_spec = this.RULE("card_spec", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.keyword_this_card) },
            { ALT: () => this.SUBRULE(this.backref) },
            { ALT: () => this.SUBRULE(this.target_card_inline) }
        ])
    })

    effect_spec = this.RULE("effect_spec", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.keyword_this_effect) },
            { ALT: () => this.SUBRULE(this.backref) },
            { ALT: () => this.SUBRULE(this.target_effect_inline) }
        ])
    })

    pos_spec = this.RULE("pos_spec", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.backref) },
            { ALT: () => this.SUBRULE(this.target_pos_inline) }
        ])
    })

    zone_spec = this.RULE("zone_spec", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.backref) },
            { ALT: () => this.SUBRULE(this.target_zone_inline) }
        ])
    })

    num_spec = this.RULE("num_spec", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.amount_spec_no_op) },
            { ALT: () => this.SUBRULE(this.property_access) }
        ])
    })

    player_spec = this.RULE("player_spec", () => {
        this.OR([
            { 
                ALT: () => {
                    this.CONSUME(TOKENS.ID)
                    this.OPTION(() => {
                        this.CONSUME(TOKENS.INT_LITERAL)
                    })
                }
            },
            { ALT: () => this.CONSUME(TOKENS.keyword_this_player) }
        ])
    })

    property_access = this.RULE("property_access", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.property_access_card) },
            { ALT: () => this.SUBRULE(this.number_of_targets) }
        ])
    })

    property_access_card = this.RULE("property_access_card", () => {
        this.CONSUME(TOKENS.ID) // CARD_KEY
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE1(this.card_spec)
    })

    any_spec = this.RULE("any_spec", () => {
        //almost any spec potentially have an infinite lookahead
        //the reccomended approach for this is to use backtrack
        this.OR([
            { 
                GATE : this.BACKTRACK(this.card_spec),
                ALT: () => this.SUBRULE(this.card_spec)
            },
            { 
                GATE : this.BACKTRACK(this.effect_spec),
                ALT: () => this.SUBRULE(this.effect_spec) 
            },
            { 
                GATE : this.BACKTRACK(this.pos_spec),
                ALT: () => this.SUBRULE(this.pos_spec)
            },
            { ALT: () => this.SUBRULE(this.zone_spec) }
        ])
    })

    zone_or_pos_spec = this.RULE("zone_or_pos_spec", () => {
        this.OR([
            {
                GATE : this.BACKTRACK(this.pos_spec),
                ALT: () => this.SUBRULE(this.pos_spec) },
            {
                GATE : this.BACKTRACK(this.zone_spec),
                ALT: () => this.SUBRULE(this.zone_spec)
            }
        ])
    })

    number_of_targets = this.RULE("number_of_targets", () => {
        this.CONSUME(TOKENS.op_count)
        this.SUBRULE(this.any_spec)
    })

    is = this.RULE("is", () => {
        this.CONSUME(TOKENS.op_equal_to)
    })

    // ===== CONDITION STATEMENTS =====

    condition_stmt = this.RULE("condition_stmt", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.if_condition) },
            { ALT: () => this.SUBRULE(this.unless_condition) }
        ])
    })

    if_condition = this.RULE("if_condition", () => {
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.keyword_if) },
            { ALT: () => this.CONSUME(TOKENS.keyword_before) },
            { ALT: () => this.CONSUME(TOKENS.keyword_after) },
            { ALT: () => this.CONSUME(TOKENS.prep_on) }
        ])
        this.SUBRULE(this.condition_phrase_list)
    })

    unless_condition = this.RULE("unless_condition", () => {
        this.CONSUME(TOKENS.keyword_unless)
        this.SUBRULE(this.condition_phrase_list)
    })

    condition_phrase_list = this.RULE("condition_phrase_list", () => {
        this.SUBRULE(this.condition_phrase)
        this.MANY(() => {
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.op_and) },
                { ALT: () => this.CONSUME(TOKENS.op_or) }
            ])
            this.SUBRULE1(this.condition_phrase)
        })
    })

    condition_phrase = this.RULE("condition_phrase", () => {
        this.OR([
            { 
                GATE : this.BACKTRACK(this.generic_condition_phrase),
                ALT: () => this.SUBRULE(this.generic_condition_phrase) 
            },
            { 
                GATE : this.BACKTRACK(this.action_condition_phrase),
                ALT: () => this.SUBRULE(this.action_condition_phrase) 
            }
        ])
        this.OPTION(() => {
            this.CONSUME(TOKENS.op_and)
            this.CONSUME(TOKENS.keyword_action)
            this.CONSUME(TOKENS.keyword_was)
            this.CONSUME(TOKENS.keyword_done)
            this.CONSUME(TOKENS.prep_by)
            this.OR1([
                { 
                    GATE : this.BACKTRACK(this.player_spec),
                    ALT: () => this.SUBRULE(this.player_spec)
                },
                { 
                    GATE : this.BACKTRACK(this.card_spec),
                    ALT: () => this.SUBRULE(this.card_spec) 
                },
                { 
                    GATE : this.BACKTRACK(this.effect_spec),
                    ALT: () => this.SUBRULE(this.effect_spec) 
                }
            ])
        })
    })

    generic_condition_phrase = this.RULE("generic_condition_phrase", () => {
        this.OR([
            { ALT: () => this.SUBRULE(this.generic_condition_phrase_check_exist) },
            { 
                GATE : this.BACKTRACK(this.generic_condition_phrase_check_card_has_stat),
                ALT: () => this.SUBRULE(this.generic_condition_phrase_check_card_has_stat) 
            },
            { 
                GATE : this.BACKTRACK(this.generic_condition_phrase_check_num_compare),
                ALT: () => this.SUBRULE(this.generic_condition_phrase_check_num_compare) 
            }
        ])
    })

    generic_condition_phrase_check_exist = this.RULE("generic_condition_phrase_check_exist", () => {
        this.CONSUME(TOKENS.op_exist)
        this.SUBRULE(this.any_spec)
    })

    generic_condition_phrase_check_card_has_stat = this.RULE("generic_condition_phrase_check_card_has_stat", () => {
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.op_has)
        this.SUBRULE(this.amount_spec)
        this.CONSUME(TOKENS.ID)
    })

    generic_condition_phrase_check_num_compare = this.RULE("generic_condition_phrase_check_num_compare", () => {
        this.SUBRULE(this.num_spec)
        this.SUBRULE(this.op_compare)
        this.SUBRULE1(this.num_spec)
    })

    // ===== TARGET STATEMENTS =====

    target_stmt = this.RULE("target_stmt", () => {
        this.OR([
            {   GATE : this.BACKTRACK(this.target_card_stmt),
                ALT: () => this.SUBRULE(this.target_card_stmt) },
            {   GATE : this.BACKTRACK(this.target_effect_stmt),
                ALT: () => this.SUBRULE(this.target_effect_stmt) },
            {   GATE : this.BACKTRACK(this.target_pos_stmt),
                ALT: () => this.SUBRULE(this.target_pos_stmt) },
            {   GATE : this.BACKTRACK(this.target_zone_stmt),
                ALT: () => this.SUBRULE(this.target_zone_stmt) }
        ])
    })

    target_card_stmt = this.RULE("target_card_stmt", () => {
        this.CONSUME(TOKENS.keyword_target)
        this.SUBRULE(this.target_card_inline)
    })

    flags_spec_card = this.RULE("flags_spec_card", () => {
        this.MANY(() => {
            this.OR([
                { ALT: () => {
                    this.CONSUME(TOKENS.ID)
                    this.OPTION(() => {
                        this.SUBRULE(this.amount_spec)
                    })
                } },
                { ALT: () => {
                    this.CONSUME(TOKENS.SYMBOL_DOT)
                    this.CONSUME1(TOKENS.ID)
                }},
                { ALT: () => {
                    this.OR1([
                        { ALT: () => this.CONSUME(TOKENS.op_equal_to) },
                        { ALT: () => this.CONSUME(TOKENS.op_not_equal_to) }
                    ])
                    this.CONSUME3(TOKENS.ID)
                }}
            ])
        })
    })

    with_effect_spec = this.RULE("with_effect_spec", () => {
        this.CONSUME(TOKENS.prep_with)
        this.OR([
            { ALT: () => this.CONSUME(TOKENS.keyword_this_effect) },
            { ALT: () => this.SUBRULE(this.backref) },
            { ALT: () => this.SUBRULE(this.target_effect_inline_no_from) }
        ])
    })

    target_card_inline = this.RULE("target_card_inline", () => {
        this.OPTION(() => {
            this.SUBRULE(this.amount_spec_with_all)
        })
        this.SUBRULE(this.flags_spec_card)
        this.CONSUME(TOKENS.keyword_card)
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.backref)
        this.OPTION2(() => {
            this.SUBRULE(this.with_effect_spec)
        })
    })

    target_effect_stmt = this.RULE("target_effect_stmt", () => {
        this.CONSUME(TOKENS.keyword_target)
        this.SUBRULE(this.target_effect_inline)
    })

    target_effect_inline = this.RULE("target_effect_inline", () => {
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.PLACEMENT_LITERAL) },
                { ALT: () => this.SUBRULE(this.amount_spec_with_all) }
            ])
        })
        this.MANY(() => {
            this.CONSUME(TOKENS.ID)
        })
        this.CONSUME(TOKENS.keyword_effect)
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.card_spec)
    })

    target_effect_inline_no_from = this.RULE("target_effect_inline_no_from", () => {
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.PLACEMENT_LITERAL) },
                { ALT: () => this.SUBRULE(this.amount_spec_with_all) }
            ])
        })
        this.MANY(() => {
            this.CONSUME(TOKENS.ID)
        })
        this.CONSUME(TOKENS.keyword_effect)
    })

    target_pos_stmt = this.RULE("target_pos_stmt", () => {
        this.CONSUME(TOKENS.keyword_target)
        this.SUBRULE(this.target_pos_inline)
    })

    flags_spec_pos = this.RULE("flags_spec_pos", () => {
        this.MANY(() => {
            this.OR([
                { ALT: () => {
                    this.CONSUME(TOKENS.ID)
                    this.OPTION(() => {
                        this.SUBRULE(this.amount_spec_no_op)
                    })
                } },
                { ALT: () => {
                    this.CONSUME(TOKENS.PLACEMENT_LITERAL)
                    this.CONSUME1(TOKENS.ID)
                }},
            ])
        })
    })

    target_pos_inline = this.RULE("target_pos_inline", () => {
        this.OR([
            {   GATE : this.BACKTRACK(this.target_pos_from_zone),
                ALT: () => this.SUBRULE(this.target_pos_from_zone) },
            {   GATE : this.BACKTRACK(this.target_pos_with_directions),
                ALT: () => this.SUBRULE(this.target_pos_with_directions) },
            {   GATE : this.BACKTRACK(this.target_pos_around_card),
                ALT: () => this.SUBRULE(this.target_pos_around_card) }
        ])
    })

    target_pos_from_zone = this.RULE("target_pos_from_zone", () => {
        this.OPTION(() => {
            this.SUBRULE(this.amount_spec_with_all)
        })
        this.SUBRULE(this.flags_spec_pos)
        this.CONSUME(TOKENS.keyword_position)
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.zone_spec)
    })

    target_pos_with_directions = this.RULE("target_pos_with_directions", () => {
        this.CONSUME(TOKENS.keyword_all)
        this.SUBRULE(this.flags_spec_pos)
        this.CONSUME(TOKENS.keyword_position)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_in)
            this.CONSUME(TOKENS.keyword_direction)
            this.CONSUME(TOKENS.prep_of)
            this.SUBRULE(this.direction_arr)
        })
        this.OPTION2(() => {
            this.CONSUME(TOKENS.prep_with)
            this.OPTION3(() => {
                this.CONSUME2(TOKENS.prep_in)
            })
            this.SUBRULE(this.amount_spec)
            this.CONSUME(TOKENS.keyword_distance)
            this.CONSUME(TOKENS.prep_away)
        })
        this.CONSUME(TOKENS.prep_from)
        this.SUBRULE(this.card_spec)
    })

    direction_arr = this.RULE("direction_arr", () => {
        this.SUBRULE(this.dir_elem)
        this.MANY(() => {
            this.CONSUME(TOKENS.SYMBOL_COMMA)
            this.SUBRULE1(this.dir_elem)
    })
    })

    dir_elem = this.RULE("dir_elem", () => {
        this.CONSUME(TOKENS.SYMBOL_LSB)
        this.CONSUME(TOKENS.ID) // specific direction, classify later
        this.MANY(() => {
            this.CONSUME(TOKENS.SYMBOL_COMMA)
            this.CONSUME1(TOKENS.ID)
    })
        this.CONSUME(TOKENS.SYMBOL_RSB)
    })

    target_pos_around_card = this.RULE("target_pos_around_card", () => {
        this.CONSUME(TOKENS.keyword_position)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_to)
        })
        this.CONSUME(TOKENS.ID)
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE(this.card_spec)
    })

    target_zone_stmt = this.RULE("target_zone_stmt", () => {
        this.CONSUME(TOKENS.keyword_target)
        this.SUBRULE(this.target_zone_inline)
    })

    target_zone_inline = this.RULE("target_zone_inline", () => {
        this.OPTION(() => {
            this.SUBRULE(this.player_spec) // player_specifier
        })
        this.CONSUME(TOKENS.ID) //zone name
    })

    // ===== ACTION STATEMENTS AND INTERCEPT =====

    // ===== ACTION CONDITION PHRASE SUBRULES =====
    
    action_condition_player_action = this.RULE("action_condition_player_action", () => {
        this.SUBRULE(this.player_spec)
        this.OPTION(() => { this.CONSUME(TOKENS.keyword_turn) })
        this.CONSUME(TOKENS.keyword_action)
    })

    action_condition_any_action = this.RULE("action_condition_any_action", () => {
        this.CONSUME(TOKENS.keyword_any)
        this.CONSUME(TOKENS.keyword_action)
    })

    action_condition_turn_start = this.RULE("action_condition_turn_start", () => {
        this.CONSUME(TOKENS.keyword_turn)
        this.CONSUME(TOKENS.keyword_start)
    })

    action_condition_turn_end = this.RULE("action_condition_turn_end", () => {
        this.CONSUME(TOKENS.keyword_turn)
        this.CONSUME(TOKENS.keyword_end)
    })

    action_condition_destroy_is = this.RULE("action_condition_destroy_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_destroy)
    })

    action_condition_void_is = this.RULE("action_condition_void_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_void)
    })

    action_condition_execute_is = this.RULE("action_condition_execute_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_execute)
    })

    action_condition_decompile_is = this.RULE("action_condition_decompile_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_decompile)
    })

    action_condition_delay_is = this.RULE("action_condition_delay_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_delay)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_by)
            this.SUBRULE(this.num_spec)
            this.CONSUME(TOKENS.keyword_turn)
    })
    })

    action_condition_take_damage = this.RULE("action_condition_take_damage", () => {
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.keyword_take)
        this.OPTION(() => { this.SUBRULE(this.num_spec) })
        this.OPTION1(() => { this.CONSUME(TOKENS.ID) }) // DAMAGE_TYPE
        this.CONSUME(TOKENS.keyword_damage)
    })

    action_condition_activate_effect = this.RULE("action_condition_activate_effect", () => {
        this.SUBRULE(this.effect_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_activate)
    })

    action_condition_any_effect_activate = this.RULE("action_condition_any_effect_activate", () => {
        this.CONSUME(TOKENS.keyword_any)
        this.CONSUME(TOKENS.keyword_effect)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_activate)
    })

    action_condition_move_is = this.RULE("action_condition_move_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_move)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_to)
            this.SUBRULE(this.zone_or_pos_spec)
    })
    })

    action_condition_remove_is = this.RULE("action_condition_remove_is", () => {
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_remove)
        this.CONSUME(TOKENS.prep_from)
        this.SUBRULE(this.zone_or_pos_spec)
    })

    action_condition_player_draw = this.RULE("action_condition_player_draw", () => {
        this.SUBRULE(this.player_spec)
        this.CONSUME(TOKENS.keyword_draw)
        this.OPTION(() => {
            this.SUBRULE(this.num_spec)
            this.CONSUME(TOKENS.keyword_card)
        })
    })

    action_condition_zone_shuffle = this.RULE("action_condition_zone_shuffle", () => {
        this.SUBRULE(this.zone_spec)
        this.OPTION(() => { this.SUBRULE(this.is) })
        this.CONSUME(TOKENS.keyword_shuffle)
    })

    action_condition_receive_stat = this.RULE("action_condition_receive_stat", () => {
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.keyword_receive)
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.SYMBOL_PLUS) }, 
                { ALT: () => this.CONSUME1(TOKENS.SYMBOL_MINUS) } 
            ])
        })
        this.SUBRULE1(this.num_spec)
        this.SUBRULE1(this.id_list_no_sep) // CARD_KEY
    })

    action_condition_override_stat = this.RULE("action_condition_override_stat", () => {
        this.SUBRULE(this.property_access_card)
        this.CONSUME(TOKENS.keyword_override)
        this.CONSUME(TOKENS.prep_to)
        this.SUBRULE2(this.num_spec)
    })

    action_condition_stat_change = this.RULE("action_condition_stat_change", () => {
        this.CONSUME(TOKENS.keyword_stat)
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE(this.card_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_change)
    })

    action_condition_receive_heal = this.RULE("action_condition_receive_heal", () => {
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.keyword_receive)
        this.CONSUME(TOKENS.keyword_heal)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_of)
            this.SUBRULE(this.num_spec)
    })
    })

    action_condition_receive_effect = this.RULE("action_condition_receive_effect", () => {
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.keyword_receive)
        this.CONSUME(TOKENS.ID) // KEYWORD_NEW
        this.CONSUME(TOKENS.keyword_effect)
    })

    action_condition_remove_effect = this.RULE("action_condition_remove_effect", () => {
        this.SUBRULE(this.effect_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_remove)
    })

    action_condition_remove_stat = this.RULE("action_condition_remove_stat", () => {
        this.SUBRULE(this.num_spec)
        this.CONSUME(TOKENS.ID) // COUNTER_KEY
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_remove)
        this.CONSUME(TOKENS.prep_from)
        this.SUBRULE(this.card_spec)
    })

    // Main action_condition_phrase rule that ORs all individual condition subrules
    action_condition_phrase = this.RULE("action_condition_phrase", () => {
        this.OR([
            { 
            GATE : this.BACKTRACK(this.action_condition_player_action),
            ALT: () => this.SUBRULE(this.action_condition_player_action)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_any_action),
            ALT: () => this.SUBRULE(this.action_condition_any_action)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_turn_start),
            ALT: () => this.SUBRULE(this.action_condition_turn_start)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_turn_end),
            ALT: () => this.SUBRULE(this.action_condition_turn_end)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_destroy_is),
            ALT: () => this.SUBRULE(this.action_condition_destroy_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_void_is),
            ALT: () => this.SUBRULE(this.action_condition_void_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_execute_is),
            ALT: () => this.SUBRULE(this.action_condition_execute_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_decompile_is),
            ALT: () => this.SUBRULE(this.action_condition_decompile_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_delay_is),
            ALT: () => this.SUBRULE(this.action_condition_delay_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_take_damage),
            ALT: () => this.SUBRULE(this.action_condition_take_damage)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_activate_effect),
            ALT: () => this.SUBRULE(this.action_condition_activate_effect)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_any_effect_activate),
            ALT: () => this.SUBRULE(this.action_condition_any_effect_activate)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_move_is),
            ALT: () => this.SUBRULE(this.action_condition_move_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_remove_is),
            ALT: () => this.SUBRULE(this.action_condition_remove_is)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_player_draw),
            ALT: () => this.SUBRULE(this.action_condition_player_draw)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_zone_shuffle),
            ALT: () => this.SUBRULE(this.action_condition_zone_shuffle)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_receive_stat),
            ALT: () => this.SUBRULE(this.action_condition_receive_stat)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_override_stat),
            ALT: () => this.SUBRULE(this.action_condition_override_stat)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_stat_change),
            ALT: () => this.SUBRULE(this.action_condition_stat_change)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_receive_heal),
            ALT: () => this.SUBRULE(this.action_condition_receive_heal)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_receive_effect),
            ALT: () => this.SUBRULE(this.action_condition_receive_effect)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_remove_effect),
            ALT: () => this.SUBRULE(this.action_condition_remove_effect)
            },
            { 
            GATE : this.BACKTRACK(this.action_condition_remove_stat),
            ALT: () => this.SUBRULE(this.action_condition_remove_stat)
            }
        ])
    })

    // ===== ACTION STATEMENT SUBRULES =====
    
    action_reprogram = this.RULE("action_reprogram", () => {
        this.CONSUME(TOKENS.keyword_reprogram)
    })

    action_lose = this.RULE("action_lose", () => {
        this.SUBRULE(this.player_spec)
        this.SUBRULE(this.is)
        this.CONSUME(TOKENS.keyword_lose)
    })

    action_negate_action = this.RULE("action_negate_action", () => {
        this.CONSUME(TOKENS.keyword_negate)
        this.CONSUME(TOKENS.keyword_action)
    })

    action_negate_with_instead = this.RULE("action_negate_with_instead", () => {
        this.AT_LEAST_ONE_SEP({
            DEF : () => this.SUBRULE(this.action_stmt_no_negate),
            SEP : TOKENS.SYMBOL_DOT
        })
        this.CONSUME1(TOKENS.prep_instead)
    })

    action_clear_all_status = this.RULE("action_clear_all_status", () => {
        this.CONSUME(TOKENS.keyword_remove)
        this.CONSUME(TOKENS.keyword_all)
        this.CONSUME(TOKENS.ID) // KEYWORD_STATUS
        this.CONSUME(TOKENS.keyword_effect)
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.card_spec)
    })

    action_remove_all_effects = this.RULE("action_remove_all_effects", () => {
        this.CONSUME(TOKENS.keyword_remove)
        this.CONSUME(TOKENS.keyword_all)
        this.CONSUME(TOKENS.keyword_effect)
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.card_spec)
    })

    action_remove_stat = this.RULE("action_remove_stat", () => {
        this.CONSUME(TOKENS.keyword_remove)
        this.SUBRULE(this.amount_spec_with_all)
        this.CONSUME(TOKENS.ID) // KEYWORD_COUNTER
        this.SUBRULE(this.from_word)
        this.SUBRULE(this.card_spec)
    })

    action_destroy = this.RULE("action_destroy", () => {
        this.CONSUME(TOKENS.keyword_destroy)
        this.SUBRULE(this.card_spec)
    })

    action_void = this.RULE("action_void", () => {
        this.CONSUME(TOKENS.keyword_void)
        this.SUBRULE(this.card_spec)
    })

    action_execute = this.RULE("action_execute", () => {
        this.CONSUME(TOKENS.keyword_execute)
        this.SUBRULE(this.card_spec)
    })

    action_decompile = this.RULE("action_decompile", () => {
        this.CONSUME(TOKENS.keyword_decompile)
        this.SUBRULE(this.card_spec)
    })

    action_delay = this.RULE("action_delay", () => {
        this.CONSUME(TOKENS.keyword_delay)
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.prep_by)
        this.SUBRULE(this.num_spec)
        this.CONSUME(TOKENS.keyword_turn)
    })

    action_disable = this.RULE("action_disable", () => {
        this.CONSUME(TOKENS.keyword_disable)
        this.SUBRULE(this.card_spec)
    })

    action_reset = this.RULE("action_reset", () => {
        this.CONSUME(TOKENS.keyword_reset)
        this.SUBRULE(this.card_spec)
    })

    action_deal_damage_card = this.RULE("action_deal_damage_card", () => {
        this.CONSUME(TOKENS.keyword_deal)
        this.SUBRULE(this.num_spec)
        this.CONSUME(TOKENS.ID) // DAMAGE_TYPE
        this.CONSUME(TOKENS.keyword_damage)
        this.CONSUME(TOKENS.prep_to)
        this.SUBRULE(this.card_spec)
    })

    action_deal_damage_ahead = this.RULE("action_deal_damage_ahead", () => {
        this.CONSUME(TOKENS.keyword_deal)
        this.SUBRULE(this.num_spec)
        this.CONSUME(TOKENS.ID) // DAMAGE_TYPE
        this.CONSUME(TOKENS.keyword_damage)
        this.CONSUME(TOKENS.keyword_ahead)
    })

    action_deal_damage_player = this.RULE("action_deal_damage_player", () => {
        this.CONSUME(TOKENS.keyword_deal)
        this.SUBRULE(this.num_spec)
        this.CONSUME(TOKENS.ID) // HEART
        this.CONSUME(TOKENS.keyword_damage)
        this.CONSUME(TOKENS.prep_to)
        this.SUBRULE(this.player_spec)
    })

    action_activate_effect = this.RULE("action_activate_effect", () => {
        this.CONSUME(TOKENS.keyword_activate)
        this.SUBRULE(this.effect_spec)
    })

    action_move = this.RULE("action_move", () => {
        this.CONSUME(TOKENS.keyword_move)
        this.SUBRULE(this.card_spec)
        this.OPTION(
            () => {
                this.SUBRULE(this.from_word)
                this.SUBRULE1(this.zone_or_pos_spec)
            }
        )
        this.OPTION1(
            () => {
                this.CONSUME(TOKENS.prep_to)
                this.SUBRULE2(this.zone_or_pos_spec)
            }
        )
    })

    action_draw = this.RULE("action_draw", () => {
        this.CONSUME(TOKENS.keyword_draw)
        this.SUBRULE(this.num_spec)
        this.OPTION(() => 
            this.CONSUME(TOKENS.keyword_card)
        )
    })

    action_draw_turn = this.RULE("action_draw_turn", () => {
        this.CONSUME(TOKENS.keyword_turn)
        this.CONSUME(TOKENS.keyword_draw)
        this.SUBRULE(this.num_spec)
        this.OPTION(() => 
            this.CONSUME(TOKENS.keyword_card)
        )
    })

    action_shuffle = this.RULE("action_shuffle", () => {
        this.CONSUME(TOKENS.keyword_shuffle)
        this.SUBRULE(this.zone_spec)
    })

    action_add_counter = this.RULE("action_add_counter", () => {
        this.CONSUME(TOKENS.keyword_add)
        this.OPTION(() => {
            this.OR([
                { ALT: () => this.CONSUME(TOKENS.SYMBOL_PLUS) }, 
                { ALT: () => this.CONSUME1(TOKENS.SYMBOL_MINUS) }
            ])
    })
        this.SUBRULE(this.num_spec)
        this.SUBRULE1(this.id_list_no_sep) // CARD_KEY
        this.CONSUME4(TOKENS.prep_to)
        this.SUBRULE2(this.card_spec)
    })

    action_override = this.RULE("action_override", () => {
        this.CONSUME(TOKENS.keyword_override)
        this.SUBRULE(this.id_list_no_sep) // CARD_KEY
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE1(this.card_spec)
        this.CONSUME(TOKENS.prep_to)
        this.SUBRULE2(this.num_spec)
    })

    action_heal = this.RULE("action_heal", () => {
        this.CONSUME(TOKENS.keyword_heal)
        this.SUBRULE(this.card_spec)
        this.CONSUME(TOKENS.prep_by)
        this.SUBRULE(this.num_spec)
    })

    action_add_effect = this.RULE("action_add_effect", () => {
        this.CONSUME(TOKENS.keyword_add)
        this.SUBRULE(this.effect_id)
        this.CONSUME(TOKENS.prep_to)
        this.SUBRULE(this.card_spec)
        this.OPTION(() => {
            this.OPTION1(() => {
                this.CONSUME(TOKENS.keyword_override)
            })
            this.CONSUME2(TOKENS.prep_with)
            this.OPTION2(() => {
                this.CONSUME2(TOKENS.ID) // KEYWORD_TYPE
                this.CONSUME3(TOKENS.ID) // EFFECT_TYPE
            })
            this.OPTION3(() => {
                this.CONSUME4(TOKENS.keyword_subtype)
                this.SUBRULE2(this.id_list)
            })
        })
    })

    action_duplicate_effect = this.RULE("action_duplicate_effect", () => {
        this.CONSUME(TOKENS.keyword_duplicate)
        this.SUBRULE(this.effect_spec)
        this.OPTION(() => {
            this.CONSUME(TOKENS.prep_to)
            this.SUBRULE(this.card_spec)
            this.OPTION1(() => {
                this.OPTION2(() => {
                    this.CONSUME(TOKENS.keyword_override)
    })
                this.CONSUME2(TOKENS.prep_with)
                this.OPTION3(() => {
                    this.CONSUME2(TOKENS.ID) // KEYWORD_TYPE
                    this.CONSUME3(TOKENS.ID) // EFFECT_TYPE
                })
                this.OPTION4(() => {
                    this.CONSUME3(TOKENS.keyword_subtype)
                    this.SUBRULE2(this.id_list)
                })
            })
        })
    })

    action_remove_effect = this.RULE("action_remove_effect", () => {
        this.CONSUME(TOKENS.keyword_remove)
        this.SUBRULE(this.effect_spec)
    })

    action_duplicate_card = this.RULE("action_duplicate_card", () => {
        this.CONSUME(TOKENS.keyword_duplicate)
        this.SUBRULE(this.card_spec)
        this.OPTION(() => {
            this.CONSUME(TOKENS.SYMBOL_LB)
            this.SUBRULE(this.id_list)
            this.CONSUME(TOKENS.SYMBOL_RB)
    })
        this.CONSUME3(TOKENS.prep_to)
        this.SUBRULE(this.zone_or_pos_spec)
        this.OPTION1(() => {
            this.CONSUME4(TOKENS.prep_with)
            this.SUBRULE4(this.num_spec)
            this.SUBRULE5(this.id_list_no_sep) // CARD_KEY
            this.MANY(() => {
                this.CONSUME5(TOKENS.SYMBOL_COMMA)
                this.SUBRULE6(this.num_spec)
                this.SUBRULE7(this.id_list_no_sep) // CARD_KEY
            })
        })
    })

    action_reset_once = this.RULE("action_reset_once", () => {
        this.CONSUME(TOKENS.keyword_reset)
        this.CONSUME(TOKENS.ID) // KEYWORD_EFFECT_TYPE_ONCE
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE(this.effect_spec)
    })

    action_reset_all_once = this.RULE("action_reset_all_once", () => {
        this.CONSUME(TOKENS.keyword_reset)
        this.CONSUME(TOKENS.keyword_all)
        this.CONSUME(TOKENS.ID) // KEYWORD_EFFECT_TYPE_ONCE
        this.CONSUME(TOKENS.prep_of)
        this.SUBRULE(this.card_spec)
    })

    // Main action_stmt rule that ORs all individual action subrules
    action_stmt = this.RULE("action_stmt", () => {
        this.OR([
            { GATE: this.BACKTRACK(this.action_negate_with_instead), ALT: () => this.SUBRULE(this.action_negate_with_instead) },
            { GATE: this.BACKTRACK(this.action_stmt_no_negate), ALT: () => this.SUBRULE(this.action_stmt_no_negate) },
        ])
    })

    // The same thing as above, just without a_negate_with_instead, since thats errors
    action_stmt_no_negate = this.RULE("action_stmt_no_negate", () => {
        this.OR([
            { GATE: this.BACKTRACK(this.action_reprogram), ALT: () => this.SUBRULE(this.action_reprogram) },
            { GATE: this.BACKTRACK(this.action_lose), ALT: () => this.SUBRULE(this.action_lose) },
            { GATE: this.BACKTRACK(this.action_negate_action), ALT: () => this.SUBRULE(this.action_negate_action) },
            { GATE: this.BACKTRACK(this.action_clear_all_status), ALT: () => this.SUBRULE(this.action_clear_all_status) },
            { GATE: this.BACKTRACK(this.action_remove_all_effects), ALT: () => this.SUBRULE(this.action_remove_all_effects) },
            { GATE: this.BACKTRACK(this.action_remove_stat), ALT: () => this.SUBRULE(this.action_remove_stat) },
            { GATE: this.BACKTRACK(this.action_destroy), ALT: () => this.SUBRULE(this.action_destroy) },
            { GATE: this.BACKTRACK(this.action_void), ALT: () => this.SUBRULE(this.action_void) },
            { GATE: this.BACKTRACK(this.action_execute), ALT: () => this.SUBRULE(this.action_execute) },
            { GATE: this.BACKTRACK(this.action_decompile), ALT: () => this.SUBRULE(this.action_decompile) },
            { GATE: this.BACKTRACK(this.action_delay), ALT: () => this.SUBRULE(this.action_delay) },
            { GATE: this.BACKTRACK(this.action_disable), ALT: () => this.SUBRULE(this.action_disable) },
            { GATE: this.BACKTRACK(this.action_reset), ALT: () => this.SUBRULE(this.action_reset) },
            { GATE: this.BACKTRACK(this.action_deal_damage_card), ALT: () => this.SUBRULE(this.action_deal_damage_card) },
            { GATE: this.BACKTRACK(this.action_deal_damage_ahead), ALT: () => this.SUBRULE(this.action_deal_damage_ahead) },
            { GATE: this.BACKTRACK(this.action_deal_damage_player), ALT: () => this.SUBRULE(this.action_deal_damage_player) },
            { GATE: this.BACKTRACK(this.action_activate_effect), ALT: () => this.SUBRULE(this.action_activate_effect) },
            { GATE: this.BACKTRACK(this.action_move), ALT: () => this.SUBRULE(this.action_move) },
            { GATE: this.BACKTRACK(this.action_draw), ALT: () => this.SUBRULE(this.action_draw) },
            { GATE: this.BACKTRACK(this.action_draw_turn), ALT: () => this.SUBRULE(this.action_draw_turn) },
            { GATE: this.BACKTRACK(this.action_shuffle), ALT: () => this.SUBRULE(this.action_shuffle) },
            { GATE: this.BACKTRACK(this.action_add_counter), ALT: () => this.SUBRULE(this.action_add_counter) },
            { GATE: this.BACKTRACK(this.action_override), ALT: () => this.SUBRULE(this.action_override) },
            { GATE: this.BACKTRACK(this.action_heal), ALT: () => this.SUBRULE(this.action_heal) },
            { GATE: this.BACKTRACK(this.action_add_effect), ALT: () => this.SUBRULE(this.action_add_effect) },
            { GATE: this.BACKTRACK(this.action_duplicate_effect), ALT: () => this.SUBRULE(this.action_duplicate_effect) },
            { GATE: this.BACKTRACK(this.action_remove_effect), ALT: () => this.SUBRULE(this.action_remove_effect) },
            { GATE: this.BACKTRACK(this.action_duplicate_card), ALT: () => this.SUBRULE(this.action_duplicate_card) },
            { GATE: this.BACKTRACK(this.action_reset_once), ALT: () => this.SUBRULE(this.action_reset_once) },
            { GATE: this.BACKTRACK(this.action_reset_all_once), ALT: () => this.SUBRULE(this.action_reset_all_once) }
        ])
    })
}

//singleton wrapper
export const qpRemakeParser = new qpRemakeParserClass()
export type qpRemakeParser = qpRemakeParserClass