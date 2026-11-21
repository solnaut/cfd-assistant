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
  | 'residuals'
  | 'xy-plot'

export type HighlightedBoundary =
  | null
  | 'inlet'
  | 'outlet'
  | 'wall'
  | 'symmetry'

export interface FluentSimState {
  solverType: 'pressure-based' | 'density-based'
  velocityFormulation: 'absolute' | 'relative'
  timeFormulation: 'steady' | 'transient'
  gravityEnabled: boolean
  gravityVector: { x: string; y: string; z: string }
  operatingPressure: string
  operatingDensity: string
  energyEnabled: boolean
  viscousHeating: boolean
  diffusionEnergySource: boolean
  viscousModel: 'laminar' | 'k-epsilon' | 'k-omega-sst'
  kEpsilonSubModel: 'standard' | 'rng' | 'realizable'
  nearWallTreatment:
    | 'Standard Wall Functions'
    | 'Scalable Wall Functions'
    | 'Enhanced Wall Treatment'
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
    energyScheme: string
    transientFormulation: string
  }
  controls: {
    pressureUrf: string
    momentumUrf: string
    energyEquationEnabled: boolean
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
    referenceFrame: string
    isInitialized: boolean
    patchRegion: string
    patchVariable: string
    patchValue: string
  }
  runCalculation: {
    iterations: string
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
      model: 'laminar' | 'k-epsilon' | 'k-omega-sst'
    }
  | {
      type: 'SET_NEAR_WALL_TREATMENT'
      treatment: FluentSimState['nearWallTreatment']
    }
  | { type: 'UPSERT_MATERIAL' }
  | { type: 'RUN_MESH_CHECK' }
  | { type: 'RUN_MESH_QUALITY' }
  | { type: 'DISPLAY_MESH' }
  | { type: 'RUN_INITIALIZE'; method?: 'hybrid' | 'standard' }
  | { type: 'RUN_PATCH' }
  | { type: 'RUN_CALCULATE'; iterationsOverride?: number }
  | { type: 'APPLY_DIALOG'; dialogTitle: string }
  | { type: 'COMPUTE_REPORT'; reportLabel: string }
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
    solverType: 'pressure-based',
    velocityFormulation: 'absolute',
    timeFormulation: 'steady',
    gravityEnabled: false,
    gravityVector: { x: '0', y: '-9.81', z: '0' },
    operatingPressure: '101325',
    operatingDensity: '1.225',
    energyEnabled: false,
    viscousHeating: false,
    diffusionEnergySource: false,
    viscousModel: 'k-omega-sst',
    kEpsilonSubModel: 'realizable',
    nearWallTreatment: 'Enhanced Wall Treatment',
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
      energyScheme: 'Second Order Upwind',
      transientFormulation: 'First Order Implicit',
    },
    controls: {
      pressureUrf: '0.3',
      momentumUrf: '0.7',
      energyEquationEnabled: false,
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
      referenceFrame: 'Relative to Cell Zone',
      isInitialized: false,
      patchRegion: 'fluid-domain',
      patchVariable: 'Temperature',
      patchValue: '300 K',
    },
    runCalculation: {
      iterations: '250',
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

export function fluentSimReducer(
  state: FluentSimState,
  action: FluentSimAction,
): FluentSimState {
  switch (action.type) {
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
              action.model === 'laminar'
                ? 'Viscous model set to Laminar. Turbulence inputs in inlets/outlets are bypassed.'
                : `Viscous model set to ${action.model === 'k-epsilon' ? `k-epsilon (${state.kEpsilonSubModel})` : 'k-omega SST'}. Check y+ target and near-wall mesh.`,
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
            text: 'Volume statistics: minimum volume = 1.42e-09 m³ (> 0). Mesh check complete (Teaching Demo).',
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
            text: 'Minimum Orthogonal Quality = 2.10e-01 | Maximum Aspect Ratio = 1.45e+02 | Max Skewness = 0.82',
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
                : 'Standard Initialization: computing initial field from inlet reference values...',
          },
          {
            kind: 'success',
            text: 'Initialization complete (Teaching Demo). Ready to run calculation.',
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
            text: `Teaching Demo converged after ${requestedSteps} ${state.timeFormulation === 'transient' ? 'time steps' : 'iterations'}. Contours & Vectors preview unlocked.`,
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
    case 'energy-enable':
      return fluentSimReducer(state, {
        type: 'SET_ENERGY_ENABLED',
        enabled: bool,
      })
    case 'energy-viscous-heating':
      return { ...state, viscousHeating: bool }
    case 'energy-diffusion':
      return { ...state, diffusionEnergySource: bool }
    case 'viscous-laminar':
      return fluentSimReducer(state, {
        type: 'SET_VISCOUS_MODEL',
        model: 'laminar',
      })
    case 'viscous-kepsilon':
      return fluentSimReducer(state, {
        type: 'SET_VISCOUS_MODEL',
        model: 'k-epsilon',
      })
    case 'viscous-kw-sst':
      return fluentSimReducer(state, {
        type: 'SET_VISCOUS_MODEL',
        model: 'k-omega-sst',
      })
    case 'viscous-wall-treatment':
      return fluentSimReducer(state, {
        type: 'SET_NEAR_WALL_TREATMENT',
        treatment: str as FluentSimState['nearWallTreatment'],
      })
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
    case 'solution-controls-pressure':
      return {
        ...state,
        controls: { ...state.controls, pressureUrf: str },
      }
    case 'solution-controls-momentum':
      return {
        ...state,
        controls: { ...state.controls, momentumUrf: str },
      }
    case 'solution-controls-energy':
      return {
        ...state,
        controls: { ...state.controls, energyEquationEnabled: bool },
      }
    case 'initialization-method':
      return {
        ...state,
        initialization: { ...state.initialization, method: 'hybrid' },
      }
    case 'initialization-reference-frame':
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
      return state
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
    case 'solver-velocity-formulation':
      return state.velocityFormulation === 'relative' ? 'Relative' : 'Absolute'
    case 'solver-time-formulation':
      return state.timeFormulation === 'transient' ? 'Transient' : 'Steady'
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
    case 'solution-methods-pressure':
      return state.methods.pressure
    case 'methods-momentum':
    case 'solution-methods-momentum':
      return state.methods.momentum
    case 'solution-controls-pressure':
      return state.controls.pressureUrf
    case 'solution-controls-momentum':
      return state.controls.momentumUrf
    case 'initialization-reference-frame':
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
    default:
      return fallback
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
      return state.energyEnabled
    case 'energy-viscous-heating':
      return state.viscousHeating
    case 'energy-diffusion':
      return state.diffusionEnergySource
    case 'viscous-laminar':
      return state.viscousModel === 'laminar'
    case 'viscous-kepsilon':
      return state.viscousModel === 'k-epsilon'
    case 'viscous-kw-sst':
      return state.viscousModel === 'k-omega-sst'
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
    default:
      return fallback
  }
}
