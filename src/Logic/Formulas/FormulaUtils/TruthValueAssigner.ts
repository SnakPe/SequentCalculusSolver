/**
 * For some {@link assignments}, gets the truth value of a formula resulting from them 
 */
class TruthValueAssigner implements FormulaVisitor<boolean>{
  constructor(public assignments : Map<VariableText,boolean>){
  }
  
  visitImplication(formula: Implication): boolean {
    return !formula.left.acceptVisitor(this) || formula.right.acceptVisitor(this)
  }
  visitConjunction(formula: Conjunction): boolean {
    return formula.left.acceptVisitor(this) && formula.right.acceptVisitor(this)
  }
  visitDisjunction(formula: Disjunction): boolean {
    return formula.left.acceptVisitor(this) || formula.right.acceptVisitor(this)
  }
  visitNegation(formula: Negation): boolean {
    return !formula.formula.acceptVisitor(this)
  }
  visitVariable(formula: Variable): boolean {
    let value = this.assignments.get(formula.name)
    if(value === undefined) throw new Error("Found variable " + formula.name +" that has no assignment")
    return value 
  }
  visitTruth = (formula: Truth): boolean => true
  visitFalsity = (formula: Falsity): boolean => false
}