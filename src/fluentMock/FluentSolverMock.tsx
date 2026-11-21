import { useEffect, useReducer, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FluentIcon } from './FluentIcons'
import { FluentViewport } from './FluentViewport'
import { ConsolePane } from './components/ConsolePane'
import { ControlRenderer } from './components/ControlRenderer'
import { DialogStack, type OpenDialogEntry } from './components/DialogStack'
import { ExplanationPane } from './components/ExplanationPane'
import { OutlinePane } from './components/OutlinePane'
import { fluentExplanationById } from './fluentExplanations'
import { labelIn, type FluentLabel, type FluentLanguage } from './fluentLanguage'
import { fluentMockLayout as layout } from './fluentLayoutData'
import { walkthroughSteps } from './fluentTeachingExtras'
import {
  createInitialFluentSimState,
  fluentSimReducer,
  formatViscousBadge,
  type HighlightedBoundary,
} from './state/fluentSimState'
import { parseAndExecuteTui } from './state/fluentTuiCommands'
import {
  consumeMeshingHandoff,
  parseLauncherParams,
} from './state/fluentWorkbenchBridge'
import type { FluentMockControl } from './fluentTypes'
import './styles/fluentWorkspace.css'

const controls = [
  ...layout.allControls,
  ...layout.dialogs.flatMap((dialog) => dialog.controls),
]
const controlById = new Map(controls.map((control) => [control.id, control]))
const searchEntries = controls
  .filter(
    (control) =>
      control.enabled && control.id !== layout.quickSearchControl.id,
  )
  .map((control) => ({
    control,
    location:
      layout.dialogs.find((dialog) => dialog.id === control.parentId)?.title ??
      layout.ribbonTabs.find((tab) =>
        tab.groups.some((group) => group.controls.includes(control)),
      )?.label ??
      control.region,
    names: [
      control.label,
      control.labelZh,
      labelIn('en', control.label),
      labelIn('zh', control.label),
    ].map((name) => name.toLowerCase()),
  }))

const defaultExpanded = layout.treeSections
  .filter((section) => section.defaultExpanded)
  .map((section) => section.id)

const defaultExpandedTreeNodes = ['tree-models', 'tree-boundary-conditions']
const expandableTreeNodes = [
  'tree-models',
  'tree-materials',
  'tree-cell-zone-conditions',
  'tree-boundary-conditions',
  'tree-monitors',
  'tree-surfaces',
  'tree-graphics',
  'tree-plots',
  'tree-reports',
]

