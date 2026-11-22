import type {
  FluentDimension,
  FluentLauncherConfig,
  FluentLauncherPreferences,
  MeshingToSolutionHandoff,
} from './fluentWorkbenchBridge'
import type { FluentMockDialog } from '../fluentTypes'
import type { surfaceKinds } from '../data/resultBranches'
import { reportEditorValues, validateReport, type ReportDefinition, type ReportOutput, type ReportOutputKind } from './fluentReportState'
import { replaceMeshOption } from '../data/fileMenus'
import { timeAdvancementDefaults } from '../data/timeAdvancement'
import { gentopRegime, multiphaseModels } from '../data/multiphaseDialogs'
import { applyEulerianRegime, eulerianRegime, getMultiphaseChecked, getMultiphaseValue, isEulerianRegimeControlLocked, multiphaseSettingKey, removePhases, resizePhases, setEulerianPhaseTreatment, setEulerianRegime } from './fluentMultiphaseState'

export type ConsoleEntryKind = 'info' | 'command' | 'output' | 'warning' | 'success'

export interface ConsoleEntry {
  id: number
  kind: ConsoleEntryKind
  text: string
}

export type ViewportTab =
  | 'mesh'
  | 'geometry'
  | 'contours'
  | 'vectors'
  | 'pathlines'
  | 'particle-tracks'
  | 'scene'
  | 'residuals'
  | 'xy-plot'
  | 'histogram'
  | 'fft'
  | 'report-plot'

interface CreatedSurface {
  name: string
  kind: (typeof surfaceKinds)[number][0]
  definition: string
  inputs: Record<string, string>
}

type DisplayResultTab = Extract<
  ViewportTab,
  'contours' | 'vectors' | 'pathlines' | 'particle-tracks' | 'scene' | 'xy-plot' | 'histogram' | 'fft'
>

interface DisplayedResult {
  field: string
  source?: string
  option?: string
  scale?: number
  skip?: number
  filled?: boolean
  banded?: boolean
  drawMesh?: boolean
  range?: [string, string]
  style?: string
  colorBy?: string
}

export type HighlightedBoundary =
  | null
  | 'inlet'
  | 'outlet'
  | 'wall'
  | 'symmetry'

export type CameraPreset =
  | 'isometric'
  | 'front'
  | 'back'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'

export interface FluentSimState {
  dimension: FluentDimension
  doublePrecision: boolean
  processes: number
  meshInfo: {
    transferredFromMeshing: boolean
    meshType: string
    cellCount: number
    surfaceFaceCount: number
    minOrthogonalQuality: number
    maxSkewness: number
  }
  cameraPreset: CameraPreset
  solverType: 'pressure-based' | 'density-based'
  velocityFormulation: 'absolute' | 'relative'
  timeFormulation: 'steady' | 'transient'
  gravityEnabled: boolean
  gravityVector: { x: string; y: string; z: string }
  operatingPressure: string
  operatingDensity: string
  multiphaseModel: string
  phaseIds: string[]
  dpmInjections: Record<string, string>
  energyEnabled: boolean
  viscousHeating: boolean
  diffusionEnergySource: boolean
  viscousModel:
    | 'inviscid'
    | 'laminar'
    | 'spalart-allmaras'
    | 'k-epsilon'
    | 'k-omega-sst'
    | 'transition-kl'
    | 'transition-sst'
    | 'rsm'
    | 'sas'
    | 'des'
    | 'les'
  kEpsilonSubModel: 'standard' | 'rng' | 'realizable'
  kOmegaSubModel: 'standard' | 'bsl' | 'sst' | 'geko'
  nearWallTreatment:
    | 'Standard Wall Functions'
    | 'Scalable Wall Functions'
    | 'Non-Equilibrium Wall Functions'
    | 'Enhanced Wall Treatment'
    | 'Menter-Lechner'
    | 'User-Defined Wall Functions'
  curvatureCorrection: boolean
  productionLimiter: boolean
  radiationModel: string
  heatExchangerModel: string
  speciesModel: string
  dpmEnabled: boolean
  solidificationEnabled: boolean
  acousticsModel: string
  wallFilmEnabled: boolean
  batteryModel: string
  materials: {
    fluids: string[]
    solids: string[]
    selectedFluid: string
    draftName: string
    draftType: 'fluid' | 'solid'
    densityMethod: string
    viscosityMethod: string
    density: string
    viscosity: string
    thermalConductivity: string
    specificHeat: string
  }
  cellZoneMaterial: string
  cellZoneSolidMaterial: string
  cellZoneFrameMotion: boolean
  cellZonePorous: boolean
  cellZoneSolidHeatGen: string
  cellZoneSolidFixedTemp: boolean
  cellZoneSourceMomentum: string
  cellZoneSourceEnergy: string
  boundaries: {
    velocityInlet: {
      velocityMagnitude: string
      turbulenceSpec: string
      temperature: string
    }
    massFlowInlet: {
      massFlowRate: string
      flowDirection: string
      turbulenceSpec: string
      totalTemperature: string
    }
    pressureOutlet: {
      gaugePressure: string
      backflowTurbulence: string
      backflowTemp: string
    }
    wall: {
      wallMotion: string
      thermalCondition: string
      roughness: string
    }
    symmetry: {
      name: string
      noFlux: boolean
    }
    outflow: {
      flowRateWeighting: string
      backflowWarning: boolean
    }
  }
  referenceValues: {
    computeFrom: string
    area: string
    length: string
    density: string
    velocity: string
  }
  methods: {
    coupling: 'SIMPLE' | 'SIMPLEC' | 'PISO' | 'Coupled' | 'Phase Coupled SIMPLE'
    gradient: string
    pressure: string
    momentum: string
    tkeScheme: string
    omegaScheme: string
    energyScheme: string
    transientFormulation: string
    warpedFaceCorrection: boolean
    highOrderTermRelaxation: boolean
    pseudoTimeMethod: string
  }
  controls: {
    pressureUrf: string
    densityUrf: string
    bodyForcesUrf: string
    momentumUrf: string
    tkeUrf: string
    omegaUrf: string
    turbViscosityUrf: string
    energyUrf: string
    flowEquationEnabled: boolean
    turbulenceEquationEnabled: boolean
    energyEquationEnabled: boolean
    minTempLimit: string
    maxTempLimit: string
    maxTurbViscRatio: string
  }
  monitors: {
    continuityResidual: boolean
    absoluteCriteria: string
    plotResiduals: boolean
    reportName: string
    reportType: string
    reportSurfaces: string
    reportPlot: boolean
    reportWrite: boolean
  }
  initialization: {
    method: 'hybrid' | 'standard'
    computeFrom: string
    referenceFrame: string
    isInitialized: boolean
    patchRegion: string
    patchVariable: string
    patchValue: string
  }
  runCalculation: {
    iterations: string
    reportingInterval: string
    profileUpdateInterval: string
    timeStepSize: string
    numberOfTimeSteps: string
    maxIterationsPerTimeStep: string
    hasCalculated: boolean
    completedIterations: number
  }
  autosave: {
    frequency: string
    fileType: string
    retainFiles: string
    rootName: string
  }
  units: {
    length: string
    pressure: string
    temperature: string
  }
  meshScale: {
    factor: string
    targetUnit: string
  }
  meshDisplay: {
    surfaces: string
    showEdges: boolean
    shading: boolean
  }
  meshCheckOptions: {
    domainExtents: boolean
    negativeVolume: boolean
    connectivity: boolean
  }
  contourField: 'Velocity Magnitude' | 'Static Pressure' | 'Static Temperature'
  contourSurfaces: string
  contourFilled: boolean
  createdSurfaces: CreatedSurface[]
  displayedResults: Partial<Record<DisplayResultTab, DisplayedResult>>
  vectorField: string
  vectorScale: string
  vectorSkip: string
  displayOptions: {
    colormap: string
    nodeValues: boolean
    globalRange: boolean
    showLegend: boolean
  }
  selectionFilter: 'all' | 'faces' | 'edges' | 'cells'
  uiTheme: 'light' | 'dark'
  viewportTab: ViewportTab
  highlightedBoundary: HighlightedBoundary
  controlOverrides: Record<string, string | boolean>
  sessionFiles: Partial<Record<'mesh' | 'case' | 'data', string>>
  recordings: Partial<Record<'journal' | 'transcript', string>>
  reportDefinitions: Record<string, ReportDefinition>
  reportOutputs: Record<string, ReportOutput>
  reportSamples: Record<string, number>
  displayedReportPlot: string | null
  exportSchedules: Record<string, { path: string; frequency: number; unit: string; description: string }>
  consoleLogs: ConsoleEntry[]
  nextLogId: number
  walkthroughStep: number
  completedWalkthroughSteps: number[]
}

export type FluentSimAction =
  | { type: 'SET_TIME_FORMULATION'; value: 'steady' | 'transient' }
  | { type: 'SET_GRAVITY_ENABLED'; enabled: boolean }
  | {
      type: 'SET_GRAVITY_VECTOR'
      axis: 'x' | 'y' | 'z' | 'all'
      value: string
    }
  | {
      type: 'SET_OPERATING_CONDITIONS'
      pressure?: string
      density?: string
      gravityEnabled?: boolean
      gravityVector?: { x: string; y: string; z: string }
    }
  | { type: 'SET_ENERGY_ENABLED'; enabled: boolean }
  | {
      type: 'SET_VISCOUS_MODEL'
      model: FluentSimState['viscousModel']
    }
  | {
      type: 'SET_NEAR_WALL_TREATMENT'
      treatment: FluentSimState['nearWallTreatment']
    }
  | { type: 'UPSERT_MATERIAL' }
  | { type: 'COPY_DATABASE_MATERIAL' }
  | { type: 'RUN_MESH_CHECK' }
  | { type: 'RUN_MESH_QUALITY' }
  | { type: 'DISPLAY_MESH' }
  | { type: 'RUN_CASE_CHECK' }
  | { type: 'RUN_INITIALIZE'; method?: 'hybrid' | 'standard' }
  | { type: 'RUN_FMG_INITIALIZE' }
  | { type: 'RESET_INITIALIZATION' }
  | { type: 'RUN_PATCH' }
  | { type: 'RUN_CALCULATE'; iterationsOverride?: number }
  | { type: 'APPLY_DIALOG'; dialogTitle: string }
  | { type: 'SET_EULERIAN_REGIME_APPLIED'; discard?: boolean }
  | { type: 'RUN_FILE_OPERATION'; dialog: FluentMockDialog }
  | { type: 'STOP_RECORDING'; kind: 'journal' | 'transcript' }
  | { type: 'CREATE_SURFACE'; surface: CreatedSurface; editing?: boolean }
  | { type: 'LOAD_SURFACE'; name: string; dialog: FluentMockDialog }
  | { type: 'DISPLAY_RESULT'; tab: DisplayResultTab }
  | { type: 'SAVE_REPORT'; kind: 'definition' | ReportOutputKind }
  | { type: 'NEW_REPORT_OUTPUT'; kind: ReportOutputKind }
  | { type: 'DISPLAY_REPORT_PLOT' }
  | { type: 'COMPUTE_REPORT'; report: 'general' | 'surface' }
  | { type: 'RUN_FLUXES_REPORT' }
  | { type: 'RUN_FORCES_REPORT' }
  | { type: 'RUN_VOLUME_INTEGRAL' }
  | { type: 'RUN_PARTITION' }
  | { type: 'RUN_MANUAL_PARTITION' }
  | { type: 'CHECK_PARTITION' }
  | { type: 'SET_UI_THEME'; theme: 'light' | 'dark' }
  | { type: 'RUN_MESH_SMOOTH_OR_SWAP'; mode: 'smooth' | 'swap' }
  | { type: 'CONVERT_TO_POLYHEDRA' }
  | { type: 'RUN_MESH_REORDER'; scope: 'domain' | 'zones' | 'bandwidth' }
  | { type: 'RUN_ADAPT_REFINE' }
  | {
      type: 'RUN_ZONE_OPERATION'
      operation:
        | 'merge'
        | 'separate-cells'
        | 'separate-faces'
        | 'adjacency'
        | 'delete'
        | 'replace'
        | 'append'
        | 'orient'
        | 'overset'
        | 'interface-create'
        | 'curvilinear'
        | 'symmetry-normal'
        | 'outflow-target'
        | 'source-udf'
    }
  | { type: 'RUN_MANAGE_SURFACE'; action: 'display' | 'info' }
  | { type: 'RUN_UDF_ACTION'; action: 'interpret' | 'demand' }
  | { type: 'RUN_ADJOINT_ACTION'; action: 'evaluate' | 'initialize' | 'advance' | 'morph' }
  | { type: 'UPDATE_DESIGN_POINT' }
  | { type: 'RUN_CASE_SUMMARY' }
  | { type: 'RESET_DATA_SAMPLING' }
  | { type: 'RUN_STATISTICS_SUMMARY' }
  | { type: 'RESET_URF_DEFAULTS' }
  | { type: 'SET_CAMERA_PRESET'; preset: CameraPreset }
  | {
      type: 'APPLY_MESHING_HANDOFF'
      handoff?: MeshingToSolutionHandoff | null
      launcher?: Partial<FluentLauncherConfig>
      prefs?: FluentLauncherPreferences
    }
  | {
      type: 'SET_CONTROL_VALUE'
      controlId: string
      value: string | boolean
    }
  | { type: 'SET_VIEWPORT_TAB'; tab: ViewportTab }
  | { type: 'SET_HIGHLIGHTED_BOUNDARY'; boundary: HighlightedBoundary }
  | {
      type: 'APPEND_CONSOLE'
      entries: Array<Omit<ConsoleEntry, 'id'>>
    }
  | { type: 'CLEAR_CONSOLE' }
  | { type: 'RESET_CASE' }
  | { type: 'SET_WALKTHROUGH_STEP'; step: number }
  | { type: 'MARK_WALKTHROUGH_STEP'; step: number }

