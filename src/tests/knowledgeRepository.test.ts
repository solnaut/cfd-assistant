import { describe, expect, it, vi } from 'vitest'
import {
  findKnowledgeEntry,
  groupKnowledgeByModule,
  loadFluentKnowledge,
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
})
