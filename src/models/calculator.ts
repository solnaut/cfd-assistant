import type { UnitCategory } from '../units/conversions'

export type CalculatorAvailability = 'available' | 'planned' | 'research-only'

export type CalculatorImplementationId =
  | 'biot-number'
  | 'boundary-layer-mesh'
  | 'cfl-time-step'
  | 'conduction-heat-transfer'
  | 'convective-heat-transfer'
  | 'fourier-number'
  | 'grashof-number'
  | 'heat-flux'
  | 'hydraulic-diameter'
  | 'ideal-gas-speed-of-sound'
  | 'laminar-pipe-pressure-drop'
  | 'mass-flow-rate'
  | 'mean-velocity'
  | 'nusselt-number'
  | 'mach-number'
  | 'peclet-number'
  | 'pipe-pressure-drop'
  | 'prandtl-number'
  | 'rayleigh-number'
  | 'reynolds-number'
  | 'rotating-time-step'
  | 'temperature-rise'
  | 'thermal-resistance'
  | 'total-time-steps'
  | 'y-plus-first-layer-height'

export interface CalculatorCategory {
  id: string
  name: string
  eyebrow: string
  description: string
  icon: 'mesh' | 'time' | 'dimensionless' | 'pipe' | 'heat'
}

export interface CalculatorInputDefinition {
  id: string
  label: string
  quantity: string
  unitCategory?: UnitCategory
  defaultUnit?: string
  defaultValue?: number
  required: boolean
  helperText?: string
  integer?: boolean
  min?: number
}

export interface CalculatorOutputDefinition {
  id: string
  label: string
  quantity: string
  unitCategory?: UnitCategory
  defaultUnit?: string
}

export interface CalculatorFormulaDefinition {
  id?: string
  title: string
  latex: string
  plainText: string
  description?: string
}

export interface CalculatorVariableDefinition {
  symbol: string
  displaySymbol?: string
  name: string
  unit: string
  description: string
}

export interface CalculatorSourceDefinition {
  label: string
  title: string
  organization: string
  url: string
  accessedAt: string
}

export interface CalculatorDefinition {
  id: string
  name: string
  shortName: string
  categoryId: string
  summary: string
  availability: CalculatorAvailability
  implementationId?: CalculatorImplementationId
  inputs: CalculatorInputDefinition[]
  outputs: CalculatorOutputDefinition[]
  resultPreview: string[]
  formula?: CalculatorFormulaDefinition
  variables?: CalculatorVariableDefinition[]
  scope?: string[]
  notes?: string[]
  sources?: CalculatorSourceDefinition[]
  updatedAt?: string
}