export function createInitialFluentSimState(): FluentSimState {
  return {
    dimension: '3d',
    doublePrecision: true,
    processes: 4,
    meshInfo: {
      transferredFromMeshing: false,
      meshType: 'poly-hexcore',
      cellCount: 18420,
      surfaceFaceCount: 3840,
      minOrthogonalQuality: 0.21,
      maxSkewness: 0.82,
    },
    cameraPreset: 'isometric',
    solverType: 'pressure-based',
    velocityFormulation: 'absolute',
    timeFormulation: 'steady',
    gravityEnabled: false,
    gravityVector: { x: '0', y: '-9.81', z: '0' },
    operatingPressure: '101325',
    operatingDensity: '1.225',
    multiphaseModel: 'Off',
    phaseIds: ['1', '2'],
    dpmInjections: {},
    energyEnabled: false,
    viscousHeating: false,
    diffusionEnergySource: false,
    viscousModel: 'k-omega-sst',
    kEpsilonSubModel: 'realizable',
    kOmegaSubModel: 'sst',
    nearWallTreatment: 'Enhanced Wall Treatment',
    curvatureCorrection: false,
    productionLimiter: true,
    radiationModel: 'Off',
    heatExchangerModel: 'Off',
    speciesModel: 'Off',
    dpmEnabled: false,
    solidificationEnabled: false,
    acousticsModel: 'Off',
    wallFilmEnabled: false,
    batteryModel: 'Off',
    materials: {
      fluids: ['air', 'water-liquid'],
      solids: ['aluminum'],
      selectedFluid: 'air',
      draftName: 'air',
      draftType: 'fluid',
      densityMethod: 'constant',
      viscosityMethod: 'constant',
      density: '1.225',
      viscosity: '1.7894e-5',
      thermalConductivity: '0.0242',
      specificHeat: '1006.43',
    },
    cellZoneMaterial: 'air',
    cellZoneSolidMaterial: 'aluminum',
    cellZoneFrameMotion: false,
    cellZonePorous: false,
    cellZoneSolidHeatGen: '0 W/m³',
    cellZoneSolidFixedTemp: false,
    cellZoneSourceMomentum: '0 N/m³',
    cellZoneSourceEnergy: '0 W/m³',
    boundaries: {
      velocityInlet: {
        velocityMagnitude: '2.5 m/s',
        turbulenceSpec: 'Intensity and Hydraulic Diameter',
        temperature: '300 K',
      },
      massFlowInlet: {
        massFlowRate: '0.15 kg/s',
        flowDirection: 'Normal to Boundary',
        turbulenceSpec: 'Intensity and Hydraulic Diameter',
        totalTemperature: '300 K',
      },
      pressureOutlet: {
        gaugePressure: '0 Pa',
        backflowTurbulence: 'Intensity and Viscosity Ratio',
        backflowTemp: '300 K',
      },
      wall: {
        wallMotion: 'Stationary Wall',
        thermalCondition: 'Heat Flux',
        roughness: '0',
      },
      symmetry: {
        name: 'symmetry-plane',
        noFlux: true,
      },
      outflow: {
        flowRateWeighting: '1',
        backflowWarning: false,
      },
    },
    referenceValues: {
      computeFrom: 'inlet',
      area: '0.00785 m²',
      length: '0.1 m',
      density: '1.225 kg/m³',
      velocity: '2.5 m/s',
    },
    methods: {
      coupling: 'SIMPLE',
      gradient: 'Least Squares Cell Based',
      pressure: 'Second Order',
      momentum: 'Second Order Upwind',
      tkeScheme: 'Second Order Upwind',
      omegaScheme: 'Second Order Upwind',
      energyScheme: 'Second Order Upwind',
      transientFormulation: 'First Order Implicit',
      warpedFaceCorrection: false,
      highOrderTermRelaxation: false,
      pseudoTimeMethod: 'Global Time Step',
    },
    controls: {
      pressureUrf: '0.3',
      densityUrf: '1.0',
      bodyForcesUrf: '1.0',
      momentumUrf: '0.7',
      tkeUrf: '0.8',
      omegaUrf: '0.8',
      turbViscosityUrf: '1.0',
      energyUrf: '1.0',
      flowEquationEnabled: true,
      turbulenceEquationEnabled: true,
      energyEquationEnabled: false,
      minTempLimit: '1',
      maxTempLimit: '5000',
      maxTurbViscRatio: '1e5',
    },
    monitors: {
      continuityResidual: true,
      absoluteCriteria: '1e-5',
      plotResiduals: true,
      reportName: 'drag-monitor',
      reportType: 'Force',
      reportSurfaces: 'wall',
      reportPlot: true,
      reportWrite: false,
    },
    initialization: {
      method: 'hybrid',
      computeFrom: 'inlet',
      referenceFrame: 'Relative to Cell Zone',
      isInitialized: false,
      patchRegion: 'fluid-domain',
      patchVariable: 'Temperature',
      patchValue: '300 K',
    },
    runCalculation: {
      iterations: '250',
      reportingInterval: '1',
      profileUpdateInterval: '1',
      timeStepSize: '0.005 s',
      numberOfTimeSteps: '100',
      maxIterationsPerTimeStep: '20',
      hasCalculated: false,
      completedIterations: 0,
    },
    autosave: {
      frequency: '50 iterations',
      fileType: 'case and data',
      retainFiles: '10',
      rootName: 'elbow-demo',
    },
    units: {
      length: 'm',
      pressure: 'Pa',
      temperature: 'K',
    },
    meshScale: {
      factor: '1.0',
      targetUnit: 'm',
    },
    meshDisplay: {
      surfaces: 'all',
      showEdges: true,
      shading: false,
    },
    meshCheckOptions: {
      domainExtents: true,
      negativeVolume: true,
      connectivity: true,
    },
    contourField: 'Velocity Magnitude',
    contourSurfaces: 'wall, inlet, outlet',
    contourFilled: true,
    vectorField: 'Velocity',
    vectorScale: '1.0',
    vectorSkip: '2',
    displayOptions: {
      colormap: 'Rainbow',
      nodeValues: true,
      globalRange: false,
      showLegend: true,
    },
    selectionFilter: 'all',
    uiTheme: 'light',
    viewportTab: 'mesh',
    highlightedBoundary: null,
    controlOverrides: {},
    sessionFiles: {},
    recordings: {},
    reportDefinitions: {},
    reportOutputs: {},
    reportSamples: {},
    displayedReportPlot: null,
    createdSurfaces: [],
    displayedResults: {},
    exportSchedules: {},
    consoleLogs: [
      {
        id: 1,
        kind: 'info',
        text: '[Teaching Demo] 3D 90-deg Mixing Elbow case loaded (no live Fluent solver session).',
      },
      {
        id: 2,
        kind: 'output',
        text: 'Zones: fluid-domain (18,420 cells), velocity-inlet, mass-flow-inlet, pressure-outlet, wall-heated, symmetry-plane.',
      },
      {
        id: 3,
        kind: 'info',
        text: 'Tip: Try Mesh Check -> Models -> Boundary Conditions -> Initialize -> Calculate.',
      },
    ],
    nextLogId: 4,
    walkthroughStep: 0,
    completedWalkthroughSteps: [],
  }
}

function appendLogs(
  state: FluentSimState,
  entries: Array<Omit<ConsoleEntry, 'id'>>,
): Pick<FluentSimState, 'consoleLogs' | 'nextLogId'> {
  let id = state.nextLogId
  const appended = entries.map((entry) => ({
    ...entry,
    id: id++,
  }))
  const combined = [...state.consoleLogs, ...appended].slice(-80)
  return {
    consoleLogs: combined,
    nextLogId: id,
  }
}

