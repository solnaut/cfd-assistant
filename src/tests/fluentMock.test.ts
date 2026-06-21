import { describe, expect, it } from 'vitest'
import { allDialogControls, fluentDialogs } from '../fluentMock/fluentDialogs'
import { allMainControls } from '../fluentMock/fluentControls'
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
})
