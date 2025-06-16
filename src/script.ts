/*

Initializer for the webpage 
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

const SUPER_SECRET_PLAYGROUND = {
	/**
	 * Creates a bunch of negated variables in both the ante- and succedent,
	 * mainly to test proofs with large heights.
	 */
	theColumn(variableAmount : number){
		
		const antecedent = []
		const succedent = []
		for(let i = 1; i <= variableAmount; i++){
			const negation = new Negation(Variable.create(i.toString()))
			antecedent.push(negation)
			succedent.unshift(negation)
		}
		const sequentProof = new ProofTree(new Sequent(antecedent, succedent))
		sequentProof.solve()
	
		document.getElementById("ProofRender")!.innerHTML = ""
		document.getElementById("ProofRender")!.appendChild(HTMLRenderer.renderProof(sequentProof))
		return sequentProof
	},
	/**
	 * Creates wide proofs using conjunctions in the succedent 
	 * Warninig: This function creates huge proofs with only a small value in {@link conjunctionAmount}
	 * I would not recommend going above 10 
	 * 
	 * @param variableAmount 
	 */
	theChunkyOne(conjunctionAmount : number){
		const antecedent = [Variable.create("A"), Variable.create("B")]
		const succedent = []
		for(;conjunctionAmount > 0; conjunctionAmount--)
			succedent.unshift(new Conjunction(antecedent[0], antecedent[1]))
		const sequentProof = new ProofTree(new Sequent(antecedent, succedent))
		sequentProof.solve()
	
		document.getElementById("ProofRender")!.innerHTML = ""
		document.getElementById("ProofRender")!.appendChild(HTMLRenderer.renderProof(sequentProof))
		return sequentProof
	}

}
/**
 * Takes the users input of his sequent, parses it, and shows the resulting proof tree 
 * 
 * Does nothing if the input sequent has wrong syntax, of if it isn't solvable
 * 
 * @param inputElement The input DOM element that contains the formula
 * @param outputElement The DOM element where the proof tree should be printed out
 */
function handleSequentInput(inputElement : HTMLElement, outputElement : HTMLElement){
	//parse 
	const input = (inputElement as HTMLInputElement).value.replaceAll(" ","")

	let sequentProof : ProofTree
	try {
		sequentProof = new ProofTree(parseSequent(input))
		sequentProof.solve()
	} catch(e){
		alert(e)
		return
	}
	outputElement.innerHTML = ""
	outputElement.appendChild(HTMLRenderer.renderProof(sequentProof))
}

/**
 * Draws a border around proofs and subproofs when they split the previous sequent in two
 * 
 * @param bordersAreDrawn Decides if we want to add the borders, or want to remove them if they already exist 
 * @param proofElement The first element of the Proof class
 */

function handleProofBorderDraw(proofElement : HTMLDivElement, bordersAreDrawn : boolean){
	if(bordersAreDrawn) HTMLRenderer.removeProofSplitBorders(proofElement)
	else HTMLRenderer.drawProofSplitBorders(proofElement) 
}

onload = () => {
	const sequentInput = document.getElementById("SequentInput")!
	const sequentInputButton = document.getElementById("SequentInputButton")!
	const proofRender = document.getElementById("ProofRender")!
	const proofBorderDrawButton = document.getElementById("ProofBorderDrawButton")!

	let proofBorderDrawn = false 

	sequentInputButton.addEventListener("click",(ev) => {
		proofBorderDrawn = false
		handleSequentInput(sequentInput, proofRender)
	})
	sequentInput.addEventListener("keypress",(ev) => {
		if(ev.key === "Enter"){
			proofBorderDrawn = false
			handleSequentInput(sequentInput, proofRender)
		}
	})
	
	proofBorderDrawButton.addEventListener("click", (ev) => {
		if(proofRender.children.length != 1)return
		handleProofBorderDraw(proofRender.children[0] as HTMLDivElement, proofBorderDrawn)
		proofBorderDrawn = !proofBorderDrawn
	})

}