function parseGravityVectorString(
  raw: string,
  fallback: { x: string; y: string; z: string },
) {
  const parts = raw
    .replace(/m\/s²|m\/s\^2/gi, '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  if (parts.length !== 3) return fallback
  return { x: parts[0], y: parts[1], z: parts[2] }
}

export function formatBatteryBadge(state: FluentSimState): string {
  if (state.batteryModel === 'Off') return getControlChecked(state, 'electric-potential-enable') ? 'Electric Potential' : 'Off'
  const method = getControlValue(state, 'battery-solution-method', 'MSMD')
  return method === 'MSMD' ? state.batteryModel : method
}

export function isAcousticWaveAvailable(state: FluentSimState): boolean {
  return state.timeFormulation === 'transient' &&
    ['Second Order Implicit', 'Bounded Second Order Implicit'].includes(state.methods.transientFormulation)
}

export function formatViscousBadge(model: FluentSimState['viscousModel']): string {
  switch (model) {
    case 'inviscid':
      return 'Inviscid'
    case 'laminar':
      return 'Laminar'
    case 'spalart-allmaras':
      return 'Spalart-Allmaras'
    case 'k-epsilon':
      return 'k-epsilon'
    case 'k-omega-sst':
      return 'k-omega'
    case 'transition-kl':
      return 'Transition k-kl-omega'
    case 'transition-sst':
      return 'Transition SST'
    case 'rsm':
      return 'RSM'
    case 'sas':
      return 'SAS'
    case 'des':
      return 'DES'
    case 'les':
      return 'LES'
  }
}

export function fluentSimReducer(
  state: FluentSimState,
  action: FluentSimAction,
): FluentSimState {
  switch (action.type) {
    case 'APPLY_MESHING_HANDOFF': {
      const nextDim =
        action.handoff?.dimension ?? action.launcher?.dimension ?? state.dimension
      const nextDp =
        action.handoff?.doublePrecision ??
        action.launcher?.doublePrecision ??
        state.doublePrecision
      const nextNp =
        action.handoff?.processes ?? action.launcher?.processes ?? state.processes

      if (!action.handoff) {
        const nextTheme = action.prefs?.theme ?? state.uiTheme
        if (
          nextDim === state.dimension &&
          nextDp === state.doublePrecision &&
          nextNp === state.processes &&
          nextTheme === state.uiTheme &&
          !action.prefs
        ) {
          return state
        }
        const prefSummary = action.prefs
          ? ` | driver=${action.prefs.graphicsDriver}, mode=${action.prefs.parallelMode}, gpu=${action.prefs.gpgpus}, cwd="${action.prefs.workingDirectory}"`
          : ''
        return {
          ...state,
          dimension: nextDim,
          doublePrecision: nextDp,
          processes: nextNp,
          uiTheme: nextTheme,
          ...appendLogs(state, [
            {
              kind: 'info',
              text: `[Launcher Config] Session configured as [${nextDim}, ${nextDp ? 'dp' : 'sp'}, np=${nextNp}]${prefSummary}.`,
            },
          ]),
        }
      }

      const h = action.handoff
      return {
        ...state,
        dimension: h.dimension,
        doublePrecision: h.doublePrecision,
        processes: h.processes,
        meshInfo: {
          transferredFromMeshing: true,
          meshType: h.meshType,
          cellCount: h.cellCount,
          surfaceFaceCount: h.surfaceFaceCount,
          minOrthogonalQuality: h.minOrthogonalQuality,
          maxSkewness: h.maxSkewness,
        },
        viewportTab: 'mesh',
        ...appendLogs(state, [
          {
            kind: 'success',
            text: `[Switch to Solution] Received ${h.meshType} mesh from Fluent Meshing: ${h.cellCount.toLocaleString()} cells, ${h.boundaryLayers} prism layers, Min Ortho Quality = ${h.minOrthogonalQuality}.`,
          },
          {
            kind: 'output',
            text: `Transferred boundary zones: ${h.boundarySummary.map((b) => `${b.name}(${b.type})`).join(', ')}.`,
          },
        ]),
      }
    }

    case 'SET_TIME_FORMULATION': {
      if (state.timeFormulation === action.value) return state
      return {
        ...state,
        timeFormulation: action.value,
        ...appendLogs(state, [
          {
            kind: 'info',
            text:
              action.value === 'transient'
                ? 'Solver Time switched to Transient. Run Calculation now exposes Time Step Size and Number of Time Steps.'
                : 'Solver Time switched to Steady. Run Calculation uses Number of Iterations.',
          },
        ]),
      }
    }

    case 'SET_GRAVITY_ENABLED': {
      return {
        ...state,
        gravityEnabled: action.enabled,
        ...appendLogs(state, [
          {
            kind: 'info',
            text: action.enabled
              ? `Gravity enabled (${state.gravityVector.x}, ${state.gravityVector.y}, ${state.gravityVector.z} m/s²). Synced with Operating Conditions.`
              : 'Gravity disabled. Synced with Operating Conditions.',
          },
        ]),
      }
    }

    case 'SET_GRAVITY_VECTOR': {
      const nextVector =
        action.axis === 'all'
          ? parseGravityVectorString(action.value, state.gravityVector)
          : { ...state.gravityVector, [action.axis]: action.value }
      return {
        ...state,
        gravityVector: nextVector,
      }
    }

    case 'SET_OPERATING_CONDITIONS': {
      return {
        ...state,
        operatingPressure: action.pressure ?? state.operatingPressure,
        operatingDensity: action.density ?? state.operatingDensity,
        gravityEnabled: action.gravityEnabled ?? state.gravityEnabled,
        gravityVector: action.gravityVector ?? state.gravityVector,
      }
    }

    case 'SET_ENERGY_ENABLED': {
      return {
        ...state,
        energyEnabled: action.enabled,
        controls: {
          ...state.controls,
          energyEquationEnabled: action.enabled,
        },
        ...appendLogs(state, [
          {
            kind: 'info',
            text: action.enabled
              ? 'Energy equation enabled. Boundary Thermal tabs, Energy discretization, and Energy residual are now active.'
              : 'Energy equation disabled. Boundary Thermal tabs and Energy residual are inactive.',
          },
        ]),
      }
    }

    case 'SET_VISCOUS_MODEL': {
      return {
        ...state,
        viscousModel: action.model,
        ...appendLogs(state, [
          {
            kind: 'info',
            text:
              action.model === 'laminar' || action.model === 'inviscid'
                ? `Viscous model set to ${formatViscousBadge(action.model)}. Turbulence inputs in inlets/outlets are bypassed.`
                : `Viscous model set to ${formatViscousBadge(action.model)}. Check y+ target and near-wall mesh.`,
          },
        ]),
      }
    }

    case 'SET_NEAR_WALL_TREATMENT': {
      return {
        ...state,
        nearWallTreatment: action.treatment,
      }
    }

    case 'COPY_DATABASE_MATERIAL': {
      const solid = getControlValue(state, 'database-material-type', 'fluid') === 'solid'
      const collection = solid ? 'solids' : 'fluids'
      const name = solid ? getControlValue(state, 'database-solid-material', 'copper')
        : getControlValue(state, 'database-fluid-material', 'nitrogen')
      const existing = state.materials[collection]
      if (existing.includes(name)) {
        return { ...state, ...appendLogs(state, [{ kind: 'info', text: `[Teaching Demo] "${name}" already belongs to this case.` }]) }
      }
      return {
        ...state,
        materials: { ...state.materials, [collection]: [...existing, name] },
        ...appendLogs(state, [{ kind: 'success', text: `[Teaching Demo] Copied "${name}" into case ${collection}.` }]),
      }
    }

    case 'UPSERT_MATERIAL': {
      const name = state.materials.draftName.trim()
      if (!name) return state
      const isSolid = state.materials.draftType === 'solid'
      const fluids = isSolid
        ? state.materials.fluids
        : state.materials.fluids.includes(name)
          ? state.materials.fluids
          : [...state.materials.fluids, name]
      const solids = !isSolid
        ? state.materials.solids
        : state.materials.solids.includes(name)
          ? state.materials.solids
          : [...state.materials.solids, name]
      return {
        ...state,
        materials: {
          ...state.materials,
          fluids,
          solids,
          selectedFluid: isSolid ? state.materials.selectedFluid : name,
        },
        ...appendLogs(state, [
          {
            kind: 'success',
            text: `Material "${name}" (${state.materials.draftType}) saved. Available in Cell Zone Conditions.`,
          },
        ]),
      }
    }

    case 'RUN_MESH_CHECK': {
      return {
        ...state,
        viewportTab: 'mesh',
        ...appendLogs(state, [
          { kind: 'command', text: '> /mesh/check' },
          {
            kind: 'output',
            text: 'Domain Extents: x=[-0.2, 0.4] m, y=[-0.2, 0.25] m, z=[-0.05, 0.05] m',
          },
          {
            kind: 'success',
            text: `Volume statistics (${state.meshInfo.cellCount.toLocaleString()} cells): minimum volume = 1.42e-09 m³ (> 0). Mesh check complete (Teaching Demo).`,
          },
        ]),
      }
    }

    case 'RUN_MESH_QUALITY': {
      return {
        ...state,
        viewportTab: 'mesh',
        ...appendLogs(state, [
          { kind: 'command', text: '> /mesh/quality' },
          {
            kind: 'output',
            text: `Minimum Orthogonal Quality = ${state.meshInfo.minOrthogonalQuality.toExponential(2)} | Max Skewness = ${state.meshInfo.maxSkewness}`,
          },
        ]),
      }
    }

    case 'DISPLAY_MESH': {
      return {
        ...state,
        viewportTab: 'mesh',
        ...appendLogs(state, [
          {
            kind: 'info',
            text: `Displayed mesh surfaces (${state.meshDisplay.surfaces}), edges=${state.meshDisplay.showEdges ? 'on' : 'off'}.`,
          },
        ]),
      }
    }

    case 'RUN_CASE_CHECK': {
      const notes: string[] = [
        `Mesh: ${state.meshInfo.cellCount.toLocaleString()} cells (${state.meshInfo.meshType}), Min Ortho=${state.meshInfo.minOrthogonalQuality}.`,
        `Models: Viscous=${formatViscousBadge(state.viscousModel)}, Energy=${state.energyEnabled ? 'On' : 'Off'}, Multiphase=${state.multiphaseModel}.`,
        state.initialization.isInitialized
          ? 'Initialization: Initialized and ready.'
          : 'Recommendation: Run Hybrid or Standard Initialization before Calculate.',
      ]
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /solve/check-case' },
          ...notes.map((text) => ({ kind: 'output' as const, text })),
          {
            kind: 'success',
            text: '[Teaching Demo] Check Case completed with 0 critical errors.',
          },
        ]),
      }
    }

    case 'RUN_INITIALIZE': {
      const method = action.method ?? state.initialization.method
      return {
        ...state,
        displayedResults: {},
        reportSamples: {},
        runCalculation: { ...state.runCalculation, hasCalculated: false, completedIterations: 0 },
        initialization: {
          ...state.initialization,
          method,
          isInitialized: true,
        },
        ...appendLogs(state, [
          {
            kind: 'command',
            text:
              method === 'hybrid'
                ? '> /solve/initialize/hyb-initialization'
                : '> /solve/initialize/initialize-flow',
          },
          {
            kind: 'output',
            text:
              method === 'hybrid'
                ? 'Hybrid Initialization: solving Laplace potential field (10 demo iterations)...'
                : `Standard Initialization: initial field from ${state.initialization.computeFrom} (${state.initialization.referenceFrame}).`,
          },
          {
            kind: 'success',
            text: 'Initialization complete (Teaching Demo). Ready to run calculation.',
          },
        ]),
      }
    }

    case 'RUN_FMG_INITIALIZE': {
      const levels = Number(getControlValue(state, 'fmg-levels', '5'))
      const courant = Number(getControlValue(state, 'fmg-courant', '0.75'))
      const message = !state.initialization.isInitialized && !state.sessionFiles.data
        ? 'FMG requires an initial flow field. Run Hybrid or Standard Initialization first.'
        : !Number.isSafeInteger(levels) || levels < 1 || !Number.isFinite(courant) || courant <= 0
          ? 'Enter a positive integer for Number of Levels and a positive Courant Number.'
          : ''
      if (message) return { ...state, ...appendLogs(state, [{ kind: 'warning', text: message }]) }
      return {
        ...state,
        initialization: { ...state.initialization, isInitialized: true },
        displayedResults: {},
        reportSamples: {},
        runCalculation: { ...state.runCalculation, hasCalculated: false, completedIterations: 0 },
        ...appendLogs(state, [{
          kind: 'success',
          text: `[Teaching Demo] FMG Initialization complete using ${levels} grid levels and Courant Number ${courant}.`,
        }]),
      }
    }

    case 'RESET_INITIALIZATION': {
      return {
        ...state,
        displayedResults: {},
        reportSamples: {},
        initialization: {
          ...state.initialization,
          isInitialized: false,
        },
        runCalculation: {
          ...state.runCalculation,
          hasCalculated: false,
          completedIterations: 0,
        },
        ...appendLogs(state, [
          {
            kind: 'info',
            text: 'Flow field initialization reset (Teaching Demo).',
          },
        ]),
      }
    }

    case 'RUN_PATCH': {
      if (!state.initialization.isInitialized && !state.sessionFiles.data) {
        return { ...state, ...appendLogs(state, [{ kind: 'warning', text: 'Initialize the flow field before applying Patch.' }]) }
      }
      if (state.initialization.patchVariable === 'Temperature' && !state.energyEnabled) {
        return { ...state, ...appendLogs(state, [{ kind: 'warning', text: 'Enable Energy before patching Temperature in this demo.' }]) }
      }
      return {
        ...state,
        initialization: {
          ...state.initialization,
          isInitialized: true,
        },
        ...appendLogs(state, [
          {
            kind: 'success',
            text: `Patched ${state.initialization.patchVariable} = ${state.initialization.patchValue} on ${state.initialization.patchRegion} (Teaching Demo).`,
          },
        ]),
      }
    }

    case 'RUN_CALCULATE': {
      if (!state.initialization.isInitialized && !state.sessionFiles.data) {
        return {
          ...state,
          ...appendLogs(state, [
            { kind: 'command', text: '> /solve/iterate' },
            {
              kind: 'warning',
              text: 'Warning: Flow field is not initialized. Please run Hybrid or Standard Initialization before Calculate.',
            },
          ]),
        }
      }

      const transient = state.timeFormulation === 'transient'
      const { requestedSteps, dt, maxIterations, notes, error, adaptive } = runSettings(state, action.iterationsOverride)
      if (error) return { ...state, ...appendLogs(state, [{ kind: 'warning', text: error }]) }
      const reportSamples: Record<string, number> = {}
      const reportLogs: Array<Omit<ConsoleEntry, 'id'>> = []
      for (const [key, output] of Object.entries(state.reportOutputs)) {
        if (!output.active || (!transient && output.basis !== 'Iterations')) continue
        if (adaptive && output.basis === 'Flow Time') {
          reportLogs.push({ kind: 'info', text: `[Teaching Demo] "${output.name}" uses Flow Time. Adaptive step sizes are unavailable in this demo.` })
          continue
        }
        // The teaching run uses the configured cap for every inner-iteration block.
        const span = output.basis === 'Flow Time' ? requestedSteps * dt
          : transient && output.basis === 'Iterations' ? requestedSteps * maxIterations : requestedSteps
        const samples = Math.floor(span / output.every + Number.EPSILON * span / output.every)
        reportSamples[key] = samples
        if (samples > 0) reportLogs.push({
          kind: 'output',
          text: output.kind === 'file'
            ? `[Teaching Demo] Report File "${output.name}" would write ${samples} sample(s) to "${output.destination}".`
            : `[Teaching Demo] Report Plot "${output.destination}" received ${samples} sample(s) for ${output.definition}.`,
        })
      }

      return {
        ...state,
        viewportTab: 'residuals',
        reportSamples,
        runCalculation: {
          ...state.runCalculation,
          hasCalculated: true,
          completedIterations: requestedSteps,
        },
        ...appendLogs(state, [
          {
            kind: 'command',
            text:
              transient
                ? `> /solve/dual-time-iterate ${requestedSteps} ${maxIterations}`
                : `> /solve/iterate ${requestedSteps}`,
          },
          ...notes.map((text) => ({ kind: 'info' as const, text })),
          {
            kind: 'output',
            text: state.energyEnabled
              ? 'iter  continuity   x-vel      y-vel      k          omega      energy'
              : 'iter  continuity   x-vel      y-vel      k          omega',
          },
          {
            kind: 'output',
            text: state.energyEnabled
              ? `   1  1.0000e+00 4.21e-01 3.88e-01 6.12e-01 5.04e-01 2.15e-01`
              : `   1  1.0000e+00 4.21e-01 3.88e-01 6.12e-01 5.04e-01`,
          },
          {
            kind: 'output',
            text: state.energyEnabled
              ? `${String(requestedSteps).padStart(4, ' ')}  8.42e-06   3.11e-06 2.85e-06 9.10e-06 7.45e-06 1.24e-07`
              : `${String(requestedSteps).padStart(4, ' ')}  8.42e-06   3.11e-06 2.85e-06 9.10e-06 7.45e-06`,
          },
          {
            kind: 'success',
            text: `Teaching Demo completed ${requestedSteps} ${transient ? 'time steps' : 'iterations'}. Residuals are sample data.`,
          },
          ...reportLogs,
          ...Object.values(state.exportSchedules).flatMap((schedule): Array<Omit<ConsoleEntry, 'id'>> => {
            const unit = state.timeFormulation === 'transient' ? 'Time Steps' : 'Iterations'
            if (schedule.unit !== unit) return []
            const count = Math.floor(requestedSteps / schedule.frequency)
            return count > 0 ? [{
              kind: 'output',
              text: `[Teaching Demo] ${schedule.description} "${schedule.path}": ${count} scheduled export(s).`,
            }] : []
          }),
        ]),
      }
    }

    case 'NEW_REPORT_OUTPUT': {
      const prefix = 'report-' + action.kind + '-'
      return {
        ...state,
        controlOverrides: {
          ...state.controlOverrides,
          [prefix + 'name']: '',
          [prefix + 'definition']: '',
          [prefix + 'destination']: '',
          [prefix + 'every']: '1',
          [prefix + 'basis']: state.timeFormulation === 'transient' ? 'Time Steps' : 'Iterations',
          [prefix + 'active']: true,
        },
      }
    }

    case 'SAVE_REPORT': {
      const error = validateReport(state, action.kind)
      if (error) return { ...state, ...appendLogs(state, [{ kind: 'warning', text: error }]) }
      if (action.kind !== 'definition') {
        const output = reportEditorValues(state, action.kind)
        const key = output.kind + ':' + output.name
        if (!output.destination) output.destination = output.name
        const reportSamples = { ...state.reportSamples }
        delete reportSamples[key]
        return {
          ...state,
          reportSamples,
          reportOutputs: { ...state.reportOutputs, [key]: output },
          controlOverrides: { ...state.controlOverrides, ['report-' + output.kind + '-existing']: output.name },
          ...appendLogs(state, [{ kind: 'success', text: `Saved Report ${output.kind === 'file' ? 'File' : 'Plot'} "${output.name}" for ${output.definition}.` }]),
        }
      }
      const { reportType: type, reportName, reportSurfaces: surface, reportPlot, reportWrite } = state.monitors
      const name = reportName.trim()
      const quantity = type === 'Force' ? getControlValue(state, 'report-force-vector', '1, 0, 0')
        : type === 'Area-Weighted Average' ? getControlValue(state, 'report-surface-variable', 'Velocity Magnitude') : undefined
      const reportOutputs = { ...state.reportOutputs }
      const basis = state.timeFormulation === 'transient' ? 'Time Steps' : 'Iterations'
      const controlOverrides = { ...state.controlOverrides }
      if (reportPlot && !reportOutputs['plot:' + name]) {
        reportOutputs['plot:' + name] = { name, kind: 'plot', definition: name, destination: name, basis, every: 1, active: true }
        controlOverrides['report-plot-existing'] = name
      }
      if (reportWrite && !reportOutputs['file:' + name]) {
        reportOutputs['file:' + name] = { name, kind: 'file', definition: name, destination: name + '.out', basis, every: 1, active: true }
        controlOverrides['report-file-existing'] = name
      }
      return {
        ...state,
        controlOverrides,
        reportDefinitions: { ...state.reportDefinitions, [name]: { name, type, surface, quantity } },
        reportOutputs,
        ...appendLogs(state, [{ kind: 'success', text: `Saved ${type} Report Definition "${name}" on ${surface}.` }]),
      }
    }

    case 'DISPLAY_REPORT_PLOT': {
      const key = 'plot:' + getControlValue(state, 'report-plot-existing')
      if (!Object.hasOwn(state.reportOutputs, key)) {
        return { ...state, ...appendLogs(state, [{ kind: 'warning', text: 'Create and select a Report Plot first.' }]) }
      }
      return { ...state, viewportTab: 'report-plot', displayedReportPlot: key }
    }

    case 'RUN_FILE_OPERATION': {
      const { dialog } = action
      const operation = dialog.fileOperation
      if (!operation) return state
      const path = getControlValue(state, dialog.controls[0].id).trim()
      const schedule = dialog.id.endsWith('-during-dialog')
      const frequency = Number(getControlValue(state, dialog.id + '-frequency', '10'))
      const problem = validateFileOperation(state, dialog)
      if (problem) return {
        ...state,
        ...appendLogs(state, [{ kind: 'warning', text: dialog.title + ': ' + problem }]),
      }

      const { sessionKey, verb } = operation
      const sessionFiles = { ...state.sessionFiles }
      const loadsFile = (verb === 'Read' || verb === 'Import') && sessionKey
      const replacesGeometry = loadsFile && sessionKey !== 'data'
      const replaceMesh = dialog.id === 'ribbon-read-mesh-dialog' && getControlValue(state, 'read-mesh-mode') === replaceMeshOption
      if (loadsFile) {
        if (sessionKey !== 'data') delete sessionFiles.data
        if ((sessionKey === 'mesh' && !replaceMesh) || sessionKey === 'mesh-data') delete sessionFiles.case
        if (sessionKey === 'case' || sessionKey === 'case-data') delete sessionFiles.mesh
        if (sessionKey === 'case-data') {
          sessionFiles.case = path
          sessionFiles.data = path.replace(/\.cas(\.h5|\.gz)?$/i, '.dat$1')
        } else if (sessionKey === 'mesh-data') {
          sessionFiles.mesh = path
          sessionFiles.data = path
        } else {
          sessionFiles[sessionKey] = path
        }
      }
      const format = getControlValue(state, dialog.id + '-format')
      const selection = getControlValue(state, dialog.id + '-surface') ||
        getControlValue(state, dialog.id + '-injection')
      const quantity = getControlValue(state, dialog.id + '-quantities') ||
        dialog.controls.find((control) => control.id === dialog.id + '-quantities')?.value
      const interval = getControlValue(state, dialog.id + '-interval', 'Time Steps')
      const newRecording = dialog.id === 'ribbon-write-journal-dialog' ? 'journal'
        : dialog.id === 'ribbon-write-transcript-dialog' ? 'transcript' : null
      const dataQuantities = verb === 'Write' && (sessionKey === 'data' || sessionKey === 'case-data') &&
        /\.(cas|dat)(\.gz)?$/i.test(path)
        ? [['velocity', 'Velocity Magnitude'], ['mach', 'Mach Number'], ['total-pressure', 'Total Pressure']]
          .filter(([id]) => getControlChecked(state, 'data-quantities-' + id, false))
          .map(([, title]) => title)
        : []
      const details = dialog.id.startsWith('export-')
        ? ' (' + [format || 'ASCII', selection || (operation.format === 'Solution Data' ? 'wall' : 'injection-1'), quantity]
            .filter(Boolean).join(', ') + ')'
        : dataQuantities.length ? ' · Additional quantities: ' + dataQuantities.join(', ') : ''
      return {
        ...state,
        ...(replacesGeometry ? {
          createdSurfaces: [],
          reportDefinitions: replaceMesh ? state.reportDefinitions : {},
          reportOutputs: replaceMesh ? state.reportOutputs : {},
          displayedReportPlot: null,
          highlightedBoundary: null,
          initialization: { ...state.initialization, isInitialized: false },
        } : {}),
        ...(loadsFile ? {
          displayedResults: {},
          reportSamples: {},
          viewportTab: 'mesh' as const,
          runCalculation: { ...state.runCalculation, hasCalculated: false, completedIterations: 0 },
        } : {}),
        sessionFiles,
        recordings: newRecording ? { ...state.recordings, [newRecording]: path } : state.recordings,
        exportSchedules: schedule ? {
          ...state.exportSchedules,
          [dialog.id]: { path, frequency, unit: interval, description: operation.format + details },
        } : state.exportSchedules,
        ...appendLogs(state, [{
          kind: 'success',
          text: schedule
            ? `[Teaching Demo] Scheduled ${operation.format} export "${path}" every ${frequency} ${interval.toLowerCase()}${details}.`
            : replaceMesh ? `[Teaching Demo] Replaced mesh with "${path}" and cleared the existing flow data.`
              : `[Teaching Demo] ${dialog.title}: "${path}"${details}.`,
        }]),
      }
    }

    case 'STOP_RECORDING': {
      const path = state.recordings[action.kind]
      if (!path) return state
      const recordings = { ...state.recordings }
      delete recordings[action.kind]
      return {
        ...state,
        recordings,
        ...appendLogs(state, [{ kind: 'info', text: `[Teaching Demo] Stopped ${action.kind} recording "${path}".` }]),
      }
    }

    case 'DISPLAY_RESULT': {
      const { tab } = action
      if (tab === 'particle-tracks' && !state.dpmEnabled) {
        return {
          ...state,
          ...appendLogs(state, [{ kind: 'warning', text: 'Enable Discrete Phase Model before displaying Particle Tracks.' }]),
        }
      }
      const result = resultSettings(tab, state)
      if (result.range) {
        const [min, max] = result.range.map(Number)
        if (result.range.some((value) => !value.trim()) || !Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
          return { ...state, ...appendLogs(state, [{ kind: 'warning', text: 'Enter finite contour limits with Min Value below Max Value.' }]) }
        }
      }
      return {
        ...state,
        viewportTab: tab,
        displayedResults: { ...state.displayedResults, [tab]: result },
        ...appendLogs(state, [{
          kind: 'output',
          text: `[Teaching Demo] Displayed ${tab}: ${[result.field, result.source, result.option].filter(Boolean).join(' · ')}.`,
        }]),
      }
    }

    case 'LOAD_SURFACE': {
      const surface = state.createdSurfaces.find((item) => item.name === action.name)
      if (!surface) return state
      const values = Object.fromEntries(action.dialog.controls
        .filter((control) => control.controlType === 'field' || control.controlType === 'select')
        .map((control) => [control.id, surface.inputs[control.id] ?? control.value ?? '']))
      return {
        ...state,
        controlOverrides: { ...state.controlOverrides, ...values, [surface.kind + '-name']: surface.name },
      }
    }

    case 'CREATE_SURFACE': {
      const duplicate = state.createdSurfaces.some((surface) => surface.name === action.surface.name)
      if (action.editing ? !duplicate : duplicate ||
        ['wall', 'inlet', 'outlet', 'centerline', 'plane-center', 'iso-x-0.1', 'symmetry-plane', 'fluid-domain'].includes(action.surface.name)) {
        return {
          ...state,
          ...appendLogs(state, [{ kind: 'warning', text: action.editing
            ? `Surface "${action.surface.name}" could not be found.`
            : `A surface named "${action.surface.name}" already exists.` }]),
        }
      }
      return {
        ...state,
        createdSurfaces: action.editing
          ? state.createdSurfaces.map((surface) => surface.name === action.surface.name ? action.surface : surface)
          : [...state.createdSurfaces, action.surface],
        ...appendLogs(state, [{
          kind: 'success',
          text: `[Teaching Demo] ${action.editing ? 'Updated' : 'Created'} ${action.surface.kind} "${action.surface.name}" (${action.surface.definition}).`,
        }]),
      }
    }

    case 'SET_EULERIAN_REGIME_APPLIED':
      return applyEulerianRegime(state, action.discard)
    case 'APPLY_DIALOG': {
      return {
        ...state,
        ...appendLogs(state, [
          {
            kind: 'info',
            text: `Applied settings from "${action.dialogTitle}".`,
          },
        ]),
      }
    }

    case 'COMPUTE_REPORT': {
      const prefix = action.report === 'surface' ? 'surface-integrals' : 'reports'
      const type = getControlValue(state, prefix + '-type', action.report === 'surface' ? 'Area-Weighted Average' : 'Surface Integral')
      if (type === 'Fluxes') return fluentSimReducer(state, { type: 'RUN_FLUXES_REPORT' })
      if (type === 'Forces') return fluentSimReducer(state, { type: 'RUN_FORCES_REPORT' })
      const field = getControlValue(state, prefix + (action.report === 'surface' ? '-field' : '-field-variable'),
        action.report === 'surface' ? 'Temperature' : 'Mass Flow Rate')
      const surface = getControlValue(state, prefix + '-surfaces', 'outlet')
      const examples: Record<string, string> = {
        'Mass Flow Rate': '0.1740 kg/s',
        'Total Heat Transfer Rate': '184 W',
        'Area-Weighted Velocity': '2.54 m/s',
        Temperature: '308.4 K',
        'Velocity Magnitude': '2.54 m/s',
        'Static Pressure': '60 Pa',
      }
      return {
        ...state,
        ...appendLogs(state, [
          {
            kind: 'output',
            text: `[Teaching Demo] ${type} of ${field} on ${surface}: ${examples[field] ?? 'No sample value available'}.`,
          },
        ]),
      }
    }

    case 'RUN_FLUXES_REPORT': {
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /report/fluxes/mass-flow' },
          {
            kind: 'output',
            text: 'Mass Flow Rate [kg/s]: velocity-inlet = +0.0240, mass-flow-inlet = +0.1500, pressure-outlet = -0.1740 | Net = 1.2e-06 kg/s (Teaching Demo).',
          },
        ]),
      }
    }

    case 'RUN_FORCES_REPORT': {
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /report/forces/wall-forces' },
          {
            kind: 'output',
            text: 'Forces on wall-heated (N): Pressure = (0.142, -0.038, 0), Viscous = (0.019, -0.004, 0), Total = 0.161 N (Teaching Demo).',
          },
        ]),
      }
    }

    case 'RUN_VOLUME_INTEGRAL': {
      return {
        ...state,
        ...appendLogs(state, [
          {
            kind: 'output',
            text: '[Teaching Demo] Volume-Average (fluid-domain): Static Temperature = 308.4 K, Total Volume = 4.62e-3 m³.',
          },
        ]),
      }
    }

    case 'RUN_PARTITION': {
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /parallel/partition/auto' },
          {
            kind: 'success',
            text: `[Teaching Demo] Metis partitioned ${state.meshInfo.cellCount.toLocaleString()} cells into ${state.processes} balanced subdomains (max imbalance < 1.8%).`,
          },
        ]),
      }
    }

    case 'RUN_MANUAL_PARTITION': {
      const axis = getControlValue(state, 'partition-manual-axis', 'X-Coordinate')
      const splitVal = getControlValue(state, 'partition-manual-value', '0.1')
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: `> /parallel/partition/manual ${axis} ${splitVal}` },
          { kind: 'success', text: `[Teaching Demo] Split mesh across ${state.processes} subdomains along ${axis} = ${splitVal}.` },
        ]),
      }
    }

    case 'CHECK_PARTITION': {
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /parallel/partition/check' },
          { kind: 'output', text: `[Teaching Demo] ${state.processes} partitions checked: min/max cells variance = 1.6%, interface faces = 1,240.` },
        ]),
      }
    }

    case 'SET_UI_THEME': {
      return { ...state, uiTheme: action.theme }
    }

    case 'RUN_MESH_SMOOTH_OR_SWAP': {
      const nextOrtho = Math.min(0.95, Number((state.meshInfo.minOrthogonalQuality + 0.08).toFixed(2)))
      const nextSkew = Math.max(0.15, Number((state.meshInfo.maxSkewness - 0.09).toFixed(2)))
      const method = getControlValue(state, 'mesh-smooth-method', 'Skewness')
      return {
        ...state,
        viewportTab: 'mesh',
        meshInfo: {
          ...state.meshInfo,
          minOrthogonalQuality: nextOrtho,
          maxSkewness: nextSkew,
        },
        ...appendLogs(state, [
          { kind: 'command', text: action.mode === 'smooth' ? `> /mesh/modify-zones/smooth-mesh (${method})` : '> /mesh/modify-zones/swap-faces' },
          {
            kind: 'success',
            text: `[Teaching Demo] ${action.mode === 'smooth' ? 'Mesh Smoothing' : 'Face Swapping'} complete: Min Orthogonal Quality ${state.meshInfo.minOrthogonalQuality} -> ${nextOrtho}, Max Skewness ${state.meshInfo.maxSkewness} -> ${nextSkew}.`,
          },
        ]),
      }
    }

    case 'CONVERT_TO_POLYHEDRA': {
      const nextCells = Math.max(1200, Math.round(state.meshInfo.cellCount * 0.42))
      const nextOrtho = Math.min(0.95, Number((state.meshInfo.minOrthogonalQuality + 0.14).toFixed(2)))
      const preserveBl = getControlChecked(state, 'polyhedra-preserve-bl', true)
      return {
        ...state,
        viewportTab: 'mesh',
        meshInfo: {
          ...state.meshInfo,
          meshType: 'polyhedra',
          cellCount: nextCells,
          minOrthogonalQuality: nextOrtho,
        },
        ...appendLogs(state, [
          { kind: 'command', text: '> /mesh/polyhedra/convert-domain' },
          {
            kind: 'success',
            text: `[Teaching Demo] Converted domain to Polyhedra (preserve boundary layers = ${preserveBl ? 'yes' : 'no'}): ${state.meshInfo.cellCount.toLocaleString()} -> ${nextCells.toLocaleString()} cells, Min Ortho = ${nextOrtho}.`,
          },
        ]),
      }
    }

    case 'RUN_MESH_REORDER': {
      const method = getControlValue(state, 'reorder-method', 'Reverse Cuthill-McKee')
      const cmd = action.scope === 'bandwidth'
        ? '> /mesh/reorder/print-bandwidth'
        : action.scope === 'zones'
          ? '> /mesh/reorder/reorder-zones'
          : '> /mesh/reorder/reorder-domain'
      const msg = action.scope === 'bandwidth'
        ? '[Teaching Demo] Current mesh matrix bandwidth = 148 (optimal target ~42).'
        : `[Teaching Demo] ${action.scope === 'zones' ? 'Zones' : 'Domain'} reordered via ${method}: bandwidth reduced 148 -> 42.`
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'command', text: cmd }, { kind: 'success', text: msg }]),
      }
    }

    case 'RUN_ADAPT_REFINE': {
      const nextCells = Math.round(state.meshInfo.cellCount * 1.35)
      const nextFaces = Math.round(state.meshInfo.surfaceFaceCount * 1.18)
      const field = getControlValue(state, 'mesh-adaptation-field', 'Velocity Magnitude')
      return {
        ...state,
        viewportTab: 'mesh',
        meshInfo: {
          ...state.meshInfo,
          cellCount: nextCells,
          surfaceFaceCount: nextFaces,
        },
        ...appendLogs(state, [
          { kind: 'command', text: '> /adapt/adapt-to-register' },
          {
            kind: 'success',
            text: `[Teaching Demo] Adapted high-gradient cells (${field}): ${state.meshInfo.cellCount.toLocaleString()} -> ${nextCells.toLocaleString()} cells.`,
          },
        ]),
      }
    }

    case 'RUN_ZONE_OPERATION': {
      const messages: Record<typeof action.operation, [string, string]> = {
        merge: ['> /mesh/modify-zones/merge-zones', `Merged "${getControlValue(state, 'zone-merge-source', 'wall-inlet, wall-elbow')}" into "${getControlValue(state, 'zone-merge-target', 'wall-heated')}".`],
        'separate-cells': ['> /mesh/modify-zones/sep-cell-zone-region', `Separated cells using ${getControlValue(state, 'zone-separate-cell-method', 'Region')} method into 2 cell zones.`],
        'separate-faces': ['> /mesh/modify-zones/sep-face-zone-angle', `Separated boundary faces using ${getControlValue(state, 'zone-separate-face-method', 'Angle')} (angle=${getControlValue(state, 'zone-separate-angle', '40')} deg).`],
        adjacency: ['> /mesh/modify-zones/zone-adjacency', 'Zone Adjacency: fluid-domain <-> velocity-inlet, mass-flow-inlet, pressure-outlet, wall-heated, symmetry-plane (0 orphaned zones).'],
        delete: ['> /mesh/modify-zones/delete-zone', `Deleted ${getControlValue(state, 'zone-delete-type', 'Cell Zones')} "${getControlValue(state, 'zone-delete-name', 'dead-zone')}".`],
        replace: ['> /mesh/modify-zones/replace-zone', `Replaced "${getControlValue(state, 'zone-replace-old', 'wall-old')}" with "${getControlValue(state, 'zone-replace-new', 'wall-heated')}".`],
        append: ['> /mesh/modify-zones/append-mesh', `Appended mesh "${getControlValue(state, 'zone-append-file', 'auxiliary-duct.msh.h5')}" (+2,400 cells preview).`],
        orient: ['> /mesh/check-face-orientation', 'Face Orientation Check: all boundary face normals outward-consistent (0 inverted faces).'],
        overset: ['> /define/overset-interfaces/create', `Created Overset Interface "${getControlValue(state, 'overset-name', 'overset-pair-1')}" (${getControlValue(state, 'overset-donor-method', 'Boundary Distance')}).`],
        'interface-create': ['> /define/mesh-interfaces/create', `Created Mesh Interface "${getControlValue(state, 'interface-pair-name', 'rotor-stator-interface')}" (${getControlValue(state, 'interface-option', 'Coupled Wall')}).`],
        curvilinear: ['> /define/curvilinear-coordinates/compute', `Computed curvilinear coordinate vectors on ${getControlValue(state, 'curv-zone', 'fluid-domain')} via ${getControlValue(state, 'curv-method', 'Inlet-to-Outlet Potential')}.`],
        'symmetry-normal': ['> /define/boundary-conditions/symmetry-normal', `Symmetry "${state.boundaries.symmetry.name}" normal vector = (0, 0, 1), planarity max error = 1.2e-7 m.`],
        'outflow-target': ['> /define/boundary-conditions/outflow-balance', `Outflow flow-rate weighting = ${state.boundaries.outflow.flowRateWeighting}; mass split target verified.`],
        'source-udf': ['> /define/user-defined/source-hook', 'Checked cell-zone source UDF hook bindings (Momentum & Energy source terms ready).'],
      }
      const [cmd, text] = messages[action.operation]
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'command', text: cmd }, { kind: 'success', text: `[Teaching Demo] ${text}` }]),
      }
    }

    case 'RUN_MANAGE_SURFACE': {
      const name = getControlValue(state, 'manage-surface-selected', 'plane-center')
      if (action.action === 'display') {
        return {
          ...state,
          viewportTab: 'contours',
          contourSurfaces: name,
          displayedResults: {
            ...state.displayedResults,
            contours: { field: state.contourField, source: name, filled: state.contourFilled },
          },
          ...appendLogs(state, [{ kind: 'output', text: `[Teaching Demo] Displayed surface "${name}" in Graphics Viewport.` }]),
        }
      }
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'output', text: `[Teaching Demo] Surface "${name}": 284 facets, area = 0.00785 m², bounding box x=[-0.2, 0.4] m.` }]),
      }
    }

    case 'RUN_UDF_ACTION': {
      const file = getControlValue(state, 'udf-source-file', 'inlet_profile.c')
      const fn = getControlValue(state, 'udf-demand-func', 'calc_wall_heat_flux')
      const text = action.action === 'interpret'
        ? `[Teaching Demo] Interpreted UDF "${file}" (stack=${getControlValue(state, 'udf-interp-stack', '10000')}): 2 functions parsed.`
        : `[Teaching Demo] Executed on-demand UDF "${fn}": wall heat flux integral = 184.2 W.`
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'success', text }]),
      }
    }

    case 'RUN_ADJOINT_ACTION': {
      const obs = getControlValue(state, 'adjoint-observable', 'Pressure Drop')
      const iters = getControlValue(state, 'adjoint-advance', '100')
      const stab = getControlValue(state, 'adjoint-stabilization', 'Preconditioned')
      const msg: Record<typeof action.action, string> = {
        evaluate: `[Adjoint] Current Observable "${obs}" = 118.4 Pa (evaluated on baseline flow).`,
        initialize: `[Adjoint] Initialized adjoint field for "${obs}" (${stab} stabilization).`,
        advance: `[Adjoint] Completed ${iters} adjoint iterations for "${obs}"; sensitivity residual = 2.4e-5.`,
        morph: `[Adjoint Morphing] Deformed "${getControlValue(state, 'adjoint-morph-region', 'elbow-bend-wall')}" toward ${getControlValue(state, 'adjoint-morph-target', '-10')}% target on "${obs}" (estimated improvement -8.4%).`,
      }
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'success', text: msg[action.action] }]),
      }
    }

    case 'UPDATE_DESIGN_POINT': {
      const dp = getControlValue(state, 'param-dp-select', 'DP 0 (Current)')
      const scale = dp.startsWith('DP 2') ? 3.2 : dp.startsWith('DP 1') ? 2.0 : 1.0
      const massFlux = (0.15 * scale).toFixed(3) + ' kg/s'
      const dpOut = (118.4 * scale * scale).toFixed(1) + ' Pa'
      return {
        ...state,
        controlOverrides: {
          ...state.controlOverrides,
          'param-table-output': massFlux,
          'param-table-dp': dpOut,
        },
        ...appendLogs(state, [
          { kind: 'success', text: `[Parameters] Updated ${dp}: outlet_mass_flux = ${massFlux}, pressure_drop_out = ${dpOut}.` },
        ]),
      }
    }

    case 'RUN_CASE_SUMMARY': {
      return {
        ...state,
        ...appendLogs(state, [
          { kind: 'command', text: '> /report/summary' },
          { kind: 'output', text: `[Summary] ${state.dimension.toUpperCase()} ${state.solverType} (${state.timeFormulation}) | Mesh: ${state.meshInfo.cellCount.toLocaleString()} ${state.meshInfo.meshType} cells (Min Ortho=${state.meshInfo.minOrthogonalQuality})` },
          { kind: 'output', text: `[Summary] Viscous=${formatViscousBadge(state.viscousModel)}, Energy=${state.energyEnabled ? 'On' : 'Off'}, Multiphase=${state.multiphaseModel}, Radiation=${state.radiationModel}` },
          { kind: 'output', text: `[Summary] Coupling=${state.methods.coupling}, Material=${state.cellZoneMaterial}, Init=${state.initialization.isInitialized ? 'Yes' : 'No'}, Calculated=${state.runCalculation.hasCalculated ? 'Yes' : 'No'}` },
        ]),
      }
    }

    case 'RESET_DATA_SAMPLING': {
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'info', text: '[Teaching Demo] Cleared accumulated time-averaging flow and wall statistics.' }]),
      }
    }

    case 'RUN_STATISTICS_SUMMARY': {
      const n = getControlValue(state, 'stats-samples', '120')
      return {
        ...state,
        ...appendLogs(state, [{ kind: 'output', text: `[Teaching Demo] Solution Statistics (${n} samples): Mean Velocity = 2.48 m/s, Velocity RMS = 0.19 m/s.` }]),
      }
    }

    case 'RESET_URF_DEFAULTS': {
      return {
        ...state,
        controls: {
          ...state.controls,
          pressureUrf: '0.3',
          densityUrf: '1.0',
          bodyForcesUrf: '1.0',
          momentumUrf: '0.7',
          tkeUrf: '0.8',
          omegaUrf: '0.8',
          turbViscosityUrf: '1.0',
          energyUrf: '1.0',
        },
        ...appendLogs(state, [
          {
            kind: 'info',
            text: 'Under-Relaxation Factors restored to Fluent defaults (P=0.3, Mom=0.7, k/omega=0.8, Energy=1.0).',
          },
        ]),
      }
    }

    case 'SET_CAMERA_PRESET': {
      return {
        ...state,
        cameraPreset: action.preset,
        ...appendLogs(state, [
          {
            kind: 'info',
            text: `Graphics camera view set to ${action.preset}.`,
          },
        ]),
      }
    }

    case 'SET_CONTROL_VALUE': {
      return applyControlValue(state, action.controlId, action.value)
    }

    case 'SET_VIEWPORT_TAB': {
      return {
        ...state,
        viewportTab: action.tab,
      }
    }

    case 'SET_HIGHLIGHTED_BOUNDARY': {
      return {
        ...state,
        highlightedBoundary: action.boundary,
      }
    }

    case 'APPEND_CONSOLE': {
      return {
        ...state,
        ...appendLogs(state, action.entries),
      }
    }

    case 'CLEAR_CONSOLE': {
      return {
        ...state,
        consoleLogs: [
          {
            id: state.nextLogId,
            kind: 'info',
            text: 'Console cleared.',
          },
        ],
        nextLogId: state.nextLogId + 1,
      }
    }

    case 'RESET_CASE': {
      return createInitialFluentSimState()
    }

    case 'SET_WALKTHROUGH_STEP': {
      return {
        ...state,
        walkthroughStep: action.step,
      }
    }

    case 'MARK_WALKTHROUGH_STEP': {
      const completed = state.completedWalkthroughSteps.includes(action.step)
        ? state.completedWalkthroughSteps
        : [...state.completedWalkthroughSteps, action.step]
      return {
        ...state,
        completedWalkthroughSteps: completed,
        walkthroughStep: Math.min(9, action.step + 1),
      }
    }

    default:
      return state
  }
}

