import type {
  CalculatorDefinition,
  CalculatorFormulaDefinition,
  CalculatorVariableDefinition,
} from '../models/calculator'

export function getCalculatorFormulaEntries(
  calculator: CalculatorDefinition,
): CalculatorFormulaDefinition[] {
  if (calculator.formulas?.length) {
    return calculator.formulas
  }

  return calculator.formula ? [calculator.formula] : []
}

export function getFormulaVariables(
  calculator: CalculatorDefinition,
  formula: CalculatorFormulaDefinition,
): CalculatorVariableDefinition[] {
  return formula.variables ?? calculator.variables ?? []
}

export function getCalculatorLatexSummary(calculator: CalculatorDefinition) {
  return getCalculatorFormulaEntries(calculator)
    .map((formula) => `${formula.title}: ${formula.latex}`)
    .join('\n')
}
