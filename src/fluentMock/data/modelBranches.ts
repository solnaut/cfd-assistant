import { makeControl } from './controlHelpers'
import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'

type Setting = [id: string, label: string, properties?: Partial<FluentMockControl>]

export function modelControls(parentId: string, group: string, settings: Setting[]) {
  return settings.map(([id, label, properties]) => makeControl({
    id, label, parentId, group, module: 'Models', region: '模拟窗口',
    controlType: properties?.options ? 'select' : properties?.dialogId ? 'button' :
      properties?.defaultSelected !== undefined ? 'checkbox' : 'field',
    ...properties,
  }))
}

const dpmEnabled = { controlId: 'dpm-enable', values: [true] }

export function addModelBranches(dialog: FluentMockDialog): FluentMockDialog {
  const { id } = dialog
  if (id === 'dpm-model-dialog') {
    return { ...dialog, controls: [
      ...dialog.controls,
      ...modelControls(id, 'Discrete Phase', [
        ['dpm-injections', 'Injections…', { dialogId: 'dpm-injection-dialog', visibleWhen: [dpmEnabled] }],
        ['dpm-interval', 'DPM Iteration Interval', { value: '10', section: 'Interaction', visibleWhen: [dpmEnabled, { controlId: 'dpm-interaction', values: [true] }] }],
        ['dpm-fluid-timestep', 'Track with Fluid Flow Time Step', { defaultSelected: true, section: 'Particle Treatment', visibleWhen: [dpmEnabled,
          { controlId: 'dpm-unsteady-tracking', values: [true] }, { controlId: 'solver-time-formulation', values: ['Transient'] }] }],
        ['dpm-particle-timestep', 'Particle Time Step Size (s)', { value: '0.001', visibleWhen: [
          dpmEnabled, { controlId: 'dpm-independent-particle-step', values: [true] },
        ], section: 'Particle Treatment' }],
      ]),
      ...modelControls(id, 'Physical Models', [
        ['dpm-thermophoresis', 'Thermophoretic Force', { defaultSelected: false }],
        ['dpm-saffman', 'Saffman Lift Force', { defaultSelected: false }],
        ['dpm-pressure-gradient', 'Pressure Gradient Force', { defaultSelected: false }],
      ]),
      ...modelControls(id, 'Numerics', [
        ['dpm-accuracy', 'Accuracy Control', { defaultSelected: true, section: 'Tracking Options' }],
        ['dpm-tolerance', 'Tolerance', { value: '1e-5', visibleWhen: [{ controlId: 'dpm-accuracy', values: [true] }], section: 'Tracking Options' }],
        ['dpm-refinements', 'Max. Refinements', { value: '20', visibleWhen: [{ controlId: 'dpm-accuracy', values: [true] }], section: 'Tracking Options' }],
      ]),
    ] }
  }

  return dialog
}

export const modelChildDialogs: FluentMockDialog[] = [
  {
    id: 'dpm-injection-dialog',
    title: 'Discrete Phase Injection',
    module: 'Models',
    subtitle: '保存教学喷射对象。液滴转换设置可引用该对象。',
    controls: modelControls('dpm-injection-dialog', 'Injection', [
      ['dpm-injection-name', 'Injection Name', { value: 'injection-1' }],
      ['dpm-injection-type', 'Injection Type', { value: 'surface', options: ['single', 'group', 'cone', 'surface', 'plain-orifice-atomizer'] }],
    ]),
  },
]
