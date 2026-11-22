import { aiadRegime, countOptions, gentopRegime, multiphaseModels } from '../data/multiphaseDialogs'
import type { FluentSimState } from './fluentSimState'

type Override = FluentSimState['controlOverrides']
const phaseScopeIds = ['multiphase-phase-name', 'multiphase-phase-material', 'secondary-phase-diameter', 'multiphase-aiad-secondary-role']
const pairScopeIds = ['multiphase-surface-tension-coefficient']
const modelScopedSettings = new Set([
  'multiphase-vof-formulation', 'multiphase-volume-fraction-scheme', 'multiphase-volume-cutoff',
  'vof-courant', 'vof-sub-time-step', 'vof-solve-every-iteration',
  'multiphase-interface-type', 'multiphase-interface-antidiffusion', 'multiphase-interface-zonal',
  'multiphase-interface-localized', 'multiphase-compressive', 'multiphase-implicit-body-force',
  'multiphase-surface-tension', 'multiphase-surface-tension-model', 'multiphase-wall-adhesion', 'multiphase-jump-adhesion',
])
const recordScopes = [
  ['multiphase-mass-mechanism-', 'multiphase-mass'],
  ['multiphase-reaction-entry-', 'multiphase-reaction'],
  ['multiphase-transition-entry-', 'multiphase-transition'],
]
const option = (value: string, label = value) => ({ value, label })
type MultiphaseOption = ReturnType<typeof option> & { disabled?: boolean; reason?: string }
const regimeKey = 'multiphase-eulerian-regime'
const regimeAppliedKey = regimeKey + '-applied'
const continuousRole = 'AIAD Continuous Phase Treatment (Secondary)'
const entrainedRole = 'AIAD Entrained Phase Treatment (Secondary)'

export const derivedMultiphaseControls = [
  regimeAppliedKey,
  'multiphase-phase-secondary', 'multiphase-pair-has-primary', 'multiphase-pair-is-granular',
  'multiphase-case-has-granular', 'multiphase-interface-active', 'multiphase-interface-discretization-active',
  'multiphase-interfacial-area-active', 'multiphase-transition-injection-available',
  'multiphase-transition-geometry-available',
  'multiphase-regime-transfer-active', 'multiphase-regime-pair-forces', 'multiphase-regime-pair-extra-forces',
  'multiphase-regime-pair-dispersion', 'multiphase-phase-can-delete',
]

export function eulerianRegime(state: FluentSimState) {
  return state.multiphaseModel === 'Eulerian' ? String(state.controlOverrides[regimeAppliedKey] ?? 'Off') : 'Off'
}

function regimeOptions(state: FluentSimState): MultiphaseOption[] {
  const settings = state.controlOverrides
  const commonConflict = settings['multiphase-ddpm'] === true ? 'Disable Dense Discrete Phase Model first.'
    : settings['multiphase-boiling'] === true ? 'Disable the Boiling Model first.' : undefined
  const gentopConflict = commonConflict ?? (settings['multiphase-eulerian-interface'] === 'Multi-Fluid VOF Model' ? 'Disable Multi-Fluid VOF Model first.'
    : state.speciesModel === 'Species Transport' ? 'Disable Species Transport first.' : undefined)
  return [option('Off'), { ...option(aiadRegime), disabled: Boolean(commonConflict), reason: commonConflict },
    { ...option(gentopRegime), disabled: Boolean(gentopConflict), reason: gentopConflict }]
}

function phaseWithRole(state: FluentSimState, id: string, value: string | boolean) {
  return state.phaseIds.slice(1).find((phase) => state.controlOverrides[`phase:${phase}:${id}`] === value)
}

export function validateEulerianPhaseMaterials(state: FluentSimState) {
  const material = (id: string) => phaseMaterial(state, id)
  const regime = eulerianRegime(state)
  if (regime === aiadRegime) {
    const continuous = phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole)
    const entrained = phaseWithRole(state, 'multiphase-aiad-secondary-role', entrainedRole)
    if (continuous && material('1') === material(continuous)) return 'AIAD 次级连续相与主相必须使用不同材料。'
    if (continuous && entrained && material(continuous) !== material(entrained)) return 'AIAD 卷吸相必须与次级连续相使用相同材料。'
  }
  if (regime === gentopRegime && state.phaseIds.slice(1).some((id) => material(id) === material('1') || material(id) !== material(state.phaseIds[1]))) {
    return 'GENTOP 的所有次相应使用相同材料，并与主相材料不同。'
  }
}

