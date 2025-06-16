/*

Rules of the sequent calculus
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
 * For all rules : big greek letters are sequences of formulas, small greek letters are formulas. Sequences are also allowed to be empty
 */
const structuralRules = (function(){
	function copy(antecedent : readonly Formula[], succedent : readonly Formula[]){
		const formulaCopier : CopyCreator = new CopyCreator()
		return new Sequent(
			antecedent.slice().map(formula => formula.acceptVisitor(formulaCopier)),
			succedent.slice().map(formula => formula.acceptVisitor(formulaCopier)),
		)
	}
	/**
	 * |||
	 * |-|-|
	 * | **Premise:**    |       Gamma => Delta |
	 * | **Conclusion:** |  phi, Gamma => Delta |
	 * @param conclusion The sequent before the rule use
	 * @returns The resulting premise by removing the left most formula
	 */
	function leftWeakening(conclusion : Sequent) : [Sequent]{
		const withoutFormula = conclusion.antecedent.slice(1)
		return [copy(withoutFormula, conclusion.succedent)]
	}
	/**
	 * |||
	 * |-|-|
	 * | **Premise:**    | Gamma => Delta      |
	 * | **Conclusion:** | Gamma => Delta, phi |
	 * @param conclusion The sequent before the rule use
	 * @returns The resulting premise by removing the right most formula
	 */
	function rightWeakening(conclusion : Sequent) : [Sequent]{
		const withoutFormula = conclusion.succedent.slice(1)
		return [copy(conclusion.antecedent, withoutFormula)]
	}
	/**
	 * |||
	 * |-|-|
	 * | **Premise:**    | Gamma, phi, psi, Pi => Delta |
	 * | **Conclusion:** | Gamma, psi, phi, Pi => Delta |
	 * @param conclusion The sequent before the rule use
	 * @returns The resulting premise by switching the positions of 2 formula in the antecedent that are next to each other
	 */
	function leftExchange(conclusion : Sequent, leftFormulaIndex : number) : [Sequent]{
		if(leftFormulaIndex >= conclusion.antecedent.length-1)throw new Error("Can't use exchange rules: No formula on the right")
		const leftSequence = conclusion.antecedent.slice(0,leftFormulaIndex)
		const rightSequent = conclusion.antecedent.slice(leftFormulaIndex+2, conclusion.antecedent.length)
		const leftFormula = conclusion.antecedent[leftFormulaIndex]
		const rightFormula = conclusion.antecedent[leftFormulaIndex+1]

		return [copy([...leftSequence, rightFormula, leftFormula, ...rightSequent], conclusion.succedent)]
	}
	/**
	 * |||
	 * |-|-|
	 * | **Premise:**    | Gamma => Delta, phi, psi, Lambda |
	 * | **Conclusion:** | Gamma => Delta, psi, phi, Lambda |
	 * @param conclusion The sequent before the rule use
	 * @returns The resulting premise by switching the positions of 2 formula in the succedent that are next to each other
	 */
	function rightExchange(conclusion : Sequent, leftFormulaIndex : number) : [Sequent]{
		if(leftFormulaIndex >= conclusion.succedent.length-1)throw new Error("Can't use exchange rules: No formula on the right")
		const leftSequence = conclusion.succedent.slice(0,leftFormulaIndex)
		const rightSequent = conclusion.succedent.slice(leftFormulaIndex+2, conclusion.succedent.length)
		const leftFormula = conclusion.succedent[leftFormulaIndex]
		const rightFormula = conclusion.succedent[leftFormulaIndex+1]

		return [copy(conclusion.antecedent, [...leftSequence, rightFormula, leftFormula, ...rightSequent])]
	}
	leftWeakening.toString = () => "Left Weakening Rule"
	rightWeakening.toString = () => "Right Weakening Rule"
	leftExchange.toString = () => "Left Exchange Rule"
	rightExchange.toString = () => "Right Exchange Rule"
	leftWeakening.proofName = "(We.l)"
	rightWeakening.proofName = "(We.r)"
	leftExchange.proofName = "(Ex.l)"
	rightExchange.proofName = "(Ex.r)"
	

	return {
		leftWeakening,
		rightWeakening,
		leftExchange,
		rightExchange
	} as {leftWeakening : Rule, rightWeakening : Rule ,leftExchange : Rule ,rightExchange : Rule }
}())


