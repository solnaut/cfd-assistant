export type CalculatorAvailability = 'ready-for-structure' | 'planned'

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
  defaultUnit?: string
  required: boolean
}

export interface CalculatorOutputDefinition {
  id: string
  label: string
  quantity: string
  defaultUnit?: string
}

export interface CalculatorDefinition {
  id: string
  name: string
  shortName: string
  categoryId: string
  summary: string
  availability: CalculatorAvailability
  inputs: CalculatorInputDefinition[]
  outputs: CalculatorOutputDefinition[]
  resultPreview: string[]
}
