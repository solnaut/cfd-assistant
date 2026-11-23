import { useState } from 'react'
import type { FluentLabel } from '../fluentLanguage'
import { availableDialogTabs, dialogTabRows, isDialogControlVisible } from '../state/fluentDialogView'
import { validateModelSettings } from '../state/fluentModelValidation'
import { aiadRegime, gentopRegime, multiphaseDialogId } from '../data/multiphaseDialogs'
import { eulerianRegime } from '../state/fluentMultiphaseState'
import { formatViscousBadge, getControlValue, validateFileOperation, type FluentSimState } from '../state/fluentSimState'
import type { FluentMockControl, FluentMockDialog } from '../fluentTypes'
import { getDialogInlineSummaryAndDiagram } from '../data/fluentTeachingDiagrams'
import { ControlRenderer } from './ControlRenderer'
import { FluentTeachingDiagram } from './FluentTeachingDiagram'

export interface OpenDialogEntry {
  id: string
  openerId: string
  tabId?: string
  surfaceName?: string
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
  onCloseTopDialog,
  onMoveDialog,
  onSelectTab,
  onQuickOpenEnergy,
}: {
  dialogs: OpenDialogEntry[]
  dialogCatalog: FluentMockDialog[]
  activeControlId: string
  simState: FluentSimState
  label: FluentLabel
  onInspect: (control: FluentMockControl) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
  onApplyDialog: (dialog: FluentMockDialog) => string | void
  onCloseTopDialog: (applied?: boolean) => void
  onMoveDialog: (index: number, x: number, y: number) => void
  onSelectTab: (id: string, tabId: string) => void
  onQuickOpenEnergy: (dialogId: string) => void
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
            onClose={onCloseTopDialog}
            onMove={(x, y) => onMoveDialog(index, x, y)}
            onSelectTab={(tabId) => onSelectTab(dialog.id, tabId)}
            onQuickOpenEnergy={() => onQuickOpenEnergy(dialog.id)}
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
  onClose,
  onMove,
  onSelectTab,
  onQuickOpenEnergy,
}: {
  entry: OpenDialogEntry
  index: number
  total: number
  dialog: FluentMockDialog
  activeControlId: string
  simState: FluentSimState
  label: FluentLabel
  onInspect: (control: FluentMockControl) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
  onApplyDialog: (dialog: FluentMockDialog) => string | void
  onClose: (applied?: boolean) => void
  onMove: (x: number, y: number) => void
  onSelectTab: (tabId: string) => void
  onQuickOpenEnergy: () => void
}) {
  const tabs = availableDialogTabs(dialog, simState)
  const tabRows = dialogTabRows(tabs, entry.tabId)
  const activeTab = tabRows.at(-1)?.active
  const showTabs = dialog.id !== 'species-model-dialog' || tabs.length > 1
  const isThermalDisabled =
    activeTab?.id === 'thermal' && !simState.energyEnabled
  const sharedControls = dialog.controls.filter((control) => dialog.sharedGroups?.includes(control.group) && isDialogControlVisible(control, dialog, simState))
  const visibleControls = isThermalDisabled ? [] : dialog.controls.filter(
    (control) => (!activeTab || activeTab.groups.includes(control.group)) &&
      !dialog.sharedGroups?.includes(control.group) &&
      isDialogControlVisible(control, dialog, simState),
  )
  const grouped = dialog.module === 'Models' || dialog.controls.some(({ section }) => Boolean(section))
  const sections = new Map<string, FluentMockControl[]>()
  for (const control of visibleControls) {
    const section = control.section ?? (grouped ? control.group : '')
    const group = sections.get(section)
    if (group) group.push(control)
    else sections.set(section, [control])
  }
  const isMultiphase = dialog.id === multiphaseDialogId
  const activeRegime = eulerianRegime(simState)
  const pendingRegime = activeRegime !== getControlValue(simState, 'multiphase-eulerian-regime', 'Off')
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const fileError = submitted && dialog.fileOperation ? validateFileOperation(simState, dialog) : ''
  const reportKind = dialog.id === 'report-plots-dialog' ? 'plot' : dialog.id === 'report-files-dialog' ? 'file' : undefined
  const report = reportKind && simState.reportOutputs[reportKind + ':' + getControlValue(simState, 'report-' + reportKind + '-existing')]

  function submit(close: boolean) {
    setSubmitted(true)
    if (dialog.fileOperation && validateFileOperation(simState, dialog)) return
    if (dialog.module === 'Models') {
      const validation = validateModelSettings(visibleControls, simState)
      if (validation) {
        setSubmitError(validation)
        return
      }
      if (close) {
        for (const tab of tabs) {
          if (tab.disabled || tab.id === activeTab?.id || !tab.groups.length) continue
          const controls = dialog.controls.filter((control) =>
            tab.groups.includes(control.group) && isDialogControlVisible(control, dialog, simState),
          )
          const error = validateModelSettings(controls, simState)
          if (error) {
            onSelectTab(tab.id)
            setSubmitError(error)
            return
          }
        }
      }
    }
    const error = onApplyDialog(dialog)
    setSubmitError(error ?? '')
    if (error) return
    if (close) onClose(true)
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || (event.target as HTMLElement).closest('button')) return
    event.preventDefault()
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

  function renderControl(control: FluentMockControl) {
    const displayed = !entry.surfaceName ? control
      : control.id.endsWith('-create') ? { ...control, label: 'Update' }
        : control.id.endsWith('-name') ? { ...control, label: 'Surface Name', enabled: false } : control
    return <ControlRenderer key={control.id} control={displayed} active={control.id === activeControlId}
      simState={simState} label={label} onInspect={onInspect} onButtonActivate={onButtonActivate} onValueChange={onValueChange} />
  }

  return (
    <section
      className={'fluent-dialog-window' + (grouped ? ' fluent-model-dialog-window' : '')}
      role="dialog"
      aria-hidden={index < total - 1 ? true : undefined}
      inert={index < total - 1}
      aria-label={label(dialog.title)}
      data-fluent-control={dialog.id}
      tabIndex={-1}
      style={{
        zIndex: 20 + index,
        transform: `translate(${entry.x + index * 22}px, ${entry.y + index * 18}px)`,
      }}
    >
      <div className="fluent-dialog-titlebar" onPointerDown={startDrag}>
        <strong>{label(dialog.title)}</strong>
        <button
          type="button"
          aria-label={label('Close') + ' ' + label(dialog.title)}
          onClick={() => onClose()}
        >
          ×
        </button>
      </div>

      {sharedControls.length > 0 && <div className="fluent-dialog-shared">{sharedControls.map(renderControl)}</div>}

      {showTabs && tabRows.map(({ tabs, active }, rowIndex) => (
        <div key={active.parentId ?? dialog.id} className="fluent-dialog-tabs" role="tablist"
          aria-label={label(tabRows[rowIndex - 1]?.active.label ?? dialog.title)}
          onKeyDown={(event) => {
            const enabled = tabs.filter((tab) => !tab.disabled)
            if (!enabled.length) return
            const index = enabled.findIndex((tab) => tab.id === active.id)
            const next = event.key === 'ArrowRight' ? (index + 1) % enabled.length
              : event.key === 'ArrowLeft' ? (index + enabled.length - 1) % enabled.length
                : event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : -1
            if (next < 0) return
            event.preventDefault()
            onSelectTab(enabled[next].id)
            event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)')[next]?.focus()
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              disabled={tab.disabled}
              aria-selected={active.id === tab.id}
              tabIndex={active.id === tab.id ? 0 : -1}
              id={dialog.id + '-tab-' + tab.id}
              aria-controls={active.id === tab.id ? dialog.id + '-tab-panel' : undefined}
              className={active.id === tab.id ? 'active' : ''}
              onClick={() => onSelectTab(tab.id)}
            >
              {label(tab.label)}
              {tab.id === 'thermal' && !simState.energyEnabled ? ' (Off)' : ''}
            </button>
          ))}
        </div>
      ))}

      <div className="fluent-dialog-body"
        id={dialog.id + '-tab-panel'}
        role={activeTab && showTabs ? 'tabpanel' : undefined}
        aria-labelledby={activeTab && showTabs ? dialog.id + '-tab-' + activeTab.id : undefined}
      >
        <p className="fluent-dialog-subtitle">{dialog.subtitle}</p>
        {(() => {
          const inlineTeaching = getDialogInlineSummaryAndDiagram(dialog.id, simState)
          if (!inlineTeaching) return null
          return (
            <>
              <p className="fluent-dialog-inline-summary">{inlineTeaching.summary}</p>
              {inlineTeaching.diagram && (
                <details className="fluent-dialog-diagram-details">
                  <summary>物理机理图解：{inlineTeaching.diagram.title}</summary>
                  <FluentTeachingDiagram spec={inlineTeaching.diagram} compact />
                </details>
              )}
            </>
          )
        })()}

        {isMultiphase && activeTab?.id === 'model' && (
          simState.multiphaseModel !== 'Eulerian'
            ? <p className="fluent-inline-note">AIAD 和 GENTOP 位于 Eulerian → Regime Transition Modeling。</p>
            : pendingRegime ? <p className="fluent-inline-note" role="status">点击 Apply 使流型转换模型生效，再到 Phases 和 Phase Interaction 完成相设置。</p>
              : activeRegime !== 'Off' && <p className="fluent-inline-note">{activeRegime === aiadRegime
                ? 'AIAD 已应用。到 Phases 指定次相的连续相处理，然后在 Phase Interaction → Forces 打开 AIAD 参数。'
                : 'GENTOP 已应用。到 Phases 为一个次相勾选 GENTOP Hybrid Phase Modeling，再检查 Population Balance。'}</p>
        )}
        {isMultiphase && activeTab?.id === 'phases' && activeRegime === aiadRegime && (
          <p className="fluent-inline-note">AIAD 基础设置需要两相。若设置卷吸，添加第三相，为它和次级连续相指定同一种材料。</p>
        )}
        {isMultiphase && activeTab?.id === 'phases' && activeRegime === gentopRegime && (
          <p className="fluent-inline-note">选一个次相启用 GENTOP Hybrid Phase Modeling。次相应使用相同的材料，且与主相材料不同。</p>
        )}

        {isThermalDisabled && (
          <div className="fluent-inline-note">
            <span>能量方程当前未开启（Energy = Off），Thermal 边界不会参与求解。</span>{' '}
            <button
              type="button"
              className="fluent-action-row"
              data-fluent-control={dialog.id + '-open-energy'}
              style={{ marginTop: 4 }}
              onClick={onQuickOpenEnergy}
            >
              <span>前往开启 Energy 模型</span>
            </button>
          </div>
        )}

        {dialog.id === 'viscous-model-dialog' && (
          <div className="fluent-inline-note">
            {simState.viscousModel === 'inviscid'
              ? '当前选择 Inviscid（无黏）：忽略流体黏性与壁面剪切层。'
              : simState.viscousModel === 'laminar'
                ? '当前选择 Laminar（层流）：不求解湍流输运方程。'
                : simState.viscousModel === 'spalart-allmaras'
                  ? '当前选择 Spalart-Allmaras：一方程模型，适合航空外流附着边界层。'
                  : simState.viscousModel === 'k-epsilon'
                    ? `当前选择 k-epsilon (${simState.kEpsilonSubModel})：下方可切换子模型与 Near-Wall Treatment。`
                    : simState.viscousModel === 'k-omega-sst'
                    ? `当前选择 k-omega (${simState.kOmegaSubModel})。当前窗口显示该分支的选项。`
                      : simState.viscousModel === 'transition-sst'
                        ? '当前选择 Transition SST：四方程转捩模型，要求近壁 y+ ≤ 1。'
                        : simState.viscousModel === 'rsm'
                          ? '当前选择 RSM：七方程雷诺应力模型，适合强旋流各向异性湍流。'
                          : `当前选择 ${formatViscousBadge(simState.viscousModel)}。`}
          </div>
        )}

        <div className={grouped ? 'fluent-dialog-sections' : 'fluent-controls-stack'}>
          {[...sections.entries()].map(([section, controls]) => {
            const items = controls.map(renderControl)
            return grouped ? (
              <fieldset key={section} className="fluent-dialog-fieldset fluent-controls-stack">
                <legend>{label(section)}</legend>
                {items}
              </fieldset>
            ) : items
          })}
        </div>
        {report && (
          <p className="fluent-inline-note">
            {report.destination} · {report.definition} · {report.every} {label(report.basis)}
            {report.active ? '' : ' · Inactive'}
          </p>
        )}
        {dialog.fileOperation && ['Read', 'Import'].includes(dialog.fileOperation.verb) && (
          <label className="fluent-file-browse">
            <span>{label('Browse…')}</span>
            <input
              type="file"
              aria-label={label('Browse…')}
              accept={dialog.fileOperation.extensions.join(',')}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0]
                if (file) onValueChange(dialog.controls[0], file.name)
                event.currentTarget.value = ''
              }}
            />
          </label>
        )}
        {dialog.fileOperation?.extensions.length ? (
          <p className="fluent-dialog-file-types">{dialog.fileOperation.extensions.join(', ')}</p>
        ) : null}
        {(fileError || submitError) && <p className="fluent-inline-note" role="alert">{fileError || submitError}</p>}
      </div>

      <div className="fluent-dialog-actions">
        <button
          type="button"
          className="primary"
          onClick={() => submit(true)}
        >
          {label('OK')}
        </button>
        {!dialog.fileOperation && !dialog.okOnly && (
          <button type="button" onClick={() => submit(false)}>{label('Apply')}</button>
        )}
        <button type="button" onClick={() => onClose()}>
          {label('Close')}
        </button>
      </div>
    </section>
  )
}
