import { makeControl } from './controlHelpers'
import type { DialogTabGroup } from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'

export const multiphaseModels = ['Volume of Fluid (VOF)', 'Mixture', 'Eulerian']
export const aiadRegime = 'Algebraic Interfacial Area Density (AIAD)'
export const gentopRegime = 'Generalized Two Phase Flow (GENTOP)'
export const multiphaseDialogId = 'multiphase-model-dialog'

type Conditions = FluentVisibilityCondition[]
type Properties = Partial<FluentMockControl>

function when(controlId: string, ...values: FluentVisibilityCondition['values']): Conditions {
  return [{ controlId, values }]
}

const phaseModel = when('multiphase-model-select', ...multiphaseModels)
const vof = when('multiphase-model-select', multiphaseModels[0])
const mixture = when('multiphase-model-select', 'Mixture')
const eulerian = when('multiphase-model-select', 'Eulerian')
const wetSteam = when('multiphase-model-select', 'Wet Steam')
const vofOrEulerian = when('multiphase-model-select', multiphaseModels[0], 'Eulerian')
const mixtureOrEulerian = when('multiphase-model-select', 'Mixture', 'Eulerian')
const explicit = when('multiphase-vof-formulation', 'Explicit')
const secondary = when('multiphase-phase-secondary', true)
const granular = [...secondary, ...eulerian, ...when('multiphase-phase-granular', true)]
const notGranular = when('multiphase-phase-granular', false)

export const countOptions = ['0', '1', '2', '3', '4', '5']
function sequence(n: number) {
  return Array.from({ length: n }, (_, index) => String(index + 1))
}

function settings(parentId: string, group: string) {
  function control(id: string, label: string, properties: Properties): FluentMockControl {
    return makeControl({ id, label, parentId, group, module: 'Models', region: '模拟窗口', controlType: 'field', ...properties })
  }
  return {
    choice: (id: string, label: string, options: string[], visibleWhen?: Conditions, value = options[0]) =>
      control(id, label, { controlType: 'select', value, options, visibleWhen }),
    field: (id: string, label: string, value = '', visibleWhen?: Conditions, enabled = true) =>
      control(id, label, { value, visibleWhen, enabled }),
    toggle: (id: string, label: string, visibleWhen?: Conditions, defaultSelected = false) =>
      control(id, label, { controlType: 'checkbox', defaultSelected, visibleWhen }),
    button: (id: string, label: string, dialogId?: string, visibleWhen?: Conditions) =>
      control(id, label, { controlType: 'button', dialogId, visibleWhen }),
    alias: (item: FluentMockControl, id: string, visibleWhen = item.visibleWhen) =>
      control(id, item.label, { ...item, id, parentId, group, visibleWhen, valueId: item.id }),
  }
}

const model = settings(multiphaseDialogId, 'Multiphase')
const interaction = settings(multiphaseDialogId, 'Phase Pair')
const force = settings(multiphaseDialogId, 'Forces')
const phase = settings(multiphaseDialogId, 'Phases')
const heat = settings(multiphaseDialogId, 'Heat')
const mass = settings(multiphaseDialogId, 'Mass')
const reactions = settings(multiphaseDialogId, 'Reactions')
const area = settings(multiphaseDialogId, 'Interfacial Area')
const discretization = settings(multiphaseDialogId, 'Discretization')
const mpTurb = settings(multiphaseDialogId, 'Multiphase Turbulence')
const transition = settings(multiphaseDialogId, 'Model Transition')
const population = settings(multiphaseDialogId, 'Population Balance')
const hasMassTransfer = when('multiphase-mass-count', ...countOptions.slice(1))
const hasReactions = when('multiphase-reaction-count', ...countOptions.slice(1))
const hasTransition = when('multiphase-transition-count', ...countOptions.slice(1))
const interfaceOptions = ['Sharp', 'Dispersed', 'Sharp/Dispersed']
export const volumeFractionSchemeCondition = phaseModel
const hasSlip = [...mixture, ...when('mixture-slip', true)]
const surfaceTension = when('multiphase-surface-tension', true)
const regimeDraft = 'multiphase-eulerian-regime'
const appliedRegime = 'multiphase-eulerian-regime-applied'
const aiad = when(appliedRegime, aiadRegime)
const gentop = when(appliedRegime, gentopRegime)
const regimeMass = when('multiphase-regime-transfer-active', true)
const aiadDrag = when('multiphase-pair-drag', 'drag-aiad')

