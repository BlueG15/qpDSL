import type { CstElement, CstNode, CstParser, IToken } from 'chevrotain';

export function getNodeTextDesperate(node: CstNode | CstElement, isDebug = false): string {
    if(!isDebug) console.warn("getNodeTextDesperate triggered, this SHOULD NOT HAPPEN");
    if ("tokenType" in node) {
        // It's a token
        return (node as any as IToken).image;
    }

    // It's a rule node
    const children = node.children;
    if (!children) {
        return '';
    }

    return Object.values(children)
        .flat()
        .map(c => getNodeTextDesperate(c, true))
        .map(text => text.trim())
        .join(' ');
}

export function getTokenStream(parser : {LA(n : number) : IToken}, sep = ",") : string {
    let stream = []
    let i = 1
    let nextToken = parser.LA(i);
    while(nextToken.tokenType.name !== "EOF"){
        stream.push(nextToken.image + `(${nextToken.tokenType.name})`);
        i++;
        nextToken = parser.LA(i);
    }
    return stream.join(sep);
}