function isRegimePair(state: FluentSimState, phase: string | undefined) {
  return Boolean(phase && selectedPair(state) === '1/' + phase)
}

export function isEulerianRegimeControlLocked(state: FluentSimState, id: string) {
  const active = eulerianRegime(state)
  if (active === 'Off') return false
  if (['multiphase-ddpm', 'multiphase-boiling', 'multiphase-eulerian-interface'].includes(id)) return true
  if (active === aiadRegime) return ['multiphase-interface-type', 'multiphase-interface-options', 'multiphase-interface-localized',
    'multiphase-surface-tension', 'viscous-eulerian-turbulence'].includes(id)
  return id === 'multiphase-pb-method' || (id === 'multiphase-pb-bins' &&
    getMultiphaseValue(state, 'multiphase-pb-phase') === phaseWithRole(state, 'multiphase-phase-gentop-hybrid', true))
}

export function setEulerianRegime(state: FluentSimState, value: string) {
  if (state.multiphaseModel !== 'Eulerian' || !regimeOptions(state).some((item) => item.value === value && !item.disabled)) return state
  return { ...state, controlOverrides: { ...state.controlOverrides, [regimeKey]: value } }
}

export function applyEulerianRegime(state: FluentSimState, discard = false): FluentSimState {
  if (state.multiphaseModel !== 'Eulerian') return state
  const applied = eulerianRegime(state)
  const target = getMultiphaseValue(state, regimeKey) ?? 'Off'
  if (discard) return target === applied ? state : setEulerianRegime(state, applied)
  if (target === applied || !regimeOptions(state).some(({ value, disabled }) => value === target && !disabled)) return state
  const next = { ...state, controlOverrides: { ...state.controlOverrides, [regimeAppliedKey]: target } }
  if (target === gentopRegime) return state.phaseIds.length < 3 ? resizePhases(next, 3) : next
  if (target !== aiadRegime) return next
  return {
    ...next,
    timeFormulation: 'transient', gravityEnabled: true, viscousModel: 'k-omega-sst', kOmegaSubModel: 'sst',
    controlOverrides: {
      ...next.controlOverrides,
      'model:Eulerian:multiphase-surface-tension-model': 'Continuum Surface Stress',
      'viscous-aiad-damping': true,
      'viscous-aiad-subgrid': true,
    },
  }
}

export function setEulerianPhaseTreatment(state: FluentSimState, id: string, value: string | boolean) {
  const phase = selectedPhase(state)
  const aiad = id === 'multiphase-aiad-secondary-role'
  if (phase === '1' || eulerianRegime(state) !== (aiad ? aiadRegime : gentopRegime)) return state
  if (!aiad && typeof value !== 'boolean') return state
  if (aiad && !getMultiphaseOptions(state, id)?.some((item) => item.value === value && !item.disabled)) return state
  const controlOverrides = { ...state.controlOverrides }
  const previous = phaseWithRole(state, id, value)
  if (value !== 'Off' && value !== false && previous && previous !== phase) delete controlOverrides[`phase:${previous}:${id}`]
  if (aiad && controlOverrides[`phase:${phase}:${id}`] === continuousRole && value !== continuousRole) {
    const entrained = phaseWithRole(state, id, entrainedRole)
    if (entrained) delete controlOverrides[`phase:${entrained}:${id}`]
  }
  controlOverrides[`phase:${phase}:${id}`] = value
  return { ...state, controlOverrides }
}

function phasePairs(ids: string[]) {
  return ids.flatMap((first, index) => ids.slice(index + 1).map((second) => first + '/' + second))
}

function selectedPhase(state: FluentSimState) {
  const id = String(state.controlOverrides['multiphase-phase-list'] ?? '')
  return state.phaseIds.includes(id) ? id : state.phaseIds[0]
}

function selectedPair(state: FluentSimState, controlId = 'multiphase-pair-list') {
  const id = String(state.controlOverrides[controlId] ?? '')
  const [first, second] = id.split('/')
  const index = state.phaseIds.indexOf(first)
  return index >= 0 && index < state.phaseIds.indexOf(second)
    ? id : state.phaseIds.slice(0, 2).join('/')
}

function recordIndex(state: FluentSimState, group: string) {
  const prefix = state.multiphaseModel + ':' + group
  return Math.min(Math.max(1, Number(state.controlOverrides[prefix + '-index']) || 1),
    Math.max(1, getMultiphaseRecordCount(state, group)))
}

