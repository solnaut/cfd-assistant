import type { OpenDialogEntry } from '../components/DialogStack'
import { fluentMockLayout } from '../fluentLayoutData'
import type { FluentMockControl, FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'
import { availableDialogTabs, isDialogControlVisible, unmetControlConditions } from './fluentDialogView'
import { getControlValue, type FluentSimState } from './fluentSimState'

export const solutionControls = [...fluentMockLayout.allControls, ...fluentMockLayout.dialogs.flatMap(({ controls }) => controls)]
export const solutionControlById = new Map(solutionControls.map((control) => [control.id, control]))
export const solutionDialogById = new Map(fluentMockLayout.dialogs.map((dialog) => [dialog.id, dialog]))

type DialogOpener = { control: FluentMockControl; optionValue?: string }
const dialogOpeners = new Map<string, DialogOpener[]>()

function recordOpener(id: string, opener: DialogOpener) {
  const entries = dialogOpeners.get(id)
  if (entries) entries.push(opener)
  else dialogOpeners.set(id, [opener])
}

for (const control of solutionControls) {
  if (!control.enabled) continue
  if (control.dialogId) recordOpener(control.dialogId, { control })
  for (const [optionValue, id] of Object.entries(control.optionDialogs ?? {})) recordOpener(id, { control, optionValue })
}

export function dialogEntry(id: string, openerId: string, tabId?: string): OpenDialogEntry {
  return { id, openerId, tabId, x: 0, y: 0 }
}

export function dialogControlLocation(dialog: FluentMockDialog, control: FluentMockControl, state: FluentSimState) {
  const tabs = availableDialogTabs(dialog, state)
  const tab = tabs.find(({ groups, disabled }) => !disabled && groups.includes(control.group))
  const shared = dialog.sharedGroups?.includes(control.group) ?? false
  const visible = (shared || !tabs.length || Boolean(tab)) && (tab?.id !== 'thermal' || state.energyEnabled) &&
    isDialogControlVisible(control, dialog, state)
  return { tabId: tab?.id, visible }
}

type DialogPath = { entries: OpenDialogEntry[]; blocked: boolean; prerequisites: FluentVisibilityCondition[] }

function buildPath(dialogId: string, state: FluentSimState, visited: ReadonlySet<string>): DialogPath | undefined {
  if (visited.has(dialogId)) return
  const nextVisited = new Set([...visited, dialogId])
  let blockedPath: DialogPath | undefined
  let preferredPath: DialogPath | undefined

  for (const { control, optionValue } of dialogOpeners.get(dialogId) ?? []) {
    const parent = solutionDialogById.get(control.parentId ?? '')
    const parentPath = parent && buildPath(parent.id, state, nextVisited)
    // Legacy search-only windows must not override native entry points for their child dialogs.
    if (parent && !parentPath) continue
    if (parentPath?.blocked) {
      blockedPath ??= parentPath
      continue
    }

    const location = parent ? dialogControlLocation(parent, control, state) : undefined
    const entries = [...(parentPath?.entries ?? [])]
    if (location?.tabId && entries.length) entries[entries.length - 1] = { ...entries.at(-1)!, tabId: location.tabId }
    const canOpen = location?.visible ?? isDialogControlVisible(control, { id: 'workbench', controls: [] }, state)
    const optionMatches = optionValue === undefined || getControlValue(state, control.valueId ?? control.id, control.value) === optionValue
    if (!canOpen || !optionMatches) {
      const prerequisites = unmetControlConditions(control, parent, state)
      if (!optionMatches && optionValue !== undefined) prerequisites.push({ controlId: control.id, values: [optionValue] })
      blockedPath ??= { entries, blocked: true, prerequisites }
      continue
    }

    entries.push(dialogEntry(dialogId, control.id, control.dialogTab))
    if (!preferredPath || (entries.length > 1 && preferredPath.entries.length === 1)) {
      preferredPath = { entries, blocked: false, prerequisites: [] }
    }
  }
  return preferredPath ?? blockedPath
}

export function locateDialogControl(dialog: FluentMockDialog, control: FluentMockControl, state: FluentSimState, fallbackOpener: string) {
  const path = buildPath(dialog.id, state, new Set()) ?? {
    entries: [dialogEntry(dialog.id, fallbackOpener)], blocked: false, prerequisites: [],
  }
  const location = dialogControlLocation(dialog, control, state)
  const top = path.entries.at(-1)
  if (!path.blocked && location.tabId && top) top.tabId = location.tabId
  return {
    entries: path.entries,
    blocked: path.blocked,
    focusId: !path.blocked && location.visible ? control.id : top?.id ?? fallbackOpener,
    prerequisites: path.prerequisites,
  }
}
