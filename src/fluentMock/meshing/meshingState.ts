import type { ConsoleEntry } from '../state/fluentSimState'
import { faultTolerantWorkflowSteps, taskForMode, visibleWatertightSteps, watertightWorkflowSteps } from './meshingData'
import type {
  FluentDimension,
  FluentLauncherConfig,
  FluentLauncherPreferences,
  MeshingToSolutionHandoff,
} from '../state/fluentWorkbenchBridge'
import type {
  MeshingBoundaryHighlight,
  MeshingBoundaryRow,
  MeshingLocalSizingItem,
  MeshingLocalSizingType,
  MeshingRegionRow,
  MeshingTaskId,
  MeshingViewportTab,
  MeshingWorkflowMode,
} from './meshingTypes'

export interface FluentMeshingState {
  dimension: FluentDimension
  doublePrecision: boolean
  processes: number
  workflowMode: MeshingWorkflowMode
  activeTaskId: MeshingTaskId
  completedTasks: MeshingTaskId[]
  skippedTasks: MeshingTaskId[]
  viewportTab: MeshingViewportTab
  highlightedZone: MeshingBoundaryHighlight
  selectionFilter: 'all' | 'faces' | 'zones' | 'regions'
  cutPlaneEnabled: boolean
  cutPlanePosition: number
  faultTolerant: {
    capOpenings: boolean
    closeLeaks: boolean
    capName: string
    capType: 'inlet' | 'outlet' | 'wall'
    capOpening: string
    caps: Array<{ name: string; opening: string; type: string }>
    regionName: string
    regionType: 'fluid' | 'solid' | 'void'
    x: string
    y: string
    z: string
    maxLeakageSize: string
    leakagePreview: number | null
  }
  importGeometry: {
    sourceType: 'cad-file' | 'spaceclaim' | 'designmodeler'
    fileName: string
    lengthUnit: 'mm' | 'm' | 'in'
    featureAngle: string
    imported: boolean
  }
  localSizingForm: {
    name: string
    sizingType: MeshingLocalSizingType
    targetSize: string
    growthRate: string
    scope: string
  }
  localSizings: MeshingLocalSizingItem[]
  surfaceMesh: {
    minSize: string
    maxSize: string
    growthRate: string
    sizeFunctions: 'curvature-and-proximity' | 'curvature' | 'proximity' | 'uniform'
    curvatureNormalAngle: string
    cellsPerGap: string
    generated: boolean
    faceCount: number
    maxSkewness: number
  }
  describeGeometry: {
    geometryType: 'fluid-only' | 'fluid-and-solid' | 'solid-only'
    shareTopology: 'yes' | 'no'
    capOpenings: boolean
    applyMultizone: boolean
  }
  capping: {
    enabled: boolean
    name: string
    zoneType: string
    capType: 'single' | 'annular'
    selectBy: 'Label' | 'Zone'
    opening: string
    checkIntersection: boolean
    maxEdges: string
    caps: MeshingBoundaryRow[]
  }
  multizone: {
    enabled: boolean
    form: {
      regionId: string
      method: 'Standard' | 'Thin'
      fill: 'Hex-Pave' | 'Hex-Map' | 'Prism' | 'Mixed'
      sweepSize: string
    }
    controls: Record<string, FluentMeshingState['multizone']['form']>
    selected: string[]
    nonConformal: boolean
    qualityLimit: string
    scaleFactor: string
  }
  shareTopologyApplied: boolean
  boundaries: MeshingBoundaryRow[]
  regions: MeshingRegionRow[]
  boundaryLayers: {
    enabled: boolean
    offsetMethod: 'smooth-transition' | 'uniform' | 'last-ratio' | 'aspect-ratio'
    numberOfLayers: string
    transitionRatio: string
    growthRate: string
    firstHeight: string
    aspectRatio: string
    growOn: 'selected-labels' | 'only-walls' | 'all-zones'
  }
  volumeMesh: {
    fillWith: 'poly-hexcore' | 'polyhedra' | 'tetrahedral' | 'hexcore'
    bufferLayers: string
    peelLayers: string
    maxCellLength: string
    growthRate: string
    generated: boolean
    cellCount: number
    minOrthogonalQuality: number
    maxAspectRatio: number
    maxSkewness: number
  }
  improveMesh: {
    targetOrthogonalQuality: string
    iterations: string
    improved: boolean
  }
  consoleLogs: ConsoleEntry[]
  nextLogId: number
}

export type FluentMeshingAction =
  | { type: 'SELECT_TASK'; taskId: MeshingTaskId }
  | { type: 'UPDATE_FAULT_FORM'; patch: Partial<Omit<FluentMeshingState['faultTolerant'], 'caps' | 'leakagePreview'>> }
  | { type: 'RUN_FAULT_TASK'; taskId: 'ft-describe' | 'ft-capping' | 'ft-identify' | 'ft-leakage' }
  | { type: 'ADD_FAULT_CAP' }
  | { type: 'PREVIEW_LEAKAGES' }
  | { type: 'SET_VIEWPORT_TAB'; tab: MeshingViewportTab }
  | { type: 'SET_HIGHLIGHTED_ZONE'; zone: MeshingBoundaryHighlight }
  | { type: 'SET_SELECTION_FILTER'; filter: FluentMeshingState['selectionFilter'] }
  | { type: 'TOGGLE_CUT_PLANE'; enabled?: boolean }
  | { type: 'SET_CUT_PLANE_POSITION'; position: number }
  | {
      type: 'UPDATE_IMPORT_GEOMETRY'
      patch: Partial<FluentMeshingState['importGeometry']>
    }
  | { type: 'RUN_IMPORT_GEOMETRY' }
  | {
      type: 'UPDATE_LOCAL_SIZING_FORM'
      patch: Partial<FluentMeshingState['localSizingForm']>
    }
  | { type: 'ADD_LOCAL_SIZING' }
  | { type: 'REMOVE_LOCAL_SIZING'; id: string }
  | {
      type: 'UPDATE_SURFACE_MESH_FORM'
      patch: Partial<FluentMeshingState['surfaceMesh']>
    }
  | { type: 'RUN_SURFACE_MESH' }
  | {
      type: 'UPDATE_DESCRIBE_GEOMETRY'
      patch: Partial<FluentMeshingState['describeGeometry']>
    }
  | { type: 'APPLY_DESCRIBE_GEOMETRY' }
  | { type: 'UPDATE_WATERTIGHT_CAP'; patch: Partial<FluentMeshingState['capping']> }
  | { type: 'ADD_WATERTIGHT_CAP' }
  | { type: 'APPLY_WATERTIGHT_CAPS' }
  | { type: 'UPDATE_MULTIZONE'; patch: Partial<FluentMeshingState['multizone']> }
  | { type: 'SAVE_MULTIZONE_CONTROL' }
  | { type: 'RUN_MULTIZONE_MESH' }
  | { type: 'RUN_SHARE_TOPOLOGY' }
  | { type: 'UPDATE_BOUNDARY_TYPE'; id: string; boundaryType: string }
  | { type: 'APPLY_UPDATE_BOUNDARIES' }
  | { type: 'UPDATE_REGION_TYPE'; id: string; regionType: MeshingRegionRow['type'] }
  | { type: 'APPLY_UPDATE_REGIONS' }
  | {
      type: 'UPDATE_BOUNDARY_LAYERS_FORM'
      patch: Partial<FluentMeshingState['boundaryLayers']>
    }
  | { type: 'APPLY_BOUNDARY_LAYERS' }
  | {
      type: 'UPDATE_VOLUME_MESH_FORM'
      patch: Partial<FluentMeshingState['volumeMesh']>
    }
  | { type: 'RUN_VOLUME_MESH' }
  | {
      type: 'UPDATE_IMPROVE_FORM'
      patch: Partial<FluentMeshingState['improveMesh']>
    }
  | { type: 'RUN_IMPROVE_VOLUME_MESH' }
  | { type: 'REVERT_TASK'; taskId: MeshingTaskId }
  | { type: 'APPEND_CONSOLE'; entries: Array<Omit<ConsoleEntry, 'id'>> }
  | { type: 'CLEAR_CONSOLE' }
  | { type: 'RESET_WORKFLOW' }

