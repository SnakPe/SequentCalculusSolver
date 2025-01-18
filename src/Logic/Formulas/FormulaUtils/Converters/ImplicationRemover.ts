// import FormulaVisitor from "../FormulaVisitor.js";
// import { Formula, Implication, Conjunction, Disjunction, Negation, Variable, Falsity } from "../Formula.js";

/* export default */ class ImplicationRemover implements FormulaVisitor<Formula>{
	visitImplication = (formula: Implication): Formula => 
		new Disjunction(
			new Negation(formula.left.acceptVisitor(this)),
			formula.right.acceptVisitor(this)
		)
	visitConjunction = (formula : Conjunction) : Formula => 
		new Conjunction(
			formula.left.acceptVisitor(this), 
			formula.right.acceptVisitor(this)
		)
	visitDisjunction = (formula : Disjunction) : Formula => 
		new Disjunction(
			formula.left.acceptVisitor(this), 
			formula.right.acceptVisitor(this)
		)
	visitNegation = (formula : Negation) : Formula => new Negation(formula.formula.acceptVisitor(this))
	visitVariable = (formula : Variable) : Formula => Variable.create(formula.name)
	visitFalsity = (formula : Formula) => formula  
	visitTruth = (formula : Formula) => formula 
}