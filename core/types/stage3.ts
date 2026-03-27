
//===== AST =====
import { Target } from "./stage1";
import { SentenceSegment } from "./stage2";
import { TargetType } from "./generic";

export class ExpectedTarget extends Target {
    constructor(
        raw : string,
        public expectedType : TargetType,
    ){
        super(raw);
    }
}

export class ActionSegment extends SentenceSegment {
    constructor(
        segment : SentenceSegment,
        public possibleClassificationPaths : {
            action_name : string,
            targets : ExpectedTarget[]
        }[],
        public isInstead : boolean
    ){
        super(segment.raw)
    }
}

export class TargetSegment extends SentenceSegment {
    targets = [new ExpectedTarget(this.raw, TargetType.Any)]
    constructor(
        segment : SentenceSegment,
    ){
        super(segment.raw)
    }
}

export class ConditionSegment extends SentenceSegment {
    constructor(
        segment : SentenceSegment,
        public possibleClassificationPaths : {
            action_name : string,
            targets : ExpectedTarget[]
        }[],
    ){
        super(segment.raw)
    }
}



