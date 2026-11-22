import { makeControl, type ControlInput } from './controlHelpers'

type TimeField = Pick<ControlInput, 'id' | 'label' | 'controlType' | 'value' | 'options' | 'visibleWhen' | 'dialogId'>
const timeForm = { controlId: 'solver-time-formulation', values: ['Transient'] }
const mode = (value: string) => ({ controlId: 'run-time-type', values: [value] })
const method = (...values: string[]) => ({ controlId: 'run-effective-time-method', values })

export const timeAdvancementDefaults = {
  'run-time-type': 'Fixed',
  'run-fixed-method': 'User-Specified',
  'run-adaptive-method': 'CFL-Based',
  'run-period': '1',
  'run-frequency': '1',
  'run-steps-per-period': '20',
  'run-total-periods': '1',
  'run-adaptive-initial': '0.005',
  'run-adaptive-courant': '1',
  'run-adaptive-error': '0.01',
  'run-multiphase-courant': '2',
  'run-min-time-step': '0.0001',
  'run-max-time-step': '0.1',
  'run-min-change-factor': '0.5',
  'run-max-change-factor': '2',
}

const fields: TimeField[] = [
  { id: 'run-time-type', label: 'Type', controlType: 'select', options: ['Fixed', 'Adaptive'] },
  { id: 'run-fixed-method', label: 'Method', controlType: 'select', options: ['User-Specified', 'Period-Based', 'Frequency-Based'], visibleWhen: [mode('Fixed')] },
  { id: 'run-adaptive-method', label: 'Method', controlType: 'select', options: ['CFL-Based', 'Error-Based', 'Multiphase-Specific'], visibleWhen: [mode('Adaptive')] },
  { id: 'run-period', label: 'Period (s)', controlType: 'field', visibleWhen: [method('Period-Based')] },
  { id: 'run-frequency', label: 'Frequency (Hz)', controlType: 'field', visibleWhen: [method('Frequency-Based')] },
  { id: 'run-steps-per-period', label: 'Time Steps per Period', controlType: 'field', visibleWhen: [method('Period-Based', 'Frequency-Based')] },
  { id: 'run-total-periods', label: 'Total Periods', controlType: 'field', visibleWhen: [method('Period-Based', 'Frequency-Based')] },
  { id: 'run-adaptive-initial', label: 'Initial Time Step Size', controlType: 'field', visibleWhen: [mode('Adaptive')] },
  { id: 'run-adaptive-courant', label: 'Courant Number', controlType: 'field', visibleWhen: [method('CFL-Based')] },
  { id: 'run-adaptive-error', label: 'Error Tolerance', controlType: 'field', visibleWhen: [method('Error-Based')] },
  { id: 'run-multiphase-courant', label: 'Global Courant Number', controlType: 'field', visibleWhen: [method('Multiphase-Specific')] },
  { id: 'run-adaptive-settings', label: 'Settings…', controlType: 'button', dialogId: 'adaptive-time-stepping-dialog', visibleWhen: [mode('Adaptive')] },
]

export function timeAdvancementControls(inDialog = false) {
  return fields.map((field) => makeControl({
    ...field,
    id: inDialog ? field.id + '-dialog' : field.id,
    valueId: inDialog ? field.id : undefined,
    value: timeAdvancementDefaults[field.id as keyof typeof timeAdvancementDefaults],
    parentId: inDialog ? 'run-calculation-dialog' : undefined,
    module: 'Run Calculation',
    region: inDialog ? '模拟窗口' : '任务页面',
    group: 'Time Advancement',
    visibleWhen: [timeForm, ...(field.visibleWhen ?? [])],
  }))
}

export const directStepMethods = ['User-Specified', 'CFL-Based', 'Error-Based', 'Multiphase-Specific']
