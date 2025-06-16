/*

Sequents
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

class Sequent{
    /**
     * the most outside formula here is at index 0 
     */
    antecedent : readonly Formula[] 
    /**
     * the most outside formula here is at index 0. The succedent is flipped
     */
    succedent : readonly Formula[]

    constructor(antecedent : Formula[] = [], succedent : Formula[] = []){
        this.antecedent = antecedent
        this.succedent = succedent
    }

    
    toString() : string{
        const stringParts : string[] = []
        const formulaPrinter = new FormulaPrinter()

        this.antecedent.forEach(formula => {
            stringParts.push(formula.acceptVisitor(formulaPrinter), ", ")
        })
        stringParts.pop()
        
        if(this.antecedent.length !== 0)stringParts.push(" ")
        stringParts.push("\u21D2")
        if(this.succedent.length !== 0){
            stringParts.push(" ")    
            for(let i = this.succedent.length-1; i >= 0; i--){
                stringParts.push(this.succedent[i].acceptVisitor(formulaPrinter), ", ")
            }
            stringParts.pop()
        }

        return stringParts.join("")
    }   
}