/*

lol
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

const connectives = ["Implication", "Conjunction", "Disjunction", "Negation", "Variable", "Truth", "Falsity"] as const
type Connective = typeof connectives[number]

/**
 * Prints the name of the specific class of the formula used.
 * this class is used when I'm to lazy to implement a better way to deal with different formula types
 * 
 * usually, one can prevent using this by implementing another visitor though, which is also more type safe
 */
class ConnectivePrinter implements FormulaVisitor<Connective>{
	visitImplication(formula: Implication): Connective {
		return "Implication"
	}
	visitConjunction(formula: Conjunction): Connective {
		return "Conjunction"
	}
	visitDisjunction(formula: Disjunction): Connective {
		return "Disjunction"
	}
	visitNegation(formula: Negation): Connective {
		return "Negation"
	}
	visitVariable(formula: Variable): Connective {
		return "Variable"
	}
	visitTruth(formula: Truth): Connective {
		return "Truth"
	}
	visitFalsity(formula: Falsity): Connective {
		return "Falsity"
	}
}