import type { CalculatorVariableDefinition } from '../models/calculator'
import { formatUnitSymbol } from '../units/conversions'

const symbolMap: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\Delta p': 'Δp',
  '\\Delta T': 'ΔT',
  '\\Delta t': 'Δt',
  '\\Delta x': 'Δx',
  '\\gamma': 'γ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\omega': 'ω',
  '\\rho': 'ρ',
  '\\tau_w': 'τw',
}

export function formatVariableSymbol(variable: CalculatorVariableDefinition) {
  return variable.displaySymbol ?? symbolMap[variable.symbol] ?? variable.symbol
}

export function formatVariableUnit(unit: string) {
  return unit === '1' ? '-' : formatUnitSymbol(unit)
}
