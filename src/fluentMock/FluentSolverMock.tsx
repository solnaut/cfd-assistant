import { useEffect, useReducer, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MobileFullscreenButton } from '../components/MobileFullscreenButton'
import { FluentIcon } from './FluentIcons'
import { FluentViewport } from './FluentViewport'
import { ConsolePane } from './components/ConsolePane'
import { ControlRenderer } from './components/ControlRenderer'
import { DialogStack, type OpenDialogEntry } from './components/DialogStack'
import { ExplanationPane } from './components/ExplanationPane'
import { OutlinePane } from './components/OutlinePane'
import { MobileWorkbenchPanes, type MobileWorkbenchPane } from './components/MobileWorkbenchPanes'
import { fluentExplanationById } from './fluentExplanations'
import { labelIn, type FluentLabel, type FluentLanguage } from './fluentLanguage'
import { fluentMockLayout as layout } from './fluentLayoutData'
import { troubleshootingCases, walkthroughSteps } from './fluentTeachingExtras'
import {
  OPEN_GLOBAL_SEARCH_EVENT,
  WORKBENCH_LOCATE_EVENT,
  type GlobalSearchAction,
} from '../search/globalSearchIndex'
import { isDialogControlVisible, unmetControlConditions } from './state/fluentDialogView'
import { dialogControlLocation, dialogEntry, locateDialogControl, solutionControlById as controlById,
  solutionControls as controls, solutionDialogById as dialogById } from './state/fluentDialogNavigation'
import { createSurfaceAction } from './state/fluentSurfaceDefinition'
import { validateReport } from './state/fluentReportState'
import { replaceMeshOption } from './data/fileMenus'
import {
  createInitialFluentSimState,
  fluentSimReducer,
  formatViscousBadge,
  getControlChecked,
  getControlValue,
  type FluentSimState,
  type HighlightedBoundary,
} from './state/fluentSimState'
import { parseAndExecuteTui, solutionTuiCatalog } from './state/fluentTuiCommands'
import {
  consumeMeshingHandoff,
  parseLauncherParams,
  readLauncherPreferences,
} from './state/fluentWorkbenchBridge'
import type { FluentMockControl } from './fluentTypes'
import './styles/fluentWorkspace.css'

const ownerPanels = new Map(layout.taskPanels.flatMap((panel) => panel.groups.flatMap(({ controls }) => controls.map((control) => [control.id, panel] as const))))
const ribbonLocations = new Map<string, { tabId: string; path: string[] }>()

function indexRibbonControls(tabId: string, items: FluentMockControl[], path: string[] = []) {
  for (const control of items) {
    ribbonLocations.set(control.id, { tabId, path })
    if (control.children) indexRibbonControls(tabId, control.children, [...path, control.id])
  }
}

for (const tab of layout.ribbonTabs) {
  for (const group of tab.groups) indexRibbonControls(tab.id, group.controls)
}

function isRibbonControlActive(id: string, state: FluentSimState): boolean {
  switch (id) {
    case 'ribbon-model-multiphase':
      return state.multiphaseModel !== 'Off'
    case 'ribbon-model-energy':
      return state.energyEnabled
    case 'ribbon-model-viscous':
      return state.viscousModel !== 'inviscid' && state.viscousModel !== 'laminar'
    case 'ribbon-model-radiation':
      return state.radiationModel !== 'Off'
    case 'ribbon-model-species':
      return state.speciesModel !== 'Off'
    case 'ribbon-model-dpm':
      return state.dpmEnabled
    case 'ribbon-model-solidification':
      return state.solidificationEnabled
    case 'ribbon-model-acoustics':
      return state.acousticsModel !== 'Off'
    case 'ribbon-model-wall-film':
      return state.wallFilmEnabled
    case 'ribbon-model-battery':
      return state.batteryModel !== 'Off'
    case 'ribbon-run-steady':
      return state.timeFormulation === 'steady'
    case 'ribbon-run-transient':
      return state.timeFormulation === 'transient'
    case 'ribbon-physics-gravity':
      return state.gravityEnabled
    case 'ribbon-dynamic-mesh':
      return getControlChecked(state, 'dynamic-mesh-enable')
    default:
      return false
  }
}

function ribbonControlVisible(control: FluentMockControl, state: FluentSimState) {
  const location = ribbonLocations.get(control.id)
  if (!location) return true
  const parents = location.path.map((id) => controlById.get(id)!)
  return [...parents, control].every((item) =>
    isDialogControlVisible(item, { id: 'ribbon', controls: [] }, state),
  )
}

type WorkbenchSearchEntry =
  | {
      kind: 'control'
      id: string
      title: string
      location: string
      control: FluentMockControl
      tokensText: string
    }
  | {
      kind: 'troubleshoot'
      id: string
      title: string
      location: string
      tokensText: string
    }
  | {
      kind: 'tui'
      id: string
      title: string
      location: string
      command: string
      tokensText: string
    }

