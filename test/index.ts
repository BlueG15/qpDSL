import { test } from "./cli";

import { parse } from "../index"
import { CONFIG } from "../core";
import { TargetType } from "../core/types";

import { data as data_typed } from "../stage3/typed_sequences"
import { data as data_untyped } from "../stage3/untyped_sequences"

import { KeywordCategory } from "../stage3/keyword_categories";

let SEED = 42
function PRNG(){
    const x = Math.sin(SEED) * 123456
    SEED = x - Math.floor(x)
    return SEED
}

function rng(max : number, min : number, round : boolean = false) : number {
    const r = PRNG() * (max - min) + min
    return round ? Math.round(r) : r
}

function choose<T>(arr : T[]) : T {
    return arr[rng(arr.length - 1, 0, true)]
}

const STAT = {
    num_sentence : {
        Target : 0,
        If : 0,
        Unless : 0,
        Action : 0,
    } as Record<string, number>,
    num_targets : {
        Number : 0,
        Keyword : 1,
        Card : 2,
        Effect : 3,
        Position : 4,
        Zone : 5,
        Player : 6,
        Any : 7
    } as Record<string, number>
}

function clearStat(){
    for(const k in STAT.num_sentence){
        STAT.num_sentence[k] = 0
    }
    for(const k in STAT.num_targets){
        STAT.num_targets[k] = 0
    }
}

clearStat()

function generate_random_targets(
    type : TargetType,
    available_variables : string[],
    where_definitions : string[],
) : string {
    STAT.num_targets[TargetType[type]] += 1
    switch(type){
        case TargetType.Number:
            const n = rng(100, 1, true).toString()
            switch(choose([0, 1, 2])){
                case 0:
                    //number literal
                    return n
                case 1:
                    //variable reference (old)
                    if(available_variables.length === 0) return n
                    return `{` + choose(available_variables) + `}`
                case 2:
                    //variable reference (create new)
                    const newVar = `var${available_variables.length + 1}`
                    available_variables.push(newVar)
                    let where_def = ""
                    if(choose([true, false])){
                        where_def = `where ${newVar} is ${n}`
                    }
                    else where_def = `where ${newVar} is count of ${generate_random_targets(TargetType.Any, available_variables, where_definitions)}`
                    where_definitions.push(where_def)
                    return `{${newVar}}`
            }
        case TargetType.Keyword:
            return choose(CONFIG.CARD_RARITIES)
        case TargetType.Card: {
            if(rng(1, 0) < 0.2 && STAT.num_targets.Card > 2){
                return "that card"
            }

            const rarity = choose(CONFIG.CARD_RARITIES)
            const amount = rng(5, 1, true)
            let str = `${amount} ${rarity} card`
            if(rng(1, 0) > 0.5) {
                //add on Zone
                str += ` on ${
                    generate_random_targets(TargetType.Zone, available_variables, where_definitions)
                }`
            }
            return str
        }
        case TargetType.Effect: {
            if(rng(1, 0) < 0.2 && STAT.num_targets.Effect > 2){
                return "that effect"
            }
            const amount = rng(5, 1, true)
            let type = ""
            if(rng(1, 0) > 0.5) {
                type = generate_random_keyword(KeywordCategory.EFFECT_MODIFIER)
            }
            let str = `${amount} ${type} effect`
            return str
        }
        case TargetType.Position: {
            if(rng(1, 0) < 0.2 && STAT.num_targets.Position > 2){
                return "that position"            
            }

            const amount = rng(5, 1, true)
            let str = `${amount} position`
            // if(rng(1, 0) > 0.5) {
            //     //add on Zone,)}`
            // }
            return str
        }
        case TargetType.Zone: {
            let str = choose(CONFIG.ZONE_NAMES)
            if(choose([true, false])){
                return str = generate_random_targets(TargetType.Player, available_variables, where_definitions) + " " + str
            }
            return str
        }
        case TargetType.Player: {
            return choose(["player", "enemy"])
        }
        case TargetType.Any: {
            return generate_random_targets(choose([
                TargetType.Card,
                // TargetType.Zone,
                TargetType.Effect,
                // TargetType.Position,
                // TargetType.Player,
            ]), available_variables, where_definitions)
        }
    }
}

