import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileFullscreenButton } from '../../components/MobileFullscreenButton'
import { FluentIcon } from '../FluentIcons'
import { ConsolePane } from '../components/ConsolePane'
import { FluentOperationDetails } from '../components/FluentOperationDetails'
import { FluentTeachingDiagram } from '../components/FluentTeachingDiagram'
import { getMeshingTeachingDiagram } from '../data/fluentTeachingDiagrams'
import { MobileWorkbenchPanes, type MobileWorkbenchPane } from '../components/MobileWorkbenchPanes'
import { labelIn, type FluentLabel, type FluentLanguage } from '../fluentLanguage'
import type { FluentMockControl } from '../fluentTypes'
import {
  MESHING_LOCATE_EVENT,
  OPEN_GLOBAL_SEARCH_EVENT,
  type GlobalSearchAction,
} from '../../search/globalSearchIndex'
import {
  parseLauncherParams,
  readLauncherPreferences,
  saveMeshingHandoff,
} from '../state/fluentWorkbenchBridge'
import '../styles/fluentWorkspace.css'
import { FaultTolerantTaskBody } from './FaultTolerantTaskBody'
import { MeshingDialogs } from './MeshingDialogs'
import { MeshingViewport } from './MeshingViewport'
import type { MeshingDialogId } from './meshingTypes'
import { meshingOperationGuides } from './meshingOperationGuides'
import { MultizoneTaskBody } from './MultizoneTaskBody'
import { WatertightCappingTask } from './WatertightCappingTask'
import {
  faultTolerantWorkflowSteps,
  meshingControlCatalog,
  meshingRibbonTabs,
  taskForMode,
  watertightWorkflowSteps,
} from './meshingData'
import {
  meshingExplanations,
  meshingOptionExplanations,
  meshingTroubleshootingCases,
} from './meshingExplanations'
import {
  availableMeshingSteps,
  buildMeshingToSolutionHandoff,
  createMeshingSessions,
  meshingSessionsReducer,
  surfaceSizingOptions,
  meshingTuiPresetCommands,
  parseAndExecuteMeshingTui,
  type FluentMeshingAction,
  type FluentMeshingState,
} from './meshingState'
import type {
  MeshingRibbonCommand,
  MeshingTaskId,
  MeshingTaskStatus,
} from './meshingTypes'

const meshingConsoleControl: FluentMockControl = {
  id: 'meshing-console-area',
  label: 'Console',
  labelZh: '控制台',
  region: '底部控制台',
  module: 'Meshing',
  group: 'Console',
  controlType: 'console',
  explanationId: 'meshing-volume-mesh',
  enabled: true,
}

