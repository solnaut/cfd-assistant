import { useState } from 'react'
import type { FluentLabel } from '../fluentLanguage'
import { dialogTabsByDialogId } from '../fluentTeachingExtras'
import type { FluentSimState } from '../state/fluentSimState'
import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'
import { ControlRenderer } from './ControlRenderer'

export interface OpenDialogEntry {
  id: string
  openerId: string
  x: number
  y: number
}

export function DialogStack({
  dialogs,
  dialogCatalog,
  activeControlId,
  simState,
  label,
  onInspect,
  onButtonActivate,
  onValueChange,
  onApplyDialog,
  onOkDialog,
  onCloseTopDialog,
  onMoveDialog,
  onFocusDialog,
  onQuickOpenEnergy,
}: {
  dialogs: OpenDialogEntry[]
  dialogCatalog: FluentMockDialog[]
  activeControlId: string
  simState: FluentSimState
  label: FluentLabel
  onInspect: (control: FluentMockControl, optionValue?: string) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
  onApplyDialog: (dialogTitle: string) => void
  onOkDialog: (dialogTitle: string) => void
  onCloseTopDialog: () => void
  onMoveDialog: (index: number, x: number, y: number) => void
  onFocusDialog: (index: number) => void
  onQuickOpenEnergy: () => void
}) {
  if (!dialogs.length) return null

  return (
    <div className="fluent-dialog-layer">
      {dialogs.map((entry, index) => {
        const dialog = dialogCatalog.find((item) => item.id === entry.id)
        if (!dialog) return null
        return (
          <DraggableDialogWindow
            key={`${entry.id}-${index}`}
            entry={entry}
            index={index}
            total={dialogs.length}
            dialog={dialog}
            activeControlId={activeControlId}
            simState={simState}
            label={label}
            onInspect={onInspect}
            onButtonActivate={onButtonActivate}
            onValueChange={onValueChange}
            onApplyDialog={onApplyDialog}
            onOkDialog={onOkDialog}
            onClose={onCloseTopDialog}
            onMove={(x, y) => onMoveDialog(index, x, y)}
            onFocus={() => onFocusDialog(index)}
            onQuickOpenEnergy={onQuickOpenEnergy}
          />
        )
      })}
    </div>
  )
}

function DraggableDialogWindow({
  entry,
  index,
  total,
  dialog,
  activeControlId,
  simState,
  label,
  onInspect,
  onButtonActivate,
  onValueChange,
  onApplyDialog,
  onOkDialog,
  onClose,
  onMove,
  onFocus,
  onQuickOpenEnergy,
}: {
  entry: OpenDialogEntry
  index: number
  total: number
  dialog: FluentMockDialog
  activeControlId: string
  simState: FluentSimState
  label: FluentLabel
  onInspect: (control: FluentMockControl, optionValue?: string) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
  onApplyDialog: (dialogTitle: string) => void
  onOkDialog: (dialogTitle: string) => void
  onClose: () => void
  onMove: (x: number, y: number) => void
  onFocus: () => void
  onQuickOpenEnergy: () => void
}) {
  const tabs = dialogTabsByDialogId[dialog.id]
  const [selectedTabId, setSelectedTabId] = useState(tabs?.[0]?.id ?? '')
  const activeTab = tabs?.find((item) => item.id === selectedTabId) ?? tabs?.[0]
  const visibleControls = activeTab
    ? dialog.controls.filter((control) =>
        activeTab.groups.includes(control.group),
      )
    : dialog.controls
  const isThermalDisabled =
    activeTab?.id === 'thermal' && !simState.energyEnabled

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) return
    event.preventDefault()
    onFocus()
    const startX = event.clientX
    const startY = event.clientY
    const originX = entry.x
    const originY = entry.y

    function handleMove(moveEvent: PointerEvent) {
      const nextX = Math.max(-280, Math.min(280, originX + moveEvent.clientX - startX))
      const nextY = Math.max(-160, Math.min(200, originY + moveEvent.clientY - startY))
      onMove(nextX, nextY)
    }

    function handleUp() {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return (
    <section
      className="fluent-dialog-window"
      role="dialog"
      aria-label={label(dialog.title)}
      data-fluent-control={dialog.id}
      tabIndex={-1}
      style={{
        zIndex: 20 + index,
        transform: `translate(${entry.x + index * 22}px, ${entry.y + index * 18}px)`,
      }}
      onMouseDown={() => {
        if (index !== total - 1) onFocus()
      }}
    >
      <div className="fluent-dialog-titlebar" onPointerDown={startDrag}>
        <strong>{label(dialog.title)}</strong>
        <button
          type="button"
          aria-label={label('Close') + ' ' + label(dialog.title)}
          onClick={onClose}
        >
          ×
        </button>
      </div>

      {tabs && (
        <div className="fluent-dialog-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab?.id === tab.id}
              className={activeTab?.id === tab.id ? 'active' : ''}
              onClick={() => setSelectedTabId(tab.id)}
            >
              {tab.label}
              {tab.id === 'thermal' && !simState.energyEnabled ? ' (Off)' : ''}
            </button>
          ))}
        </div>
      )}

      <div className="fluent-dialog-body">
        <p className="fluent-dialog-subtitle">{dialog.subtitle}</p>

        {isThermalDisabled && (
          <div className="fluent-inline-note">
            <span>能量方程当前未开启（Energy = Off），Thermal 边界不会参与求解。</span>{' '}
            <button
              type="button"
              className="fluent-action-row"
              style={{ marginTop: 4 }}
              onClick={onQuickOpenEnergy}
            >
              <span>前往开启 Energy 模型</span>
            </button>
          </div>
        )}

        {dialog.id === 'viscous-model-dialog' && (
          <div className="fluent-inline-note">
            {simState.viscousModel === 'laminar'
              ? '当前选择 Laminar（层流）：不求解湍流输运方程。'
              : simState.viscousModel === 'k-epsilon'
                ? '当前选择 k-epsilon：可下方选择 Near-Wall Treatment（如 Enhanced Wall Treatment）。'
                : '当前选择 k-omega SST：自带近壁 y+ 过渡处理，推荐解析边界层时目标 y+ ≈ 1。'}
          </div>
        )}

        <div className="fluent-controls-stack">
          {visibleControls.map((control) => (
            <ControlRenderer
              key={control.id}
              control={control}
              active={control.id === activeControlId}
              simState={simState}
              label={label}
              onInspect={onInspect}
              onButtonActivate={onButtonActivate}
              onValueChange={onValueChange}
            />
          ))}
        </div>
      </div>

      <div className="fluent-dialog-actions">
        <button
          type="button"
          className="primary"
          onClick={() => onOkDialog(label(dialog.title))}
        >
          {label('OK')}
        </button>
        <button
          type="button"
          onClick={() => onApplyDialog(label(dialog.title))}
        >
          {label('Apply')}
        </button>
        <button type="button" onClick={onClose}>
          {label('Close')}
        </button>
      </div>
    </section>
  )
}
