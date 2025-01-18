/**
 * Prints formulas in a human readable way. 
 * 
 * If multiple Con- or Disjunctions are chained toghether, unnecessary brackets are being left out.
 * E.g. (((A | B) | C) & (D & E)) becomes (A | B | C) & D & E
 */
class FormulaPrinter implements FormulaVisitor<string>{
	/**
	 * Creates a string of multiple subformulas connected together by one type of connective
	 * 
	 * If only one formula is provided, we assume that {@link op} is negation. This class does not use this though, lol
	 * 
	 * For binary connectives, more then 2 subformulas are allowed. 
	 * In that case, the opening and closing bracket is not added inbetween the subformulas
	 * 
	 * @param op The string of the connective, like V for the Disjunction 
	 * @param formulas The subformulas that make up the connective(s).
	 * @returns The string combining the {@link formulas} using {@link op}
	 */
	private group(op : string, ...formulas : Formula[]) : string{
		const grouping : string[] = ["("]
		if(formulas.length != 1){
			for(const formula of formulas){
				grouping.push(formula.acceptVisitor(this), " ", op, " ")
			}
			grouping.pop()
			grouping.pop()
			grouping.pop()
		}else grouping.push(op, formulas[0].acceptVisitor(this))
		grouping.push(")")
		return grouping.join("")
	}
	visitImplication(formula: Implication): string {
		return this.group("\u2192", formula.left, formula.right)
	}
	visitConjunction(formula : Conjunction): string {
		return this.group("\u2227", ...formula.acceptVisitor(new this.conjunctiveCollector()))
	}
	visitDisjunction(formula : Disjunction): string {
		return this.group("\u2228", ...formula.acceptVisitor(new this.disjunctiveCollector()))
	}
	visitNegation(formula: Negation): string {
		return "\u00AC" + formula.formula.acceptVisitor(this)
	}
	visitVariable(formula: Variable): string {
		return formula.name
	}
	visitTruth(formula: Truth): string {
		return "\u22A4"
	}
	visitFalsity(formula: Falsity): string {
		return "\u22A5"
	}

	/*
	 * The following code is very questionable and should be solved in another way 
	 * It collect all conjunctions or disjunctions next to each other 
	 */
	private conjunctiveCollector = class implements FormulaVisitor<Formula[]>{
		visitImplication = FormulaPrinter.prototype.identity
		visitConjunction = (formula: Conjunction): Formula[] => formula.left.acceptVisitor(this).concat(formula.right.acceptVisitor(this))
		visitDisjunction = FormulaPrinter.prototype.identity
		visitNegation = FormulaPrinter.prototype.identity
		visitVariable = FormulaPrinter.prototype.identity
		visitTruth = FormulaPrinter.prototype.identity
		visitFalsity = FormulaPrinter.prototype.identity
	}
	private disjunctiveCollector = class implements FormulaVisitor<Formula[]>{
		visitImplication = FormulaPrinter.prototype.identity
		visitConjunction = FormulaPrinter.prototype.identity
		visitDisjunction = (formula: Disjunction): Formula[] => formula.left.acceptVisitor(this).concat(formula.right.acceptVisitor(this))
		visitNegation = FormulaPrinter.prototype.identity
		visitVariable = FormulaPrinter.prototype.identity
		visitTruth = FormulaPrinter.prototype.identity
		visitFalsity = FormulaPrinter.prototype.identity
	}
	private identity (formula : Formula) : Formula[]{
		return [formula]
	}
}