export default function FluentMeshingWorkbench() {
  const root = useRef<HTMLElement>(null)
  const tuiInitRef = useRef<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const initialLauncher = useMemo(
    () => parseLauncherParams(location.search),
    [location.search],
  )
  const initialPrefs = useMemo(
    () =>
      Object.keys(initialLauncher).length > 0
        ? readLauncherPreferences()
        : undefined,
    [initialLauncher],
  )
  const initialParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  )
  const initialTaskParam = initialParams.get('task')
  const validInitialTask =
    initialTaskParam &&
    (watertightWorkflowSteps.some((s) => s.id === initialTaskParam) ||
      faultTolerantWorkflowSteps.some((s) => s.id === initialTaskParam))
      ? (initialTaskParam as MeshingTaskId)
      : undefined
  const initialCatalogHit = initialTaskParam
    ? meshingControlCatalog.find(
        (c) => c.id === initialTaskParam || c.taskId === initialTaskParam,
      )
    : undefined

  const [workbench, dispatch] = useReducer(
    meshingSessionsReducer,
    { launcher: initialLauncher, prefs: initialPrefs, initialTask: validInitialTask },
    ({ launcher, prefs, initialTask }) => {
      const base = createMeshingSessions(launcher, prefs)
      return initialTask
        ? meshingSessionsReducer(base, { type: 'SELECT_TASK', taskId: initialTask })
        : base
    },
  )
  const state = workbench.sessions[workbench.active]
  const isFaultTolerant = state.workflowMode === 'fault-tolerant'
  const steps = availableMeshingSteps(state)
  const [language, setLanguage] = useState<FluentLanguage>(
    () => initialPrefs?.language ?? 'en',
  )
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>(
    () => initialPrefs?.theme ?? 'light',
  )
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false)
  const [activeDialog, setActiveDialog] = useState<MeshingDialogId | null>(null)
  const [ribbonId, setRibbonId] = useState(
    () => initialCatalogHit?.ribbonTabId ?? 'm-tab-workflow',
  )
  const [leftTab, setLeftTab] = useState<'workflow' | 'outline'>('workflow')
  const [outlineExpanded, setOutlineExpanded] = useState<string[]>([
    'geom',
    'mesh',
    'zones',
    'regions',
    'sizing',
  ])
  const [showGuide, setShowGuide] = useState(true)
  const [mobilePane, setMobilePane] = useState<MobileWorkbenchPane>('outline')
  const [inspectorTab, setInspectorTab] = useState<'guide' | 'troubleshoot'>(() =>
    initialParams.get('panel') === 'troubleshoot' ? 'troubleshoot' : 'guide',
  )
  const [troubleshootQuery, setTroubleshootQuery] = useState('')
  const [activeExplanationId, setActiveExplanationId] = useState(
    () => initialCatalogHit?.explanationId ?? 'meshing-import-geometry',
  )
  const [activeOptionKey, setActiveOptionKey] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchActiveIndex, setSearchActiveIndex] = useState(0)

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })

  useEffect(() => {
    const tuiParam = new URLSearchParams(location.search).get('tui')
    if (tuiParam && tuiInitRef.current !== location.search) {
      tuiInitRef.current = location.search
      dispatch(parseAndExecuteMeshingTui(tuiParam, stateRef.current))
    }
  }, [location.search])

  useEffect(() => {
    function handleMeshingLocate(event: Event) {
      const detail = (event as CustomEvent<GlobalSearchAction>).detail
      if (!detail) return
      if (detail.kind === 'meshing-task') {
        const hit = meshingControlCatalog.find(
          (c) => c.id === detail.value || c.taskId === detail.value,
        )
        const targetTask = (hit?.taskId ?? detail.value) as MeshingTaskId
        if (
          watertightWorkflowSteps.some((s) => s.id === targetTask) ||
          faultTolerantWorkflowSteps.some((s) => s.id === targetTask)
        ) {
          dispatch({ type: 'SELECT_TASK', taskId: targetTask })
          setMobilePane('task')
        }
        if (hit?.explanationId) setActiveExplanationId(hit.explanationId)
        if (hit?.ribbonTabId) setRibbonId(hit.ribbonTabId)
        setInspectorTab('guide')
      } else if (detail.kind === 'meshing-troubleshoot') {
        setShowGuide(true)
        setInspectorTab('troubleshoot')
        setMobilePane('guide')
      } else if (detail.kind === 'meshing-tui') {
        dispatch(parseAndExecuteMeshingTui(detail.value, stateRef.current))
      }
    }
    window.addEventListener(MESHING_LOCATE_EVENT, handleMeshingLocate)
    return () => {
      window.removeEventListener(MESHING_LOCATE_EVENT, handleMeshingLocate)
    }
  }, [])

  const label: FluentLabel = (term) => labelIn(language, term)
  const ribbon =
    meshingRibbonTabs.find((t) => t.id === ribbonId) ?? meshingRibbonTabs[1]
  const explanation =
    meshingExplanations[activeExplanationId] ??
    meshingExplanations['meshing-import-geometry']
  const optionNote =
    activeOptionKey && meshingOptionExplanations[activeOptionKey]
      ? meshingOptionExplanations[activeOptionKey]
      : null

  type MeshingSearchHit =
    | {
        kind: 'catalog'
        id: string
        label: string
        location: string
        explanationId: string
        taskId?: MeshingTaskId
        ribbonTabId?: string
        tokensText: string
      }
    | {
        kind: 'troubleshoot'
        id: string
        label: string
        location: string
        tokensText: string
      }
    | {
        kind: 'tui'
        id: string
        label: string
        location: string
        command: string
        tokensText: string
      }

  const meshingSearchCatalog = useMemo<MeshingSearchHit[]>(() => [
    ...meshingControlCatalog.map((item): MeshingSearchHit => {
      const expl = meshingExplanations[item.explanationId]
      return {
        kind: 'catalog',
        id: item.id,
        label: item.label,
        location: item.location,
        explanationId: item.explanationId,
        taskId: item.taskId,
        ribbonTabId: item.ribbonTabId,
        tokensText: [
          item.label,
          item.labelZh,
          labelIn('en', item.label),
          labelIn('zh', item.label),
          item.location,
          expl?.title ?? '',
          expl?.whatItIs ?? '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }
    }),
    ...meshingTroubleshootingCases.map((item): MeshingSearchHit => ({
      kind: 'troubleshoot',
      id: `m-trouble:${item.id}`,
      label: item.symptom,
      location: 'Meshing 报错排查',
      tokensText: [item.symptom, ...item.likelyCauses, ...item.fixes]
        .join(' ')
        .toLowerCase(),
    })),
    ...meshingTuiPresetCommands.map((cmd): MeshingSearchHit => ({
      kind: 'tui',
      id: `m-tui:${cmd}`,
      label: cmd,
      location: 'Meshing Console TUI',
      command: cmd,
      tokensText: `${cmd} meshing tui console 命令`.toLowerCase(),
    })),
  ], [])

  const searchTokens = searchQuery
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const searchMatches = searchTokens.length
    ? meshingSearchCatalog
        .filter((item) =>
          searchTokens.every((t) => item.tokensText.includes(t)),
        )
        .slice(0, 10)
    : []
  const clampedSearchIndex =
    searchMatches.length > 0
      ? Math.min(searchActiveIndex, searchMatches.length - 1)
      : 0

  function selectSearchHit(hit: MeshingSearchHit) {
    if (hit.kind === 'catalog') {
      setActiveExplanationId(hit.explanationId)
      setInspectorTab('guide')
      if (hit.taskId) {
        dispatch({ type: 'SELECT_TASK', taskId: hit.taskId })
        setMobilePane('task')
      }
      if (hit.ribbonTabId) setRibbonId(hit.ribbonTabId)
    } else if (hit.kind === 'troubleshoot') {
      setShowGuide(true)
      setInspectorTab('troubleshoot')
      setMobilePane('guide')
    } else {
      dispatch(parseAndExecuteMeshingTui(hit.command, state))
    }
    setSearchQuery('')
    setSearchOpen(false)
    setSearchActiveIndex(0)
  }

  function getTaskStatus(taskId: MeshingTaskId): MeshingTaskStatus {
    if (state.skippedTasks.includes(taskId)) return 'skipped'
    if (state.completedTasks.includes(taskId)) return 'completed'
    if (state.activeTaskId === taskId) return 'active'
    return 'pending'
  }

  function focusTask(taskId: MeshingTaskId, optionKey?: string) {
    dispatch({ type: 'SELECT_TASK', taskId })
    setMobilePane('task')
    const view = taskId.startsWith('ft-') ? faultTolerantWorkflowSteps : steps
    const step = view.find((s) => s.id === taskForMode(taskId, view === faultTolerantWorkflowSteps))
    if (step) {
      setActiveExplanationId(step.explanationId)
    }
    setActiveOptionKey(optionKey ?? null)
    setInspectorTab('guide')
  }

  function handleSwitchToSolution() {
    if (!state.volumeMesh.generated) {
      focusTask('wm-volume-mesh')
      dispatch({
        type: 'APPEND_CONSOLE',
        entries: [{ kind: 'warning', text: 'Generate the Volume Mesh before switching to Solution.' }],
      })
      return
    }
    const handoff = buildMeshingToSolutionHandoff(state)
    saveMeshingHandoff(handoff)
    navigate(
      `/fluent-guide?dim=${state.dimension}&dp=${state.doublePrecision ? '1' : '0'}&np=${state.processes}`,
    )
  }

  function executeRibbonCommand(cmd: MeshingRibbonCommand) {
    setActiveExplanationId(cmd.explanationId)
    setActiveOptionKey(null)
    if (cmd.targetTaskId) {
      dispatch({ type: 'SELECT_TASK', taskId: cmd.targetTaskId })
      setMobilePane('task')
    }
    if (cmd.viewportTab) {
      dispatch({ type: 'SET_VIEWPORT_TAB', tab: cmd.viewportTab })
    }
    if (cmd.dialogId) {
      setActiveDialog(cmd.dialogId)
    }
    switch (cmd.actionId) {
      case 'reset-workflow':
        dispatch({ type: 'RESET_WORKFLOW' })
        break
      case 'run-surface-mesh':
        dispatch({ type: 'RUN_SURFACE_MESH' })
        break
      case 'run-volume-mesh':
        dispatch({ type: 'RUN_VOLUME_MESH' })
        break
      case 'run-improve-mesh':
        dispatch({ type: 'RUN_IMPROVE_VOLUME_MESH' })
        break
      case 'toggle-cut-plane':
        dispatch({ type: 'TOGGLE_CUT_PLANE' })
        break
      case 'switch-to-solution':
        handleSwitchToSolution()
        break
      case 'open-troubleshoot':
        setShowGuide(true)
        setMobilePane('guide')
        setInspectorTab('troubleshoot')
        break
      case 'open-calculators':
        navigate('/calculators')
        break
      case 'open-formulas':
        navigate('/formulas')
        break
      default:
        break
    }
  }

  function toggleOutlineBranch(id: string) {
    setOutlineExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const activeStep =
    steps.find((s) => s.id === state.activeTaskId) ?? steps[0]

  return (
    <section
      ref={root}
      className="fluent-workbench"
      data-theme={uiTheme}
      aria-labelledby="fluent-meshing-title"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          if (showDisclaimerModal) {
            event.preventDefault()
            setShowDisclaimerModal(false)
          } else if (activeDialog) {
            event.preventDefault()
            setActiveDialog(null)
          }
        }
      }}
    >
      <header className="fluent-topbar">
        <div className="fluent-topbar-brand">
          <Link to="/">CFD Assistant</Link>
          <nav aria-label="站内导航" lang="zh-CN">
            <Link to="/">功能首页</Link>
            <Link to="/fluent-launcher">Fluent Launcher</Link>
            <Link to="/calculators">参数计算</Link>
            <Link to="/formulas">CFD 公式库</Link>
            <Link to="/knowledge">热流体工程图解</Link>
          </nav>
          <div className="fluent-mode-switcher" role="group" aria-label="Fluent 模式切换">
            <span className="fluent-mode-pill active">Meshing</span>
            <button
              type="button"
              className="fluent-mode-pill"
              onClick={handleSwitchToSolution}
            >
              Solution
            </button>
          </div>
        </div>

        <div className="fluent-topbar-actions" lang="zh-CN">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new CustomEvent(OPEN_GLOBAL_SEARCH_EVENT))
            }
          >
            全站搜索
          </button>
          <button
            type="button"
            className="fluent-teaching-pill"
            onClick={() => setShowDisclaimerModal(true)}
          >
            教学复刻声明
          </button>
          <button
            type="button"
            aria-pressed={uiTheme === 'dark'}
            onClick={() => setUiTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {uiTheme === 'dark' ? '浅色主题' : '暗色主题'}
          </button>
          <button
            type="button"
            className="fluent-switch-cta"
            onClick={handleSwitchToSolution}
          >
            <FluentIcon name="switchMode" /> {label('Switch to Solution')}
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: 'RESET_WORKFLOW' })}
          >
            {label('Reset Workflow')}
          </button>
          <button
            type="button"
            aria-controls="fluent-meshing-guide-panel"
            aria-expanded={showGuide}
            onClick={() => setShowGuide((v) => !v)}
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
        <MobileFullscreenButton />
      </header>

      <div className="fluent-titlebar">
        <div className="fluent-titlebar-left">
          <h1 id="fluent-meshing-title">
            {label('Fluent Meshing Workbench')} [{state.dimension},{' '}
            {state.doublePrecision ? 'dp' : 'sp'}, meshing]
          </h1>
          <p>
            {label('Teaching preview')} <span aria-hidden="true">/</span>{' '}
            {label(isFaultTolerant ? 'Fault-Tolerant Meshing' : 'Watertight Geometry')} · np={state.processes}
          </p>
        </div>

        <form
          className="fluent-quick-search"
          role="search"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setSearchOpen(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && searchOpen && searchTokens.length) {
              event.stopPropagation()
              setSearchOpen(false)
              return
            }
            if (event.key === 'ArrowDown' && searchOpen && searchMatches.length > 0) {
              event.preventDefault()
              setSearchActiveIndex((prev) => (prev + 1) % searchMatches.length)
              return
            }
            if (event.key === 'ArrowUp' && searchOpen && searchMatches.length > 0) {
              event.preventDefault()
              setSearchActiveIndex(
                (prev) => (prev - 1 + searchMatches.length) % searchMatches.length,
              )
            }
          }}
          onSubmit={(event) => {
            event.preventDefault()
            if (searchOpen && searchMatches[clampedSearchIndex]) {
              selectSearchHit(searchMatches[clampedSearchIndex])
            }
          }}
        >
          <label>
            <FluentIcon name="search" />
            <input
              aria-label={label('Quick Search')}
              placeholder={label('Quick Search')}
              type="search"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchOpen(true)
                setSearchQuery(event.target.value)
                setSearchActiveIndex(0)
              }}
            />
          </label>
          {searchOpen && searchTokens.length > 0 && (
            <div className="fluent-search-results">
              {searchMatches.length === 0 && (
                <p role="status">{label('No matching controls')}</p>
              )}
              {searchMatches.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  aria-selected={idx === clampedSearchIndex}
                  className={idx === clampedSearchIndex ? 'active-hit' : undefined}
                  onClick={() => selectSearchHit(item)}
                >
                  <span>
                    {item.kind !== 'catalog' && (
                      <em className="fluent-search-hit-badge">
                        {item.kind === 'tui' ? 'TUI' : '排查'}
                      </em>
                    )}
                    {item.kind === 'catalog' ? label(item.label) : item.label}
                  </span>
                  <small>{item.location}</small>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      <div style={{ display: 'none' }} aria-hidden="true" />

      <header className="fluent-ribbon">
        <nav className="fluent-ribbon-tabs" aria-label={label('Command tabs')}>
          {meshingRibbonTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === 'm-tab-file' ? 'fluent-file-tab' : ''}
              aria-pressed={tab.id === ribbonId}
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
                {group.commands.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    className={
                      'fluent-ribbon-tool' +
                      (cmd.targetTaskId && taskForMode(cmd.targetTaskId, isFaultTolerant) === state.activeTaskId ? ' active' : '')
                    }
                    onClick={() => executeRibbonCommand(cmd)}
                  >
                    <FluentIcon controlId={cmd.id} />
                    <span>{label(cmd.label)}</span>
                  </button>
                ))}
              </div>
              <span className="fluent-ribbon-group-label">
                {label(group.label)}
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
        data-mobile-pane={mobilePane}
      >
        <MobileWorkbenchPanes active={mobilePane} onSelect={(pane) => {
          setMobilePane(pane)
          if (pane === 'guide') setShowGuide(true)
        }} />
        {/* Left Pane: Workflow / Outline View */}
        <aside className="fluent-outline-pane" aria-label={label('Workflow')}>
          <div className="fluent-pane-title">
            <div className="fluent-left-mode-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'workflow'}
                className={leftTab === 'workflow' ? 'active' : ''}
                onClick={() => setLeftTab('workflow')}
              >
                {label('Workflow')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={leftTab === 'outline'}
                className={leftTab === 'outline' ? 'active' : ''}
                onClick={() => setLeftTab('outline')}
              >
                {label('Outline View')}
              </button>
            </div>
          </div>

          {leftTab === 'workflow' ? (
            <div className="fluent-tree-scroll" style={{ paddingTop: 6 }}>
              <div className="fluent-workflow-mode-select">
                <label htmlFor="meshing-wf-mode">Workflow Template</label>
                <select
                  id="meshing-wf-mode"
                  value={state.workflowMode}
                  onChange={(event) => {
                    const mode = event.target.value as FluentMeshingState['workflowMode']
                    dispatch({ type: 'SET_WORKFLOW_MODE', mode })
                    setActiveExplanationId(
                      mode === 'fault-tolerant'
                        ? 'meshing-ft-overview'
                        : 'meshing-import-geometry',
                    )
                  }}
                >
                  <option value="watertight">{label('Watertight Geometry')}</option>
                  <option value="fault-tolerant">{label('Fault-Tolerant Meshing')}</option>
                </select>
              </div>

                <ul className="fluent-wf-list">
                  {steps.map((step) => {
                    const status = getTaskStatus(step.id)
                    const active = state.activeTaskId === step.id
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          className={
                            'fluent-wf-item' +
                            (active ? ' active' : '') +
                            (status === 'completed' ? ' completed' : '') +
                            (status === 'skipped' ? ' skipped' : '')
                          }
                          aria-current={active ? 'step' : undefined}
                          onClick={() => focusTask(step.id)}
                        >
                          <span className={`fluent-wf-status ${status}`} aria-hidden="true">
                            {status === 'completed'
                              ? '✓'
                              : status === 'skipped'
                                ? '—'
                                : status === 'active'
                                  ? '●'
                                  : '○'}
                          </span>
                          <span className="fluent-wf-label">
                            {step.order}. {label(step.label)}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
            </div>
          ) : (
            <div className="fluent-tree-scroll" style={{ paddingTop: 6 }}>
              {[
                {
                  id: 'geom',
                  title: 'Geometry Objects',
                  items: [
                    {
                      name: state.importGeometry.fileName,
                      badge: state.importGeometry.imported ? 'Loaded' : 'Ready',
                      zone: null,
                      taskId: 'wm-import-geometry' as MeshingTaskId,
                    },
                  ],
                },
                {
                  id: 'mesh',
                  title: 'Mesh Objects',
                  items: [
                    {
                      name: 'elbow-fluid-mesh',
                      badge: state.volumeMesh.generated
                        ? `${state.volumeMesh.cellCount.toLocaleString()} cells`
                        : state.surfaceMesh.generated
                          ? `${state.surfaceMesh.faceCount.toLocaleString()} faces`
                          : 'Pending',
                      zone: null,
                      taskId: 'wm-volume-mesh' as MeshingTaskId,
                    },
                  ],
                },
                {
                  id: 'zones',
                  title: 'Boundary Zones',
                  items: state.boundaries.map((b) => ({
                    name: b.name,
                    badge: b.type,
                    zone: b.boundary,
                    taskId: 'wm-update-boundaries' as MeshingTaskId,
                  })),
                },
                {
                  id: 'regions',
                  title: 'Cell Zones / Regions',
                  items: state.regions.map((r) => ({
                    name: r.name,
                    badge: r.type,
                    zone: null,
                    taskId: 'wm-update-regions' as MeshingTaskId,
                  })),
                },
                {
                  id: 'sizing',
                  title: 'Size Controls',
                  items: state.localSizings.map((s) => ({
                    name: s.name,
                    badge: s.targetSize,
                    zone: null,
                    taskId: 'wm-local-sizing' as MeshingTaskId,
                  })),
                },
              ].map((branch) => {
                const open = outlineExpanded.includes(branch.id)
                return (
                  <div className="fluent-tree-section" key={branch.id}>
                    <button
                      type="button"
                      className="fluent-tree-section-toggle"
                      aria-expanded={open}
                      onClick={() => toggleOutlineBranch(branch.id)}
                    >
                      <FluentIcon name="chevron" /> {branch.title}
                    </button>
                    {open && (
                      <div className="fluent-tree-children">
                        {branch.items.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            className="fluent-tree-subnode"
                            onClick={() => {
                              dispatch({
                                type: 'SET_HIGHLIGHTED_ZONE',
                                zone: item.zone,
                              })
                              focusTask(item.taskId)
                            }}
                          >
                            <span>{item.name}</span>
                            <span className="fluent-tree-badge">{item.badge}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </aside>

        {/* Center-Left Pane: Meshing Task Page */}
        <section className="fluent-task-pane" aria-label={label('Task Page')}>
          <div className="fluent-pane-title">{label('Task Page')}</div>
          <div className="fluent-task-scroll">
            <h2>
              {activeStep.order}. {label(activeStep.label)}
            </h2>
            {activeStep.id.startsWith('ft-') ? (
              <FaultTolerantTaskBody state={state} dispatch={dispatch} />
            ) : <MeshingTaskBody
              state={state}
              dispatch={dispatch}
              onInspect={(explanationId, optionKey) => {
                setActiveExplanationId(explanationId)
                setActiveOptionKey(optionKey ?? null)
                setInspectorTab('guide')
              }}
              onSwitchToSolution={handleSwitchToSolution}
            />}
          </div>
        </section>

        {/* Center-Right: Meshing Viewport + Console */}
        <div className="fluent-graphics-stack">
          <MeshingViewport
            label={label}
            state={state}
            onSelectTab={(tab) => dispatch({ type: 'SET_VIEWPORT_TAB', tab })}
            onToggleCutPlane={() => dispatch({ type: 'TOGGLE_CUT_PLANE' })}
            onSetCutPlanePosition={(position) =>
              dispatch({ type: 'SET_CUT_PLANE_POSITION', position })
            }
            onSelectFilter={(filter) =>
              dispatch({ type: 'SET_SELECTION_FILTER', filter })
            }
            onInspectControlId={(id) => {
              const meta = meshingControlCatalog.find((c) => c.id === id)
              if (meta) setActiveExplanationId(meta.explanationId)
            }}
          />
          <ConsolePane
            activeControlId=""
            consoleControl={meshingConsoleControl}
            logs={state.consoleLogs}
            label={label}
            presetCommands={meshingTuiPresetCommands}
            onInspect={() => setActiveExplanationId('meshing-volume-mesh')}
            onClear={() => dispatch({ type: 'CLEAR_CONSOLE' })}
            onRunCommand={(cmd) =>
              dispatch(parseAndExecuteMeshingTui(cmd, state))
            }
          />
        </div>

        {/* Right Pane: Teaching Inspector */}
        <aside
          className="fluent-explanation-pane"
          id="fluent-meshing-guide-panel"
          aria-label="控件说明"
          lang="zh-CN"
          hidden={!showGuide}
        >
          <div className="fluent-pane-title">
            <span>
              <FluentIcon name="guide" /> Meshing 教学说明
            </span>
            <div className="fluent-inspector-tabs">
              <button
                type="button"
                className={inspectorTab === 'guide' ? 'active' : ''}
                onClick={() => setInspectorTab('guide')}
              >
                {label('Control Guide')}
              </button>
              <button
                type="button"
                className={inspectorTab === 'troubleshoot' ? 'active' : ''}
                onClick={() => setInspectorTab('troubleshoot')}
              >
                {label('Troubleshooting')}
              </button>
            </div>
          </div>

          {inspectorTab === 'guide' ? (
            <div className="fluent-explanation-scroll" key={explanation.id}>
              <p className="fluent-explanation-location">{explanation.location}</p>
              <h2>{explanation.title}</h2>

              {(() => {
                const meshingDiagram = getMeshingTeachingDiagram(explanation.id, state)
                return meshingDiagram ? <FluentTeachingDiagram spec={meshingDiagram} /> : null
              })()}

              {optionNote && (
                <div className="fluent-option-highlight">
                  <strong>当前选项要点：{activeOptionKey}</strong>
                  <p>{optionNote}</p>
                </div>
              )}

              <section>
                <h3>是什么</h3>
                <p>{explanation.whatItIs}</p>
              </section>
              <section>
                <h3>什么时候用</h3>
                <p>{explanation.whenToUse}</p>
              </section>
              {meshingOperationGuides[explanation.id] && (
                <FluentOperationDetails guide={meshingOperationGuides[explanation.id]} />
              )}
              <section>
                <h3>设置建议</h3>
                <p>{explanation.recommendation}</p>
              </section>
              <section>
                <h3>检查要点</h3>
                <ul>
                  {explanation.checkItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
              <section className="fluent-mistake-card">
                <h3>常见误区</h3>
                <p>{explanation.commonMistakes}</p>
              </section>

              <footer className="fluent-source-footer">
                {meshingOperationGuides[explanation.id]?.sourceUrl ? (
                  <p>
                    参考依据：
                    <a
                      href={meshingOperationGuides[explanation.id].sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ansys Fluent 2024 R2 文档
                    </a>
                  </p>
                ) : (
                  <p>说明来源：CFD 教学原理与工程实践整理（具体网格策略请结合算例与官方文档核对）</p>
                )}
              </footer>

              {explanation.relatedControls.length > 0 && (
                <section>
                  <h3>相关任务</h3>
                  <div className="fluent-related-list">
                    {explanation.relatedControls.map((id) => {
                      const step = [...watertightWorkflowSteps, ...faultTolerantWorkflowSteps].find(
                        (s) => s.id === id,
                      )
                      if (!step) return null
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => focusTask(step.id)}
                        >
                          {label(step.label)} <FluentIcon name="chevron" />
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {explanation.relatedCalculators &&
                explanation.relatedCalculators.length > 0 && (
                  <section>
                    <h3>关联 CFD 计算器</h3>
                    <div className="fluent-calc-links">
                      {explanation.relatedCalculators.map((calc) => (
                        <Link
                          className="fluent-calc-link"
                          key={calc.to}
                          to={calc.to}
                        >
                          <strong>{calc.label} →</strong>
                          <small>{calc.note}</small>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
            </div>
          ) : (
            <div className="fluent-explanation-scroll">
              <h2>Fluent Meshing 常见网格故障排查</h2>
              <p className="fluent-explanation-location">
                点击下方按钮可直接跳转到对应工作流步骤
              </p>
              <input
                type="search"
                className="fluent-troubleshoot-filter"
                aria-label="筛选网格报错"
                placeholder="输入关键词筛选报错（如 水密、边界层、正交质量）…"
                value={troubleshootQuery}
                onChange={(event) => setTroubleshootQuery(event.target.value)}
              />
              {meshingTroubleshootingCases
                .filter((item) => {
                  const q = troubleshootQuery.trim().toLowerCase()
                  if (!q) return true
                  return [item.symptom, ...item.likelyCauses, ...item.fixes]
                    .join(' ')
                    .toLowerCase()
                    .includes(q)
                })
                .map((item) => (
                <article className="fluent-troubleshoot-card" key={item.id}>
                  <h3>{item.symptom}</h3>
                  <p>常见原因</p>
                  <ul>
                    {item.likelyCauses.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <p>处理建议</p>
                  <ul>
                    {item.fixes.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  <div className="fluent-related-list" style={{ marginTop: 6 }}>
                    {item.targetControls.map((t) => (
                      <button
                        key={t.controlId}
                        type="button"
                        onClick={() =>
                          focusTask(t.controlId as MeshingTaskId)
                        }
                      >
                        定位 {t.label} <FluentIcon name="chevron" />
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </div>

      <footer className="fluent-statusbar">
        <span>Mode: Fluent Meshing ({state.workflowMode})</span>
        <span>
          Surface Faces:{' '}
          {state.surfaceMesh.generated
            ? state.surfaceMesh.faceCount.toLocaleString()
            : 'Pending'}
        </span>
        <span>
          Volume Cells:{' '}
          {state.volumeMesh.generated
            ? `${state.volumeMesh.cellCount.toLocaleString()} (${state.volumeMesh.fillWith})`
            : 'Pending'}
        </span>
        <span>Min Ortho Quality: {state.volumeMesh.minOrthogonalQuality}</span>
        <span>
          BL: {state.boundaryLayers.enabled ? `${state.boundaryLayers.numberOfLayers} layers` : 'Off'}
        </span>
        <button
          type="button"
          className="fluent-status-link"
          onClick={handleSwitchToSolution}
        >
          Switch to Solution →
        </button>
      </footer>

      {showDisclaimerModal && (
        <div
          className="fluent-disclaimer-modal-backdrop"
          onClick={() => setShowDisclaimerModal(false)}
        >
          <div
            className="fluent-disclaimer-modal"
            role="dialog"
            aria-label="教学复刻声明"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="fluent-dialog-titlebar">
              <strong>教学复刻声明 · 关于本界面</strong>
              <button
                type="button"
                aria-label="关闭教学复刻声明"
                onClick={() => setShowDisclaimerModal(false)}
              >
                ×
              </button>
            </div>
            <div className="fluent-disclaimer-modal-body">
              <p>
                本界面为<strong>个人 CFD 学习专用 Fluent Meshing 教学复刻工作台</strong>，用于练习 Watertight Geometry / Fault-Tolerant Meshing 全流程设置。
              </p>
              <ul>
                <li>无真实几何导入或网格生成引擎，面板数字与直方图均为教学示例；</li>
                <li>不使用任何 Ansys / Fluent 官方商标 Logo 与版权截图资产；</li>
                <li>生成体网格后可一键通过 Switch to Solution 传递至求解器教学台。</li>
              </ul>
            </div>
            <div className="fluent-dialog-actions">
              <button
                type="button"
                className="primary"
                onClick={() => setShowDisclaimerModal(false)}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
      <MeshingDialogs
        activeDialog={activeDialog}
        state={state}
        dispatch={dispatch}
        label={label}
        language={language}
        uiTheme={uiTheme}
        onSetLanguage={setLanguage}
        onSetUiTheme={setUiTheme}
        onClose={() => setActiveDialog(null)}
      />
    </section>
  )
}

function MeshingTaskBody({
  state,
  dispatch,
  onInspect,
  onSwitchToSolution,
}: {
  state: FluentMeshingState
  dispatch: React.Dispatch<FluentMeshingAction>
  onInspect: (explanationId: string, optionKey?: string) => void
  onSwitchToSolution: () => void
}) {
  const isCompleted = state.completedTasks.includes(state.activeTaskId)
  const sizing = surfaceSizingOptions(state.surfaceMesh.sizeFunctions)

  switch (state.activeTaskId) {
    case 'wm-import-geometry':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Geometry Source & Units</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-cad-source">Import From</label>
                <select
                  id="m-cad-source"
                  value={state.importGeometry.sourceType}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPORT_GEOMETRY',
                      patch: {
                        sourceType: e.target.value as FluentMeshingState['importGeometry']['sourceType'],
                      },
                    })
                  }
                >
                  <option value="cad-file">CAD File on Disk</option>
                  <option value="spaceclaim">Ansys SpaceClaim</option>
                  <option value="designmodeler">DesignModeler</option>
                </select>
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-cad-file">File Name</label>
                <input
                  id="m-cad-file"
                  type="text"
                  value={state.importGeometry.fileName}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPORT_GEOMETRY',
                      patch: { fileName: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-cad-unit">Length Unit</label>
                <select
                  id="m-cad-unit"
                  value={state.importGeometry.lengthUnit}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPORT_GEOMETRY',
                      patch: {
                        lengthUnit: e.target.value as 'mm' | 'm' | 'in',
                      },
                    })
                  }
                >
                  <option value="mm">mm</option>
                  <option value="m">m</option>
                  <option value="in">in</option>
                </select>
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-cad-angle">Feature Angle</label>
                <input
                  id="m-cad-angle"
                  type="text"
                  value={state.importGeometry.featureAngle}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPORT_GEOMETRY',
                      patch: { featureAngle: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </fieldset>
          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'RUN_IMPORT_GEOMETRY' })}
            >
              {state.workflowMode === 'fault-tolerant' ? 'Import Geometry and Part Management' : 'Import Geometry'}
            </button>
            {isCompleted && (
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: 'REVERT_TASK', taskId: 'wm-import-geometry' })
                }
              >
                Revert
              </button>
            )}
          </div>
        </div>
      )

    case 'wm-local-sizing':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Create Local Sizing Control</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-ls-name">Name</label>
                <input
                  id="m-ls-name"
                  type="text"
                  value={state.localSizingForm.name}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LOCAL_SIZING_FORM',
                      patch: { name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-ls-type">Sizing Type</label>
                <select
                  id="m-ls-type"
                  value={state.localSizingForm.sizingType}
                  onChange={(e) => {
                    const sizingType = e.target.value as FluentMeshingState['localSizingForm']['sizingType']
                    dispatch({
                      type: 'UPDATE_LOCAL_SIZING_FORM',
                      patch: { sizingType },
                    })
                    onInspect('meshing-local-sizing', sizingType)
                  }}
                >
                  <option value="boi">Body of Influence (BOI)</option>
                  <option value="face">Face Size</option>
                  <option value="edge">Edge Size</option>
                  <option value="curvature">Curvature</option>
                  <option value="proximity">Proximity</option>
                </select>
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-ls-size">Target Mesh Size (mm)</label>
                <input
                  id="m-ls-size"
                  type="text"
                  value={state.localSizingForm.targetSize}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LOCAL_SIZING_FORM',
                      patch: { targetSize: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-ls-growth">Growth Rate</label>
                <input
                  id="m-ls-growth"
                  type="text"
                  value={state.localSizingForm.growthRate}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_LOCAL_SIZING_FORM',
                      patch: { growthRate: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="fluent-task-group">
            <legend>Active Local Sizings ({state.localSizings.length})</legend>
            <div className="fluent-controls-stack">
              {state.localSizings.map((item) => (
                <div className="fluent-table-row" key={item.id}>
                  <span>
                    <strong>{item.name}</strong> ({item.sizingType.toUpperCase()}) ·{' '}
                    {item.targetSize}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({ type: 'REMOVE_LOCAL_SIZING', id: item.id })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </fieldset>

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'ADD_LOCAL_SIZING' })}
            >
              Add Local Sizing
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'SELECT_TASK', taskId: 'wm-surface-mesh' })
              }
            >
              Next: Surface Mesh →
            </button>
          </div>
        </div>
      )

    case 'wm-surface-mesh':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Global Surface Mesh Sizing</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-sm-min">Minimum Size (mm)</label>
                <input
                  id="m-sm-min"
                  type="text"
                  value={state.surfaceMesh.minSize}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { minSize: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-sm-max">Maximum Size (mm)</label>
                <input
                  id="m-sm-max"
                  type="text"
                  value={state.surfaceMesh.maxSize}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { maxSize: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-sm-growth">Growth Rate</label>
                <input
                  id="m-sm-growth"
                  type="text"
                  value={state.surfaceMesh.growthRate}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { growthRate: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-sm-func">Size Functions</label>
                <select
                  id="m-sm-func"
                  value={state.surfaceMesh.sizeFunctions}
                  onChange={(e) => {
                    const sizeFunctions = e.target.value as FluentMeshingState['surfaceMesh']['sizeFunctions']
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { sizeFunctions },
                    })
                    onInspect(
                      'meshing-surface-mesh',
                      sizeFunctions === 'uniform' ? 'uniform_size' : sizeFunctions,
                    )
                  }}
                >
                  <option value="curvature-and-proximity">
                    Curvature & Proximity
                  </option>
                  <option value="curvature">Curvature</option>
                  <option value="proximity">Proximity</option>
                  <option value="uniform">Uniform</option>
                </select>
              </div>
              {sizing.curvature && <div className="fluent-field-row">
                <label htmlFor="m-sm-angle">Curvature Normal Angle (°)</label>
                <input
                  id="m-sm-angle"
                  type="text"
                  value={state.surfaceMesh.curvatureNormalAngle}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { curvatureNormalAngle: e.target.value },
                    })
                  }
                />
              </div>}
              {sizing.proximity && <div className="fluent-field-row">
                <label htmlFor="m-sm-gap">Cells Per Gap</label>
                <input
                  id="m-sm-gap"
                  type="text"
                  value={state.surfaceMesh.cellsPerGap}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_SURFACE_MESH_FORM',
                      patch: { cellsPerGap: e.target.value },
                    })
                  }
                />
              </div>}
            </div>
          </fieldset>

          {state.surfaceMesh.generated && (
            <div className="fluent-inline-note">
              已生成面网格：{state.surfaceMesh.faceCount.toLocaleString()} faces ·
              Max Skewness = {state.surfaceMesh.maxSkewness}
            </div>
          )}

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'RUN_SURFACE_MESH' })}
            >
              Generate the Surface Mesh
            </button>
          </div>
        </div>
      )

    case 'wm-describe-geometry':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Geometry Type & Topology</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-dg-type">Geometry Type</label>
                <select
                  id="m-dg-type"
                  value={state.describeGeometry.geometryType}
                  onChange={(e) => {
                    const geometryType = e.target.value as FluentMeshingState['describeGeometry']['geometryType']
                    dispatch({
                      type: 'UPDATE_DESCRIBE_GEOMETRY',
                      patch: { geometryType },
                    })
                    onInspect('meshing-describe-geometry', geometryType)
                  }}
                >
                  <option value="fluid-only">
                    The geometry consists of only fluid regions with no voids
                  </option>
                  <option value="fluid-and-solid">
                    The geometry consists of both fluid and solid regions
                  </option>
                  <option value="solid-only">
                    The geometry consists of only solid regions
                  </option>
                </select>
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-dg-share">Apply Share Topology?</label>
                <select
                  id="m-dg-share"
                  value={state.describeGeometry.shareTopology}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_DESCRIBE_GEOMETRY',
                      patch: { shareTopology: e.target.value as 'yes' | 'no' },
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <label className="fluent-choice-row">
                <input
                  type="checkbox"
                  disabled={state.describeGeometry.geometryType === 'fluid-only'}
                  checked={state.describeGeometry.capOpenings}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_DESCRIBE_GEOMETRY',
                      patch: { capOpenings: e.target.checked },
                    })
                  }
                />
                <span>Cap Openings</span>
              </label>
              <label className="fluent-choice-row">
                <input
                  type="checkbox"
                  checked={state.describeGeometry.applyMultizone}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_DESCRIBE_GEOMETRY',
                      patch: { applyMultizone: e.target.checked },
                    })
                  }
                />
                <span>Apply Multizone Meshing</span>
              </label>
            </div>
          </fieldset>

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'APPLY_DESCRIBE_GEOMETRY' })}
            >
              Describe Geometry
            </button>
          </div>
        </div>
      )

    case 'wm-capping':
      return <WatertightCappingTask state={state} dispatch={dispatch} />

    case 'wm-multizone-controls':
    case 'wm-multizone-mesh':
      return <MultizoneTaskBody state={state} dispatch={dispatch} />

    case 'wm-share-topology':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Conformal Interface Merging</legend>
            <p className="fluent-dialog-subtitle">
              对流固交界面或邻接流体块执行共节点拓扑共享，消除交界面插值误差。
            </p>
            <div className="fluent-inline-note">
              当前 Share Topology 状态：
              {state.shareTopologyApplied ? ' 已完成共节点合并' : ' 待执行'}
            </div>
          </fieldset>
          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'RUN_SHARE_TOPOLOGY' })}
            >
              Apply Share Topology
            </button>
          </div>
        </div>
      )

    case 'wm-update-boundaries':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Boundary Zone Type Assignment</legend>
            <div className="fluent-controls-stack">
              {state.boundaries.map((row) => (
                <div className="fluent-field-row" key={row.id}>
                  <label
                    htmlFor={`m-bc-${row.id}`}
                    onClick={() =>
                      dispatch({
                        type: 'SET_HIGHLIGHTED_ZONE',
                        zone: row.boundary,
                      })
                    }
                  >
                    {row.name}
                  </label>
                  <select
                    id={`m-bc-${row.id}`}
                    value={row.type}
                    onFocus={() =>
                      dispatch({
                        type: 'SET_HIGHLIGHTED_ZONE',
                        zone: row.boundary,
                      })
                    }
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_BOUNDARY_TYPE',
                        id: row.id,
                        boundaryType: e.target.value,
                      })
                    }
                  >
                    <option value="velocity-inlet">velocity-inlet</option>
                    <option value="mass-flow-inlet">mass-flow-inlet</option>
                    <option value="pressure-inlet">pressure-inlet</option>
                    <option value="pressure-outlet">pressure-outlet</option>
                    <option value="wall">wall</option>
                    <option value="symmetry">symmetry</option>
                    <option value="outflow">outflow</option>
                    <option value="interface">interface</option>
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'APPLY_UPDATE_BOUNDARIES' })}
            >
              Update Boundaries
            </button>
          </div>
        </div>
      )

    case 'wm-update-regions':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Region Type Confirmation ({state.regions.length})</legend>
            <div className="fluent-controls-stack">
              {state.regions.map((row) => (
                <div className="fluent-field-row" key={row.id}>
                  <label htmlFor={`m-reg-${row.id}`}>{row.name}</label>
                  <select
                    id={`m-reg-${row.id}`}
                    value={row.type}
                    onChange={(e) =>
                      dispatch({
                        type: 'UPDATE_REGION_TYPE',
                        id: row.id,
                        regionType: e.target.value as 'fluid' | 'solid' | 'dead',
                      })
                    }
                  >
                    <option value="fluid">fluid</option>
                    <option value="solid">solid</option>
                    <option value="dead">dead</option>
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'APPLY_UPDATE_REGIONS' })}
            >
              Update Regions
            </button>
          </div>
        </div>
      )

    case 'wm-boundary-layers':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Boundary Layer (Prism) Parameters</legend>
            <div className="fluent-controls-stack">
              <label className="fluent-choice-row">
                <input
                  type="checkbox"
                  checked={state.boundaryLayers.enabled}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                      patch: { enabled: e.target.checked },
                    })
                  }
                />
                <span>Add Boundary Layers (启用棱柱边界层)</span>
              </label>

              {state.boundaryLayers.enabled && (
                <>
                  <div className="fluent-field-row">
                    <label htmlFor="m-bl-method">Offset Method Type</label>
                    <select
                      id="m-bl-method"
                      value={state.boundaryLayers.offsetMethod}
                      onChange={(e) => {
                        const offsetMethod = e.target.value as FluentMeshingState['boundaryLayers']['offsetMethod']
                        dispatch({
                          type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                          patch: { offsetMethod },
                        })
                        onInspect('meshing-boundary-layers', offsetMethod)
                      }}
                    >
                      <option value="smooth-transition">smooth-transition</option>
                      <option value="uniform">uniform</option>
                      <option value="last-ratio">last-ratio</option>
                      <option value="aspect-ratio">aspect-ratio</option>
                    </select>
                  </div>

                  <div className="fluent-field-row">
                    <label htmlFor="m-bl-layers">Number of Layers</label>
                    <input
                      id="m-bl-layers"
                      type="text"
                      value={state.boundaryLayers.numberOfLayers}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                          patch: { numberOfLayers: e.target.value },
                        })
                      }
                    />
                  </div>

                  {state.boundaryLayers.offsetMethod === 'smooth-transition' && (
                    <div className="fluent-field-row">
                      <label htmlFor="m-bl-trans">Transition Ratio</label>
                      <input
                        id="m-bl-trans"
                        type="text"
                        value={state.boundaryLayers.transitionRatio}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                            patch: { transitionRatio: e.target.value },
                          })
                        }
                      />
                    </div>
                  )}

                  {(state.boundaryLayers.offsetMethod === 'uniform' ||
                    state.boundaryLayers.offsetMethod === 'last-ratio') && (
                    <div className="fluent-field-row">
                      <label htmlFor="m-bl-h1">First Height (mm)</label>
                      <input
                        id="m-bl-h1"
                        type="text"
                        value={state.boundaryLayers.firstHeight}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                            patch: { firstHeight: e.target.value },
                          })
                        }
                      />
                    </div>
                  )}

                  {state.boundaryLayers.offsetMethod === 'aspect-ratio' && (
                    <div className="fluent-field-row">
                      <label htmlFor="m-bl-ar">First Aspect Ratio</label>
                      <input
                        id="m-bl-ar"
                        type="text"
                        value={state.boundaryLayers.aspectRatio}
                        onChange={(e) =>
                          dispatch({
                            type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                            patch: { aspectRatio: e.target.value },
                          })
                        }
                      />
                    </div>
                  )}

                  <div className="fluent-field-row">
                    <label htmlFor="m-bl-growth">Growth Rate</label>
                    <input
                      id="m-bl-growth"
                      type="text"
                      value={state.boundaryLayers.growthRate}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                          patch: { growthRate: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className="fluent-field-row">
                    <label htmlFor="m-bl-grow-on">Grow Boundary Layers On</label>
                    <select
                      id="m-bl-grow-on"
                      value={state.boundaryLayers.growOn}
                      onChange={(e) =>
                        dispatch({
                          type: 'UPDATE_BOUNDARY_LAYERS_FORM',
                          patch: {
                            growOn: e.target.value as FluentMeshingState['boundaryLayers']['growOn'],
                          },
                        })
                      }
                    >
                      <option value="only-walls">only-walls</option>
                      <option value="selected-labels">selected-labels</option>
                      <option value="all-zones">all-zones</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </fieldset>

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'APPLY_BOUNDARY_LAYERS' })}
            >
              Add Boundary Layers
            </button>
          </div>
        </div>
      )

    case 'wm-volume-mesh':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Volume Fill & Transition Settings</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-vm-fill">Fill With</label>
                <select
                  id="m-vm-fill"
                  value={state.volumeMesh.fillWith}
                  onChange={(e) => {
                    const fillWith = e.target.value as FluentMeshingState['volumeMesh']['fillWith']
                    dispatch({
                      type: 'UPDATE_VOLUME_MESH_FORM',
                      patch: { fillWith },
                    })
                    onInspect('meshing-volume-mesh', fillWith)
                  }}
                >
                  <option value="poly-hexcore">poly-hexcore</option>
                  <option value="polyhedra">polyhedra</option>
                  <option value="tetrahedral">tetrahedral</option>
                  <option value="hexcore">hexcore</option>
                </select>
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-vm-buf">Buffer Layers</label>
                <input
                  id="m-vm-buf"
                  type="text"
                  value={state.volumeMesh.bufferLayers}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VOLUME_MESH_FORM',
                      patch: { bufferLayers: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-vm-peel">Peel Layers</label>
                <input
                  id="m-vm-peel"
                  type="text"
                  value={state.volumeMesh.peelLayers}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VOLUME_MESH_FORM',
                      patch: { peelLayers: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-vm-max">Max Cell Length (mm)</label>
                <input
                  id="m-vm-max"
                  type="text"
                  value={state.volumeMesh.maxCellLength}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VOLUME_MESH_FORM',
                      patch: { maxCellLength: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-vm-growth">Growth Rate</label>
                <input
                  id="m-vm-growth"
                  type="text"
                  value={state.volumeMesh.growthRate}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_VOLUME_MESH_FORM',
                      patch: { growthRate: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </fieldset>

          {state.volumeMesh.generated && (
            <div className="fluent-inline-note">
              已生成体网格：{state.volumeMesh.cellCount.toLocaleString()} cells ·
              Min Ortho = {state.volumeMesh.minOrthogonalQuality} · Max Skew ={' '}
              {state.volumeMesh.maxSkewness}
            </div>
          )}

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'RUN_VOLUME_MESH' })}
            >
              Generate the Volume Mesh
            </button>
            <button type="button" onClick={onSwitchToSolution}>
              Switch to Solution →
            </button>
          </div>
        </div>
      )

    case 'wm-improve-mesh':
      return (
        <div className="fluent-controls-stack">
          <fieldset className="fluent-task-group">
            <legend>Orthogonal Quality Enhancement</legend>
            <div className="fluent-controls-stack">
              <div className="fluent-field-row">
                <label htmlFor="m-imp-target">Cell Quality Limit</label>
                <input
                  id="m-imp-target"
                  type="text"
                  value={state.improveMesh.targetOrthogonalQuality}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPROVE_FORM',
                      patch: { targetOrthogonalQuality: e.target.value },
                    })
                  }
                />
              </div>
              <div className="fluent-field-row">
                <label htmlFor="m-imp-iter">Iterations</label>
                <input
                  id="m-imp-iter"
                  type="text"
                  value={state.improveMesh.iterations}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_IMPROVE_FORM',
                      patch: { iterations: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </fieldset>

          <div className="fluent-inline-note">
            当前 Min Orthogonal Quality：{state.volumeMesh.minOrthogonalQuality}{' '}
            | Max Skewness：{state.volumeMesh.maxSkewness}
          </div>

          <div className="fluent-task-footer-actions">
            <button
              type="button"
              className="fluent-primary-btn"
              onClick={() => dispatch({ type: 'RUN_IMPROVE_VOLUME_MESH' })}
            >
              Improve Volume Mesh
            </button>
            <button type="button" onClick={onSwitchToSolution}>
              Switch to Solution →
            </button>
          </div>
        </div>
      )
  }
}
