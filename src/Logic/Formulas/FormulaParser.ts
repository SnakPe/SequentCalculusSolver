/*

Formula parser
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

enum NonVariableToken {
  LeftParen = "(",
  RightParen = ")",
  Ampersand = "&",
  Line = "|",
  Minus = "-",
  Arrow = "->",
  Truth = "T",
  Falsity = "F",
}
type Token = VariableText | NonVariableToken


function parseFormula(formulaText : string) : Formula{
  /**
   * Lexer for propositional formulas
   * 
   * @param formulaText A string of a propositional formula 
   * @returns A list of tokens contained in {@link formulaText} 
   *
   */
  function scan(formulaText : string) : Token[]{
    let tokens  : Token[] = []
    let formula = ""
    let currentCharIndex = 0
    function atEnd() {
      return currentCharIndex >= formula.length     
    }
    function advance(){
      return formula[currentCharIndex++]
    }
    function peek(){
      return atEnd() ? '\0': formula[currentCharIndex]
    }
    function variable(){
      let varName = ""
      while(!atEnd() && isVariableText(peek()))
        varName += advance()
      return varName
    }
    tokens = []
    formula = formulaText
    currentCharIndex = 0
    while(!atEnd()){
      let char : string
      switch(char = advance()){
        case " ":
        case "\t":
          break;
        case "(":
          tokens.push(NonVariableToken.LeftParen)
          break;
        case ")":
          tokens.push(NonVariableToken.RightParen)
          break;
        case "-":
          if(peek() == ">"){
            tokens.push(NonVariableToken.Arrow)
            advance()
          }
          else
            tokens.push(NonVariableToken.Minus)
          break;
        case "&":
          tokens.push(NonVariableToken.Ampersand)
          break;
        case "|":
          tokens.push(NonVariableToken.Line)
          break;
        case "T":
            if(!isVariableText(peek()))tokens.push(NonVariableToken.Truth)
            else tokens.push("" + char + variable())
            break;
        case "F":
            if(!isVariableText(peek()))tokens.push(NonVariableToken.Falsity)
            else tokens.push("" + char + variable())
            break;
        default:
          if(isVariableText(char))
            tokens.push("" + char + variable())
          else throw new Error("Found unexpected character '" + char + "' in formula " + formulaText)
      }
    }
    return tokens
  }
  


  /*
  Grammar for parsing formulas using recursive descent

  Formula -> Impl
  Impl -> Or (Arrow Or)* 
  Or -> And (Line And)*
  And -> Neg Ampersand Neg
  Neg -> (Minus)? Primary
  Primary -> Truth | Falsity | "(" Formula ")" | Variable 
  */

  /**
   * A parser for propositional logic
   * parses a list of tokens created by {@link scan}
   *  
   * @param tokens list of tokens in order
   * @returns An {@link https://en.wikipedia.org/wiki/Abstract_syntax_tree | AST} of the formula
   */
  const parse = function(tokens : Token[]){
    let currentTokenIndex = 0

    const formula = () => implication()
    function implication() : Formula{
      let left = disjunction()
      while(match(NonVariableToken.Arrow)){
        const right = disjunction()
        left = new Implication(left, right)
      }
      return left
    }
    function disjunction() : Formula{
      let left = conjunction()
      while(match(NonVariableToken.Line)){
        const right = conjunction()
        left = new Disjunction(left, right)
      }
      return left
    }
    function conjunction() : Formula{
      let left = negation()
      while(match(NonVariableToken.Ampersand)){
        const right = negation()
        left = new Conjunction(left, right)
      }
      return left
    }
    function negation() : Formula{
      if(match(NonVariableToken.Minus))
        return new Negation(negation())
      return primary()
    }
    function primary() : Formula{
      let primary : Formula
      if(match(NonVariableToken.Truth))
        return Truth.create()
      if(match(NonVariableToken.Falsity))
        return Falsity.create()
      if(match(NonVariableToken.LeftParen)){
        primary = formula()
        if(!match(NonVariableToken.RightParen))
          throw new Error("An expression in brackets was not closed")
      }
      else if(isVariableText(peek())){
        let name = advance() as string
        return Variable.create(name)
      }
      else throw new Error("Expexted Expression, instead got '" + peek() + "'");
      
      return primary
    }

    const atEnd = () => currentTokenIndex >= tokens.length
    function advance() {
      if(!atEnd())return tokens[currentTokenIndex++]
      throw new Error("Can't advance: Already at end")
    }
    function match(token : Token){
      if(atEnd() || peek() !== token)return false
      advance()
      return true
    }
    const peek = () => tokens[currentTokenIndex]

    currentTokenIndex = 0
    const formulaAST : Formula = formula()
    if(!atEnd())console.error("Couldn't parse the entire expression, only '" + formulaAST.acceptVisitor(new FormulaPrinter()) + "'")
    return formulaAST
    
  }
  return parse(scan(formulaText))
}