const watertightTasks = watertightWorkflowSteps.map((step) => step.id)
const faultTolerantTasks = faultTolerantWorkflowSteps.map((step) => step.id)

export function availableMeshingSteps(state: FluentMeshingState) {
  if (state.workflowMode === 'fault-tolerant') {
    return faultTolerantWorkflowSteps.filter(({ id }) =>
      (id !== 'ft-capping' && id !== 'ft-leakage') ||
      (state.completedTasks.includes('ft-describe') && !state.skippedTasks.includes(id)))
  }
  const geometryDescribed = state.completedTasks.includes('wm-describe-geometry')
  return visibleWatertightSteps(
    state.multizone.enabled && geometryDescribed,
    state.completedTasks.includes('wm-multizone-mesh') && state.skippedTasks.includes('wm-volume-mesh'),
    state.capping.enabled && geometryDescribed,
  )
}

type MeshingSessions = { active: MeshingWorkflowMode; sessions: Record<MeshingWorkflowMode, FluentMeshingState> }

export function createMeshingSessions(
  launcher?: Partial<FluentLauncherConfig>,
  prefs?: FluentLauncherPreferences,
): MeshingSessions {
  const active: MeshingWorkflowMode =
    prefs?.startupWorkflow === 'fault-tolerant' ? 'fault-tolerant' : 'watertight'
  const watertight = createInitialMeshingState(launcher, 'watertight')
  const faultTolerant = createInitialMeshingState(launcher, 'fault-tolerant')
  if (prefs) {
    const target = active === 'fault-tolerant' ? faultTolerant : watertight
    target.consoleLogs.push({
      id: target.nextLogId++,
      kind: 'info',
      text: `[Launcher Config] driver=${prefs.graphicsDriver}, mode=${prefs.parallelMode}, gpu=${prefs.gpgpus}, cwd="${prefs.workingDirectory}".`,
    })
  }
  return {
    active,
    sessions: {
      watertight,
      'fault-tolerant': faultTolerant,
    },
  }
}

export function meshingSessionsReducer(
  state: MeshingSessions,
  action: FluentMeshingAction | { type: 'SET_WORKFLOW_MODE'; mode: MeshingWorkflowMode },
): MeshingSessions {
  if (action.type === 'SET_WORKFLOW_MODE') return { ...state, active: action.mode }
  const active = action.type === 'SELECT_TASK' && action.taskId.startsWith('ft-') ? 'fault-tolerant' : state.active
  return {
    active,
    sessions: { ...state.sessions, [active]: fluentMeshingReducer(state.sessions[active], action) },
  }
}

export function createInitialMeshingState(
  launcher?: Partial<FluentLauncherConfig>,
  workflowMode: MeshingWorkflowMode = 'watertight',
): FluentMeshingState {
  const dimension: FluentDimension = launcher?.dimension === '2d' ? '2d' : '3d'
  const doublePrecision = true
  const processes =
    typeof launcher?.processes === 'number' && launcher.processes >= 1
      ? launcher.processes
      : 4

  return {
    dimension,
    doublePrecision,
    processes,
    workflowMode,
    activeTaskId: 'wm-import-geometry',
    completedTasks: [],
    skippedTasks: [],
    viewportTab: 'cad',
    highlightedZone: null,
    selectionFilter: 'all',
    cutPlaneEnabled: true,
    cutPlanePosition: 50,
    faultTolerant: {
      capOpenings: true,
      closeLeaks: true,
      capName: 'inlet-cap',
      capType: 'inlet',
      capOpening: 'elbow-inlet',
      caps: [],
      regionName: 'fluid-domain',
      regionType: 'fluid',
      x: '25',
      y: '0',
      z: '0',
      maxLeakageSize: '1',
      leakagePreview: null,
    },
    importGeometry: {
      sourceType: 'cad-file',
      fileName: workflowMode === 'fault-tolerant' ? 'mixing-elbow-with-gaps.scdoc' : 'mixing-elbow-demo.scdoc',
      lengthUnit: 'mm',
      featureAngle: '40 deg',
      imported: false,
    },
    localSizingForm: {
      name: 'boi-elbow-bend',
      sizingType: 'boi',
      targetSize: '2.5',
      growthRate: '1.2',
      scope: 'elbow-bend-box',
    },
    localSizings: [
      {
        id: 'ls-boi-1',
        name: 'boi-elbow-bend',
        sizingType: 'boi',
        targetSize: '2.5 mm',
        growthRate: '1.2',
        scope: 'elbow-bend-box',
      },
    ],
    surfaceMesh: {
      minSize: '1.2',
      maxSize: '12',
      growthRate: '1.2',
      sizeFunctions: 'curvature-and-proximity',
      curvatureNormalAngle: '18',
      cellsPerGap: '2',
      generated: false,
      faceCount: 6420,
      maxSkewness: 0.64,
    },
    describeGeometry: {
      geometryType: 'fluid-only',
      shareTopology: 'yes',
      capOpenings: false,
      applyMultizone: false,
    },
    capping: {
      enabled: false, name: '', zoneType: 'velocity-inlet', capType: 'single',
      selectBy: 'Label', opening: '', checkIntersection: false, maxEdges: '', caps: [],
    },
    multizone: {
      enabled: false,
      form: { regionId: '', method: 'Standard', fill: 'Hex-Pave', sweepSize: '' },
      controls: {},
      selected: [],
      nonConformal: false,
      qualityLimit: '0.04',
      scaleFactor: '',
    },
    shareTopologyApplied: false,
    boundaries: [
      {
        id: 'mz-velocity-inlet',
        name: 'velocity-inlet',
        type: 'velocity-inlet',
        faceCount: 420,
        boundary: 'inlet',
      },
      {
        id: 'mz-mass-flow-inlet',
        name: 'mass-flow-inlet',
        type: 'mass-flow-inlet',
        faceCount: 280,
        boundary: 'inlet',
      },
      {
        id: 'mz-pressure-outlet',
        name: 'pressure-outlet',
        type: 'pressure-outlet',
        faceCount: 440,
        boundary: 'outlet',
      },
      {
        id: 'mz-wall-heated',
        name: 'wall-heated',
        type: 'wall',
        faceCount: 4160,
        boundary: 'wall',
      },
      {
        id: 'mz-symmetry',
        name: 'symmetry-plane',
        type: 'symmetry',
        faceCount: 1120,
        boundary: 'symmetry',
      },
    ],
    regions: [
      {
        id: 'reg-fluid-domain',
        name: 'fluid-domain',
        type: 'fluid',
        estimatedCells: 48620,
      },
    ],
    boundaryLayers: {
      enabled: true,
      offsetMethod: 'smooth-transition',
      numberOfLayers: '5',
      transitionRatio: '0.272',
      growthRate: '1.2',
      firstHeight: '0.15',
      aspectRatio: '5',
      growOn: 'only-walls',
    },
    volumeMesh: {
      fillWith: 'poly-hexcore',
      bufferLayers: '2',
      peelLayers: '1',
      maxCellLength: '12',
      growthRate: '1.2',
      generated: false,
      cellCount: 48620,
      minOrthogonalQuality: 0.24,
      maxAspectRatio: 38.4,
      maxSkewness: 0.78,
    },
    improveMesh: {
      targetOrthogonalQuality: '0.25',
      iterations: '3',
      improved: false,
    },
    consoleLogs: [
      {
        id: 1,
        kind: 'info',
        text: `[Teaching Demo] Fluent Meshing [${dimension}, ${doublePrecision ? 'dp' : 'sp'}, np=${processes}] ready.`,
      },
      {
        id: 2,
        kind: 'info',
        text: 'Watertight Geometry Workflow initialized. Start from Step 1: Import Geometry.',
      },
    ],
    nextLogId: 3,
  }
}

