/*

Normal Form Converter
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
 * Using a {@link NFConverterStrategy}, converts a formula into a normal form.
 */
class NormalFormConverter{
  private withoutImplications : Formula
  constructor(formula : Formula, private strategy : NFConverterStrategy = new DNFConverterStrategies.syntactic){
    this.withoutImplications = formula.acceptVisitor(new ImplicationRemover())
  }
  set formula (formula : Formula){
    this.withoutImplications = formula.acceptVisitor(new ImplicationRemover())
  }
  getConvertedFormula() : Formula{
    return this.strategy.convert(this.withoutImplications)
  }
}
