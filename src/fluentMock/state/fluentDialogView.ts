import { allDialogControls } from '../fluentDialogs'
import { multiphaseModels } from '../data/multiphaseDialogs'
import { controlOptionsById, dialogTabsByDialogId, type DialogTabGroup } from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'
import { getControlChecked, getControlValue, type FluentSimState } from './fluentSimState'

const dialogControlsById = new Map(allDialogControls.map((control) => [control.id, control]))

function matchesCondition({ controlId, values }: FluentVisibilityCondition, dialog: Pick<FluentMockDialog, 'controls'> | undefined, state: FluentSimState) {
  const dependency = dialog?.controls.find((item) => (item.valueId ?? item.id) === controlId)
    ?? dialogControlsById.get(controlId)
  const value = typeof values[0] === 'boolean'
    ? getControlChecked(state, controlId, dependency?.defaultSelected ?? false)
    : getControlValue(state, controlId, dependency?.value)
  return values.includes(value)
}

function matchesConditions(conditions: FluentVisibilityCondition[] | undefined, dialog: Pick<FluentMockDialog, 'controls'>, state: FluentSimState) {
  return (conditions ?? []).every((condition) => matchesCondition(condition, dialog, state))
}

const tabModelConditions: Record<NonNullable<DialogTabGroup['requires']>, FluentVisibilityCondition> = {
  radiation: { controlId: 'radiation-model-select', values: controlOptionsById['radiation-model-select'].filter(({ value }) => value !== 'Off').map(({ value }) => value) },
  species: { controlId: 'species-model-select', values: controlOptionsById['species-model-select'].filter(({ value }) => value !== 'Off').map(({ value }) => value) },
  dpm: { controlId: 'dpm-enable', values: [true] },
  multiphase: { controlId: 'multiphase-model-select', values: multiphaseModels },
}

export function unmetControlConditions(control: FluentMockControl, dialog: FluentMockDialog | undefined, state: FluentSimState) {
  const conditions = [...(control.visibleWhen ?? [])]
  const tabs = (dialog && dialogTabsByDialogId[dialog.id]) ?? []
  const matchingTabs = tabs.filter((tab) => tab.groups.includes(control.group))
  // A shared group can be reached through several tabs with different prerequisites.
  if (matchingTabs.length === 1) {
    const path = dialogTabRows(tabs, matchingTabs[0].id).map(({ active }) => active)
    for (const tab of path) {
      conditions.push(...(tab.visibleWhen ?? []))
      conditions.push(...(tab.enabledWhen ?? []))
      if (tab.requires) conditions.push(tabModelConditions[tab.requires])
      if (tab.id === 'thermal') conditions.push({ controlId: 'energy-enable', values: [true] })
      if (tab === matchingTabs[0]) break
    }
  }

  const required = new Map<string, FluentVisibilityCondition>()
  for (const { controlId, values } of conditions) {
    const previous = required.get(controlId)
    required.set(controlId, { controlId, values: previous ? values.filter((value) => previous.values.includes(value)) : values })
  }

  const result: FluentVisibilityCondition[] = []
  const modelValues = required.get('multiphase-model-select')?.values
  if (state.solverType !== 'pressure-based' && modelValues?.length &&
      modelValues.every((value) => typeof value === 'string' && multiphaseModels.includes(value))) {
    result.push({ controlId: 'general-pressure-based', values: [true] })
  }
  for (const condition of required.values()) {
    if (!condition.values.length || matchesCondition(condition, dialog, state)) continue
    if (condition.controlId === 'dpm-independent-particle-step') {
      if (!getControlChecked(state, 'dpm-unsteady-tracking')) {
        result.push({ controlId: 'dpm-unsteady-tracking', values: [true] })
      }
      if (state.timeFormulation === 'transient' && getControlChecked(state, 'dpm-fluid-timestep', true)) {
        result.push({ controlId: 'dpm-fluid-timestep', values: [false] })
      }
      continue
    }
    if (condition.controlId === 'multiphase-vof-formulation' && condition.values.length === 1 && condition.values[0] === 'Explicit' &&
        state.timeFormulation === 'steady' && !required.has('solver-time-formulation')) {
      result.push({ controlId: 'general-transient', values: [true] })
    }
    result.push(condition.controlId === 'solver-time-formulation' && condition.values.length === 1 && condition.values[0] === 'Transient'
      ? { controlId: 'general-transient', values: [true] }
      : condition)
  }
  return result
}

export type VisibleDialogTab = DialogTabGroup & { disabled?: boolean }

export function availableDialogTabs(dialog: FluentMockDialog, state: FluentSimState): VisibleDialogTab[] {
  const models = {
    radiation: state.radiationModel !== 'Off',
    species: state.speciesModel !== 'Off',
    dpm: state.dpmEnabled,
    multiphase: multiphaseModels.includes(state.multiphaseModel),
  }
  const available = (dialogTabsByDialogId[dialog.id] ?? []).filter((tab) =>
    (!tab.requires || models[tab.requires]) && matchesConditions(tab.visibleWhen, dialog, state))
  return available.filter((tab) => {
    const visited = new Set([tab.id])
    let parentId = tab.parentId
    while (parentId) {
      if (visited.has(parentId)) return false
      const parent = available.find((item) => item.id === parentId)
      if (!parent) return false
      visited.add(parentId)
      parentId = parent.parentId
    }
    return true
  }).map((tab) => ({ ...tab, disabled: !matchesConditions(tab.enabledWhen, dialog, state) }))
}

export function dialogTabRows(tabs: VisibleDialogTab[], selectedId?: string) {
  const path = new Set<string>()
  let selected = tabs.find((tab) => tab.id === selectedId)
  while (selected) {
    path.add(selected.id)
    selected = tabs.find((tab) => tab.id === selected?.parentId)
  }

  const rows: { tabs: VisibleDialogTab[]; active: VisibleDialogTab }[] = []
  let siblings = tabs.filter((tab) => !tab.parentId)
  while (siblings.length) {
    const active = siblings.find((tab) => !tab.disabled && path.has(tab.id)) ?? siblings.find((tab) => !tab.disabled) ?? siblings[0]
    rows.push({ tabs: siblings, active })
    siblings = tabs.filter((tab) => tab.parentId === active.id)
  }
  return rows
}

export function isDialogControlVisible(control: FluentMockControl, dialog: Pick<FluentMockDialog, 'id' | 'controls'>, state: FluentSimState) {
  if (dialog.id === 'viscous-model-dialog') {
    if (control.group === 'k-epsilon Options' && state.viscousModel !== 'k-epsilon') return false
    if (control.group === 'k-omega Options' && state.viscousModel !== 'k-omega-sst') return false
  }
  if (control.group === 'Turbulence' && ['inviscid', 'laminar'].includes(state.viscousModel)) {
    return false
  }
  return matchesConditions(control.visibleWhen, dialog, state)
}
