import { qpRemakeParser } from "../Parser";

export const BaseVisitor = qpRemakeParser.getBaseCstVisitorConstructor()
export const BaseVisitorWithDefault = qpRemakeParser.getBaseCstVisitorConstructorWithDefaults()