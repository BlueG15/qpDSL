import { TokenType } from "chevrotain";
import { qpRemakeLexer, TOKENS } from "../Lexer";

console.log("=".repeat(10));
console.log("Testing Lexer:");

// utility functions
function getLexerResultAsIDs(program: string) {
    const lexResult = qpRemakeLexer.tokenize(program).tokens.map(token => token.tokenTypeIdx);
}

function getLexerResultAsNames(program: string) {
    const lexResult = qpRemakeLexer.tokenize(program).tokens.map(token => token.image);
}

let testIdx = 0
let passCount = 0
function test(program: string, expected: TokenType[], expectedSegmentations: string[]){
    testIdx++;

    if(expected.length !== expectedSegmentations.length){
        //bad test
        console.error(`Test ${testIdx} is invalid: expected token types and expected segmentations have different lengths`);
        return;
    }

    const lexResult = qpRemakeLexer.tokenize(program);

    if(lexResult.errors.length > 0){
        console.error(`Test ${testIdx} failed for program: "${program}"`);
        console.error("Lexer errors detected:");
        console.error(lexResult.errors);
        return;
    }

    const tokenTypes = lexResult.tokens.map(token => token.tokenType);
    const tokenImages = lexResult.tokens.map(token => token.image);
    const pass = (
        tokenTypes.length === expected.length && tokenTypes.every((t, i) => t === expected[i]) &&
        tokenImages.length === expectedSegmentations.length && tokenImages.every((img, i) => img === expectedSegmentations[i])
    )
    console.assert(
        pass, 
        [`Test ${testIdx} failed for program: "${program}"`,
         `Expected segmentations : ${expectedSegmentations.map((s, i) => `${s}(${expected[i]?.name || "unknown"})`).join(", ")}`,
         `Actual segmentations   : ${tokenImages.map((s, i) => `${s}(${tokenTypes[i].name})`).join(", ")}`,

         ""
        ].join("\n")
    )
    if(pass){
        // console.log(`Test ${testIdx} passed!`);
        passCount++;
    }
}

// test cases

/// various uses of compare operators
test(
    "1 not 2",
    [TOKENS.INT_LITERAL, TOKENS.op_not_equal_to, TOKENS.INT_LITERAL],
    ["1", "not", "2"]
);

test(
    "1 not equal to 2",
    [TOKENS.INT_LITERAL, TOKENS.op_not_equal_to, TOKENS.INT_LITERAL],
    ["1", "not equal to", "2"]
);

test(
    "1 not is 2",
    [TOKENS.INT_LITERAL, TOKENS.op_not_equal_to, TOKENS.INT_LITERAL],
    ["1", "not is", "2"]
);

test(
    "1 is not 2",
    [TOKENS.INT_LITERAL, TOKENS.op_not_equal_to, TOKENS.INT_LITERAL],
    ["1", "is not", "2"]
);

test(
    "1 would be 2",
    [TOKENS.INT_LITERAL, TOKENS.op_equal_to, TOKENS.INT_LITERAL],
    ["1", "be", "2"]
);

test(
    "1 is 2",
    [TOKENS.INT_LITERAL, TOKENS.op_equal_to, TOKENS.INT_LITERAL],
    ["1", "is", "2"]
);

test(
    "1 same as 2",
    [TOKENS.INT_LITERAL, TOKENS.op_equal_to, TOKENS.INT_LITERAL],
    ["1", "same as", "2"]
);

test(
    "1 no more than 2",
    [TOKENS.INT_LITERAL, TOKENS.op_less_than_or_equal, TOKENS.INT_LITERAL],
    ["1", "no more than", "2"]
);

/// ID and INT_LIT tokenization tests
test(
    "a_b_c abc abc123",
    [
        TOKENS.ID, TOKENS.SYMBOL_UNDER_SCORE, TOKENS.ID, TOKENS.SYMBOL_UNDER_SCORE, TOKENS.ID, //a_b_c
        TOKENS.ID, TOKENS.ID, TOKENS.INT_LITERAL
    ],
    ["a", "_", "b", "_", "c", "abc", "abc", "123"]
);

//id that just happens to share part with a keyword should STILL be an ID
test(
    "remover remove", //remover should be an ID, remove should be a keyword
    [TOKENS.ID, TOKENS.keyword_remove],
    ["remover", "remove"]
);

//disambiguation between placement literal and int literal
test(
    "1st 2nd 3rd 123rd abc1st",
    [
        TOKENS.PLACEMENT_LITERAL, TOKENS.PLACEMENT_LITERAL, TOKENS.PLACEMENT_LITERAL, TOKENS.PLACEMENT_LITERAL, TOKENS.ID, TOKENS.PLACEMENT_LITERAL
    ],
    ["1st", "2nd", "3rd", "123rd", "abc", "1st"]
);

