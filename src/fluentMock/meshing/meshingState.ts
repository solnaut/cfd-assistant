import type { ConsoleEntry } from '../state/fluentSimState'
import type {
  FluentDimension,
  FluentLauncherConfig,
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
  | { type: 'SET_WORKFLOW_MODE'; mode: MeshingWorkflowMode }
  | { type: 'SELECT_TASK'; taskId: MeshingTaskId }
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

const TASK_SEQUENCE: MeshingTaskId[] = [
  'wm-import-geometry',
  'wm-local-sizing',
  'wm-surface-mesh',
  'wm-describe-geometry',
  'wm-share-topology',
  'wm-update-boundaries',
  'wm-update-regions',
  'wm-boundary-layers',
  'wm-volume-mesh',
  'wm-improve-mesh',
]

export function createInitialMeshingState(
  launcher?: Partial<FluentLauncherConfig>,
): FluentMeshingState {
  const dimension: FluentDimension = launcher?.dimension === '2d' ? '2d' : '3d'
  const doublePrecision = launcher?.doublePrecision ?? true
  const processes =
    typeof launcher?.processes === 'number' && launcher.processes >= 1
      ? launcher.processes
      : 4

  return {
    dimension,
    doublePrecision,
    processes,
    workflowMode: 'watertight',
    activeTaskId: 'wm-import-geometry',
    completedTasks: [],
    skippedTasks: [],
    viewportTab: 'cad',
    highlightedZone: null,
    selectionFilter: 'all',
    cutPlaneEnabled: true,
    cutPlanePosition: 50,
    importGeometry: {
      sourceType: 'cad-file',
      fileName: 'mixing-elbow-demo.scdoc',
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

  const currentIdx = TASK_SEQUENCE.indexOf(taskId)
  let nextTask: MeshingTaskId = taskId
  for (let i = currentIdx + 1; i < TASK_SEQUENCE.length; i++) {
    const candidate = TASK_SEQUENCE[i]
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
    ? Math.max(1, Number.parseInt(state.boundaryLayers.numberOfLayers, 10) || 5)
    : 0
  const baseFaces = state.surfaceMesh.faceCount
  const methodMultiplier: Record<FluentMeshingState['volumeMesh']['fillWith'], number> = {
    'poly-hexcore': 5.6,
    polyhedra: 4.8,
    tetrahedral: 11.4,
    hexcore: 6.4,
  }
  const regionMultiplier = state.regions.length > 1 ? 1.22 : 1
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

export function buildMeshingToSolutionHandoff(
  state: FluentMeshingState,
): MeshingToSolutionHandoff {
  return {
    fromMeshing: true,
    meshType: state.volumeMesh.fillWith,
    cellCount: state.volumeMesh.cellCount,
    surfaceFaceCount: state.surfaceMesh.faceCount,
    minOrthogonalQuality: state.volumeMesh.minOrthogonalQuality,
    maxSkewness: state.volumeMesh.maxSkewness,
    boundaryLayers: state.boundaryLayers.enabled
      ? Number.parseInt(state.boundaryLayers.numberOfLayers, 10) || 5
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
  switch (action.type) {
    case 'SET_WORKFLOW_MODE':
      return {
        ...state,
        workflowMode: action.mode,
        ...appendMeshingLogs(state, [
          {
            kind: 'info',
            text:
              action.mode === 'watertight'
                ? 'Switched Workflow tab to Watertight Geometry (10 interactive steps).'
                : 'Viewing Fault-Tolerant Meshing reference workflow (Wrapper & Leak Detection mode).',
          },
        ]),
      }

    case 'SELECT_TASK':
      return {
        ...state,
        activeTaskId: action.taskId,
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
      const progress = completeAndAdvance(state, 'wm-import-geometry')
      return {
        ...state,
        ...progress,
        viewportTab: 'cad',
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
      const { faceCount, maxSkewness } = computeSurfaceMetrics(state)
      const progress = completeAndAdvance(state, 'wm-surface-mesh')
      return {
        ...state,
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
            text: `Surface mesh sizing: min=${state.surfaceMesh.minSize} mm, max=${state.surfaceMesh.maxSize} mm, functions=${state.surfaceMesh.sizeFunctions}.`,
          },
          {
            kind: 'success',
            text: `[Teaching Demo] Generated ${faceCount.toLocaleString()} surface faces. Max surface skewness = ${maxSkewness}.`,
          },
        ]),
      }
    }

    case 'UPDATE_DESCRIBE_GEOMETRY':
      return {
        ...state,
        describeGeometry: { ...state.describeGeometry, ...action.patch },
      }

    case 'APPLY_DESCRIBE_GEOMETRY': {
      const needsShare = state.describeGeometry.shareTopology === 'yes'
      const hasSolid = state.describeGeometry.geometryType !== 'fluid-only'
      const nextRegions: MeshingRegionRow[] =
        state.describeGeometry.geometryType === 'solid-only'
          ? [{ id: 'reg-pipe-solid', name: 'pipe-wall-solid', type: 'solid', estimatedCells: 14200 }]
          : hasSolid
            ? [
                { id: 'reg-fluid-domain', name: 'fluid-domain', type: 'fluid', estimatedCells: 48620 },
                { id: 'reg-pipe-solid', name: 'pipe-wall-solid', type: 'solid', estimatedCells: 14200 },
              ]
            : [{ id: 'reg-fluid-domain', name: 'fluid-domain', type: 'fluid', estimatedCells: 48620 }]

      const completedTasks = state.completedTasks.includes('wm-describe-geometry')
        ? state.completedTasks
        : [...state.completedTasks, 'wm-describe-geometry' as MeshingTaskId]
      const skippedTasks: MeshingTaskId[] = needsShare
        ? state.skippedTasks.filter((id) => id !== 'wm-share-topology')
        : state.skippedTasks.includes('wm-share-topology')
          ? state.skippedTasks
          : [...state.skippedTasks, 'wm-share-topology']

      const nextTaskId: MeshingTaskId = needsShare
        ? 'wm-share-topology'
        : 'wm-update-boundaries'

      return {
        ...state,
        completedTasks,
        skippedTasks,
        activeTaskId: nextTaskId,
        regions: nextRegions,
        ...appendMeshingLogs(state, [
          {
            kind: 'info',
            text: `[Teaching Demo] Geometry described as "${state.describeGeometry.geometryType}", Share Topology = ${state.describeGeometry.shareTopology}. Regions updated (${nextRegions.length}).`,
          },
        ]),
      }
    }

    case 'RUN_SHARE_TOPOLOGY': {
      const progress = completeAndAdvance(state, 'wm-share-topology')
      return {
        ...state,
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
        ...state,
        boundaries: state.boundaries.map((row) =>
          row.id === action.id ? { ...row, type: action.boundaryType } : row,
        ),
      }

    case 'APPLY_UPDATE_BOUNDARIES': {
      const progress = completeAndAdvance(state, 'wm-update-boundaries')
      return {
        ...state,
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
        ...state,
        regions: state.regions.map((row) =>
          row.id === action.id ? { ...row, type: action.regionType } : row,
        ),
      }

    case 'APPLY_UPDATE_REGIONS': {
      const progress = completeAndAdvance(state, 'wm-update-regions')
      return {
        ...state,
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
        ...state,
        boundaryLayers: { ...state.boundaryLayers, ...action.patch },
      }

    case 'APPLY_BOUNDARY_LAYERS': {
      const progress = completeAndAdvance(state, 'wm-boundary-layers')
      return {
        ...state,
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

    case 'UPDATE_VOLUME_MESH_FORM':
      return {
        ...state,
        volumeMesh: { ...state.volumeMesh, ...action.patch },
      }

    case 'RUN_VOLUME_MESH': {
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
      const metrics = computeVolumeMetrics(state)
      const progress = completeAndAdvance(state, 'wm-volume-mesh')
      return {
        ...state,
        ...progress,
        viewportTab: 'volume-mesh',
        cutPlaneEnabled: true,
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

    case 'REVERT_TASK':
      return {
        ...state,
        activeTaskId: action.taskId,
        completedTasks: state.completedTasks.filter((id) => id !== action.taskId),
        ...appendMeshingLogs(state, [
          {
            kind: 'info',
            text: `Reverted task "${action.taskId}" for re-editing.`,
          },
        ]),
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
      })

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
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: '> /workflow/status' },
        {
          kind: 'output',
          text: `Completed steps: ${state.completedTasks.length}/10 | Surface=${state.surfaceMesh.generated ? state.surfaceMesh.faceCount : 'pending'} | Volume=${state.volumeMesh.generated ? state.volumeMesh.cellCount : 'pending'} | MinOrtho=${state.volumeMesh.minOrthogonalQuality}`,
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
