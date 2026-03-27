export interface ASTNode {
    readonly raw : string,
}

export const enum TargetType {
    Number,
    Keyword,
    
    Card,
    Effect,
    Position,
    Zone,
    Player,

    Any,
}

export const enum SentenceType {
    Condition,
    Target,
    Action,
    DeclareRuntimeVar,
}

export const enum ConditionType {
    If,
    Else, 
    Unless,
}

export const enum BinOpType {
    And,
    Or,
}

export const enum VariableType {
    Internal,
    Runtime
}

export const enum AmountModifier {
    MORE,
    LESS,
    LEQ,
    GEQ,
    EQ,
    NEQ
}

export const enum Direction {
    up,
    down,
    left,
    right,
}