import { describe, expect, it } from 'vitest'
import {
  createInitialFluentSimState,
  fluentSimReducer,
} from '../fluentMock/state/fluentSimState'
import { parseAndExecuteTui } from '../fluentMock/state/fluentTuiCommands'

describe('Fluent simulation state machine', () => {
  it('couples Steady/Transient switching with Run Calculation and logs feedback', () => {
    const initial = createInitialFluentSimState()
    expect(initial.timeFormulation).toBe('steady')

    const transient = fluentSimReducer(initial, {
      type: 'SET_TIME_FORMULATION',
      value: 'transient',
    })
    expect(transient.timeFormulation).toBe('transient')
    expect(transient.consoleLogs.at(-1)?.text).toContain('Time Step Size')
  })

  it('synchronizes Gravity toggle and vector with Operating Conditions', () => {
    let state = createInitialFluentSimState()
    state = fluentSimReducer(state, {
      type: 'SET_GRAVITY_ENABLED',
      enabled: true,
    })
    expect(state.gravityEnabled).toBe(true)

    state = fluentSimReducer(state, {
      type: 'SET_OPERATING_CONDITIONS',
      gravityEnabled: false,
      pressure: '101000',
    })
    expect(state.gravityEnabled).toBe(false)
    expect(state.operatingPressure).toBe('101000')
  })

  it('couples Energy equation toggle with Solution Controls and Console', () => {
    const initial = createInitialFluentSimState()
    const withEnergy = fluentSimReducer(initial, {
      type: 'SET_ENERGY_ENABLED',
      enabled: true,
    })
    expect(withEnergy.energyEnabled).toBe(true)
    expect(withEnergy.controls.energyEquationEnabled).toBe(true)
    expect(withEnergy.consoleLogs.at(-1)?.text).toContain('Thermal tabs')
  })

  it('updates Viscous model and adds newly created Materials to fluids list', () => {
    let state = createInitialFluentSimState()
    state = fluentSimReducer(state, {
      type: 'SET_VISCOUS_MODEL',
      model: 'k-epsilon',
    })
    expect(state.viscousModel).toBe('k-epsilon')

    state = fluentSimReducer(state, {
      type: 'SET_CONTROL_VALUE',
      controlId: 'material-name',
      value: 'engine-oil',
    })
    state = fluentSimReducer(state, { type: 'UPSERT_MATERIAL' })
    expect(state.materials.fluids).toContain('engine-oil')
    expect(state.consoleLogs.at(-1)?.text).toContain('Cell Zone Conditions')
  })

  it('blocks Calculate before Initialize and unlocks Residuals after Initialize + Calculate', () => {
    let state = createInitialFluentSimState()
    expect(state.initialization.isInitialized).toBe(false)

    const warned = fluentSimReducer(state, { type: 'RUN_CALCULATE' })
    expect(warned.runCalculation.hasCalculated).toBe(false)
    expect(warned.consoleLogs.at(-1)?.kind).toBe('warning')

    state = fluentSimReducer(warned, {
      type: 'RUN_INITIALIZE',
      method: 'hybrid',
    })
    expect(state.initialization.isInitialized).toBe(true)

    state = fluentSimReducer(state, {
      type: 'RUN_CALCULATE',
      iterationsOverride: 120,
    })
    expect(state.runCalculation.hasCalculated).toBe(true)
    expect(state.runCalculation.completedIterations).toBe(120)
    expect(state.viewportTab).toBe('residuals')
    expect(state.consoleLogs.at(-1)?.kind).toBe('success')
  })

  it('executes TUI commands for mesh check, initialize, iterate, help and clear', () => {
    let state = createInitialFluentSimState()
    state = fluentSimReducer(state, parseAndExecuteTui('/mesh/check', state))
    expect(state.viewportTab).toBe('mesh')
    expect(state.consoleLogs.at(-1)?.text).toContain('Mesh check complete')

    state = fluentSimReducer(
      state,
      parseAndExecuteTui('/solve/initialize/hyb-initialization', state),
    )
    expect(state.initialization.isInitialized).toBe(true)

    state = fluentSimReducer(state, parseAndExecuteTui('/solve/iterate 60', state))
    expect(state.runCalculation.completedIterations).toBe(60)
    expect(state.viewportTab).toBe('residuals')

    state = fluentSimReducer(state, parseAndExecuteTui('help', state))
    expect(state.consoleLogs.at(-1)?.text).toContain('Available Teaching TUI commands')

    state = fluentSimReducer(state, parseAndExecuteTui('clear', state))
    expect(state.consoleLogs).toHaveLength(1)
  })

  it('supports extended models, check case, reports, partition, and meshing handoff', () => {
    let state = createInitialFluentSimState()

    state = fluentSimReducer(state, {
      type: 'APPLY_MESHING_HANDOFF',
      handoff: {
        fromMeshing: true,
        meshType: 'poly-hexcore',
        cellCount: 64200,
        surfaceFaceCount: 7800,
        minOrthogonalQuality: 0.36,
        maxSkewness: 0.68,
        boundaryLayers: 6,
        dimension: '3d',
        doublePrecision: true,
        processes: 8,
        boundarySummary: [{ name: 'velocity-inlet', type: 'velocity-inlet' }],
      },
    })
    expect(state.meshInfo.transferredFromMeshing).toBe(true)
    expect(state.meshInfo.cellCount).toBe(64200)
    expect(state.processes).toBe(8)

    state = fluentSimReducer(state, {
      type: 'SET_CONTROL_VALUE',
      controlId: 'multiphase-model-select',
      value: 'Volume of Fluid (VOF)',
    })
    expect(state.multiphaseModel).toBe('Volume of Fluid (VOF)')

    state = fluentSimReducer(state, parseAndExecuteTui('/solve/check-case', state))
    expect(state.consoleLogs.at(-1)?.text).toContain('Check Case completed')

    state = fluentSimReducer(
      state,
      parseAndExecuteTui('/report/fluxes/mass-flow', state),
    )
    expect(state.consoleLogs.at(-1)?.text).toContain('Mass Flow Rate')

    state = fluentSimReducer(state, { type: 'RUN_PARTITION' })
    expect(state.consoleLogs.at(-1)?.text).toContain('8 balanced subdomains')
  })
})
