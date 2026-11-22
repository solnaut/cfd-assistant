import { surfaceKinds } from '../data/resultBranches'
import type { FluentMockDialog } from '../fluentTypes'
import { isDialogControlVisible } from './fluentDialogView'
import { getControlValue, type FluentSimAction, type FluentSimState } from './fluentSimState'

export function createSurfaceAction(state: FluentSimState, dialog: FluentMockDialog, editingName?: string): FluentSimAction {
  const warn = (text: string): FluentSimAction => ({
    type: 'APPEND_CONSOLE',
    entries: [{ kind: 'warning', text }],
  })
  const kind = surfaceKinds.find(([id]) => id + '-dialog' === dialog.id)?.[0]
  if (!kind) return warn('Select a surface type before creating a surface.')
  const nameControlId = kind + '-name'
  const name = editingName ?? getControlValue(state, nameControlId, dialog.controls.find((control) => control.id === nameControlId)?.value).trim()
  if (!name || /\s/.test(name)) return warn('Enter a surface name without spaces.')
  const inputs = dialog.controls.filter((control) =>
    control.id !== nameControlId && control.controlType !== 'button' &&
    isDialogControlVisible(control, dialog, state),
  ).map((control) => ({
    ...control,
    input: getControlValue(state, control.id, control.value),
  }))
  for (const control of inputs.filter((item) => item.controlType === 'field')) {
    const values = control.input.split(',').map((value) => value.trim())
    const isVector = control.id === 'plane-surface-point' || control.id === 'plane-surface-normal'
    if (values.length !== (isVector ? 3 : 1) || values.some((value) => !value || !Number.isFinite(Number(value)))) {
      return warn(isVector ? 'Enter three comma-separated numbers for ' + control.label + '.' : 'Enter a number for ' + control.label + '.')
    }
    if (control.id === 'plane-surface-normal' && values.every((value) => Number(value) === 0)) {
      return warn('Enter a nonzero plane normal.')
    }
    if (control.id === 'line-rake-points' && (!Number.isInteger(Number(control.input)) || Number(control.input) < 2)) {
      return warn('Enter at least two sampling points for the rake.')
    }
  }
  if (kind === 'iso-clip') {
    const [min, max] = ['iso-clip-minimum', 'iso-clip-maximum'].map((id) =>
      Number(inputs.find((control) => control.id === id)?.input),
    )
    if (min > max) return warn('Set Min less than or equal to Max.')
  }
  const values = Object.fromEntries(inputs.map((control) => [control.id, control.input]))
  if (kind === 'line-rake' && ['x', 'y', 'z'].every((axis) =>
    Number(values['line-rake-start-' + axis]) === Number(values['line-rake-end-' + axis]),
  )) return warn('The start and end points must be different.')
  return {
    type: 'CREATE_SURFACE',
    editing: Boolean(editingName),
    surface: { name, kind, definition: inputs.map((control) => control.label + '=' + control.input).join(', '), inputs: values },
  }
}
