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
