import { CstNode, IToken } from "chevrotain";

/**
 * Auto-generated context interfaces from parser rules
 * Generated from: Parser/index.ts
 * Generator: dev/generate-types.js (TypeScript Compiler API)
 */

export interface program extends CstNode {
    // Subrules/Context nodes
    effect_decl: effect_decl[];
}

export interface effect_decl extends CstNode {
    // Consumed tokens
    SYMBOL_DOT: [IToken];
    SYMBOL_COLON: [IToken];
    // Subrules/Context nodes
    effect_id: [effect_id];
    effect_meta_data: [effect_meta_data];
    effect_segments: [effect_segments];
}

export interface effect_segments extends CstNode {
    // Consumed tokens
    SYMBOL_DOT: [IToken];
    // Subrules/Context nodes
    target_stmt_list?: [target_stmt_list];
    action_stmt_list: [action_stmt_list];
}

export interface target_stmt_list extends CstNode {
    // Subrules/Context nodes
    target_stmt_with_cond: [target_stmt_with_cond];
}

export interface target_stmt_with_cond extends CstNode {
    // Subrules/Context nodes
    condition_stmt?: [condition_stmt];
    target_stmt: [target_stmt];
}

export interface action_stmt_list extends CstNode {
    // Subrules/Context nodes
    action_stmt_with_cond: [action_stmt_with_cond];
}

export interface action_stmt_with_cond extends CstNode {
    // Subrules/Context nodes
    condition_stmt?: [condition_stmt];
    action_stmt: [action_stmt];
}

export interface effect_id extends CstNode {
    // Consumed tokens
    ID: IToken[];
    INT_LITERAL: IToken[];
    SYMBOL_UNDER_SCORE: IToken[];
}

export interface effect_meta_data extends CstNode {
    // Consumed tokens
    ID: [IToken];
    // Subrules/Context nodes
    internal_var_decl?: [internal_var_decl];
}

export interface internal_var_decl extends CstNode {
    // Consumed tokens
    ID: [IToken];
    SYMBOL_EQ: [IToken];
    INT_LITERAL: IToken[];
    SYMBOL_ARROW: [IToken];
}

export interface id_list extends CstNode {
    // Consumed tokens
    ID: [IToken];
}

export interface id_list_no_sep extends CstNode {
    // Consumed tokens
    ID: IToken[];
}

export interface op_compare extends CstNode {
    // Consumed tokens
    op_equal_to: [IToken];
    op_not_equal_to: [IToken];
    op_less_than_or_equal: [IToken];
    op_greater_than_or_equal: [IToken];
    op_greater_than: [IToken];
    op_less_than: [IToken];
}

export interface internal_var_ref extends CstNode {
    // Consumed tokens
    SYMBOL_LCB: [IToken];
    ID: [IToken];
    SYMBOL_RCB: [IToken];
}

export interface amount_spec extends CstNode {
    // Subrules/Context nodes
    op_compare?: [op_compare];
    amount_spec_no_op: [amount_spec_no_op];
}

export interface amount_spec_no_op extends CstNode {
    // Consumed tokens
    INT_LITERAL: [IToken];
    // Subrules/Context nodes
    internal_var_ref?: [internal_var_ref];
}

export interface amount_spec_with_all extends CstNode {
    // Consumed tokens
    keyword_all: [IToken];
    // Subrules/Context nodes
    amount_spec?: [amount_spec];
}

export interface backref extends CstNode {
    // Consumed tokens
    keyword_back_reference: [IToken];
    keyword_card: [IToken];
    keyword_effect: [IToken];
    keyword_zone: [IToken];
    keyword_position: [IToken];
}

export interface from_word extends CstNode {
    // Consumed tokens
    prep_from: [IToken];
    prep_on: [IToken];
    prep_in: [IToken];
    prep_within: [IToken];
}

export interface card_spec extends CstNode {
    // Consumed tokens
    keyword_this_card: [IToken];
    // Subrules/Context nodes
    backref?: [backref];
    target_card_inline?: [target_card_inline];
}

export interface effect_spec extends CstNode {
    // Consumed tokens
    keyword_this_effect: [IToken];
    // Subrules/Context nodes
    backref?: [backref];
    target_effect_inline?: [target_effect_inline];
}

export interface pos_spec extends CstNode {
    // Subrules/Context nodes
    backref?: [backref];
    target_pos_inline?: [target_pos_inline];
}