function controlOverrideKey(state: FluentSimState, controlId: string) {
  if (controlId === 'material-electric-conductivity') {
    return JSON.stringify([controlId, getControlValue(state, 'material-type', 'fluid'), getControlValue(state, 'material-name', 'air').trim()])
  }
  if (controlId === 'species-state-relation' || controlId === 'species-energy-treatment' || controlId === 'species-pdf-function') {
    return `species:${state.speciesModel}:${controlId}`
  }
  if (controlId.startsWith('dynamic-mesh-zone-') && controlId !== 'dynamic-mesh-zone-selection') {
    return `dynamic-mesh:${state.controlOverrides['dynamic-mesh-zone-selection'] ?? 'fluid'}:${controlId}`
  }
  return multiphaseSettingKey(state, controlId)
}

function applyControlValue(
  state: FluentSimState,
  controlId: string,
  value: string | boolean,
): FluentSimState {
  if (isEulerianRegimeControlLocked(state, controlId)) return state
  const str = String(value)
  const bool = Boolean(value)

  switch (controlId) {
    case 'general-pressure-based':
    case 'solver-type-pressure-based':
      return { ...state, solverType: 'pressure-based' }
    case 'general-density-based':
    case 'solver-type-density-based':
      return {
        ...state,
        solverType: 'density-based',
        multiphaseModel: multiphaseModels.includes(state.multiphaseModel) ? 'Off' : state.multiphaseModel,
        controlOverrides: state.multiphaseModel === 'Eulerian'
          ? { ...state.controlOverrides, 'multiphase-eulerian-regime': 'Off', 'multiphase-eulerian-regime-applied': 'Off' } : state.controlOverrides,
        methods: state.methods.coupling === 'Phase Coupled SIMPLE' ? { ...state.methods, coupling: 'SIMPLE' } : state.methods,
      }
    case 'general-absolute-velocity':
      return { ...state, velocityFormulation: 'absolute' }
    case 'general-relative-velocity':
      return { ...state, velocityFormulation: 'relative' }
    case 'solver-velocity-formulation':
      return {
        ...state,
        velocityFormulation:
          str.toLowerCase() === 'relative' ? 'relative' : 'absolute',
      }
    case 'general-steady':
      return fluentSimReducer(state, {
        type: 'SET_TIME_FORMULATION',
        value: 'steady',
      })
    case 'general-transient':
      return fluentSimReducer(state, {
        type: 'SET_TIME_FORMULATION',
        value: 'transient',
      })
    case 'solver-time-formulation':
      return fluentSimReducer(state, {
        type: 'SET_TIME_FORMULATION',
        value: str.toLowerCase() === 'transient' ? 'transient' : 'steady',
      })
    case 'general-gravity-enable':
    case 'operating-gravity':
      return fluentSimReducer(state, {
        type: 'SET_GRAVITY_ENABLED',
        enabled: bool,
      })
    case 'general-gravity-x':
      return {
        ...state,
        gravityVector: { ...state.gravityVector, x: str },
      }
    case 'general-gravity-y':
      return {
        ...state,
        gravityVector: { ...state.gravityVector, y: str },
      }
    case 'general-gravity-z':
      return {
        ...state,
        gravityVector: { ...state.gravityVector, z: str },
      }
    case 'operating-gravity-vector':
      return {
        ...state,
        gravityVector: parseGravityVectorString(str, state.gravityVector),
      }
    case 'operating-pressure':
      return { ...state, operatingPressure: str }
    case 'operating-density':
      return { ...state, operatingDensity: str }
    case 'multiphase-model-select': {
      if (!['Off', 'Wet Steam', ...multiphaseModels].includes(str)) return state
      if (state.solverType !== 'pressure-based' && multiphaseModels.includes(str)) return state
      return {
        ...state,
        multiphaseModel: str,
        controlOverrides: str !== 'Eulerian' ? { ...state.controlOverrides, 'multiphase-eulerian-regime': 'Off', 'multiphase-eulerian-regime-applied': 'Off' } : state.controlOverrides,
        methods: str !== 'Eulerian' && state.methods.coupling === 'Phase Coupled SIMPLE'
          ? { ...state.methods, coupling: 'SIMPLE' } : state.methods,
        dpmEnabled: state.dpmEnabled || (str === 'Eulerian' && state.controlOverrides['multiphase-ddpm'] === true),
        ...appendLogs(state, [
          { kind: 'info', text: `Multiphase model set to ${str}.` },
        ]),
      }
    }
    case 'multiphase-eulerian-regime':
      return setEulerianRegime(state, str)
    case 'multiphase-aiad-secondary-role':
    case 'multiphase-phase-gentop-hybrid':
      return setEulerianPhaseTreatment(state, controlId, value)
    case 'multiphase-num-phases':
      return resizePhases(state, Number(str))
    case 'multiphase-phase-add':
      return resizePhases(state, state.phaseIds.length + 1)
    case 'multiphase-phase-delete':
      return removePhases(state, [getControlValue(state, 'multiphase-phase-list')])
    case 'multiphase-ddpm':
      return {
        ...state,
        dpmEnabled: bool || state.dpmEnabled,
        controlOverrides: { ...state.controlOverrides, [controlId]: bool },
      }
    case 'dpm-injection-save': {
      const name = getControlValue(state, 'dpm-injection-name', 'injection-1').trim()
      if (!name) return state
      return {
        ...state,
        dpmInjections: { ...state.dpmInjections, [name]: getControlValue(state, 'dpm-injection-type', 'surface') },
        ...appendLogs(state, [{ kind: 'success', text: `Saved teaching injection "${name}".` }]),
      }
    }
    case 'radiation-model-select':
      return {
        ...state,
        radiationModel: str,
        controlOverrides: str !== 'Discrete Ordinates (DO)' && state.controlOverrides['radiation-solar-model'] === 'DO Irradiation'
          ? { ...state.controlOverrides, 'radiation-solar-model': 'Off' }
          : state.controlOverrides,
        ...appendLogs(state, [
          { kind: 'info', text: `Radiation model set to ${str}.` },
        ]),
      }
    case 'species-chemistry-solver':
      return speciesChemistrySolvers(state).includes(str)
        ? { ...state, controlOverrides: { ...state.controlOverrides, [controlId]: str } } : state
    case 'species-model-select':
      if (str === 'Species Transport' && eulerianRegime(state) === gentopRegime) return state
      return {
        ...state,
        speciesModel: str,
        ...appendLogs(state, [
          { kind: 'info', text: `Species model set to ${str}.` },
        ]),
      }
    case 'dpm-enable':
      if (!bool && state.multiphaseModel === 'Eulerian' && state.controlOverrides['multiphase-ddpm'] === true) return state
      return {
        ...state,
        dpmEnabled: bool,
        viewportTab: !bool && state.viewportTab === 'particle-tracks' ? 'mesh' : state.viewportTab,
      }
    case 'hx-model-type':
      return { ...state, heatExchangerModel: str }
    case 'solidification-enable':
      return { ...state, solidificationEnabled: bool }
    case 'acoustics-model-select':
      if (str === 'Wave Equation' && !isAcousticWaveAvailable(state)) return state
      return { ...state, acousticsModel: str }
    case 'wall-film-enable':
      return { ...state, wallFilmEnabled: bool }
    case 'battery-model-select':
      return { ...state, batteryModel: str }
    case 'battery-enable':
      return {
        ...state,
        batteryModel: bool ? String(state.controlOverrides['battery-last-model'] ?? 'NTGK Empirical Model') : 'Off',
        controlOverrides: !bool && state.batteryModel !== 'Off'
          ? { ...state.controlOverrides, 'battery-last-model': state.batteryModel }
          : state.controlOverrides,
      }
    case 'energy-enable':
    case 'eq-energy':
      return fluentSimReducer(state, {
        type: 'SET_ENERGY_ENABLED',
        enabled: bool,
      })
    case 'energy-viscous-heating':
      if (state.solverType === 'density-based') return state
      return { ...state, viscousHeating: bool }
    case 'energy-diffusion':
      return { ...state, diffusionEnergySource: bool }
    case 'viscous-inviscid':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'inviscid' })
    case 'viscous-laminar':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'laminar' })
    case 'viscous-sa':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'spalart-allmaras' })
    case 'viscous-kepsilon':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'k-epsilon' })
    case 'viscous-kw-sst':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'k-omega-sst' })
    case 'viscous-transition-kl':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'transition-kl' })
    case 'viscous-transition-sst':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'transition-sst' })
    case 'viscous-rsm':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'rsm' })
    case 'viscous-sas':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'sas' })
    case 'viscous-des':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'des' })
    case 'viscous-les':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'les' })
    case 'viscous-ke-submodel':
      return {
        ...state,
        kEpsilonSubModel: str as FluentSimState['kEpsilonSubModel'],
      }
    case 'viscous-kw-submodel':
      return {
        ...state,
        kOmegaSubModel: str as FluentSimState['kOmegaSubModel'],
      }
    case 'viscous-wall-treatment':
      return fluentSimReducer(state, {
        type: 'SET_NEAR_WALL_TREATMENT',
        treatment: str as FluentSimState['nearWallTreatment'],
      })
    case 'viscous-curvature-correction':
      return { ...state, curvatureCorrection: bool }
    case 'viscous-production-limiter':
      return { ...state, productionLimiter: bool }
    case 'materials-assigned':
      return {
        ...state,
        materials: { ...state.materials, selectedFluid: str },
      }
    case 'material-name':
      return {
        ...state,
        materials: { ...state.materials, draftName: str },
      }
    case 'material-type':
      return {
        ...state,
        materials: {
          ...state.materials,
          draftType: str === 'solid' ? 'solid' : 'fluid',
        },
      }
    case 'material-density-method':
      return {
        ...state,
        materials: { ...state.materials, densityMethod: str },
      }
    case 'material-viscosity-method':
      return {
        ...state,
        materials: { ...state.materials, viscosityMethod: str },
      }
    case 'fluid-density':
      return {
        ...state,
        materials: { ...state.materials, density: str },
      }
    case 'fluid-viscosity':
      return {
        ...state,
        materials: { ...state.materials, viscosity: str },
      }
    case 'fluid-thermal-conductivity':
      return {
        ...state,
        materials: { ...state.materials, thermalConductivity: str },
      }
    case 'cell-zone-fluid-material':
      return { ...state, cellZoneMaterial: str }
    case 'cell-zone-solid-material':
      return { ...state, cellZoneSolidMaterial: str }
    case 'cell-zone-fluid-frame-motion':
      return { ...state, cellZoneFrameMotion: bool }
    case 'cell-zone-fluid-porous':
      return { ...state, cellZonePorous: bool }
    case 'cell-zone-solid-heat-generation':
      return { ...state, cellZoneSolidHeatGen: str }
    case 'cell-zone-solid-fixed-temp':
      return { ...state, cellZoneSolidFixedTemp: bool }
    case 'cell-zone-source-momentum':
      return { ...state, cellZoneSourceMomentum: str }
    case 'cell-zone-source-energy':
      return { ...state, cellZoneSourceEnergy: str }
    case 'velocity-inlet-magnitude':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          velocityInlet: {
            ...state.boundaries.velocityInlet,
            velocityMagnitude: str,
          },
        },
      }
    case 'velocity-inlet-turbulence':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          velocityInlet: {
            ...state.boundaries.velocityInlet,
            turbulenceSpec: str,
          },
        },
      }
    case 'velocity-inlet-thermal':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          velocityInlet: {
            ...state.boundaries.velocityInlet,
            temperature: str,
          },
        },
      }
    case 'mass-flow-inlet-flow-rate':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          massFlowInlet: {
            ...state.boundaries.massFlowInlet,
            massFlowRate: str,
          },
        },
      }
    case 'mass-flow-inlet-direction':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          massFlowInlet: {
            ...state.boundaries.massFlowInlet,
            flowDirection: str,
          },
        },
      }
    case 'mass-flow-inlet-turbulence':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          massFlowInlet: {
            ...state.boundaries.massFlowInlet,
            turbulenceSpec: str,
          },
        },
      }
    case 'mass-flow-inlet-temperature':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          massFlowInlet: {
            ...state.boundaries.massFlowInlet,
            totalTemperature: str,
          },
        },
      }
    case 'pressure-outlet-gauge':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          pressureOutlet: {
            ...state.boundaries.pressureOutlet,
            gaugePressure: str,
          },
        },
      }
    case 'pressure-outlet-turbulence':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          pressureOutlet: {
            ...state.boundaries.pressureOutlet,
            backflowTurbulence: str,
          },
        },
      }
    case 'symmetry-boundary-name':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          symmetry: { ...state.boundaries.symmetry, name: str },
        },
      }
    case 'symmetry-note':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          symmetry: { ...state.boundaries.symmetry, noFlux: bool },
        },
      }
    case 'outflow-flow-rate-weighting':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          outflow: { ...state.boundaries.outflow, flowRateWeighting: str },
        },
      }
    case 'outflow-backflow-warning':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          outflow: { ...state.boundaries.outflow, backflowWarning: bool },
        },
      }
    case 'wall-motion':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          wall: { ...state.boundaries.wall, wallMotion: str },
        },
      }
    case 'wall-thermal':
      return {
        ...state,
        boundaries: {
          ...state.boundaries,
          wall: { ...state.boundaries.wall, thermalCondition: str },
        },
      }
    case 'reference-compute-from':
    case 'reference-values-compute-from': {
      const presets: Record<string, { area: string; length: string; density: string; velocity: string; temp: string; visc: string }> = {
        inlet: { area: '0.00785 m²', length: '0.1 m', density: '1.225 kg/m³', velocity: '2.5 m/s', temp: '300 K', visc: '1.7894e-5 kg/(m·s)' },
        outlet: { area: '0.00785 m²', length: '0.1 m', density: '1.177 kg/m³', velocity: '2.6 m/s', temp: '312 K', visc: '1.846e-5 kg/(m·s)' },
        'all-zones': { area: '0.00785 m²', length: '0.4 m', density: '1.201 kg/m³', velocity: '1.4 m/s', temp: '306 K', visc: '1.815e-5 kg/(m·s)' },
        'fluid-domain': { area: '0.00785 m²', length: '0.4 m', density: '1.201 kg/m³', velocity: '1.4 m/s', temp: '306 K', visc: '1.815e-5 kg/(m·s)' },
      }
      const picked = presets[str] ?? presets.inlet
      return {
        ...state,
        referenceValues: {
          ...state.referenceValues,
          computeFrom: str,
          area: picked.area,
          length: picked.length,
          density: picked.density,
          velocity: picked.velocity,
        },
        controlOverrides: {
          ...state.controlOverrides,
          'reference-depth': '1 m',
          'reference-enthalpy': str === 'outlet' ? '12075 J/kg' : '0 J/kg',
          'reference-pressure': '0 Pa',
          'reference-temperature': picked.temp,
          'reference-viscosity': picked.visc,
          'reference-gamma': '1.4',
          'reference-zone': 'fluid-domain',
        },
      }
    }
    case 'reference-area':
    case 'reference-values-area':
      return {
        ...state,
        referenceValues: { ...state.referenceValues, area: str },
      }
    case 'reference-length':
    case 'reference-values-length':
      return {
        ...state,
        referenceValues: { ...state.referenceValues, length: str },
      }
    case 'reference-values-density':
      return {
        ...state,
        referenceValues: { ...state.referenceValues, density: str },
      }
    case 'reference-values-velocity':
      return {
        ...state,
        referenceValues: { ...state.referenceValues, velocity: str },
      }
    case 'methods-pressure-velocity':
    case 'solution-methods-coupling':
      if (str === 'Phase Coupled SIMPLE' && state.multiphaseModel !== 'Eulerian') return state
      return {
        ...state,
        methods: {
          ...state.methods,
          coupling: str as FluentSimState['methods']['coupling'],
        },
      }
    case 'methods-gradient':
      return {
        ...state,
        methods: { ...state.methods, gradient: str },
      }
    case 'methods-pressure-scheme':
    case 'solution-methods-pressure':
      return {
        ...state,
        methods: { ...state.methods, pressure: str },
      }
    case 'methods-momentum':
    case 'solution-methods-momentum':
      return {
        ...state,
        methods: { ...state.methods, momentum: str },
      }
    case 'methods-tke':
      return { ...state, methods: { ...state.methods, tkeScheme: str } }
    case 'methods-omega':
      return { ...state, methods: { ...state.methods, omegaScheme: str } }
    case 'methods-energy-scheme':
      return { ...state, methods: { ...state.methods, energyScheme: str } }
    case 'methods-transient-formulation':
      return { ...state, methods: { ...state.methods, transientFormulation: str } }
    case 'methods-warped-face':
      return { ...state, methods: { ...state.methods, warpedFaceCorrection: bool } }
    case 'methods-high-order-relax':
      return { ...state, methods: { ...state.methods, highOrderTermRelaxation: bool } }
    case 'methods-pseudo-time':
      return { ...state, methods: { ...state.methods, pseudoTimeMethod: str } }
    case 'controls-urf-pressure':
    case 'solution-controls-pressure':
      return {
        ...state,
        controls: { ...state.controls, pressureUrf: str },
      }
    case 'controls-urf-density':
      return { ...state, controls: { ...state.controls, densityUrf: str } }
    case 'controls-urf-body-forces':
      return { ...state, controls: { ...state.controls, bodyForcesUrf: str } }
    case 'controls-urf-momentum':
    case 'solution-controls-momentum':
      return {
        ...state,
        controls: { ...state.controls, momentumUrf: str },
      }
    case 'controls-urf-tke':
      return { ...state, controls: { ...state.controls, tkeUrf: str } }
    case 'controls-urf-omega':
      return { ...state, controls: { ...state.controls, omegaUrf: str } }
    case 'controls-urf-turb-visc':
      return { ...state, controls: { ...state.controls, turbViscosityUrf: str } }
    case 'controls-urf-energy':
      return { ...state, controls: { ...state.controls, energyUrf: str } }
    case 'solution-controls-energy':
      return {
        ...state,
        controls: { ...state.controls, energyEquationEnabled: bool },
      }
    case 'eq-flow':
      return { ...state, controls: { ...state.controls, flowEquationEnabled: bool } }
    case 'eq-turbulence':
      return { ...state, controls: { ...state.controls, turbulenceEquationEnabled: bool } }
    case 'limits-min-temp':
      return { ...state, controls: { ...state.controls, minTempLimit: str } }
    case 'limits-max-temp':
      return { ...state, controls: { ...state.controls, maxTempLimit: str } }
    case 'limits-max-turb-ratio':
      return { ...state, controls: { ...state.controls, maxTurbViscRatio: str } }
    case 'initialization-method':
    case 'initialization-hybrid':
      return {
        ...state,
        initialization: { ...state.initialization, method: 'hybrid' },
      }
    case 'initialization-standard':
    case 'initialization-standard-dialog':
      return { ...state, initialization: { ...state.initialization, method: 'standard' } }
    case 'initialization-compute-from':
    case 'initialization-compute-from-dialog': {
      const presetVel = str === 'outlet' ? '0.5' : str === 'all-zones' ? '0.0' : '2.5'
      const presetTemp = str === 'outlet' ? '312' : '300'
      const presetK = str === 'all-zones' ? '0.001' : '0.023'
      const presetOmega = str === 'all-zones' ? '1.0' : '38.4'
      const presetEps = str === 'all-zones' ? '0.01' : '0.08'
      return {
        ...state,
        initialization: { ...state.initialization, computeFrom: str },
        controlOverrides: {
          ...state.controlOverrides,
          'initialization-std-pressure': '0',
          'initialization-std-xvel': presetVel,
          'initialization-std-yvel': '0',
          'initialization-std-zvel': '0',
          'initialization-std-k': presetK,
          'initialization-std-omega': presetOmega,
          'initialization-std-epsilon': presetEps,
          'initialization-std-nut': '0.0006',
          'initialization-std-temp': presetTemp,
        },
      }
    }
    case 'initialization-reference-frame':
    case 'initialization-ref-frame-inline':
      return {
        ...state,
        initialization: { ...state.initialization, referenceFrame: str },
      }
    case 'initialization-patch-region':
      return {
        ...state,
        initialization: { ...state.initialization, patchRegion: str },
      }
    case 'initialization-patch-variable':
      return {
        ...state,
        initialization: { ...state.initialization, patchVariable: str },
      }
    case 'initialization-patch-value':
      return {
        ...state,
        initialization: { ...state.initialization, patchValue: str },
      }
    case 'run-iterations':
    case 'run-calculation-iterations':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, iterations: str },
      }
    case 'run-reporting-interval':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, reportingInterval: str },
      }
    case 'run-profile-interval':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, profileUpdateInterval: str },
      }
    case 'run-transient-steps':
    case 'run-calculation-time-steps':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, numberOfTimeSteps: str },
      }
    case 'run-calculation-time-step':
    case 'run-time-step-inline':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, timeStepSize: str },
      }
    case 'run-calculation-max-iterations':
    case 'run-max-iterations-inline':
      return { ...state, runCalculation: { ...state.runCalculation, maxIterationsPerTimeStep: str } }
    case 'autosave-frequency':
      return { ...state, autosave: { ...state.autosave, frequency: str } }
    case 'autosave-file-type':
      return { ...state, autosave: { ...state.autosave, fileType: str } }
    case 'autosave-retain-files':
      return { ...state, autosave: { ...state.autosave, retainFiles: str } }
    case 'autosave-root-name':
      return { ...state, autosave: { ...state.autosave, rootName: str } }
    case 'residual-monitor-continuity':
      return {
        ...state,
        monitors: { ...state.monitors, continuityResidual: bool },
      }
    case 'residual-monitor-absolute':
      return {
        ...state,
        monitors: { ...state.monitors, absoluteCriteria: str },
      }
    case 'residual-monitor-plot':
      return {
        ...state,
        monitors: { ...state.monitors, plotResiduals: bool },
      }
    case 'report-definition-name':
      return { ...state, monitors: { ...state.monitors, reportName: str } }
    case 'report-definition-type':
      return { ...state, monitors: { ...state.monitors, reportType: str } }
    case 'report-definition-surfaces':
      return { ...state, monitors: { ...state.monitors, reportSurfaces: str } }
    case 'report-definition-plot':
      return { ...state, monitors: { ...state.monitors, reportPlot: bool } }
    case 'report-definition-write':
      return { ...state, monitors: { ...state.monitors, reportWrite: bool } }
    case 'contours-field-variable':
      return {
        ...state,
        contourField: str as FluentSimState['contourField'],
      }
    case 'contours-surfaces':
      return { ...state, contourSurfaces: str }
    case 'contours-filled':
      return { ...state, contourFilled: bool }
    case 'vectors-field':
      return { ...state, vectorField: str }
    case 'vectors-scale':
      return { ...state, vectorScale: str }
    case 'vectors-skip':
      return { ...state, vectorSkip: str }
    case 'display-options-colormap':
      return {
        ...state,
        displayOptions: { ...state.displayOptions, colormap: str },
      }
    case 'display-options-theme':
      return {
        ...state,
        uiTheme: str === 'dark' ? 'dark' : 'light',
      }
    case 'display-options-node-values':
      return {
        ...state,
        displayOptions: { ...state.displayOptions, nodeValues: bool },
      }
    case 'display-options-global-range':
      return {
        ...state,
        displayOptions: { ...state.displayOptions, globalRange: bool },
      }
    case 'display-options-show-legend':
      return {
        ...state,
        displayOptions: { ...state.displayOptions, showLegend: bool },
      }
    case 'units-length':
      return { ...state, units: { ...state.units, length: str } }
    case 'units-pressure':
      return { ...state, units: { ...state.units, pressure: str } }
    case 'units-temperature':
      return { ...state, units: { ...state.units, temperature: str } }
    case 'mesh-scale-factor':
      return { ...state, meshScale: { ...state.meshScale, factor: str } }
    case 'mesh-scale-units':
      return { ...state, meshScale: { ...state.meshScale, targetUnit: str } }
    case 'mesh-display-surfaces':
      return { ...state, meshDisplay: { ...state.meshDisplay, surfaces: str } }
    case 'mesh-display-edges':
      return { ...state, meshDisplay: { ...state.meshDisplay, showEdges: bool } }
    case 'mesh-display-shaded':
      return { ...state, meshDisplay: { ...state.meshDisplay, shading: bool } }
    case 'mesh-check-domain':
      return {
        ...state,
        meshCheckOptions: { ...state.meshCheckOptions, domainExtents: bool },
      }
    case 'mesh-check-negative-volume':
      return {
        ...state,
        meshCheckOptions: { ...state.meshCheckOptions, negativeVolume: bool },
      }
    case 'mesh-check-connectivity':
      return {
        ...state,
        meshCheckOptions: { ...state.meshCheckOptions, connectivity: bool },
      }
    case 'graphics-selection-filter':
      return {
        ...state,
        selectionFilter: str as FluentSimState['selectionFilter'],
      }
    default:
      return {
        ...state,
        controlOverrides: {
          ...state.controlOverrides,
          [controlOverrideKey(state, controlId)]: value,
        },
      }
  }
}

