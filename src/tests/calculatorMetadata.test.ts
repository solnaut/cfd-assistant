import { describe, expect, it } from 'vitest'
import {
  getCalculatorFormulaEntries,
  getFormulaVariables,
} from '../calculators/formulas'
import { calculatorCatalog } from '../calculators/registry'
import { formatVariableSymbol } from '../utils/engineeringDisplay'

const researchRecordNames = new Set(
  Object.keys(
    import.meta.glob('../../docs/research/calculators/*.md', {
      eager: true,
      import: 'default',
      query: '?raw',
    }),
  ).map((filePath) => filePath.split('/').pop()?.replace(/\.md$/, '')),
)

describe('calculator metadata display', () => {
  it('renders variable symbols as display text instead of raw LaTeX commands', () => {
    const renderedSymbols = calculatorCatalog.flatMap((calculator) =>
      calculator.variables?.map((variable) => formatVariableSymbol(variable)) ?? [],
    )

    expect(renderedSymbols).toContain('μ')
    expect(renderedSymbols).toContain('ρ')
    expect(renderedSymbols).toContain('α')
    expect(renderedSymbols.every((symbol) => !symbol.includes('\\'))).toBe(true)
  })

  it('keeps formula definitions available for every published calculator with formulas', () => {
    const calculatorsWithFormula = calculatorCatalog.filter(
      (calculator) =>
        calculator.availability === 'available' &&
        getCalculatorFormulaEntries(calculator).length > 0,
    )

    expect(calculatorsWithFormula.length).toBeGreaterThan(10)
    expect(
      calculatorsWithFormula.every((calculator) =>
        getCalculatorFormulaEntries(calculator).every((formula) =>
          formula.latex.trim(),
        ),
      ),
    ).toBe(true)
  })

  it('splits y+ formulas into focused formula library relations', () => {
    const yPlusCalculator = calculatorCatalog.find(
      (calculator) => calculator.id === 'y-plus-first-layer-height',
    )

    if (!yPlusCalculator) {
      throw new Error('Missing y+ calculator')
    }

    const formulaIds = getCalculatorFormulaEntries(yPlusCalculator).map(
      (formula) => formula.id,
    )

    expect(formulaIds).toEqual([
      'y-plus-definition',
      'friction-velocity',
      'kinematic-viscosity',
      'reynolds-number-from-properties',
      'flat-plate-wall-friction-coefficient',
      'wall-shear-from-wall-friction-coefficient',
      'first-cell-center-distance',
      'first-layer-full-thickness',
    ])
  })

  it('defines the three y+ calculation modes and defaults to initial estimate', () => {
    const yPlusCalculator = calculatorCatalog.find(
      (calculator) => calculator.id === 'y-plus-first-layer-height',
    )

    if (!yPlusCalculator) {
      throw new Error('Missing y+ calculator')
    }

    expect(yPlusCalculator.defaultModeId).toBe('initial-estimate')
    expect(yPlusCalculator.modes?.map((mode) => mode.id)).toEqual([
      'initial-estimate',
      'known-wall-shear-stress',
      'known-friction-coefficient',
    ])
    expect(
      yPlusCalculator.inputs.find((input) => input.id === 'flow-scenario')
        ?.options?.find((option) => option.id === 'internal-pipe')?.disabled,
    ).toBe(true)
  })

  it('keeps formula variable display symbols free of raw LaTeX commands', () => {
    const renderedSymbols = calculatorCatalog.flatMap((calculator) =>
      getCalculatorFormulaEntries(calculator).flatMap((formula) =>
        getFormulaVariables(calculator, formula).map((variable) =>
          formatVariableSymbol(variable),
        ),
      ),
    )

    expect(renderedSymbols).toContain('τw')
    expect(renderedSymbols).toContain('uτ')
    expect(renderedSymbols).toContain('Cf')
    expect(renderedSymbols.every((symbol) => !symbol.includes('\\'))).toBe(true)
  })

  it('uses wall friction coefficient wording in y+ user-facing metadata', () => {
    const yPlusCalculator = calculatorCatalog.find(
      (calculator) => calculator.id === 'y-plus-first-layer-height',
    )

    if (!yPlusCalculator) {
      throw new Error('Missing y+ calculator')
    }

    const metadataText = JSON.stringify({
      inputs: yPlusCalculator.inputs,
      formulas: yPlusCalculator.formulas,
      variables: yPlusCalculator.variables,
      scope: yPlusCalculator.scope,
      notes: yPlusCalculator.notes,
    })

    expect(metadataText).toContain('壁面摩擦系数')
    expect(metadataText).not.toContain('皮肤摩擦系数')
  })

  it('keeps internal research records for every published calculator', () => {
    const publishedCalculators = calculatorCatalog.filter(
      (calculator) => calculator.availability === 'available',
    )
    const missingRecords = publishedCalculators
      .map((calculator) => calculator.id)
      .filter((calculatorId) => !researchRecordNames.has(calculatorId))

    expect(missingRecords).toEqual([])
  })
})
