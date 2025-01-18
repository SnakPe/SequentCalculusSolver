/**
 * Using a {@link NFConverterStrategy}, converts a formula into a normal form.
 */
class NormalFormConverter{
  private withoutImplications : Formula
  constructor(formula : Formula, private strategy : NFConverterStrategy = new DNFConverterStrategies.syntactic){
    this.withoutImplications = formula.acceptVisitor(new ImplicationRemover())
  }
  set formula (formula : Formula){
    this.withoutImplications = formula.acceptVisitor(new ImplicationRemover())
  }
  getConvertedFormula() : Formula{
    return this.strategy.convert(this.withoutImplications)
  }
}