function generate_random_keyword(category : KeywordCategory) : string {
    switch(category){
        case KeywordCategory.CARD_STAT:
            return choose(CONFIG.CARD_STATS)
        case KeywordCategory.DAMAGE_TYPE:
            return choose(["physical", "magic"])
        case KeywordCategory.EFFECT_ID:
            return "e_test"
        case KeywordCategory.EFFECT_MODIFIER:
            return choose(CONFIG.EFFECT_TYPES.concat(CONFIG.EFFECT_SUBTYPES.map(c => c.replaceAll("_", " "))))
        // case KeywordCategory.EFFECT_TYPE:
        //     return choose(CONFIG.EFFECT_TYPES)
        // case KeywordCategory.EFFECT_SUBTYPE:
        //     return choose(CONFIG.EFFECT_SUBTYPES.map(c => c.replaceAll("_", " ")))
        case KeywordCategory.EXTENSION:
            return ".fruit"
        case KeywordCategory.PLAYER_STAT:
            return "heart"
    }
}

const action_sequences_key    = Object.values(data_untyped["creation"]).flatMap(c => c.action_names)
const condition_sequences_key = Object.values(data_untyped["condition"]).flatMap(c => c.action_names)

function generate_random_sequence_single(key : string, vars : string[], where_def : string[]) : string {
    return data_typed[key as keyof typeof data_typed].map(s => {
        if(KeywordCategory[s as KeywordCategory]) {
            return generate_random_keyword(KeywordCategory[s as KeywordCategory])
        }
        if(typeof s === "number"){
            //target type
            return generate_random_targets(s as TargetType, vars, where_def)
        }
        return (s as string).split("_").at(-1)!
    }).join(" ")
}

function generate_random_sentence(vars : string[]) : string {
    const where_def : string[] = []
    
    const sentence_count = rng(3, 1, true)
    const sentence_types = new Array(sentence_count).fill(0).map((_, i) => {
        const not_last = i !== sentence_count - 1
        let available_sentence_types = [] as string[]
        if(not_last){
            available_sentence_types = ["target", "if", "unless", "action"]
        }
        else {            
            available_sentence_types = ["action"]
        }
        return choose(available_sentence_types)
    })

    return sentence_types.map(type => {
        switch(type){
            case "target":
                STAT.num_sentence.Target += 1
                return "target " + generate_random_targets(TargetType.Any, vars, where_def)
            case "action":
                STAT.num_sentence.Action += 1 
                return generate_random_sequence_single(choose(action_sequences_key), vars, where_def)
            case "if":
                STAT.num_sentence.If += 1
                STAT.num_sentence.Action += 1 // if also contains action sentence
                return `if ${generate_random_sequence_single(choose(condition_sequences_key), vars, where_def)}, ${generate_random_sequence_single(choose(action_sequences_key), vars, where_def)}`
            case "unless":
                STAT.num_sentence.If += 1
                STAT.num_sentence.Action += 1 // unless also contains action sentence
                return `unless ${generate_random_sequence_single(choose(condition_sequences_key), vars, where_def)}, ${generate_random_sequence_single(choose(action_sequences_key), vars, where_def)}`
        }
    }).concat(where_def).join(". ")
}

function generate_random_effect(){
    const eff_type = choose(CONFIG.EFFECT_TYPES)
    const num_subtype = rng(0, 2, true)
    let eff = `e_test.${eff_type}`
    for(let j = 0; j < num_subtype; j++){
        eff += `.${choose(CONFIG.EFFECT_SUBTYPES)}`
    }
    
    const num_vars = rng(3, 0, true)
    const vars : string[] = []
    for(let i = 0; i < num_vars; i++){
        const newVarName = `var${i + 1}`
        vars.push(newVarName)
        const num_values_extra = rng(2, 0, true)
        eff += `.${newVarName}=${rng(100, 1, true)}`
        if(num_values_extra > 0){
            eff += new Array(num_values_extra).fill(0).map(() => `${rng(100, 1, true)}`).join("->")
        }
    }

    eff += ": "

    eff += generate_random_sentence(vars)
    return eff
}

console.log("RUNNING BASIC TEST")