type Rule = {(...params : any): Sequent[];toString: () => string;proofName: string;}
const proofHelper = (function(){
	class ConnectiveFinder implements FormulaVisitor<boolean>{
		visitImplication = (formula: Implication): boolean => true 
		visitConjunction = (formula: Conjunction): boolean => true
		visitDisjunction = (formula: Disjunction): boolean => true
		visitNegation = (formula: Negation): boolean => true
		visitVariable = (formula: Variable): boolean => false
		visitTruth = (formula: Truth): boolean => {throw new Error("Can't have Truth symbol in Sequents")}
		visitFalsity = (formula: Falsity): boolean => {throw new Error("Can't have Falsity symbol in Sequents")}
	}

	/**
	 * For a sequent, applies a logical/propositional rule for one of it's formulas by visiting that formula
	 * 
	 * The formula must be on the outside of it's cedent, so it's at index 0
	 * 
	 * @todo instead of returning rules as functions, just immediatly return the premises.
	 * 	Don't ask me why I didn't do this the first time
	 */
	class RuleFinder implements FormulaVisitor<Rule>{
		
		constructor(public conclusion : Sequent, public formulaInAntecedent : boolean){
		}
		private generateNameFunction(name : String){
			return this.formulaInAntecedent ? () => "Left "+name+" Rule" : () => "Right "+name+" Rule"
		}
		private generateProofName(name : String){
			return this.formulaInAntecedent ? `(${name}:l)` : `(${name}:r)`
		}
		/**
		 * |Left:            |                                             | |Right:                      |
		 * |:-               |-                                            |-|:-                          |
		 * | **Premise:**    | Gamma => Delta, phi and psi, Gamma => Delta | | phi,Gamma => Delta. psi    |
		 * | **Conclusion:** | phi -> psi, Gamma => Delta                  | | Gamma => Delta, phi -> psi |
		 * 
		 * @param formula A formula at the outside of a cedent
		 * @returns A function returning the resulting premises
		 */
		visitImplication(formula: Implication): Rule {
			if(this.formulaInAntecedent){
				//left implication rule
				const withoutFormula = this.conclusion.antecedent.slice(1)
				const leftImplication = () => {
					return [
						copySequent(withoutFormula, [formula.left, ...this.conclusion.succedent]),
						copySequent([formula.right, ...withoutFormula], this.conclusion.succedent)
					]
				}
				leftImplication.toString = this.generateNameFunction("Implication")
				leftImplication.proofName = this.generateProofName("\u2192")
				return leftImplication
			}
			//right implication rule
			const withoutFormula = this.conclusion.succedent.slice(1)
			const rightImplication = () => [copySequent([formula.left, ...this.conclusion.antecedent], [ formula.right, ...withoutFormula])]
			rightImplication.toString = this.generateNameFunction("Implication")
			rightImplication.proofName = this.generateProofName("\u2192")
			return rightImplication
		}
		/**
		 * |Left:            |                           | |Right:                                       |
		 * |:-               |-                          |-|:-                                           |
		 * | **Premise:**    | phi, psi, Gamma => Delta  | | phi, Gamma => Delta and psi, Gamma => Delta |
		 * | **Conclusion:** | phi & psi, Gamma => Delta | | Gamma => Delta, phi -> psi                  |
		 * 
		 * @param formula A formula at the outside of a cedent
		 * @returns A function returning the resulting premises
		 */
		visitConjunction(formula: Conjunction): Rule {
			if(this.formulaInAntecedent){
				//left conjunction rule
				const withoutFormula = this.conclusion.antecedent.slice(1)
				const leftConjunction = () => [copySequent([formula.left, formula.right, ...withoutFormula], this.conclusion.succedent)]
				leftConjunction.toString = this.generateNameFunction("Conjunction")
				leftConjunction.proofName = this.generateProofName("\u2227")
				return leftConjunction
			}
			//right conjunction rule
			const withoutFormula = this.conclusion.succedent.slice(1)
			const rightConjunction : Rule = () => [
				copySequent(this.conclusion.antecedent,[formula.left,  ...withoutFormula]),
				copySequent(this.conclusion.antecedent,[formula.right, ...withoutFormula]),
			]
			rightConjunction.toString = this.generateNameFunction("Conjunction")
			rightConjunction.proofName = this.generateProofName("\u2227")
			return rightConjunction
		}
		/**
		 * |Left:            |                                             | |Right:                      |
		 * |:-               |-                                            |-|:-                          |
		 * | **Premise:**    | phi, Gamma => Delta and psi, Gamma => Delta | | Gamma => Delta, psi, phi		|
		 * | **Conclusion:** | phi \psi, Gamma => Delta                    | | Gamma => Delta, phi \| psi |
		 * 
		 * @param formula A formula at the outside of a cedent
		 * @returns A function returning the resulting premises
		 */
		visitDisjunction(formula: Disjunction): Rule {
			if(this.formulaInAntecedent){
				//left disjunction rule
				const withoutFormula = this.conclusion.antecedent.slice(1)
				const leftDisjunction = () => [
					copySequent([formula.left,  ...withoutFormula], this.conclusion.succedent),
					copySequent([formula.right, ...withoutFormula], this.conclusion.succedent)
				]
				leftDisjunction.toString = this.generateNameFunction("Disjunction")
				leftDisjunction.proofName = this.generateProofName("\u2228")
				return leftDisjunction
			}
			//right disjunction rule
			const withoutFormula = this.conclusion.succedent.slice(1)
			const rightDisjunction = () => [copySequent(this.conclusion.antecedent, [formula.left, formula.right, ...withoutFormula])]
			rightDisjunction.toString = this.generateNameFunction("Disjunction")
			rightDisjunction.proofName = this.generateProofName("\u2228")
			return rightDisjunction
		}
		/**
		 * |Left:            |                      | |Right:               |
		 * |:-               |-                     |-|:-                   |
		 * | **Premise:**    | Gamma => Delta, phi  | | phi, Gamma => Delta |
		 * | **Conclusion:** | -phi, Gamma => Delta | | Gamma => Delta, -phi|
		 * 
		 * @param formula A formula at the outside of a cedent
		 * @returns A function returning the resulting premises
		 */
		visitNegation(formula: Negation): Rule {
			if(this.formulaInAntecedent){
				//left negation rule
				const withoutFormula = this.conclusion.antecedent.slice(1)
				const leftNegation = () => [copySequent(withoutFormula, [formula.formula, ...this.conclusion.succedent])]
				leftNegation.toString = this.generateNameFunction("Negation")
				leftNegation.proofName = this.generateProofName("\u00AC")
				return leftNegation
			}
			//right negation rule
			const withoutFormula = this.conclusion.succedent.slice(1)
			const rightNegation = () => [copySequent([formula.formula, ...this.conclusion.antecedent], withoutFormula)]
			rightNegation.toString = this.generateNameFunction("Negation")
			rightNegation.proofName = this.generateProofName("\u00AC")
			return rightNegation
		}
		visitVariable(formula: Variable): any {
			throw new Error("not.")
		}
		visitTruth(formula: Truth): any {
			throw new Error("not.")
		}
		visitFalsity(formula: Falsity): any {
			throw new Error("not.")
		}
	}
	const formulaCopier : CopyCreator = new CopyCreator()

	/**
	 * Moves a formula in one of the cedents from {@link formulaIndex | its index} to the highest possible index using exchange rules.
	 * 
	 * Since the succedent is "mirrored", this means that the formula is now on the outside, and propositional rules can be applied to it.
	 * 
	 * @param sequent The node of a proof containing the sequent with a formula we want to move outside
	 * @param formulaIndex The index of the formula we want to move
	 * @param inAntecedent Determines if {@link formulaIndex} applies to the antecedent or the succedent
	 * @returns A ProofTree node resulting from applying the exchange rules a bunch of times
	 */
	function moveFormulaOutside(sequent : ProofTree, formulaIndex : number, inAntecedent : boolean){ 
		return moveFormula(sequent, formulaIndex, inAntecedent, true)
	}
	/**
	 * Moves a formula in one of the cedents from {@link formulaIndex | its index} to index 0 using exchange rules
	 * 
	 * Since the succedent is "mirrored", index 0 means that the formula is now next to the sequent arrow.
	 * This is helpful when the formula is a variable that's part of an initial axiom, since we can remove all other formulas in the cedents in one go
	 * 
	 * @param sequent The node of a proof containing the sequent with a formula we want to move outside
	 * @param formulaIndex The index of the formula we want to move
	 * @param inAntecedent Determines if {@link formulaIndex} applies to the antecedent or the succedent
	 * @returns A ProofTree node resulting from applying the exchange rules a bunch of times
	 */
	function moveFormulaInside(sequent : ProofTree, formulaIndex : number, inAntecedent : boolean){ 
		return moveFormula(sequent, 
			formulaIndex, 
			inAntecedent, 
			false
		)
	}

	/**
	 * Helper function for {@link moveFormulaOutside} and {@link moveFormulaInside}
	 */
	function moveFormula(sequent : ProofTree, formulaIndex : number, inAntecedent : boolean, moveToOutside : boolean){
		const neccesaryRule = inAntecedent ? structuralRules.leftExchange : structuralRules.rightExchange
		const relativeSwapPosition = moveToOutside ? -1 : 0
		const formulaShift = moveToOutside ? -1 : 1
		const moveDecider = moveToOutside ? () => formulaIndex > 0 : (
			inAntecedent ? () => formulaIndex < sequent.sequent.antecedent.length-1 : () => formulaIndex < sequent.sequent.succedent.length-1
		)
		let currentProofSequent = sequent
		while(moveDecider()){
			currentProofSequent.premiseOne = new ProofTree(neccesaryRule(currentProofSequent.sequent, formulaIndex + relativeSwapPosition)[0])
			currentProofSequent.usedRule = neccesaryRule
			currentProofSequent = currentProofSequent.premiseOne
			formulaIndex += formulaShift
		}
		return currentProofSequent
	}
	/**
	 * For a sequent with only variables 
	 * and the same variable on the most inner position in each cedent,
	 * this function creates the rest of the proof in {@link sequent} to get to the initial axiom
	 * 
	 * @param sequent A sequent
	 * @throws An error if a formula that is not a variable can be found
	 */
	function deriveAxiom(sequent : ProofTree){
		sequent.sequent.antecedent.every(formula => {if(!(formula instanceof Variable))throw new Error("antecedent must only have variables")})
		sequent.sequent.succedent.every(formula => {if(!(formula instanceof Variable))throw new Error("succedent must only have variables")})
		let currentProof = sequent
		while(currentProof.sequent.antecedent.length > 1){
			currentProof.usedRule = structuralRules.leftWeakening
			const nextProof = new ProofTree(structuralRules.leftWeakening(currentProof.sequent)[0])
			currentProof.premiseOne = nextProof
			currentProof = nextProof
		}
		while(currentProof.sequent.succedent.length > 1){
			currentProof.usedRule = structuralRules.rightWeakening
			const nextProof = new ProofTree(structuralRules.rightWeakening(currentProof.sequent)[0])
			currentProof.premiseOne = nextProof
			currentProof = nextProof
		}
	}

	/**
	 * Tries to find a formula in {@link sequent} that is a connective.
	 * 
	 * Used to find out on which formula we want to use a propositional rule.
	 * 
	 * @param sequent a sequent
	 * @returns If a connective can be found, then returns in which cedent it has been found, 
	 *   and the index of the connective in that specified cedent. Else ["no"]
	 */
	function hasConnectiveFormula(sequent : Sequent) : ["antecedent", number] | ["succedent", number] | ["no"]{
		let position = sequent.antecedent.findIndex(formula => formula.acceptVisitor(new ConnectiveFinder))
		if(position !== -1) return ["antecedent",  position]
		position = sequent.succedent.findIndex(formula => formula.acceptVisitor(new ConnectiveFinder))
		if(position !== -1) return ["succedent", position]
		return ["no"]
	}
	/**
	 * Finds the same variable in both cedents of {@link seq}.
	 * 
	 * @param seq A sequent
	 * @returns Either the indices of a variable in the antecedent and the succedent,
	 *  or undefined if no one variable could be found in both cedents
	 * @throws An error if a formula that is not a variable can be found in {@link seq}
	 */
	function findAxiom(seq : Sequent) : [number, number] | undefined{
		seq.antecedent.every(formula => {if(!(formula instanceof Variable))throw new Error("antecedent must only have variables")})
		seq.succedent.every(formula => {if(!(formula instanceof Variable))throw new Error("succedent must only have variables")})
		const antecedentVariableNames = seq.antecedent.map(form => (form as Variable).name)
		const succedentVariableNames = seq.succedent.map(form => (form as Variable).name)
		for(let antIndex = antecedentVariableNames.length-1; antIndex >= 0; antIndex--){
			for(let sucIndex = succedentVariableNames.length-1; sucIndex >= 0; sucIndex--){
				if(antecedentVariableNames[antIndex] == succedentVariableNames[sucIndex])return [antIndex, sucIndex]
			}
		}
		return undefined
	}

	/**
	 * @param antecedent The antecedent of a sequent that needs to be copied 
	 * @param succedent The succedent of a sequent that needs to be copied
	 * @returns A sequent where both cedents are deep copies of the provided cedents
	 */
	function copySequent(antecedent : readonly Formula[], succedent : readonly Formula[]){
		return new Sequent(
			antecedent.slice().map(formula => formula.acceptVisitor(formulaCopier)),
			succedent.slice().map(formula => formula.acceptVisitor(formulaCopier)),
		)
	}
	return{
		RuleFinder,
		moveFormula,
		hasConnectiveFormula,
		findAxiomVariables: findAxiom,
		moveFormulaInside,
		moveFormulaOutside,
		deriveAxiom
	}
})()