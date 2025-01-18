// import { Formula, Implication, Conjunction, Disjunction, Negation, Variable, Truth, Falsity } from "./Formula.js";

/**
 * Visitor to traverse a formula. Serves as pattern matching for the different types of connectives and atomic formulas.
 * 
 * Use with {@link Formula.acceptVisitor} 
 */
/* export default */ interface FormulaVisitor<T>{
  visitImplication(formula : Implication) : T 
  visitConjunction(formula : Conjunction) : T 
  visitDisjunction(formula : Disjunction) : T 
  visitNegation(formula : Negation) : T 
  visitVariable(formula : Variable) : T 
  visitTruth(formula : Truth) : T 
  visitFalsity(formula : Falsity) : T 
}