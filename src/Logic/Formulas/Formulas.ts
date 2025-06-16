/*

Formulas
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
 * An abstract class requiring every subclass to have a function to accept a {@link FormulaVisitor}
 */
abstract class Formula{
  abstract acceptVisitor<T>(visitor : FormulaVisitor<T>): T
}

class Implication extends Formula{
  constructor(readonly left : Formula, readonly right : Formula){
    super()
  }

  /**
   * @override 
   * @param visitor 
   */
  acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitImplication(this)
  }
}
class Conjunction extends Formula{
  constructor(readonly left : Formula, readonly right : Formula){
    super()
  }
  /**
   * @override 
   * @param visitor 
   */
  acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitConjunction(this)
  }
}
class Disjunction extends Formula{
  constructor(readonly left : Formula, readonly right : Formula){
    super()
  }
  /**
   * @override 
   * @param visitor 
   */
  acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitDisjunction(this)
  }
}
class Negation extends Formula{
  constructor(readonly formula : Formula){
    super()
  }
  /**
   * @override 
   * @param visitor 
   */
  acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitNegation(this)
  }
}

/**
 * Used when parsing user input
 */
type VariableText = string
function isVariableText(thing : any) : thing is VariableText{
  function isLetter(char : string){
    const charCode = char.charCodeAt(0)
    return (65 <= charCode && charCode <= 90 ) || //upper case
           (97 <= charCode && charCode <= 122)  //lower case
  }
  function isNumber(char : string){
    const charCode = char.charCodeAt(0)
    return 48 <= charCode && charCode <= 57
  }
  function isAlphanumeric(char : string){
    return isLetter(char) || isNumber(char)
  }

  if(typeof thing !== "string") return false
  for(let i = 0; i < thing.length; i++)
    if(!isAlphanumeric(thing.charAt(i)))return false

  return true
}

const alreadyUsedVariables : Map<VariableText,Variable> = new Map()
/**
 * @todo right now, if variables use the same name, they are also the same object.
 *   Maybe think about just using an equals() function instead, to remove {@link alreadyUsedVariables}
 *   and saving some memory
 */
class Variable extends Formula{
  private constructor(readonly name : VariableText){
    super()
  }
  static create(name : VariableText) : Variable{
    if(alreadyUsedVariables.has(name)) return alreadyUsedVariables.get(name)!
    const newVariable = new Variable(name)
    alreadyUsedVariables.set(name, newVariable)
    return newVariable
  }
  /**
   * @override 
   * @param visitor 
   */
  acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitVariable(this)
  }
}

class Truth extends Formula{
  private static instance? : Falsity
  private constructor(){
    super()
  }
  static create() : Truth{
    if(Truth.instance === undefined)
      return Truth.instance = new Truth()
    return Truth.instance
  }
  override acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitTruth(this)
  }
}
class Falsity extends Formula{
  private static instance? : Falsity
  private constructor(){
    super()
  }
  static create() : Falsity{
    if(Falsity.instance === undefined)
      return Falsity.instance = new Falsity()
    return Falsity.instance
  }
  override acceptVisitor<T>(visitor: FormulaVisitor<T>): T {
    return visitor.visitFalsity(this)
  }
}