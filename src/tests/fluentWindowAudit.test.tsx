import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { DialogStack } from '../fluentMock/components/DialogStack'
import { fluentMockLayout } from '../fluentMock/fluentLayoutData'
import { labelIn } from '../fluentMock/fluentLanguage'
import { createInitialFluentSimState } from '../fluentMock/state/fluentSimState'
import { availableDialogTabs, dialogTabRows, isDialogControlVisible } from '../fluentMock/state/fluentDialogView'
import { getGlobalSearchIndex } from '../search/globalSearchIndex'
import type { FluentMockDialog } from '../fluentMock/fluentTypes'

const { dialogs, allControls } = fluentMockLayout
const label = (term: string) => labelIn('en', term)
const initialState = createInitialFluentSimState()

function WindowFixture({ dialog }: { dialog: FluentMockDialog }) {
  const [tabId, setTabId] = useState<string>()
  const [open, setOpen] = useState(true)
  return <DialogStack dialogs={open ? [{ id: dialog.id, openerId: 'audit', x: 0, y: 0, tabId }] : []} dialogCatalog={dialogs}
    activeControlId="" simState={initialState} label={label}
    onInspect={vi.fn()} onButtonActivate={vi.fn()} onValueChange={vi.fn()} onApplyDialog={vi.fn()}
    onCloseTopDialog={() => setOpen(false)} onMoveDialog={vi.fn()} onSelectTab={(_, id) => setTabId(id)} onQuickOpenEnergy={vi.fn()} />
}

function dialogTargets(controls: typeof allControls) {
  return controls.filter(({ enabled }) => enabled).flatMap(({ dialogId, optionDialogs }) => [
    ...(dialogId ? [dialogId] : []), ...Object.values(optionDialogs ?? {}),
  ])
}

describe('Fluent Solution window audit', () => {
  it('traces every registered window from a workbench entry', () => {
    const reachable = new Set<string>()
    const queue = dialogTargets(allControls)
    const byId = new Map(dialogs.map((dialog) => [dialog.id, dialog]))
    while (queue.length) {
      const id = queue.pop()!
      if (reachable.has(id)) continue
      reachable.add(id)
      queue.push(...dialogTargets(byId.get(id)?.controls ?? []))
    }
    // The combined teaching panel predates the individual File commands and remains searchable.
    expect(dialogs.filter(({ id }) => !reachable.has(id)).map(({ id }) => id)).toEqual(['case-file-dialog'])
    expect(getGlobalSearchIndex().some(({ to }) => to === '/fluent-guide?locate=case-file-read')).toBe(true)
  })

  it.each(dialogs)('renders and closes $id', (dialog) => {
    render(<WindowFixture dialog={dialog} />)
    const node = screen.getByRole('dialog', { name: label(dialog.title) })
    const window = within(node)
    expect(window.getByRole('button', { name: label('OK') })).toBeEnabled()
    const tabs = availableDialogTabs(dialog, initialState)

    function checkFields(tabId?: string) {
      const active = dialogTabRows(tabs, tabId).at(-1)?.active
      if (active?.id === 'thermal' && !initialState.energyEnabled) {
        expect(window.getByRole('button', { name: '前往开启 Energy 模型' })).toBeInTheDocument()
        return
      }
      for (const control of dialog.controls) {
        if ((!active || active.groups.includes(control.group) || dialog.sharedGroups?.includes(control.group)) && isDialogControlVisible(control, dialog, initialState)) {
          expect(node.querySelector(`[data-fluent-control="${control.id}"]`), control.id).toBeInTheDocument()
        }
      }
    }

    function checkTabs(parentId?: string) {
      for (const { id, disabled } of tabs.filter((tab) => tab.parentId === parentId)) {
        const tab = document.getElementById(dialog.id + '-tab-' + id)
        if (disabled) {
          expect(tab, id).toBeDisabled()
          continue
        }
        expect(tab, id).toBeEnabled()
        fireEvent.click(tab!)
        expect(tab).toHaveAttribute('aria-selected', 'true')
        checkFields(id)
        checkTabs(id)
      }
    }

    checkFields()
    if (window.queryAllByRole('tab').length) checkTabs()
    fireEvent.click(window.getByRole('button', { name: `${label('Close')} ${label(dialog.title)}` }))
    expect(node).not.toBeInTheDocument()
  })
})
