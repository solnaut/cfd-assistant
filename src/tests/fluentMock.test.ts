import { describe, expect, it } from 'vitest'
import { allDialogControls, fluentDialogs } from '../fluentMock/fluentDialogs'
import {
  allMainControls,
  allTaskPanels,
  ribbonTabs,
} from '../fluentMock/fluentControls'
import { fluentExplanationById } from '../fluentMock/fluentExplanations'
import { dialogTabsByDialogId } from '../fluentMock/fluentTeachingExtras'
import { derivedMultiphaseControls } from '../fluentMock/state/fluentMultiphaseState'
import { derivedModelControls } from '../fluentMock/data/physicsModelBranches'
import { fluentOperationExplanations } from '../fluentMock/data/fluentOperationExplanations'
import { getMeshingTeachingDiagram, getSolutionTeachingDiagram } from '../fluentMock/data/fluentTeachingDiagrams'

describe('Fluent mock data', () => {
  it('keeps dialog links, panel links, visibility dependencies and tab groups valid', () => {
    const controls = [...allMainControls, ...allDialogControls]
    const controlIds = new Set([...controls.map((control) => control.id), 'run-effective-time-method', 'solver-dimension', 'cell-zone-laminar-available', ...derivedMultiphaseControls, ...derivedModelControls])
    const dialogs = new Map(fluentDialogs.map((dialog) => [dialog.id, dialog]))
    const panelIds = new Set(allTaskPanels.map((panel) => panel.id))
    expect(dialogs.size).toBe(fluentDialogs.length)
    for (const control of controls) {
      if (control.dialogId) expect(dialogs.has(control.dialogId), control.id).toBe(true)
      for (const [value, child] of Object.entries(control.optionDialogs ?? {})) {
        expect(control.options, control.id).toContain(value)
        expect(dialogs.has(child), control.id).toBe(true)
      }
      if (control.panelId) expect(panelIds.has(control.panelId), control.id).toBe(true)
      if (control.valueId) expect(controlIds.has(control.valueId), control.id).toBe(true)
      for (const condition of control.visibleWhen ?? []) {
        expect(controlIds.has(condition.controlId), control.id).toBe(true)
      }
    }
    for (const [id, tabs] of Object.entries(dialogTabsByDialogId)) {
      const dialog = dialogs.get(id)
      expect(dialog, id).toBeDefined()
      expect(tabs.map((tab) => tab.id)).toHaveLength(new Set(tabs.map((tab) => tab.id)).size)
      for (const tab of tabs) {
        if (tab.parentId) expect(tabs.some((parent) => parent.id === tab.parentId), tab.id).toBe(true)
        for (const condition of [...(tab.visibleWhen ?? []), ...(tab.enabledWhen ?? [])]) expect(controlIds.has(condition.controlId), tab.id).toBe(true)
      }
      for (const control of dialog!.controls) {
        expect(dialog!.sharedGroups?.includes(control.group) || tabs.some((tab) => tab.groups.includes(control.group)), control.id).toBe(true)
      }
    }
  })

  it('includes a Fluent documentation link on source-checked control explanations', () => {
    const checked = [...fluentExplanationById.values()].filter((entry) => entry.sourceStatus === 'source-checked')
    expect(checked.length).toBeGreaterThan(50)
    for (const entry of checked) expect(entry.sourceUrl, entry.id).toMatch(/^https:\/\/ansyshelp\.ansys\.com\//)
  })

  it('attaches every expanded guide and covers all eleven model entries', () => {
    const controls = new Set([...allMainControls, ...allDialogControls].map(({ id }) => id))
    for (const [id, guide] of Object.entries(fluentOperationExplanations)) {
      expect(fluentExplanationById.get(id)?.operation?.steps.length, id).toBeGreaterThan(1)
      for (const control of guide.relatedControls ?? []) expect(controls.has(control), control).toBe(true)
    }
    const modelEntries = allTaskPanels.find(({ id }) => id === 'models-panel')?.groups.flatMap(({ controls }) => controls) ?? []
    expect(modelEntries).toHaveLength(11)
    for (const entry of modelEntries) expect(fluentExplanationById.get(entry.explanationId)?.operation?.choices?.length, entry.id).toBeGreaterThan(1)
  })
  it('does not contain duplicate control ids', () => {
    const ids = [...allMainControls, ...allDialogControls].map((control) => control.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(ids.length)
  })

  it('provides an explanation for every visible mock control', () => {
    const missingExplanationIds = [...allMainControls, ...allDialogControls]
      .map((control) => control.explanationId)
      .filter((explanationId) => !fluentExplanationById.has(explanationId))

    expect(missingExplanationIds).toEqual([])
  })

  it('includes first-pass teaching dialogs for at least five Fluent modules', () => {
    const modulesWithDialogs = new Set(fluentDialogs.map((dialog) => dialog.module))

    expect(modulesWithDialogs.has('Mesh')).toBe(true)
    expect(modulesWithDialogs.has('Models')).toBe(true)
    expect(modulesWithDialogs.has('Materials')).toBe(true)
    expect(modulesWithDialogs.has('Boundary Conditions')).toBe(true)
    expect(modulesWithDialogs.has('Results')).toBe(true)
    expect(modulesWithDialogs.size).toBeGreaterThanOrEqual(5)
  })

  it('covers the primary single-phase Fluent workflow with task panels and dialogs', () => {
    const panelModules = new Set(allTaskPanels.map((panel) => panel.module))
    const dialogModules = new Set(fluentDialogs.map((dialog) => dialog.module))

    for (const module of [
      'General',
      'Models',
      'Materials',
      'Cell Zone Conditions',
      'Boundary Conditions',
      'Reference Values',
      'Solution Methods',
      'Solution Controls',
      'Initialization',
      'Monitors',
      'Run Calculation',
      'Results',
    ]) {
      expect(panelModules.has(module) || dialogModules.has(module)).toBe(true)
    }
  })

  it('includes detailed teaching dialogs for zone, reference, reporting and surface workflows', () => {
    const dialogIds = new Set(fluentDialogs.map((dialog) => dialog.id))

    for (const dialogId of [
      'cell-zone-fluid-dialog',
      'cell-zone-source-dialog',
      'reference-values-dialog',
      'report-definition-dialog',
      'surface-integrals-dialog',
      'plane-surface-dialog',
      'xy-plot-dialog',
    ]) {
      expect(dialogIds.has(dialogId)).toBe(true)
    }
  })

  it('covers additional day-one Fluent setup windows and common boundary types', () => {
    const dialogIds = new Set(fluentDialogs.map((dialog) => dialog.id))
    const controlIds = new Set([...allMainControls, ...allDialogControls].map((control) => control.id))

    for (const dialogId of [
      'general-solver-dialog',
      'operating-conditions-dialog',
      'material-create-edit-dialog',
      'mass-flow-inlet-dialog',
      'symmetry-dialog',
      'outflow-dialog',
      'patch-initialization-dialog',
      'autosave-dialog',
      'display-options-dialog',
      'case-file-dialog',
    ]) {
      expect(dialogIds.has(dialogId)).toBe(true)
    }

    for (const controlId of [
      'general-solver-settings',
      'general-operating-conditions',
      'materials-create-edit',
      'bc-mass-flow-inlet',
      'bc-symmetry',
      'bc-outflow',
      'initialization-patch',
      'calculation-autosave',
      'results-display-options',
      'ribbon-read-case',
      'ribbon-write-case',
    ]) {
      expect(controlIds.has(controlId)).toBe(true)
    }
  })

  it('uses specific teaching guidance for the most error-prone Fluent options', () => {
    const expectations = [
      {
        explanationId: 'mass-flow-inlet-flow-rate-explanation',
        text: '适合已知质量流量的入口；同时核对湍流、温度和方向设置。',
      },
      {
        explanationId: 'operating-pressure-explanation',
        text: '低速不可压缩流通常保持默认参考压力；涉及浮力、可压缩或表压边界时要主动核对。',
      },
      {
        explanationId: 'initialization-patch-region-explanation',
        text: '只在明确知道局部初始场时使用 Patch，避免把局部速度或温度误写到全域。',
      },
      {
        explanationId: 'autosave-frequency-explanation',
        text: '长时间迭代或瞬态计算应设置自动保存频率，避免中断后丢失关键阶段结果。',
      },
    ]

    for (const { explanationId, text } of expectations) {
      const explanation = fluentExplanationById.get(explanationId)
      expect(explanation?.recommendation).toBe(text)
    }
  })

  it('provides useful action-oriented explanation fields for every visible control', () => {
    const explanations = [...allMainControls, ...allDialogControls].map((control) =>
      fluentExplanationById.get(control.explanationId),
    )

    for (const explanation of explanations) {
      expect(explanation?.whatItIs).toBeTruthy()
      expect(explanation?.recommendation).toBeTruthy()
      expect(explanation?.checkItems.length).toBeGreaterThan(0)
      expect(explanation?.sourceStatus).not.toBe('natural-placeholder')
      expect('futureWindowNotes' in explanation!).toBe(false)
      expect(explanation?.whatItIs).not.toContain('，控件类型为')
      expect(explanation?.whatItIs).not.toContain('用于学习该位置对应的 Fluent 设置含义')
      expect(explanation?.commonMistakes).not.toContain('不要只按默认值继续')
    }
  })

  it('provides deep conceptual comparisons and parameter effects on core steady/transient controls', () => {
    for (const id of [
      'general-steady-explanation',
      'general-transient-explanation',
      'general-pressure-based-explanation',
      'solution-methods-coupling-explanation',
    ]) {
      const entry = fluentExplanationById.get(id)
      expect(entry?.operation?.coreConcept).toBeTruthy()
      expect(entry?.operation?.choices?.length).toBeGreaterThanOrEqual(2)
      expect(entry?.operation?.parameterEffects?.length).toBeGreaterThan(0)
    }
  })

  it('populates the solver ribbon, eleven model entries and the boundary workflows', () => {
    expect(ribbonTabs).toHaveLength(11)
    for (const tab of ribbonTabs) {
      const controlCount = tab.groups.reduce(
        (sum, group) => sum + group.controls.length,
        0,
      )
      expect(controlCount).toBeGreaterThan(0)
    }

    const modelsPanel = allTaskPanels.find((panel) => panel.id === 'models-panel')
    expect(modelsPanel).toBeDefined()
    const modelIds = modelsPanel!.groups.flatMap((g) => g.controls.map((c) => c.id))
    expect(modelIds).toHaveLength(11)

    const boundaryPanel = allTaskPanels.find(
      (panel) => panel.id === 'boundary-panel',
    )
    expect(boundaryPanel).toBeDefined()
    const boundaryIds = boundaryPanel!.groups.flatMap((g) =>
      g.controls.map((c) => c.id),
    )
    expect(boundaryIds).toHaveLength(25)
    expect(boundaryIds).toContain('bc-periodic-conditions')
    expect(boundaryIds).toContain('bc-perforated-walls')

    const allLabels = allTaskPanels.flatMap((p) =>
      p.groups.flatMap((g) => g.controls.map((c) => c.label)),
    )
    expect(allLabels).not.toContain('打开设置')
    expect(allLabels).not.toContain('查看说明')

    const pendingOrDisabledRibbon = [...allMainControls, ...allDialogControls].filter(
      (c) => Boolean(c.unavailableReason) || (c.controlType === 'ribbon-button' && !c.enabled),
    )
    expect(pendingOrDisabledRibbon).toEqual([])

    for (const id of [
      'mesh-scale-dialog',
      'mesh-smooth-swap-dialog',
      'dynamic-mesh-dialog',
      'mesh-adaptation-dialog',
      'pressure-far-field-dialog',
      'zone-separate-dialog',
      'cell-zone-fluid-dialog',
      'cell-zone-solid-dialog',
      'udf-dialog',
      'solution-controls-dialog',
      'residual-monitors-dialog',
      'xy-plot-dialog',
      'display-options-dialog',
      'parallel-partition-dialog',
      'adjoint-solver-dialog',
      'parameters-table-dialog',
      'case-check-dialog',
      'mesh-info-dialog',
      'preferences-dialog',
      'species-pollutants-dialog',
      'dpm-injection-dialog',
      'multigrid-controls-dialog',
      'simulation-report-dialog',
      'udm-uds-dialog',
      'fft-dialog',
      'particle-tracks-dialog',
      'dynamic-mesh-zones-dialog',
      'inlet-vent-dialog',
      'outlet-vent-dialog',
      'intake-fan-dialog',
      'exhaust-fan-dialog',
      'fan-dialog',
      'porous-jump-dialog',
      'radiator-dialog',
    ]) {
      expect(dialogTabsByDialogId[id]?.length ?? 0, id).toBeGreaterThanOrEqual(2)
    }
  })

  it('defines cross-dialog conditional tabs, special boundary multi-tabs, and teaching diagrams', () => {
    const dialogsById = new Map(fluentDialogs.map((d) => [d.id, d]))
    expect(dialogsById.has('radiator-profile-dialog')).toBe(true)
    expect(dialogsById.has('material-nasa-cp-dialog')).toBe(true)

    const dpmTabs = dialogTabsByDialogId['dpm-injection-dialog']
    expect(dpmTabs.map((t) => t.id)).toEqual([
      'point-properties',
      'turbulent-dispersion',
      'physical-models',
      'components',
      'breakup',
    ])
    expect(dpmTabs.find((t) => t.id === 'components')?.visibleWhen?.[0]).toEqual({
      controlId: 'dpm-inj-evap',
      values: ['Multicomponent'],
    })
    expect(dpmTabs.find((t) => t.id === 'breakup')?.visibleWhen?.[0]).toEqual({
      controlId: 'dpm-breakup',
      values: [true],
    })

    for (const bcId of [
      'velocity-inlet-dialog',
      'wall-dialog',
      'mass-flow-outlet-dialog',
      'inlet-vent-dialog',
      'radiator-dialog',
    ]) {
      const udsTab = dialogTabsByDialogId[bcId].find((t) => t.id === 'uds')
      expect(udsTab?.visibleWhen?.[0], bcId).toEqual({
        controlId: 'uds-count',
        values: ['1', '2', '3'],
      })
    }

    const dmZonesDlg = dialogsById.get('dynamic-mesh-zones-dialog')
    expect(dmZonesDlg?.sharedGroups).toEqual(['Zone Definition'])
    expect(dialogTabsByDialogId['dynamic-mesh-zones-dialog'].map((t) => t.id)).toEqual([
      'motion-attr',
      'geom-def',
      'mesh-opts',
    ])

    expect(getSolutionTeachingDiagram('general-pressure-based-explanation')?.kind).toBe('solver-comparison')
    expect(getSolutionTeachingDiagram('models-viscous-explanation')?.kind).toBe('turbulence-hierarchy')
    expect(getSolutionTeachingDiagram('models-multiphase-explanation')?.kind).toBe('multiphase-regimes')
    expect(getSolutionTeachingDiagram('uds-count-explanation')?.kind).toBe('uds-transport')
    expect(getMeshingTeachingDiagram('meshing-surface-mesh')?.kind).toBe('surface-mesh-cad')
    expect(getMeshingTeachingDiagram('meshing-boundary-layers')?.kind).toBe('volume-mesh-layers')
  })
})
