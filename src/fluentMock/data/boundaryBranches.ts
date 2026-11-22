import { makeControl, makePanelControl } from './controlHelpers'
import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'

type Condition = NonNullable<FluentMockControl['visibleWhen']>[number]
type FieldOptions = Pick<FluentMockControl, 'value' | 'options' | 'defaultSelected' | 'dialogId' | 'visibleWhen'>
type BoundaryField = [suffix: string, label: string, options?: FieldOptions]

function when(controlId: string, ...values: Condition['values']): Condition {
  return { controlId, values }
}

function fields(prefix: string, group: string, items: BoundaryField[], conditions: Condition[] = []) {
  return items.map(([suffix, label, options]) => makeControl({
    id: prefix + '-' + suffix,
    label,
    region: '模拟窗口',
    module: 'Boundary Conditions',
    group,
    controlType: options?.options ? 'select' : options?.dialogId ? 'button' :
      options?.defaultSelected !== undefined ? 'checkbox' : 'field',
    ...options,
    visibleWhen: [...conditions, ...(options?.visibleWhen ?? [])],
  }))
}

const flowVector = (prefix: string, condition: Condition, isVelocity = false) => {
  const options = ['Cartesian', 'Cylindrical']
  const coordinateId = prefix + (isVelocity ? '-component-system' : '-direction-system')
  const suffix = isVelocity ? 'Velocity' : 'Component of Flow Direction'
  const key = isVelocity ? 'component' : 'direction'
  return fields(prefix, 'Momentum', [
    [key + '-system', 'Coordinate System', { value: options[0], options }],
    ...(['X', 'Y', 'Z', 'Radial', 'Tangential', 'Axial'].map((axis, index): BoundaryField => [
      key + '-' + axis.toLowerCase(), axis + '-' + suffix,
      { value: (axis === 'X' && !isVelocity) ? '1' : '0', visibleWhen: [when(coordinateId, options[index < 3 ? 0 : 1])] },
    ])),
  ], [condition])
}

const turbulenceMethods = [
  'Intensity and Hydraulic Diameter',
  'Intensity and Viscosity Ratio',
  'Intensity and Length Scale',
  'K and Epsilon',
  'K and Omega',
]

function turbulenceFields(prefix: string) {
  const backflow = prefix === 'pressure-outlet' ? 'Backflow ' : ''
  const spec = prefix + '-turbulence'
  return fields(prefix, 'Turbulence', [
    ['turbulent-intensity', backflow + 'Turbulent Intensity (%)', {
      value: '5', visibleWhen: [when(spec, ...turbulenceMethods.slice(0, 3))],
    }],
    ['hydraulic-diameter', backflow + 'Hydraulic Diameter (m)', {
      value: '0.1', visibleWhen: [when(spec, turbulenceMethods[0])],
    }],
    ['viscosity-ratio', backflow + 'Turbulent Viscosity Ratio', {
      value: '10', visibleWhen: [when(spec, turbulenceMethods[1])],
    }],
    ['length-scale', backflow + 'Turbulent Length Scale (m)', {
      value: '0.01', visibleWhen: [when(spec, turbulenceMethods[2])],
    }],
    ['turbulent-k', backflow + 'Turbulent Kinetic Energy', {
      value: '0.01', visibleWhen: [when(spec, ...turbulenceMethods.slice(3))],
    }],
    ['turbulent-epsilon', backflow + 'Turbulent Dissipation Rate', {
      value: '0.01', visibleWhen: [when(spec, turbulenceMethods[3])],
    }],
    ['turbulent-omega', backflow + 'Specific Dissipation Rate', {
      value: '1', visibleWhen: [when(spec, turbulenceMethods[4])],
    }],
  ])
}

const velocityMethodId = 'velocity-inlet-method'
const velocityMethods = ['Magnitude, Normal to Boundary', 'Magnitude and Direction', 'Components']
const directionMethods = ['Normal to Boundary', 'Direction Vector']
const wallThermal = ['Heat Flux', 'Temperature', 'Convection', 'Radiation', 'Mixed', 'Coupled']
const wallMotion = when('wall-motion', 'Moving Wall')
const wallCondition = (...values: string[]) => [when('wall-thermal', ...values)]
const outletTarget = [when('pressure-outlet-target-flow', true)]
const volumeFractionBoundaries = ['velocity-inlet', 'pressure-inlet', 'pressure-outlet', 'mass-flow-inlet']