//disambiguation of arrow, symbol_eq, and symbol minus
test(
    "= - => -> --------> ======> =-=-=-=-=->",
    [
        TOKENS.SYMBOL_EQ, 
        TOKENS.SYMBOL_MINUS,
        TOKENS.SYMBOL_ARROW, 
        TOKENS.SYMBOL_ARROW,
        TOKENS.SYMBOL_ARROW,
        TOKENS.SYMBOL_ARROW,
        TOKENS.SYMBOL_ARROW
    ],
    ["=", "-", "=>", "->", "-------->", "======>", "=-=-=-=-=->"]
);

/// comment ignorance tests
test(
    "remove 3 counters from the card // this is a comment", //the should be skipped, as well as the comment
    [TOKENS.keyword_remove, TOKENS.INT_LITERAL, TOKENS.ID, TOKENS.prep_from, TOKENS.keyword_card],
    ["remove", "3", "counters", "from", "card"]
);

test(
    "draw 1 // this is a comment\n draw 2 // this is another comment", 
    [TOKENS.keyword_draw, TOKENS.INT_LITERAL, TOKENS.keyword_draw, TOKENS.INT_LITERAL],
    ["draw", "1", "draw", "2"]
);


test(
    "would be removed /* this is a comment */", //would should be skipped, as well as the comment
    [TOKENS.op_equal_to, TOKENS.keyword_remove],
    ["be", "removed"]
);

/// filler ignorance tests
test(
    "remove 3 counters from the card", //the should be skipped
    [TOKENS.keyword_remove, TOKENS.INT_LITERAL, TOKENS.ID, TOKENS.prep_from, TOKENS.keyword_card],
    ["remove", "3", "counters", "from", "card"]
);

test(
    "would be removed", //would should be skipped
    [TOKENS.op_equal_to, TOKENS.keyword_remove],
    ["be", "removed"]
);

/// symbol tests
test(
    ". , : [ ] { }",
    [TOKENS.SYMBOL_DOT, TOKENS.SYMBOL_COMMA, TOKENS.SYMBOL_COLON, TOKENS.SYMBOL_LSB, TOKENS.SYMBOL_RSB, TOKENS.SYMBOL_LCB, TOKENS.SYMBOL_RCB],
    [".", ",", ":", "[", "]", "{", "}"]
);

/// keyword action tests
test(
    "draw destroy move remove deal",
    [TOKENS.keyword_draw, TOKENS.keyword_destroy, TOKENS.keyword_move, TOKENS.keyword_remove, TOKENS.keyword_deal],
    ["draw", "destroy", "move", "remove", "deal"]
);

test(
    "activate heal shuffle void execute",
    [TOKENS.keyword_activate, TOKENS.keyword_heal, TOKENS.keyword_shuffle, TOKENS.keyword_void, TOKENS.keyword_execute],
    ["activate", "heal", "shuffle", "void", "execute"]
);

/// keyword card/zone/position tests
test(
    "card zone position effect this card",
    [TOKENS.keyword_card, TOKENS.keyword_zone, TOKENS.keyword_position, TOKENS.keyword_effect, TOKENS.keyword_this_card],
    ["card", "zone", "position", "effect", "this card"]
);

test(
    "it them all hand",
    [TOKENS.keyword_back_reference, TOKENS.keyword_back_reference, TOKENS.keyword_all, TOKENS.ID],
    ["it", "them", "all", "hand"]
);

/// complex expression with multiple operator types
test(
    "count this card equal to 3 not equal to 0",
    [TOKENS.op_count, TOKENS.keyword_this_card, TOKENS.op_equal_to, TOKENS.INT_LITERAL, TOKENS.op_not_equal_to, TOKENS.INT_LITERAL],
    ["count", "this card", "equal to", "3", "not equal to", "0"]
);

/// variable declaration syntax
test(
    "counter = 1 -> 2",
    [TOKENS.ID, TOKENS.SYMBOL_EQ, TOKENS.INT_LITERAL, TOKENS.SYMBOL_ARROW, TOKENS.INT_LITERAL],
    ["counter", "=", "1", "->", "2"]
);

/// dotted lists
test(
    "init . trigger . passive",
    [TOKENS.ID, TOKENS.SYMBOL_DOT, TOKENS.ID, TOKENS.SYMBOL_DOT, TOKENS.ID],
    ["init", ".", "trigger", ".", "passive"]
);

console.log(`Passed ${passCount} out of ${testIdx} tests! (${((passCount/testIdx)*100).toFixed(2)}%)`);
console.log("=".repeat(10));