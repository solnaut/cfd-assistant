import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import {
  meshingControlCatalog,
  meshingRibbonTabs,
  watertightWorkflowSteps,
} from '../fluentMock/meshing/meshingData'
import { meshingExplanations } from '../fluentMock/meshing/meshingExplanations'
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

    expect(watertightWorkflowSteps).toHaveLength(10)
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

    const handoff = buildMeshingToSolutionHandoff(state)
    expect(handoff.fromMeshing).toBe(true)
    expect(handoff.boundaryLayers).toBe(8)
    expect(handoff.processes).toBe(8)

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

    // Walk through Surface Mesh -> Volume Mesh
    fireEvent.click(
      workflowPane.getByRole('button', { name: /Generate the Surface Mesh/ }),
    )
    const taskPane = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(
      taskPane.getByRole('button', { name: 'Generate the Surface Mesh' }),
    )
    expect(
      screen.getByRole('region', { name: 'Console' }),
    ).toHaveTextContent(/Generated .* surface faces/i)

    // Jump to Add Boundary Layers and test conditional Uniform offset input
    fireEvent.click(
      workflowPane.getByRole('button', { name: /Add Boundary Layers/ }),
    )
    fireEvent.change(taskPane.getByLabelText('Offset Method Type'), {
      target: { value: 'uniform' },
    })
    expect(taskPane.getByLabelText('First Height (mm)')).toBeInTheDocument()

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
})
