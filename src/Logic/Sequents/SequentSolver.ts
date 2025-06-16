/*

Proofs and proof finder
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
 * A node in a tree containing a conclusion and pointing to the premise or premises that are used to derive it.
 * Also saves the rule used. 
 */
class ProofTree{ 
	premiseOne? : ProofTree
	premiseTwo? : ProofTree
	usedRule? : Rule
	constructor(public sequent : Sequent){}
	
	/**
	 * Creates the premises leading to a complete proof, and solves these premises 
	 * The basic algorithm works like follows:
	 * 
	 * 1. find a connective in the cedents
	 * 2. move it to the outside of the cedent, and break it up using a propositional rule
	 * 3. repeat step 1 and 2 as long as there are connectives
	 * 4. if only variables are left in the cedents, try to find the same variable in both cedents
	 * 5. move them to the inside of the sequent, and remove all other variables to derive an initial axiom 
	 * 
	 * @throws If the sequent is not solvable.
	 */
	solve() : void{
		const nextFormula = proofHelper.hasConnectiveFormula(this.sequent)
		let usableProof : ProofTree
		let nextSequents : Sequent[]
		let nextRule : Rule
		switch(nextFormula[0]){
			case "no":
				const axiomVariablePos = proofHelper.findAxiomVariables(this.sequent)
				if(axiomVariablePos === undefined)
					throw new Error("Can't find proof for the (sub-)sequent \"" + this.sequent.toString() + "\"")
				//move axiom variable to the inside, and remove all other variables
				proofHelper.deriveAxiom(
					proofHelper.moveFormulaInside(
						proofHelper.moveFormulaInside(this,axiomVariablePos[0], true),
						axiomVariablePos[1],
						false
					)
				)
			return
			case "antecedent":
				usableProof = proofHelper.moveFormulaOutside(this, nextFormula[1], true)
				nextRule = usableProof.sequent.antecedent[0].acceptVisitor(new proofHelper.RuleFinder(usableProof.sequent, true))
			break
			case "succedent":
				usableProof = proofHelper.moveFormulaOutside(this, nextFormula[1], false)
				nextRule = usableProof.sequent.succedent[0].acceptVisitor(new proofHelper.RuleFinder(usableProof.sequent, false))
			break
		}
		usableProof.premiseOne = new ProofTree(nextRule()[0])
		usableProof.usedRule = nextRule
		usableProof.premiseOne.solve()
		if(nextRule().length == 2){ 
			usableProof.premiseTwo = new ProofTree(nextRule()[1])
			usableProof.usedRule = nextRule
			usableProof.premiseTwo.solve()
		}
	}

	/**
	 * @returns A string naming every use of a rule, from the conclusion to it's premise.
	 *   If a rule results in two premises, each one is mentioned seperately
	 */
	toString() : string{
		let stringBuilder : string[] = []
		if(this.premiseOne !== undefined){
			stringBuilder.push(`From ${this.sequent.toString()} to ${this.premiseOne.sequent.toString()} using ${this.usedRule!}\n`)
			stringBuilder.push(this.premiseOne.toString())
		}
		if(this.premiseTwo !== undefined){
			stringBuilder.push(`From ${this.sequent.toString()} to ${this.premiseTwo.sequent.toString()} using ${this.usedRule!}\n`)
			stringBuilder.push(this.premiseTwo.toString())
		}
		return stringBuilder.join("")
	}

	/**
	 * @returns A string showing each sequent in a tree with multiple lines 
	 */
	getBFSString() : string{
		let stringBuilder : string[] = []
		let queue : ProofTree[] = [this]
		let newqueue  : ProofTree[] = []
		while(queue.length != 0){
			const current = queue.pop()
			stringBuilder.push(current?.sequent.toString()!, "\t\t")
			if(current?.premiseOne !== undefined)newqueue.unshift(current!.premiseOne)
			if(current?.premiseTwo !== undefined)newqueue.unshift(current!.premiseTwo)

			if(queue.length == 0){
				stringBuilder.push("\n")
				queue = newqueue
				newqueue = []
			}
		}
		return stringBuilder.join("")
	}

	get height() : number{
		return 1+Math.max(this.premiseOne?.height ?? 0, this.premiseTwo?.height ?? 0)
	}
}



// For the people who find this: Some truly disgusting old code

/*
solve(sequent : Sequent){
		const ruleChooser = new RuleChooser()
		const stack : Sequent[] = [sequent]
		const proof : Sequent[][] = [[...stack]]
	
		function checkIfDone(seq : Sequent) : Variable | undefined{
			const antecedentVariableNames = seq.antecedent.filter(form => form instanceof Variable).map(form => form.name)
			const succedentVariableNames = seq.succedent.filter(form => form instanceof Variable).map(form => form.name)
			for(const name of antecedentVariableNames)
				if(succedentVariableNames.includes(name))return Variable.create(name)
			return undefined
		}
	
		function step(level : number){
			const nextSequent = stack.pop()! 
			let nextRule : Rule | undefined
			let nextConnectiveFormula = nextSequent.antecedent.find(formula => {
				nextRule = formula.acceptVisitor(ruleChooser)?.left
				return nextRule !== undefined
			}) as Conjunction | Disjunction | Implication | Negation
			if(nextConnectiveFormula === undefined) //antecedent does not have formula we can use, but the succedent might have one
				nextConnectiveFormula = nextSequent.succedent.find(formula => {
					nextRule = formula.acceptVisitor(ruleChooser)?.right
					return nextRule !== undefined
				}) as Conjunction | Disjunction | Implication | Negation
			if(nextConnectiveFormula === undefined){ //succedent also does not have formula we can use, so maybe we are already done
				const axiomVariable = checkIfDone(nextSequent)
				if(axiomVariable !== undefined){ // Found initial axiom
					const initAxiom = new Sequent([axiomVariable], [axiomVariable])
					if(level+1 === proof.length){
						proof.push([initAxiom])
					}else{
						proof[level].push(initAxiom)
					}
					return 
				}
				else throw new Error("Sequent is not valid")
			}else{//either antecedent or succedent has a formula we can use a rule on
				nextRule = nextRule as Rule
				const premises = [...nextRule(nextSequent, nextConnectiveFormula as Conjunction & Disjunction & Negation & Implication)]
				stack.push(...premises)
				if(level+1 === proof.length){
					proof.push(premises)
				}else{
					proof[level].push(...premises)
				}
				premises.forEach(() => step(level+1))
			}
		}
		
		step(0)
		return proof
	}
*/