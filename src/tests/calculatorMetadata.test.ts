import { describe, expect, it } from 'vitest'
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
      (calculator) => calculator.availability === 'available' && calculator.formula,
    )

    expect(calculatorsWithFormula.length).toBeGreaterThan(10)
    expect(
      calculatorsWithFormula.every((calculator) => calculator.formula?.latex.trim()),
    ).toBe(true)
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
