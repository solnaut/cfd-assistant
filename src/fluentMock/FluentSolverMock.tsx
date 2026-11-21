import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FluentIcon } from './FluentIcons'
import { FluentViewport } from './FluentViewport'
import { fluentExplanationById } from './fluentExplanations'
import { labelIn, type FluentLabel, type FluentLanguage } from './fluentLanguage'
import { fluentMockLayout as layout } from './fluentLayoutData'
import type { FluentMockControl, FluentMockExplanation } from './fluentTypes'
import './styles/fluentWorkspace.css'

const controls = [
  ...layout.allControls,
  ...layout.dialogs.flatMap((dialog) => dialog.controls),
]
const controlById = new Map(controls.map((control) => [control.id, control]))
const searchEntries = controls
  .filter((control) => control.enabled && control.id !== layout.quickSearchControl.id)
  .map((control) => ({
    control,
    location: layout.dialogs.find((dialog) => dialog.id === control.parentId)?.title
      ?? layout.ribbonTabs.find((tab) => tab.groups.some((group) => group.controls.includes(control)))?.label
      ?? control.region,
    names: [control.label, control.labelZh, labelIn('en', control.label), labelIn('zh', control.label)]
      .map((name) => name.toLowerCase()),
  }))
const defaultExpanded = layout.treeSections
  .filter((section) => section.defaultExpanded)
  .map((section) => section.id)

