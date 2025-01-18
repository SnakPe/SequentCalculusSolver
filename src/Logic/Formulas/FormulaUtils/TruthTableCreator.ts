/**
 * Read an assignment [a,b] as "a is being assigned the truth value b"
 */
type Assignment = [VariableText, boolean]
type Interpretation = Assignment[]

/**
 * Calculates the resulting truth values for every possible interpretation
 * 
 * @param formula the formula being used to evaluate interpretations
 * @returns A {@link TruthTable} containig every possible interpretation and the resulting truth values 
 */
function getTruthTable(formula : Formula){
	class TruthTable{
		/* A more efficient way to implement the truth table
		 *  would be to use a Hashmap with a custom comparator function that checks if 2 assignments are equal 
		 */
		private _table : [Interpretation,boolean][] = []
	
		toString(){
			const wholeString : string[] = []
			this._table.forEach(([assignment,result]) => {
				wholeString.push("For ")
				assignment.forEach(([name,value]) => wholeString.push(`${name} \u21A6 ${value}`, ",\t"))
				wholeString.pop()
				wholeString.push(`:\t${result}`,"\n")
			})
			return wholeString.join("")
		}

		getValue(int : Interpretation) : boolean{
			let mapping = this._table.find(([int2,result]) => this.areSameInterpretations(int, int2))
			if(mapping === undefined)
				throw new Error("Can't find the value for this")
			return mapping[1]
		}
		/**
		 * creates a copy of {@link _table | the table} as an array of interpretations and the resulting truth value
		*/
		get table() : [Interpretation,boolean][]{
			return this._table.map(mapping => {
				const [i,v] = mapping
				return [i.slice(), v]
			})
		}
		
		/**
		 * @returns the number of entries in the truth table
		 */
		get length() : number{
			return this._table.length
		}

		/**
		 * Adds a mapping into the table
		 * 
		 * @param mapping a mapping
		 * @returns true if a new entry as been added, else if {@link mapping} is already in the table
		 */
		addMapping(mapping : [Interpretation,boolean]){
			if(!this.has(mapping)){
				this._table.push(mapping)
				return true
			}
			return false
		}

		/**
		 * checks if the interpretation in a mapping is already in the {@link _table}
		 * 
		 * @param map 
		 * @returns true if in tabe, else false
		*/
		private has(mapping : [Interpretation,boolean]){
			for(const [int,result] of this._table){
				if(this.areSameInterpretations(int,mapping[0]))return true
			}
			return false
		}
		/**
		 * Compares 2 interpretations, and checks if both are defined for the same set of variables
		 * and for every variable, if it is being mapped to the same value
		 * 
		 * the order of the mappings/assignments does not matter
		 * 
		 * @param int1 the first interpretation
		 * @param int2 the second interpretation
		 * @returns true if {@link int1} is the same as {@link int2}, else false
		 */
		private areSameInterpretations(int1 : Interpretation, int2 : Interpretation) : boolean{
			return int1.every(([name, value]) => int2.some(([name2, value2]) => name2 === name && value === value2)) && int1.length === int2.length
		}
	
	}

	
	/**
	 * Gets the next selection of truth values for {@link interpretation}.
	 * 
	 * The truth values in {@link interpretation} are treated as an ordered sequence of bits. 
 	 * Conceptually, these truth values are interpreted as bits in a binary number.
 	 *
 	 * Each call to this function increments the "binary number" represented by 
 	 * the truth values, flipping the least significant bit first and carrying 
		* as needed.
		* 
		* @param interpretation 
		* @returns next assignment
	*/
	function getNextInterpretation(interpretation : Interpretation) : Interpretation{
		let carrying = false
		for(let i = interpretation.length-1; i >= 0; i--){
			if(!interpretation[i][1]){
				interpretation[i] = [interpretation[i][0], true]
				return interpretation
			}
			else
			interpretation[i] = [interpretation[i][0], false]
		}
		return interpretation
	}

	const truthValueAssigner = new TruthValueAssigner(new Map())
	const variableCollector = new VariableCollector()
	
	const variables = Array.from(formula.acceptVisitor(variableCollector))
	let interpretation : Interpretation = variables.map((variable) => [variable.name,false])
	const result : TruthTable = new TruthTable()
	truthValueAssigner.assignments = new Map(interpretation)
	do{
		result.addMapping([Array.from(interpretation),formula.acceptVisitor(truthValueAssigner)])
		interpretation = getNextInterpretation(interpretation.slice())
		truthValueAssigner.assignments = new Map(interpretation)
	}while(interpretation.some(([name,value]) => value));
	return result
}


