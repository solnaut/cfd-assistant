import { describe, expect, it } from 'vitest'
import { allDialogControls, fluentDialogs } from '../fluentMock/fluentDialogs'
import { allMainControls, allTaskPanels } from '../fluentMock/fluentControls'
import { fluentExplanationById } from '../fluentMock/fluentExplanations'

describe('Fluent mock data', () => {
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
    }
  })
})
