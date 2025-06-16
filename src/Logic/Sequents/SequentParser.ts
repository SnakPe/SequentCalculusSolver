/*

Parser for sequents
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