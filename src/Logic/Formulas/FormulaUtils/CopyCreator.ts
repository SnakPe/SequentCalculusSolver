/**
 * Creates a copy of a formula. I don't think that I ever use this
 * 
 */
class CopyCreator implements FormulaVisitor<Formula>{
	visitImplication = (formula: Implication): Formula => new Implication(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this))
	visitConjunction = (formula: Conjunction): Formula => new Conjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this))
	visitDisjunction = (formula: Disjunction): Formula => new Disjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this))
	visitNegation = (formula: Negation): Formula => new Negation(formula.formula.acceptVisitor(this))
	identity = (formula: Formula) => formula
	visitVariable = this.identity
	visitTruth = this.identity
	visitFalsity = this.identity
	
}