export function getMultiphaseRecordCount(state: FluentSimState, group: string) {
  const count = state.controlOverrides[`${state.multiphaseModel}:${group}-count`]
  return typeof count === 'string' && countOptions.includes(count) ? Number(count) : 0
}

export function multiphaseSettingKey(state: FluentSimState, id: string) {
  if (modelScopedSettings.has(id)) return `model:${state.multiphaseModel}:${id}`
  if (id === 'multiphase-pb-bins' && eulerianRegime(state) === gentopRegime) return `phase:${getMultiphaseValue(state, 'multiphase-pb-phase')}:${id}`
  if (id === 'wall-contact-angle') return `wall-contact:${selectedPair(state, 'wall-contact-angle-pair')}:${id}`
  if (/^(velocity-inlet|pressure-inlet|pressure-outlet|mass-flow-inlet)-volume-fraction$/.test(id)) {
    const phase = getMultiphaseValue(state, id.replace(/volume-fraction$/, 'phase-selection'))
    return `boundary-phase:${phase}:${id}`
  }
  if (!id.startsWith('multiphase-') && id !== 'secondary-phase-diameter') return id
  if (phaseScopeIds.includes(id) || /^multiphase-phase-(?!list|id|secondary|add|delete)/.test(id)) {
    return `phase:${selectedPhase(state)}:${id}`
  }
  if (pairScopeIds.includes(id) || /^multiphase-pair-(?!list)/.test(id)) {
    return `pair:${selectedPair(state)}:${state.multiphaseModel}:${id}`
  }
  const record = recordScopes.find(([prefix]) => id.startsWith(prefix))
  if (record) return `${state.multiphaseModel}:${recordIndex(state, record[1])}:${id}`
  if (recordScopes.some(([, group]) => id === group + '-count' || id === group + '-index')) {
    return `${state.multiphaseModel}:${id}`
  }
  return id
}

function modelSetting(state: FluentSimState, id: string) {
  return state.controlOverrides[multiphaseSettingKey(state, id)] ?? state.controlOverrides[id]
}

function phaseName(state: FluentSimState, id: string) {
  const name = state.controlOverrides[`phase:${id}:multiphase-phase-name`]
  return typeof name === 'string' && name.trim() ? name.trim() : 'phase-' + id
}

function phaseMaterial(state: FluentSimState, id: string) {
  return String(state.controlOverrides[`phase:${id}:multiphase-phase-material`] ?? (id === '1' ? 'air' : 'water-liquid'))
}

function phaseOptions(state: FluentSimState, ids = state.phaseIds) {
  return ids.map((id) => option(id, phaseName(state, id)))
}

function volumeFractionSchemes(state: FluentSimState) {
  const explicit = getMultiphaseValue(state, 'multiphase-vof-formulation') === 'Explicit'
  const firstOrder = 'First Order Upwind'
  const diffuse = [firstOrder, 'QUICK']
  const sharpen = ['Compressive', 'Modified HRIC']
  if (state.multiphaseModel === 'Eulerian' && getMultiphaseValue(state, 'multiphase-eulerian-interface') !== 'Multi-Fluid VOF Model') {
    return [...diffuse, 'Modified HRIC', ...(explicit ? ['Compressive'] : [])]
  }
  const type = getMultiphaseValue(state, 'multiphase-interface-type')
  if (state.multiphaseModel === 'Mixture') return type === 'Dispersed' ? diffuse : sharpen
  if (type === 'Dispersed') return explicit ? diffuse : [firstOrder, 'Second Order Upwind', 'QUICK']
  if (type === 'Sharp/Dispersed') return sharpen
  if (explicit) return ['Geo-Reconstruct', 'CICSAM', ...sharpen]
  return state.timeFormulation === 'steady' ? [sharpen[0], 'BGM', sharpen[1]] : sharpen
}

