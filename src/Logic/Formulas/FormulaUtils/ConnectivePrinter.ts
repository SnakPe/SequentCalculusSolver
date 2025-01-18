const connectives = ["Implication", "Conjunction", "Disjunction", "Negation", "Variable", "Truth", "Falsity"] as const
type Connective = typeof connectives[number]

/**
 * Prints the name of the specific class of the formula used.
 * this class is used when I'm to lazy to implement a better way to deal with different formula types
 * 
 * usually, one can prevent using this by implementing another visitor though, which is also more type safe
 */
class ConnectivePrinter implements FormulaVisitor<Connective>{
	visitImplication(formula: Implication): Connective {
		return "Implication"
	}
	visitConjunction(formula: Conjunction): Connective {
		return "Conjunction"
	}
	visitDisjunction(formula: Disjunction): Connective {
		return "Disjunction"
	}
	visitNegation(formula: Negation): Connective {
		return "Negation"
	}
	visitVariable(formula: Variable): Connective {
		return "Variable"
	}
	visitTruth(formula: Truth): Connective {
		return "Truth"
	}
	visitFalsity(formula: Falsity): Connective {
		return "Falsity"
	}
}