const additions: Record<string, FluentMockControl[]> = {
  'velocity-inlet': [
    ...fields('velocity-inlet', 'Momentum', [
      ['method', 'Velocity Specification Method', { value: velocityMethods[0], options: velocityMethods }],
    ]),
    ...flowVector('velocity-inlet', when(velocityMethodId, 'Components'), true),
    ...flowVector('velocity-inlet', when(velocityMethodId, 'Magnitude and Direction')),
  ],
  'mass-flow-inlet': [
    ...fields('mass-flow-inlet', 'Momentum', [
      ['method', 'Mass Flow Specification Method', { value: 'Mass Flow Rate', options: ['Mass Flow Rate', 'Mass Flux', 'Mass Flux with Average Mass Flux'] }],
      ['mass-flux', 'Mass Flux', { value: '0.1', visibleWhen: [when('mass-flow-inlet-method', 'Mass Flux', 'Mass Flux with Average Mass Flux')] }],
      ['average-flux', 'Average Mass Flux', { value: '0.1', visibleWhen: [when('mass-flow-inlet-method', 'Mass Flux with Average Mass Flux')] }],
    ]),
    ...flowVector('mass-flow-inlet', when('mass-flow-inlet-direction', 'Direction Vector')),
  ],
  'pressure-inlet': [
    ...fields('pressure-inlet', 'Momentum', [
      ['direction', 'Direction Specification Method', { value: directionMethods[0], options: directionMethods }],
      ['prevent-reverse-flow', 'Prevent Reverse Flow', { defaultSelected: false }],
    ]),
    ...flowVector('pressure-inlet', when('pressure-inlet-direction', 'Direction Vector')),
  ],
  'pressure-far-field': [
    ...fields('pressure-far-field', 'Momentum', [
      ['dir-x', 'X-Component of Flow Direction', { value: '1' }],
      ['dir-y', 'Y-Component of Flow Direction', { value: '0' }],
      ['dir-z', 'Z-Component of Flow Direction', { value: '0' }],
    ]),
    ...fields('pressure-far-field', 'Turbulence', [
      ['turbulence', 'Turbulence Specification Method', { value: turbulenceMethods[0], options: turbulenceMethods }],
    ]),
  ],
  'pressure-outlet': [
    ...fields('pressure-outlet', 'Momentum', [
      ['direction', 'Backflow Direction Specification Method', { value: directionMethods[0], options: [...directionMethods, 'From Neighboring Cell'] }],
      ['prevent-reverse-flow', 'Prevent Reverse Flow', { defaultSelected: false }],
      ['target-flow', 'Target Mass Flow Rate', { defaultSelected: false }],
      ['target-value', 'Target Mass Flow (kg/s)', { value: '0.1', visibleWhen: outletTarget }],
      ['upper-pressure', 'Upper Limit of Absolute Pressure (Pa)', { value: '120000', visibleWhen: outletTarget }],
      ['lower-pressure', 'Lower Limit of Absolute Pressure (Pa)', { value: '80000', visibleWhen: outletTarget }],
    ]),
    ...flowVector('pressure-outlet', when('pressure-outlet-direction', 'Direction Vector')),
    ...fields('pressure-outlet', 'Thermal', [['backflow-temperature', 'Backflow Total Temperature', { value: '300 K' }]]),
  ],
  wall: [
    ...fields('wall', 'Momentum', [
      ['motion-type', 'Motion', { value: 'Translational', options: ['Translational', 'Rotational', 'Components'], visibleWhen: [wallMotion] }],
      ['speed', 'Speed', { value: '0', visibleWhen: [wallMotion, when('wall-motion-type', 'Translational', 'Rotational')] }],
      ...(['X', 'Y', 'Z'].flatMap((axis, index): BoundaryField[] => [
        ['velocity-' + axis.toLowerCase(), axis + '-Velocity', { value: '0', visibleWhen: [wallMotion, when('wall-motion-type', 'Components')] }],
        ['axis-' + axis.toLowerCase(), 'Rotation-Axis Direction ' + axis, { value: index === 2 ? '1' : '0', visibleWhen: [wallMotion, when('wall-motion-type', 'Rotational')] }],
        ['translation-' + axis.toLowerCase(), 'Direction ' + axis, { value: index === 0 ? '1' : '0', visibleWhen: [wallMotion, when('wall-motion-type', 'Translational')] }],
      ])),
      ['shear-condition', 'Shear Condition', { value: 'No Slip', options: ['No Slip', 'Specified Shear'] }],
      ...(['X', 'Y', 'Z'].map((axis): BoundaryField => [
        'shear-' + axis.toLowerCase(), axis + '-Shear Stress (Pa)',
        { value: '0', visibleWhen: [when('wall-shear-condition', 'Specified Shear')] },
      ])),
    ]),
    ...fields('wall', 'Thermal', [
      ['adjacent-thickness', 'Wall Thickness (m)', { value: '0' }],
      ['heat-generation', 'Heat Generation Rate (W/m³)', { value: '0' }],
      ['material', 'Material Name', { value: 'aluminum', options: ['aluminum', 'steel', 'copper'] }],
      ['heat-flux', 'Heat Flux (W/m²)', { value: '0', visibleWhen: wallCondition('Heat Flux') }],
      ['temperature', 'Wall Temperature (K)', { value: '300', visibleWhen: wallCondition('Temperature') }],
      ['heat-transfer-coefficient', 'Heat Transfer Coefficient (W/m²·K)', { value: '0', visibleWhen: wallCondition('Convection', 'Mixed') }],
      ['free-stream-temperature', 'Free Stream Temperature (K)', { value: '300', visibleWhen: wallCondition('Convection', 'Mixed') }],
      ['external-emissivity', 'External Emissivity', { value: '1', visibleWhen: wallCondition('Radiation', 'Mixed') }],
      ['external-radiation-temperature', 'External Radiation Temperature (K)', { value: '300', visibleWhen: wallCondition('Radiation', 'Mixed') }],
      ['shell-conduction', 'Shell Conduction', { defaultSelected: false }],
      ['shell-layers', 'Edit Shell Conduction Layers…', { dialogId: 'shell-conduction-dialog', visibleWhen: [when('wall-shell-conduction', true)] }],
    ]),
    ...fields('wall', 'Momentum', [
      ['contact-angle-pair', 'Contact Angle Phase Pair', { options: [] }],
      ['contact-angle', 'Contact Angle (°)'],
    ], [when('multiphase-model-select', 'Volume of Fluid (VOF)'), when('multiphase-surface-tension', true), when('multiphase-wall-adhesion', true)]),
    ...fields('wall', 'Potential', [
      ['potential-condition', 'Potential Boundary Condition', { value: 'Specified Flux', options: ['Specified Flux', 'Specified Value'] }],
      ['current-density', 'Current Density (A/m²)', { visibleWhen: [when('wall-potential-condition', 'Specified Flux')] }],
      ['electric-potential', 'Potential (V)', { visibleWhen: [when('wall-potential-condition', 'Specified Value')] }],
    ]),
  ],
}

