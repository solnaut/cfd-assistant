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
  '\\Omega_{rpm}': 'Ωrpm',
  '\\omega': 'ω',
  '\\rho': 'ρ',
  '\\tau_w': 'τw',
  '\\dot{m}': 'ṁ',
  '\\dot{Q}': 'Q̇',
}

export function formatVariableSymbol(variable: CalculatorVariableDefinition) {
  return variable.displaySymbol ?? symbolMap[variable.symbol] ?? toPlainSymbol(variable.symbol)
}

export function formatVariableUnit(unit: string) {
  return unit === '1' ? '-' : formatUnitSymbol(unit)
}

function toPlainSymbol(symbol: string) {
  return symbol
    .replaceAll('\\', '')
    .replaceAll('^+', '+')
    .replaceAll(/_\{([^}]+)\}/g, '$1')
    .replaceAll(/_([A-Za-z0-9]+)/g, '$1')
}
