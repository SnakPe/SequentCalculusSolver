# A Proof Generator for propositional logic
Ever wanted to draw unweildy, barely readable proofs for propositional formulas? Now You Can! Introducing SCP, which stands for "Sequent Calculus Prover" (We are rivaling APL levels of originality). Some features include 
 - Generating proofs for sequents using proof theory, which in turn can be used to prove formulas.
 - Providing an easy way for users to write down sequents using a state of the art parser (I read a few chapters of Crafting Interpreters by Robert Nystrom, maybe you can tell)
 - A custom build renderer creating beautiful(beauty is in the eye of the beholder) proofs.

---
## Structure of the code
The **src** folder contains all Typescript code, which is then compiled into one file in the **build** folder.
The **Logic** folder contains most relevant code to create and prove sequents and their formulas

### Formulas
The **Formulas** folder contain 3 main files:
 - [Formulas.ts](./src/Logic/Formulas/Formulas.ts): Gives basic classes for all Formula types to create an [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree). 
 - [FormulaVisitor.ts](./src/Logic/Formulas/FormulaVisitor.ts): Supplies a [Visitor](https://en.wikipedia.org/wiki/Visitor_pattern) interface for formulas. Every class in Formula.ts has an acceptVisitor function that allows different operators to be defined for formulas.
 - [FormulaParser.ts](./src/Logic/Formulas/FormulaParser.ts): Provides a **parseFormula** function to create an AST from user input.

There is also a **FormulaUtils** folder with some neccesary tools, like [VariableCollector.ts](./src/Logic/Formulas/FormulaUtils/VariableCollector.ts), that gives back all variables in a formula AST. Most of the stuff in there is just for fun though, and can be ignored. You can still play around with it in the dev tools i guess.
### Sequents

 - [Sequent.ts](./src/Logic/Sequents/Sequent.ts): Provides the basic sequent class, containing the ante- and succedent.
 - [SequentRules.ts](./src/Logic/Sequents/SequentRules.ts): Defines the inference rules of the sequent calculus. Structural rules are saved in the **structuralRules** object. The propositional rules, as well as general subalgorithms or helper functions used to prove a sequent, are saved in the **proveHelper** object.
 - [SequentSolver.ts](./src/Logic/Sequents/SequentSolver.ts): Using the rules and helper functions in SequentRules.ts, creates a proof of a sequent. To save the entire proof, the **ProofTree** class is used. The **solve** function can then be used to generate the proof inside the premise members.
 - [SequentParser.ts](./src/Logic/Sequents/SequentParser.ts): Provides a **parseSequent** function to create a sequent from user input.
---
## How to use
1. Open [index.html](./index.html) in a browser.
2. Type in the sequent you want to prove in the input box
3. Press **Enter**, or click on the **Prove** button
4. ...
5. Profit


---
## Theoretical stuff

The sequent calculus used to prove sequents is based on [Chapter 1 - An Introduction to Proof Theory](https://doi.org/10.1016/S0049-237X(98)80016-5) of Samuel R. Buss's book *Handbook of Proof Theory*.

The proof algorithm is also roughly based on the completeness proof found in the pages 14-15. 
 1. We first try to **break up connective formulas** using the propositional rules.We move the next possible connective using the **exchange rules**. Then, depending on which connective we found, and in which cedent it is, we use the corresponding **propositional rule** to remove the connective.
 2. After all connectives have been broken up, we can only have **variables**. We try to find the same variable in the antecedent and the succedent. We move them both close to the sequent arrow ⇒ using the **exchange rules**, and then remove all other variables using the **weakening rules** 

## TODOs
 - Add functionality to the explanation buttons on the bottom right of the web page
 - Make the proof algorithm more efficient
	- Try to already find initial axioms before breaking up all connectives
	- (Also try th find the same formula in both cedents, since that should also guarentees provability. This might be too inefficiont in most cases though, and could make the algorithm slower)  
 - Create a second layer of tooltips showing the formal definition of a rule