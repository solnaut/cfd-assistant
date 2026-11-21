import type {
  FluentDimension,
  FluentLauncherConfig,
  MeshingToSolutionHandoff,
} from './fluentWorkbenchBridge'

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
  | 'residuals'
  | 'xy-plot'

export type HighlightedBoundary =
  | null
  | 'inlet'
  | 'outlet'
  | 'wall'
  | 'symmetry'

export type CameraPreset = 'isometric' | 'front' | 'top' | 'left'

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
  energyEnabled: boolean
  viscousHeating: boolean
  diffusionEnergySource: boolean
  viscousModel:
    | 'inviscid'
    | 'laminar'
    | 'spalart-allmaras'
    | 'k-epsilon'
    | 'k-omega-sst'
    | 'transition-sst'
    | 'rsm'
    | 'les'
  kEpsilonSubModel: 'standard' | 'rng' | 'realizable'
  kOmegaSubModel: 'standard' | 'bsl' | 'sst' | 'geko'
  nearWallTreatment:
    | 'Standard Wall Functions'
    | 'Scalable Wall Functions'
    | 'Enhanced Wall Treatment'
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
    coupling: 'SIMPLE' | 'SIMPLEC' | 'PISO' | 'Coupled'
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
  viewportTab: ViewportTab
  highlightedBoundary: HighlightedBoundary
  controlOverrides: Record<string, string | boolean>
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
  | { type: 'RUN_MESH_CHECK' }
  | { type: 'RUN_MESH_QUALITY' }
  | { type: 'DISPLAY_MESH' }
  | { type: 'RUN_CASE_CHECK' }
  | { type: 'RUN_INITIALIZE'; method?: 'hybrid' | 'standard' }
  | { type: 'RESET_INITIALIZATION' }
  | { type: 'RUN_PATCH' }
  | { type: 'RUN_CALCULATE'; iterationsOverride?: number }
  | { type: 'APPLY_DIALOG'; dialogTitle: string }
  | { type: 'COMPUTE_REPORT'; reportLabel: string }
  | { type: 'RUN_FLUXES_REPORT' }
  | { type: 'RUN_FORCES_REPORT' }
  | { type: 'RUN_VOLUME_INTEGRAL' }
  | { type: 'RUN_PARTITION' }
  | { type: 'RESET_URF_DEFAULTS' }
  | { type: 'SET_CAMERA_PRESET'; preset: CameraPreset }
  | {
      type: 'APPLY_MESHING_HANDOFF'
      handoff?: MeshingToSolutionHandoff | null
      launcher?: Partial<FluentLauncherConfig>
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
    viewportTab: 'mesh',
    highlightedBoundary: null,
    controlOverrides: {},
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
      return 'SST k-omega'
    case 'transition-sst':
      return 'Transition SST'
    case 'rsm':
      return 'RSM'
    case 'les':
      return 'LES / DES'
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
        if (
          nextDim === state.dimension &&
          nextDp === state.doublePrecision &&
          nextNp === state.processes
        ) {
          return state
        }
        return {
          ...state,
          dimension: nextDim,
          doublePrecision: nextDp,
          processes: nextNp,
          ...appendLogs(state, [
            {
              kind: 'info',
              text: `[Launcher Config] Session configured as [${nextDim}, ${nextDp ? 'dp' : 'sp'}, np=${nextNp}].`,
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
                : `Standard Initialization: computing initial field from ${state.initialization.computeFrom}...`,
          },
          {
            kind: 'success',
            text: 'Initialization complete (Teaching Demo). Ready to run calculation.',
          },
        ]),
      }
    }

    case 'RESET_INITIALIZATION': {
      return {
        ...state,
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
      if (!state.initialization.isInitialized) {
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

      const requestedSteps =
        action.iterationsOverride ??
        (Number.parseInt(
          state.timeFormulation === 'transient'
            ? state.runCalculation.numberOfTimeSteps
            : state.runCalculation.iterations,
          10,
        ) || 250)

      return {
        ...state,
        viewportTab: 'residuals',
        runCalculation: {
          ...state.runCalculation,
          hasCalculated: true,
          completedIterations: requestedSteps,
        },
        ...appendLogs(state, [
          {
            kind: 'command',
            text:
              state.timeFormulation === 'transient'
                ? `> /solve/dual-time-iterate ${requestedSteps} ${state.runCalculation.maxIterationsPerTimeStep}`
                : `> /solve/iterate ${requestedSteps}`,
          },
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
            text: `Teaching Demo converged after ${requestedSteps} ${state.timeFormulation === 'transient' ? 'time steps' : 'iterations'}. Contours, Vectors & Pathlines unlocked.`,
          },
        ]),
      }
    }

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
      return {
        ...state,
        ...appendLogs(state, [
          {
            kind: 'output',
            text: `[Teaching Demo] ${action.reportLabel}: Area-Weighted Velocity = 2.54 m/s, Mass Imbalance = 1.2e-06 kg/s.`,
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

function applyControlValue(
  state: FluentSimState,
  controlId: string,
  value: string | boolean,
): FluentSimState {
  const str = String(value)
  const bool = Boolean(value)

  switch (controlId) {
    case 'general-pressure-based':
    case 'solver-type-pressure-based':
      return { ...state, solverType: 'pressure-based' }
    case 'general-density-based':
    case 'solver-type-density-based':
      return { ...state, solverType: 'density-based' }
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
    case 'multiphase-model-select':
      return {
        ...state,
        multiphaseModel: str,
        ...appendLogs(state, [
          { kind: 'info', text: `Multiphase model set to ${str}.` },
        ]),
      }
    case 'radiation-model-select':
      return {
        ...state,
        radiationModel: str,
        ...appendLogs(state, [
          { kind: 'info', text: `Radiation model set to ${str}.` },
        ]),
      }
    case 'species-model-select':
      return {
        ...state,
        speciesModel: str,
        ...appendLogs(state, [
          { kind: 'info', text: `Species model set to ${str}.` },
        ]),
      }
    case 'dpm-interaction':
      return { ...state, dpmEnabled: bool }
    case 'hx-model-type':
      return { ...state, heatExchangerModel: str }
    case 'solidification-enable':
      return { ...state, solidificationEnabled: bool }
    case 'acoustics-model-select':
      return { ...state, acousticsModel: str }
    case 'wall-film-enable':
      return { ...state, wallFilmEnabled: bool }
    case 'battery-model-select':
      return { ...state, batteryModel: str }
    case 'energy-enable':
    case 'eq-energy':
      return fluentSimReducer(state, {
        type: 'SET_ENERGY_ENABLED',
        enabled: bool,
      })
    case 'energy-viscous-heating':
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
    case 'viscous-transition-sst':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'transition-sst' })
    case 'viscous-rsm':
      return fluentSimReducer(state, { type: 'SET_VISCOUS_MODEL', model: 'rsm' })
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
    case 'reference-values-compute-from':
      return {
        ...state,
        referenceValues: { ...state.referenceValues, computeFrom: str },
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
      return {
        ...state,
        initialization: { ...state.initialization, method: 'hybrid' },
      }
    case 'initialization-compute-from':
      return {
        ...state,
        initialization: { ...state.initialization, computeFrom: str },
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
      return {
        ...state,
        runCalculation: { ...state.runCalculation, numberOfTimeSteps: str },
      }
    case 'run-calculation-time-step':
      return {
        ...state,
        runCalculation: { ...state.runCalculation, timeStepSize: str },
      }
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
          [controlId]: value,
        },
      }
  }
}

export function getControlValue(
  state: FluentSimState,
  controlId: string,
  fallback = '',
): string {
  switch (controlId) {
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
    case 'hx-model-type':
      return state.heatExchangerModel
    case 'acoustics-model-select':
      return state.acousticsModel
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
      return state.nearWallTreatment
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
      return state.runCalculation.timeStepSize
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
      const override = state.controlOverrides[controlId]
      return typeof override === 'string' ? override : fallback
    }
  }
}

export function getControlChecked(
  state: FluentSimState,
  controlId: string,
  fallback = false,
): boolean {
  switch (controlId) {
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
      return state.viscousHeating
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
    case 'viscous-transition-sst':
      return state.viscousModel === 'transition-sst'
    case 'viscous-rsm':
      return state.viscousModel === 'rsm'
    case 'viscous-les':
      return state.viscousModel === 'les'
    case 'viscous-curvature-correction':
      return state.curvatureCorrection
    case 'viscous-production-limiter':
      return state.productionLimiter
    case 'dpm-interaction':
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
    case 'cell-zone-solid-fixed-temp':
      return state.cellZoneSolidFixedTemp
    case 'solution-controls-energy':
      return state.controls.energyEquationEnabled
    case 'initialization-method':
      return state.initialization.method === 'hybrid'
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
    case 'symmetry-note':
      return state.boundaries.symmetry.noFlux
    case 'outflow-backflow-warning':
      return state.boundaries.outflow.backflowWarning
    default: {
      const override = state.controlOverrides[controlId]
      return typeof override === 'boolean' ? override : fallback
    }
  }
}
