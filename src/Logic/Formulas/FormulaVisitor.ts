/*

Visitor for Formulas
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