const phaseName = phase.field('multiphase-phase-name', 'Name')
const phaseMaterial = phase.choice('multiphase-phase-material', 'Phase Material', [])
const phaseId = phase.field('multiphase-phase-id', 'ID', '', undefined, false)
const phaseProperties = [
  phase.toggle('multiphase-phase-granular', 'Granular', [...secondary, ...eulerian]),
  phase.toggle('multiphase-phase-packed-bed', 'Packed Bed', granular),
  phase.toggle('multiphase-phase-iac', 'Interfacial Area Concentration', [...secondary, ...mixtureOrEulerian, ...notGranular]),
  phase.choice('multiphase-phase-diameter-method', 'Diameter Method', ['constant', 'user-defined', 'sauter-mean'], [...secondary, ...mixtureOrEulerian]),
  phase.field('secondary-phase-diameter', 'Diameter (m)', '0.001', [...secondary, ...mixtureOrEulerian, ...when('multiphase-phase-diameter-method', 'constant')]),
  phase.choice('multiphase-phase-granular-temperature-model', 'Granular Temperature Model', ['Phase Property', 'Partial Differential Equation'], granular),
  phase.toggle('multiphase-phase-approach-packing', 'Approach Packing Limit', granular),
  phase.field('multiphase-phase-packing-transition', 'Transition Factor', '', [...granular, ...when('multiphase-phase-approach-packing', true)]),
  phase.choice('multiphase-phase-granular-viscosity', 'Granular Viscosity', ['syamlal-obrien', 'gidaspow', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-bulk-viscosity', 'Granular Bulk Viscosity', ['lun-et-al', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-friction-viscosity', 'Frictional Viscosity', ['none', 'schaeffer', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-friction-pressure', 'Frictional Pressure', ['none', 'johnson-et-al', 'syamlal-obrien', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-conductivity', 'Granular Conductivity', ['syamlal-obrien', 'gidaspow', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-solids-pressure', 'Solids Pressure', ['lun-et-al', 'syamlal-obrien', 'constant', 'user-defined'], granular),
  phase.choice('multiphase-phase-radial-distribution', 'Radial Distribution', ['lun-et-al', 'syamlal-obrien', 'arastoopour', 'constant', 'user-defined'], granular),
  phase.field('multiphase-phase-elasticity', 'Elasticity Modulus', '', granular),
  phase.field('multiphase-phase-packing-limit', 'Packing Limit', '', granular),
  phase.choice('multiphase-phase-coalescence', 'Coalescence Kernel', ['none', 'hibiki-ishii', 'ishii-kim', 'yao-morel'], [...secondary, ...when('multiphase-phase-iac', true), ...notGranular, ...mixtureOrEulerian]),
  phase.choice('multiphase-phase-breakage', 'Breakage Kernel', ['none', 'hibiki-ishii', 'ishii-kim', 'yao-morel'], [...secondary, ...when('multiphase-phase-iac', true), ...notGranular, ...mixtureOrEulerian]),
]

const dragOptions = ['none', 'schiller-naumann', 'morsi-alexander', 'symmetric', 'grace', 'tomiyama', 'ishii-zuber', 'universal-drag', 'wen-yu', 'gidaspow', 'syamlal-obrien', 'huilin-gidaspow', 'gibilaro', 'constant', 'user-defined']
const pairForceSettings = [
  force.choice('multiphase-pair-drag', 'Drag Coefficient', dragOptions, mixtureOrEulerian),
  force.choice('multiphase-pair-drag-modification', 'Drag Modification', ['none', 'constant', 'brucato', 'wall-drag-enhancement', 'user-defined'], mixtureOrEulerian),
  force.field('multiphase-pair-drag-factor', 'Drag Modification Factor', '', [...mixtureOrEulerian, ...when('multiphase-pair-drag-modification', 'constant')]),
  force.choice('multiphase-pair-lift', 'Lift Coefficient', ['none', 'constant', 'moraga', 'saffman-mei', 'legendre-magnaudet', 'tomiyama', 'hessenkemper-et-al', 'user-defined'], eulerian),
  force.field('multiphase-pair-lift-value', 'Constant Lift Coefficient', '', [...eulerian, ...when('multiphase-pair-lift', 'constant')]),
  force.choice('multiphase-pair-virtual-mass', 'Virtual Mass Coefficient', ['none', 'constant', 'user-defined'], eulerian),
  force.field('multiphase-pair-virtual-mass-value', 'Constant Virtual Mass Coefficient', '', [...eulerian, ...when('multiphase-pair-virtual-mass', 'constant')]),
  force.choice('multiphase-pair-wall-lubrication', 'Wall Lubrication', ['none', 'lubchenko', 'shaver-podowski', 'antal-et-al', 'tomiyama', 'frank', 'hosakawa', 'user-defined'], [...eulerian, ...when('multiphase-num-phases', '2'), ...when('multiphase-case-has-granular', false)]),
  force.choice('multiphase-pair-dispersion', 'Turbulent Dispersion', ['none', 'lopez-de-bertodano', 'simonin', 'burns-et-al', 'diffusion-in-vof', 'user-defined'], [...eulerian, ...when('multiphase-pair-has-primary', true)]),
  force.choice('multiphase-pair-slip-law', 'Slip Velocity Function', ['manninen-et-al', 'user-defined'], [...hasSlip, ...when('multiphase-pair-has-primary', true)]),
  force.field('multiphase-surface-tension-coefficient', 'Surface Tension Coefficient (N/m)', '', surfaceTension),
  force.field('multiphase-pair-restitution', 'Restitution Coefficient', '', [...eulerian, ...when('multiphase-pair-is-granular', true)]),
].map((control) => ({ ...control, section: 'Phase Interaction', visibleWhen: [
  ...(control.visibleWhen ?? []), ...when('multiphase-regime-pair-forces', true),
  ...(['multiphase-pair-drag', 'multiphase-surface-tension-coefficient'].includes(control.id) ? [] : when('multiphase-regime-pair-extra-forces', true)),
  ...(control.id === 'multiphase-pair-dispersion' ? when('multiphase-regime-pair-dispersion', true) : []),
] }))

const hasHeat = [...eulerian, ...when('energy-enable', true)]
const hasChemistry = [...eulerian, ...when('species-model-select', 'Species Transport')]
const hasDiscretization = when('multiphase-interface-discretization-active', true)
const canTransition = [
  ...vof, ...when('dpm-enable', true), ...when('dpm-unsteady-tracking', true),
  ...when('multiphase-transition-geometry-available', true), ...when('multiphase-transition-injection-available', true),
  ...when('multiphase-coupled-level-set', false),
]
const massFunction = when('multiphase-mass-mechanism-function', 'evaporation-condensation')
const pbMethod = (method: string) => when('multiphase-pb-method', method)
const hasPB = when('multiphase-pb-method', 'Discrete', 'Inhomogeneous Discrete', 'Standard Moment', 'Quadrature Moment', 'DQMOM')

const modelControls = [
  model.choice('multiphase-model-select', 'Model', ['Off', ...multiphaseModels, 'Wet Steam']),
  model.choice('multiphase-num-phases', 'Number of Eulerian Phases', sequence(20).slice(1), phaseModel),
  model.toggle('multiphase-coupled-level-set', 'Coupled Level Set + VOF', [...vof, ...explicit, ...when('multiphase-num-phases', '2'), ...when('solver-time-formulation', 'Transient')]),
  model.choice('multiphase-vof-formulation', 'Volume Fraction Formulation', ['Explicit', 'Implicit'], vofOrEulerian),
  model.choice('multiphase-volume-fraction-scheme', 'Volume Fraction Scheme', [], volumeFractionSchemeCondition),
  model.field('multiphase-volume-cutoff', 'Volume Fraction Cutoff', '1e-6', [...vofOrEulerian, ...explicit]),
  model.field('vof-courant', 'Courant Number', '0.25', [...vofOrEulerian, ...explicit]),
  model.button('vof-expert-settings', 'Expert Options…', 'vof-expert-dialog', [...vofOrEulerian, ...explicit]),
  model.toggle('mixture-slip', 'Slip Velocity', mixture, true),
  model.toggle('multiphase-mixture-flow-regime', 'Flow Regime Modeling', hasSlip),
  { ...model.choice(regimeDraft, 'Regime Transition Modeling', ['Off', aiadRegime, gentopRegime], eulerian), optionDisplay: 'choices' as const },
  model.field('multiphase-gentop-calibration', 'Calibration Coefficient', '1.0', [...eulerian, ...when(regimeDraft, gentopRegime)]),
  model.toggle('multiphase-ddpm', 'Dense Discrete Phase Model', eulerian),
  model.choice('multiphase-ddpm-count', 'Number of Discrete Phases', sequence(20), [...eulerian, ...when('multiphase-ddpm', true)]),
  model.choice('multiphase-eulerian-interface', 'Hybrid Interface Model', ['Off', 'Multi-Fluid VOF Model'], eulerian),
  model.toggle('multiphase-boiling', 'Boiling Model', eulerian),
  model.button('multiphase-boiling-options', 'Boiling Options…', 'multiphase-boiling-dialog', [...eulerian, ...when('multiphase-boiling', true)]),
  model.toggle('multiphase-implicit-body-force', 'Implicit Body Force', phaseModel),
  model.toggle('multiphase-open-channel', 'Open Channel Flow', vof),
  model.toggle('multiphase-open-channel-wave', 'Open Channel Wave BC', [...vof, ...when('multiphase-open-channel', true)]),
  model.choice('multiphase-interface-type', 'Interface Modeling Type', interfaceOptions, when('multiphase-interface-active', true)),
  model.toggle('multiphase-interface-antidiffusion', 'Interfacial Anti-Diffusion', [...when('multiphase-interface-active', true), ...when('multiphase-interface-type', 'Sharp')]),
  model.button('multiphase-interface-options', 'Interface Modeling Options…', 'multiphase-interface-dialog', when('multiphase-interface-active', true)),
  model.button('multiphase-wet-steam-options', 'Wet Steam TUI Options…', 'multiphase-wet-steam-dialog', wetSteam),
].map((control) => ({ ...control, section: modelSection(control.id) }))

function modelSection(id: string) {
  if (id === 'multiphase-model-select' || id === 'multiphase-num-phases') return 'Model'
  if (id === regimeDraft || id === 'multiphase-gentop-calibration' || id === 'multiphase-mixture-flow-regime') return 'Regime Transition Modeling'
  if (id.startsWith('multiphase-ddpm') || id === 'multiphase-eulerian-interface') return 'Hybrid Models'
  if (id.startsWith('multiphase-boiling')) return 'Boiling Model'
  if (id.startsWith('multiphase-vof-') || id.startsWith('multiphase-volume-') || id.startsWith('vof-')) return 'Volume Fraction'
  return 'Options'
}

const phaseControls = [
  phase.choice('multiphase-phase-list', 'Phase', []),
  phase.button('multiphase-phase-add', 'Add Phase', undefined, when('multiphase-num-phases', ...sequence(19).slice(1))),
  phase.button('multiphase-phase-delete', 'Delete Phase', undefined, when('multiphase-phase-can-delete', true)),
  phaseId, phaseName, phaseMaterial,
  { ...phase.toggle('multiphase-aiad-primary-role', 'AIAD Continuous Phase Treatment (Primary)', [...aiad, ...when('multiphase-phase-secondary', false)], true), enabled: false, section: 'Phase Setup' },
  { ...phase.choice('multiphase-aiad-secondary-role', 'AIAD Phase Treatment (Secondary)', ['Off', 'AIAD Continuous Phase Treatment (Secondary)', 'AIAD Entrained Phase Treatment (Secondary)'], [...aiad, ...secondary]), section: 'Phase Setup' },
  { ...phase.toggle('multiphase-phase-gentop-hybrid', 'GENTOP Hybrid Phase Modeling', [...gentop, ...secondary]), section: 'Phase Setup' },
  phase.button('multiphase-primary', 'Edit Primary Phase…', 'primary-phase-dialog', when('multiphase-phase-secondary', false)),
  phase.button('multiphase-secondary', 'Edit Secondary Phase…', 'secondary-phase-dialog'),
  ...phaseProperties,
].map((control) => ({ ...control, section: control.section ?? (['multiphase-phase-list', 'multiphase-phase-add', 'multiphase-phase-delete'].includes(control.id) ? 'Phases' : 'Phase Setup') }))

const transferControls = [
  heat.choice('multiphase-pair-heat', 'Heat Transfer Coefficient', ['none', 'constant', 'ranz-marshall', 'gunn', 'hughmark', 'tomiyama', 'two-resistance', 'fixed-to-sat-temp', 'user-defined']),
  heat.field('multiphase-pair-heat-value', 'Constant Heat Transfer Coefficient', '', when('multiphase-pair-heat', 'constant')),
  heat.choice('multiphase-pair-heat-first-resistance', 'First Phase Resistance', ['zero-resistance', 'ranz-marshall', 'time-scale', 'user-defined'], when('multiphase-pair-heat', 'two-resistance')),
  heat.choice('multiphase-pair-heat-second-resistance', 'Second Phase Resistance', ['zero-resistance', 'ranz-marshall', 'time-scale', 'user-defined'], when('multiphase-pair-heat', 'two-resistance')),
  { ...mass.field('multiphase-regime-mass-mechanism', 'Regime Transition Mechanism', '', regimeMass, false), section: 'Regime Transition Modeling' },
  { ...mass.field('multiphase-regime-mass-path', 'Phase Transfer', '', regimeMass, false), section: 'Regime Transition Modeling' },
  { ...mass.button('multiphase-aiad-entrainment-options', 'Edit Entrainment…', 'aiad-entrainment-dialog', [...aiad, ...regimeMass]), section: 'Regime Transition Modeling' },
  mass.choice('multiphase-mass-count', 'Number of Mass Transfer Mechanisms', countOptions),
  mass.choice('multiphase-mass-index', 'Mass Transfer Mechanism', [], hasMassTransfer),
  mass.choice('multiphase-mass-mechanism-from', 'From Phase', [], hasMassTransfer),
  mass.choice('multiphase-mass-mechanism-to', 'To Phase', [], hasMassTransfer),
  {
    ...mass.choice('multiphase-mass-mechanism-function', 'Mechanism', ['none', 'constant-rate', 'user-defined', 'cavitation', 'evaporation-condensation', 'species-mass-transfer', 'boiling', 'population-balance'], hasMassTransfer),
    optionDialogs: {
      cavitation: 'multiphase-cavitation-dialog',
      'evaporation-condensation': 'multiphase-evaporation-dialog',
    },
  },
  mass.field('multiphase-mass-mechanism-rate', 'Mass Transfer Rate', '', [...hasMassTransfer, ...when('multiphase-mass-mechanism-function', 'constant-rate')]),
  mass.button('multiphase-mass-cavitation-options', 'Edit Cavitation…', 'multiphase-cavitation-dialog', [...hasMassTransfer, ...when('multiphase-mass-mechanism-function', 'cavitation')]),
  mass.button('multiphase-mass-evaporation-options', 'Edit Evaporation-Condensation…', 'multiphase-evaporation-dialog', [...hasMassTransfer, ...massFunction]),
  reactions.choice('multiphase-reaction-count', 'Total Number of Heterogeneous Reactions', countOptions),
  reactions.toggle('multiphase-reaction-stiff-chemistry', 'Heterogeneous Stiff Chemistry Solver', when('solver-time-formulation', 'Transient')),
  reactions.choice('multiphase-reaction-index', 'Reaction', [], hasReactions),
  reactions.field('multiphase-reaction-entry-name', 'Reaction Name', '', hasReactions),
  reactions.choice('multiphase-reaction-entry-method', 'Reaction Rate Function', ['Arrhenius', 'user-defined', 'population-balance'], hasReactions),
  ...(['reactants', 'products'] as const).flatMap((kind) => {
    const prefix = 'multiphase-reaction-entry-' + kind
    const label = kind === 'reactants' ? 'Reactant' : 'Product'
    return [
      reactions.choice(prefix + '-count', 'Number of ' + label + 's', sequence(3), hasReactions),
      ...sequence(3).flatMap((number) => {
        const visible = [...hasReactions, ...when(prefix + '-count', ...sequence(3).slice(Number(number) - 1))]
        return [
          reactions.choice(prefix + '-' + number + '-phase', label + ' ' + number + ' Phase', [], visible),
          reactions.field(prefix + '-' + number + '-species', label + ' ' + number + ' Species', '', visible),
          reactions.field(prefix + '-' + number + '-stoich', label + ' ' + number + ' Stoich. Coefficient', '1', visible),
        ]
      }),
    ]
  }),
  reactions.field('multiphase-reaction-entry-pre-exponential', 'Pre-Exponential Factor', '', [...hasReactions, ...when('multiphase-reaction-entry-method', 'Arrhenius')]),
  reactions.field('multiphase-reaction-entry-activation-energy', 'Activation Energy', '', [...hasReactions, ...when('multiphase-reaction-entry-method', 'Arrhenius')]),
]

const advancedControls = [
  area.choice('multiphase-pair-area', 'Interfacial Area Model', ['ia-symmetric', 'ia-particle', 'ia-gradient', 'ia-hybrid', 'user-defined', 'ia-aiad']),
  discretization.toggle('multiphase-compressive', 'Phase Localized Compressive Scheme', when('multiphase-interface-localized', true)),
  discretization.field('multiphase-pair-slope-limiter', 'Slope Limiter (0–2)', '1', [...when('multiphase-interface-localized', true), ...when('multiphase-compressive', true)]),
  mpTurb.choice('multiphase-pair-turb-int', 'Turbulence Interaction Model', ['none', 'simonin', 'troshko-hassan', 'sato', 'user-defined'], [...eulerian, ...when('viscous-inviscid', false), ...when('viscous-laminar', false)]),
  mpTurb.field('multiphase-pair-disp-pr', 'Dispersion Prandtl Number', '0.75', [...eulerian, ...when('viscous-inviscid', false), ...when('viscous-laminar', false)]),
  transition.choice('multiphase-transition-count', 'Number of Model Transition Mechanisms', countOptions),
  transition.choice('multiphase-transition-index', 'Model Transition Mechanism', [], hasTransition),
  transition.choice('multiphase-transition-entry-kind', 'Mechanism', ['vof-to-dpm', 'dpm-to-vof'], hasTransition),
  transition.choice('multiphase-transition-entry-phase', 'Transitioning Phase', [], hasTransition),
  transition.choice('multiphase-transition-entry-balancing-phase', 'Volume-Balancing Eulerian Phase', [], hasTransition),
  transition.choice('multiphase-transition-entry-injection', 'Injection', [], hasTransition),
  transition.button('multiphase-transition-parameters', 'Transition Parameters…', 'vof-model-transition-dialog', hasTransition),
  population.choice('multiphase-pb-method', 'Method', ['Off', 'Discrete', 'Inhomogeneous Discrete', 'Standard Moment', 'Quadrature Moment', 'DQMOM']),
  population.choice('multiphase-pb-phase', 'Phase', [], hasPB),
  population.field('multiphase-pb-bins', 'Bins', '', when('multiphase-pb-method', 'Discrete', 'Inhomogeneous Discrete')),
  population.choice('multiphase-pb-definition', 'Definition', ['Geometric Ratio', 'File'], when('multiphase-pb-method', 'Discrete')),
  population.field('multiphase-pb-ratio-exponent', 'Ratio Exponent', '', [...pbMethod('Discrete'), ...when('multiphase-pb-definition', 'Geometric Ratio')]),
  population.field('multiphase-pb-bin-file', 'Bin Definition File', '', [...pbMethod('Discrete'), ...when('multiphase-pb-definition', 'File')]),
  population.field('multiphase-pb-moments', 'Moments', '', when('multiphase-pb-method', 'Standard Moment', 'Quadrature Moment')),
  population.field('multiphase-pb-min-diameter', 'Min Diameter (m)', '', hasPB),
  population.field('multiphase-pb-max-diameter', 'Max Diameter (m)', '', hasPB),
  population.choice('multiphase-pb-nucleation', 'Nucleation Rate', ['none', 'constant', 'user-defined'], hasPB),
  population.choice('multiphase-pb-growth', 'Growth Rate', ['none', 'constant', 'user-defined'], hasPB),
  population.field('multiphase-gentop-pb-kernels', 'Aggregation and Breakage', 'Enabled', gentop, false),
  population.choice('multiphase-pb-aggregation', 'Aggregation Kernel', ['none', 'constant', 'luo-model', 'free-molecular-model', 'turbulent-model', 'prince-blanch-model', 'liao-aggregation-model', 'user-defined'], hasPB),
  population.field('multiphase-pb-aggregation-rate', 'Aggregation Rate', '', [...hasPB, ...when('multiphase-pb-aggregation', 'constant')]),
]

export const multiphaseTabs: DialogTabGroup[] = [
  { id: 'model', label: 'Models', groups: ['Multiphase'] },
  { id: 'phases', label: 'Phases', groups: ['Phases'], visibleWhen: phaseModel },
  { id: 'phase-interaction', label: 'Phase Interaction', groups: [], visibleWhen: phaseModel },
  { id: 'forces', parentId: 'phase-interaction', label: 'Forces', groups: ['Phase Pair', 'Forces'] },
  { id: 'transfer', parentId: 'phase-interaction', label: 'Heat, Mass, Reactions', groups: [] },
  { id: 'heat', parentId: 'transfer', label: 'Heat', groups: ['Phase Pair', 'Heat'], visibleWhen: hasHeat },
  { id: 'mass', parentId: 'transfer', label: 'Mass', groups: ['Mass'] },
  { id: 'reactions', parentId: 'transfer', label: 'Reactions', groups: ['Reactions'], visibleWhen: hasChemistry },
  { id: 'area', parentId: 'phase-interaction', label: 'Interfacial Area', groups: ['Phase Pair', 'Interfacial Area'], visibleWhen: when('multiphase-interfacial-area-active', true) },
  { id: 'discretization', parentId: 'phase-interaction', label: 'Discretization', groups: ['Phase Pair', 'Discretization'], visibleWhen: hasDiscretization },
  { id: 'mp-turbulence', parentId: 'phase-interaction', label: 'Turbulence', groups: ['Phase Pair', 'Multiphase Turbulence'], visibleWhen: [...eulerian, ...when('viscous-inviscid', false), ...when('viscous-laminar', false)] },
  { id: 'transition', parentId: 'phase-interaction', label: 'Model Transition', groups: ['Model Transition'], visibleWhen: canTransition },
  { id: 'population-balance', label: 'Population Balance', groups: ['Population Balance'], visibleWhen: mixtureOrEulerian },
]

function child(id: string, title: string, subtitle: string, getControls: (setup: ReturnType<typeof settings>) => FluentMockControl[]): FluentMockDialog {
  return { id, title, module: 'Models', subtitle, controls: getControls(settings(id, title)) }
}

export const multiphaseDialogs: FluentMockDialog[] = [
  {
    id: multiphaseDialogId,
    title: 'Multiphase Model',
    module: 'Models',
    subtitle: '根据 Fluent 2024 R2 用户指南演示模型、相属性和相间作用的设置路径。数值字段用于教学配置。',
    controls: [
      ...modelControls, ...phaseControls,
      interaction.choice('multiphase-pair-list', 'Phase Pairs', []),
      force.toggle('multiphase-surface-tension', 'Surface Tension Force Modeling', phaseModel),
      force.choice('multiphase-surface-tension-model', 'Surface Tension Model', ['Continuum Surface Force', 'Continuum Surface Stress'], [...surfaceTension, ...vofOrEulerian]),
      force.toggle('multiphase-wall-adhesion', 'Wall Adhesion', surfaceTension),
      force.toggle('multiphase-jump-adhesion', 'Jump Adhesion', surfaceTension),
      force.toggle('multiphase-shaver-podowski', 'Shaver-Podowski Lift Correlation', eulerian),
      ...pairForceSettings.flatMap((control) => control.id === 'multiphase-pair-drag'
        ? [control, { ...force.button('multiphase-aiad-drag-options', 'Edit AIAD Parameters…', 'aiad-parameters-dialog', aiadDrag), section: control.section }] : [control]),
      ...transferControls, ...advancedControls,
    ],
  },
  child('primary-phase-dialog', 'Primary Phase Setup', '查看和编辑主相的属性。', (setup) =>
    [setup.alias(phaseId, 'primary-phase-id'), setup.alias(phaseName, 'primary-phase-name'), setup.alias(phaseMaterial, 'primary-phase-material')]),
  child('secondary-phase-dialog', 'Secondary Phase Setup', '查看和编辑所选次相的属性。', (setup) =>
    [phaseId, phaseName, phaseMaterial, ...phaseProperties].map((item) => setup.alias(item, item.id + '-editor'))),
  child('vof-expert-dialog', 'VOF Expert Options', 'Explicit 体积分数推进的子时间步设置。', (setup) => [
    setup.choice('vof-sub-time-step', 'Sub-Time Step Calculation Method', ['Flux Based', 'Flux Averaged', 'Hybrid', 'Velocity Based']),
    setup.toggle('vof-solve-every-iteration', 'Solve VOF Every Iteration'),
  ]),
  child('aiad-parameters-dialog', 'AIAD Model Parameters', '分开设置液滴场与气泡场的直径、曳力与混合参数。', (setup) =>
    (['Droplets Field', 'Bubbles Field'] as const).flatMap((section) => {
      const prefix = 'multiphase-aiad-' + section.split(' ')[0].toLowerCase()
      return [
        setup.field(prefix + '-diameter', 'Diameter (m)'),
        setup.choice(prefix + '-drag-method', 'Drag Coefficient Method', ['constant', 'user-defined']),
        setup.field(prefix + '-drag-value', 'Drag Coefficient', '', when(prefix + '-drag-method', 'constant')),
        setup.field(prefix + '-blending', 'Blending Coefficient'),
        setup.field(prefix + '-limit', 'Limit Volume Fraction'),
      ].map((control) => ({ ...control, section }))
    })),
  child('aiad-entrainment-dialog', 'AIAD Entrainment Parameters', '设置卷吸相生成系数。', (setup) => [
    setup.field('multiphase-aiad-formation', 'Entrained Phase Formation Coefficient'),
  ]),
  child('multiphase-interface-dialog', 'Interface Modeling Options', '选择网格区域或相对上的界面离散方式。', (setup) => [
    setup.toggle('multiphase-interface-zonal', 'Zonal Discretization'),
    setup.toggle('multiphase-interface-localized', 'Phase Localized Discretization', hasDiscretization),
  ]),
  child('multiphase-boiling-dialog', 'Boiling Model', 'Eulerian 壁面沸腾设置。临界热流模型的相配置须按实际算例核对。', (setup) => [
    setup.choice('multiphase-boiling-variant', 'Boiling Options', ['RPI Boiling Model', 'Non-equilibrium Boiling', 'Critical Heat Flux']),
  ]),
  child('multiphase-cavitation-dialog', 'Cavitation Model', '配置此传质机制的空化模型与蒸气压力。', (setup) => [
    setup.choice('multiphase-mass-mechanism-cavitation', 'Cavitation Model', ['Schnerr-Sauer', 'Zwart-Gerber-Belamri']),
    setup.field('multiphase-mass-mechanism-vaporization-pressure', 'Vaporization Pressure (Pa)'),
  ]),
  child('multiphase-evaporation-dialog', 'Evaporation-Condensation Model', '配置此传质机制的饱和温度及适用模型参数。', (setup) => [
    setup.choice('multiphase-mass-mechanism-evaporation', 'Model', ['Lee', 'Thermal Phase Change', 'Semi-Mechanistic'], mixtureOrEulerian),
    setup.field('multiphase-mass-mechanism-saturation', 'Saturation Temperature (K)'),
    setup.field('multiphase-mass-mechanism-from-frequency', 'From Phase Frequency (1/s)', '', when('multiphase-mass-mechanism-evaporation', 'Lee')),
    setup.field('multiphase-mass-mechanism-to-frequency', 'To Phase Frequency (1/s)', '', when('multiphase-mass-mechanism-evaporation', 'Lee')),
  ]),
  child('vof-model-transition-dialog', 'Transition Parameters', '记录液滴转换机制的设置。喷射对象在 Discrete Phase 下定义。', (setup) => [
    setup.field('multiphase-transition-entry-frequency', 'Frequency', '', when('multiphase-transition-entry-kind', 'vof-to-dpm')),
    setup.toggle('multiphase-transition-entry-coarsen', 'Coarsen the Mesh Immediately where Lumps are Transitioned', when('multiphase-transition-entry-kind', 'vof-to-dpm'), true),
    setup.field('multiphase-transition-entry-asphericity', 'Maximum Asphericity by Radius Standard Deviation', '', when('multiphase-transition-entry-kind', 'vof-to-dpm')),
    setup.field('multiphase-transition-entry-min-diameter', 'Minimum Lump Diameter (m)', '', when('multiphase-transition-entry-kind', 'vof-to-dpm')),
    setup.field('multiphase-transition-entry-max-diameter', 'Maximum Lump Diameter (m)', '', when('multiphase-transition-entry-kind', 'vof-to-dpm')),
    setup.field('multiphase-transition-entry-min-vof', 'VOF Phase Volume Fraction Threshold', '', when('multiphase-transition-entry-kind', 'dpm-to-vof')),
  ]),
  child('multiphase-wet-steam-dialog', 'Wet Steam TUI Options', 'Fluent 2024 R2 中，以下选项通过 TUI 配置。此处用表单演示设置。', (setup) => [
    setup.choice('multiphase-wet-steam-growth', 'Droplet Growth Formula', ['Young', 'Hill']),
    setup.choice('multiphase-wet-steam-eos', 'Virial Equation of State', ['Vukalovich', 'Young']),
  ]),
]
