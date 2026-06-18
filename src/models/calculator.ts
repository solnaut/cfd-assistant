import type { UnitCategory } from '../units/conversions'

export type CalculatorAvailability = 'available' | 'planned' | 'research-only'

export type CalculatorImplementationId =
  | 'biot-number'
  | 'boundary-layer-mesh'
  | 'cfl-time-step'
  | 'fourier-number'
  | 'grashof-number'
  | 'hydraulic-diameter'
  | 'mach-number'
  | 'peclet-number'
  | 'prandtl-number'
  | 'rayleigh-number'
  | 'reynolds-number'

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
  title: string
  latex: string
  plainText: string
}

export interface CalculatorVariableDefinition {
  symbol: string
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