export function addBoundaryBranches(dialog: FluentMockDialog): FluentMockDialog {
  const prefix = dialog.id.replace(/-dialog$/, '')
  if (!Object.hasOwn(additions, prefix)) return dialog

  const flow = prefix !== 'wall'
  const more = [
    ...additions[prefix],
    ...(flow ? turbulenceFields(prefix) : []),
    ...fields(prefix, 'Radiation', [['internal-emissivity', 'Internal Emissivity', { value: '1' }]]),
    ...(flow ? fields(prefix, 'Species', [
      ['mole-fractions', 'Specify Species in Mole Fractions', { defaultSelected: false }],
      ['species-mass-fraction', 'Species Mass Fraction', { value: '0', visibleWhen: [when(prefix + '-mole-fractions', false)] }],
      ['species-mole-fraction', 'Species Mole Fraction', { value: '0', visibleWhen: [when(prefix + '-mole-fractions', true)] }],
    ]) : []),
    ...fields(prefix, 'DPM', [['particle-bc', 'Discrete Phase BC Type', {
      value: prefix === 'wall' ? 'reflect' : 'escape', options: ['reflect', 'trap', 'escape'],
    }]]),
    ...(volumeFractionBoundaries.includes(prefix)
      ? fields(prefix, 'Multiphase', [
        ['phase-selection', 'Secondary Phase', { options: [] }],
        ['volume-fraction', prefix === 'pressure-outlet' ? 'Backflow Volume Fraction' : 'Volume Fraction', { value: '0' }],
      ])
      : []),
  ].map((control) => ({ ...control, parentId: dialog.id }))

  const updated = dialog.controls.map((control) => {
    switch (control.id) {
      case 'velocity-inlet-magnitude':
        return { ...control, visibleWhen: [when(velocityMethodId, ...velocityMethods.slice(0, 2))] }
      case 'mass-flow-inlet-flow-rate':
        return { ...control, visibleWhen: [when('mass-flow-inlet-method', 'Mass Flow Rate')] }
      case 'wall-thermal':
        return { ...control, options: wallThermal }
      case 'wall-roughness':
        return { ...control, dialogId: 'wall-roughness-dialog', visibleWhen: [when('wall-shear-condition', 'No Slip')] }
      case 'pressure-outlet-backflow':
        return { ...control, dialogId: 'pressure-outlet-backflow-dialog', group: 'Momentum' }
      default:
        return control.id === prefix + '-turbulence'
          ? { ...control, group: 'Turbulence', options: turbulenceMethods }
          : control
    }
  })
  // Keep a selector before its dependent fields even when the selector is newly added.
  const selectors = more.filter((control) => ['velocity-inlet-method', 'mass-flow-inlet-method'].includes(control.id))
  return { ...dialog, controls: [...selectors, ...updated, ...more.filter((control) => !selectors.includes(control))] }
}