const progressBar = {
    max_squares : 100,
    max_iter : 5000,
    current: 0,
    print(){
        const percentage = this.current / this.max_iter
        const squares = Math.floor(percentage * this.max_squares)
        const emptySquares = this.max_squares - squares
        process.stdout.write(`\r[${"=".repeat(squares)}${" ".repeat(emptySquares)}] ${Math.round(percentage * 100)}%`)
    }
}

// time running basic_test 100 times
const ITER = progressBar.max_iter
CONFIG.VERBOSE = false

const FAILED : [string, string][] = []
const EFFECTS : string[] = []
const phase_times: { [phase: number]: number[] } = {}

let PRINT_SAMPLES_COUNT = 5
for(let i = 0; i < PRINT_SAMPLES_COUNT; i++){
    console.log(`\nSample test input ${i + 1}:`)
    console.log(generate_random_effect())
}
console.log("")

let fail_count = 0
let total_chars = 0
let total_sentences = 0
let total_targets = 0
let start: number

function onphase(phase : number){
    const elapsed = Date.now() - start
    if (!phase_times[phase]) {
        phase_times[phase] = []
    }
    phase_times[phase].push(elapsed)
}

let total_time = 0

for(let i = 0; i < ITER; i++){
    clearStat()
    const T = generate_random_effect()
    EFFECTS.push(T)
    total_chars += T.length
    total_sentences += Object.values(STAT.num_sentence).reduce((a, b) => a + b, 0)
    total_targets += Object.values(STAT.num_targets).reduce((a, b) => a + b, 0)

    start = Date.now()
    const E = parse(T, onphase)
    const end = Date.now()

    total_time += (end - start) // only count parse time

    if(E instanceof Error) {
        fail_count++;
        FAILED.push([T, E.toString()])
    }
    progressBar.current++;
    progressBar.print()
}
console.log() // for new line after progress bar

const avg_chars_per_effect = total_chars / ITER
const avg_sentences_per_effect = total_sentences / ITER
const avg_targets_per_effect = total_targets / ITER 

function calcAverage(arr : number[]){
    return arr.reduce((a, b) => a + b) / arr.length
}

function calcVariance(arr : number[], avg : number){
    const diff_squared = arr.map(n => {
        const d = n - avg
        return d * d
    })
    return calcAverage(diff_squared)
}

console.log(`BASIC TEST TIME: ${total_time}ms, for ${ITER} iterations`)
console.log(`Average ${(total_time / ITER).toFixed(3)}ms per iteration`)
console.log(`\nContent Metrics:`)
console.log(`  Total characters parsed: ${total_chars}`)
console.log(`  Average characters per effect: ${avg_chars_per_effect.toFixed(1)}`)
console.log(`  Average sentences per effect: ${avg_sentences_per_effect.toFixed(2)}`)
console.log(`  Average targets per effect: ${avg_targets_per_effect.toFixed(2)}`)
console.log(`  Total sentences parsed: ${total_sentences}`)
console.log(`  Total targets parsed: ${total_targets}`)
console.log(`\nThroughput:`)
console.log(`  ${(total_chars / total_time).toFixed(2)} characters/ms`)
console.log(`  ${(total_sentences / total_time).toFixed(3)} sentences/ms`)
console.log(`  ${(total_targets / total_time).toFixed(3)} targets/ms`)
console.log(`  ${(total_time / total_chars).toFixed(4)}ms per character`)
console.log(`\nPhase Metrics:`)
Object.keys(phase_times).sort((a, b) => Number(a) - Number(b)).forEach(phase => {
    const times = phase_times[Number(phase)]
    const min_time = Math.min(...times.filter(n => n > 0)) //Math.min of empty array is 0, this is fine
    const max_time = Math.max(...times)
    const avg_time = calcAverage(times)
    const variance = calcVariance(times, avg_time)
    console.log(`  Phase ${phase}: avg ${avg_time.toFixed(3)}ms, variance ${variance.toFixed(3)}ms, min (non 0) ${min_time.toFixed(3)}ms, max ${max_time.toFixed(3)}ms (${times.length} samples), `)
})
console.log(`\nResults: ${fail_count} / ${ITER} failed`)

if(FAILED.length > 0) {
    console.log(`Example failed cases:`)
    FAILED.slice(0, 10).forEach((f, i) => {
        console.log(`\n${i + 1}. ${f}`)
    })
}

console.log("BASIC TEST COMPLETE")
CONFIG.VERBOSE = true

test(parse)

