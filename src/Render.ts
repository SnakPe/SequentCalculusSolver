type Renderer<ElementType extends Element> = {
  renderProof : (proof : ProofTree) => ElementType,
  drawProofSplitBorders : (proofElement : ElementType) => void,
  removeProofSplitBorders : (proofElement : ElementType) => void,
}

const HTMLRenderer : Renderer<HTMLDivElement> = {
  /**
   * Creates a DOM representation of a proof in the sequent calculus.
   * 
   * @param proof A proof containing the sequent to be proven.
   *  If the {@link ProofTree.solve | solver} was not used before calling this function, only shows the one sequent 
   * @returns A div element showing the proof
   */
  renderProof : function(proof : ProofTree){
    const renderSequent = function(seq : Sequent){
      const result = document.createElement("div")
      result.textContent = seq.toString()
      result.classList.add("Sequent")
      return result
    }
    const sequent = renderSequent(proof.sequent)

    const result = document.createElement("div")
    result.classList.add("Proof")

    //premises
    for(const premise of [proof.premiseOne, proof.premiseTwo].filter(p => p !== undefined)){
      const premiseRender = HTMLRenderer.renderProof(premise)
      result.append(premiseRender)
    }

    //conclusion (and user rule)
    const conclusion = document.createElement("div")
    conclusion.classList.add("Conclusion")
    result.append(conclusion)
    conclusion.append(sequent)

    if(proof.usedRule !== undefined){
      const rule = document.createElement("div")
      rule.classList.add("Rule")
      conclusion.append(rule)
      
      const ruleText = document.createElement("span")
      ruleText.textContent = proof.usedRule.proofName
      ruleText.classList.add("Ruletext")
      rule.append(ruleText)

      //give every rule a tooltip
      const tooltip = document.createElement("span")
      tooltip.classList.add("RuleTooltip")
      tooltip.textContent = proof.usedRule.toString()
      rule.append(tooltip)
    }
    return result
  },
  drawProofSplitBorders(proofElement : HTMLDivElement){
		const subproofs = Array.from(proofElement.children).filter(node => node.classList.contains("Proof")) as HTMLDivElement[]
		const randomColor = `hsl(${Math.random()*360}deg 100% 50%)`
		if(subproofs.length == 2) subproofs.forEach((proof) => proof.style.border = `2px solid ${randomColor}`)
		subproofs.forEach(proof => HTMLRenderer.drawProofSplitBorders(proof))
	},
	removeProofSplitBorders(proofElement : HTMLDivElement){
		const subproofs = Array.from(proofElement.children).filter(node => node.classList.contains("Proof")) as HTMLDivElement[]
		subproofs.forEach(proof => {
			proof.style.border = ""
			HTMLRenderer.removeProofSplitBorders(proof)
		})
	}
}

const SVGRenderer : Renderer<SVGElement> = {
  renderProof: function (proof: ProofTree): SVGElement {
    throw new Error("Function not implemented.")
  },
  drawProofSplitBorders: function (proofElement: SVGElement): void {
    throw new Error("Function not implemented.")
  },
  removeProofSplitBorders: function (proofElement: SVGElement): void {
    throw new Error("Function not implemented.")
  }
}
