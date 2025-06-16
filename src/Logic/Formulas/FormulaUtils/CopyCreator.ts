/*

Copy creator for formulas 
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