function appendMeshingLogs(
  state: FluentMeshingState,
  entries: Array<Omit<ConsoleEntry, 'id'>>,
): Pick<FluentMeshingState, 'consoleLogs' | 'nextLogId'> {
  let id = state.nextLogId
  const appended = entries.map((entry) => ({
    ...entry,
    id: id++,
  }))
  return {
    consoleLogs: [...state.consoleLogs, ...appended].slice(-80),
    nextLogId: id,
  }
}

function completeAndAdvance(
  state: FluentMeshingState,
  taskId: MeshingTaskId,
): Pick<FluentMeshingState, 'completedTasks' | 'skippedTasks' | 'activeTaskId'> {
  const completedTasks = state.completedTasks.includes(taskId)
    ? state.completedTasks
    : [...state.completedTasks, taskId]
  const skippedTasks = state.skippedTasks.filter((id) => id !== taskId)

  const sequence = state.workflowMode === 'fault-tolerant' ? faultTolerantTasks
    : visibleWatertightSteps(state.multizone.enabled, false, state.capping.enabled).map((step) => step.id)
  const currentIdx = sequence.indexOf(taskId)
  let nextTask: MeshingTaskId = taskId
  for (let i = currentIdx + 1; i < sequence.length; i++) {
    const candidate = sequence[i]
    if (!skippedTasks.includes(candidate)) {
      nextTask = candidate
      break
    }
  }
  return {
    completedTasks,
    skippedTasks,
    activeTaskId: nextTask,
  }
}

function invalidateMeshProgress(state: FluentMeshingState, taskId: MeshingTaskId): FluentMeshingState {
  const sequence = state.workflowMode === 'fault-tolerant' ? faultTolerantTasks : watertightTasks
  const changedAt = sequence.indexOf(taskId)
  const keepSurface = sequence.indexOf('wm-surface-mesh') < changedAt
  const resetMultizone = state.workflowMode === 'watertight' && changedAt <= sequence.indexOf('wm-multizone-mesh')
  return {
    ...state,
    completedTasks: state.completedTasks.filter((id) => sequence.indexOf(id) < changedAt),
    skippedTasks: resetMultizone ? state.skippedTasks.filter((id) => id !== 'wm-volume-mesh') : state.skippedTasks,
    surfaceMesh: { ...state.surfaceMesh, generated: keepSurface && state.surfaceMesh.generated },
    volumeMesh: { ...state.volumeMesh, generated: false },
    improveMesh: { ...state.improveMesh, improved: false },
    viewportTab: keepSurface && state.surfaceMesh.generated ? 'surface-mesh' : 'cad',
  }
}

export function surfaceSizingOptions(sizeFunctions: FluentMeshingState['surfaceMesh']['sizeFunctions']) {
  return {
    curvature: sizeFunctions.includes('curvature'),
    proximity: sizeFunctions.includes('proximity'),
  }
}

function computeSurfaceMetrics(state: FluentMeshingState) {
  const minVal = Math.max(0.2, Number.parseFloat(state.surfaceMesh.minSize) || 1.2)
  const maxVal = Math.max(minVal + 0.5, Number.parseFloat(state.surfaceMesh.maxSize) || 12)
  const sizingBoost = state.localSizings.length * 1450
  const functionBonus =
    state.surfaceMesh.sizeFunctions === 'curvature-and-proximity'
      ? 1100
      : state.surfaceMesh.sizeFunctions === 'uniform'
        ? -400
        : 500
  const faceCount = Math.max(
    1800,
    Math.round((24000 / Math.sqrt(minVal * maxVal)) + sizingBoost + functionBonus),
  )
  const maxSkewness = Number(
    Math.min(0.85, Math.max(0.42, 0.72 - state.localSizings.length * 0.03)).toFixed(2),
  )
  return { faceCount, maxSkewness }
}

function computeVolumeMetrics(state: FluentMeshingState) {
  const layers = state.boundaryLayers.enabled
    ? Number(state.boundaryLayers.numberOfLayers)
    : 0
  const baseFaces = state.surfaceMesh.faceCount
  const methodMultiplier: Record<FluentMeshingState['volumeMesh']['fillWith'], number> = {
    'poly-hexcore': 5.6,
    polyhedra: 4.8,
    tetrahedral: 11.4,
    hexcore: 6.4,
  }
  const regionMultiplier = state.regions.filter((region) => region.type !== 'dead').length > 1 ? 1.22 : 1
  const cellCount = Math.round(
    (baseFaces * methodMultiplier[state.volumeMesh.fillWith] + layers * 1950) *
      regionMultiplier,
  )
  const baseOrtho: Record<FluentMeshingState['volumeMesh']['fillWith'], number> = {
    'poly-hexcore': 0.27,
    polyhedra: 0.29,
    tetrahedral: 0.19,
    hexcore: 0.24,
  }
  const minOrthogonalQuality = Number(
    Math.min(0.45, baseOrtho[state.volumeMesh.fillWith]).toFixed(2),
  )
  const maxAspectRatio = state.boundaryLayers.enabled ? 36.2 + layers * 1.4 : 11.5
  const maxSkewness =
    state.volumeMesh.fillWith === 'tetrahedral' ? 0.84 : 0.73

  return {
    cellCount,
    minOrthogonalQuality,
    maxAspectRatio: Number(maxAspectRatio.toFixed(1)),
    maxSkewness,
  }
}

function validateBoundaryLayers(settings: FluentMeshingState['boundaryLayers']) {
  if (!settings.enabled) return
  const layers = Number(settings.numberOfLayers)
  if (!Number.isSafeInteger(layers) || layers < 1) return 'Enter a positive whole number of boundary layers.'
  const growth = Number(settings.growthRate)
  if (!Number.isFinite(growth) || growth <= 0) return 'Enter a finite, positive boundary layer growth rate.'
  const [input, label] = settings.offsetMethod === 'smooth-transition' ? [settings.transitionRatio, 'Transition Ratio']
    : settings.offsetMethod === 'aspect-ratio' ? [settings.aspectRatio, 'First Aspect Ratio']
      : [settings.firstHeight, 'First Height']
  if (!Number.isFinite(Number(input)) || Number(input) <= 0) return `Enter a finite, positive ${label}.`
}