export default function FluentSolverMock() {
  const root = useRef<HTMLElement>(null)
  const [language, setLanguage] = useState<FluentLanguage>('en')
  const [ribbonId, setRibbonId] = useState('ribbon-tab-domain')
  const [panelId, setPanelId] = useState(layout.defaultPanelId)
  const [activeControlId, setActiveControlId] = useState(layout.defaultControlId)
  const [filterText, setFilterText] = useState('')
  const [expandedSections, setExpandedSections] = useState(defaultExpanded)
  const [showGuide, setShowGuide] = useState(true)
  const [dialogs, setDialogs] = useState<{ id: string; openerId: string }[]>([])
  const [focusTarget, setFocusTarget] = useState<{ id: string } | null>(null)

  const label: FluentLabel = (term) => labelIn(language, term)
  const ribbon = layout.ribbonTabs.find((tab) => tab.id === ribbonId) ?? layout.ribbonTabs[1]
  const panel = layout.taskPanels.find((item) => item.id === panelId) ?? layout.taskPanels[0]
  const dialog = layout.dialogs.find((item) => item.id === dialogs.at(-1)?.id)
  const activeControl = controlById.get(activeControlId)
  const explanation = fluentExplanationById.get(activeControl?.explanationId ?? '')
  const outlineQuery = filterText.trim().toLowerCase()

  useEffect(() => {
    if (!focusTarget) return
    const target = root.current?.querySelector<HTMLElement>(
      '[data-fluent-control="' + focusTarget.id + '"]',
    )
    target?.focus({ preventScroll: true })
    target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focusTarget])

  function inspect(control: FluentMockControl) {
    setActiveControlId(control.id)
  }

  function activate(control: FluentMockControl, locate = false) {
    inspect(control)
    const ownerDialog = layout.dialogs.find((item) => item.id === control.parentId)
    const ownerPanel = layout.taskPanels.find((item) =>
      item.groups.some((group) => group.controls.includes(control)),
    )
    const ownerRibbon = layout.ribbonTabs.find((tab) =>
      tab.groups.some((group) => group.controls.includes(control)),
    )
    const ownerSection = layout.treeSections.find((section) =>
      section.controls.some((node) => node.id === control.id || node.panelId === (control.panelId ?? ownerPanel?.id)),
    )

    const nextPanelId = control.panelId ?? ownerPanel?.id
    if (nextPanelId) setPanelId(nextPanelId)
    if (ownerRibbon) setRibbonId(ownerRibbon.id)
    if (locate && ownerSection) {
      setFilterText('')
      setExpandedSections((items) => items.includes(ownerSection.id) ? items : [...items, ownerSection.id])
    }

    if (ownerDialog) {
      setDialogs((items) => {
        const index = items.findIndex((item) => item.id === ownerDialog.id)
        const stack = index >= 0
          ? items.slice(0, index + 1)
          : [{ id: ownerDialog.id, openerId: activeControlId }]
        return !locate && control.dialogId
          ? [...stack, { id: control.dialogId, openerId: control.id }]
          : stack
      })
    } else {
      setDialogs(control.dialogId ? [{ id: control.dialogId, openerId: control.id }] : [])
    }

    if (locate) setShowGuide(true)
    if (locate && (ownerDialog || !control.dialogId)) setFocusTarget({ id: control.id })
    if (control.dialogId && (!ownerDialog || !locate)) setFocusTarget({ id: control.dialogId })
  }

  function closeDialog() {
    const current = dialogs.at(-1)
    if (!current) return
    setDialogs(dialogs.slice(0, -1))
    setActiveControlId(current.openerId)
    setFocusTarget({ id: current.openerId })
  }

  function toggleSection(id: string) {
    if (outlineQuery) setFilterText('')
    setExpandedSections((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id])
  }

  return (
    <section
      ref={root}
      className="fluent-workbench"
      aria-labelledby="fluent-title"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && dialog) {
          event.preventDefault()
          closeDialog()
        }
      }}
    >
      <header className="fluent-topbar">
        <div className="fluent-topbar-brand">
          <Link to="/">CFD Assistant</Link>
          <nav aria-label="站内导航" lang="zh-CN">
            <Link to="/calculators">参数计算</Link>
            <Link to="/formulas">CFD 公式库</Link>
          </nav>
        </div>
        <div className="fluent-topbar-actions" lang="zh-CN">
          <button
            type="button"
            aria-controls="fluent-guide-panel"
            aria-expanded={showGuide}
            onClick={() => setShowGuide((value) => !value)}
          >
            <FluentIcon name="guide" /> 教学说明
          </button>
          <select
            aria-label="界面语言"
            value={language}
            onChange={(event) => setLanguage(event.target.value as FluentLanguage)}
          >
            <option value="en" lang="en">English</option>
            <option value="both">双语</option>
            <option value="zh">简体中文</option>
          </select>
        </div>
      </header>

      <div className="fluent-titlebar">
        <div>
          <h1 id="fluent-title">{label('Fluent Solver Workbench')}</h1>
          <p>{label('Teaching preview')} <span aria-hidden="true">/</span> {label('No solver session')}</p>
        </div>
        <QuickSearch label={label} onInspect={() => inspect(layout.quickSearchControl)} onLocate={activate} />
      </div>

      <header className="fluent-ribbon">
        <nav className="fluent-ribbon-tabs" aria-label={label('Command tabs')}>
          {layout.ribbonTabs.map((tab) => (
            <button key={tab.id} aria-pressed={tab.id === ribbonId} type="button"
              onClick={() => setRibbonId(tab.id)}>
              {label(tab.label)}
            </button>
          ))}
        </nav>
        <div className="fluent-ribbon-groups">
          {ribbon.groups.some((group) => group.controls.length > 0) ? (
            ribbon.groups.map((group) => (
              <div className="fluent-ribbon-group" key={group.id}>
                <div className="fluent-ribbon-buttons">
                  {group.controls.map((control) => (
                    <button
                      className={'fluent-ribbon-tool' + (control.id === activeControlId ? ' active' : '')}
                      data-fluent-control={control.id}
                      disabled={!control.enabled}
                      key={control.id}
                      onClick={() => activate(control)}
                      type="button"
                    >
                      <FluentIcon controlId={control.id} />
                      <span>{label(control.label)}</span>
                    </button>
                  ))}
                </div>
                <span className="fluent-ribbon-group-label">
                  {label(group.id === 'ribbon-zone' ? 'Zones' : group.label)}
                </span>
              </div>
            ))
          ) : (
            <p className="fluent-ribbon-empty">{label('No interactive commands in this tab.')}</p>
          )}
        </div>
      </header>

      <div className={'fluent-solver-main-grid' + (showGuide ? '' : ' fluent-guide-closed')}>
        <aside className="fluent-outline-pane" aria-label={label('Outline')}>
          <div className="fluent-pane-title">
            <span>{label('Outline')}</span>
            <div className="fluent-outline-actions">
              <button type="button" aria-label={label('Expand all')} title={label('Expand all')}
                onClick={() => setExpandedSections(layout.treeSections.map((section) => section.id))}>
                <FluentIcon name="expand" />
              </button>
              <button type="button" aria-label={label('Collapse all')} title={label('Collapse all')}
                onClick={() => { setFilterText(''); setExpandedSections([]) }}>
                <FluentIcon name="collapse" />
              </button>
            </div>
          </div>
          <input
            aria-label={label('Filter Outline')}
            data-fluent-control={layout.outlineFilterControl.id}
            onChange={(event) => setFilterText(event.target.value)}
            onFocus={() => inspect(layout.outlineFilterControl)}
            placeholder={label('Filter Outline')}
            type="search"
            value={filterText}
          />
          <div className="fluent-tree-scroll">
            {layout.treeSections.map((section) => {
              const nodes = section.controls.filter((control) =>
                matchesControl(control, outlineQuery),
              )
              if (!nodes.length) return null
              const expanded = Boolean(outlineQuery) || expandedSections.includes(section.id)
              return (
                <div className="fluent-tree-section" key={section.id}>
                  <button className="fluent-tree-section-toggle" aria-expanded={expanded}
                    type="button" onClick={() => toggleSection(section.id)}>
                    <FluentIcon name="chevron" /> {label(section.label)}
                  </button>
                  {expanded && (
                    <div className="fluent-tree-node-list">
                      {nodes.map((control) => (
                        <button className={'fluent-tree-node' + (control.panelId === panel.id ? ' active' : '')}
                          aria-current={control.panelId === panel.id ? 'true' : undefined}
                          data-fluent-control={control.id} key={control.id}
                          type="button" onClick={() => activate(control)}>
                          {label(control.label)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {outlineQuery && !layout.treeSections.some((section) =>
              section.controls.some((control) => matchesControl(control, outlineQuery)),
            ) && <p className="fluent-tree-empty">{label('No matching nodes')}</p>}
          </div>
        </aside>

        <section className="fluent-task-pane" aria-label={label('Task Page')}>
          <div className="fluent-pane-title">{label('Task Page')}</div>
          <div className="fluent-task-scroll">
            <h2>{label(panel.title)}</h2>
            {panel.groups.map((group) => (
              <fieldset className="fluent-task-group" key={group.id}>
                {group.title !== panel.title && <legend>{label(group.title)}</legend>}
                {group.controls.map((control) => (
                  <ControlRow control={control} key={control.id} label={label}
                    active={control.id === activeControlId} onActivate={activate} />
                ))}
              </fieldset>
            ))}
          </div>
        </section>

        <div className="fluent-graphics-stack">
          <FluentViewport activeControlId={activeControlId} label={label} onInspect={inspect} />
          <section className="fluent-console-pane" aria-label={label('Console')}>
            <div className="fluent-pane-title">
              <button type="button" data-fluent-control={layout.consoleControl.id}
                className={activeControlId === layout.consoleControl.id ? 'active' : ''}
                onClick={() => inspect(layout.consoleControl)}>
                {label('Console')}
              </button>
              <small>{label('Teaching preview')}</small>
            </div>
            <code>{label('Ready to explore the example case.')}</code>
          </section>
        </div>

        <ExplanationPane activeControl={activeControl} explanation={explanation} label={label}
          visible={showGuide} onLocate={activate} />

        {dialog && (
          <section className="fluent-dialog-window" role="dialog"
            aria-label={label(dialog.title)} data-fluent-control={dialog.id} tabIndex={-1}>
            <div className="fluent-dialog-titlebar">
              <strong>{label(dialog.title)}</strong>
              <button type="button" aria-label={label('Close') + ' ' + label(dialog.title)} onClick={closeDialog}>×</button>
            </div>
            <div className="fluent-dialog-body">
              {dialog.controls.map((control) => (
                <ControlRow control={control} key={control.id} label={label}
                  active={control.id === activeControlId} onActivate={activate} />
              ))}
            </div>
            <div className="fluent-dialog-actions">
              <button type="button" onClick={closeDialog}>{label('Close')}</button>
            </div>
          </section>
        )}
      </div>
    </section>
  )
}

function matchesControl(control: FluentMockControl, query: string) {
  return [control.label, control.module, labelIn('en', control.label), labelIn('zh', control.label)]
    .some((name) => name.toLowerCase().includes(query))
}

function QuickSearch({
  label,
  onInspect,
  onLocate,
}: {
  label: FluentLabel
  onInspect: () => void
  onLocate: (control: FluentMockControl, locate: true) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const normalized = query.trim().toLowerCase()
  const matches = normalized
    ? searchEntries
      .filter(({ names }) => names.some((name) => name.includes(normalized)))
      .sort((a, b) =>
        Number(b.names.includes(normalized)) - Number(a.names.includes(normalized)),
      )
      .slice(0, 8)
    : []

  function locate(control: FluentMockControl) {
    setQuery('')
    setOpen(false)
    onLocate(control, true)
  }

  return (
    <form className="fluent-quick-search" role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && normalized) {
          event.stopPropagation()
          setOpen(false)
        }
      }}
      onSubmit={(event) => {
        event.preventDefault()
        if (open && matches[0]) locate(matches[0].control)
      }}>
      <label>
        <FluentIcon name="search" />
        <input aria-label={label('Quick Search')} data-fluent-control={layout.quickSearchControl.id}
          placeholder={label('Quick Search')} type="search" value={query}
          onFocus={() => { setOpen(true); onInspect() }}
          onChange={(event) => { setOpen(true); setQuery(event.target.value) }} />
      </label>
      {open && normalized && (
        <div className="fluent-search-results">
          {matches.length === 0 && <p role="status">{label('No matching controls')}</p>}
          {matches.map(({ control, location }) => (
            <button type="button" key={control.id} aria-label={label(control.label)}
              aria-describedby={'search-location-' + control.id} onClick={() => locate(control)}>
              <span>{label(control.label)}</span>
              <small id={'search-location-' + control.id}>{label(location)}</small>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

function ControlRow({ control, active, label, onActivate }: {
  control: FluentMockControl
  active: boolean
  label: FluentLabel
  onActivate: (control: FluentMockControl) => void
}) {
  return (
    <button type="button" className={'fluent-control-row' + (active ? ' active' : '')}
      data-fluent-control={control.id} disabled={!control.enabled} onClick={() => onActivate(control)}>
      <span>{label(control.label)}</span>
      {control.value && <small>{label(control.value)}</small>}
      {control.dialogId && <FluentIcon name="chevron" />}
    </button>
  )
}

function ExplanationPane({ activeControl, explanation, label, visible, onLocate }: {
  activeControl?: FluentMockControl
  explanation?: FluentMockExplanation
  label: FluentLabel
  visible: boolean
  onLocate: (control: FluentMockControl, locate: true) => void
}) {
  return (
    <aside className="fluent-explanation-pane" id="fluent-guide-panel" aria-label="控件说明"
      lang="zh-CN" hidden={!visible}>
      <div className="fluent-pane-title"><FluentIcon name="guide" /> 教学说明</div>
      {explanation && (
        <div className="fluent-explanation-scroll" key={explanation.id} aria-live="polite">
          <p className="fluent-explanation-location">{explanation.location}</p>
          <h2>{explanation.title}</h2>
          {[['是什么', explanation.whatItIs], ['建议', explanation.recommendation], ['适用场景', explanation.whenToUse]]
            .map(([title, value]) => (
              <section key={title}><h3>{title}</h3><p>{value}</p></section>
            ))}
          <section>
            <h3>检查要点</h3>
            <ul>{explanation.checkItems.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section><h3>常见误区</h3><p>{explanation.commonMistakes}</p></section>
          {explanation.relatedControls.some((id) => controlById.get(id)?.enabled) && (
            <section>
              <h3>相关功能</h3>
              <div className="fluent-related-list">
                {explanation.relatedControls.map((id) => {
                  const control = controlById.get(id)
                  return control?.enabled && (
                    <button type="button" key={id} disabled={id === activeControl?.id}
                      onClick={() => onLocate(control, true)}>
                      {label(control.label)} <FluentIcon name="chevron" />
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </aside>
  )
}
