interface NFConverterStrategy{
  convert(formula : Formula) : Formula 
}

/**
 * Provides various strategies to convert formulas into the disjunctive normal form
 */
const DNFConverterStrategies = {
  /**
   * using the method {@link https://en.wikipedia.org/wiki/Disjunctive_normal_form#..._by_syntactic_means | found here}
   */
  syntactic : class SyntacticStrategy implements NFConverterStrategy{
    convert(formula: Formula): Formula {
      class DisjunctiveNormalFormConverterVisitor implements FormulaVisitor<Formula>{

        visitImplication(formula: Implication): Formula {
          throw new Error("Formula should not have implications anymore")
        }
        visitConjunction(formula: Conjunction): Formula {
          //Use the distributive law if 
          const prefixedRight = formula.right.acceptVisitor(this)
          const prefixedLeft = formula.left.acceptVisitor(this)
          if(prefixedRight instanceof Disjunction){
            const x = prefixedLeft
            const y = prefixedRight.left
            const z = prefixedRight.right
      
            // we could only do z.acceptVisitor(this) once, which would be more efficient
            return new Disjunction(
              new Conjunction(x,y).acceptVisitor(this),
              new Conjunction(x,z).acceptVisitor(this)
            )
          }
          if(prefixedLeft instanceof Disjunction){
            const x = prefixedLeft.left
            const y = prefixedLeft.right
            const z = prefixedRight
      
            // we could only do x.acceptVisitor(this) once, which would be more efficient
            return new Disjunction(
              new Conjunction(x,z).acceptVisitor(this),
              new Conjunction(y,z).acceptVisitor(this)
            )
          }
          return new Conjunction(prefixedLeft, prefixedRight)
        }
        visitDisjunction(formula: Disjunction): Formula {
          return new Disjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this))
        }
        visitNegation(formula: Negation): Formula {
          //use double negation elimination
          const prefixed = formula.formula.acceptVisitor(this)
          if(prefixed instanceof Negation)
            return prefixed.formula.acceptVisitor(this)
          //use DeMorgan's laws
          if(prefixed instanceof Disjunction)
            return new Conjunction(
              new Negation(prefixed.left).acceptVisitor(this), 
              new Negation(prefixed.right).acceptVisitor(this)
            )
          if(prefixed instanceof Conjunction)
            return new Disjunction(
              new Negation(prefixed.left), 
              new Negation(prefixed.right)
            ).acceptVisitor(this)
          return new Negation(prefixed)
        }
        visitVariable(formula: Variable): Formula {
          return Variable.create(formula.name)
        }
        visitTruth(formula: Truth): Formula {
          throw new Error("Formula has Truth symbol, which is not allowed for the NNF form")
        }
        visitFalsity(formula: Falsity): Formula {
          throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form")
        }
      }
      return formula.acceptVisitor(new DisjunctiveNormalFormConverterVisitor)
    }
  },
  /**
   * using the method {@link https://en.wikipedia.org/wiki/Disjunctive_normal_form#..._by_semantic_means | found here}
   */
  semantic : class SemanticStrategy implements NFConverterStrategy{
    convert(formula: Formula) : Formula {
      const truthTable = getTruthTable(formula)

      function getClauseFromInterpretation(interpretation : Interpretation){
        function getLiteralFromAssignment([text, assignedValue] : [VariableText,boolean]){
          const variable = Variable.create(text)
          return assignedValue ? variable : new Negation(variable)
        }
        if(interpretation.length == 1) return getLiteralFromAssignment(interpretation[0])
        let clause = new Conjunction(getLiteralFromAssignment(interpretation[0]), getLiteralFromAssignment(interpretation[1])) 
        for(const assignment of interpretation.slice(2,interpretation.length))
          clause = new Conjunction(clause, getLiteralFromAssignment(assignment))
        return clause
      }
      if(truthTable.length <= 1){
        return truthTable.getValue([]) ? Truth.create() : Falsity.create()
      }
      const validInterpretations = truthTable.table.filter(([_, value]) => value).map(([interpretation, _]) => interpretation)
      if(validInterpretations.length == 1)return getClauseFromInterpretation(validInterpretations[0])

      let convertedFormula = new Disjunction(getClauseFromInterpretation(validInterpretations[0]), getClauseFromInterpretation(validInterpretations[1]))
      for(const interpretation of validInterpretations.slice(2))
        convertedFormula = new Disjunction(convertedFormula, getClauseFromInterpretation(interpretation))
      return convertedFormula
    }
  }
}

/**
 * Provides various strategies to convert formulas into the conjunctive normal form
 */
