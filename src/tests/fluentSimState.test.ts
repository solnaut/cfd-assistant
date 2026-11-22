import { describe, expect, it } from 'vitest'
import {
  createInitialFluentSimState,
  fluentSimReducer,
  getControlValue,
} from '../fluentMock/state/fluentSimState'
import { parseAndExecuteTui } from '../fluentMock/state/fluentTuiCommands'
import { fluentDialogs } from '../fluentMock/fluentDialogs'
import { availableDialogTabs } from '../fluentMock/state/fluentDialogView'
import { getMultiphaseOptions } from '../fluentMock/state/fluentMultiphaseState'
import { consumeMeshingHandoff, parseLauncherParams } from '../fluentMock/state/fluentWorkbenchBridge'

describe('Fluent simulation state machine', () => {
  it('limits volume-fraction schemes by model, interface type and formulation', () => {
    let state = createInitialFluentSimState()
    const set = (controlId: string, value: string) =>
      (state = fluentSimReducer(state, { type: 'SET_CONTROL_VALUE', controlId, value }))
    const scheme = 'multiphase-volume-fraction-scheme'
    const options = () => getMultiphaseOptions(state, scheme)?.map((option) => option.value)
    set('multiphase-model-select', 'Volume of Fluid (VOF)')
    expect(getControlValue(state, 'multiphase-vof-formulation')).toBe('Implicit')
    expect(options()).not.toContain('Geo-Reconstruct')
    state = fluentSimReducer(state, { type: 'SET_TIME_FORMULATION', value: 'transient' })
    expect(options()).toContain('Geo-Reconstruct')
    set(scheme, 'CICSAM')
    expect(getControlValue(state, scheme)).toBe('CICSAM')
    set('multiphase-vof-formulation', 'Implicit')
    expect(options()).not.toContain('CICSAM')
    expect(getControlValue(state, scheme)).toBe('Compressive')
    set('multiphase-interface-type', 'Dispersed')
    expect(options()).toEqual(['First Order Upwind', 'Second Order Upwind', 'QUICK'])
    set('multiphase-model-select', 'Eulerian')
    set('methods-pressure-velocity', 'Phase Coupled SIMPLE')
    expect(getControlValue(state, 'solution-methods-coupling')).toBe('Phase Coupled SIMPLE')
    set('multiphase-model-select', 'Wet Steam')
    expect(getControlValue(state, 'solution-methods-coupling')).toBe('SIMPLE')
  })

  it('keeps a renamed phase tied to its boundary values and removes deleted phase settings', () => {
    let state = createInitialFluentSimState()
    const set = (controlId: string, value: string | boolean) =>
      (state = fluentSimReducer(state, { type: 'SET_CONTROL_VALUE', controlId, value }))
    set('multiphase-model-select', 'Volume of Fluid (VOF)')
    set('multiphase-phase-add', true)
    set('multiphase-phase-name', 'coolant')
    set('velocity-inlet-phase-selection', '3')
    set('velocity-inlet-volume-fraction', '0.4')
    set('velocity-inlet-phase-selection', '2')
    expect(getControlValue(state, 'velocity-inlet-volume-fraction', '0')).toBe('0')
    set('velocity-inlet-phase-selection', '3')
    expect(getControlValue(state, 'velocity-inlet-volume-fraction', '0')).toBe('0.4')
    expect(getMultiphaseOptions(state, 'velocity-inlet-phase-selection')).toContainEqual({ value: '3', label: 'coolant' })
    set('multiphase-phase-delete', true)
    set('multiphase-phase-add', true)
    expect(getControlValue(state, 'multiphase-phase-name')).toBe('phase-3')
    set('velocity-inlet-phase-selection', '3')
    expect(getControlValue(state, 'velocity-inlet-volume-fraction', '0')).toBe('0')
  })

  it('requires a transient 3D VOF case and an unsteady DPM injection for Model Transition', () => {
    let state = createInitialFluentSimState()
    const set = (controlId: string, value: string | boolean) =>
      (state = fluentSimReducer(state, { type: 'SET_CONTROL_VALUE', controlId, value }))
    const dialog = fluentDialogs.find((item) => item.id === 'multiphase-model-dialog')!
    const tabs = () => availableDialogTabs(dialog, state).map((tab) => tab.id)
    set('multiphase-model-select', 'Volume of Fluid (VOF)')
    set('dpm-enable', true)
    set('dpm-unsteady-tracking', true)
    set('general-transient', true)
    expect(tabs()).not.toContain('transition')
    set('dpm-injection-name', 'liquid-injection')
    set('dpm-injection-save', true)
    expect(tabs()).toContain('transition')
    set('multiphase-coupled-level-set', true)
    expect(tabs()).not.toContain('transition')
    set('general-density-based', true)
    expect(tabs()).not.toContain('phases')
    expect(getMultiphaseOptions(state, 'multiphase-model-select')?.map((option) => option.value)).toEqual(['Off', 'Wet Steam'])
  })

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

  it('schedules export separately from immediate export and respects the frequency type', () => {
    const dialog = fluentDialogs.find((item) => item.id === 'export-solution-during-dialog')!
    let state = createInitialFluentSimState()
    state = fluentSimReducer(state, {
      type: 'SET_CONTROL_VALUE', controlId: dialog.id + '-path', value: 'elbow-export',
    })
    state = fluentSimReducer(state, {
      type: 'SET_CONTROL_VALUE', controlId: dialog.id + '-frequency', value: '5',
    })
    state = fluentSimReducer(state, { type: 'RUN_FILE_OPERATION', dialog })
    expect(state.exportSchedules[dialog.id]).toBeUndefined()
    expect(state.consoleLogs.at(-1)?.text).toContain('requires Transient')
    state = fluentSimReducer(state, { type: 'SET_TIME_FORMULATION', value: 'transient' })
    state = fluentSimReducer(state, { type: 'RUN_FILE_OPERATION', dialog })
    expect(state.exportSchedules[dialog.id]).toMatchObject({ path: 'elbow-export', frequency: 5, unit: 'Time Steps' })
    expect(state.consoleLogs.at(-1)?.text).toContain('Scheduled Solution Data export')
    state = fluentSimReducer(state, { type: 'RUN_INITIALIZE', method: 'hybrid' })
    state = fluentSimReducer(state, { type: 'RUN_CALCULATE', iterationsOverride: 12 })
    expect(state.consoleLogs.at(-1)?.text).toContain('2 scheduled export(s)')
    state = fluentSimReducer(state, { type: 'SET_TIME_FORMULATION', value: 'steady' })
    state = fluentSimReducer(state, { type: 'RUN_CALCULATE', iterationsOverride: 12 })
    expect(state.consoleLogs.at(-1)?.text).not.toContain('scheduled export(s)')
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

    state = fluentSimReducer(state, parseAndExecuteTui('/solve/iterate 60abc', state))
    expect(state.runCalculation.hasCalculated).toBe(false)
    expect(state.consoleLogs.at(-1)?.text).toContain('positive integer')

    state = fluentSimReducer(state, parseAndExecuteTui('/solve/iterate 60', state))
    expect(state.runCalculation.completedIterations).toBe(60)
    expect(state.viewportTab).toBe('residuals')

    state = fluentSimReducer(state, parseAndExecuteTui('help', state))
    expect(state.consoleLogs.at(-1)?.text).toContain('Available Teaching TUI commands')

    state = fluentSimReducer(state, parseAndExecuteTui('clear', state))
    expect(state.consoleLogs).toHaveLength(1)
  })

  it('parses only whole process counts and tolerates damaged Meshing handoff records', () => {
    expect(parseLauncherParams('?dim=2d&dp=0&np=8junk')).toEqual({ dimension: '2d', doublePrecision: false })
    expect(parseLauncherParams('?np=8')).toEqual({ processes: 8 })
    window.sessionStorage.setItem('cfd_assistant_meshing_to_solution_handoff_v1', JSON.stringify({
      fromMeshing: true,
      cellCount: 20000,
      processes: 2.5,
      boundarySummary: [null, { name: 'inlet', type: 'velocity-inlet' }, { name: 'broken' }],
    }))
    const handoff = consumeMeshingHandoff()
    expect(handoff).toMatchObject({
      cellCount: 20000, processes: 4,
      boundarySummary: [{ name: 'inlet', type: 'velocity-inlet' }],
    })
    expect(consumeMeshingHandoff()).toBeNull()
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