export function getMultiphaseOptions(state: FluentSimState, id: string): MultiphaseOption[] | undefined {
  if (/^(velocity-inlet|pressure-inlet|pressure-outlet|mass-flow-inlet)-phase-selection$/.test(id)) {
    return phaseOptions(state, state.phaseIds.slice(1))
  }
  if (id === 'multiphase-pair-list' || id === 'wall-contact-angle-pair') {
    return phasePairs(state.phaseIds).map((pair) => option(pair, pair.split('/').map((phase) => phaseName(state, phase)).join(' / ')))
  }
  if (!id.startsWith('multiphase-')) return
  const regime = eulerianRegime(state)
  if (id === regimeKey) return regimeOptions(state)
  if (id === 'multiphase-num-phases') return Array.from({ length: 21 - (regime === gentopRegime ? 3 : 2) }, (_, index) =>
    option(String(index + (regime === gentopRegime ? 3 : 2))))
  if (id === 'multiphase-aiad-secondary-role') {
    const phase = selectedPhase(state)
    const continuous = phaseWithRole(state, id, continuousRole)
    const allowed = state.phaseIds.length >= 3 && Boolean(continuous && continuous !== phase)
    return [option('Off'), option(continuousRole), { ...option(entrainedRole), disabled: !allowed,
      reason: allowed ? undefined : 'Define a separate AIAD secondary continuous phase and add a third Eulerian phase.' }]
  }
  if (id === 'multiphase-pair-area') {
    if (regime === aiadRegime && isRegimePair(state, phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole))) return [option('ia-aiad')]
    return ['ia-symmetric', 'ia-particle', 'ia-gradient', 'ia-hybrid', 'user-defined'].map((value) => option(value))
  }
  if (id === 'multiphase-vof-formulation') {
    return (state.timeFormulation === 'transient' ? ['Explicit', 'Implicit'] : ['Implicit']).map((value) => option(value))
  }
  if (id === 'multiphase-volume-fraction-scheme') return volumeFractionSchemes(state).map((value) => option(value))
  if (id === 'multiphase-interface-type') {
    return (state.multiphaseModel === 'Mixture' ? ['Sharp/Dispersed', 'Dispersed'] : ['Sharp', 'Dispersed', 'Sharp/Dispersed'])
      .map((value) => option(value))
  }
  if (id === 'multiphase-model-select') {
    return ['Off', ...(state.solverType === 'pressure-based' ? multiphaseModels : []), 'Wet Steam'].map((value) => option(value))
  }
  if (id === 'multiphase-phase-list') return phaseOptions(state)
  if (id === 'multiphase-pb-phase') return phaseOptions(state, state.phaseIds.slice(1))
  if (id === 'multiphase-phase-material') return state.materials.fluids.map((value) => option(value))
  if (id === 'multiphase-transition-entry-injection') return Object.keys(state.dpmInjections).map((value) => option(value))
  if (id === 'multiphase-mass-mechanism-function') {
    return ['none', 'constant-rate', 'user-defined', 'cavitation', 'evaporation-condensation',
      ...(state.speciesModel === 'Species Transport' ? ['species-mass-transfer'] : []),
      ...(state.multiphaseModel === 'Eulerian' && state.controlOverrides['multiphase-boiling'] ? ['boiling'] : []),
      ...(state.controlOverrides['multiphase-pb-method'] && state.controlOverrides['multiphase-pb-method'] !== 'Off' ? ['population-balance'] : []),
    ].map((value) => option(value))
  }
  if (id === 'multiphase-mass-mechanism-evaporation') {
    const options = state.multiphaseModel === 'Eulerian' ? ['Lee', 'Thermal Phase Change']
      : state.multiphaseModel === 'Mixture' ? ['Lee', 'Semi-Mechanistic'] : ['Lee']
    return options.map((value) => option(value))
  }
  if (id === 'multiphase-pair-drag') {
    const common = ['none', 'schiller-naumann', 'morsi-alexander', 'symmetric', 'constant', 'user-defined']
    if (state.multiphaseModel === 'Mixture') {
      const flowRegime = state.controlOverrides['mixture-slip'] !== false && state.controlOverrides['multiphase-mixture-flow-regime'] === true
      return [...common, ...(flowRegime ? ['drag-hybrid'] : [])].map((value) => option(value))
    }
    if (regime === aiadRegime && isRegimePair(state, phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole))) return [option('drag-aiad')]
    if (regime === gentopRegime && isRegimePair(state, phaseWithRole(state, 'multiphase-phase-gentop-hybrid', true))) {
      return ['ishii-zuber', 'grace', 'universal-drag'].map((value) => option(value))
    }
    return [...common, 'ishii', 'grace', 'tomiyama', 'ishii-zuber', 'anisotropic', 'universal-drag', 'wen-yu', 'gidaspow',
      'syamlal-obrien', 'syamlal-obrien-para', 'syamlal-obrien-symmetric', 'huilin-gidaspow', 'gibilaro', 'emms', 'filtered',
      ...(state.controlOverrides['multiphase-pb-method'] && state.controlOverrides['multiphase-pb-method'] !== 'Off' ? ['schiller-naumann-pb', 'wen-yu-pb'] : []),
    ].map((value) => option(value))
  }
  const record = recordScopes.find(([, group]) => id === group + '-index')
  if (record) {
    const count = getMultiphaseRecordCount(state, record[1])
    return Array.from({ length: count }, (_, index) => option(String(index + 1)))
  }
  if (/^multiphase-(mass-mechanism-(from|to)|transition-entry-(phase|balancing-phase)|reaction-entry-.*-phase)$/.test(id)) {
    return phaseOptions(state)
  }
}