export function buildMeshingToSolutionHandoff(
  state: FluentMeshingState,
): MeshingToSolutionHandoff {
  return {
    fromMeshing: true,
    meshType: state.completedTasks.includes('wm-multizone-mesh') && state.skippedTasks.includes('wm-volume-mesh')
      ? 'multizone' : state.volumeMesh.fillWith,
    cellCount: state.volumeMesh.cellCount,
    surfaceFaceCount: state.surfaceMesh.faceCount,
    minOrthogonalQuality: state.volumeMesh.minOrthogonalQuality,
    maxSkewness: state.volumeMesh.maxSkewness,
    boundaryLayers: state.boundaryLayers.enabled
      ? Number(state.boundaryLayers.numberOfLayers)
      : 0,
    dimension: state.dimension,
    doublePrecision: state.doublePrecision,
    processes: state.processes,
    boundarySummary: state.boundaries.map((row) => ({
      name: row.name,
      type: row.type,
    })),
  }
}

export function fluentMeshingReducer(
  state: FluentMeshingState,
  action: FluentMeshingAction,
): FluentMeshingState {
  const isFaultTolerant = state.workflowMode === 'fault-tolerant'
  const warn = (text: string, taskId = state.activeTaskId): FluentMeshingState => ({
    ...state,
    activeTaskId: taskId,
    ...appendMeshingLogs(state, [{ kind: 'warning', text }]),
  })
  switch (action.type) {
    case 'SELECT_TASK': {
      const taskId = taskForMode(action.taskId, isFaultTolerant)
      if (availableMeshingSteps(state).some((step) => step.id === taskId)) return { ...state, activeTaskId: taskId }
      if (taskId === 'ft-capping' || taskId === 'ft-leakage') {
        return warn('Set the corresponding option in Describe Geometry and Flow to open this task.', 'ft-describe')
      }
      if (taskId === 'wm-capping' || taskId === 'wm-multizone-controls' || taskId === 'wm-multizone-mesh') {
        return warn('Set the corresponding option in Describe Geometry to open this task.',
          isFaultTolerant ? 'ft-describe' : 'wm-describe-geometry')
      }
      if (taskId === 'wm-volume-mesh' && state.skippedTasks.includes(taskId)) {
        return warn('Multizone replaces the ordinary volume mesh when all regions are covered.', 'wm-multizone-mesh')
      }
      return state
    }

    case 'UPDATE_FAULT_FORM':
      if (!isFaultTolerant) return state
      return {
        ...state,
        faultTolerant: { ...state.faultTolerant, ...action.patch, leakagePreview: null },
      }

    case 'ADD_FAULT_CAP': {
      if (!isFaultTolerant) return state
      if (!state.completedTasks.includes('ft-describe')) return warn('Describe Geometry and Flow before adding caps.', 'ft-describe')
      const { capName, capType, capOpening, caps } = state.faultTolerant
      if (!capName.trim()) return warn('Enter a cap name.')
      const cap = { name: capName.trim(), opening: capOpening, type: capType }
      if (caps.some((row) => row.opening !== capOpening && row.name === cap.name) ||
        state.boundaries.some((row) => !row.id.startsWith('mz-cap-') && row.name === cap.name)) {
        return warn('Choose a unique cap name.')
      }
      return {
        ...state,
        faultTolerant: { ...state.faultTolerant, caps: [...caps.filter((row) => row.opening !== capOpening), cap] },
        ...appendMeshingLogs(state, [{ kind: 'success', text: `[Teaching Demo] Added ${cap.type} cap "${cap.name}" at ${cap.opening}.` }]),
      }
    }

    case 'PREVIEW_LEAKAGES': {
      if (!isFaultTolerant) return state
      if (!state.completedTasks.includes('ft-identify')) return warn('Identify Regions before previewing leakages.', 'ft-identify')
      const size = Number(state.faultTolerant.maxLeakageSize)
      if (!Number.isFinite(size) || size <= 0) return warn('Maximum Leakage Size must be positive.')
      const count = [0.4, 2.2].filter((gap) => gap <= size).length
      return {
        ...state,
        faultTolerant: { ...state.faultTolerant, leakagePreview: count },
        ...appendMeshingLogs(state, [{ kind: 'output', text: `[Teaching Demo] Leakage preview: ${count} example gap(s) at or below ${size} mm.` }]),
      }
    }

    case 'RUN_FAULT_TASK': {
      if (!isFaultTolerant) return state
      const { taskId } = action
      const form = state.faultTolerant
      const hasCompleted = (id: MeshingTaskId) => state.completedTasks.includes(id) || state.skippedTasks.includes(id)
      let text: string
      let regions = state.regions
      let boundaries = state.boundaries
      let next = state
      if (taskId === 'ft-describe') {
        if (!state.importGeometry.imported) return warn('Import Geometry before describing the flow.', 'wm-import-geometry')
        const conditional = [
          ['ft-capping', form.capOpenings],
          ['ft-leakage', form.closeLeaks],
        ] as const
        const skippedTasks: MeshingTaskId[] = state.skippedTasks.filter((id) => id !== 'ft-capping' && id !== 'ft-leakage')
        skippedTasks.push(...conditional.filter(([, enabled]) => !enabled).map(([id]) => id))
        next = { ...state, skippedTasks }
        boundaries = boundaries.filter((row) => !row.id.startsWith('mz-cap-'))
        text = `Internal flow: capping ${form.capOpenings ? 'enabled' : 'skipped'}, leakage closing ${form.closeLeaks ? 'enabled' : 'skipped'}.`
      } else if (taskId === 'ft-capping') {
        if (!hasCompleted('ft-describe')) return warn('Describe Geometry and Flow first.', 'ft-describe')
        if (!form.caps.length) return warn('Add at least one cap before updating the capping task.')
        boundaries = [
          ...boundaries.filter((row) => !row.id.startsWith('mz-cap-')),
          ...form.caps.map((cap): MeshingBoundaryRow => ({
            id: 'mz-cap-' + cap.opening,
            name: cap.name,
            boundary: cap.type === 'outlet' ? 'outlet' : cap.type === 'wall' ? 'wall' : 'inlet',
            type: cap.type === 'outlet' ? 'pressure-outlet' : cap.type === 'wall' ? 'wall' : 'velocity-inlet',
            faceCount: 0,
          })),
        ]
        text = `${form.caps.length} cap(s) applied to the demo geometry.`
      } else if (taskId === 'ft-identify') {
        if (!hasCompleted('ft-describe')) return warn('Describe Geometry and Flow first.', 'ft-describe')
        if (!hasCompleted('ft-capping')) return warn('Complete or skip Enclose Fluid Regions first.', 'ft-capping')
        const name = form.regionName.trim()
        if (!name || [form.x, form.y, form.z].some((value) => !value.trim() || !Number.isFinite(Number(value)))) {
          return warn('Enter a region name and numeric X, Y and Z coordinates.')
        }
        regions = [{
          id: 'reg-ft-identified',
          name,
          type: form.regionType === 'void' ? 'dead' : form.regionType,
          estimatedCells: form.regionType === 'void' ? 0 : form.regionType === 'solid' ? 14200 : 48620,
        }]
        text = `Identified ${form.regionType} region "${name}" at (${form.x}, ${form.y}, ${form.z}) mm.`
      } else {
        if (!hasCompleted('ft-identify')) return warn('Identify Regions before defining a leakage threshold.', 'ft-identify')
        const preview = fluentMeshingReducer(state, { type: 'PREVIEW_LEAKAGES' })
        const count = preview.faultTolerant.leakagePreview
        if (count === null) return preview
        next = preview
        text = `Applied ${form.maxLeakageSize} mm leakage threshold to "${form.regionName}" (${count} sample gap(s)).`
      }
      next = invalidateMeshProgress(next, taskId)
      return {
        ...next,
        ...completeAndAdvance(next, taskId),
        regions,
        boundaries,
        ...appendMeshingLogs(next, [{ kind: 'success', text: '[Teaching Demo] ' + text }]),
      }
    }

    case 'SET_VIEWPORT_TAB':
      return {
        ...state,
        viewportTab: action.tab,
      }

    case 'SET_HIGHLIGHTED_ZONE':
      return {
        ...state,
        highlightedZone: action.zone,
      }

    case 'SET_SELECTION_FILTER':
      return {
        ...state,
        selectionFilter: action.filter,
      }

    case 'TOGGLE_CUT_PLANE':
      return {
        ...state,
        cutPlaneEnabled: action.enabled ?? !state.cutPlaneEnabled,
      }

    case 'SET_CUT_PLANE_POSITION':
      return {
        ...state,
        cutPlanePosition: Math.max(10, Math.min(90, action.position)),
      }

    case 'UPDATE_IMPORT_GEOMETRY':
      return {
        ...state,
        importGeometry: { ...state.importGeometry, ...action.patch },
      }

    case 'RUN_IMPORT_GEOMETRY': {
      const next = invalidateMeshProgress(state, 'wm-import-geometry')
      const progress = completeAndAdvance(next, 'wm-import-geometry')
      return {
        ...next,
        ...progress,
        viewportTab: 'cad',
        skippedTasks: [],
        shareTopologyApplied: false,
        ...(isFaultTolerant ? {
          boundaries: state.boundaries.filter((row) => !row.id.startsWith('mz-cap-')),
          faultTolerant: { ...state.faultTolerant, caps: [], leakagePreview: null },
        } : {}),
        importGeometry: { ...state.importGeometry, imported: true },
        ...appendMeshingLogs(state, [
          {
            kind: 'command',
            text: `> /file/import/cad "${state.importGeometry.fileName}" (${state.importGeometry.lengthUnit})`,
          },
          {
            kind: 'success',
            text: `[Teaching Demo] Imported CAD geometry (${state.importGeometry.fileName}), feature angle = ${state.importGeometry.featureAngle}. 5 face zones detected.`,
          },
        ]),
      }
    }

    case 'UPDATE_LOCAL_SIZING_FORM':
      return {
        ...state,
        localSizingForm: { ...state.localSizingForm, ...action.patch },
      }

    case 'ADD_LOCAL_SIZING': {
      const name = state.localSizingForm.name.trim() || `local-size-${state.localSizings.length + 1}`
      const targetRaw = state.localSizingForm.targetSize.trim() || '2.0'
      const targetSize = targetRaw.includes('mm') ? targetRaw : `${targetRaw} mm`
      const nextItem: MeshingLocalSizingItem = {
        id: `ls-${Date.now()}-${state.localSizings.length + 1}`,
        name,
        sizingType: state.localSizingForm.sizingType,
        targetSize,
        growthRate: state.localSizingForm.growthRate || '1.2',
        scope: state.localSizingForm.scope || 'elbow-bend-box',
      }
      const progress = completeAndAdvance(state, 'wm-local-sizing')
      return {
        ...state,
        ...progress,
        viewportTab: 'surface-mesh',
        localSizings: [...state.localSizings, nextItem],
        ...appendMeshingLogs(state, [
          {
            kind: 'success',
            text: `[Teaching Demo] Added Local Sizing "${name}" (${nextItem.sizingType.toUpperCase()}, target=${targetSize}, scope=${nextItem.scope}).`,
          },
        ]),
      }
    }

    case 'REMOVE_LOCAL_SIZING':
      return {
        ...state,
        localSizings: state.localSizings.filter((item) => item.id !== action.id),
      }

    case 'UPDATE_SURFACE_MESH_FORM':
      return {
        ...state,
        surfaceMesh: { ...state.surfaceMesh, ...action.patch },
      }

    case 'RUN_SURFACE_MESH': {
      if (!state.importGeometry.imported) return warn('Import Geometry before generating the surface mesh.', 'wm-import-geometry')
      if (isFaultTolerant && !state.completedTasks.includes('wm-update-regions')) {
        return warn('Update Region Settings before generating the wrapped surface mesh.', 'wm-update-regions')
      }
      const { minSize, maxSize, growthRate, sizeFunctions, curvatureNormalAngle, cellsPerGap } = state.surfaceMesh
      const numeric = (input: string) => Number(input)
      const positive = (input: string) => Number.isFinite(numeric(input)) && numeric(input) > 0
      if (!positive(minSize) || !positive(maxSize) || numeric(maxSize) < numeric(minSize) ||
        !positive(growthRate) || numeric(growthRate) < 1) {
        return warn('Enter positive surface sizes with Maximum Size ≥ Minimum Size and Growth Rate ≥ 1.', 'wm-surface-mesh')
      }
      const { curvature, proximity } = surfaceSizingOptions(sizeFunctions)
      if ((curvature && (!positive(curvatureNormalAngle) || numeric(curvatureNormalAngle) > 180)) ||
        (proximity && !positive(cellsPerGap))) {
        return warn('Check the selected Curvature Normal Angle or Cells Per Gap.', 'wm-surface-mesh')
      }
      const { faceCount, maxSkewness } = computeSurfaceMetrics(state)
      const next = invalidateMeshProgress(state, 'wm-surface-mesh')
      const progress = completeAndAdvance(next, 'wm-surface-mesh')
      return {
        ...next,
        ...progress,
        viewportTab: 'surface-mesh',
        surfaceMesh: {
          ...state.surfaceMesh,
          generated: true,
          faceCount,
          maxSkewness,
        },
        ...appendMeshingLogs(state, [
          { kind: 'command', text: '> /mesh/surface-mesh/generate' },
          {
            kind: 'output',
            text: `Surface mesh sizing: min=${minSize} mm, max=${maxSize} mm, functions=${sizeFunctions}${curvature ? ', angle=' + curvatureNormalAngle + '°' : ''}${proximity ? ', cells/gap=' + cellsPerGap : ''}.`,
          },
          { kind: 'success', text: `[Teaching Demo] Generated ${faceCount.toLocaleString()} ${isFaultTolerant ? 'wrapped ' : ''}surface faces. Max surface skewness = ${maxSkewness}.` },
        ]),
      }
    }

    case 'UPDATE_DESCRIBE_GEOMETRY':
      return {
        ...state,
        describeGeometry: { ...state.describeGeometry, ...action.patch },
      }

    case 'APPLY_DESCRIBE_GEOMETRY': {
      if (!state.surfaceMesh.generated) return warn('Generate the surface mesh before describing the geometry.', 'wm-surface-mesh')
      const next = invalidateMeshProgress(state, 'wm-describe-geometry')
      const needsShare = state.describeGeometry.shareTopology === 'yes'
      const hasSolid = state.describeGeometry.geometryType !== 'fluid-only'
      const needsCapping = hasSolid && state.describeGeometry.capOpenings
      const nextRegions: MeshingRegionRow[] =
        state.describeGeometry.geometryType === 'solid-only'
          ? [{ id: 'reg-pipe-solid', name: 'pipe-wall-solid', type: 'solid', estimatedCells: 14200 }]
          : hasSolid
            ? [
                { id: 'reg-fluid-domain', name: 'fluid-domain', type: 'fluid', estimatedCells: 48620 },
                { id: 'reg-pipe-solid', name: 'pipe-wall-solid', type: 'solid', estimatedCells: 14200 },
              ]
            : [{ id: 'reg-fluid-domain', name: 'fluid-domain', type: 'fluid', estimatedCells: 48620 }]

      const completedTasks = [...next.completedTasks, 'wm-describe-geometry' as MeshingTaskId]
      const skippedTasks: MeshingTaskId[] = needsShare
        ? next.skippedTasks.filter((id) => id !== 'wm-share-topology')
        : next.skippedTasks.includes('wm-share-topology')
          ? next.skippedTasks
          : [...next.skippedTasks, 'wm-share-topology']

      const nextTaskId: MeshingTaskId = needsShare
        ? 'wm-share-topology'
        : needsCapping ? 'wm-capping' : 'wm-update-boundaries'

      return {
        ...next,
        completedTasks,
        skippedTasks,
        activeTaskId: nextTaskId,
        regions: nextRegions,
        capping: { ...state.capping, enabled: needsCapping, caps: [] },
        boundaries: state.boundaries.filter((row) => !row.id.startsWith('wt-cap:')),
        multizone: {
          ...state.multizone,
          enabled: state.describeGeometry.applyMultizone,
          controls: {},
          selected: [],
          form: { ...state.multizone.form, regionId: '' },
        },
        shareTopologyApplied: false,
        ...appendMeshingLogs(state, [
          {
            kind: 'info',
            text: `[Teaching Demo] Geometry described as "${state.describeGeometry.geometryType}", Share Topology = ${state.describeGeometry.shareTopology}. Regions updated (${nextRegions.length}).`,
          },
        ]),
      }
    }

    case 'UPDATE_WATERTIGHT_CAP':
      return { ...state, capping: { ...state.capping, ...action.patch } }

    case 'ADD_WATERTIGHT_CAP': {
      const form = state.capping
      if (!form.enabled || isFaultTolerant) return state
      if (!state.skippedTasks.includes('wm-share-topology') && !state.shareTopologyApplied) {
        return warn('Apply Share Topology before capping.', 'wm-share-topology')
      }
      if (!form.opening) return warn('Select an opening before creating a cap.')
      if (form.maxEdges.trim() && (!Number.isInteger(Number(form.maxEdges)) || Number(form.maxEdges) < 1)) {
        return warn('Enter a positive integer for the maximum cap edge count.')
      }
      const id = 'wt-cap:' + form.opening
      const boundary = form.zoneType.includes('inlet') ? 'inlet' : form.zoneType.includes('outlet') || form.zoneType === 'outflow'
        ? 'outlet' : form.zoneType === 'symmetry' ? 'symmetry' : 'wall'
      const cap = { id, name: form.name.trim() || 'cap-' + form.zoneType, type: form.zoneType, faceCount: 1, boundary } satisfies MeshingBoundaryRow
      return {
        ...invalidateMeshProgress(state, 'wm-capping'),
        capping: { ...form, caps: [...form.caps.filter((row) => row.id !== id), cap] },
        ...appendMeshingLogs(state, [{ kind: 'success', text: `[Teaching Demo] Created ${form.capType} cap "${cap.name}".` }]),
      }
    }

    case 'APPLY_WATERTIGHT_CAPS': {
      if (!state.capping.enabled || isFaultTolerant) return state
      if (!state.skippedTasks.includes('wm-share-topology') && !state.shareTopologyApplied) {
        return warn('Apply Share Topology before capping.', 'wm-share-topology')
      }
      if (!state.capping.caps.length) return warn('Create a cap before updating this task.')
      const next = invalidateMeshProgress(state, 'wm-capping')
      return {
        ...next,
        ...completeAndAdvance(next, 'wm-capping'),
        boundaries: [...state.boundaries.filter((row) => !row.id.startsWith('wt-cap:')), ...state.capping.caps],
        regions: state.regions.some((row) => row.type === 'fluid') ? state.regions
          : [...state.regions, { id: 'reg-enclosed', name: 'enclosed-fluid', type: 'fluid', estimatedCells: 48620 }],
      }
    }

    case 'UPDATE_MULTIZONE':
      return { ...state, multizone: { ...state.multizone, ...action.patch } }

    case 'SAVE_MULTIZONE_CONTROL': {
      if (!state.multizone.enabled) return state
      if (!state.completedTasks.includes('wm-update-regions')) {
        return warn('Confirm the regions before adding Multizone controls.', 'wm-update-regions')
      }
      const form = state.multizone.form
      const region = state.regions.find((row) => row.id === form.regionId && row.type !== 'dead')
      if (!region) return warn('Select an active region for the Multizone control.')
      if (form.sweepSize.trim() && (!Number.isFinite(Number(form.sweepSize)) || Number(form.sweepSize) <= 0)) {
        return warn('Enter a finite, positive maximum sweep size.')
      }
      const next = invalidateMeshProgress(state, 'wm-multizone-controls')
      return {
        ...next,
        ...completeAndAdvance(next, 'wm-multizone-controls'),
        multizone: {
          ...state.multizone,
          controls: { ...state.multizone.controls, [region.id]: form },
          selected: [...new Set([...state.multizone.selected, region.id])],
        },
        ...appendMeshingLogs(state, [{ kind: 'success', text: `[Teaching Demo] Saved Multizone control for ${region.name}.` }]),
      }
    }

    case 'RUN_MULTIZONE_MESH': {
      if (!state.multizone.enabled) return state
      if (!state.completedTasks.includes('wm-multizone-controls')) {
        return warn('Add at least one Multizone control before generation.', 'wm-multizone-controls')
      }
      const { selected, controls, qualityLimit, nonConformal, scaleFactor } = state.multizone
      const activeRegions = state.regions.filter((region) => region.type !== 'dead')
      const covered = activeRegions.filter((region) => selected.includes(region.id) && controls[region.id])
      if (!covered.length) return warn('Select at least one region with a Multizone control.')
      if (!qualityLimit.trim() || !(Number(qualityLimit) >= 0 && Number(qualityLimit) <= 1)) {
        return warn('Enter a quality improve limit between 0 and 1.')
      }
      if (!nonConformal && scaleFactor.trim() && (!Number.isFinite(Number(scaleFactor)) || Number(scaleFactor) <= 0)) {
        return warn('Enter a finite, positive size function scale factor.')
      }
      const layerError = validateBoundaryLayers(state.boundaryLayers)
      if (layerError) return warn(layerError, 'wm-boundary-layers')
      const coversAll = covered.length === activeRegions.length
      const next = invalidateMeshProgress(state, 'wm-multizone-mesh')
      const skippedTasks = coversAll ? [...next.skippedTasks, 'wm-volume-mesh' as const] : next.skippedTasks
      return {
        ...next,
        ...completeAndAdvance({ ...next, skippedTasks }, 'wm-multizone-mesh'),
        ...(coversAll ? {
          volumeMesh: {
            ...next.volumeMesh,
            ...computeVolumeMetrics(state),
            cellCount: covered.reduce((total, region) => total + region.estimatedCells, 0),
            generated: true,
          },
          viewportTab: 'volume-mesh' as const,
          cutPlaneEnabled: true,
        } : {}),
        ...appendMeshingLogs(state, [{
          kind: 'success',
          text: `[Teaching Demo] Multizone mesh configured for ${covered.map((region) => region.name).join(', ')}.${coversAll ? ' All active regions are covered.' : ' Generate the volume mesh for remaining regions.'}`,
        }]),
      }
    }

    case 'RUN_SHARE_TOPOLOGY': {
      if (!state.completedTasks.includes('wm-describe-geometry')) {
        return warn('Describe the geometry before applying Share Topology.', 'wm-describe-geometry')
      }
      if (state.skippedTasks.includes('wm-share-topology')) {
        return warn('Enable Share Topology in Describe Geometry to use this task.', 'wm-describe-geometry')
      }
      const next = invalidateMeshProgress(state, 'wm-share-topology')
      const progress = completeAndAdvance(next, 'wm-share-topology')
      return {
        ...next,
        ...progress,
        shareTopologyApplied: true,
        ...appendMeshingLogs(state, [
          { kind: 'command', text: '> /mesh/share-topology/apply' },
          {
            kind: 'success',
            text: '[Teaching Demo] Share Topology applied across fluid/solid interfaces (conformal shared edges = 12).',
          },
        ]),
      }
    }

    case 'UPDATE_BOUNDARY_TYPE':
      return {
        ...(state.completedTasks.includes('wm-update-boundaries')
          ? invalidateMeshProgress(state, 'wm-update-boundaries') : state),
        boundaries: state.boundaries.map((row) =>
          row.id === action.id ? { ...row, type: action.boundaryType } : row,
        ),
      }

    case 'APPLY_UPDATE_BOUNDARIES': {
      if (isFaultTolerant && !state.surfaceMesh.generated) {
        return warn('Generate the wrapped surface mesh before updating boundaries.', 'wm-surface-mesh')
      }
      if (!isFaultTolerant && !state.completedTasks.includes('wm-describe-geometry')) {
        return warn('Describe the geometry before updating boundaries.', 'wm-describe-geometry')
      }
      if (!isFaultTolerant && !state.skippedTasks.includes('wm-share-topology') && !state.shareTopologyApplied) {
        return warn('Apply the selected Share Topology task before updating boundaries.', 'wm-share-topology')
      }
      if (!isFaultTolerant && state.capping.enabled && !state.completedTasks.includes('wm-capping')) {
        return warn('Complete Enclose Fluid Regions before updating boundaries.', 'wm-capping')
      }
      const next = invalidateMeshProgress(state, 'wm-update-boundaries')
      const progress = completeAndAdvance(next, 'wm-update-boundaries')
      return {
        ...next,
        ...progress,
        ...appendMeshingLogs(state, [
          {
            kind: 'success',
            text: `[Teaching Demo] Updated ${state.boundaries.length} boundary zone types (${state.boundaries.map((b) => `${b.name}:${b.type}`).join(', ')}).`,
          },
        ]),
      }
    }

    case 'UPDATE_REGION_TYPE':
      return {
        ...(state.completedTasks.includes('wm-update-regions')
          ? invalidateMeshProgress(state, 'wm-update-regions') : state),
        regions: state.regions.map((row) =>
          row.id === action.id ? { ...row, type: action.regionType } : row,
        ),
      }

    case 'APPLY_UPDATE_REGIONS': {
      if (isFaultTolerant) {
        if (!state.completedTasks.includes('ft-identify')) return warn('Identify Regions before updating the region settings.', 'ft-identify')
        if (state.faultTolerant.closeLeaks && !state.completedTasks.includes('ft-leakage')) {
          return warn('Define the Leakage Threshold before updating the region settings.', 'ft-leakage')
        }
      }
      if (!isFaultTolerant && !state.completedTasks.includes('wm-update-boundaries')) {
        return warn('Update Boundaries before confirming regions.', 'wm-update-boundaries')
      }
      if (!state.regions.some((region) => region.type !== 'dead')) {
        return warn('Keep at least one fluid or solid region before confirming regions.', 'wm-update-regions')
      }
      const next = invalidateMeshProgress(state, 'wm-update-regions')
      const progress = completeAndAdvance(next, 'wm-update-regions')
      return {
        ...next,
        ...progress,
        ...appendMeshingLogs(state, [
          {
            kind: 'success',
            text: `[Teaching Demo] Regions confirmed: ${state.regions.map((r) => `${r.name} (${r.type})`).join(', ')}.`,
          },
        ]),
      }
    }

    case 'UPDATE_BOUNDARY_LAYERS_FORM':
      return {
        ...(state.volumeMesh.generated || state.completedTasks.includes('wm-boundary-layers')
          ? invalidateMeshProgress(state, 'wm-boundary-layers') : state),
        boundaryLayers: { ...state.boundaryLayers, ...action.patch },
      }

    case 'APPLY_BOUNDARY_LAYERS': {
      const error = validateBoundaryLayers(state.boundaryLayers)
      if (error) return warn(error, 'wm-boundary-layers')
      const next = invalidateMeshProgress(state, 'wm-boundary-layers')
      const progress = completeAndAdvance(next, 'wm-boundary-layers')
      return {
        ...next,
        ...progress,
        ...appendMeshingLogs(state, [
          {
            kind: 'success',
            text: state.boundaryLayers.enabled
              ? `[Teaching Demo] Boundary layers configured: method=${state.boundaryLayers.offsetMethod}, layers=${state.boundaryLayers.numberOfLayers}, growth=${state.boundaryLayers.growthRate}.`
              : '[Teaching Demo] Boundary layer insertion disabled for this volume mesh.',
          },
        ]),
      }
    }

    case 'UPDATE_VOLUME_MESH_FORM': {
      const next = state.completedTasks.includes('wm-volume-mesh')
        ? invalidateMeshProgress(state, 'wm-volume-mesh') : state
      return {
        ...next,
        volumeMesh: { ...next.volumeMesh, ...action.patch },
      }
    }

    case 'RUN_VOLUME_MESH': {
      if (state.multizone.enabled) {
        if (!state.completedTasks.includes('wm-multizone-mesh')) {
          return warn('Generate the Multizone mesh before meshing the remaining regions.', 'wm-multizone-mesh')
        }
        if (state.skippedTasks.includes('wm-volume-mesh')) return state
      }
      if (!state.surfaceMesh.generated) {
        return {
          ...state,
          activeTaskId: 'wm-surface-mesh',
          ...appendMeshingLogs(state, [
            { kind: 'command', text: '> /mesh/volume-mesh/generate' },
            {
              kind: 'warning',
              text: 'Warning: Generate the Surface Mesh before generating the Volume Mesh.',
            },
          ]),
        }
      }
      if (!state.completedTasks.includes('wm-update-regions')) {
        return warn('Confirm the regions before generating the volume mesh.', 'wm-update-regions')
      }
      if (isFaultTolerant && !state.completedTasks.includes('wm-update-boundaries')) {
        return warn('Update Boundaries after wrapping the surface and before generating the volume mesh.', 'wm-update-boundaries')
      }
      if (!state.regions.some((region) => region.type === 'fluid' || region.type === 'solid')) {
        return warn('Keep at least one fluid or solid region before generating the volume mesh.', 'wm-update-regions')
      }
      const error = validateBoundaryLayers(state.boundaryLayers)
      if (error) return warn(error, 'wm-boundary-layers')
      const metrics = computeVolumeMetrics(state)
      if (!Number.isSafeInteger(metrics.cellCount)) return warn('The estimated mesh size is outside the supported range.')
      const progress = completeAndAdvance({
        ...state,
        completedTasks: state.completedTasks.filter((id) => id !== 'wm-improve-mesh'),
      }, 'wm-volume-mesh')
      return {
        ...state,
        ...progress,
        viewportTab: 'volume-mesh',
        cutPlaneEnabled: true,
        improveMesh: { ...state.improveMesh, improved: false },
        volumeMesh: {
          ...state.volumeMesh,
          ...metrics,
          generated: true,
        },
        ...appendMeshingLogs(state, [
          {
            kind: 'command',
            text: `> /mesh/volume-mesh/generate (${state.volumeMesh.fillWith})`,
          },
          {
            kind: 'output',
            text: `Volume mesh cells = ${metrics.cellCount.toLocaleString()} | Min Orthogonal Quality = ${metrics.minOrthogonalQuality} | Max Aspect Ratio = ${metrics.maxAspectRatio}`,
          },
          {
            kind: 'success',
            text: '[Teaching Demo] Volume mesh generation complete. Ready to improve mesh or Switch to Solution.',
          },
        ]),
      }
    }

    case 'UPDATE_IMPROVE_FORM':
      return {
        ...state,
        improveMesh: { ...state.improveMesh, ...action.patch },
      }

    case 'RUN_IMPROVE_VOLUME_MESH': {
      if (!state.volumeMesh.generated) {
        return {
          ...state,
          activeTaskId: 'wm-volume-mesh',
          ...appendMeshingLogs(state, [
            { kind: 'command', text: '> /mesh/improve' },
            {
              kind: 'warning',
              text: 'Warning: Generate the Volume Mesh before running Improve Volume Mesh.',
            },
          ]),
        }
      }
      const target = Number(state.improveMesh.targetOrthogonalQuality)
      const iterations = Number(state.improveMesh.iterations)
      if (!(target > 0 && target <= 1) || !Number.isSafeInteger(iterations) || iterations < 1) {
        return warn('Enter a target orthogonal quality greater than 0 and at most 1, and a positive whole number of passes.')
      }
      const nextOrtho = Number(
        Math.min(0.45, state.volumeMesh.minOrthogonalQuality + 0.11).toFixed(2),
      )
      const nextSkew = Number(
        Math.max(0.55, state.volumeMesh.maxSkewness - 0.08).toFixed(2),
      )
      const progress = completeAndAdvance(state, 'wm-improve-mesh')
      return {
        ...state,
        ...progress,
        viewportTab: 'quality',
        volumeMesh: {
          ...state.volumeMesh,
          minOrthogonalQuality: nextOrtho,
          maxSkewness: nextSkew,
        },
        improveMesh: { ...state.improveMesh, improved: true },
        ...appendMeshingLogs(state, [
          { kind: 'command', text: '> /mesh/improve' },
          {
            kind: 'success',
            text: `[Teaching Demo] Volume mesh improved (${state.improveMesh.iterations} passes): Min Orthogonal Quality raised to ${nextOrtho}, Max Skewness lowered to ${nextSkew}.`,
          },
        ]),
      }
    }

    case 'REVERT_TASK': {
      const next = invalidateMeshProgress(state, action.taskId)
      const revertImprovement = action.taskId === 'wm-improve-mesh' && state.volumeMesh.generated
      return {
        ...next,
        activeTaskId: action.taskId,
        ...(revertImprovement ? {
          volumeMesh: { ...state.volumeMesh, ...computeVolumeMetrics(state), cellCount: state.volumeMesh.cellCount },
          viewportTab: 'volume-mesh' as const,
        } : {}),
        ...(action.taskId === 'wm-import-geometry' ? {
          importGeometry: { ...state.importGeometry, imported: false },
          skippedTasks: [],
          shareTopologyApplied: false,
        } : {}),
        ...appendMeshingLogs(state, [
          {
            kind: 'info',
            text: `Reverted task "${action.taskId}" for re-editing.`,
          },
        ]),
      }
    }

    case 'APPEND_CONSOLE':
      return {
        ...state,
        ...appendMeshingLogs(state, action.entries),
      }

    case 'CLEAR_CONSOLE':
      return {
        ...state,
        consoleLogs: [
          {
            id: state.nextLogId,
            kind: 'info',
            text: 'Meshing console cleared.',
          },
        ],
        nextLogId: state.nextLogId + 1,
      }

    case 'RESET_WORKFLOW':
      return createInitialMeshingState({
        dimension: state.dimension,
        doublePrecision: state.doublePrecision,
        processes: state.processes,
      }, state.workflowMode)

    default:
      return state
  }
}

