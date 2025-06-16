/*

Printer for formulas to text for debugging
Copyright (C) 2025 Andreas Kovalski

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/**
 * Returns the AST of a {@link Formula} in string form.
 * 
 */
class ASTPrinter implements FormulaVisitor<string>{

	/**
	 * Puts a formula in brackets and prints the AST of either a binary or unary connective
	 * 
	 * @param op The string of the connective, like V for the Disjunction 
	 * @param formulas the subformulas that make up the connective.
	 * @returns The string (<op> <formulas[0]> <formulas[1]>) or (<op> <formulas[0]>)
	 */
	private group(op : string, ...formulas : [Formula]|[Formula, Formula]) : string{
		const grouping = ["(",op]
		for(const formula of formulas){
			grouping.push(" ", formula.acceptVisitor(this))
		}
		grouping.push(")")
		return grouping.join("")
	}
	visitImplication(formula: Implication): string {
		return this.group("\u2192", formula.left, formula.right)
	}
	visitConjunction(formula : Conjunction): string {
		return this.group("\u2227", formula.left, formula.right)
	}
	visitDisjunction(formula : Conjunction): string {
		return this.group("\u2228", formula.left, formula.right)
	}
	visitNegation(formula: Negation): string {
		return this.group("\u00AC",formula.formula)
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
}