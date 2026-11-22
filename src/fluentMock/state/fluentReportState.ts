import type { FluentSimState } from './fluentSimState'

export interface ReportDefinition {
  name: string
  type: string
  surface: string
  quantity?: string
}

export type ReportOutputKind = 'plot' | 'file'
type SamplingBasis = 'Iterations' | 'Time Steps' | 'Flow Time'

export interface ReportOutput {
  name: string
  kind: ReportOutputKind
  definition: string
  destination: string
  basis: SamplingBasis
  every: number
  active: boolean
}

export function reportEditorValues(state: FluentSimState, kind: ReportOutputKind) {
  const prefix = 'report-' + kind + '-'
  const values = state.controlOverrides
  const basis = values[prefix + 'basis']
  return {
    kind,
    name: String(values[prefix + 'name'] ?? '').trim(),
    definition: String(values[prefix + 'definition'] ?? ''),
    destination: String(values[prefix + 'destination'] ?? '').trim(),
    basis: basis === 'Time Steps' || basis === 'Flow Time' ? basis : 'Iterations',
    every: Number(values[prefix + 'every'] ?? '1'),
    active: values[prefix + 'active'] !== false,
  } satisfies ReportOutput
}

export function validateReport(state: FluentSimState, kind: 'definition' | ReportOutputKind) {
  if (kind === 'definition') {
    const name = state.monitors.reportName.trim()
    if (!name || /\s/.test(name)) return 'Enter a report definition name without spaces.'
    if (state.monitors.reportType === 'Force') {
      const vector = String(state.controlOverrides['report-force-vector'] ?? '1, 0, 0').split(',')
      if (vector.length !== 3 || vector.some((value) => !value.trim() || !Number.isFinite(Number(value))) ||
        vector.every((value) => Number(value) === 0)) return 'Enter a nonzero force vector as three comma-separated numbers.'
    }
    return ''
  }
  const output = reportEditorValues(state, kind)
  if (!output.name || /\s/.test(output.name)) return 'Enter a report output name without spaces.'
  if (Object.hasOwn(state.reportOutputs, kind + ':' + output.name)) return 'A report output with this name already exists.'
  if (!Object.hasOwn(state.reportDefinitions, output.definition)) return 'Save and select a Report Definition first.'
  if (kind === 'file' && !output.destination) return 'Enter a file name for the simulated report output.'
  if (output.basis !== 'Iterations' && state.timeFormulation !== 'transient') {
    return 'Time Steps and Flow Time require Transient.'
  }
  if (!Number.isFinite(output.every) || output.every <= 0 ||
    (output.basis !== 'Flow Time' && !Number.isSafeInteger(output.every))) {
    return 'Enter a positive sampling interval. Iterations and time steps require whole numbers.'
  }
  return ''
}
