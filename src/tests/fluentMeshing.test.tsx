import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import {
  faultTolerantWorkflowSteps,
  meshingControlCatalog,
  meshingRibbonTabs,
  visibleWatertightSteps,
  watertightWorkflowSteps,
} from '../fluentMock/meshing/meshingData'
import { meshingExplanations } from '../fluentMock/meshing/meshingExplanations'
import { meshingOperationGuides } from '../fluentMock/meshing/meshingOperationGuides'
import {
  buildMeshingToSolutionHandoff,
  createInitialMeshingState,
  fluentMeshingReducer,
  parseAndExecuteMeshingTui,
} from '../fluentMock/meshing/meshingState'

describe('Fluent Meshing data & state machine', () => {
  it('has unique control IDs, populated ribbon tabs, and 100% explanation coverage', () => {
    const ids = meshingControlCatalog.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)

    expect(visibleWatertightSteps(false, false)).toHaveLength(10)
    expect(meshingRibbonTabs).toHaveLength(9)
    for (const tab of meshingRibbonTabs) {
      const cmdCount = tab.groups.reduce(
        (sum, group) => sum + group.commands.length,
        0,
      )
      expect(cmdCount).toBeGreaterThan(0)
    }

    for (const item of meshingControlCatalog) {
      const exp = meshingExplanations[item.explanationId]
      expect(exp).toBeDefined()
      expect(exp.whatItIs).toBeTruthy()
      expect(exp.recommendation).toBeTruthy()
      expect(exp.checkItems.length).toBeGreaterThan(0)
    }
  })

  it('requires Multizone controls and replaces the ordinary volume task only when all regions are covered', () => {
    let state = createInitialMeshingState()
    state = fluentMeshingReducer(state, { type: 'RUN_IMPORT_GEOMETRY' })
    state = fluentMeshingReducer(state, { type: 'RUN_SURFACE_MESH' })
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_DESCRIBE_GEOMETRY',
      patch: { geometryType: 'fluid-and-solid', shareTopology: 'no', applyMultizone: true },
    })
    state = fluentMeshingReducer(state, { type: 'APPLY_DESCRIBE_GEOMETRY' })
    state = fluentMeshingReducer(state, { type: 'APPLY_UPDATE_BOUNDARIES' })
    state = fluentMeshingReducer(state, { type: 'APPLY_UPDATE_REGIONS' })
    state = fluentMeshingReducer(state, { type: 'APPLY_BOUNDARY_LAYERS' })
    expect(state.activeTaskId).toBe('wm-multizone-controls')
    expect(fluentMeshingReducer(state, { type: 'RUN_VOLUME_MESH' }).volumeMesh.generated).toBe(false)
    for (const [index, region] of state.regions.entries()) {
      state = fluentMeshingReducer(state, {
        type: 'UPDATE_MULTIZONE',
        patch: { form: { regionId: region.id, method: 'Standard', fill: 'Hex-Map', sweepSize: '2' } },
      })
      state = fluentMeshingReducer(state, { type: 'SAVE_MULTIZONE_CONTROL' })
      expect(state.activeTaskId).toBe('wm-multizone-mesh')
      state = fluentMeshingReducer(state, { type: 'RUN_MULTIZONE_MESH' })
      expect(state.volumeMesh.generated).toBe(index === 1)
      expect(state.activeTaskId).toBe(index === 1 ? 'wm-improve-mesh' : 'wm-volume-mesh')
    }
    expect(buildMeshingToSolutionHandoff(state).meshType).toBe('multizone')
    const rerun = fluentMeshingReducer(state, { type: 'REVERT_TASK', taskId: 'wm-multizone-controls' })
    expect(rerun.volumeMesh.generated).toBe(false)
    expect(rerun.skippedTasks).not.toContain('wm-volume-mesh')
  })

  it('inserts Watertight capping after shared topology and adds capped boundaries', () => {
    let state = createInitialMeshingState()
    state = fluentMeshingReducer(state, { type: 'RUN_IMPORT_GEOMETRY' })
    state = fluentMeshingReducer(state, { type: 'RUN_SURFACE_MESH' })
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_DESCRIBE_GEOMETRY',
      patch: { geometryType: 'solid-only', shareTopology: 'yes', capOpenings: true },
    })
    state = fluentMeshingReducer(state, { type: 'APPLY_DESCRIBE_GEOMETRY' })
    expect(state.activeTaskId).toBe('wm-share-topology')
    state = fluentMeshingReducer(state, { type: 'RUN_SHARE_TOPOLOGY' })
    expect(state.activeTaskId).toBe('wm-capping')
    const blocked = fluentMeshingReducer(state, { type: 'APPLY_UPDATE_BOUNDARIES' })
    expect(blocked.activeTaskId).toBe('wm-capping')
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_WATERTIGHT_CAP',
      patch: { opening: 'inlet-opening', name: 'coolant-inlet' },
    })
    state = fluentMeshingReducer(state, { type: 'ADD_WATERTIGHT_CAP' })
    state = fluentMeshingReducer(state, { type: 'APPLY_WATERTIGHT_CAPS' })
    expect(state.boundaries).toContainEqual(expect.objectContaining({ name: 'coolant-inlet', type: 'velocity-inlet' }))
    expect(state.regions).toContainEqual(expect.objectContaining({ name: 'enclosed-fluid', type: 'fluid' }))
    expect(state.activeTaskId).toBe('wm-update-boundaries')
  })

  it('guards Volume Mesh before Surface Mesh and executes the full watertight workflow', () => {
    let state = createInitialMeshingState({
      dimension: '3d',
      doublePrecision: true,
      processes: 8,
    })

    // Guard before surface mesh
    const guarded = fluentMeshingReducer(state, { type: 'RUN_VOLUME_MESH' })
    expect(guarded.volumeMesh.generated).toBe(false)
    expect(guarded.consoleLogs.at(-1)?.kind).toBe('warning')
    expect(guarded.activeTaskId).toBe('wm-surface-mesh')

    // Import -> Local Sizing -> Surface Mesh
    state = fluentMeshingReducer(state, { type: 'RUN_IMPORT_GEOMETRY' })
    expect(state.completedTasks).toContain('wm-import-geometry')
    expect(state.activeTaskId).toBe('wm-local-sizing')

    state = fluentMeshingReducer(state, { type: 'ADD_LOCAL_SIZING' })
    expect(state.localSizings.length).toBe(2)

    state = fluentMeshingReducer(state, { type: 'RUN_SURFACE_MESH' })
    expect(state.surfaceMesh.generated).toBe(true)
    expect(state.viewportTab).toBe('surface-mesh')

    // Describe Geometry: fluid-and-solid without share topology skips step 5 and adds solid region
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_DESCRIBE_GEOMETRY',
      patch: { geometryType: 'fluid-and-solid', shareTopology: 'no' },
    })
    state = fluentMeshingReducer(state, { type: 'APPLY_DESCRIBE_GEOMETRY' })
    expect(state.regions.some((r) => r.type === 'solid')).toBe(true)
    expect(state.skippedTasks).toContain('wm-share-topology')
    expect(state.activeTaskId).toBe('wm-update-boundaries')

    // Update Boundaries -> Update Regions -> Add Boundary Layers -> Volume Mesh -> Improve
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_BOUNDARY_TYPE',
      id: 'mz-wall-heated',
      boundaryType: 'wall',
    })
    state = fluentMeshingReducer(state, { type: 'APPLY_UPDATE_BOUNDARIES' })
    state = fluentMeshingReducer(state, { type: 'APPLY_UPDATE_REGIONS' })
    const invalidLayers = fluentMeshingReducer(state, {
      type: 'UPDATE_BOUNDARY_LAYERS_FORM', patch: { numberOfLayers: '8junk' },
    })
    const blocked = fluentMeshingReducer(invalidLayers, { type: 'RUN_VOLUME_MESH' })
    expect(blocked.volumeMesh.generated).toBe(false)
    expect(blocked.activeTaskId).toBe('wm-boundary-layers')
    expect(blocked.consoleLogs.at(-1)?.text).toContain('positive whole number')
    state = fluentMeshingReducer(state, {
      type: 'UPDATE_BOUNDARY_LAYERS_FORM',
      patch: { offsetMethod: 'uniform', numberOfLayers: '8', firstHeight: '0.05' },
    })
    state = fluentMeshingReducer(state, { type: 'APPLY_BOUNDARY_LAYERS' })
    state = fluentMeshingReducer(state, { type: 'RUN_VOLUME_MESH' })
    expect(state.volumeMesh.generated).toBe(true)
    expect(state.viewportTab).toBe('volume-mesh')
    const qualityBefore = state.volumeMesh.minOrthogonalQuality

    state = fluentMeshingReducer(state, { type: 'RUN_IMPROVE_VOLUME_MESH' })
    expect(state.volumeMesh.minOrthogonalQuality).toBeGreaterThan(qualityBefore)
    expect(state.viewportTab).toBe('quality')
    const previousMesh = fluentMeshingReducer(state, { type: 'REVERT_TASK', taskId: 'wm-improve-mesh' })
    expect(previousMesh.volumeMesh.generated).toBe(true)
    expect(previousMesh.volumeMesh.minOrthogonalQuality).toBe(qualityBefore)
    expect(previousMesh.completedTasks).not.toContain('wm-improve-mesh')
    const retargeted = fluentMeshingReducer(state, {
      type: 'UPDATE_VOLUME_MESH_FORM', patch: { fillWith: 'tetrahedral' },
    })
    expect(retargeted.volumeMesh.generated).toBe(false)

    const handoff = buildMeshingToSolutionHandoff(state)
    expect(handoff.fromMeshing).toBe(true)
    expect(handoff.boundaryLayers).toBe(8)
    expect(handoff.processes).toBe(8)
    expect(fluentMeshingReducer(state, {
      type: 'UPDATE_BOUNDARY_LAYERS_FORM', patch: { numberOfLayers: '9' },
    }).volumeMesh.generated).toBe(false)
    const remeshed = fluentMeshingReducer(state, { type: 'RUN_SURFACE_MESH' })
    expect(remeshed.surfaceMesh.generated).toBe(true)
    expect(remeshed.volumeMesh.generated).toBe(false)
    expect(remeshed.completedTasks).not.toContain('wm-volume-mesh')
    const reverted = fluentMeshingReducer(remeshed, { type: 'REVERT_TASK', taskId: 'wm-import-geometry' })
    expect(reverted.importGeometry.imported).toBe(false)
    expect(reverted.surfaceMesh.generated).toBe(false)

    // TUI commands
    state = fluentMeshingReducer(
      state,
      parseAndExecuteMeshingTui('/workflow/status', state),
    )
    expect(state.consoleLogs.at(-1)?.text).toContain('Completed steps')
  })

  it('renders /fluent-meshing workbench, navigates workflow & outline, and hands off to Solution', () => {
    window.sessionStorage.clear()
    render(
      <MemoryRouter initialEntries={['/fluent-meshing']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: /Fluent Meshing Workbench/ }),
    ).toBeInTheDocument()

    const workflowPane = within(screen.getByRole('complementary', { name: 'Workflow' }))

    // Switch to Outline View and back to Workflow
    fireEvent.click(workflowPane.getByRole('tab', { name: 'Outline View' }))
    expect(workflowPane.getByText('Geometry Objects')).toBeInTheDocument()
    expect(workflowPane.getByText('Boundary Zones')).toBeInTheDocument()
    fireEvent.click(workflowPane.getByRole('tab', { name: 'Workflow' }))
    const taskPane = within(screen.getByRole('region', { name: 'Task Page' }))

    fireEvent.click(taskPane.getByRole('button', { name: 'Import Geometry' }))
    fireEvent.click(
      workflowPane.getByRole('button', { name: /Generate the Surface Mesh/ }),
    )
    fireEvent.change(taskPane.getByLabelText('Size Functions'), { target: { value: 'proximity' } })
    expect(taskPane.queryByLabelText('Curvature Normal Angle (°)')).not.toBeInTheDocument()
    expect(taskPane.getByLabelText('Cells Per Gap')).toBeInTheDocument()
    fireEvent.click(
      taskPane.getByRole('button', { name: 'Generate the Surface Mesh' }),
    )
    expect(
      screen.getByRole('region', { name: 'Console' }),
    ).toHaveTextContent(/Generated .* surface faces/i)
    fireEvent.click(taskPane.getByRole('button', { name: 'Describe Geometry' }))
    fireEvent.click(taskPane.getByRole('button', { name: 'Apply Share Topology' }))
    fireEvent.click(taskPane.getByRole('button', { name: 'Update Boundaries' }))
    fireEvent.click(taskPane.getByRole('button', { name: 'Update Regions' }))

    // Jump to Add Boundary Layers and test conditional Uniform offset input
    fireEvent.click(
      workflowPane.getByRole('button', { name: /Add Boundary Layers/ }),
    )
    fireEvent.change(taskPane.getByLabelText('Offset Method Type'), {
      target: { value: 'uniform' },
    })
    expect(taskPane.getByLabelText('First Height (mm)')).toBeInTheDocument()
    fireEvent.click(taskPane.getByRole('button', { name: 'Add Boundary Layers' }))

    // Jump to Volume Mesh, change to tetrahedral, generate, then Switch to Solution
    fireEvent.click(
      workflowPane.getByRole('button', { name: /Generate the Volume Mesh/ }),
    )
    fireEvent.change(taskPane.getByLabelText('Fill With'), {
      target: { value: 'tetrahedral' },
    })
    fireEvent.click(
      taskPane.getByRole('button', { name: 'Generate the Volume Mesh' }),
    )
    expect(
      screen.getByRole('region', { name: 'Console' }),
    ).toHaveTextContent(/Volume mesh cells =/i)

    // Troubleshooting tab in Inspector
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    fireEvent.click(guide.getByRole('button', { name: 'Troubleshooting' }))
    expect(
      guide.getByRole('heading', { name: 'Fluent Meshing 常见网格故障排查' }),
    ).toBeInTheDocument()

    // Switch to Solution transfers handoff into Fluent Solver
    fireEvent.click(
      screen.getByRole('button', { name: 'Switch to Solution' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Fluent Solver Workbench' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: 'Console' }),
    ).toHaveTextContent(/Received tetrahedral mesh from Fluent Meshing/i)
  })

  it('opens every Watertight task panel with its own controls once conditional branches are enabled', () => {
    window.sessionStorage.clear()
    render(<MemoryRouter initialEntries={['/fluent-meshing?task=wm-multizone-mesh']}><App /></MemoryRouter>)
    const workflow = within(screen.getByRole('complementary', { name: 'Workflow' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    expect(task.getByRole('heading', { level: 2 })).toHaveTextContent('Describe Geometry')
    expect(screen.getByRole('region', { name: 'Console' })).toHaveTextContent('Set the corresponding option in Describe Geometry')
    expect(workflow.queryByRole('button', { name: /Generate the Multizone Mesh/ })).not.toBeInTheDocument()
    function openTask(title: string) {
      fireEvent.click(workflow.getByRole('button', { name: new RegExp(title.replace(/[()]/g, '\\$&')) }))
      expect(task.getByRole('heading', { level: 2 })).toHaveTextContent(title)
    }
    openTask('Import Geometry')
    fireEvent.click(task.getByRole('button', { name: 'Import Geometry' }))
    openTask('Generate the Surface Mesh')
    fireEvent.click(task.getByRole('button', { name: 'Generate the Surface Mesh' }))
    fireEvent.change(task.getByLabelText('Geometry Type'), { target: { value: 'solid-only' } })
    fireEvent.click(task.getByRole('checkbox', { name: 'Cap Openings' }))
    fireEvent.click(task.getByRole('checkbox', { name: 'Apply Multizone Meshing' }))
    fireEvent.click(task.getByRole('button', { name: 'Describe Geometry' }))
    for (const { label } of watertightWorkflowSteps) {
      openTask(label)
      expect(task.getAllByRole('button').length).toBeGreaterThan(0)
    }
  })

  it.each(['ft-capping', 'ft-leakage'])('routes an early %s link to Describe Geometry and Flow', (taskId) => {
    window.sessionStorage.clear()
    render(<MemoryRouter initialEntries={[`/fluent-meshing?task=${taskId}`]}><App /></MemoryRouter>)
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    expect(task.getByRole('heading', { level: 2 })).toHaveTextContent('Describe Geometry and Flow')
    expect(task.getByRole('button', { name: 'Update' })).toBeInTheDocument()
  })

  it('reveals and runs the Fault-Tolerant branches before wrapping the surface mesh', () => {
    window.sessionStorage.clear()
    render(
      <MemoryRouter initialEntries={['/fluent-meshing']}>
        <App />
      </MemoryRouter>,
    )
    const workflow = within(screen.getByRole('complementary', { name: 'Workflow' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    const mode = workflow.getByRole('combobox', { name: 'Workflow Template' })
    fireEvent.change(mode, { target: { value: 'fault-tolerant' } })
    expect(workflow.queryByRole('button', { name: /Enclose Fluid Regions/ })).not.toBeInTheDocument()
    fireEvent.click(task.getByRole('button', { name: 'Import Geometry and Part Management' }))
    fireEvent.click(task.getByRole('button', { name: 'Update' }))
    expect(workflow.getByRole('button', { name: /Enclose Fluid Regions/ })).toHaveAttribute('aria-current', 'step')
    fireEvent.click(task.getByRole('button', { name: 'Add Cap(s)' }))
    expect(task.getByRole('list', { name: 'Caps' })).toHaveTextContent('inlet-cap · elbow-inlet · inlet')
    fireEvent.click(task.getByRole('button', { name: 'Update' }))
    fireEvent.click(task.getByRole('button', { name: 'Identify Regions' }))
    fireEvent.click(task.getByRole('button', { name: 'Preview Leakages' }))
    expect(task.getByRole('status')).toHaveTextContent('1 sample gap(s)')
    fireEvent.change(task.getByRole('textbox', { name: 'Maximum Leakage Size (mm)' }), { target: { value: '3' } })
    fireEvent.click(task.getByRole('button', { name: 'Preview Leakages' }))
    expect(task.getByRole('status')).toHaveTextContent('2 sample gap(s)')
    fireEvent.click(task.getByRole('button', { name: 'Define Leakage Threshold' }))
    fireEvent.click(task.getByRole('button', { name: 'Update Regions' }))
    fireEvent.click(workflow.getByRole('button', { name: /Generate the Surface Mesh/ }))
    fireEvent.click(task.getByRole('button', { name: 'Generate the Surface Mesh' }))
    expect(consolePane.getByText(/Generated .* wrapped surface faces/)).toBeInTheDocument()
    fireEvent.click(task.getByRole('button', { name: 'Update Boundaries' }))
    fireEvent.click(workflow.getByRole('button', { name: /Generate the Volume Mesh/ }))
    fireEvent.click(task.getByRole('button', { name: 'Generate the Volume Mesh' }))
    expect(consolePane.getByText(/Volume mesh cells =/)).toBeInTheDocument()

    fireEvent.change(mode, { target: { value: 'watertight' } })
    expect(task.getByRole('button', { name: 'Import Geometry' })).toBeInTheDocument()
    fireEvent.change(mode, { target: { value: 'fault-tolerant' } })
    expect(workflow.getByRole('button', { name: /Improve Volume Mesh/ })).toHaveAttribute('aria-current', 'step')
    for (const { label } of faultTolerantWorkflowSteps) {
      fireEvent.click(workflow.getByRole('button', { name: new RegExp(label.replace(/[()]/g, '\\$&')) }))
      expect(task.getByRole('heading', { level: 2 })).toHaveTextContent(label)
      expect(task.getAllByRole('button').length).toBeGreaterThan(0)
    }
  })

  it('provides complete structured operation guides for all 21 meshing topics and resolves fault-tolerant related task buttons', () => {
    const keys = Object.keys(meshingExplanations)
    expect(keys).toHaveLength(21)
    for (const key of keys) {
      const guide = meshingOperationGuides[key]
      expect(guide, key).toBeDefined()
      expect(guide.steps.length, key).toBeGreaterThan(0)
      expect(guide.example.length, key).toBeGreaterThan(0)
      expect(guide.coreConcept?.length ?? 0, key).toBeGreaterThan(0)
    }

    window.sessionStorage.clear()
    render(
      <MemoryRouter initialEntries={['/fluent-meshing?task=ft-leakage']}>
        <App />
      </MemoryRouter>,
    )
    const workflow = within(screen.getByRole('complementary', { name: 'Workflow' }))
    fireEvent.change(workflow.getByRole('combobox', { name: 'Workflow Template' }), {
      target: { value: 'fault-tolerant' },
    })
    const guidePane = within(screen.getByRole('complementary', { name: '控件说明' }))
    expect(guidePane.getByRole('button', { name: /Identify Regions/ })).toBeInTheDocument()
  })

  it('opens and operates interactive meshing sub-dialogs from ribbon commands', () => {
    window.sessionStorage.clear()
    const { container } = render(
      <MemoryRouter initialEntries={['/fluent-meshing']}>
        <App />
      </MemoryRouter>,
    )

    expect(meshingRibbonTabs).toHaveLength(9)
    expect(Object.keys(meshingExplanations)).toHaveLength(21)

    const workbench = container.querySelector('.fluent-workbench') as HTMLElement
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    const guidePane = within(screen.getByRole('complementary', { name: '控件说明' }))
    expect(guidePane.getByRole('img')).toBeInTheDocument()

    // File -> Preferences: switch UI Theme to Dark and close via Apply Preferences
    fireEvent.click(ribbon.getByRole('button', { name: 'File' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Preferences…' }))
    const prefDlg = within(screen.getByRole('dialog', { name: 'Preferences' }))
    expect(workbench).toHaveAttribute('data-theme', 'light')
    fireEvent.change(prefDlg.getByRole('combobox', { name: 'UI Theme' }), { target: { value: 'dark' } })
    expect(workbench).toHaveAttribute('data-theme', 'dark')
    fireEvent.click(prefDlg.getByRole('tab', { name: 'Meshing Engine' }))
    expect(prefDlg.getByRole('combobox', { name: 'Parallel Processes' })).toBeInTheDocument()
    fireEvent.click(prefDlg.getByRole('button', { name: 'Apply Preferences' }))
    expect(screen.queryByRole('dialog', { name: 'Preferences' })).not.toBeInTheDocument()
    expect(consolePane.getByText(/\[Meshing Preferences\] Theme=dark/)).toBeInTheDocument()

    // File -> Read/Write Mesh: switch tabs & close with Escape
    fireEvent.click(ribbon.getByRole('button', { name: 'Read/Write Mesh…' }))
    const ioDlg = within(screen.getByRole('dialog', { name: 'Read/Write Mesh' }))
    fireEvent.click(ioDlg.getByRole('button', { name: 'Read File' }))
    expect(consolePane.getByText(/\[Meshing File I\/O\]/)).toBeInTheDocument()
    fireEvent.click(ioDlg.getByRole('tab', { name: 'Write' }))
    expect(ioDlg.getByRole('textbox', { name: 'Output File Name' })).toBeInTheDocument()
    fireEvent.keyDown(workbench, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Read/Write Mesh' })).not.toBeInTheDocument()

    // Surface Mesh -> Diagnostics…
    fireEvent.click(ribbon.getByRole('button', { name: 'Surface Mesh' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Diagnostics…' }))
    const diagDlg = within(screen.getByRole('dialog', { name: 'Surface Mesh Diagnostics' }))
    fireEvent.click(diagDlg.getByRole('button', { name: 'Run Diagnostics' }))
    expect(consolePane.getByText(/\[Surface Diagnostics\]/)).toBeInTheDocument()
    fireEvent.click(diagDlg.getByRole('tab', { name: 'Repair & Smooth' }))
    fireEvent.click(diagDlg.getByRole('button', { name: 'Smooth & Stitch' }))
    expect(consolePane.getByText(/\[Surface Repair\]/)).toBeInTheDocument()
    fireEvent.click(diagDlg.getByRole('button', { name: 'Close Surface Mesh Diagnostics' }))

    // Volume Mesh -> Check Mesh…
    fireEvent.click(ribbon.getByRole('button', { name: 'Volume Mesh' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Check Mesh…' }))
    const volDlg = within(screen.getByRole('dialog', { name: 'Volume Mesh Check' }))
    fireEvent.click(volDlg.getByRole('button', { name: 'Check Volume Mesh' }))
    expect(consolePane.getByText(/\[Volume Mesh Check\]/)).toBeInTheDocument()
    fireEvent.click(volDlg.getByRole('tab', { name: 'Boundary Layer Audit' }))
    fireEvent.click(volDlg.getByRole('button', { name: 'Audit Boundary Layers' }))
    expect(consolePane.getByText(/\[BL Audit\]/)).toBeInTheDocument()
    fireEvent.click(volDlg.getByRole('button', { name: 'Close Volume Mesh Check' }))

    // Zones & Tools -> Manage Zones… updates boundary zone type
    fireEvent.click(ribbon.getByRole('button', { name: 'Zones & Tools' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Manage Zones…' }))
    const zoneDlg = within(screen.getByRole('dialog', { name: 'Manage Zones' }))
    const firstZoneSelect = zoneDlg.getAllByRole('combobox')[0]
    fireEvent.change(firstZoneSelect, { target: { value: 'mass-flow-inlet' } })
    expect(firstZoneSelect).toHaveValue('mass-flow-inlet')
    fireEvent.click(zoneDlg.getByRole('tab', { name: 'Cell Regions' }))
    expect(zoneDlg.getAllByRole('combobox').length).toBeGreaterThan(0)
    fireEvent.click(zoneDlg.getByRole('button', { name: 'Close Manage Zones' }))

    // View -> Display Options… toggles Cut Plane
    fireEvent.click(ribbon.getByRole('button', { name: 'View' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Display Options…' }))
    const dispDlg = within(screen.getByRole('dialog', { name: 'Display Options' }))
    fireEvent.click(dispDlg.getByRole('tab', { name: 'Cut Plane' }))
    const cutToggle = dispDlg.getByRole('checkbox', { name: 'Enable Cut Plane' })
    const initialChecked = (cutToggle as HTMLInputElement).checked
    expect(initialChecked).toBe(true)
    fireEvent.click(cutToggle)
    expect(cutToggle).not.toBeChecked()
    fireEvent.click(cutToggle)
    expect(cutToggle).toBeChecked()
    fireEvent.click(dispDlg.getByRole('tab', { name: 'Colors & Lighting' }))
    expect(dispDlg.getByRole('combobox', { name: 'Color Faces By' })).toBeInTheDocument()
    fireEvent.click(dispDlg.getByRole('button', { name: 'Close Display Options' }))
  })
})
