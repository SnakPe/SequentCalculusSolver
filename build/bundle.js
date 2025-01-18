"use strict";
const HTMLRenderer = {
    renderProof: function (proof) {
        const renderSequent = function (seq) {
            const result = document.createElement("div");
            result.textContent = seq.toString();
            result.classList.add("Sequent");
            return result;
        };
        const sequent = renderSequent(proof.sequent);
        const result = document.createElement("div");
        result.classList.add("Proof");
        for (const premise of [proof.premiseOne, proof.premiseTwo].filter(p => p !== undefined)) {
            const premiseRender = HTMLRenderer.renderProof(premise);
            result.append(premiseRender);
        }
        const conclusion = document.createElement("div");
        conclusion.classList.add("Conclusion");
        result.append(conclusion);
        conclusion.append(sequent);
        if (proof.usedRule !== undefined) {
            const rule = document.createElement("div");
            rule.classList.add("Rule");
            conclusion.append(rule);
            const ruleText = document.createElement("span");
            ruleText.textContent = proof.usedRule.proofName;
            ruleText.classList.add("Ruletext");
            rule.append(ruleText);
            const tooltip = document.createElement("span");
            tooltip.classList.add("RuleTooltip");
            tooltip.textContent = proof.usedRule.toString();
            rule.append(tooltip);
        }
        return result;
    },
    drawProofSplitBorders(proofElement) {
        const subproofs = Array.from(proofElement.children).filter(node => node.classList.contains("Proof"));
        const randomColor = `hsl(${Math.random() * 360}deg 100% 50%)`;
        if (subproofs.length == 2)
            subproofs.forEach((proof) => proof.style.border = `2px solid ${randomColor}`);
        subproofs.forEach(proof => HTMLRenderer.drawProofSplitBorders(proof));
    },
    removeProofSplitBorders(proofElement) {
        const subproofs = Array.from(proofElement.children).filter(node => node.classList.contains("Proof"));
        subproofs.forEach(proof => {
            proof.style.border = "";
            HTMLRenderer.removeProofSplitBorders(proof);
        });
    }
};
const SVGRenderer = {
    renderProof: function (proof) {
        throw new Error("Function not implemented.");
    },
    drawProofSplitBorders: function (proofElement) {
        throw new Error("Function not implemented.");
    },
    removeProofSplitBorders: function (proofElement) {
        throw new Error("Function not implemented.");
    }
};
const SUPER_SECRET_PLAYGROUND = {
    theColumn(variableAmount) {
        const antecedent = [];
        const succedent = [];
        for (let i = 1; i <= variableAmount; i++) {
            const negation = new Negation(Variable.create(i.toString()));
            antecedent.push(negation);
            succedent.unshift(negation);
        }
        const sequentProof = new ProofTree(new Sequent(antecedent, succedent));
        sequentProof.solve();
        document.getElementById("ProofRender").innerHTML = "";
        document.getElementById("ProofRender").appendChild(HTMLRenderer.renderProof(sequentProof));
        return sequentProof;
    },
    theChunkyOne(conjunctionAmount) {
        const antecedent = [Variable.create("A"), Variable.create("B")];
        const succedent = [];
        for (; conjunctionAmount > 0; conjunctionAmount--)
            succedent.unshift(new Conjunction(antecedent[0], antecedent[1]));
        const sequentProof = new ProofTree(new Sequent(antecedent, succedent));
        sequentProof.solve();
        document.getElementById("ProofRender").innerHTML = "";
        document.getElementById("ProofRender").appendChild(HTMLRenderer.renderProof(sequentProof));
        return sequentProof;
    }
};
function handleSequentInput(inputElement, outputElement) {
    const input = inputElement.value.replaceAll(" ", "");
    let sequentProof;
    try {
        sequentProof = new ProofTree(parseSequent(input));
        sequentProof.solve();
    }
    catch (e) {
        alert(e);
        return;
    }
    outputElement.innerHTML = "";
    outputElement.appendChild(HTMLRenderer.renderProof(sequentProof));
}
function handleProofBorderDraw(proofElement, bordersAreDrawn) {
    if (bordersAreDrawn)
        HTMLRenderer.removeProofSplitBorders(proofElement);
    else
        HTMLRenderer.drawProofSplitBorders(proofElement);
}
onload = () => {
    const sequentInput = document.getElementById("SequentInput");
    const sequentInputButton = document.getElementById("SequentInputButton");
    const proofRender = document.getElementById("ProofRender");
    const proofBorderDrawButton = document.getElementById("ProofBorderDrawButton");
    let proofBorderDrawn = false;
    sequentInputButton.addEventListener("click", (ev) => {
        proofBorderDrawn = false;
        handleSequentInput(sequentInput, proofRender);
    });
    sequentInput.addEventListener("keypress", (ev) => {
        if (ev.key === "Enter") {
            proofBorderDrawn = false;
            handleSequentInput(sequentInput, proofRender);
        }
    });
    proofBorderDrawButton.addEventListener("click", (ev) => {
        if (proofRender.children.length != 1)
            return;
        handleProofBorderDraw(proofRender.children[0], proofBorderDrawn);
        proofBorderDrawn = !proofBorderDrawn;
    });
};
var NonVariableToken;
(function (NonVariableToken) {
    NonVariableToken["LeftParen"] = "(";
    NonVariableToken["RightParen"] = ")";
    NonVariableToken["Ampersand"] = "&";
    NonVariableToken["Line"] = "|";
    NonVariableToken["Minus"] = "-";
    NonVariableToken["Arrow"] = "->";
    NonVariableToken["Truth"] = "T";
    NonVariableToken["Falsity"] = "F";
})(NonVariableToken || (NonVariableToken = {}));
function parseFormula(formulaText) {
    function scan(formulaText) {
        let tokens = [];
        let formula = "";
        let currentCharIndex = 0;
        function atEnd() {
            return currentCharIndex >= formula.length;
        }
        function advance() {
            return formula[currentCharIndex++];
        }
        function peek() {
            return atEnd() ? '\0' : formula[currentCharIndex];
        }
        function variable() {
            let varName = "";
            while (!atEnd() && isVariableText(peek()))
                varName += advance();
            return varName;
        }
        tokens = [];
        formula = formulaText;
        currentCharIndex = 0;
        while (!atEnd()) {
            let char;
            switch (char = advance()) {
                case " ":
                case "\t":
                    break;
                case "(":
                    tokens.push(NonVariableToken.LeftParen);
                    break;
                case ")":
                    tokens.push(NonVariableToken.RightParen);
                    break;
                case "-":
                    if (peek() == ">") {
                        tokens.push(NonVariableToken.Arrow);
                        advance();
                    }
                    else
                        tokens.push(NonVariableToken.Minus);
                    break;
                case "&":
                    tokens.push(NonVariableToken.Ampersand);
                    break;
                case "|":
                    tokens.push(NonVariableToken.Line);
                    break;
                case "T":
                    if (!isVariableText(peek()))
                        tokens.push(NonVariableToken.Truth);
                    else
                        tokens.push("" + char + variable());
                    break;
                case "F":
                    if (!isVariableText(peek()))
                        tokens.push(NonVariableToken.Falsity);
                    else
                        tokens.push("" + char + variable());
                    break;
                default:
                    if (isVariableText(char))
                        tokens.push("" + char + variable());
                    else
                        throw new Error("Found unexpected character '" + char + "' in formula " + formulaText);
            }
        }
        return tokens;
    }
    const parse = function (tokens) {
        let currentTokenIndex = 0;
        const formula = () => implication();
        function implication() {
            let left = disjunction();
            while (match(NonVariableToken.Arrow)) {
                const right = disjunction();
                left = new Implication(left, right);
            }
            return left;
        }
        function disjunction() {
            let left = conjunction();
            while (match(NonVariableToken.Line)) {
                const right = conjunction();
                left = new Disjunction(left, right);
            }
            return left;
        }
        function conjunction() {
            let left = negation();
            while (match(NonVariableToken.Ampersand)) {
                const right = negation();
                left = new Conjunction(left, right);
            }
            return left;
        }
        function negation() {
            if (match(NonVariableToken.Minus))
                return new Negation(negation());
            return primary();
        }
        function primary() {
            let primary;
            if (match(NonVariableToken.Truth))
                return Truth.create();
            if (match(NonVariableToken.Falsity))
                return Falsity.create();
            if (match(NonVariableToken.LeftParen)) {
                primary = formula();
                if (!match(NonVariableToken.RightParen))
                    throw new Error("An expression in brackets was not closed");
            }
            else if (isVariableText(peek())) {
                let name = advance();
                return Variable.create(name);
            }
            else
                throw new Error("Expexted Expression, instead got '" + peek() + "'");
            return primary;
        }
        const atEnd = () => currentTokenIndex >= tokens.length;
        function advance() {
            if (!atEnd())
                return tokens[currentTokenIndex++];
            throw new Error("Can't advance: Already at end");
        }
        function match(token) {
            Set;
            if (atEnd() || peek() !== token)
                return false;
            advance();
            return true;
        }
        const peek = () => tokens[currentTokenIndex];
        currentTokenIndex = 0;
        const formulaAST = formula();
        if (!atEnd())
            console.error("Couldn't parse the entire expression, only '" + formulaAST.acceptVisitor(new FormulaPrinter()) + "'");
        return formulaAST;
    };
    return parse(scan(formulaText));
}
class Formula {
}
class Implication extends Formula {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    acceptVisitor(visitor) {
        return visitor.visitImplication(this);
    }
}
class Conjunction extends Formula {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    acceptVisitor(visitor) {
        return visitor.visitConjunction(this);
    }
}
class Disjunction extends Formula {
    constructor(left, right) {
        super();
        this.left = left;
        this.right = right;
    }
    acceptVisitor(visitor) {
        return visitor.visitDisjunction(this);
    }
}
class Negation extends Formula {
    constructor(formula) {
        super();
        this.formula = formula;
    }
    acceptVisitor(visitor) {
        return visitor.visitNegation(this);
    }
}
function isVariableText(thing) {
    function isLetter(char) {
        const charCode = char.charCodeAt(0);
        return (65 <= charCode && charCode <= 90) ||
            (97 <= charCode && charCode <= 122);
    }
    function isNumber(char) {
        const charCode = char.charCodeAt(0);
        return 48 <= charCode && charCode <= 57;
    }
    function isAlphanumeric(char) {
        return isLetter(char) || isNumber(char);
    }
    if (typeof thing !== "string")
        return false;
    for (let i = 0; i < thing.length; i++)
        if (!isAlphanumeric(thing.charAt(i)))
            return false;
    return true;
}
const alreadyUsedVariables = new Map();
class Variable extends Formula {
    constructor(name) {
        super();
        this.name = name;
    }
    static create(name) {
        if (alreadyUsedVariables.has(name))
            return alreadyUsedVariables.get(name);
        const newVariable = new Variable(name);
        alreadyUsedVariables.set(name, newVariable);
        return newVariable;
    }
    acceptVisitor(visitor) {
        return visitor.visitVariable(this);
    }
}
class Truth extends Formula {
    constructor() {
        super();
    }
    static create() {
        if (Truth.instance === undefined)
            return Truth.instance = new Truth();
        return Truth.instance;
    }
    acceptVisitor(visitor) {
        return visitor.visitTruth(this);
    }
}
class Falsity extends Formula {
    constructor() {
        super();
    }
    static create() {
        if (Falsity.instance === undefined)
            return Falsity.instance = new Falsity();
        return Falsity.instance;
    }
    acceptVisitor(visitor) {
        return visitor.visitFalsity(this);
    }
}
class ASTPrinter {
    group(op, ...formulas) {
        const grouping = ["(", op];
        for (const formula of formulas) {
            grouping.push(" ", formula.acceptVisitor(this));
        }
        grouping.push(")");
        return grouping.join("");
    }
    visitImplication(formula) {
        return this.group("\u2192", formula.left, formula.right);
    }
    visitConjunction(formula) {
        return this.group("\u2227", formula.left, formula.right);
    }
    visitDisjunction(formula) {
        return this.group("\u2228", formula.left, formula.right);
    }
    visitNegation(formula) {
        return this.group("\u00AC", formula.formula);
    }
    visitVariable(formula) {
        return formula.name;
    }
    visitTruth(formula) {
        return "\u22A4";
    }
    visitFalsity(formula) {
        return "\u22A5";
    }
}
const connectives = ["Implication", "Conjunction", "Disjunction", "Negation", "Variable", "Truth", "Falsity"];
class ConnectivePrinter {
    visitImplication(formula) {
        return "Implication";
    }
    visitConjunction(formula) {
        return "Conjunction";
    }
    visitDisjunction(formula) {
        return "Disjunction";
    }
    visitNegation(formula) {
        return "Negation";
    }
    visitVariable(formula) {
        return "Variable";
    }
    visitTruth(formula) {
        return "Truth";
    }
    visitFalsity(formula) {
        return "Falsity";
    }
}
class CopyCreator {
    constructor() {
        this.visitImplication = (formula) => new Implication(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
        this.visitConjunction = (formula) => new Conjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
        this.visitDisjunction = (formula) => new Disjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
        this.visitNegation = (formula) => new Negation(formula.formula.acceptVisitor(this));
        this.identity = (formula) => formula;
        this.visitVariable = this.identity;
        this.visitTruth = this.identity;
        this.visitFalsity = this.identity;
    }
}
class FormulaPrinter {
    constructor() {
        this.conjunctiveCollector = class {
            constructor() {
                this.visitImplication = FormulaPrinter.prototype.identity;
                this.visitConjunction = (formula) => formula.left.acceptVisitor(this).concat(formula.right.acceptVisitor(this));
                this.visitDisjunction = FormulaPrinter.prototype.identity;
                this.visitNegation = FormulaPrinter.prototype.identity;
                this.visitVariable = FormulaPrinter.prototype.identity;
                this.visitTruth = FormulaPrinter.prototype.identity;
                this.visitFalsity = FormulaPrinter.prototype.identity;
            }
        };
        this.disjunctiveCollector = class {
            constructor() {
                this.visitImplication = FormulaPrinter.prototype.identity;
                this.visitConjunction = FormulaPrinter.prototype.identity;
                this.visitDisjunction = (formula) => formula.left.acceptVisitor(this).concat(formula.right.acceptVisitor(this));
                this.visitNegation = FormulaPrinter.prototype.identity;
                this.visitVariable = FormulaPrinter.prototype.identity;
                this.visitTruth = FormulaPrinter.prototype.identity;
                this.visitFalsity = FormulaPrinter.prototype.identity;
            }
        };
    }
    group(op, ...formulas) {
        const grouping = ["("];
        if (formulas.length != 1) {
            for (const formula of formulas) {
                grouping.push(formula.acceptVisitor(this), " ", op, " ");
            }
            grouping.pop();
            grouping.pop();
            grouping.pop();
        }
        else
            grouping.push(op, formulas[0].acceptVisitor(this));
        grouping.push(")");
        return grouping.join("");
    }
    visitImplication(formula) {
        return this.group("\u2192", formula.left, formula.right);
    }
    visitConjunction(formula) {
        return this.group("\u2227", ...formula.acceptVisitor(new this.conjunctiveCollector()));
    }
    visitDisjunction(formula) {
        return this.group("\u2228", ...formula.acceptVisitor(new this.disjunctiveCollector()));
    }
    visitNegation(formula) {
        return "\u00AC" + formula.formula.acceptVisitor(this);
    }
    visitVariable(formula) {
        return formula.name;
    }
    visitTruth(formula) {
        return "\u22A4";
    }
    visitFalsity(formula) {
        return "\u22A5";
    }
    identity(formula) {
        return [formula];
    }
}
function getTruthTable(formula) {
    class TruthTable {
        constructor() {
            this._table = [];
        }
        toString() {
            const wholeString = [];
            this._table.forEach(([assignment, result]) => {
                wholeString.push("For ");
                assignment.forEach(([name, value]) => wholeString.push(`${name} \u21A6 ${value}`, ",\t"));
                wholeString.pop();
                wholeString.push(`:\t${result}`, "\n");
            });
            return wholeString.join("");
        }
        getValue(int) {
            let mapping = this._table.find(([int2, result]) => this.areSameInterpretations(int, int2));
            if (mapping === undefined)
                throw new Error("Can't find the value for this");
            return mapping[1];
        }
        get table() {
            return this._table.map(mapping => {
                const [i, v] = mapping;
                return [i.slice(), v];
            });
        }
        get length() {
            return this._table.length;
        }
        addMapping(mapping) {
            if (!this.has(mapping)) {
                this._table.push(mapping);
                return true;
            }
            return false;
        }
        has(mapping) {
            for (const [int, result] of this._table) {
                if (this.areSameInterpretations(int, mapping[0]))
                    return true;
            }
            return false;
        }
        areSameInterpretations(int1, int2) {
            return int1.every(([name, value]) => int2.some(([name2, value2]) => name2 === name && value === value2)) && int1.length === int2.length;
        }
    }
    function getNextInterpretation(interpretation) {
        let carrying = false;
        for (let i = interpretation.length - 1; i >= 0; i--) {
            if (!interpretation[i][1]) {
                interpretation[i] = [interpretation[i][0], true];
                return interpretation;
            }
            else
                interpretation[i] = [interpretation[i][0], false];
        }
        return interpretation;
    }
    const truthValueAssigner = new TruthValueAssigner(new Map());
    const variableCollector = new VariableCollector();
    const variables = Array.from(formula.acceptVisitor(variableCollector));
    let interpretation = variables.map((variable) => [variable.name, false]);
    const result = new TruthTable();
    truthValueAssigner.assignments = new Map(interpretation);
    do {
        result.addMapping([Array.from(interpretation), formula.acceptVisitor(truthValueAssigner)]);
        interpretation = getNextInterpretation(interpretation.slice());
        truthValueAssigner.assignments = new Map(interpretation);
    } while (interpretation.some(([name, value]) => value));
    return result;
}
class TruthValueAssigner {
    constructor(assignments) {
        this.assignments = assignments;
        this.visitTruth = (formula) => true;
        this.visitFalsity = (formula) => false;
    }
    visitImplication(formula) {
        return !formula.left.acceptVisitor(this) || formula.right.acceptVisitor(this);
    }
    visitConjunction(formula) {
        return formula.left.acceptVisitor(this) && formula.right.acceptVisitor(this);
    }
    visitDisjunction(formula) {
        return formula.left.acceptVisitor(this) || formula.right.acceptVisitor(this);
    }
    visitNegation(formula) {
        return !formula.formula.acceptVisitor(this);
    }
    visitVariable(formula) {
        let value = this.assignments.get(formula.name);
        if (value === undefined)
            throw new Error("Found variable " + formula.name + " that has no assignment");
        return value;
    }
}
class VariableCollector {
    constructor() {
        this.visitImplication = this.visitBinary;
        this.visitConjunction = this.visitBinary;
        this.visitDisjunction = this.visitBinary;
        this.visitVariable = (formula) => new Set([formula]);
        this.empty = (formula) => new Set([]);
        this.visitTruth = this.empty;
        this.visitFalsity = this.empty;
    }
    visitBinary(formula) {
        const left = formula.left.acceptVisitor(this);
        const right = formula.right.acceptVisitor(this);
        for (const variable of right.values())
            left.add(variable);
        return left;
    }
    visitNegation(formula) {
        return formula.formula.acceptVisitor(this);
    }
}
class ImplicationRemover {
    constructor() {
        this.visitImplication = (formula) => new Disjunction(new Negation(formula.left.acceptVisitor(this)), formula.right.acceptVisitor(this));
        this.visitConjunction = (formula) => new Conjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
        this.visitDisjunction = (formula) => new Disjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
        this.visitNegation = (formula) => new Negation(formula.formula.acceptVisitor(this));
        this.visitVariable = (formula) => Variable.create(formula.name);
        this.visitFalsity = (formula) => formula;
        this.visitTruth = (formula) => formula;
    }
}
const DNFConverterStrategies = {
    syntactic: class SyntacticStrategy {
        convert(formula) {
            class DisjunctiveNormalFormConverterVisitor {
                visitImplication(formula) {
                    throw new Error("Formula should not have implications anymore");
                }
                visitConjunction(formula) {
                    const prefixedRight = formula.right.acceptVisitor(this);
                    const prefixedLeft = formula.left.acceptVisitor(this);
                    if (prefixedRight instanceof Disjunction) {
                        const x = prefixedLeft;
                        const y = prefixedRight.left;
                        const z = prefixedRight.right;
                        return new Disjunction(new Conjunction(x, y).acceptVisitor(this), new Conjunction(x, z).acceptVisitor(this));
                    }
                    if (prefixedLeft instanceof Disjunction) {
                        const x = prefixedLeft.left;
                        const y = prefixedLeft.right;
                        const z = prefixedRight;
                        return new Disjunction(new Conjunction(x, z).acceptVisitor(this), new Conjunction(y, z).acceptVisitor(this));
                    }
                    return new Conjunction(prefixedLeft, prefixedRight);
                }
                visitDisjunction(formula) {
                    return new Disjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
                }
                visitNegation(formula) {
                    const prefixed = formula.formula.acceptVisitor(this);
                    if (prefixed instanceof Negation)
                        return prefixed.formula.acceptVisitor(this);
                    if (prefixed instanceof Disjunction)
                        return new Conjunction(new Negation(prefixed.left).acceptVisitor(this), new Negation(prefixed.right).acceptVisitor(this));
                    if (prefixed instanceof Conjunction)
                        return new Disjunction(new Negation(prefixed.left), new Negation(prefixed.right)).acceptVisitor(this);
                    return new Negation(prefixed);
                }
                visitVariable(formula) {
                    return Variable.create(formula.name);
                }
                visitTruth(formula) {
                    throw new Error("Formula has Truth symbol, which is not allowed for the NNF form");
                }
                visitFalsity(formula) {
                    throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form");
                }
            }
            return formula.acceptVisitor(new DisjunctiveNormalFormConverterVisitor);
        }
    },
    semantic: class SemanticStrategy {
        convert(formula) {
            const truthTable = getTruthTable(formula);
            function getClauseFromInterpretation(interpretation) {
                function getLiteralFromAssignment([text, assignedValue]) {
                    const variable = Variable.create(text);
                    return assignedValue ? variable : new Negation(variable);
                }
                if (interpretation.length == 1)
                    return getLiteralFromAssignment(interpretation[0]);
                let clause = new Conjunction(getLiteralFromAssignment(interpretation[0]), getLiteralFromAssignment(interpretation[1]));
                for (const assignment of interpretation.slice(2, interpretation.length))
                    clause = new Conjunction(clause, getLiteralFromAssignment(assignment));
                return clause;
            }
            if (truthTable.length <= 1) {
                return truthTable.getValue([]) ? Truth.create() : Falsity.create();
            }
            const validInterpretations = truthTable.table.filter(([_, value]) => value).map(([interpretation, _]) => interpretation);
            if (validInterpretations.length == 1)
                return getClauseFromInterpretation(validInterpretations[0]);
            let convertedFormula = new Disjunction(getClauseFromInterpretation(validInterpretations[0]), getClauseFromInterpretation(validInterpretations[1]));
            for (const interpretation of validInterpretations.slice(2))
                convertedFormula = new Disjunction(convertedFormula, getClauseFromInterpretation(interpretation));
            return convertedFormula;
        }
    }
};
const CNFConverterStrategies = {
    syntactic: class SyntacticStrategy {
        convert(formula) {
            const negatedDNF = new NormalFormConverter(new Negation(formula), new DNFConverterStrategies.syntactic).getConvertedFormula();
            const implicationError = new Error("Formula should not have implications anymore");
            class Step2Visitor {
                visitImplication(formula) {
                    throw implicationError;
                }
                visitConjunction(formula) {
                    const getNextFormula = (childFormula) => {
                        if (childFormula instanceof Negation)
                            return childFormula.formula;
                        if (childFormula instanceof Variable)
                            return new Negation(childFormula);
                        else
                            return childFormula.acceptVisitor(this);
                    };
                    return new Disjunction(getNextFormula(formula.left), getNextFormula(formula.right));
                }
                visitDisjunction(formula) {
                    return new Conjunction(formula.left.acceptVisitor(this), formula.right.acceptVisitor(this));
                }
                visitNegation(formula) {
                    return new Negation(formula.formula);
                }
                visitVariable(formula) {
                    throw formula;
                }
                visitTruth(formula) {
                    throw new Error("Formula has Truth symbol, which is not allowed for the CNF form");
                }
                visitFalsity(formula) {
                    throw new Error("Formula has Falsity symbol, which is not allowed for the CNF form");
                }
            }
            return negatedDNF.acceptVisitor(new Step2Visitor());
        }
    },
    semantic: class SemanticStrategy {
        convert(formula) {
            const truthTable = getTruthTable(formula);
            function getClauseFromInterpretation(interpretation) {
                function getLiteralFromAssignment([text, assignedValue]) {
                    const variable = Variable.create(text);
                    return assignedValue ? new Negation(variable) : variable;
                }
                const nextLiteral = getLiteralFromAssignment(interpretation.pop());
                if (interpretation.length === 0)
                    return nextLiteral;
                return new Disjunction(nextLiteral, getClauseFromInterpretation(interpretation));
            }
            if (truthTable.length == 0)
                return truthTable.getValue([]) ? Truth.create() : Falsity.create();
            const invalidInterpretations = truthTable.table.filter(([_, value]) => !value).map(([interpretation, _]) => interpretation);
            if (invalidInterpretations.length === 1)
                return getClauseFromInterpretation(invalidInterpretations[0]);
            let convertedFormula = new Conjunction(getClauseFromInterpretation(invalidInterpretations[0]), getClauseFromInterpretation(invalidInterpretations[1]));
            for (const interpretation of invalidInterpretations.slice(2))
                convertedFormula = new Conjunction(convertedFormula, getClauseFromInterpretation(interpretation));
            return convertedFormula;
        }
    }
};
const NNFConverterStrategies = {
    syntactic: class SyntacticStrategy {
        convert(formula) {
            class NegationNormalFormConverterVisitor {
                constructor() {
                    this.afterNegationVisitor = new AfterNegationVisitor(this);
                }
                visitImplication(formula) {
                    throw new Error("Formula has implication, even though they should be removed");
                }
                visitConjunction(formula) {
                    return new Conjunction(formula.left, formula.right);
                }
                visitDisjunction(formula) {
                    return new Disjunction(formula.left, formula.right);
                }
                visitNegation(formula) {
                    return formula.formula.acceptVisitor(this.afterNegationVisitor);
                }
                visitVariable(formula) {
                    return Variable.create(formula.name);
                }
                visitTruth(formula) {
                    throw new Error("Formula has Truth symbol, which is not allowed for the NNF form");
                }
                visitFalsity(formula) {
                    throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form");
                }
            }
            class AfterNegationVisitor {
                constructor(nnfConverterVisitor) {
                    this.nnfConverterVisitor = nnfConverterVisitor;
                }
                visitImplication(formula) {
                    throw new Error("Formula has implication, even though they should be removed");
                }
                visitConjunction(formula) {
                    return new Disjunction(new Negation(formula.left).acceptVisitor(this.nnfConverterVisitor), new Negation(formula.right).acceptVisitor(this.nnfConverterVisitor));
                }
                visitDisjunction(formula) {
                    return new Conjunction(new Negation(formula.left).acceptVisitor(this.nnfConverterVisitor), new Negation(formula.right).acceptVisitor(this.nnfConverterVisitor));
                }
                visitNegation(formula) {
                    return formula.formula.acceptVisitor(this.nnfConverterVisitor);
                }
                visitVariable(formula) {
                    return new Negation(formula.acceptVisitor(this.nnfConverterVisitor));
                }
                visitTruth(formula) {
                    throw new Error("Formula has Truth symbol, which is not allowed for the NNF form");
                }
                visitFalsity(formula) {
                    throw new Error("Formula has Falsity symbol, which is not allowed for the NNF form");
                }
            }
            return formula.acceptVisitor(new NegationNormalFormConverterVisitor());
        }
    }
};
class NormalFormConverter {
    constructor(formula, strategy = new DNFConverterStrategies.syntactic) {
        this.strategy = strategy;
        this.withoutImplications = formula.acceptVisitor(new ImplicationRemover());
    }
    set formula(formula) {
        this.withoutImplications = formula.acceptVisitor(new ImplicationRemover());
    }
    getConvertedFormula() {
        return this.strategy.convert(this.withoutImplications);
    }
}
class Sequent {
    constructor(antecedent = [], succedent = []) {
        this.antecedent = antecedent;
        this.succedent = succedent;
    }
    toString() {
        const stringParts = [];
        const formulaPrinter = new FormulaPrinter();
        this.antecedent.forEach(formula => {
            stringParts.push(formula.acceptVisitor(formulaPrinter), ", ");
        });
        stringParts.pop();
        if (this.antecedent.length !== 0)
            stringParts.push(" ");
        stringParts.push("\u21D2");
        if (this.succedent.length !== 0) {
            stringParts.push(" ");
            for (let i = this.succedent.length - 1; i >= 0; i--) {
                stringParts.push(this.succedent[i].acceptVisitor(formulaPrinter), ", ");
            }
            stringParts.pop();
        }
        return stringParts.join("");
    }
}
function parseSequent(sequent) {
    const cedents = sequent.split("=>");
    if (cedents.length !== 2)
        throw new Error("Sequent must have exacly one sequent arrow, but found " + (cedents.length - 1));
    const [antecedentFormulaStrings, succedentFormulaStrings] = cedents.map(cedent => cedent.split(","));
    return new Sequent(antecedentFormulaStrings.filter(formulaString => formulaString.trim() !== "").map(formulaString => parseFormula(formulaString)), succedentFormulaStrings.filter(formulaString => formulaString.trim() !== "").map(formulaString => parseFormula(formulaString)).reverse());
}
const structuralRules = (function () {
    function copy(antecedent, succedent) {
        const formulaCopier = new CopyCreator();
        return new Sequent(antecedent.slice().map(formula => formula.acceptVisitor(formulaCopier)), succedent.slice().map(formula => formula.acceptVisitor(formulaCopier)));
    }
    function leftWeakening(conclusion) {
        const withoutFormula = conclusion.antecedent.slice(1);
        return [copy(withoutFormula, conclusion.succedent)];
    }
    function rightWeakening(conclusion) {
        const withoutFormula = conclusion.succedent.slice(1);
        return [copy(conclusion.antecedent, withoutFormula)];
    }
    function leftExchange(conclusion, leftFormulaIndex) {
        if (leftFormulaIndex >= conclusion.antecedent.length - 1)
            throw new Error("Can't use exchange rules: No formula on the right");
        const leftSequence = conclusion.antecedent.slice(0, leftFormulaIndex);
        const rightSequent = conclusion.antecedent.slice(leftFormulaIndex + 2, conclusion.antecedent.length);
        const leftFormula = conclusion.antecedent[leftFormulaIndex];
        const rightFormula = conclusion.antecedent[leftFormulaIndex + 1];
        return [copy([...leftSequence, rightFormula, leftFormula, ...rightSequent], conclusion.succedent)];
    }
    function rightExchange(conclusion, leftFormulaIndex) {
        if (leftFormulaIndex >= conclusion.succedent.length - 1)
            throw new Error("Can't use exchange rules: No formula on the right");
        const leftSequence = conclusion.succedent.slice(0, leftFormulaIndex);
        const rightSequent = conclusion.succedent.slice(leftFormulaIndex + 2, conclusion.succedent.length);
        const leftFormula = conclusion.succedent[leftFormulaIndex];
        const rightFormula = conclusion.succedent[leftFormulaIndex + 1];
        return [copy(conclusion.antecedent, [...leftSequence, rightFormula, leftFormula, ...rightSequent])];
    }
    leftWeakening.toString = () => "Left Weakening Rule";
    rightWeakening.toString = () => "Right Weakening Rule";
    leftExchange.toString = () => "Left Exchange Rule";
    rightExchange.toString = () => "Right Exchange Rule";
    leftWeakening.proofName = "(We.l)";
    rightWeakening.proofName = "(We.r)";
    leftExchange.proofName = "(Ex.l)";
    rightExchange.proofName = "(Ex.r)";
    return {
        leftWeakening,
        rightWeakening,
        leftExchange,
        rightExchange
    };
}());
const proofHelper = (function () {
    class ConnectiveFinder {
        constructor() {
            this.visitImplication = (formula) => true;
            this.visitConjunction = (formula) => true;
            this.visitDisjunction = (formula) => true;
            this.visitNegation = (formula) => true;
            this.visitVariable = (formula) => false;
            this.visitTruth = (formula) => { throw new Error("Can't have Truth symbol in Sequents"); };
            this.visitFalsity = (formula) => { throw new Error("Can't have Falsity symbol in Sequents"); };
        }
    }
    class RuleFinder {
        constructor(conclusion, formulaInAntecedent) {
            this.conclusion = conclusion;
            this.formulaInAntecedent = formulaInAntecedent;
        }
        generateNameFunction(name) {
            return this.formulaInAntecedent ? () => "Left " + name + " Rule" : () => "Right " + name + " Rule";
        }
        generateProofName(name) {
            return this.formulaInAntecedent ? `(${name}:l)` : `(${name}:r)`;
        }
        visitImplication(formula) {
            if (this.formulaInAntecedent) {
                const withoutFormula = this.conclusion.antecedent.slice(1);
                const leftImplication = () => {
                    return [
                        copySequent(withoutFormula, [formula.left, ...this.conclusion.succedent]),
                        copySequent([formula.right, ...withoutFormula], this.conclusion.succedent)
                    ];
                };
                leftImplication.toString = this.generateNameFunction("Implication");
                leftImplication.proofName = this.generateProofName("\u2192");
                return leftImplication;
            }
            const withoutFormula = this.conclusion.succedent.slice(1);
            const rightImplication = () => [copySequent([formula.left, ...this.conclusion.antecedent], [formula.right, ...withoutFormula])];
            rightImplication.toString = this.generateNameFunction("Implication");
            rightImplication.proofName = this.generateProofName("\u2192");
            return rightImplication;
        }
        visitConjunction(formula) {
            if (this.formulaInAntecedent) {
                const withoutFormula = this.conclusion.antecedent.slice(1);
                const leftConjunction = () => [copySequent([formula.left, formula.right, ...withoutFormula], this.conclusion.succedent)];
                leftConjunction.toString = this.generateNameFunction("Conjunction");
                leftConjunction.proofName = this.generateProofName("\u2227");
                return leftConjunction;
            }
            const withoutFormula = this.conclusion.succedent.slice(1);
            const rightConjunction = () => [
                copySequent(this.conclusion.antecedent, [formula.left, ...withoutFormula]),
                copySequent(this.conclusion.antecedent, [formula.right, ...withoutFormula]),
            ];
            rightConjunction.toString = this.generateNameFunction("Conjunction");
            rightConjunction.proofName = this.generateProofName("\u2227");
            return rightConjunction;
        }
        visitDisjunction(formula) {
            if (this.formulaInAntecedent) {
                const withoutFormula = this.conclusion.antecedent.slice(1);
                const leftDisjunction = () => [
                    copySequent([formula.left, ...withoutFormula], this.conclusion.succedent),
                    copySequent([formula.right, ...withoutFormula], this.conclusion.succedent)
                ];
                leftDisjunction.toString = this.generateNameFunction("Disjunction");
                leftDisjunction.proofName = this.generateProofName("\u2228");
                return leftDisjunction;
            }
            const withoutFormula = this.conclusion.succedent.slice(1);
            const rightDisjunction = () => [copySequent(this.conclusion.antecedent, [formula.left, formula.right, ...withoutFormula])];
            rightDisjunction.toString = this.generateNameFunction("Disjunction");
            rightDisjunction.proofName = this.generateProofName("\u2228");
            return rightDisjunction;
        }
        visitNegation(formula) {
            if (this.formulaInAntecedent) {
                const withoutFormula = this.conclusion.antecedent.slice(1);
                const leftNegation = () => [copySequent(withoutFormula, [formula.formula, ...this.conclusion.succedent])];
                leftNegation.toString = this.generateNameFunction("Negation");
                leftNegation.proofName = this.generateProofName("\u00AC");
                return leftNegation;
            }
            const withoutFormula = this.conclusion.succedent.slice(1);
            const rightNegation = () => [copySequent([formula.formula, ...this.conclusion.antecedent], withoutFormula)];
            rightNegation.toString = this.generateNameFunction("Negation");
            rightNegation.proofName = this.generateProofName("\u00AC");
            return rightNegation;
        }
        visitVariable(formula) {
            throw new Error("not.");
        }
        visitTruth(formula) {
            throw new Error("not.");
        }
        visitFalsity(formula) {
            throw new Error("not.");
        }
    }
    const formulaCopier = new CopyCreator();
    function moveFormulaOutside(sequent, formulaIndex, inAntecedent) {
        return moveFormula(sequent, formulaIndex, inAntecedent, true);
    }
    function moveFormulaInside(sequent, formulaIndex, inAntecedent) {
        return moveFormula(sequent, formulaIndex, inAntecedent, false);
    }
    function moveFormula(sequent, formulaIndex, inAntecedent, moveToOutside) {
        const neccesaryRule = inAntecedent ? structuralRules.leftExchange : structuralRules.rightExchange;
        const relativeSwapPosition = moveToOutside ? -1 : 0;
        const formulaShift = moveToOutside ? -1 : 1;
        const moveDecider = moveToOutside ? () => formulaIndex > 0 : (inAntecedent ? () => formulaIndex < sequent.sequent.antecedent.length - 1 : () => formulaIndex < sequent.sequent.succedent.length - 1);
        let currentProofSequent = sequent;
        while (moveDecider()) {
            currentProofSequent.premiseOne = new ProofTree(neccesaryRule(currentProofSequent.sequent, formulaIndex + relativeSwapPosition)[0]);
            currentProofSequent.usedRule = neccesaryRule;
            currentProofSequent = currentProofSequent.premiseOne;
            formulaIndex += formulaShift;
        }
        return currentProofSequent;
    }
    function deriveAxiom(sequent) {
        sequent.sequent.antecedent.every(formula => { if (!(formula instanceof Variable))
            throw new Error("antecedent must only have variables"); });
        sequent.sequent.succedent.every(formula => { if (!(formula instanceof Variable))
            throw new Error("succedent must only have variables"); });
        let currentProof = sequent;
        while (currentProof.sequent.antecedent.length > 1) {
            currentProof.usedRule = structuralRules.leftWeakening;
            const nextProof = new ProofTree(structuralRules.leftWeakening(currentProof.sequent)[0]);
            currentProof.premiseOne = nextProof;
            currentProof = nextProof;
        }
        while (currentProof.sequent.succedent.length > 1) {
            currentProof.usedRule = structuralRules.rightWeakening;
            const nextProof = new ProofTree(structuralRules.rightWeakening(currentProof.sequent)[0]);
            currentProof.premiseOne = nextProof;
            currentProof = nextProof;
        }
    }
    function hasConnectiveFormula(sequent) {
        let position = sequent.antecedent.findIndex(formula => formula.acceptVisitor(new ConnectiveFinder));
        if (position !== -1)
            return ["antecedent", position];
        position = sequent.succedent.findIndex(formula => formula.acceptVisitor(new ConnectiveFinder));
        if (position !== -1)
            return ["succedent", position];
        return ["no"];
    }
    function findAxiom(seq) {
        seq.antecedent.every(formula => { if (!(formula instanceof Variable))
            throw new Error("antecedent must only have variables"); });
        seq.succedent.every(formula => { if (!(formula instanceof Variable))
            throw new Error("succedent must only have variables"); });
        const antecedentVariableNames = seq.antecedent.map(form => form.name);
        const succedentVariableNames = seq.succedent.map(form => form.name);
        for (let antIndex = antecedentVariableNames.length - 1; antIndex >= 0; antIndex--) {
            for (let sucIndex = succedentVariableNames.length - 1; sucIndex >= 0; sucIndex--) {
                if (antecedentVariableNames[antIndex] == succedentVariableNames[sucIndex])
                    return [antIndex, sucIndex];
            }
        }
        return undefined;
    }
    function copySequent(antecedent, succedent) {
        return new Sequent(antecedent.slice().map(formula => formula.acceptVisitor(formulaCopier)), succedent.slice().map(formula => formula.acceptVisitor(formulaCopier)));
    }
    return {
        RuleFinder,
        moveFormula,
        hasConnectiveFormula,
        findAxiomVariables: findAxiom,
        moveFormulaInside,
        moveFormulaOutside,
        deriveAxiom
    };
})();
class ProofTree {
    constructor(sequent) {
        this.sequent = sequent;
    }
    solve() {
        const nextFormula = proofHelper.hasConnectiveFormula(this.sequent);
        let usableProof;
        let nextSequents;
        let nextRule;
        switch (nextFormula[0]) {
            case "no":
                const axiomVariablePos = proofHelper.findAxiomVariables(this.sequent);
                if (axiomVariablePos === undefined)
                    throw new Error("Can't find proof for the (sub-)sequent \"" + this.sequent.toString() + "\"");
                proofHelper.deriveAxiom(proofHelper.moveFormulaInside(proofHelper.moveFormulaInside(this, axiomVariablePos[0], true), axiomVariablePos[1], false));
                return;
            case "antecedent":
                usableProof = proofHelper.moveFormulaOutside(this, nextFormula[1], true);
                nextRule = usableProof.sequent.antecedent[0].acceptVisitor(new proofHelper.RuleFinder(usableProof.sequent, true));
                break;
            case "succedent":
                usableProof = proofHelper.moveFormulaOutside(this, nextFormula[1], false);
                nextRule = usableProof.sequent.succedent[0].acceptVisitor(new proofHelper.RuleFinder(usableProof.sequent, false));
                break;
        }
        usableProof.premiseOne = new ProofTree(nextRule()[0]);
        usableProof.usedRule = nextRule;
        usableProof.premiseOne.solve();
        if (nextRule().length == 2) {
            usableProof.premiseTwo = new ProofTree(nextRule()[1]);
            usableProof.usedRule = nextRule;
            usableProof.premiseTwo.solve();
        }
    }
    toString() {
        let stringBuilder = [];
        if (this.premiseOne !== undefined) {
            stringBuilder.push(`From ${this.sequent.toString()} to ${this.premiseOne.sequent.toString()} using ${this.usedRule}\n`);
            stringBuilder.push(this.premiseOne.toString());
        }
        if (this.premiseTwo !== undefined) {
            stringBuilder.push(`From ${this.sequent.toString()} to ${this.premiseTwo.sequent.toString()} using ${this.usedRule}\n`);
            stringBuilder.push(this.premiseTwo.toString());
        }
        return stringBuilder.join("");
    }
    getBFSString() {
        let stringBuilder = [];
        let queue = [this];
        let newqueue = [];
        while (queue.length != 0) {
            const current = queue.pop();
            stringBuilder.push(current?.sequent.toString(), "\t\t");
            if (current?.premiseOne !== undefined)
                newqueue.unshift(current.premiseOne);
            if (current?.premiseTwo !== undefined)
                newqueue.unshift(current.premiseTwo);
            if (queue.length == 0) {
                stringBuilder.push("\n");
                queue = newqueue;
                newqueue = [];
            }
        }
        return stringBuilder.join("");
    }
    get height() {
        return 1 + Math.max(this.premiseOne?.height ?? 0, this.premiseTwo?.height ?? 0);
    }
}