export function resultSettings(tab: DisplayResultTab, state: FluentSimState): DisplayedResult {
  switch (tab) {
    case 'contours':
      return {
        field: state.contourField,
        source: state.contourSurfaces,
        filled: state.contourFilled,
        banded: getControlValue(state, 'contours-coloring', 'Smooth') === 'Banded',
        drawMesh: getControlChecked(state, 'contours-draw-mesh'),
        range: getControlChecked(state, 'contours-auto-range', true) ? undefined
          : [getControlValue(state, 'contours-min-val', '0'), getControlValue(state, 'contours-max-val', '3.4')],
      }
    case 'vectors':
      return {
        field: state.vectorField,
        style: getControlValue(state, 'vectors-style', 'Arrow'),
        colorBy: getControlValue(state, 'vectors-color-by', 'Velocity Magnitude'),
        drawMesh: getControlChecked(state, 'vectors-draw-mesh'),
        scale: Math.min(3, Math.max(0.2, Number(state.vectorScale) || 1)),
        skip: Math.min(4, Math.max(0, Math.floor(Number(state.vectorSkip) || 0))),
      }
    case 'pathlines':
      return { field: 'Pathlines', source: getControlValue(state, 'pathlines-release-from', 'inlet') }
    case 'particle-tracks':
      return {
        field: getControlValue(state, 'particle-tracks-color-by', 'Particle Velocity'),
        source: getControlValue(state, 'particle-tracks-injection', 'injection-1'),
      }
    case 'xy-plot':
      return {
        field: getControlValue(state, 'xy-plot-y-axis', 'Pressure'),
        source: getControlValue(state, 'xy-plot-surfaces', 'centerline'),
        option: getControlValue(state, 'xy-plot-x-axis', 'Position'),
      }
    case 'histogram':
      return {
        field: getControlValue(state, 'histogram-field', 'Orthogonal Quality'),
        option: getControlValue(state, 'histogram-bins', '5') + ' bins',
      }
    case 'fft':
      return {
        field: getControlValue(state, 'fft-y-func', 'Sound Pressure Level (dB)'),
        source: getControlValue(state, 'fft-signal', 'Pressure Probe'),
        option: getControlValue(state, 'fft-window', 'Hanning'),
      }
    case 'scene':
      return {
        field: 'Composite Scene',
        source: [
          getControlChecked(state, 'scene-show-mesh', true) ? 'Mesh' : '',
          getControlChecked(state, 'scene-show-contours', true) ? 'Contours' : '',
          getControlChecked(state, 'scene-show-vectors', true) ? 'Vectors' : '',
          getControlChecked(state, 'scene-show-pathlines', false) ? 'Pathlines' : '',
        ].filter(Boolean).join(' + ') || 'Empty',
      }
  }
}