export default function FluentSolverMock() {
  const root = useRef<HTMLElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [simState, dispatch] = useReducer(
    fluentSimReducer,
    undefined,
    createInitialFluentSimState,
  )
  const [language, setLanguage] = useState<FluentLanguage>('en')
  const [ribbonId, setRibbonId] = useState('ribbon-tab-domain')
  const [panelId, setPanelId] = useState(layout.defaultPanelId)
  const [activeControlId, setActiveControlId] = useState(layout.defaultControlId)
  const [activeOptionValue, setActiveOptionValue] = useState<string | null>(
    null,
  )
  const [filterText, setFilterText] = useState('')
  const [expandedSections, setExpandedSections] = useState(defaultExpanded)
  const [expandedTreeNodes, setExpandedTreeNodes] = useState(
    defaultExpandedTreeNodes,
  )
  const [showGuide, setShowGuide] = useState(true)
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [dialogs, setDialogs] = useState<OpenDialogEntry[]>([])
  const [focusTarget, setFocusTarget] = useState<{ id: string } | null>(null)

  useEffect(() => {
    const handoff = consumeMeshingHandoff()
    const launcher = parseLauncherParams(location.search)
    if (handoff || Object.keys(launcher).length > 0) {
      dispatch({ type: 'APPLY_MESHING_HANDOFF', handoff, launcher })
    }
  }, [location.search])

  const label: FluentLabel = (term) => labelIn(language, term)
  const ribbon =
    layout.ribbonTabs.find((tab) => tab.id === ribbonId) ?? layout.ribbonTabs[1]
  const panel =
    layout.taskPanels.find((item) => item.id === panelId) ??
    layout.taskPanels[0]
  const topDialog = dialogs.at(-1)
  const activeControl = controlById.get(activeControlId)
  const explanation = fluentExplanationById.get(
    activeControl?.explanationId ?? '',
  )
  const outlineQuery = filterText.trim().toLowerCase()

  useEffect(() => {
    if (!focusTarget) return
    const target = root.current?.querySelector<HTMLElement>(
      '[data-fluent-control="' + focusTarget.id + '"]',
    )
    target?.focus({ preventScroll: true })
    target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focusTarget])

  function inspect(control: FluentMockControl, optionValue?: string) {
    setActiveControlId(control.id)
    setActiveOptionValue(optionValue ?? null)
  }

  function triggerControlSideEffect(control: FluentMockControl) {
    switch (control.id) {
      case 'ribbon-mesh-check':
      case 'general-check':
      case 'mesh-check-run':
        dispatch({ type: 'RUN_MESH_CHECK' })
        break
      case 'general-report-quality':
      case 'ribbon-mesh-quality':
      case 'mesh-quality-copy':
        dispatch({ type: 'RUN_MESH_QUALITY' })
        break
      case 'general-display':
      case 'ribbon-mesh-display':
      case 'results-mesh':
        dispatch({ type: 'DISPLAY_MESH' })
        break
      case 'run-check-case':
      case 'ribbon-check-case':
        dispatch({ type: 'RUN_CASE_CHECK' })
        break
      case 'ribbon-run-steady':
        dispatch({ type: 'SET_TIME_FORMULATION', value: 'steady' })
        break
      case 'ribbon-run-transient':
        dispatch({ type: 'SET_TIME_FORMULATION', value: 'transient' })
        break
      case 'material-change-create':
        dispatch({ type: 'UPSERT_MATERIAL' })
        break
      case 'initialization-hybrid':
      case 'initialization-run':
      case 'initialization-fmg':
      case 'ribbon-initialize-fmg':
        dispatch({ type: 'RUN_INITIALIZE', method: 'hybrid' })
        break
      case 'initialization-standard':
        dispatch({ type: 'RUN_INITIALIZE', method: 'standard' })
        break
      case 'initialization-reset':
        dispatch({ type: 'RESET_INITIALIZATION' })
        break
      case 'initialization-patch-apply':
        dispatch({ type: 'RUN_PATCH' })
        break
      case 'controls-reset-default':
        dispatch({ type: 'RESET_URF_DEFAULTS' })
        break
      case 'run-calculate':
      case 'run-calculation-calculate':
        dispatch({ type: 'RUN_CALCULATE' })
        break
      case 'results-contours':
      case 'ribbon-contours':
      case 'dash-show-contours':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'contours' })
        break
      case 'results-vectors':
      case 'ribbon-vectors':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'vectors' })
        break
      case 'results-pathlines':
      case 'ribbon-pathlines':
      case 'pathlines-display':
      case 'results-particle-tracks':
      case 'ribbon-particle-tracks':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'pathlines' })
        break
      case 'plot-xy':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'xy-plot' })
        break
      case 'plot-residuals':
      case 'dash-show-residuals':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'residuals' })
        break
      case 'fluxes-compute':
      case 'dash-check-fluxes':
        dispatch({ type: 'RUN_FLUXES_REPORT' })
        break
      case 'forces-compute':
        dispatch({ type: 'RUN_FORCES_REPORT' })
        break
      case 'vol-int-compute':
        dispatch({ type: 'RUN_VOLUME_INTEGRAL' })
        break
      case 'partition-run':
      case 'ribbon-parallel-auto-partition':
        dispatch({ type: 'RUN_PARTITION' })
        break
      case 'ribbon-parallel-network':
      case 'ribbon-parallel-timer':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [
            {
              kind: 'output',
              text: `[Parallel Diagnostics] ${simState.processes} MPI processes active, network latency = 0.04 ms (Teaching Demo).`,
            },
          ],
        })
        break
      case 'udf-load':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [
            {
              kind: 'success',
              text: '[Teaching Demo] UDF source compiled and loaded into libudf.',
            },
          ],
        })
        break
      case 'sim-report-generate':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [
            {
              kind: 'success',
              text: '[Teaching Demo] Generated Simulation Report snapshot with mesh, physics & convergence summary.',
            },
          ],
        })
        break
      case 'ribbon-view-iso':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'isometric' })
        break
      case 'ribbon-view-front':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'front' })
        break
      case 'ribbon-view-top':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'top' })
        break
      case 'ribbon-view-left':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'left' })
        break
      case 'ribbon-view-fit':
      case 'ribbon-view-reset':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'isometric' })
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'mesh' })
        break
      case 'ribbon-switch-to-meshing':
      case 'ribbon-help-meshing':
        navigate(
          `/fluent-meshing?dim=${simState.dimension}&dp=${simState.doublePrecision ? '1' : '0'}&np=${simState.processes}`,
        )
        break
      case 'ribbon-help-walkthrough':
        setShowWalkthrough((v) => !v)
        break
      case 'ribbon-help-troubleshoot':
        setShowGuide(true)
        break
      case 'ribbon-help-calculators':
        navigate('/calculators')
        break
      case 'ribbon-help-formulas':
        navigate('/formulas')
        break
      case 'ribbon-help-tui':
        dispatch(parseAndExecuteTui('help', simState))
        break
      case 'units-restore-si':
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'units-length', value: 'm' })
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'units-pressure', value: 'Pa' })
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'units-temperature', value: 'K' })
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [{ kind: 'info', text: 'Display units restored to SI (m, Pa, K).' }],
        })
        break
      case 'mesh-scale-apply':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [
            {
              kind: 'info',
              text: `Applied mesh scale factor ${simState.meshScale.factor} (${simState.meshScale.targetUnit}).`,
            },
          ],
        })
        break
      case 'surface-integrals-compute':
      case 'reports-compute':
        dispatch({
          type: 'COMPUTE_REPORT',
          reportLabel: label(control.label),
        })
        break
      default:
        break
    }
  }

  function highlightBoundaryForControl(controlId: string): HighlightedBoundary {
    if (
      controlId === 'bc-velocity-inlet' ||
      controlId === 'bc-mass-flow-inlet' ||
      controlId === 'bc-pressure-inlet'
    ) {
      return 'inlet'
    }
    if (
      controlId === 'bc-pressure-outlet' ||
      controlId === 'bc-outflow' ||
      controlId === 'bc-pressure-far-field'
    ) {
      return 'outlet'
    }
    if (controlId === 'bc-wall') return 'wall'
    if (controlId === 'bc-symmetry' || controlId === 'bc-axis') return 'symmetry'
    return null
  }

  function activate(control: FluentMockControl, locate = false) {
    inspect(control)
    const boundary = highlightBoundaryForControl(control.id)
    if (boundary) {
      dispatch({ type: 'SET_HIGHLIGHTED_BOUNDARY', boundary })
    }

    if (!locate) {
      triggerControlSideEffect(control)
    }

    const ownerDialog = layout.dialogs.find(
      (item) => item.id === control.parentId,
    )
    const ownerPanel = layout.taskPanels.find((item) =>
      item.groups.some((group) => group.controls.includes(control)),
    )
    const ownerRibbon = layout.ribbonTabs.find((tab) =>
      tab.groups.some((group) => group.controls.includes(control)),
    )
    const ownerSection = layout.treeSections.find((section) =>
      section.controls.some(
        (node) =>
          node.id === control.id ||
          node.panelId === (control.panelId ?? ownerPanel?.id),
      ),
    )

    const nextPanelId = control.panelId ?? ownerPanel?.id
    if (nextPanelId) setPanelId(nextPanelId)
    if (ownerRibbon) setRibbonId(ownerRibbon.id)
    if (locate && ownerSection) {
      setFilterText('')
      setExpandedSections((items) =>
        items.includes(ownerSection.id) ? items : [...items, ownerSection.id],
      )
    }

    if (ownerDialog) {
      setDialogs((items) => {
        const index = items.findIndex((item) => item.id === ownerDialog.id)
        const stack =
          index >= 0
            ? items.slice(0, index + 1)
            : [{ id: ownerDialog.id, openerId: activeControlId, x: 0, y: 0 }]
        return !locate && control.dialogId
          ? [...stack, { id: control.dialogId, openerId: control.id, x: 0, y: 0 }]
          : stack
      })
    } else {
      setDialogs(
        control.dialogId
          ? [{ id: control.dialogId, openerId: control.id, x: 0, y: 0 }]
          : [],
      )
    }

    if (locate) setShowGuide(true)
    if (locate && (ownerDialog || !control.dialogId)) {
      setFocusTarget({ id: control.id })
    }
    if (control.dialogId && (!ownerDialog || !locate)) {
      setFocusTarget({ id: control.dialogId })
    }
  }

  function locateById(controlId: string) {
    const control = controlById.get(controlId)
    if (control) activate(control, true)
  }

  function closeTopDialog() {
    const current = dialogs.at(-1)
    if (!current) return
    setDialogs((items) => items.slice(0, -1))
    setActiveControlId(current.openerId)
    setFocusTarget({ id: current.openerId })
  }

  function toggleSection(id: string) {
    if (outlineQuery) setFilterText('')
    setExpandedSections((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    )
  }

  function toggleTreeNode(id: string) {
    setExpandedTreeNodes((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    )
  }

  function handleControlValueChange(
    control: FluentMockControl,
    value: string | boolean,
  ) {
    dispatch({
      type: 'SET_CONTROL_VALUE',
      controlId: control.id,
      value,
    })
  }

  const currentStep = walkthroughSteps[simState.walkthroughStep]

  return (
    <section
      ref={root}
      className="fluent-workbench"
      aria-labelledby="fluent-title"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && topDialog) {
          event.preventDefault()
          closeTopDialog()
        }
      }}
    >
      <header className="fluent-topbar">
        <div className="fluent-topbar-brand">
          <Link to="/">CFD Assistant</Link>
          <nav aria-label="站内导航" lang="zh-CN">
            <Link to="/">功能首页</Link>
            <Link to="/calculators">参数计算</Link>
            <Link to="/formulas">CFD 公式库</Link>
          </nav>
          <div className="fluent-mode-switcher" role="group" aria-label="Fluent 模式切换">
            <Link className="fluent-mode-pill" to="/fluent-meshing">
              Meshing
            </Link>
            <span className="fluent-mode-pill active">Solution</span>
          </div>
        </div>
        <div className="fluent-topbar-actions" lang="zh-CN">
          <button
            type="button"
            className={showWalkthrough ? 'active-toggle' : ''}
            onClick={() => setShowWalkthrough((value) => !value)}
          >
            {label('10-Step Guide')}
          </button>
          <button
            type="button"
            onClick={() => {
              dispatch({ type: 'RESET_CASE' })
              setDialogs([])
            }}
          >
            {label('Reset Case')}
          </button>
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
            onChange={(event) =>
              setLanguage(event.target.value as FluentLanguage)
            }
          >
            <option value="en" lang="en">
              English
            </option>
            <option value="both">双语</option>
            <option value="zh">简体中文</option>
          </select>
        </div>
      </header>

      <div className="fluent-titlebar">
        <div className="fluent-titlebar-left">
          <h1 id="fluent-title">{label('Fluent Solver Workbench')}</h1>
          <p>
            [{simState.dimension}, {simState.doublePrecision ? 'dp' : 'sp'},{' '}
            {simState.solverType === 'pressure-based' ? 'pbns' : 'dbns'}, np=
            {simState.processes}] <span aria-hidden="true">/</span>{' '}
            {label('Teaching preview')} <span aria-hidden="true">/</span>{' '}
            {label('No solver session')}
          </p>
        </div>
        <QuickSearch
          label={label}
          onInspect={() => inspect(layout.quickSearchControl)}
          onLocate={activate}
        />
      </div>

      {showWalkthrough ? (
        <div className="fluent-walkthrough-bar" lang="zh-CN">
          <div className="fluent-walkthrough-copy">
            <span className="fluent-walkthrough-badge">
              步骤 {simState.walkthroughStep + 1} / {walkthroughSteps.length}
            </span>
            <strong>{currentStep.title}</strong>
            <span>{currentStep.instruction}</span>
          </div>
          <div className="fluent-walkthrough-actions">
            <button
              type="button"
              className="primary"
              onClick={() => locateById(currentStep.controlId)}
            >
              定位该控件
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({
                  type: 'MARK_WALKTHROUGH_STEP',
                  step: simState.walkthroughStep,
                })
              }
            >
              {simState.walkthroughStep < walkthroughSteps.length - 1
                ? '完成并下一步'
                : '已完成演练'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'none' }} aria-hidden="true" />
      )}

      <header className="fluent-ribbon">
        <nav className="fluent-ribbon-tabs" aria-label={label('Command tabs')}>
          {layout.ribbonTabs.map((tab) => (
            <button
              key={tab.id}
              className={tab.id === 'ribbon-tab-file' ? 'fluent-file-tab' : ''}
              aria-pressed={tab.id === ribbonId}
              type="button"
              onClick={() => setRibbonId(tab.id)}
            >
              {label(tab.label)}
            </button>
          ))}
        </nav>
        <div className="fluent-ribbon-groups">
          {ribbon.groups.map((group) => (
            <div className="fluent-ribbon-group" key={group.id}>
              <div className="fluent-ribbon-buttons">
                {group.controls.map((control) => (
                  <button
                    className={
                      'fluent-ribbon-tool' +
                      (control.id === activeControlId ? ' active' : '')
                    }
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
          ))}
        </div>
      </header>

      <div
        className={
          'fluent-solver-main-grid' +
          (showGuide ? '' : ' fluent-guide-closed')
        }
      >
        <OutlinePane
          sections={layout.treeSections}
          activePanelId={panel.id}
          activeControlId={activeControlId}
          filterText={filterText}
          expandedSections={expandedSections}
          expandedNodeIds={expandedTreeNodes}
          outlineFilterControl={layout.outlineFilterControl}
          simState={simState}
          label={label}
          matchesControl={matchesControl}
          onFilterTextChange={setFilterText}
          onInspectFilter={() => inspect(layout.outlineFilterControl)}
          onExpandAll={() => {
            setExpandedSections(layout.treeSections.map((section) => section.id))
            setExpandedTreeNodes(expandableTreeNodes)
          }}
          onCollapseAll={() => {
            setFilterText('')
            setExpandedSections([])
            setExpandedTreeNodes([])
          }}
          onToggleSection={toggleSection}
          onToggleNode={toggleTreeNode}
          onActivateNode={(control) => activate(control)}
          onSubNodeClick={(targetControlId, boundary) => {
            if (boundary !== undefined) {
              dispatch({ type: 'SET_HIGHLIGHTED_BOUNDARY', boundary })
            }
            const target = controlById.get(targetControlId)
            if (target) {
              inspect(target)
              const ownerPanel = layout.taskPanels.find((item) =>
                item.groups.some((group) => group.controls.includes(target)),
              )
              if (ownerPanel) setPanelId(ownerPanel.id)
            }
          }}
          onSubNodeDoubleClick={(targetControlId, boundary) => {
            if (boundary !== undefined) {
              dispatch({ type: 'SET_HIGHLIGHTED_BOUNDARY', boundary })
            }
            const target = controlById.get(targetControlId)
            if (target) activate(target)
          }}
          onDisplayMesh={() => dispatch({ type: 'DISPLAY_MESH' })}
        />

        <section className="fluent-task-pane" aria-label={label('Task Page')}>
          <div className="fluent-pane-title">{label('Task Page')}</div>
          <div className="fluent-task-scroll">
            <h2>{label(panel.title)}</h2>
            {panel.groups.map((group) => (
              <fieldset className="fluent-task-group" key={group.id}>
                {group.title !== panel.title && (
                  <legend>{label(group.title)}</legend>
                )}
                <div className="fluent-controls-stack">
                  {group.controls.map((control) => (
                    <ControlRenderer
                      key={control.id}
                      control={control}
                      active={control.id === activeControlId}
                      simState={simState}
                      label={label}
                      onInspect={inspect}
                      onButtonActivate={(ctrl) => activate(ctrl)}
                      onValueChange={handleControlValueChange}
                    />
                  ))}

                  {panel.id === 'run-calculation-panel' &&
                    group.id === 'run-parameters-group' &&
                    simState.timeFormulation === 'transient' && (
                      <>
                        <div className="fluent-field-row">
                          <label htmlFor="fl-transient-dt">
                            {label('Time Step Size')}
                          </label>
                          <input
                            id="fl-transient-dt"
                            type="text"
                            aria-label={label('Time Step Size')}
                            value={simState.runCalculation.timeStepSize}
                            onChange={(event) =>
                              dispatch({
                                type: 'SET_CONTROL_VALUE',
                                controlId: 'run-calculation-time-step',
                                value: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="fluent-field-row">
                          <label htmlFor="fl-transient-steps">
                            {label('Number of Time Steps')}
                          </label>
                          <input
                            id="fl-transient-steps"
                            type="text"
                            aria-label={label('Number of Time Steps')}
                            value={simState.runCalculation.numberOfTimeSteps}
                            onChange={(event) =>
                              dispatch({
                                type: 'SET_CONTROL_VALUE',
                                controlId: 'run-transient-steps',
                                value: event.target.value,
                              })
                            }
                          />
                        </div>
                      </>
                    )}

                  {panel.id === 'solution-methods-panel' &&
                    group.id === 'methods-options-group' && (
                    <>
                      {simState.energyEnabled && (
                        <div className="fluent-inline-note">
                          Energy 方程已激活：可直接在上方核对二阶迎风能量离散格式。
                        </div>
                      )}
                      {simState.timeFormulation === 'transient' && (
                        <div className="fluent-inline-note">
                          Transient Formulation：{simState.methods.transientFormulation}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <div className="fluent-graphics-stack">
          <FluentViewport
            activeControlId={activeControlId}
            label={label}
            simState={simState}
            onInspect={(control) => inspect(control)}
            onSelectTab={(tab) => dispatch({ type: 'SET_VIEWPORT_TAB', tab })}
            onSelectFilter={(value) =>
              dispatch({
                type: 'SET_CONTROL_VALUE',
                controlId: 'graphics-selection-filter',
                value,
              })
            }
          />
          <ConsolePane
            activeControlId={activeControlId}
            consoleControl={layout.consoleControl}
            logs={simState.consoleLogs}
            label={label}
            onInspect={(control) => inspect(control)}
            onClear={() => dispatch({ type: 'CLEAR_CONSOLE' })}
            onRunCommand={(cmd) => dispatch(parseAndExecuteTui(cmd, simState))}
          />
        </div>

        <ExplanationPane
          activeControl={activeControl}
          activeOptionValue={activeOptionValue}
          explanation={explanation}
          controlById={controlById}
          label={label}
          visible={showGuide}
          onLocate={activate}
          onLocateById={locateById}
        />

        <DialogStack
          dialogs={dialogs}
          dialogCatalog={layout.dialogs}
          activeControlId={activeControlId}
          simState={simState}
          label={label}
          onInspect={inspect}
          onButtonActivate={(control) => activate(control)}
          onValueChange={handleControlValueChange}
          onApplyDialog={(dialogTitle) =>
            dispatch({ type: 'APPLY_DIALOG', dialogTitle })
          }
          onOkDialog={(dialogTitle) => {
            dispatch({ type: 'APPLY_DIALOG', dialogTitle })
            closeTopDialog()
          }}
          onCloseTopDialog={closeTopDialog}
          onMoveDialog={(index, x, y) =>
            setDialogs((items) =>
              items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, x, y } : item,
              ),
            )
          }
          onFocusDialog={(index) =>
            setDialogs((items) => {
              if (index < 0 || index >= items.length - 1) return items
              const target = items[index]
              return [...items.filter((_, idx) => idx !== index), target]
            })
          }
          onQuickOpenEnergy={() => {
            const energyCtrl = controlById.get('models-energy')
            if (energyCtrl) activate(energyCtrl)
          }}
        />
      </div>

      <footer className="fluent-statusbar">
        <span>
          Solver: {simState.solverType} ({simState.timeFormulation})
        </span>
        <span>Viscous: {formatViscousBadge(simState.viscousModel)}</span>
        <span>Energy: {simState.energyEnabled ? 'On' : 'Off'}</span>
        <span>
          Mesh: {simState.meshInfo.cellCount.toLocaleString()} cells ({simState.meshInfo.meshType})
        </span>
        <span>
          Status:{' '}
          {simState.runCalculation.hasCalculated
            ? `Converged (${simState.runCalculation.completedIterations} iter)`
            : simState.initialization.isInitialized
              ? 'Initialized'
              : 'Not Initialized'}
        </span>
        <Link className="fluent-status-link" to="/fluent-meshing">
          {label('Switch to Meshing')} →
        </Link>
      </footer>
    </section>
  )
}

function matchesControl(control: FluentMockControl, query: string) {
  return [
    control.label,
    control.module,
    labelIn('en', control.label),
    labelIn('zh', control.label),
  ].some((name) => name.toLowerCase().includes(query))
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
        .sort(
          (a, b) =>
            Number(b.names.includes(normalized)) -
            Number(a.names.includes(normalized)),
        )
        .slice(0, 8)
    : []

  function locate(control: FluentMockControl) {
    setQuery('')
    setOpen(false)
    onLocate(control, true)
  }

  return (
    <form
      className="fluent-quick-search"
      role="search"
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
      }}
    >
      <label>
        <FluentIcon name="search" />
        <input
          aria-label={label('Quick Search')}
          data-fluent-control={layout.quickSearchControl.id}
          placeholder={label('Quick Search')}
          type="search"
          value={query}
          onFocus={() => {
            setOpen(true)
            onInspect()
          }}
          onChange={(event) => {
            setOpen(true)
            setQuery(event.target.value)
          }}
        />
      </label>
      {open && normalized && (
        <div className="fluent-search-results">
          {matches.length === 0 && (
            <p role="status">{label('No matching controls')}</p>
          )}
          {matches.map(({ control, location }) => (
            <button
              type="button"
              key={control.id}
              aria-label={label(control.label)}
              aria-describedby={'search-location-' + control.id}
              onClick={() => locate(control)}
            >
              <span>{label(control.label)}</span>
              <small id={'search-location-' + control.id}>{label(location)}</small>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
