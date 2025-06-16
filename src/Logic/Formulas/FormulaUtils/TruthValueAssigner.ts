/*

Semantics of formulas
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