const CNFConverterStrategies = {
  /**
   * using the method {@link https://en.wikipedia.org/wiki/Conjunctive_normal_form#Basic_algorithm | found here}
   */
  syntactic : class SyntacticStrategy implements NFConverterStrategy{
    convert(formula: Formula): Formula {
      //this is step 1 in the wikipedia article
      const negatedDNF : Formula = new NormalFormConverter(new Negation(formula), new DNFConverterStrategies.syntactic).getConvertedFormula()      
      const implicationError = new Error("Formula should not have implications anymore")
      
      class Step2Visitor implements FormulaVisitor<Formula>{
        visitImplication(formula: Implication): Formula {
          throw implicationError
        }
        visitConjunction(formula: Conjunction): Formula {
          /* only way to be in a conjunction is if we are in a clause
           *
           * we can have 3 cases for the child elements of our formula:
           * 
           * 1. element is a negation: then we want to negate the negation, so we just get the variable inside of our negation
           * 2. element is a variable: then we want to negate the variable
           * 3. element is a conjunction: then we want to turn it into a disjunction, so we just visit it again
           * 
           */
          const getNextFormula = (childFormula : Formula) =>{
            if(childFormula instanceof Negation)
              return childFormula.formula
            if(childFormula instanceof Variable)
              return new Negation(childFormula)
            else return childFormula.acceptVisitor(this)
          }
          return new Disjunction(
            getNextFormula(formula.left),
            getNextFormula(formula.right)
          )
        }
        visitDisjunction(formula: Disjunction): Formula {
          /* only way to be in a disjunction is if we are outside of clauses, so we want to switch it to a conjunction */
          return new Conjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this))
        }
        visitNegation(formula: Negation): Formula {
          //the formula inside the negation must be a variable
          return new Negation(formula.formula)
        }
        visitVariable(formula: Variable): Formula {
          throw formula
        }
        visitTruth(formula: Truth): Formula {
          throw new Error("Formula has Truth symbol, which is not allowed for the CNF form")
        }
        visitFalsity(formula: Falsity): Formula {
          throw new Error("Formula has Falsity symbol, which is not allowed for the CNF form")
        }
      
      }
      return negatedDNF.acceptVisitor(new Step2Visitor())
    }
  },

  /**
   * Works by getting all interpretations that make the formula false, and disjunct their negation together 
   */
  semantic : class SemanticStrategy implements NFConverterStrategy{
    convert(formula: Formula): Formula {
      const truthTable = getTruthTable(formula)

      function getClauseFromInterpretation(interpretation : Interpretation) : Formula{
        function getLiteralFromAssignment([text, assignedValue] : [VariableText,boolean]){
          const variable = Variable.create(text)
          return assignedValue ? new Negation(variable) : variable
        }
        const nextLiteral = getLiteralFromAssignment(interpretation.pop()!) 
        if(interpretation.length === 0) 
          return nextLiteral
        return new Disjunction(nextLiteral, getClauseFromInterpretation(interpretation))
      }
      if(truthTable.length == 0)
        //formula has no variables
        return truthTable.getValue([]) ? Truth.create() : Falsity.create()
      const invalidInterpretations = truthTable.table.filter(([_, value]) => !value).map(([interpretation, _]) => interpretation)

      if(invalidInterpretations.length === 1)
        return getClauseFromInterpretation(invalidInterpretations[0])
      
      let convertedFormula = new Conjunction(getClauseFromInterpretation(invalidInterpretations[0]),getClauseFromInterpretation(invalidInterpretations[1]))
      for(const interpretation of invalidInterpretations.slice(2))
        convertedFormula = new Conjunction(convertedFormula, getClauseFromInterpretation(interpretation))
      return convertedFormula
    }
  }
}

const NNFConverterStrategies = {
  syntactic : class SyntacticStrategy implements NFConverterStrategy{
    convert(formula: Formula): Formula {
      class NegationNormalFormConverterVisitor implements FormulaVisitor<Formula>{
        afterNegationVisitor = new AfterNegationVisitor(this)
      
        visitImplication(formula: Implication): Formula {
          throw new Error("Formula has implication, even though they should be removed");
        }
        visitConjunction(formula: Conjunction): Formula {
          return new Conjunction(formula.left, formula.right)
        }
        visitDisjunction(formula: Disjunction): Formula {
          return new Disjunction(formula.left, formula.right)
        }
        visitNegation(formula: Negation): Formula {
          //we act acording to the type of the contained formula of the negation
          return formula.formula.acceptVisitor(this.afterNegationVisitor)
        }
        visitVariable(formula: Variable): Formula {
          return Variable.create(formula.name)
        }
        visitTruth(formula: Truth): Formula {
          throw new Error("Formula has Truth symbol, which is not allowed for the NNF form")
        }
        visitFalsity(formula: Truth): Formula {
          throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form")
        }
      }
      
      /**
       * this visitor is being used only after previously finding a negation
       * 
       * if we find a conjunction(so -(a & b)) or a disjunction(so -(a | b)),
       * we move the negation inside of the junction using {@link https://en.wikipedia.org/wiki/De_Morgan's_laws | DeMorgan's Law }
       * 
       * if we find another negation, we remove both of them using {@link https://en.wikipedia.org/wiki/Double_negation | Double negation}
       */
      class AfterNegationVisitor implements FormulaVisitor<Formula>{
        nnfConverterVisitor : NegationNormalFormConverterVisitor
        constructor(nnfConverterVisitor : NegationNormalFormConverterVisitor){
          this.nnfConverterVisitor = nnfConverterVisitor
        }
        visitImplication(formula: Implication): Formula {
          throw new Error("Formula has implication, even though they should be removed");
        }
        visitConjunction(formula: Conjunction): Formula {
          //use the law of DeMorgan
          return new Disjunction(
            new Negation(formula.left ).acceptVisitor(this.nnfConverterVisitor), 
            new Negation(formula.right).acceptVisitor(this.nnfConverterVisitor)
          )
        }
        visitDisjunction(formula: Disjunction): Formula {
          //use the law of DeMorgan
          return new Conjunction(
            new Negation(formula.left ).acceptVisitor(this.nnfConverterVisitor), 
            new Negation(formula.right).acceptVisitor(this.nnfConverterVisitor)
          )
        }
        visitNegation(formula: Negation): Formula {
          //remove both negation
          return formula.formula.acceptVisitor(this.nnfConverterVisitor)
        }
        visitVariable(formula: Variable): Formula {
          //add the negation back
          return new Negation(formula.acceptVisitor(this.nnfConverterVisitor))
        }
        visitTruth(formula: Truth): Formula {
          throw new Error("Formula has Truth symbol, which is not allowed for the NNF form")
        }
        visitFalsity(formula: Truth): Formula {
          throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form")
        }
      }

      return formula.acceptVisitor(new NegationNormalFormConverterVisitor())
    }
  }
}