export function getMultiphaseValue(state: FluentSimState, id: string): string | undefined {
  const regime = eulerianRegime(state)
  if (id === regimeAppliedKey) return regime
  if (id === regimeKey) return regimeOptions(state).find((item) => item.value === state.controlOverrides[regimeKey] && !item.disabled)?.value ?? regime
  if (regime === aiadRegime) {
    if (id === 'multiphase-eulerian-interface') return 'Multi-Fluid VOF Model'
    if (id === 'multiphase-interface-type') return 'Sharp/Dispersed'
    if (id === 'multiphase-surface-tension-model') return modelSetting(state, id)?.toString() ?? 'Continuum Surface Stress'
    if (id === 'viscous-eulerian-turbulence') return 'Per Phase'
  }
  if (id === 'multiphase-eulerian-interface') return String(state.controlOverrides[id] ?? 'Off')
  if (regime === gentopRegime && id === 'multiphase-pb-method') return 'Inhomogeneous Discrete'
  if (regime === gentopRegime && id === 'multiphase-pb-bins' && isEulerianRegimeControlLocked(state, id)) return '1'
  if (id === 'multiphase-regime-mass-mechanism') return regime === aiadRegime ? 'aiad-entrained-absorption' : 'gentop-complete-coalescence'
  if (id === 'multiphase-regime-mass-path') {
    const target = regime === aiadRegime ? phaseWithRole(state, 'multiphase-aiad-secondary-role', entrainedRole)
      : phaseWithRole(state, 'multiphase-phase-gentop-hybrid', true)
    const source = regime === aiadRegime ? [phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole)]
      : state.phaseIds.slice(1).filter((phase) => phase !== target)
    return target ? `${source.filter((phase): phase is string => Boolean(phase)).map((phase) => phaseName(state, phase)).join(', ')} → ${phaseName(state, target)}` : ''
  }
  switch (id) {
    case 'multiphase-num-phases': return String(state.phaseIds.length)
    case 'multiphase-phase-list':
    case 'multiphase-phase-id': return selectedPhase(state)
    case 'multiphase-phase-name': {
      const value = state.controlOverrides[multiphaseSettingKey(state, id)]
      return typeof value === 'string' ? value : 'phase-' + selectedPhase(state)
    }
    case 'multiphase-phase-material':
      return phaseMaterial(state, selectedPhase(state))
    case 'multiphase-pair-list': return selectedPair(state)
    case 'wall-contact-angle-pair': return selectedPair(state, id)
  }
  const record = recordScopes.find(([, group]) => id === group + '-index')
  if (record) return String(recordIndex(state, record[1]))
  const options = getMultiphaseOptions(state, id)
  if (options?.length) {
    const saved = modelScopedSettings.has(id) ? modelSetting(state, id) : state.controlOverrides[multiphaseSettingKey(state, id)]
    if (typeof saved === 'string' && options.some(({ value, disabled }) => value === saved && !disabled)) return saved
    return id === 'multiphase-mass-mechanism-from' || id === 'multiphase-transition-entry-phase'
      ? options[1]?.value ?? options[0].value
      : options[0].value
  }
}

