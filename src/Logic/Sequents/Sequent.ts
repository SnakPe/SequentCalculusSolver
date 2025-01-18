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