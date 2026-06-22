import { useMemo, useState } from 'react'
import { fluentDialogs } from './fluentDialogs'
import { fluentExplanationById } from './fluentExplanations'
import { fluentMockLayout } from './fluentLayoutData'
import type {
  FluentMockControl,
  FluentMockDialog,
  FluentMockExplanation,
  FluentMockRibbonTab,
  FluentMockTaskPanel,
  FluentMockTreeSection,
} from './fluentTypes'

function FluentSolverMock() {
  const [activeRibbonTabId, setActiveRibbonTabId] = useState('ribbon-tab-domain')
  const [selectedPanelId, setSelectedPanelId] = useState(
    fluentMockLayout.defaultPanelId,
  )
  const [selectedTreeId, setSelectedTreeId] = useState('tree-general')
  const [activeControlId, setActiveControlId] = useState(
    fluentMockLayout.defaultControlId,
  )
  const [activeDialogControlId, setActiveDialogControlId] = useState<
    string | null
  >(null)
  const [openDialogId, setOpenDialogId] = useState<string | null>(null)
  const [filterText, setFilterText] = useState('')
  const [expandedSectionIds, setExpandedSectionIds] = useState(
    () =>
      new Set(
        fluentMockLayout.treeSections
          .filter((section) => section.defaultExpanded)
          .map((section) => section.id),
      ),
  )

  const activeRibbonTab =
    fluentMockLayout.ribbonTabs.find((tab) => tab.id === activeRibbonTabId) ??
    fluentMockLayout.ribbonTabs[0]
  const activePanel =
    fluentMockLayout.taskPanels.find((panel) => panel.id === selectedPanelId) ??
    fluentMockLayout.taskPanels[0]
  const openDialog =
    fluentDialogs.find((dialog) => dialog.id === openDialogId) ?? null
  const activeControl = findControlById(activeControlId)
  const activeDialogControl = activeDialogControlId
    ? findControlById(activeDialogControlId)
    : null
  const explanation =
    fluentExplanationById.get(
      (activeDialogControl ?? activeControl)?.explanationId ?? '',
    ) ?? fluentExplanationById.get('tree-general-explanation')

  const filteredSections = useMemo(
    () => filterTreeSections(fluentMockLayout.treeSections, filterText),
    [filterText],
  )

  function activateControl(control: FluentMockControl) {
    setActiveControlId(control.id)
    setActiveDialogControlId(null)

    if (control.panelId) {
      setSelectedPanelId(control.panelId)
      if (control.controlType === 'tree-node') {
        setSelectedTreeId(control.id)
      }
    }

    if (control.dialogId) {
      setOpenDialogId(control.dialogId)
    }
  }

  function activateDialogControl(control: FluentMockControl) {
    setActiveDialogControlId(control.id)
  }

  function closeDialog(dialog: FluentMockDialog) {
    setOpenDialogId((current) => (current === dialog.id ? null : current))
    setActiveDialogControlId(null)
  }

  function toggleSection(sectionId: string) {
    setExpandedSectionIds((current) => {
      const next = new Set(current)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  return (
    <section className="fluent-simulator-section" aria-label="Fluent Solver 教学模拟器">
      <div className="fluent-solver-entry-bar">
        <button className="button-link button-link-small" type="button">
          Fluent Solver 主界面模拟器
        </button>
        <span>自主 HTML/CSS 教学界面，不连接 Fluent，不执行真实求解。</span>
      </div>

      <div className="fluent-desktop-hint">
        建议使用电脑端或横屏平板查看完整 Ribbon、功能树和图形窗口布局。
      </div>

      <div className="fluent-solver-shell">
        <Ribbon
          activeTab={activeRibbonTab}
          activeTabId={activeRibbonTabId}
          onActivateControl={activateControl}
          onSetActiveControlId={setActiveControlId}
          onSetActiveTabId={setActiveRibbonTabId}
        />

        <div className="fluent-solver-main-grid">
          <OutlinePane
            activeControlId={activeControlId}
            expandedSectionIds={expandedSectionIds}
            filterText={filterText}
            sections={filteredSections}
            selectedTreeId={selectedTreeId}
            onActivateControl={activateControl}
            onFilterFocus={() =>
              setActiveControlId(fluentMockLayout.outlineFilterControl.id)
            }
            onFilterTextChange={setFilterText}
            onToggleSection={toggleSection}
          />

          <div className="fluent-center-stack">
            <TaskPane
              activeControlId={activeControlId}
              panel={activePanel}
              onActivateControl={activateControl}
            />
            <ConsolePane
              activeControlId={activeControlId}
              onActivateControl={activateControl}
            />
          </div>

          <GraphicsPane
            activeControlId={activeControlId}
            onActivateControl={activateControl}
          />

          <ExplanationPane explanation={explanation} />
        </div>

        {openDialog ? (
          <MockDialog
            activeDialogControlId={activeDialogControlId}
            dialog={openDialog}
            onActivateDialogControl={activateDialogControl}
            onClose={() => closeDialog(openDialog)}
          />
        ) : null}
      </div>
    </section>
  )
}

function Ribbon({
  activeTab,
  activeTabId,
  onActivateControl,
  onSetActiveControlId,
  onSetActiveTabId,
}: {
  activeTab: FluentMockRibbonTab
  activeTabId: string
  onActivateControl: (control: FluentMockControl) => void
  onSetActiveControlId: (controlId: string) => void
  onSetActiveTabId: (tabId: string) => void
}) {
  return (
    <header className="fluent-ribbon">
      <div className="fluent-ribbon-top">
        <div className="fluent-window-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="fluent-ribbon-tabs" aria-label="Ribbon 菜单">
          <span className="fluent-region-label">Ribbon 菜单</span>
          {fluentMockLayout.ribbonTabs.map((tab) => (
            <button
              className={tab.id === activeTabId ? 'active' : ''}
              key={tab.id}
              onClick={() => onSetActiveTabId(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <label className="fluent-quick-search">
          <span>搜索</span>
          <input
            onFocus={() =>
              onSetActiveControlId(fluentMockLayout.quickSearchControl.id)
            }
            placeholder="查找命令"
            type="search"
          />
        </label>
        <button
          className="fluent-help-button"
          onClick={() => onSetActiveControlId('quick-search')}
          type="button"
        >
          ?
        </button>
      </div>

      <div className="fluent-ribbon-groups">
        {activeTab.groups.length ? (
          activeTab.groups.map((group) => (
            <div className="fluent-ribbon-group" key={group.id}>
              <div className="fluent-ribbon-buttons">
                {group.controls.map((control) => (
                  <button
                    className="fluent-ribbon-tool"
                    disabled={!control.enabled}
                    key={control.id}
                    onClick={() => onActivateControl(control)}
                    type="button"
                  >
                    <span className="fluent-tool-icon" aria-hidden="true">
                      {control.labelZh.slice(0, 1)}
                    </span>
                    <span>{control.labelZh}</span>
                  </button>
                ))}
              </div>
              <span className="fluent-ribbon-group-label">{group.label}</span>
            </div>
          ))
        ) : (
          <div className="fluent-ribbon-empty">该标签页在教学模拟器中暂展示入口位置。</div>
        )}
      </div>
    </header>
  )
}

function OutlinePane({
  activeControlId,
  expandedSectionIds,
  filterText,
  sections,
  selectedTreeId,
  onActivateControl,
  onFilterFocus,
  onFilterTextChange,
  onToggleSection,
}: {
  activeControlId: string
  expandedSectionIds: Set<string>
  filterText: string
  sections: FluentMockTreeSection[]
  selectedTreeId: string
  onActivateControl: (control: FluentMockControl) => void
  onFilterFocus: () => void
  onFilterTextChange: (value: string) => void
  onToggleSection: (sectionId: string) => void
}) {
  return (
    <aside className="fluent-outline-pane">
      <div className="fluent-pane-title">
        <span>案例视图</span>
        <small>Outline</small>
      </div>
      <input
        aria-label="功能树过滤"
        className={activeControlId === 'outline-filter' ? 'active' : ''}
        onChange={(event) => onFilterTextChange(event.target.value)}
        onFocus={onFilterFocus}
        placeholder="过滤树节点"
        type="search"
        value={filterText}
      />

      <div className="fluent-tree-scroll">
        {sections.map((section) => {
          const expanded = expandedSectionIds.has(section.id)
          return (
            <div className="fluent-tree-section" key={section.id}>
              <button
                className="fluent-tree-section-toggle"
                onClick={() => onToggleSection(section.id)}
                type="button"
              >
                <span>{expanded ? '▾' : '▸'}</span>
                {section.label}
              </button>
              {expanded ? (
                <div className="fluent-tree-node-list">
                  {section.controls.map((control) => (
                    <button
                      className={
                        control.id === selectedTreeId
                          ? 'fluent-tree-node active'
                          : 'fluent-tree-node'
                      }
                      key={control.id}
                      onClick={() => onActivateControl(control)}
                      type="button"
                    >
                      {control.labelZh}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

function TaskPane({
  activeControlId,
  panel,
  onActivateControl,
}: {
  activeControlId: string
  panel: FluentMockTaskPanel
  onActivateControl: (control: FluentMockControl) => void
}) {
  return (
    <section className="fluent-task-pane">
      <div className="fluent-pane-title">
        <span>任务页面</span>
        <small>{panel.module}</small>
      </div>
      <div className="fluent-task-title">
        <strong>{panel.title}</strong>
        {panel.subtitle ? <p>{panel.subtitle}</p> : null}
      </div>

      <div className="fluent-task-scroll">
        {panel.groups.map((group) => (
          <div className="fluent-task-group" key={group.id}>
            <div className="fluent-task-group-title">{group.title}</div>
            <div className="fluent-task-control-grid">
              {group.controls.map((control) => (
                <MockControlButton
                  control={control}
                  isActive={control.id === activeControlId}
                  key={control.id}
                  onClick={() => onActivateControl(control)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function GraphicsPane({
  activeControlId,
  onActivateControl,
}: {
  activeControlId: string
  onActivateControl: (control: FluentMockControl) => void
}) {
  const leftTools = fluentMockLayout.graphicsControls.filter(
    (control) => control.group === '左侧工具栏',
  )
  const rightTools = fluentMockLayout.graphicsControls.filter(
    (control) => control.group === '右侧工具栏',
  )
  const selectionControl = fluentMockLayout.graphicsControls.find(
    (control) => control.id === 'graphics-selection-filter',
  )

  return (
    <section className="fluent-graphics-pane">
      <div className="fluent-pane-title">
        <span>User Window 1</span>
        <small>Graphics</small>
      </div>
      <div className="fluent-graphics-layout">
        <div className="fluent-graphics-toolbar">
          {leftTools.map((control) => (
            <button
              aria-label={control.labelZh}
              className={control.id === activeControlId ? 'active' : ''}
              key={control.id}
              onClick={() => onActivateControl(control)}
              title={control.labelZh}
              type="button"
            >
              {control.labelZh.slice(0, 1)}
            </button>
          ))}
        </div>
        <div className="fluent-graphics-canvas">
          <div className="fluent-grid-plane" />
          <div className="fluent-axis-widget" aria-hidden="true">
            <span className="axis axis-x">X</span>
            <span className="axis axis-y">Y</span>
            <span className="axis axis-z">Z</span>
          </div>
        </div>
        <div className="fluent-graphics-toolbar">
          {rightTools.map((control) => (
            <button
              aria-label={control.labelZh}
              className={control.id === activeControlId ? 'active' : ''}
              key={control.id}
              onClick={() => onActivateControl(control)}
              title={control.labelZh}
              type="button"
            >
              {control.labelZh.slice(0, 1)}
            </button>
          ))}
        </div>
      </div>
      {selectionControl ? (
        <button
          className={
            selectionControl.id === activeControlId
              ? 'fluent-selection-filter active'
              : 'fluent-selection-filter'
          }
          onClick={() => onActivateControl(selectionControl)}
          type="button"
        >
          {selectionControl.labelZh}
        </button>
      ) : null}
    </section>
  )
}

function ConsolePane({
  activeControlId,
  onActivateControl,
}: {
  activeControlId: string
  onActivateControl: (control: FluentMockControl) => void
}) {
  const control = fluentMockLayout.consoleControl

  return (
    <button
      aria-label="控制台区域"
      className={
        activeControlId === control.id
          ? 'fluent-console-pane active'
          : 'fluent-console-pane'
      }
      onClick={() => onActivateControl(control)}
      type="button"
    >
      <span className="fluent-pane-title">
        <span>控制台</span>
        <small>Console</small>
      </span>
      <code>
        water
        {'\n'}air
        {'\n'}Mesh check completed.
        {'\n'}Done.
        {'\n'}&gt;
      </code>
      <span className="sr-only">控制台区域</span>
    </button>
  )
}

function ExplanationPane({
  explanation,
}: {
  explanation: FluentMockExplanation | undefined
}) {
  if (!explanation) {
    return null
  }

  return (
    <aside className="fluent-explanation-pane" aria-label="控件说明">
      <p className="eyebrow">Control guide</p>
      <h2>{explanation.title}</h2>
      <div className="fluent-explanation-meta" aria-label="控件元信息">
        <span>{explanation.location}</span>
        <span>{explanation.controlType}</span>
      </div>
      <ExplanationSection title="是什么" text={explanation.whatItIs} />
      <ExplanationSection title="建议" text={explanation.recommendation} />
      <ExplanationSection title="适用场景" text={explanation.whenToUse} />
      <div className="fluent-explanation-section">
        <strong>检查要点</strong>
        <ul className="fluent-check-list">
          {explanation.checkItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <ExplanationSection title="常见误区" text={explanation.commonMistakes} />
      {explanation.relatedControls.length ? (
        <div className="fluent-explanation-section">
          <strong>相关功能</strong>
          <div className="fluent-related-list">
            {explanation.relatedControls.map((controlId) => {
              const relatedControl = findControlById(controlId)
              return (
                <span key={controlId}>
                  {relatedControl?.labelZh ?? controlId}
                </span>
              )
            })}
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function ExplanationSection({ text, title }: { text: string; title: string }) {
  return (
    <div className="fluent-explanation-section">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}

function MockDialog({
  activeDialogControlId,
  dialog,
  onActivateDialogControl,
  onClose,
}: {
  activeDialogControlId: string | null
  dialog: FluentMockDialog
  onActivateDialogControl: (control: FluentMockControl) => void
  onClose: () => void
}) {
  return (
    <div className="fluent-dialog-backdrop">
      <section
        aria-label={dialog.title}
        className="fluent-dialog-window"
        role="dialog"
      >
        <div className="fluent-dialog-titlebar">
          <strong>{dialog.title}</strong>
          <button
            aria-label={`关闭${dialog.title}`}
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <p>{dialog.subtitle}</p>
        <div className="fluent-dialog-control-grid">
          {dialog.controls.map((control) => (
            <MockControlButton
              control={control}
              isActive={control.id === activeDialogControlId}
              key={control.id}
              onClick={() => onActivateDialogControl(control)}
            />
          ))}
        </div>
        <div className="fluent-dialog-actions">
          <button className="ghost-button button-link-small" type="button">
            应用
          </button>
          <button
            className="ghost-button button-link-small"
            onClick={onClose}
            type="button"
          >
            关闭
          </button>
        </div>
      </section>
    </div>
  )
}

function MockControlButton({
  control,
  isActive,
  onClick,
}: {
  control: FluentMockControl
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      aria-label={control.labelZh}
      className={`fluent-mock-control fluent-control-${control.controlType}${
        isActive ? ' active' : ''
      }`}
      disabled={!control.enabled}
      onClick={onClick}
      type="button"
    >
      <span className="fluent-control-label">{control.labelZh}</span>
      {control.value ? <small>{control.value}</small> : null}
    </button>
  )
}

function findControlById(controlId: string | null) {
  if (!controlId) {
    return null
  }

  const dialogControl = fluentDialogs
    .flatMap((dialog) => dialog.controls)
    .find((control) => control.id === controlId)

  return (
    dialogControl ??
    fluentMockLayout.allControls.find((control) => control.id === controlId) ??
    null
  )
}

function filterTreeSections(
  sections: FluentMockTreeSection[],
  filterText: string,
) {
  const query = filterText.trim().toLowerCase()

  if (!query) {
    return sections
  }

  return sections
    .map((section) => ({
      ...section,
      controls: section.controls.filter((control) =>
        [control.label, control.labelZh, control.module]
          .join(' ')
          .toLowerCase()
          .includes(query),
      ),
    }))
    .filter((section) => section.controls.length > 0)
}

export default FluentSolverMock
