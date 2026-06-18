export type CalculatorStatus = 'todo' | 'draft' | 'reviewed'

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
  category: string
  summary: string
  status: CalculatorStatus
  inputs: CalculatorInputDefinition[]
  outputs: CalculatorOutputDefinition[]
  validationStatus: string
  formulaTodo: string
}