const periodicMass = when('periodic-flow-driving-method', 'Specify Mass Flow')
const periodicGradient = when('periodic-flow-driving-method', 'Specify Pressure Gradient')
const manualPerforations = when('perforation-method', 'Manual Inputs')
const enabledPerforations = when('perforation-enable', true)
const discreteHoles = when('perforation-injection-type', 'Discrete')

export const boundaryWorkflowDialogs: FluentMockDialog[] = [
  {
    id: 'periodic-conditions-dialog',
    title: 'Periodic Conditions',
    module: 'Boundary Conditions',
    subtitle: '演示平移周期性流动的驱动方式及质量流量或压力梯度设置。',
    controls: fields('periodic-flow', 'Driving Conditions', [
      ['driving-method', 'Flow Driving Method', { options: ['Specify Mass Flow', 'Specify Pressure Gradient'], value: 'Specify Mass Flow' }],
      ['mass-rate', 'Mass Flow Rate (kg/s)', { visibleWhen: [periodicMass] }],
      ['pressure-gradient', 'Pressure Gradient (Pa/m)', { visibleWhen: [periodicGradient] }],
      ['bulk-temperature', 'Upstream Bulk Temperature (K)', { visibleWhen: [when('energy-enable', true)] }],
      ['direction', 'Flow Direction'],
      ['relaxation', 'Relaxation Factor', { visibleWhen: [periodicMass] }],
      ['iterations', 'Number of Iterations', { visibleWhen: [periodicMass] }],
    ]),
  },
  {
    id: 'perforated-walls-dialog',
    title: 'Perforated Walls',
    module: 'Boundary Conditions',
    subtitle: '演示穿孔壁的文件导入和单组注入/抽取壁配置。',
    controls: [
      ...fields('perforation', 'Model Setup', [
        ['enable', 'Perforated Wall Model', { defaultSelected: false }],
      ]),
      ...fields('perforation', 'Model Setup', [
        ['method', 'Model Setup Method', { options: ['Manual Inputs', 'Import Input Files'], value: 'Manual Inputs' }],
        ['input-file', 'Input File Name', { visibleWhen: [when('perforation-method', 'Import Input Files')] }],
      ], [enabledPerforations]),
      ...fields('perforation', 'Model Settings', [
        ['wall', 'Injection Wall'],
        ['extraction-wall', 'Extraction Wall'],
        ['explicit-relaxation', 'Injection Explicit Relaxation Factor'],
        ['injection-type', 'Injection Type', { options: ['Uniform', 'Discrete'], value: 'Uniform' }],
        ['hole-count', 'Number of Holes', { visibleWhen: [discreteHoles] }],
        ['hole-geometry', 'Injection Holes Geometry…', { dialogId: 'perforation-holes-dialog', visibleWhen: [discreteHoles] }],
        ['discrete-extraction', 'Discrete on Extraction Side', { defaultSelected: false, visibleWhen: [discreteHoles] }],
        ['formulation', 'Injection Formulation', { options: ['Incompressible', 'Compressible'], value: 'Incompressible' }],
        ['cht-coupling', 'CHT Coupling', { defaultSelected: false, visibleWhen: [when('energy-enable', true)] }],
      ], [enabledPerforations, manualPerforations]),
    ],
  },
  {
    id: 'perforation-holes-dialog',
    title: 'Injection Holes Geometry',
    module: 'Boundary Conditions',
    subtitle: '记录教学孔位的中心坐标和孔径。',
    controls: fields('perforation-hole', 'Injection Holes', [
      ['coordinates', 'Center Coordinates'],
      ['diameter', 'Diameter (m)'],
    ]),
  },
].map((dialog) => ({ ...dialog, controls: dialog.controls.map((control) => ({ ...control, parentId: dialog.id })) }))