export const meshingTuiPresetCommands = [
  '/workflow/status',
  '/mesh/surface-mesh',
  '/mesh/volume-mesh',
  '/mesh/check-quality',
  '/mesh/improve',
  'help',
  'clear',
] as const

export function parseAndExecuteMeshingTui(
  rawCommand: string,
  state: FluentMeshingState,
): FluentMeshingAction {
  const command = rawCommand.trim()
  const normalized = command.toLowerCase()

  if (!command) {
    return { type: 'APPEND_CONSOLE', entries: [{ kind: 'info', text: '> ' }] }
  }
  if (normalized === 'clear' || normalized === 'cls') {
    return { type: 'CLEAR_CONSOLE' }
  }
  if (normalized === 'help' || normalized === '?') {
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> ${command}` },
        {
          kind: 'info',
          text: 'Meshing TUI commands: /workflow/status | /mesh/surface-mesh | /mesh/volume-mesh | /mesh/check-quality | /mesh/improve | clear',
        },
      ],
    }
  }
  if (normalized === '/workflow/status') {
    const stepCount = state.workflowMode === 'fault-tolerant' ? faultTolerantTasks.length
      : visibleWatertightSteps(state.multizone.enabled, state.skippedTasks.includes('wm-volume-mesh'), state.capping.enabled).length
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: '> /workflow/status' },
        {
          kind: 'output',
          text: `Completed steps: ${state.completedTasks.length}/${stepCount} | Surface=${state.surfaceMesh.generated ? state.surfaceMesh.faceCount : 'pending'} | Volume=${state.volumeMesh.generated ? state.volumeMesh.cellCount : 'pending'} | MinOrtho=${state.volumeMesh.minOrthogonalQuality}`,
        },
      ],
    }
  }
  if (normalized === '/mesh/surface-mesh') {
    return { type: 'RUN_SURFACE_MESH' }
  }
  if (normalized === '/mesh/volume-mesh') {
    return { type: 'RUN_VOLUME_MESH' }
  }
  if (normalized === '/mesh/check-quality') {
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: '> /mesh/check-quality' },
        {
          kind: 'output',
          text: `[Teaching Demo] Surface Max Skewness=${state.surfaceMesh.maxSkewness} | Volume Min Orthogonal Quality=${state.volumeMesh.minOrthogonalQuality} | Max Aspect Ratio=${state.volumeMesh.maxAspectRatio}`,
        },
      ],
    }
  }
  if (normalized === '/mesh/improve') {
    return { type: 'RUN_IMPROVE_VOLUME_MESH' }
  }

  return {
    type: 'APPEND_CONSOLE',
    entries: [
      { kind: 'command', text: `> ${command}` },
      {
        kind: 'warning',
        text: `Unknown meshing TUI command "${command}". Type "help" for available commands.`,
      },
    ],
  }
}