export function validateFileOperation(state: FluentSimState, dialog: FluentMockDialog) {
  const operation = dialog.fileOperation
  if (!operation) return ''
  if (dialog.id.endsWith('-during-dialog') && state.timeFormulation !== 'transient') {
    return 'Automatic export during calculation requires Transient.'
  }
  if (operation.format === 'Particle History Data' && !state.dpmEnabled) {
    return 'Enable Discrete Phase Model before exporting Particle History Data.'
  }
  const path = getControlValue(state, dialog.controls[0].id).trim()
  if (!path) return 'Enter a file name.'
  if (operation.extensions.length && !operation.extensions.some((value) => path.toLowerCase().endsWith(value))) {
    return 'Choose a file with one of these extensions: ' + operation.extensions.join(', ') + '.'
  }
  if (dialog.id.endsWith('-during-dialog')) {
    const frequency = Number(getControlValue(state, dialog.id + '-frequency', '10'))
    if (!Number.isInteger(frequency) || frequency < 1) return 'Enter a positive whole-number export interval.'
  }
  return ''
}

function runSettings(state: FluentSimState, override?: number) {
  const transient = state.timeFormulation === 'transient'
  const run = state.runCalculation
  const method = getControlValue(state, 'run-effective-time-method')
  const adaptive = transient && getControlValue(state, 'run-time-type') === 'Adaptive'
  const periodic = transient && (method === 'Period-Based' || method === 'Frequency-Based')
  const positive = (number: number) => Number.isFinite(number) && number > 0
  const integer = (number: number) => Number.isSafeInteger(number) && number > 0
  const numeric = (id: string) => Number(getControlValue(state, id).trim().replace(/\s*s$/i, ''))
  const periodSource = numeric(method === 'Frequency-Based' ? 'run-frequency' : 'run-period')
  const stepsPerPeriod = numeric('run-steps-per-period')
  const periods = numeric('run-total-periods')
  const requestedSteps = override ?? (periodic ? stepsPerPeriod * periods : Number(transient ? run.numberOfTimeSteps : run.iterations))
  const maxIterations = Number(run.maxIterationsPerTimeStep)
  const dt = periodic ? (method === 'Frequency-Based' ? 1 / periodSource : periodSource) / stepsPerPeriod
    : adaptive ? numeric('run-adaptive-initial') : Number(run.timeStepSize.trim().replace(/\s*s$/i, ''))
  const min = numeric('run-min-time-step')
  const max = numeric('run-max-time-step')
  const minChange = numeric('run-min-change-factor')
  const maxChange = numeric('run-max-change-factor')
  const target = numeric(method === 'Error-Based' ? 'run-adaptive-error'
    : method === 'Multiphase-Specific' ? 'run-multiphase-courant' : 'run-adaptive-courant')
  const notes: string[] = []
  let error = ''
  if (periodic && (!positive(periodSource) || !integer(periods) || !integer(stepsPerPeriod))) {
    error = 'Enter a positive period or frequency and positive whole numbers for the period counts.'
  } else if (!integer(requestedSteps)) {
    error = `Enter a positive whole number for ${transient ? 'Number of Time Steps' : 'No. of Iterations'}.`
  } else if (transient && (!positive(dt) || !integer(maxIterations) || !Number.isFinite(dt * requestedSteps))) {
    error = 'Enter a positive Time Step Size and a positive whole number for Max Iterations/Time Step.'
  } else if (adaptive && (!positive(min) || min > dt || dt > max || !positive(max) ||
    !positive(minChange) || !positive(maxChange) || minChange > maxChange || !positive(target))) {
    error = 'Check the adaptive size bounds, initial step, step change limits and target value.'
  } else if (adaptive) {
    notes.push(`[Teaching Demo] ${method}: initial step ${dt} s, bounds ${min}–${max} s, target ${target}. Adaptive step history requires the Fluent solver.`)
  } else if (transient) {
    notes.push(`Time Step Size = ${dt} s; Max Iterations/Time Step = ${maxIterations}.`)
  }
  return { requestedSteps, dt, maxIterations, notes, error, adaptive }
}