export interface zone_spec extends CstNode {
    // Subrules/Context nodes
    backref?: [backref];
    target_zone_inline?: [target_zone_inline];
}

export interface num_spec extends CstNode {
    // Subrules/Context nodes
    amount_spec_no_op?: [amount_spec_no_op];
    property_access?: [property_access];
}

export interface player_spec extends CstNode {
    // Consumed tokens
    ID: [IToken];
    INT_LITERAL: [IToken];
    keyword_this_player: [IToken];
}

export interface property_access extends CstNode {
    // Subrules/Context nodes
    property_access_card?: [property_access_card];
    number_of_targets?: [number_of_targets];
}

export interface property_access_card extends CstNode {
    // Consumed tokens
    ID: [IToken];
    prep_of: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface any_spec extends CstNode {
    // Subrules/Context nodes
    card_spec?: [card_spec];
    effect_spec?: [effect_spec];
    pos_spec?: [pos_spec];
    zone_spec?: [zone_spec];
}

export interface zone_or_pos_spec extends CstNode {
    // Subrules/Context nodes
    pos_spec?: [pos_spec];
    zone_spec?: [zone_spec];
}

export interface number_of_targets extends CstNode {
    // Consumed tokens
    op_count: [IToken];
    // Subrules/Context nodes
    any_spec: [any_spec];
}

export interface is extends CstNode {
    // Consumed tokens
    op_equal_to: [IToken];
}

export interface condition_stmt extends CstNode {
    // Subrules/Context nodes
    if_condition?: [if_condition];
    unless_condition?: [unless_condition];
}

export interface if_condition extends CstNode {
    // Consumed tokens
    keyword_if: [IToken];
    keyword_before: [IToken];
    keyword_after: [IToken];
    prep_on: [IToken];
    // Subrules/Context nodes
    condition_phrase_list?: [condition_phrase_list];
}

export interface unless_condition extends CstNode {
    // Consumed tokens
    keyword_unless: [IToken];
    // Subrules/Context nodes
    condition_phrase_list: [condition_phrase_list];
}

export interface condition_phrase_list extends CstNode {
    // Consumed tokens
    op_and: IToken[];
    op_or: IToken[];
    // Subrules/Context nodes
    condition_phrase: condition_phrase[];
}

export interface condition_phrase extends CstNode {
    // Consumed tokens
    op_and: [IToken];
    keyword_action: [IToken];
    keyword_was: [IToken];
    keyword_done: [IToken];
    prep_by: [IToken];
    // Subrules/Context nodes
    generic_condition_phrase?: [generic_condition_phrase];
    action_condition_phrase?: [action_condition_phrase];
    player_spec?: [player_spec];
    card_spec?: [card_spec];
    effect_spec?: [effect_spec];
}

export interface generic_condition_phrase extends CstNode {
    // Subrules/Context nodes
    generic_condition_phrase_check_exist?: [generic_condition_phrase_check_exist];
    generic_condition_phrase_check_card_has_stat?: [generic_condition_phrase_check_card_has_stat];
    generic_condition_phrase_check_num_compare?: [generic_condition_phrase_check_num_compare];
}

export interface generic_condition_phrase_check_exist extends CstNode {
    // Consumed tokens
    op_exist: [IToken];
    // Subrules/Context nodes
    any_spec: [any_spec];
}

export interface generic_condition_phrase_check_card_has_stat extends CstNode {
    // Consumed tokens
    op_has: [IToken];
    ID: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    amount_spec: [amount_spec];
}

export interface generic_condition_phrase_check_num_compare extends CstNode {
    // Subrules/Context nodes
    num_spec: [num_spec];
    op_compare: [op_compare];
}

export interface target_stmt extends CstNode {
    // Subrules/Context nodes
    target_card_stmt?: [target_card_stmt];
    target_effect_stmt?: [target_effect_stmt];
    target_pos_stmt?: [target_pos_stmt];
    target_zone_stmt?: [target_zone_stmt];
}

export interface target_card_stmt extends CstNode {
    // Consumed tokens
    keyword_target: [IToken];
    // Subrules/Context nodes
    target_card_inline: [target_card_inline];
}

export interface flags_spec_card extends CstNode {
    // Consumed tokens
    ID: IToken[];
    SYMBOL_DOT: IToken[];
    op_equal_to: IToken[];
    op_not_equal_to: IToken[];
    // Subrules/Context nodes
    amount_spec?: amount_spec[];
}

export interface with_effect_spec extends CstNode {
    // Consumed tokens
    prep_with: [IToken];
    keyword_this_effect: [IToken];
    // Subrules/Context nodes
    backref?: [backref];
    target_effect_inline_no_from?: [target_effect_inline_no_from];
}

export interface target_card_inline extends CstNode {
    // Consumed tokens
    keyword_card: [IToken];
    // Subrules/Context nodes
    amount_spec_with_all?: [amount_spec_with_all];
    flags_spec_card: [flags_spec_card];
    from_word: [from_word];
    backref: [backref];
    with_effect_spec?: [with_effect_spec];
}

export interface target_effect_stmt extends CstNode {
    // Consumed tokens
    keyword_target: [IToken];
    // Subrules/Context nodes
    target_effect_inline: [target_effect_inline];
}

export interface target_effect_inline extends CstNode {
    // Consumed tokens
    PLACEMENT_LITERAL: [IToken];
    ID: IToken[];
    keyword_effect: [IToken];
    // Subrules/Context nodes
    amount_spec_with_all?: [amount_spec_with_all];
    from_word?: [from_word];
    card_spec?: [card_spec];
}

export interface target_effect_inline_no_from extends CstNode {
    // Consumed tokens
    PLACEMENT_LITERAL: [IToken];
    ID: IToken[];
    keyword_effect: [IToken];
    // Subrules/Context nodes
    amount_spec_with_all?: [amount_spec_with_all];
}

export interface target_pos_stmt extends CstNode {
    // Consumed tokens
    keyword_target: [IToken];
    // Subrules/Context nodes
    target_pos_inline: [target_pos_inline];
}

export interface flags_spec_pos extends CstNode {
    // Consumed tokens
    ID: IToken[];
    PLACEMENT_LITERAL: IToken[];
    // Subrules/Context nodes
    amount_spec_no_op?: amount_spec_no_op[];
}

export interface target_pos_inline extends CstNode {
    // Subrules/Context nodes
    target_pos_from_zone?: [target_pos_from_zone];
    target_pos_with_directions?: [target_pos_with_directions];
    target_pos_around_card?: [target_pos_around_card];
}

export interface target_pos_from_zone extends CstNode {
    // Consumed tokens
    keyword_position: [IToken];
    // Subrules/Context nodes
    amount_spec_with_all?: [amount_spec_with_all];
    flags_spec_pos: [flags_spec_pos];
    from_word: [from_word];
    zone_spec: [zone_spec];
}

export interface target_pos_with_directions extends CstNode {
    // Consumed tokens
    keyword_all: [IToken];
    keyword_position: [IToken];
    prep_in: IToken[];
    keyword_direction: [IToken];
    prep_of: [IToken];
    prep_with: [IToken];
    keyword_distance: [IToken];
    prep_away: [IToken];
    prep_from: [IToken];
    // Subrules/Context nodes
    flags_spec_pos: [flags_spec_pos];
    direction_arr?: [direction_arr];
    amount_spec?: [amount_spec];
    card_spec: [card_spec];
}

export interface direction_arr extends CstNode {
    // Consumed tokens
    SYMBOL_COMMA: IToken[];
    // Subrules/Context nodes
    dir_elem: dir_elem[];
}

export interface dir_elem extends CstNode {
    // Consumed tokens
    SYMBOL_LSB: [IToken];
    ID: IToken[];
    SYMBOL_COMMA: IToken[];
    SYMBOL_RSB: [IToken];
}

export interface target_pos_around_card extends CstNode {
    // Consumed tokens
    keyword_position: [IToken];
    prep_to: [IToken];
    ID: [IToken];
    prep_of: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface target_zone_stmt extends CstNode {
    // Consumed tokens
    keyword_target: [IToken];
    // Subrules/Context nodes
    target_zone_inline: [target_zone_inline];
}

export interface target_zone_inline extends CstNode {
    // Consumed tokens
    ID: [IToken];
    // Subrules/Context nodes
    player_spec?: [player_spec];
}

export interface action_condition_player_action extends CstNode {
    // Consumed tokens
    keyword_turn: [IToken];
    keyword_action: [IToken];
    // Subrules/Context nodes
    player_spec: [player_spec];
}

export interface action_condition_any_action extends CstNode {
    // Consumed tokens
    keyword_any: [IToken];
    keyword_action: [IToken];
}

export interface action_condition_turn_start extends CstNode {
    // Consumed tokens
    keyword_turn: [IToken];
    keyword_start: [IToken];
}

export interface action_condition_turn_end extends CstNode {
    // Consumed tokens
    keyword_turn: [IToken];
    keyword_end: [IToken];
}

export interface action_condition_destroy_is extends CstNode {
    // Consumed tokens
    keyword_destroy: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
}

export interface action_condition_void_is extends CstNode {
    // Consumed tokens
    keyword_void: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
}

export interface action_condition_execute_is extends CstNode {
    // Consumed tokens
    keyword_execute: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
}

export interface action_condition_decompile_is extends CstNode {
    // Consumed tokens
    keyword_decompile: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
}

export interface action_condition_delay_is extends CstNode {
    // Consumed tokens
    keyword_delay: [IToken];
    prep_by: [IToken];
    keyword_turn: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
    num_spec?: [num_spec];
}

export interface action_condition_take_damage extends CstNode {
    // Consumed tokens
    keyword_take: [IToken];
    ID: [IToken];
    keyword_damage: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    num_spec?: [num_spec];
}

export interface action_condition_activate_effect extends CstNode {
    // Consumed tokens
    keyword_activate: [IToken];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
    is: [is];
}

export interface action_condition_any_effect_activate extends CstNode {
    // Consumed tokens
    keyword_any: [IToken];
    keyword_effect: [IToken];
    keyword_activate: [IToken];
    // Subrules/Context nodes
    is: [is];
}

export interface action_condition_move_is extends CstNode {
    // Consumed tokens
    keyword_move: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
    zone_or_pos_spec?: [zone_or_pos_spec];
}

export interface action_condition_remove_is extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    prep_from: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
    zone_or_pos_spec: [zone_or_pos_spec];
}

export interface action_condition_player_draw extends CstNode {
    // Consumed tokens
    keyword_draw: [IToken];
    keyword_card: [IToken];
    // Subrules/Context nodes
    player_spec: [player_spec];
    num_spec?: [num_spec];
}

export interface action_condition_zone_shuffle extends CstNode {
    // Consumed tokens
    keyword_shuffle: [IToken];
    // Subrules/Context nodes
    zone_spec: [zone_spec];
    is?: [is];
}

export interface action_condition_receive_stat extends CstNode {
    // Consumed tokens
    keyword_receive: [IToken];
    SYMBOL_PLUS: [IToken];
    SYMBOL_MINUS: IToken[];
    // Subrules/Context nodes
    card_spec: [card_spec];
    num_spec?: [num_spec];
    id_list_no_sep?: [id_list_no_sep];
}

export interface action_condition_override_stat extends CstNode {
    // Consumed tokens
    keyword_override: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    property_access_card: [property_access_card];
    num_spec: [num_spec];
}

export interface action_condition_stat_change extends CstNode {
    // Consumed tokens
    keyword_stat: [IToken];
    prep_of: [IToken];
    keyword_change: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    is: [is];
}

export interface action_condition_receive_heal extends CstNode {
    // Consumed tokens
    keyword_receive: [IToken];
    keyword_heal: [IToken];
    prep_of: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    num_spec?: [num_spec];
}

export interface action_condition_receive_effect extends CstNode {
    // Consumed tokens
    keyword_receive: [IToken];
    ID: [IToken];
    keyword_effect: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_condition_remove_effect extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
    is: [is];
}

export interface action_condition_remove_stat extends CstNode {
    // Consumed tokens
    ID: [IToken];
    keyword_remove: [IToken];
    prep_from: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
    is: [is];
    card_spec: [card_spec];
}

export interface action_condition_phrase extends CstNode {
    // Subrules/Context nodes
    action_condition_player_action?: [action_condition_player_action];
    action_condition_any_action?: [action_condition_any_action];
    action_condition_turn_start?: [action_condition_turn_start];
    action_condition_turn_end?: [action_condition_turn_end];
    action_condition_destroy_is?: [action_condition_destroy_is];
    action_condition_void_is?: [action_condition_void_is];
    action_condition_execute_is?: [action_condition_execute_is];
    action_condition_decompile_is?: [action_condition_decompile_is];
    action_condition_delay_is?: [action_condition_delay_is];
    action_condition_take_damage?: [action_condition_take_damage];
    action_condition_activate_effect?: [action_condition_activate_effect];
    action_condition_any_effect_activate?: [action_condition_any_effect_activate];
    action_condition_move_is?: [action_condition_move_is];
    action_condition_remove_is?: [action_condition_remove_is];
    action_condition_player_draw?: [action_condition_player_draw];
    action_condition_zone_shuffle?: [action_condition_zone_shuffle];
    action_condition_receive_stat?: [action_condition_receive_stat];
    action_condition_override_stat?: [action_condition_override_stat];
    action_condition_stat_change?: [action_condition_stat_change];
    action_condition_receive_heal?: [action_condition_receive_heal];
    action_condition_receive_effect?: [action_condition_receive_effect];
    action_condition_remove_effect?: [action_condition_remove_effect];
    action_condition_remove_stat?: [action_condition_remove_stat];
}

export interface action_reprogram extends CstNode {
    // Consumed tokens
    keyword_reprogram: [IToken];
}

export interface action_lose extends CstNode {
    // Consumed tokens
    keyword_lose: [IToken];
    // Subrules/Context nodes
    player_spec: [player_spec];
    is: [is];
}

export interface action_negate_action extends CstNode {
    // Consumed tokens
    keyword_negate: [IToken];
    keyword_action: [IToken];
}

export interface action_negate_with_instead extends CstNode {
    // Consumed tokens
    prep_instead: [IToken];
    // Subrules/Context nodes
    action_stmt_no_negate: [action_stmt_no_negate];
}

export interface action_clear_all_status extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    keyword_all: [IToken];
    ID: [IToken];
    keyword_effect: [IToken];
    // Subrules/Context nodes
    from_word: [from_word];
    card_spec: [card_spec];
}

