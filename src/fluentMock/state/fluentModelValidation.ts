import type { FluentMockControl } from '../fluentTypes'
import { getControlValue, type FluentSimState } from './fluentSimState'
import { getMultiphaseRecordCount, multiphaseSettingKey, validateEulerianPhaseMaterials } from './fluentMultiphaseState'

const positiveIntegers = new Set([
  'radiation-theta-divisions', 'radiation-phi-divisions', 'radiation-theta-pixels', 'radiation-phi-pixels',
  'radiation-s2s-faces-per-cluster', 'radiation-clustering-max-faces', 'radiation-energy-iterations',
  'radiation-max-iterations', 'radiation-mc-history',
  'dpm-max-steps', 'dpm-interval', 'dpm-parallel-threads',
  'dpm-particle-steps', 'radiation-solar-update-steps', 'species-pdf-particles',
  'hx-dual-passes', 'hx-macro-passes',
])

export function validateModelSettings(controls: FluentMockControl[], state: FluentSimState) {
  const values = new Map(controls.map((control) => [
    control.id, getControlValue(state, control.valueId ?? control.id, control.value).trim(),
  ]))
  for (const control of controls) {
    const value = values.get(control.id)
    if (!value) continue
    const number = Number(value)
    if (positiveIntegers.has(control.valueId ?? control.id) && (!Number.isSafeInteger(number) || number < 1)) {
      return control.label + ' must be a positive integer.'
    }
    if (control.id === 'multiphase-pair-slope-limiter' && !(number >= 0 && number <= 2)) {
      return 'Slope Limiter must be between 0 and 2.'
    }
    if (control.id === 'vof-courant' && (!Number.isFinite(number) || number <= 0)) {
      return 'Courant Number must be greater than zero.'
    }
    if (control.id === 'radiation-solar-spectral-fraction' && !(number >= 0 && number <= 1)) {
      return 'Spectral Fraction must be between 0 and 1.'
    }
    if (['dpm-particle-timestep', 'species-pdf-timestep', 'species-chemistry-threshold'].includes(control.id) &&
        (!Number.isFinite(number) || number <= 0)) return control.label + ' must be greater than zero.'
    const band = /^radiation-band-(\d+)-start$/.exec(control.id)
    if (band) {
      const end = values.get('radiation-band-' + band[1] + '-end')
      if (!end || !Number.isFinite(Number(end)) || !(number >= 0 && Number(end) > number)) {
        return `Band ${band[1]} wavelengths must satisfy 0 ≤ start < end.`
      }
    }
    const endBand = /^radiation-band-(\d+)-end$/.exec(control.id)
    if (endBand && !values.get('radiation-band-' + endBand[1] + '-start')) {
      return `Enter the start wavelength for Band ${endBand[1]}.`
    }
  }
  if (values.has('multiphase-phase-list')) {
    const error = validateEulerianPhaseMaterials(state)
    if (error) return error
  }
  if (values.has('multiphase-mass-mechanism-from')) {
    const error = checkPhaseRecords(state, 'multiphase-mass', (record) =>
      getControlValue(record, 'multiphase-mass-mechanism-function') !== 'none' &&
      getControlValue(record, 'multiphase-mass-mechanism-from') === getControlValue(record, 'multiphase-mass-mechanism-to'),
    'Mass transfer requires two different phases.')
    if (error) return error
  }
  if (values.has('multiphase-transition-entry-phase')) {
    return checkPhaseRecords(state, 'multiphase-transition', (record) =>
      getControlValue(record, 'multiphase-transition-entry-phase') === getControlValue(record, 'multiphase-transition-entry-balancing-phase'),
    'The transitioning and volume-balancing phases must be different.')
  }
}

function checkPhaseRecords(
  state: FluentSimState, group: string, isInvalid: (record: FluentSimState) => boolean, message: string,
) {
  const count = getMultiphaseRecordCount(state, group)
  const indexKey = multiphaseSettingKey(state, group + '-index')
  for (let index = 1; index <= count; index++) {
    const record = { ...state, controlOverrides: { ...state.controlOverrides, [indexKey]: String(index) } }
    if (isInvalid(record)) return count === 1 ? message : `Mechanism ${index}: ${message}`
  }
}
