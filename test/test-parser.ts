import { qpRemakeParser } from "../Parser";
import { qpRemakeLexer } from "../Lexer";

console.log("=".repeat(10));
console.log("Testing Parser:");

type ParserRuleStr = keyof {
    [K in keyof qpRemakeParser]: qpRemakeParser[K] extends () => any ? K : never
}

let testIdx = 0;
let passCount = 0;

function testParser(input: string, ruleName: ParserRuleStr, shouldPass: boolean) {
    testIdx++;
    qpRemakeParser.input = qpRemakeLexer.tokenize(input).tokens;
    qpRemakeParser.errors = [];
    const cst = (qpRemakeParser as any)[ruleName]();
    const passed = (qpRemakeParser.errors.length === 0) === shouldPass;
    
    if (!passed) {
        const status = shouldPass ? "should have passed" : "should have failed";
        console.error(`Test ${testIdx} FAILED: "${input}" (rule: ${ruleName}) ${status}`);
    } else {
        passCount++;
    }
}

// ===== EFFECT_META_DATA TESTS =====
testParser("init.trigger.passive", "effect_meta_data", true);
testParser("active.once", "effect_meta_data", true);
testParser("test", "effect_meta_data", true);
testParser("init.trigger.passive.counter=1->2", "effect_meta_data", true);
testParser("type.counter=5", "effect_meta_data", true);
testParser("counter=1", "effect_meta_data", true);

// ===== EFFECT_DECL TESTS =====
testParser("e_test.basic: draw 2 cards", "effect_decl", true);
testParser("e_multi.test: draw 2 cards. negate action", "effect_decl", true);

// ===== ID_LIST TESTS =====
testParser("single", "id_list", true);
testParser("a, b, c", "id_list", true);

// ===== ID_LIST_NO_SEP TESTS =====
testParser("a b c d", "id_list_no_sep", true);
testParser("x y z", "id_list_no_sep", true);

// ===== AMOUNT_SPEC TESTS =====
testParser("5", "amount_spec", true);
testParser("0", "amount_spec", true);
testParser("is 3", "amount_spec", true);
testParser("not 2", "amount_spec", true);

// ===== FROM_WORD TESTS =====
testParser("from", "from_word", true);
testParser("on", "from_word", true);
testParser("in", "from_word", true);
testParser("within", "from_word", true);

// ===== OP_COMPARE TESTS =====
testParser("is", "op_compare", true);
testParser("not", "op_compare", true);
testParser("no more than", "op_compare", true);
testParser("less than", "op_compare", true);

// ===== SIMPLE ACTION TESTS =====
testParser("reprogram", "action_stmt", true);
testParser("negate action", "action_stmt", true);
testParser("draw 3 cards", "action_stmt", true);
testParser("draw 1 card", "action_stmt", true);

// ===== INVALID TESTS (should fail) =====
testParser("invalid_rule_name", "effect_meta_data", false);
testParser("", "effect_meta_data", false);
testParser("this card has 3 counters", "effect_meta_data", false);

console.log(`\nPassed ${passCount} out of ${testIdx} tests! (${((passCount/testIdx)*100).toFixed(2)}%)`);
console.log("=".repeat(10));