export function speciesChemistrySolvers(state: FluentSimState) {
  const tci = getControlValue(state, 'species-tci', 'Finite-Rate/No TCI')
  if (tci === 'Eddy-Dissipation Concept') return ['Stiff Chemistry Solver', 'CHEMKIN-CFD Solver']
  const solvers = ['None - Direct Source']
  if (tci === 'Finite-Rate/No TCI') solvers.push('Stiff Chemistry Solver', 'CHEMKIN-CFD Solver')
  return [...solvers, 'Relax to Chemical Equilibrium']
}

export function nearWallTreatments(state: FluentSimState): FluentSimState['nearWallTreatment'][] {
  const quadraticRsm = state.viscousModel === 'rsm' && getControlValue(state, 'viscous-rsm-model') === 'Quadratic Pressure-Strain'
  return ['Standard Wall Functions', 'Scalable Wall Functions', 'Non-Equilibrium Wall Functions',
    ...(!quadraticRsm ? ['Enhanced Wall Treatment' as const] : []),
    ...(state.viscousModel === 'k-epsilon' ? ['Menter-Lechner' as const] : []), 'User-Defined Wall Functions']
}

export function getControlValue(
  state: FluentSimState,
  controlId: string,
  fallback = '',
): string {
  switch (controlId) {
    case 'solver-dimension':
      return state.dimension
    case 'run-effective-time-method':
      return getControlValue(state, getControlValue(state, 'run-time-type') === 'Adaptive' ? 'run-adaptive-method' : 'run-fixed-method')
    case 'run-adaptive-method': {
      const saved = state.controlOverrides[controlId]
      if (saved === 'Error-Based' || (saved === 'Multiphase-Specific' && state.multiphaseModel !== 'Off')) return saved
      return 'CFL-Based'
    }
    case 'general-gravity-x':
      return state.gravityVector.x
    case 'general-gravity-y':
      return state.gravityVector.y
    case 'general-gravity-z':
      return state.gravityVector.z
    case 'operating-gravity-vector':
      return `${state.gravityVector.x}, ${state.gravityVector.y}, ${state.gravityVector.z} m/s²`
    case 'operating-pressure':
      return state.operatingPressure
    case 'operating-density':
      return state.operatingDensity
    case 'multiphase-model-select':
      return state.multiphaseModel
    case 'radiation-model-select':
      return state.radiationModel
    case 'species-model-select':
      return state.speciesModel
    case 'species-chemistry-solver': {
      const solvers = speciesChemistrySolvers(state)
      const saved = state.controlOverrides[controlId]
        ?? (state.controlOverrides['species-stiff-chemistry'] === true ? 'Stiff Chemistry Solver' : undefined)
      return typeof saved === 'string' && solvers.includes(saved) ? saved : solvers[0]
    }
    case 'hx-model-type':
      return state.heatExchangerModel
    case 'acoustics-model-select':
      return state.acousticsModel === 'Wave Equation' && !isAcousticWaveAvailable(state) ? 'Off' : state.acousticsModel
    case 'species-state-relation': {
      const saved = state.controlOverrides[controlOverrideKey(state, controlId)] ?? state.controlOverrides[controlId]
      return typeof saved === 'string' && (saved !== 'Flamelet Generated Manifold' || state.speciesModel === 'Partially Premixed Combustion')
        ? saved : 'Chemical Equilibrium'
    }
    case 'battery-model-select':
      return state.batteryModel
    case 'solver-velocity-formulation':
      return state.velocityFormulation === 'relative' ? 'Relative' : 'Absolute'
    case 'solver-time-formulation':
      return state.timeFormulation === 'transient' ? 'Transient' : 'Steady'
    case 'viscous-ke-submodel':
      return state.kEpsilonSubModel
    case 'viscous-kw-submodel':
      return state.kOmegaSubModel
    case 'viscous-wall-treatment':
      return nearWallTreatments(state).includes(state.nearWallTreatment) ? state.nearWallTreatment : 'Standard Wall Functions'
    case 'materials-assigned':
      return state.materials.selectedFluid
    case 'material-name':
      return state.materials.draftName
    case 'material-type':
      return state.materials.draftType
    case 'material-density-method':
      return state.materials.densityMethod
    case 'material-viscosity-method':
      return state.materials.viscosityMethod
    case 'fluid-density':
      return state.materials.density
    case 'fluid-viscosity':
      return state.materials.viscosity
    case 'fluid-thermal-conductivity':
      return state.materials.thermalConductivity
    case 'cell-zone-fluid-material':
      return state.cellZoneMaterial
    case 'cell-zone-solid-material':
      return state.cellZoneSolidMaterial
    case 'cell-zone-solid-heat-generation':
      return state.cellZoneSolidHeatGen
    case 'cell-zone-source-momentum':
      return state.cellZoneSourceMomentum
    case 'cell-zone-source-energy':
      return state.cellZoneSourceEnergy
    case 'velocity-inlet-magnitude':
      return state.boundaries.velocityInlet.velocityMagnitude
    case 'velocity-inlet-turbulence':
      return state.boundaries.velocityInlet.turbulenceSpec
    case 'velocity-inlet-thermal':
      return state.boundaries.velocityInlet.temperature
    case 'mass-flow-inlet-flow-rate':
      return state.boundaries.massFlowInlet.massFlowRate
    case 'mass-flow-inlet-direction':
      return state.boundaries.massFlowInlet.flowDirection
    case 'mass-flow-inlet-turbulence':
      return state.boundaries.massFlowInlet.turbulenceSpec
    case 'mass-flow-inlet-temperature':
      return state.boundaries.massFlowInlet.totalTemperature
    case 'pressure-outlet-gauge':
      return state.boundaries.pressureOutlet.gaugePressure
    case 'pressure-outlet-turbulence':
      return state.boundaries.pressureOutlet.backflowTurbulence
    case 'symmetry-boundary-name':
      return state.boundaries.symmetry.name
    case 'outflow-flow-rate-weighting':
      return state.boundaries.outflow.flowRateWeighting
    case 'wall-motion':
      return state.boundaries.wall.wallMotion
    case 'wall-thermal':
      return state.boundaries.wall.thermalCondition
    case 'reference-compute-from':
    case 'reference-values-compute-from':
      return state.referenceValues.computeFrom
    case 'reference-area':
    case 'reference-values-area':
      return state.referenceValues.area
    case 'reference-length':
    case 'reference-values-length':
      return state.referenceValues.length
    case 'reference-values-density':
      return state.referenceValues.density
    case 'reference-values-velocity':
      return state.referenceValues.velocity
    case 'methods-pressure-velocity':
    case 'solution-methods-coupling':
      return state.methods.coupling
    case 'methods-gradient':
      return state.methods.gradient
    case 'methods-pressure-scheme':
    case 'solution-methods-pressure':
      return state.methods.pressure
    case 'methods-momentum':
    case 'solution-methods-momentum':
      return state.methods.momentum
    case 'methods-tke':
      return state.methods.tkeScheme
    case 'methods-omega':
      return state.methods.omegaScheme
    case 'methods-energy-scheme':
      return state.methods.energyScheme
    case 'methods-transient-formulation':
      return state.methods.transientFormulation
    case 'methods-pseudo-time':
      return state.methods.pseudoTimeMethod
    case 'controls-urf-pressure':
    case 'solution-controls-pressure':
      return state.controls.pressureUrf
    case 'controls-urf-density':
      return state.controls.densityUrf
    case 'controls-urf-body-forces':
      return state.controls.bodyForcesUrf
    case 'controls-urf-momentum':
    case 'solution-controls-momentum':
      return state.controls.momentumUrf
    case 'controls-urf-tke':
      return state.controls.tkeUrf
    case 'controls-urf-omega':
      return state.controls.omegaUrf
    case 'controls-urf-turb-visc':
      return state.controls.turbViscosityUrf
    case 'controls-urf-energy':
      return state.controls.energyUrf
    case 'limits-min-temp':
      return state.controls.minTempLimit
    case 'limits-max-temp':
      return state.controls.maxTempLimit
    case 'limits-max-turb-ratio':
      return state.controls.maxTurbViscRatio
    case 'initialization-compute-from':
    case 'initialization-compute-from-dialog':
      return state.initialization.computeFrom
    case 'initialization-reference-frame':
    case 'initialization-ref-frame-inline':
      return state.initialization.referenceFrame
    case 'initialization-patch-region':
      return state.initialization.patchRegion
    case 'initialization-patch-variable':
      return state.initialization.patchVariable
    case 'initialization-patch-value':
      return state.initialization.patchValue
    case 'run-iterations':
    case 'run-calculation-iterations':
      return state.runCalculation.iterations
    case 'run-reporting-interval':
      return state.runCalculation.reportingInterval
    case 'run-profile-interval':
      return state.runCalculation.profileUpdateInterval
    case 'run-calculation-time-step':
    case 'run-time-step-inline':
      return state.runCalculation.timeStepSize
    case 'run-calculation-time-steps':
    case 'run-transient-steps':
      return state.runCalculation.numberOfTimeSteps
    case 'run-calculation-max-iterations':
    case 'run-max-iterations-inline':
      return state.runCalculation.maxIterationsPerTimeStep
    case 'autosave-frequency':
      return state.autosave.frequency
    case 'autosave-file-type':
      return state.autosave.fileType
    case 'autosave-retain-files':
      return state.autosave.retainFiles
    case 'autosave-root-name':
      return state.autosave.rootName
    case 'residual-monitor-absolute':
      return state.monitors.absoluteCriteria
    case 'report-definition-name':
      return state.monitors.reportName
    case 'report-definition-type':
      return state.monitors.reportType
    case 'report-definition-surfaces':
      return state.monitors.reportSurfaces
    case 'contours-field-variable':
      return state.contourField
    case 'contours-surfaces':
      return state.contourSurfaces
    case 'vectors-field':
      return state.vectorField
    case 'vectors-scale':
      return state.vectorScale
    case 'vectors-skip':
      return state.vectorSkip
    case 'display-options-colormap':
      return state.displayOptions.colormap
    case 'display-options-theme':
      return state.uiTheme
    case 'units-length':
      return state.units.length
    case 'units-pressure':
      return state.units.pressure
    case 'units-temperature':
      return state.units.temperature
    case 'mesh-scale-factor':
      return state.meshScale.factor
    case 'mesh-scale-units':
      return state.meshScale.targetUnit
    case 'mesh-display-surfaces':
      return state.meshDisplay.surfaces
    case 'graphics-selection-filter':
      return state.selectionFilter
    default: {
      const multiphaseValue = getMultiphaseValue(state, controlId)
      if (multiphaseValue !== undefined) return multiphaseValue
      const override = state.controlOverrides[controlOverrideKey(state, controlId)] ?? state.controlOverrides[controlId]
      return typeof override === 'string' ? override :
        timeAdvancementDefaults[controlId as keyof typeof timeAdvancementDefaults] ?? fallback
    }
  }
}

