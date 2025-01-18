
/**
 * Takes the user input from the web page, and tries to return a sequent if input is valid
 * @param sequent The user input
 * @returns A {@link Sequent} if user input is a valid sequent
 * @throws An error if the input is not syntactically correct
 */
function parseSequent(sequent : string){
  const cedents = sequent.split("=>")
	if(cedents.length !== 2)
		throw new Error("Sequent must have exacly one sequent arrow, but found "+ (cedents.length-1))
	const [antecedentFormulaStrings,succedentFormulaStrings] = cedents.map(cedent => cedent.split(","))
  return new Sequent(
    antecedentFormulaStrings.filter(formulaString => formulaString.trim() !== "").map(formulaString => parseFormula(formulaString)),
    succedentFormulaStrings.filter(formulaString => formulaString.trim() !== "").map(formulaString => parseFormula(formulaString)).reverse(), //the succedent is filpped
  )
}