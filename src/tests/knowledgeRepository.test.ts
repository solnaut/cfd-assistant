import { describe, expect, it, vi } from 'vitest'
import {
  findKnowledgeEntry,
  groupKnowledgeByModule,
  loadFluentKnowledge,
  searchKnowledgeEntries,
} from '../knowledge/knowledgeRepository'
import type { FluentKnowledgeEntry } from '../models/knowledge'

const sampleEntry: FluentKnowledgeEntry = {
  id: 'general.solver',
  module: 'General',
  englishName: 'Solver',
  chineseName: '求解器',
  menuPath: ['General', 'Solver'],
  oneLineSummary: 'TODO: summary',
  principle: 'TODO: principle',
  useCases: 'TODO: use cases',
  majorOptions: [],
  optionDifferences: 'TODO: option differences',
  impactOnAccuracyStabilityCost: 'TODO: impact',
  prerequisites: 'TODO: prerequisites',
  commonErrors: 'TODO: common errors',
  checkSuggestions: 'TODO: check suggestions',
  relatedFeatures: [],
  relatedCalculators: [],
  applicableFluentVersions: ['TODO'],
  contentVersion: '0.1.0-todo',
  updatedAt: '2026-06-18',
  searchKeywords: ['solver'],
  contentStatus: 'todo',
}

describe('knowledge repository helpers', () => {
  it('groups knowledge entries by module', () => {
    const grouped = groupKnowledgeByModule([sampleEntry])

    expect(grouped.General).toHaveLength(1)
    expect(grouped.General[0].id).toBe('general.solver')
  })

  it('finds a knowledge entry by id', () => {
    expect(findKnowledgeEntry([sampleEntry], 'general.solver')).toBe(sampleEntry)
    expect(findKnowledgeEntry([sampleEntry], 'missing')).toBeNull()
  })

  it('searches knowledge entries by names and keywords', () => {
    expect(searchKnowledgeEntries([sampleEntry], 'solver')).toHaveLength(1)
    expect(searchKnowledgeEntries([sampleEntry], '求解器')).toHaveLength(1)
    expect(searchKnowledgeEntries([sampleEntry], 'missing')).toHaveLength(0)
  })

  it('loads a knowledge file through fetch', async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          contentVersion: '0.1.0-todo',
          updatedAt: '2026-06-18',
          entries: [sampleEntry],
        }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = await loadFluentKnowledge('/knowledge/test.json')

    expect(fetchMock).toHaveBeenCalledWith('/knowledge/test.json')
    expect(file.entries[0].id).toBe('general.solver')
  })

  it('preserves dialog controls loaded from a knowledge file', async () => {
    const entryWithDialog: FluentKnowledgeEntry = {
      ...sampleEntry,
      controls: [
        {
          id: 'turbulence-edit',
          label: 'Turbulence',
          controlType: 'button',
          description: 'Open turbulence settings.',
          opensDialog: true,
          dialog: {
            id: 'velocity-inlet-turbulence-dialog',
            title: 'Velocity Inlet Turbulence',
            controls: [
              {
                id: 'turbulence-intensity',
                label: 'Turbulent Intensity',
                controlType: 'field',
                value: '5 %',
                description: 'Explains inlet turbulence intensity.',
              },
            ],
          },
        },
      ],
    }
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          contentVersion: '0.3.0-draft',
          updatedAt: '2026-06-18',
          entries: [entryWithDialog],
        }),
      )
    })
    vi.stubGlobal('fetch', fetchMock)

    const file = await loadFluentKnowledge('/knowledge/test.json')
    const control = file.entries[0].controls?.[0]

    expect(control?.dialog?.title).toBe('Velocity Inlet Turbulence')
    expect(control?.dialog?.controls[0].id).toBe('turbulence-intensity')
  })
})