export function getControlChecked(
  state: FluentSimState,
  controlId: string,
  fallback = false,
): boolean {
  switch (controlId) {
    case 'ribbon-write-journal':
      return Boolean(state.recordings.journal)
    case 'ribbon-write-transcript':
      return Boolean(state.recordings.transcript)
    case 'general-pressure-based':
    case 'solver-type-pressure-based':
      return state.solverType === 'pressure-based'
    case 'general-density-based':
    case 'solver-type-density-based':
      return state.solverType === 'density-based'
    case 'general-absolute-velocity':
      return state.velocityFormulation === 'absolute'
    case 'general-relative-velocity':
      return state.velocityFormulation === 'relative'
    case 'general-steady':
      return state.timeFormulation === 'steady'
    case 'general-transient':
      return state.timeFormulation === 'transient'
    case 'general-gravity-enable':
    case 'operating-gravity':
      return state.gravityEnabled
    case 'energy-enable':
    case 'eq-energy':
      return state.energyEnabled
    case 'energy-viscous-heating':
      return state.solverType === 'density-based' || state.viscousHeating
    case 'energy-diffusion':
      return state.diffusionEnergySource
    case 'viscous-inviscid':
      return state.viscousModel === 'inviscid'
    case 'viscous-laminar':
      return state.viscousModel === 'laminar'
    case 'viscous-sa':
      return state.viscousModel === 'spalart-allmaras'
    case 'viscous-kepsilon':
      return state.viscousModel === 'k-epsilon'
    case 'viscous-kw-sst':
      return state.viscousModel === 'k-omega-sst'
    case 'viscous-transition-kl':
      return state.viscousModel === 'transition-kl'
    case 'viscous-transition-sst':
      return state.viscousModel === 'transition-sst'
    case 'viscous-rsm':
      return state.viscousModel === 'rsm'
    case 'viscous-sas':
      return state.viscousModel === 'sas'
    case 'viscous-des':
      return state.viscousModel === 'des'
    case 'viscous-les':
      return state.viscousModel === 'les'
    case 'multiphase-phase-granular':
      return state.multiphaseModel === 'Eulerian' && state.controlOverrides[multiphaseSettingKey(state, controlId)] === true
    case 'viscous-near-wall-available':
      return state.viscousModel === 'k-epsilon' || state.viscousModel === 'rsm'
    case 'viscous-curvature-available':
      return ['spalart-allmaras', 'k-epsilon', 'k-omega-sst', 'transition-sst', 'sas'].includes(state.viscousModel) ||
        (state.viscousModel === 'des' && getControlValue(state, 'viscous-des-model', 'SST k-omega') === 'SST k-omega')
    case 'species-integration-available':
      return getControlValue(state, 'species-chemistry-solver') === 'Stiff Chemistry Solver'
    case 'dpm-independent-particle-step':
      return state.dpmEnabled && getControlChecked(state, 'dpm-unsteady-tracking') &&
        (state.timeFormulation === 'steady' || !getControlChecked(state, 'dpm-fluid-timestep', true))
    case 'dpm-source-linearization-available':
      return getControlChecked(state, 'dpm-interaction') && (!getControlChecked(state, 'dpm-node-averaging') ||
        (state.multiphaseModel === 'Eulerian' && getControlChecked(state, 'multiphase-ddpm')))
    case 'wall-film-species-active':
      return state.speciesModel !== 'Off'
    case 'wall-film-phase-accretion-available':
      return state.multiphaseModel === 'Eulerian' ||
        (state.multiphaseModel === 'Mixture' && getControlChecked(state, 'mixture-slip', true))
    case 'wall-film-phase-coupling-available':
      return getControlChecked(state, 'wall-film-species-active') || getControlChecked(state, 'wall-film-phase-accretion-available')
    case 'battery-enable':
      return state.batteryModel !== 'Off'
    case 'viscous-curvature-correction':
      return state.curvatureCorrection
    case 'viscous-production-limiter':
      return state.productionLimiter
    case 'dpm-enable':
      return state.dpmEnabled
    case 'solidification-enable':
      return state.solidificationEnabled
    case 'wall-film-enable':
      return state.wallFilmEnabled
    case 'methods-warped-face':
      return state.methods.warpedFaceCorrection
    case 'methods-high-order-relax':
      return state.methods.highOrderTermRelaxation
    case 'eq-flow':
      return state.controls.flowEquationEnabled
    case 'eq-turbulence':
      return state.controls.turbulenceEquationEnabled
    case 'cell-zone-fluid-frame-motion':
      return state.cellZoneFrameMotion
    case 'cell-zone-fluid-porous':
      return state.cellZonePorous
    case 'cell-zone-laminar-available':
      return ['spalart-allmaras', 'k-epsilon', 'k-omega-sst'].includes(state.viscousModel)
    case 'cell-zone-solid-fixed-temp':
      return state.cellZoneSolidFixedTemp
    case 'solution-controls-energy':
      return state.controls.energyEquationEnabled
    case 'initialization-method':
    case 'initialization-hybrid':
      return state.initialization.method === 'hybrid'
    case 'initialization-standard':
    case 'initialization-standard-dialog':
      return state.initialization.method === 'standard'
    case 'residual-monitor-continuity':
      return state.monitors.continuityResidual
    case 'residual-monitor-plot':
      return state.monitors.plotResiduals
    case 'report-definition-plot':
      return state.monitors.reportPlot
    case 'report-definition-write':
      return state.monitors.reportWrite
    case 'contours-filled':
      return state.contourFilled
    case 'display-options-node-values':
      return state.displayOptions.nodeValues
    case 'display-options-global-range':
      return state.displayOptions.globalRange
    case 'display-options-show-legend':
      return state.displayOptions.showLegend
    case 'mesh-display-edges':
      return state.meshDisplay.showEdges
    case 'mesh-display-shaded':
      return state.meshDisplay.shading
    case 'mesh-check-domain':
      return state.meshCheckOptions.domainExtents
    case 'mesh-check-negative-volume':
      return state.meshCheckOptions.negativeVolume
    case 'mesh-check-connectivity':
      return state.meshCheckOptions.connectivity
    case 'viscous-has-tke':
      return ['k-epsilon', 'k-omega-sst', 'transition-kl', 'transition-sst', 'rsm', 'sas', 'des'].includes(state.viscousModel) ||
        (state.viscousModel === 'les' && getControlValue(state, 'viscous-les-model', 'Smagorinsky-Lilly') === 'Kinetic-Energy Transport')
    case 'viscous-has-epsilon':
      return state.viscousModel === 'k-epsilon' ||
        (state.viscousModel === 'rsm' && getControlValue(state, 'viscous-rsm-model', 'Linear Pressure-Strain') !== 'Stress-Omega')
    case 'viscous-has-omega':
      return ['k-omega-sst', 'transition-sst', 'sas'].includes(state.viscousModel) ||
        (state.viscousModel === 'rsm' && getControlValue(state, 'viscous-rsm-model', 'Linear Pressure-Strain') === 'Stress-Omega') ||
        (state.viscousModel === 'des' && getControlValue(state, 'viscous-des-model', 'SST k-omega') === 'SST k-omega')
    case 'viscous-has-nut':
      return state.viscousModel === 'spalart-allmaras' ||
        (state.viscousModel === 'des' && getControlValue(state, 'viscous-des-model', 'SST k-omega') === 'Spalart-Allmaras')
    case 'methods-is-coupled':
      return state.methods.coupling === 'Coupled' || state.solverType === 'density-based'
    case 'symmetry-note':
      return state.boundaries.symmetry.noFlux
    case 'outflow-backflow-warning':
      return state.boundaries.outflow.backflowWarning
    default: {
      const multiphaseChecked = getMultiphaseChecked(state, controlId)
      if (multiphaseChecked !== undefined) return multiphaseChecked
      const override = state.controlOverrides[controlOverrideKey(state, controlId)] ?? state.controlOverrides[controlId]
      return typeof override === 'boolean' ? override : fallback
    }
  }
}
