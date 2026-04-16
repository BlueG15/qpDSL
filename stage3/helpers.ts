
import { data as data_untyped } from "./untyped_sequences"
import { data as data_typed } from "./typed_sequences"
import { KeywordCategory } from "./keyword_categories"
import { CONFIG } from "../core"
import { isCategory } from "./classifyKeyword"

export class Match {
    constructor(
        public matched_action : ReadonlyArray<keyof typeof data_typed>,
        public classification_result : {
            tokenIndices : number[][],
            path :(string | string[])[]
        },
        public anchor_positions : number[] = [],
    ){}

    get is_full_match(){
        return this.classification_result.path.length === this.anchor_positions.length
    }

    toString(){
        return this.classification_result.path.map(r => Array.isArray(r) ? `[${r.join(" ")}]` : r).join(" ")
    }
}

export function isKeywordCategory(x : any) : x is KeywordCategory {
    return typeof x === "string" && Object.hasOwn(KeywordCategory, x)
}

export class PartialMatch {
    constructor(
        public action_name : ReadonlyArray<string>,
        public matched_anchors : ReadonlyArray<string>,
        public failed_anchor : string,
    ){}

    get score(){
        return this.matched_anchors.length
    }
}

function match(
    input_sequence : ReadonlyArray<string>, 
    expected_sequence : ReadonlyArray<string>, 
    action_name : ReadonlyArray<keyof typeof data_typed>,
    original_sequence : ReadonlyArray<string>,
    early_stop_anchor_count = 0, //returns early if matched anchors strictly below this count
){
    if(CONFIG.VERBOSE) console.log(`Attempting to match input sequence "${input_sequence.join(" ")}" with expected sequence "${expected_sequence.join(" ")}" for action(s) ${action_name.join(", ")}`);
    const anchors = expected_sequence.filter(t => t !== "Obj")

    if(!anchors.length){
        if(CONFIG.VERBOSE) console.warn(`Action ${action_name} with pattern ${expected_sequence.join(", ")} has no anchors, skipping.`);
        return [];
    };

    const potentialMatchesForAnchors : number[][] = []
    let i = 0

    // Collect potential matches for each anchor, including flexible classifications
   for(const anchor of anchors){
        const matches: number[] = []
        for(let j = 0; j < input_sequence.length; j++) {
            // Try exact token type match
            if(input_sequence[j] === anchor) {
                matches.push(j)
            }
            // Try flexible keyword classification: check if token image can be this keyword category
            else if(isKeywordCategory(anchor) && isCategory(original_sequence[j], anchor)){
                matches.push(j)
            }
        }
        if(matches.length === 0){
            //early stop: first anchor that has no matches
            return new PartialMatch(action_name, anchors.slice(0, i), anchor)
        }
        potentialMatchesForAnchors[i] = matches
        i++;
    }

    if(anchors.length < early_stop_anchor_count){
        return []
    }

    const validPaths : number[][] = []
    const path : number[] = []

    // Optimize: avoid array spreading by using push/pop
    function travel(anchor_index : number){
        if(anchor_index >= potentialMatchesForAnchors.length){
            if(path.length) validPaths.push([...path]);
            return;
        }

        const current_anchor_indices = potentialMatchesForAnchors[anchor_index]
        const max_index_in_path = path.length > 0 ? path[path.length - 1] : -1

        for(const index of current_anchor_indices){
            if(index <= max_index_in_path) continue;
            path.push(index)
            travel(anchor_index + 1)
            path.pop()
        }
    }

    travel(0)

    // Optimize: reconstruct matches more efficiently
    return validPaths.map(anchorPath => {
        const segmentedPath: (string | string[])[] = []
        const tokenIndices: number[][] = []
        let prevIdx = -1

        for(const anchorIdx of anchorPath) {
            // Add segment before anchor if any
            if(prevIdx + 1 < anchorIdx) {
                const segment: string[] = []
                const indices: number[] = []
                for(let i = prevIdx + 1; i < anchorIdx; i++) {
                    segment.push(input_sequence[i] as string)
                    indices.push(i)
                }
                // Reject match if there are unexpected tokens between anchors
                // if that segment is NOT an Obj
                if(segment.length > 0 && expected_sequence[segmentedPath.length] !== "Obj") {
                    return null
                }
                segmentedPath.push(segment)
                tokenIndices.push(indices)
            }
            // Add anchor
            segmentedPath.push(input_sequence[anchorIdx] as string)
            tokenIndices.push([anchorIdx])
            prevIdx = anchorIdx
        }

        // Allow remaining segment at the end
        if(prevIdx + 1 < input_sequence.length) {
            const segment: string[] = []
            const indices: number[] = []
            for(let i = prevIdx + 1; i < input_sequence.length; i++) {
                segment.push(input_sequence[i] as string)
                indices.push(i)
            }
            segmentedPath.push(segment)
            tokenIndices.push(indices)
        }

        return new Match(action_name, {
            tokenIndices,
            path : segmentedPath,
        }, anchorPath)
    }).filter((m): m is Match => m !== null) as Match[]
}

export function lookup(
    sequence : string[], 
    sequence_type : keyof typeof data_untyped | Record<string, {seq : string[], action_names : (keyof typeof data_typed)[]}>, 
    original_sequence : string[] = sequence, //optional, used for looking up flexible classification (keywords categories)
    heuristiic_filter_range = 4, //numbers even below best_anchor_count is considered equal to the best if it's within this range, to allow more matches to be considered for the next stage. Set to 0 to disable
){
    const seen = new Set<string>()
    let best_matches : Match[] = []
    let best_anchor_count = 0

    // For error reporting: track patterns that got furthest before failing
    let best_failed_patterns : PartialMatch[] = []
    let best_failed_anchor_count = 0

    const Seg = typeof sequence_type === "string" ? data_untyped[sequence_type] : sequence_type
    
    for(const key in Seg){
        const obj = Seg[key as keyof typeof Seg] as {seq : string[], action_names : (keyof typeof data_typed)[]} 
        const s = obj.seq as ReadonlyArray<string>
        const matches = match(sequence, s, obj.action_names, original_sequence, best_anchor_count - heuristiic_filter_range)

        if(matches instanceof PartialMatch){
            if(matches.score > best_failed_anchor_count){
                best_failed_patterns = [matches]
                best_failed_anchor_count = matches.score
            } else if(matches.score === best_failed_anchor_count){
                best_failed_patterns.push(matches)
            }
            continue;
        }

        if(CONFIG.VERBOSE) {
            console.log(`Matches for pattern ${s.join(", ")}:`)
            console.log(`Found ${matches.length} matches for action(s) ${obj.action_names.join(", ")} wih anchor lengths : ${matches.map(m => m.anchor_positions.length).join(", ")}`)
        }

        for(const m of matches){
            const matchStr = m.toString()
            if(seen.has(matchStr)) continue
            seen.add(matchStr)
            
            const anchorCount = m.anchor_positions.length
            if(anchorCount > best_anchor_count && (anchorCount - best_anchor_count) > heuristiic_filter_range){
                best_matches = [m]
                best_anchor_count = anchorCount
            } else if(anchorCount >= best_anchor_count - heuristiic_filter_range){
                best_matches.push(m)
            }
        }
    }

    return [best_matches, best_failed_patterns] as const
}