export interface action_remove_all_effects extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    keyword_all: [IToken];
    keyword_effect: [IToken];
    // Subrules/Context nodes
    from_word: [from_word];
    card_spec: [card_spec];
}

export interface action_remove_stat extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    ID: [IToken];
    // Subrules/Context nodes
    amount_spec_with_all: [amount_spec_with_all];
    from_word: [from_word];
    card_spec: [card_spec];
}

export interface action_destroy extends CstNode {
    // Consumed tokens
    keyword_destroy: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_void extends CstNode {
    // Consumed tokens
    keyword_void: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_execute extends CstNode {
    // Consumed tokens
    keyword_execute: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_decompile extends CstNode {
    // Consumed tokens
    keyword_decompile: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_delay extends CstNode {
    // Consumed tokens
    keyword_delay: [IToken];
    prep_by: [IToken];
    keyword_turn: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    num_spec: [num_spec];
}

export interface action_disable extends CstNode {
    // Consumed tokens
    keyword_disable: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_reset extends CstNode {
    // Consumed tokens
    keyword_reset: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_deal_damage_card extends CstNode {
    // Consumed tokens
    keyword_deal: [IToken];
    ID: [IToken];
    keyword_damage: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
    card_spec: [card_spec];
}

export interface action_deal_damage_ahead extends CstNode {
    // Consumed tokens
    keyword_deal: [IToken];
    ID: [IToken];
    keyword_damage: [IToken];
    keyword_ahead: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
}

export interface action_deal_damage_player extends CstNode {
    // Consumed tokens
    keyword_deal: [IToken];
    ID: [IToken];
    keyword_damage: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
    player_spec: [player_spec];
}

export interface action_activate_effect extends CstNode {
    // Consumed tokens
    keyword_activate: [IToken];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
}

export interface action_move extends CstNode {
    // Consumed tokens
    keyword_move: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    from_word?: [from_word];
    zone_or_pos_spec?: [zone_or_pos_spec];
}

export interface action_draw extends CstNode {
    // Consumed tokens
    keyword_draw: [IToken];
    keyword_card: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
}

export interface action_draw_turn extends CstNode {
    // Consumed tokens
    keyword_turn: [IToken];
    keyword_draw: [IToken];
    keyword_card: [IToken];
    // Subrules/Context nodes
    num_spec: [num_spec];
}

export interface action_shuffle extends CstNode {
    // Consumed tokens
    keyword_shuffle: [IToken];
    // Subrules/Context nodes
    zone_spec: [zone_spec];
}

export interface action_add_counter extends CstNode {
    // Consumed tokens
    keyword_add: [IToken];
    SYMBOL_PLUS: [IToken];
    SYMBOL_MINUS: IToken[];
    prep_to: [IToken];
    // Subrules/Context nodes
    num_spec?: [num_spec];
    id_list_no_sep?: [id_list_no_sep];
    card_spec?: [card_spec];
}

export interface action_override extends CstNode {
    // Consumed tokens
    keyword_override: [IToken];
    prep_of: [IToken];
    prep_to: [IToken];
    // Subrules/Context nodes
    id_list_no_sep: [id_list_no_sep];
    card_spec: [card_spec];
    num_spec: [num_spec];
}

export interface action_heal extends CstNode {
    // Consumed tokens
    keyword_heal: [IToken];
    prep_by: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
    num_spec: [num_spec];
}

export interface action_add_effect extends CstNode {
    // Consumed tokens
    keyword_add: [IToken];
    prep_to: [IToken];
    keyword_override: [IToken];
    prep_with: IToken[];
    ID: IToken[];
    keyword_subtype: IToken[];
    // Subrules/Context nodes
    effect_id: [effect_id];
    card_spec: [card_spec];
    id_list?: [id_list];
}

export interface action_duplicate_effect extends CstNode {
    // Consumed tokens
    keyword_duplicate: [IToken];
    prep_to: [IToken];
    keyword_override: [IToken];
    prep_with: IToken[];
    ID: IToken[];
    keyword_subtype: IToken[];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
    card_spec?: [card_spec];
    id_list?: [id_list];
}

export interface action_remove_effect extends CstNode {
    // Consumed tokens
    keyword_remove: [IToken];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
}

export interface action_duplicate_card extends CstNode {
    // Consumed tokens
    keyword_duplicate: [IToken];
    SYMBOL_LB: [IToken];
    SYMBOL_RB: [IToken];
    prep_to: [IToken];
    prep_with: IToken[];
    SYMBOL_COMMA: IToken[];
    // Subrules/Context nodes
    card_spec: [card_spec];
    id_list?: [id_list];
    zone_or_pos_spec: [zone_or_pos_spec];
    num_spec?: num_spec[];
    id_list_no_sep?: id_list_no_sep[];
}

export interface action_reset_once extends CstNode {
    // Consumed tokens
    keyword_reset: [IToken];
    ID: [IToken];
    prep_of: [IToken];
    // Subrules/Context nodes
    effect_spec: [effect_spec];
}

export interface action_reset_all_once extends CstNode {
    // Consumed tokens
    keyword_reset: [IToken];
    keyword_all: [IToken];
    ID: [IToken];
    prep_of: [IToken];
    // Subrules/Context nodes
    card_spec: [card_spec];
}

export interface action_stmt extends CstNode {
    // Subrules/Context nodes
    action_negate_with_instead?: [action_negate_with_instead];
    action_stmt_no_negate?: [action_stmt_no_negate];
}

export interface action_stmt_no_negate extends CstNode {
    // Subrules/Context nodes
    action_reprogram?: [action_reprogram];
    action_lose?: [action_lose];
    action_negate_action?: [action_negate_action];
    action_clear_all_status?: [action_clear_all_status];
    action_remove_all_effects?: [action_remove_all_effects];
    action_remove_stat?: [action_remove_stat];
    action_destroy?: [action_destroy];
    action_void?: [action_void];
    action_execute?: [action_execute];
    action_decompile?: [action_decompile];
    action_delay?: [action_delay];
    action_disable?: [action_disable];
    action_reset?: [action_reset];
    action_deal_damage_card?: [action_deal_damage_card];
    action_deal_damage_ahead?: [action_deal_damage_ahead];
    action_deal_damage_player?: [action_deal_damage_player];
    action_activate_effect?: [action_activate_effect];
    action_move?: [action_move];
    action_draw?: [action_draw];
    action_draw_turn?: [action_draw_turn];
    action_shuffle?: [action_shuffle];
    action_add_counter?: [action_add_counter];
    action_override?: [action_override];
    action_heal?: [action_heal];
    action_add_effect?: [action_add_effect];
    action_duplicate_effect?: [action_duplicate_effect];
    action_remove_effect?: [action_remove_effect];
    action_duplicate_card?: [action_duplicate_card];
    action_reset_once?: [action_reset_once];
    action_reset_all_once?: [action_reset_all_once];
}

