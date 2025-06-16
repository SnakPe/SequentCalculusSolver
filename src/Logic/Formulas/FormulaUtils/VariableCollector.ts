/*

lol2
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