export function getMultiphaseChecked(state: FluentSimState, id: string) {
  const regime = eulerianRegime(state)
  if (regime === aiadRegime && (id === 'multiphase-surface-tension' || id === 'multiphase-interface-localized')) return true
  if (!derivedMultiphaseControls.includes(id)) return
  const isEulerian = state.multiphaseModel === 'Eulerian'
  const isVof = state.multiphaseModel === multiphaseModels[0]
  const isMixture = state.multiphaseModel === 'Mixture'
  const multiFluidVof = isEulerian && getMultiphaseValue(state, 'multiphase-eulerian-interface') === 'Multi-Fluid VOF Model'
  const isGranular = (phase: string) => state.controlOverrides[`phase:${phase}:multiphase-phase-granular`] === true
  switch (id) {
    case 'multiphase-regime-transfer-active': return regime === aiadRegime
      ? Boolean(phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole) && phaseWithRole(state, 'multiphase-aiad-secondary-role', entrainedRole))
      : regime === gentopRegime && Boolean(phaseWithRole(state, 'multiphase-phase-gentop-hybrid', true))
    case 'multiphase-regime-pair-forces': {
      if (regime !== aiadRegime) return true
      const continuous = phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole)
      const entrained = phaseWithRole(state, 'multiphase-aiad-secondary-role', entrainedRole)
      return !(continuous && entrained && selectedPair(state).split('/').includes(continuous) && selectedPair(state).split('/').includes(entrained))
    }
    case 'multiphase-regime-pair-extra-forces': return regime !== aiadRegime || !isRegimePair(state, phaseWithRole(state, 'multiphase-aiad-secondary-role', continuousRole))
    case 'multiphase-regime-pair-dispersion': return regime !== gentopRegime || !isRegimePair(state, phaseWithRole(state, 'multiphase-phase-gentop-hybrid', true))
    case 'multiphase-phase-secondary': return selectedPhase(state) !== '1'
    case 'multiphase-phase-can-delete': return selectedPhase(state) !== '1' && state.phaseIds.length > (regime === gentopRegime ? 3 : 2)
    case 'multiphase-pair-has-primary': return selectedPair(state).startsWith('1/')
    case 'multiphase-pair-is-granular': return selectedPair(state).split('/').every(isGranular)
    case 'multiphase-case-has-granular': return state.phaseIds.some(isGranular)
    case 'multiphase-interface-active': return isVof || isMixture || multiFluidVof
    case 'multiphase-interface-discretization-active': return isVof || multiFluidVof
    case 'multiphase-interfacial-area-active':
      return isEulerian || (isMixture && Number(state.controlOverrides[multiphaseSettingKey(state, 'multiphase-mass-count')]) > 0)
    case 'multiphase-transition-injection-available': return Object.keys(state.dpmInjections).length > 0
    case 'multiphase-transition-geometry-available': return state.dimension === '3d' && state.timeFormulation === 'transient'
  }
}

export function resizePhases(state: FluentSimState, count: number): FluentSimState {
  if (!Number.isInteger(count) || count < 2 || count > 20) return state
  if (count <= state.phaseIds.length) {
    return removePhases(state, state.phaseIds.slice(count))
  }
  const ids = Array.from({ length: 20 }, (_, index) => String(index + 1))
  const newIds = ids.filter((id) => !state.phaseIds.includes(id)).slice(0, count - state.phaseIds.length)
  const phaseIds = [...state.phaseIds, ...newIds]
  return {
    ...state, phaseIds,
    controlOverrides: { ...state.controlOverrides, 'multiphase-phase-list': newIds.at(-1)! },
  }
}

export function removePhases(state: FluentSimState, removed: string[]): FluentSimState {
  const minimum = eulerianRegime(state) === gentopRegime ? 3 : 2
  if (!removed.length || removed.includes('1') || state.phaseIds.length - removed.length < minimum) return state
  const phases = new Set(removed)
  const phaseIds = state.phaseIds.filter((id) => !phases.has(id))
  const controlOverrides: Override = {}
  for (const [key, value] of Object.entries(state.controlOverrides)) {
    const [scope, ids] = key.split(':')
    if ((scope === 'phase' || scope === 'boundary-phase') && phases.has(ids)) continue
    if ((scope === 'pair' || scope === 'wall-contact') && ids.split('/').some((id) => phases.has(id))) continue
    if (key === 'multiphase-phase-list' && phases.has(String(value))) continue
    if ((key === 'multiphase-pair-list' || key === 'wall-contact-angle-pair') && String(value).split('/').some((id) => phases.has(id))) continue
    if (key.includes(':multiphase-') && /-(phase|from|to)$/.test(key) && phases.has(String(value))) continue
    if (key === 'multiphase-pb-phase' && phases.has(String(value))) continue
    if (key.endsWith('-phase-selection') && phases.has(String(value))) continue
    controlOverrides[key] = value
  }
  return { ...state, phaseIds, controlOverrides }
}
