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

export function getCalculatorCommonFormulaEntries(
  calculator: CalculatorDefinition,
) {
  return getFormulaEntriesByIds(calculator, calculator.commonFormulaIds ?? [])
}

export function getCalculatorModeFormulaEntries(
  calculator: CalculatorDefinition,
  modeId?: string,
) {
  const mode = calculator.modes?.find((entry) => entry.id === modeId)

  return getFormulaEntriesByIds(calculator, mode?.formulaIds ?? [])
}

export function getFormulaVariables(
  calculator: CalculatorDefinition,
  formula: CalculatorFormulaDefinition,
): CalculatorVariableDefinition[] {
  return formula.variables ?? calculator.variables ?? []
}

export function getCalculatorLatexSummary(
  calculator: CalculatorDefinition,
  modeId?: string,
) {
  const modeSpecificEntries = [
    ...getCalculatorCommonFormulaEntries(calculator),
    ...getCalculatorModeFormulaEntries(calculator, modeId),
  ]
  const entries = modeSpecificEntries.length
    ? modeSpecificEntries
    : getCalculatorFormulaEntries(calculator)

  return entries
    .map((formula) => `${formula.title}: ${formula.latex}`)
    .join('\n')
}

function getFormulaEntriesByIds(
  calculator: CalculatorDefinition,
  formulaIds: string[],
) {
  if (!formulaIds.length) {
    return []
  }

  const formulas = getCalculatorFormulaEntries(calculator)

  return formulaIds
    .map((formulaId) => formulas.find((formula) => formula.id === formulaId))
    .filter((formula): formula is CalculatorFormulaDefinition => Boolean(formula))
}