export const boundaryChildDialogs: FluentMockDialog[] = [
  {
    id: 'wall-roughness-dialog',
    title: 'Wall Roughness',
    module: 'Boundary Conditions',
    subtitle: '设置壁面粗糙高度和粗糙度常数。',
    controls: fields('wall-roughness', 'Wall Roughness', [
      ['height', 'Roughness Height (m)', { value: '0' }],
      ['constant', 'Roughness Constant', { value: '0.5' }],
    ]),
  },
  {
    id: 'shell-conduction-dialog',
    title: 'Shell Conduction Layers',
    module: 'Boundary Conditions',
    subtitle: '设置示例壳层的材料和厚度。',
    controls: fields('wall-shell', 'Shell Conduction', [
      ['count', 'Number of Layers', { value: '1', options: ['1', '2'] }],
      ['material', 'Layer 1 Material', { value: 'aluminum', options: ['aluminum', 'steel'] }],
      ['thickness', 'Layer 1 Thickness (m)', { value: '0.001' }],
      ['second-material', 'Layer 2 Material', { value: 'steel', options: ['aluminum', 'steel'], visibleWhen: [when('wall-shell-count', '2')] }],
      ['second-thickness', 'Layer 2 Thickness (m)', { value: '0.001', visibleWhen: [when('wall-shell-count', '2')] }],
    ]),
  },
  {
    id: 'pressure-outlet-backflow-dialog',
    title: 'Backflow Conditions',
    module: 'Boundary Conditions',
    subtitle: '选择出口发生回流时使用的回流压力指定方式。',
    controls: fields('pressure-outlet-backflow', 'Backflow', [
      ['pressure-type', 'Backflow Pressure Specification', { value: 'Total Pressure', options: ['Static Pressure', 'Total Pressure'] }],
    ]),
  },
].map((dialog) => ({
  ...dialog,
  controls: dialog.controls.map((control) => ({ ...control, parentId: dialog.id })),
}))

const specialBoundaries = [
  ['mass-flow-outlet', 'Mass-Flow Outlet', 'Outlet'],
  ['inlet-vent', 'Inlet Vent', 'Inlet'],
  ['outlet-vent', 'Outlet Vent', 'Outlet'],
  ['intake-fan', 'Intake Fan', 'Inlet'],
  ['exhaust-fan', 'Exhaust Fan', 'Outlet'],
  ['fan', 'Fan', 'Internal & Symmetry'],
  ['porous-jump', 'Porous Jump', 'Internal & Symmetry'],
  ['radiator', 'Radiator', 'Internal & Symmetry'],
  ['overset', 'Overset', 'Internal & Symmetry'],
  ['degassing', 'Degassing', 'Outlet'],
  ['rans-les-interface', 'RANS/LES Interface', 'Internal & Symmetry'],
] as const

export const extraBoundaryControls = specialBoundaries.map(([id, title, group]) =>
  makePanelControl('bc-' + id, title, 'Boundary Conditions', group, 'button', {
    dialogId: id + '-dialog',
    ...(id === 'degassing' ? {
      visibleWhen: [{ controlId: 'multiphase-model-select', values: ['Mixture', 'Eulerian'] }],
    } : {}),
  }),
)