const searchEntries: WorkbenchSearchEntry[] = [
  ...controls
    .filter(
      (control) =>
        control.enabled && control.id !== layout.quickSearchControl.id,
    )
    .map((control): WorkbenchSearchEntry => {
      const ownerDialog = control.parentId ? dialogById.get(control.parentId) : undefined
      const explanation = fluentExplanationById.get(control.explanationId)
      const loc =
        ownerDialog?.title ??
        (ribbonLocations.has(control.id)
          ? layout.ribbonTabs.find((tab) => tab.id === ribbonLocations.get(control.id)?.tabId)?.label
          : undefined) ??
        control.region
      return {
        kind: 'control',
        id: control.id,
        title: control.label,
        location: loc,
        control,
        tokensText: [
          control.id,
          control.label,
          control.labelZh,
          labelIn('en', control.label),
          labelIn('zh', control.label),
          control.module,
          ownerDialog?.title ?? '',
          explanation?.title ?? '',
          explanation?.whatItIs ?? '',
          ...(control.optionDisplay === 'choices' ? control.options ?? [] : []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      }
    }),
  ...troubleshootingCases.map((item): WorkbenchSearchEntry => ({
    kind: 'troubleshoot',
    id: `troubleshoot:${item.id}`,
    title: item.symptom,
    location: 'Troubleshooting · 报错排查',
    tokensText: [item.symptom, ...item.likelyCauses, ...item.fixes]
      .join(' ')
      .toLowerCase(),
  })),
  ...solutionTuiCatalog.map((item): WorkbenchSearchEntry => ({
    kind: 'tui',
    id: `tui:${item.command}`,
    title: item.command,
    location: item.description,
    command: item.command,
    tokensText: `${item.command} ${item.description} tui command`.toLowerCase(),
  })),
]

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

function resolveInitialLocation(search: string) {
  const params = new URLSearchParams(search)
  const locateId = params.get('locate')
  const panelParam = params.get('panel')
  const control = locateId ? controlById.get(locateId) : undefined

  let initialRibbonId = 'ribbon-tab-domain'
  let initialPanelId = layout.defaultPanelId
  let initialControlId = layout.defaultControlId
  let initialExpanded = defaultExpanded
  let initialDialogs: OpenDialogEntry[] = []
  let focusId: string | undefined

  if (control?.enabled) {
    initialControlId = control.id
    const ribbonLoc = ribbonLocations.get(control.id)
    if (ribbonLoc) initialRibbonId = ribbonLoc.tabId

    const ownerPanel = ownerPanels.get(control.id)
    if (control.panelId ?? ownerPanel?.id) {
      initialPanelId = control.panelId ?? ownerPanel!.id
    }

    const ownerSection = layout.treeSections.find((section) =>
      section.controls.some(
        (node) => node.id === control.id || node.panelId === (control.panelId ?? ownerPanel?.id),
      ),
    )
    if (ownerSection && !initialExpanded.includes(ownerSection.id)) {
      initialExpanded = [...initialExpanded, ownerSection.id]
    }

    const ownerDialog = control.parentId ? dialogById.get(control.parentId) : undefined
    if (ownerDialog) {
      const launcher = parseLauncherParams(search)
      const state = fluentSimReducer(createInitialFluentSimState(), { type: 'APPLY_MESHING_HANDOFF', launcher })
      const target = locateDialogControl(ownerDialog, control, state, layout.quickSearchControl.id)
      initialDialogs = target.entries
      focusId = target.focusId
      const openerId = initialDialogs[0]?.openerId ?? ''
      initialRibbonId = ribbonLocations.get(openerId)?.tabId ?? initialRibbonId
      initialPanelId = ownerPanels.get(openerId)?.id ?? initialPanelId
    } else if (control.dialogId) {
      initialDialogs.push({
        id: control.dialogId,
        openerId: control.id,
        tabId: control.dialogTab,
        x: 0,
        y: 0,
      })
      focusId = control.dialogId
    }
  }

  return {
    ribbonId: initialRibbonId,
    panelId: initialPanelId,
    activeControlId: initialControlId,
    expandedSections: initialExpanded,
    dialogs: initialDialogs,
    focusId,
    inspectorTab: panelParam === 'troubleshoot' ? ('troubleshoot' as const) : ('guide' as const),
  }
}

export default function FluentSolverMock() {
  const root = useRef<HTMLElement>(null)
  const tuiInitRef = useRef<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [initialResolved] = useState(() => resolveInitialLocation(location.search))
  const [simState, dispatch] = useReducer(
    fluentSimReducer,
    undefined,
    createInitialFluentSimState,
  )
  const [language, setLanguage] = useState<FluentLanguage>(() =>
    Object.keys(parseLauncherParams(location.search)).length > 0
      ? readLauncherPreferences().language
      : 'en',
  )
  const [ribbonId, setRibbonId] = useState(() => initialResolved.ribbonId)
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const [menuAnchorX, setMenuAnchorX] = useState(12)
  const [panelId, setPanelId] = useState(() => initialResolved.panelId)
  const [activeControlId, setActiveControlId] = useState(
    () => initialResolved.activeControlId,
  )
  const [filterText, setFilterText] = useState('')
  const [boundaryFilter, setBoundaryFilter] = useState('')
  const [expandedSections, setExpandedSections] = useState(
    () => initialResolved.expandedSections,
  )
  const [expandedTreeNodes, setExpandedTreeNodes] = useState(
    defaultExpandedTreeNodes,
  )
  const [showGuide, setShowGuide] = useState(true)
  const [inspectorTab, setInspectorTab] = useState<'guide' | 'troubleshoot'>(
    () => initialResolved.inspectorTab,
  )
  const [mobilePane, setMobilePane] = useState<MobileWorkbenchPane>('outline')
  const [showWalkthrough, setShowWalkthrough] = useState(false)
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false)
  const [dialogs, setDialogs] = useState<OpenDialogEntry[]>(
    () => initialResolved.dialogs,
  )
  const [focusTarget, setFocusTarget] = useState<{ id: string } | null>(initialResolved.focusId ? { id: initialResolved.focusId } : null)

  useEffect(() => {
    const handoff = consumeMeshingHandoff()
    const launcher = parseLauncherParams(location.search)
    const hasLauncherQuery = Object.keys(launcher).length > 0
    const prefs = hasLauncherQuery ? readLauncherPreferences() : undefined
    if (handoff || hasLauncherQuery) {
      dispatch({ type: 'APPLY_MESHING_HANDOFF', handoff, launcher, prefs })
    }
    const tuiParam = new URLSearchParams(location.search).get('tui')
    if (tuiParam && tuiInitRef.current !== location.search) {
      tuiInitRef.current = location.search
      dispatch(parseAndExecuteTui(tuiParam, simState))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const label: FluentLabel = (term) => labelIn(language, term)
  const ribbon =
    layout.ribbonTabs.find((tab) => tab.id === ribbonId) ?? layout.ribbonTabs[1]
  const panel =
    layout.taskPanels.find((item) => item.id === panelId) ??
    layout.taskPanels[0]
  const topDialog = dialogs.at(-1)
  const activeControl = controlById.get(activeControlId)
  const activeOptionValue = activeControl?.controlType === 'select'
    ? getControlValue(simState, activeControl.valueId ?? activeControl.id, activeControl.value ?? '')
    : undefined
  const activeOwner = dialogById.get(activeControl?.parentId ?? '')
  const parentPrerequisites = activeControl && activeOwner
    ? locateDialogControl(activeOwner, activeControl, simState, layout.quickSearchControl.id).prerequisites : []
  const prerequisites = activeControl
    ? [...new Map([...unmetControlConditions(activeControl, activeOwner, simState), ...parentPrerequisites].map((item) => [item.controlId, item])).values()] : []
  const explanation = fluentExplanationById.get(
    activeControl?.explanationId ?? '',
  )
  const outlineQuery = filterText.trim().toLowerCase()

  useEffect(() => {
    if (!focusTarget) return
    const target = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-fluent-control]') ?? [])
      .find((element) => element.dataset.fluentControl === focusTarget.id)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [focusTarget])

  function inspect(control: FluentMockControl) {
    setActiveControlId(control.id)
  }

  function selectDialogTab(id: string, tabId: string) {
    setDialogs((items) => items.map((item) => item.id === id ? { ...item, tabId } : item))
  }

  function openEnergyFromDialog(id: string) {
    setDialogs((items) => [
      ...items,
      { id: 'energy-model-dialog', openerId: id + '-open-energy', x: 0, y: 0 },
    ])
    const energy = controlById.get('models-energy')
    if (energy) inspect(energy)
    setFocusTarget({ id: 'energy-model-dialog' })
  }

  function menuClick(control: FluentMockControl, parentPath: string[], anchorElement?: HTMLElement) {
    inspect(control)
    const isOpen = openMenus[parentPath.length] === control.id
    setOpenMenus(isOpen ? parentPath : [...parentPath, control.id])
    if (!isOpen && parentPath.length === 0 && anchorElement) {
      const ribbonEl = anchorElement.closest('.fluent-ribbon')
      if (ribbonEl) {
        const headerRect = ribbonEl.getBoundingClientRect()
        const btnRect = anchorElement.getBoundingClientRect()
        const nextLeft = Math.max(8, Math.min(btnRect.left - headerRect.left, Math.max(8, headerRect.width - 220)))
        setMenuAnchorX(nextLeft)
      }
    }
    const first = control.children?.find((item) => item.enabled && ribbonControlVisible(item, simState))
    if (!isOpen && first) setFocusTarget({ id: first.id })
  }

  function triggerControlSideEffect(control: FluentMockControl) {
    switch (control.id) {
      case 'multiphase-phase-add':
      case 'multiphase-phase-delete':
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: control.id, value: true })
        break
      case 'multiphase-secondary':
        if (getControlValue(simState, 'multiphase-phase-list') === '1') {
          dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'multiphase-phase-list', value: simState.phaseIds[1] })
        }
        break
      case 'ribbon-stop-journal':
      case 'ribbon-stop-transcript':
        dispatch({ type: 'STOP_RECORDING', kind: control.id === 'ribbon-stop-journal' ? 'journal' : 'transcript' })
        break
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
      case 'mesh-display-run':
        dispatch({ type: 'DISPLAY_MESH' })
        break
      case 'ribbon-physics-gravity':
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'general-gravity-enable', value: !simState.gravityEnabled })
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
      case 'database-material-copy':
        dispatch({ type: 'COPY_DATABASE_MATERIAL' })
        break
      case 'initialization-run':
      case 'initialization-run-inline':
        dispatch({ type: 'RUN_INITIALIZE' })
        break
      case 'fmg-initialize':
        dispatch({ type: 'RUN_FMG_INITIALIZE' })
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
      case 'report-definition-force':
      case 'report-definition-surface':
      case 'report-definition-flux':
        dispatch({
          type: 'SET_CONTROL_VALUE',
          controlId: 'report-definition-type',
          value: control.id === 'report-definition-force' ? 'Force'
            : control.id === 'report-definition-surface' ? 'Area-Weighted Average' : 'Mass Flow Rate',
        })
        break
      case 'ribbon-report-new-force':
      case 'ribbon-report-new-surface':
      case 'ribbon-report-new-volume':
      case 'ribbon-report-new-flux': {
        const category =
          control.id === 'ribbon-report-new-force' ? 'Force'
            : control.id === 'ribbon-report-new-surface' ? 'Surface'
              : control.id === 'ribbon-report-new-volume' ? 'Volume' : 'Flux'
        const reportType =
          category === 'Force' ? 'Force'
            : category === 'Surface' ? 'Area-Weighted Average'
              : category === 'Volume' ? 'Volume-Average' : 'Mass Flow Rate'
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'report-definition-category', value: category })
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'report-definition-type', value: reportType })
        break
      }
      case 'report-plot-display':
        dispatch({ type: 'DISPLAY_REPORT_PLOT' })
        break
      case 'report-plot-new':
      case 'report-file-new':
        dispatch({ type: 'NEW_REPORT_OUTPUT', kind: control.id === 'report-plot-new' ? 'plot' : 'file' })
        break
      case 'contours-display':
      case 'dash-show-contours':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'contours' })
        break
      case 'vectors-display':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'vectors' })
        break
      case 'pathlines-display':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'pathlines' })
        break
      case 'particle-tracks-display':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'particle-tracks' })
        break
      case 'xy-plot-plot':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'xy-plot' })
        break
      case 'point-surface-create':
      case 'line-rake-create':
      case 'plane-surface-create':
      case 'iso-surface-create':
      case 'iso-clip-create': {
        const dialog = control.parentId && dialogById.get(control.parentId)
        if (dialog) dispatch(createSurfaceAction(simState, dialog, topDialog?.surfaceName))
        break
      }
      case 'plot-residuals':
      case 'dash-show-residuals':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'residuals' })
        break
      case 'fluxes-compute':
      case 'dash-check-fluxes':
        dispatch({ type: 'RUN_FLUXES_REPORT' })
        break
      case 'forces-compute':
      case 'forces-print':
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
      case 'ribbon-view-back':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'back' })
        break
      case 'ribbon-view-bottom':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'bottom' })
        break
      case 'ribbon-view-right':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'right' })
        break
      case 'ribbon-view-fit':
      case 'ribbon-view-reset':
        dispatch({ type: 'SET_CAMERA_PRESET', preset: 'isometric' })
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'mesh' })
        break
      case 'ribbon-switch-to-meshing':
      case 'ribbon-help-meshing':
        navigate(
          `/fluent-meshing?dim=${simState.dimension}&dp=1&np=${simState.processes}`,
        )
        break
      case 'ribbon-help-walkthrough':
        setShowWalkthrough((v) => !v)
        break
      case 'ribbon-help-troubleshoot':
        setShowGuide(true)
        setInspectorTab('troubleshoot')
        setMobilePane('guide')
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
      case 'mesh-scale-unscale':
        dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'mesh-scale-factor', value: '1.0' })
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [{ kind: 'info', text: 'Reset mesh scale factor to 1.0 (unscaled domain coordinates).' }],
        })
        break
      case 'mesh-scale-translate-btn':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [{
            kind: 'success',
            text: `[Teaching Demo] Translated mesh by (${getControlValue(simState, 'mesh-translate-x', '0')}, ${getControlValue(simState, 'mesh-translate-y', '0')}, ${getControlValue(simState, 'mesh-translate-z', '0')}) m.`,
          }],
        })
        break
      case 'mesh-scale-rotate-btn':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [{
            kind: 'success',
            text: `[Teaching Demo] Rotated mesh by ${getControlValue(simState, 'mesh-rotate-angle', '0')} deg around axis (${getControlValue(simState, 'mesh-rotate-axis', '0, 0, 1')}) at (${getControlValue(simState, 'mesh-rotate-origin', '0, 0, 0')}).`,
          }],
        })
        break
      case 'dynamic-mesh-preview':
        dispatch({
          type: 'APPEND_CONSOLE',
          entries: [{
            kind: 'info',
            text: `[Dynamic Mesh Preview] Dry-run motion preview OK (Smoothing=${getControlChecked(simState, 'dynamic-mesh-smoothing') ? 'On' : 'Off'}, Layering=${getControlChecked(simState, 'dynamic-mesh-layering') ? 'On' : 'Off'}, Remeshing=${getControlChecked(simState, 'dynamic-mesh-remeshing') ? 'On' : 'Off'}).`,
          }],
        })
        break
      case 'surface-integrals-compute':
        dispatch({ type: 'COMPUTE_REPORT', report: 'surface' })
        break
      case 'reports-compute':
        dispatch({ type: 'COMPUTE_REPORT', report: 'general' })
        break
      case 'mesh-smooth-run':
        dispatch({ type: 'RUN_MESH_SMOOTH_OR_SWAP', mode: 'smooth' })
        break
      case 'mesh-swap-run':
        dispatch({ type: 'RUN_MESH_SMOOTH_OR_SWAP', mode: 'swap' })
        break
      case 'polyhedra-convert-btn':
        dispatch({ type: 'CONVERT_TO_POLYHEDRA' })
        break
      case 'ribbon-mesh-reorder-domain':
      case 'reorder-domain-btn':
        dispatch({ type: 'RUN_MESH_REORDER', scope: 'domain' })
        break
      case 'ribbon-mesh-reorder-zones':
        dispatch({ type: 'RUN_MESH_REORDER', scope: 'zones' })
        break
      case 'ribbon-mesh-reorder-bandwidth':
      case 'reorder-bandwidth-btn':
        dispatch({ type: 'RUN_MESH_REORDER', scope: 'bandwidth' })
        break
      case 'ribbon-adapt-refine':
      case 'adapt-refine':
      case 'adapt-run-btn':
        dispatch({ type: 'RUN_ADAPT_REFINE' })
        break
      case 'zone-merge-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'merge' })
        break
      case 'zone-separate-cell-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'separate-cells' })
        break
      case 'zone-separate-face-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'separate-faces' })
        break
      case 'ribbon-zone-adjacency':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'adjacency' })
        break
      case 'zone-delete-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'delete' })
        break
      case 'zone-replace-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'replace' })
        break
      case 'zone-append-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'append' })
        break
      case 'ribbon-interface-orient':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'orient' })
        break
      case 'overset-create-btn':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'overset' })
        break
      case 'interface-create':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'interface-create' })
        break
      case 'curv-compute':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'curvilinear' })
        break
      case 'symmetry-check-normal':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'symmetry-normal' })
        break
      case 'outflow-target':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'outflow-target' })
        break
      case 'cell-zone-source-udf':
        dispatch({ type: 'RUN_ZONE_OPERATION', operation: 'source-udf' })
        break
      case 'manage-surface-display':
        dispatch({ type: 'RUN_MANAGE_SURFACE', action: 'display' })
        break
      case 'manage-surface-info':
        dispatch({ type: 'RUN_MANAGE_SURFACE', action: 'info' })
        break
      case 'udf-interpret-btn':
        dispatch({ type: 'RUN_UDF_ACTION', action: 'interpret' })
        break
      case 'udf-demand-run':
        dispatch({ type: 'RUN_UDF_ACTION', action: 'demand' })
        break
      case 'exec-cmd-test':
        dispatch(
          parseAndExecuteTui(
            getControlValue(simState, 'exec-cmd-command', '/report/fluxes/mass-flow'),
            simState,
          ),
        )
        break
      case 'data-sampling-reset':
        dispatch({ type: 'RESET_DATA_SAMPLING' })
        break
      case 'stats-evaluate':
        dispatch({ type: 'RUN_STATISTICS_SUMMARY' })
        break
      case 'residual-plot-now':
        dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'residuals' })
        break
      case 'histogram-plot-btn':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'histogram' })
        break
      case 'fft-plot-btn':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'fft' })
        break
      case 'scene-display-btn':
        dispatch({ type: 'DISPLAY_RESULT', tab: 'scene' })
        break
      case 'partition-manual-run':
        dispatch({ type: 'RUN_MANUAL_PARTITION' })
        break
      case 'partition-check-btn':
        dispatch({ type: 'CHECK_PARTITION' })
        break
      case 'partition-network-btn':
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
      case 'adjoint-eval-btn':
        dispatch({ type: 'RUN_ADJOINT_ACTION', action: 'evaluate' })
        break
      case 'adjoint-init-btn':
        dispatch({ type: 'RUN_ADJOINT_ACTION', action: 'initialize' })
        break
      case 'adjoint-run-btn':
        dispatch({ type: 'RUN_ADJOINT_ACTION', action: 'advance' })
        break
      case 'adjoint-morph-btn':
        dispatch({ type: 'RUN_ADJOINT_ACTION', action: 'morph' })
        break
      case 'param-dp-update':
        dispatch({ type: 'UPDATE_DESIGN_POINT' })
        break
      case 'results-summary':
        dispatch({ type: 'RUN_CASE_SUMMARY' })
        break
      default:
        break
    }
  }

  function highlightBoundaryForControl(controlId: string): HighlightedBoundary {
    if (
      controlId === 'bc-velocity-inlet' ||
      controlId === 'bc-mass-flow-inlet' ||
      controlId === 'bc-pressure-inlet' || controlId === 'bc-intake-fan' || controlId === 'bc-inlet-vent'
    ) {
      return 'inlet'
    }
    if (
      controlId === 'bc-pressure-outlet' ||
      controlId === 'bc-outflow' ||
      controlId === 'bc-pressure-far-field' || controlId === 'bc-mass-flow-outlet' ||
      controlId === 'bc-exhaust-fan' || controlId === 'bc-outlet-vent'
    ) {
      return 'outlet'
    }
    if (controlId === 'bc-wall') return 'wall'
    if (controlId === 'bc-symmetry' || controlId === 'bc-axis') return 'symmetry'
    return null
  }

  function activate(control: FluentMockControl, locate = false, originId?: string, surfaceName?: string, anchorElement?: HTMLElement) {
    const ribbonLocation = ribbonLocations.get(control.id)
    if (ribbonLocation && !ribbonControlVisible(control, simState)) return
    if (ribbonLocation) setRibbonId(ribbonLocation.tabId)
    if (control.children?.length) {
      if (locate) {
        inspect(control)
        setMenuAnchorX(12)
        setOpenMenus([...(ribbonLocation?.path ?? []), control.id])
        setFocusTarget({ id: control.id })
        setShowGuide(true)
      } else {
        menuClick(control, ribbonLocation?.path ?? [], anchorElement)
      }
      return
    }
    setOpenMenus([])
    inspect(control)
    const boundary = highlightBoundaryForControl(control.id)
    if (boundary || control.id.startsWith('bc-')) {
      dispatch({ type: 'SET_HIGHLIGHTED_BOUNDARY', boundary })
    }

    if (!locate) {
      triggerControlSideEffect(control)
    }

    const ownerDialog = layout.dialogs.find(
      (item) => item.id === control.parentId,
    )
    const ownerPanel = ownerPanels.get(control.id)
    const ownerSection = layout.treeSections.find((section) =>
      section.controls.some(
        (node) =>
          node.id === control.id ||
          node.panelId === (control.panelId ?? ownerPanel?.id),
      ),
    )

    const nextPanelId = control.panelId ?? ownerPanel?.id
    if (nextPanelId) {
      setPanelId(nextPanelId)
      if (!originId || !control.dialogId) setMobilePane('task')
    }
    if (locate && ownerSection) {
      setFilterText('')
      setExpandedSections((items) =>
        items.includes(ownerSection.id) ? items : [...items, ownerSection.id],
      )
    }

    if (locate && ownerPanel && !isDialogControlVisible(control, {
      id: ownerPanel.id, controls: ownerPanel.groups.flatMap((group) => group.controls),
    }, simState)) {
      setDialogs([])
      setFocusTarget({ id: ownerPanel.id })
      setShowGuide(true)
      return
    }

    if (ownerDialog) {
      const target = locateDialogControl(ownerDialog, control, simState, layout.quickSearchControl.id)
      const ownerOpen = dialogs.some(({ id }) => id === ownerDialog.id)
      if (locate && !ownerOpen) {
        const openerId = target.entries[0]?.openerId ?? ''
        const ownerRibbon = ribbonLocations.get(openerId)?.tabId
        const openerPanel = ownerPanels.get(openerId)?.id
        if (ownerRibbon) setRibbonId(ownerRibbon)
        if (openerPanel) setPanelId(openerPanel)
      }
      setDialogs((items) => {
        const index = items.findIndex((item) => item.id === ownerDialog.id)
        if (locate && target.blocked) return target.entries
        const stack = index >= 0 ? items.slice(0, index + 1) : target.entries
        const tabId = locate ? dialogControlLocation(ownerDialog, control, simState).tabId : undefined
        if (tabId && stack.length) stack[stack.length - 1] = { ...stack.at(-1)!, tabId }
        return !locate && control.dialogId && control.dialogId !== ownerDialog.id
          ? [...stack, dialogEntry(control.dialogId, control.id, control.dialogTab)]
          : stack
      })
      if (locate) {
        setFocusTarget({ id: target.focusId })
      }
    } else {
      setDialogs(
        control.dialogId
          ? [{ ...dialogEntry(control.dialogId, originId ?? ribbonLocation?.path[0] ?? control.id, control.dialogTab), surfaceName }]
          : [],
      )
      if (locate && !control.dialogId) {
        if (ribbonLocation) setOpenMenus(ribbonLocation.path)
        setFocusTarget({ id: control.id })
      }
    }

    if (locate) {
      setShowGuide(true)
      setInspectorTab('guide')
    }
    if (control.dialogId && (!ownerDialog || !locate)) {
      setFocusTarget({ id: control.dialogId })
    }
  }

  function locateById(controlId: string) {
    const control = controlById.get(controlId)
    if (control) activate(control, true)
  }

  const locateRef = useRef(locateById)
  const simStateRef = useRef(simState)
  const previousLocationSearch = useRef(location.search)
  useEffect(() => {
    if (previousLocationSearch.current === location.search) return
    previousLocationSearch.current = location.search
    const params = new URLSearchParams(location.search)
    const target = params.get('locate')
    if (target) locateRef.current(target)
  }, [location.search])

  useEffect(() => {
    locateRef.current = locateById
    simStateRef.current = simState
  })

  useEffect(() => {
    function handleLocateEvent(event: Event) {
      const detail = (event as CustomEvent<GlobalSearchAction>).detail
      if (!detail) return
      if (detail.kind === 'solution-locate') {
        locateRef.current(detail.value)
      } else if (detail.kind === 'solution-troubleshoot') {
        setShowGuide(true)
        setInspectorTab('troubleshoot')
        setMobilePane('guide')
      } else if (detail.kind === 'solution-tui') {
        dispatch(parseAndExecuteTui(detail.value, simStateRef.current))
      }
    }
    window.addEventListener(WORKBENCH_LOCATE_EVENT, handleLocateEvent)
    return () => {
      window.removeEventListener(WORKBENCH_LOCATE_EVENT, handleLocateEvent)
    }
  }, [])

  function closeTopDialog(applied = false) {
    const current = dialogs.at(-1)
    if (!current) return
    if (!applied && current.id === 'multiphase-model-dialog') dispatch({ type: 'SET_EULERIAN_REGIME_APPLIED', discard: true })
    if (applied && current.id === 'ribbon-read-mesh-dialog' &&
      getControlValue(simState, 'read-mesh-mode') === replaceMeshOption &&
      getControlChecked(simState, 'read-mesh-show-scale', false)) {
      setDialogs((items) => [...items.slice(0, -1), dialogEntry('mesh-scale-dialog', current.openerId)])
      setFocusTarget({ id: 'mesh-scale-dialog' })
      return
    }
    setDialogs((items) => items.slice(0, -1))
    const parent = dialogs.at(-2)
    const target = current.openerId.endsWith('-open-energy') && simState.energyEnabled
      ? parent?.id ?? current.openerId
      : current.openerId
    setActiveControlId(controlById.has(target) ? target : activeControlId)
    setFocusTarget({ id: ribbonLocations.get(target)?.path[0] ?? target })
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
      controlId: control.valueId ?? control.id,
      value,
    })
    const child = typeof value === 'string' ? control.optionDialogs?.[value] : undefined
    if (child && dialogs.at(-1)?.id === control.parentId) {
      setDialogs((items) => [...items, dialogEntry(child, control.id)])
      setFocusTarget({ id: child })
    }
  }

  const currentStep = walkthroughSteps[simState.walkthroughStep]

  return (
    <section
      ref={root}
      className="fluent-workbench"
      data-theme={simState.uiTheme}
      aria-labelledby="fluent-title"
      lang={language === 'zh' ? 'zh-CN' : 'en'}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        if (showDisclaimerModal) {
          event.preventDefault()
          setShowDisclaimerModal(false)
          return
        }
        if (openMenus.length) {
          event.preventDefault()
          setFocusTarget({ id: openMenus.at(-1)! })
          setOpenMenus(openMenus.slice(0, -1))
        } else if (topDialog) {
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
            <Link to="/fluent-launcher">Fluent Launcher</Link>
            <Link to="/calculators">参数计算</Link>
            <Link to="/formulas">CFD 公式库</Link>
            <Link to="/knowledge">热流体工程图解</Link>
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
            aria-pressed={simState.uiTheme === 'dark'}
            onClick={() =>
              dispatch({
                type: 'SET_UI_THEME',
                theme: simState.uiTheme === 'dark' ? 'light' : 'dark',
              })
            }
          >
            {simState.uiTheme === 'dark' ? '浅色主题' : '暗色主题'}
          </button>
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
        <MobileFullscreenButton />
      </header>

      <div className="fluent-titlebar">
        <div className="fluent-titlebar-left">
          <div className="fluent-qat" aria-label="Quick Access Toolbar">
            <button
              type="button"
              title={label('Read Case')}
              aria-label="Quick Read Case"
              onClick={() => {
                const ctrl = controlById.get('ribbon-read-case-data')
                if (ctrl) activate(ctrl)
              }}
            >
              <FluentIcon name="read" />
            </button>
            <button
              type="button"
              title={label('Write Case')}
              aria-label="Quick Write Case"
              onClick={() => {
                const ctrl = controlById.get('ribbon-write-case-data')
                if (ctrl) activate(ctrl)
              }}
            >
              <FluentIcon name="save" />
            </button>
            <button
              type="button"
              title={label('Mesh Check')}
              aria-label="Quick Mesh Check"
              onClick={() => dispatch({ type: 'RUN_MESH_CHECK' })}
            >
              <FluentIcon name="check" />
            </button>
          </div>
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
          isAvailable={(control) => ribbonControlVisible(control, simState)}
          onInspect={() => inspect(layout.quickSearchControl)}
          onLocate={activate}
          onOpenTroubleshoot={() => {
            setShowGuide(true)
            setInspectorTab('troubleshoot')
            setMobilePane('guide')
          }}
          onRunTui={(cmd) => dispatch(parseAndExecuteTui(cmd, simState))}
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

      <header
        className="fluent-ribbon"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpenMenus([])
        }}
      >
        <nav className="fluent-ribbon-tabs" aria-label={label('Command tabs')}>
          {layout.ribbonTabs.map((tab) => (
            <button
              key={tab.id}
              className={tab.id === 'ribbon-tab-file' ? 'fluent-file-tab' : ''}
              aria-pressed={tab.id === ribbonId}
              type="button"
              onClick={() => {
                setRibbonId(tab.id)
                setOpenMenus([])
              }}
            >
              {label(tab.label)}
            </button>
          ))}
        </nav>
        <div className="fluent-ribbon-groups">
          {ribbon.groups.map((group) => {
            const visibleControls = group.controls.filter((control) => ribbonControlVisible(control, simState))
            const compact = visibleControls.length >= 6
            return (
              <div className={'fluent-ribbon-group' + (compact ? ' compact-stack' : '')} key={group.id}>
                <div className="fluent-ribbon-buttons">
                  {visibleControls.map((control) => (
                    <button
                      className={
                        'fluent-ribbon-tool' +
                        (control.id === activeControlId ? ' active' : '') +
                        (isRibbonControlActive(control.id, simState) ? ' fluent-ribbon-active-state' : '')
                      }
                      data-fluent-control={control.id}
                      aria-expanded={control.children ? openMenus[0] === control.id : undefined}
                      aria-controls={control.children ? 'fl-menu-' + control.id : undefined}
                      disabled={!control.enabled}
                      title={control.unavailableReason && label(control.unavailableReason)}
                      key={control.id}
                      onClick={(event) => activate(control, false, undefined, undefined, event.currentTarget)}
                      type="button"
                    >
                      <FluentIcon controlId={control.id} />
                      <span>{label(control.label)}</span>
                      {control.children && <small aria-hidden="true">▾</small>}
                    </button>
                  ))}
                </div>
                <span className="fluent-ribbon-group-label">
                  {label(group.id === 'ribbon-zone' ? 'Zones' : group.label)}
                </span>
              </div>
            )
          })}
        </div>
        {openMenus.length > 0 && (
          <div className="fluent-command-menus" style={{ left: `${menuAnchorX}px` }}>
            {openMenus.map((id, index) => {
              const parent = controlById.get(id)
              return parent && (
                <div role="group" aria-label={label(parent.label)} className="fluent-command-menu" id={'fl-menu-' + id} key={id}>
                  {parent.children?.filter((item) => ribbonControlVisible(item, simState)).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-fluent-control={item.id}
                      aria-expanded={item.children ? openMenus[index + 1] === item.id : undefined}
                      aria-controls={item.children ? 'fl-menu-' + item.id : undefined}
                      disabled={!item.enabled}
                      title={item.unavailableReason && label(item.unavailableReason)}
                      onClick={() => activate(item)}
                    >
                      <span>{label(item.label)}</span>
                      {item.children && <FluentIcon name="chevron" />}
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
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
              if (ownerPanel) {
                setPanelId(ownerPanel.id)
                setMobilePane('task')
              }
            }
          }}
          onSubNodeDoubleClick={({ targetControlId, boundary, id, surfaceName }) => {
            if (boundary !== undefined) {
              dispatch({ type: 'SET_HIGHLIGHTED_BOUNDARY', boundary })
            }
            const target = controlById.get(targetControlId)
            if (!target) return
            const dialog = target.dialogId && dialogById.get(target.dialogId)
            if (surfaceName && dialog) dispatch({ type: 'LOAD_SURFACE', name: surfaceName, dialog })
            activate(target, false, id, surfaceName)
          }}
          onDisplayMesh={(surfaceName) => {
            if (surfaceName) {
              dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'contours-surfaces', value: surfaceName })
              dispatch({ type: 'DISPLAY_RESULT', tab: 'contours' })
            } else {
              dispatch({ type: 'DISPLAY_MESH' })
            }
          }}
        />

        <section className="fluent-task-pane" aria-label={label('Task Page')} data-fluent-control={panel.id} tabIndex={-1}>
          <div className="fluent-pane-title">{label('Task Page')}</div>
          <div className="fluent-task-scroll">
            <h2>{label(panel.title)}</h2>
            {panel.id === 'models-panel' && (
              <div className="fluent-task-table-head">
                <span>{language === 'en' ? 'Model' : language === 'zh' ? '模型' : 'Model · 模型'}</span>
                <span>{label('Status')}</span>
              </div>
            )}
            {panel.id === 'boundary-panel' && (
              <div className="fluent-task-filter-row">
                <input
                  type="search"
                  value={boundaryFilter}
                  onChange={(event) => setBoundaryFilter(event.target.value)}
                  placeholder={label('Filter Zones…')}
                  aria-label={label('Filter Zones…')}
                />
              </div>
            )}
            {(() => {
              const zoneQuery = panel.id === 'boundary-panel' ? boundaryFilter.trim().toLowerCase() : ''
              const renderGroup = (group: (typeof panel)['groups'][number], extraClass = '') => {
                const visibleControls = group.controls.filter((control) => {
                  if (!isDialogControlVisible(control, { id: panel.id, controls: group.controls }, simState)) return false
                  if (!zoneQuery) return true
                  return (
                    control.label.toLowerCase().includes(zoneQuery) ||
                    label(control.label).toLowerCase().includes(zoneQuery) ||
                    group.title.toLowerCase().includes(zoneQuery)
                  )
                })
                if (zoneQuery && visibleControls.length === 0) return null
                return (
                  <fieldset className={'fluent-task-group' + extraClass} key={group.id}>
                    {group.title !== panel.title && (
                      <legend>{label(group.title)}</legend>
                    )}
                    <div className="fluent-controls-stack">
                      {visibleControls.map((control) => (
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
                )
              }

              if (panel.id === 'general-panel') {
                const meshGroup = panel.groups.find((g) => g.id === 'general-mesh')
                const solverGroup = panel.groups.find((g) => g.id === 'general-solver')
                const timeGroup = panel.groups.find((g) => g.id === 'general-time')
                const otherGroups = panel.groups.filter((g) => !['general-mesh', 'general-solver', 'general-time'].includes(g.id))
                return (
                  <>
                    {meshGroup && renderGroup(meshGroup, ' fluent-general-mesh-group')}
                    {(solverGroup || timeGroup) && (
                      <div className="fluent-general-solver-grid">
                        {solverGroup && renderGroup(solverGroup)}
                        {timeGroup && renderGroup(timeGroup)}
                      </div>
                    )}
                    {otherGroups.map((group) => renderGroup(group))}
                  </>
                )
              }

              return panel.groups.map((group) => renderGroup(group))
            })()}
          </div>
        </section>

        <div className="fluent-graphics-stack">
          <FluentViewport
            activeControlId={activeControlId}
            label={label}
            simState={simState}
            onInspect={(control) => inspect(control)}
            onSelectTab={(tab) => dispatch({ type: 'SET_VIEWPORT_TAB', tab })}
            onSelectCameraPreset={(preset) =>
              dispatch({ type: 'SET_CAMERA_PRESET', preset })
            }
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
          prerequisites={prerequisites}
          explanation={explanation}
          controlById={controlById}
          label={label}
          visible={showGuide}
          inspectorTab={inspectorTab}
          onSelectInspectorTab={setInspectorTab}
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
          onApplyDialog={(dialog) => {
            if (dialog.id === 'multiphase-model-dialog') dispatch({ type: 'SET_EULERIAN_REGIME_APPLIED' })
            if (dialog.id === 'dpm-injection-dialog') {
              if (!getControlValue(simState, 'dpm-injection-name', 'injection-1').trim()) return 'Enter an injection name.'
              dispatch({ type: 'SET_CONTROL_VALUE', controlId: 'dpm-injection-save', value: true })
              return
            }
            const kind = dialog.id === 'report-definition-dialog' ? 'definition'
              : dialog.id === 'report-plot-editor-dialog' ? 'plot'
                : dialog.id === 'report-file-editor-dialog' ? 'file' : undefined
            if (kind) {
              const error = validateReport(simState, kind)
              if (error) return error
              dispatch({ type: 'SAVE_REPORT', kind })
            } else {
              dispatch(dialog.fileOperation ? { type: 'RUN_FILE_OPERATION', dialog }
                : { type: 'APPLY_DIALOG', dialogTitle: label(dialog.title) })
            }
          }}
          onCloseTopDialog={closeTopDialog}
          onMoveDialog={(index, x, y) =>
            setDialogs((items) =>
              items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, x, y } : item,
              ),
            )
          }
          onSelectTab={selectDialogTab}
          onQuickOpenEnergy={openEnergyFromDialog}
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
        {simState.sessionFiles.case && <span>Case: {simState.sessionFiles.case}</span>}
        {simState.sessionFiles.mesh && <span>Mesh file: {simState.sessionFiles.mesh}</span>}
        {simState.sessionFiles.data && <span>Data: {simState.sessionFiles.data}</span>}
        <span>
          Status:{' '}
          {simState.runCalculation.hasCalculated
            ? 'Teaching run complete'
            : simState.initialization.isInitialized
              ? 'Initialized'
              : 'Not Initialized'}
        </span>
        <Link className="fluent-status-link" to="/fluent-meshing">
          {label('Switch to Meshing')} →
        </Link>
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
                本界面为<strong>个人 CFD 学习专用教学复刻工作台</strong>，用于熟悉 Fluent 窗口结构、菜单路径、选项卡联动与常见报错排查。
              </p>
              <ul>
                <li>无真实 CFD 数值求解器或网格划分内核，残差/云图/报告均为教学示例；</li>
                <li>不使用任何 Ansys / Fluent 官方商标 Logo 与版权截图资产；</li>
                <li>所有控件均配有中文教学解释与站内 CFD 计算器联动。</li>
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
  isAvailable,
  onInspect,
  onLocate,
  onOpenTroubleshoot,
  onRunTui,
}: {
  label: FluentLabel
  isAvailable: (control: FluentMockControl) => boolean
  onInspect: () => void
  onLocate: (control: FluentMockControl, locate: true) => void
  onOpenTroubleshoot: () => void
  onRunTui: (command: string) => void
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  const matches = tokens.length
    ? searchEntries
        .filter((entry) => {
          if (entry.kind === 'control' && !isAvailable(entry.control)) return false
          return tokens.every((token) => entry.tokensText.includes(token))
        })
        .sort((a, b) => {
          const aExact = tokens.some((t) => a.title.toLowerCase() === t || a.title.toLowerCase().startsWith(t))
          const bExact = tokens.some((t) => b.title.toLowerCase() === t || b.title.toLowerCase().startsWith(t))
          return Number(bExact) - Number(aExact)
        })
        .slice(0, 10)
    : []

  const clampedIndex = matches.length > 0 ? Math.min(activeIndex, matches.length - 1) : 0

  function selectMatch(entry: WorkbenchSearchEntry) {
    setQuery('')
    setOpen(false)
    setActiveIndex(0)
    if (entry.kind === 'control') {
      onLocate(entry.control, true)
    } else if (entry.kind === 'troubleshoot') {
      onOpenTroubleshoot()
    } else {
      onRunTui(entry.command)
    }
  }

  return (
    <form
      className="fluent-quick-search"
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open && tokens.length) {
          event.stopPropagation()
          setOpen(false)
          return
        }
        if (event.key === 'ArrowDown' && open && matches.length > 0) {
          event.preventDefault()
          setActiveIndex((prev) => (prev + 1) % matches.length)
          return
        }
        if (event.key === 'ArrowUp' && open && matches.length > 0) {
          event.preventDefault()
          setActiveIndex((prev) => (prev - 1 + matches.length) % matches.length)
        }
      }}
      onSubmit={(event) => {
        event.preventDefault()
        if (open && matches[clampedIndex]) selectMatch(matches[clampedIndex])
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
            setActiveIndex(0)
          }}
        />
      </label>
      {open && tokens.length > 0 && (
        <div className="fluent-search-results">
          {matches.length === 0 && (
            <p role="status">{label('No matching controls')}</p>
          )}
          {matches.map((entry, idx) => (
            <button
              type="button"
              key={entry.id}
              aria-label={entry.kind === 'control' ? label(entry.title) : entry.title}
              aria-selected={idx === clampedIndex}
              aria-describedby={'search-location-' + entry.id}
              className={idx === clampedIndex ? 'active-hit' : undefined}
              onClick={() => selectMatch(entry)}
            >
              <span>
                {entry.kind !== 'control' && (
                  <em className="fluent-search-hit-badge">
                    {entry.kind === 'tui' ? 'TUI' : '排查'}
                  </em>
                )}
                {entry.kind === 'control' ? label(entry.title) : entry.title}
              </span>
              <small id={'search-location-' + entry.id}>
                {entry.kind === 'control' ? label(entry.location) : entry.location}
              </small>
            </button>
          ))}
        </div>
      )}
    </form>
  )
}
