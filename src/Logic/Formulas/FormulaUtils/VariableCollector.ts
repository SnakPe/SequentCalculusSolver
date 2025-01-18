
/**
 * Returns a set of all variables in a formula
 */
class VariableCollector implements FormulaVisitor<Set<Variable>>{
  private visitBinary(formula : Implication | Conjunction | Disjunction): Set<Variable>{
    const left = formula.left.acceptVisitor(this)
    const right = formula.right.acceptVisitor(this)
    for(const variable of right.values())left.add(variable)
    return left
  }
  visitImplication = this.visitBinary
  visitConjunction = this.visitBinary
  visitDisjunction = this.visitBinary
  visitNegation(formula: Negation): Set<Variable> {
    return formula.formula.acceptVisitor(this)
  }
  visitVariable = (formula : Variable) => new Set([formula])
  empty = (formula : Formula) => new Set<Variable>([])
  visitTruth = this.empty
  visitFalsity = this.empty
}