const flowMethods = ['Mass Flow Rate', 'Mass Flux', 'Mass Flux with Average Mass Flux', 'Exit Corrected Mass Flow Rate']
const massOutlet = 'mass-flow-outlet'
const outletMethod = massOutlet + '-method'
const specialSettings: Record<string, FluentMockControl[]> = {
  [massOutlet]: [...fields(massOutlet, 'Momentum', [
    ['method', 'Mass Flow Specification Method', { value: flowMethods[0], options: flowMethods }],
    ['rate', 'Mass Flow Rate (kg/s)', { visibleWhen: [when(outletMethod, flowMethods[0])] }],
    ['flux', 'Mass Flux (kg/m²·s)', { visibleWhen: [when(outletMethod, flowMethods[1], flowMethods[2])] }],
    ['average-flux', 'Average Mass Flux (kg/m²·s)', { visibleWhen: [when(outletMethod, flowMethods[2])] }],
    ['corrected-rate', 'Exit Corrected Mass Flow Rate (kg/s)', { visibleWhen: [when(outletMethod, flowMethods[3])] }],
    ['corrected-temperature', 'ECMF Reference Temperature (K)', { visibleWhen: [when(outletMethod, flowMethods[3])] }],
    ['corrected-pressure', 'ECMF Reference Gauge Pressure (Pa)', { visibleWhen: [when(outletMethod, flowMethods[3])] }],
  ]),
    ...fields(massOutlet, 'Radiation', [['internal-emissivity', 'Internal Emissivity']]),
    ...fields(massOutlet, 'DPM', [['particle-bc', 'Discrete Phase BC Type', {
      value: 'escape', options: ['escape', 'reflect', 'trap'],
    }]]),
  ],
  'porous-jump': fields('porous-jump', 'Porous Jump', [
    ['permeability', 'Face Permeability (m²)'],
    ['thickness', 'Porous Medium Thickness (m)'],
    ['coefficient', 'Pressure-Jump Coefficient (1/m)'],
    ['contact-resistance', 'Thermal Contact Resistance', {
      visibleWhen: [when('energy-enable', true)],
    }],
  ]),
  fan: fields('fan', 'Pressure-Jump Specification', [
    ['reverse', 'Reverse Fan Direction', { defaultSelected: false }],
    ['pressure-profile', 'Pressure-Jump Profile', { value: 'constant', options: ['constant', 'polynomial', 'piecewise-linear'] }],
    ['jump', 'Pressure Jump (Pa)'],
    ['swirl-radial', 'Specify Tangential/Radial Velocity', { defaultSelected: false }],
    ['swirl-speed', 'Tangential Velocity (m/s)', { value: '0', visibleWhen: [when('fan-swirl-radial', true)] }],
    ['limit-velocity', 'Limit Polynomial Velocity Range', { defaultSelected: false }],
    ['min-velocity', 'Min Velocity Magnitude (m/s)', { visibleWhen: [when('fan-limit-velocity', true)] }],
    ['max-velocity', 'Max Velocity Magnitude (m/s)', { visibleWhen: [when('fan-limit-velocity', true)] }],
  ]),
  radiator: fields('radiator', 'Radiator', [
    ['loss', 'Loss Coefficient'],
    ['coefficient', 'Heat-Transfer-Coefficient', { visibleWhen: [when('energy-enable', true)] }],
    ['temperature', 'Temperature (K)', { visibleWhen: [when('energy-enable', true)] }],
  ]),
  degassing: fields('degassing', 'Degassing', [
    ['phase', 'Phase', { value: 'secondary', options: ['primary', 'secondary'] }],
  ]),
  'rans-les-interface': fields('rans-les-interface', 'RANS/LES Interface', [
    ['vortices', 'Number of Vortices'],
  ]),
}

export const extraBoundaryDialogs = specialBoundaries.map(([id, title, group]): FluentMockDialog => {
  const isVent = id.endsWith('-vent')
  const inlet = group === 'Inlet'
  const fanOrVent = isVent || id === 'intake-fan' || id === 'exhaust-fan'
  return {
    id: id + '-dialog',
    title,
    module: 'Boundary Conditions',
    subtitle: '当前窗口展示该边界类型的主要设置，输入由所选算例决定。',
    controls: [
      ...fields(id, 'Zone', [['zone-name', 'Zone Name', { value: id }]]),
      ...(specialSettings[id] ?? []),
      ...(fanOrVent ? fields(id, 'Momentum', [
        ['pressure', inlet ? 'Gauge Total Pressure (Pa)' : 'Gauge Pressure (Pa)'],
        isVent ? ['loss', 'Loss Coefficient'] : ['jump', 'Pressure Jump (Pa)'],
        ['temperature', inlet ? 'Total Temperature (K)' : 'Backflow Total Temperature (K)', {
          visibleWhen: [when('energy-enable', true)],
        }],
      ]) : []),
    ].map((control) => ({ ...control, parentId: id + '-dialog' })),
  }
})
