import { describe, expect, it } from 'vitest'
import {
  countByCategory,
  getGlobalSearchIndex,
  searchGlobalIndex,
} from '../search/globalSearchIndex'

describe('global search index', () => {
  it('indexes calculators, formulas, Fluent Solution, Fluent Meshing, troubleshooting, and TUI entries', () => {
    const index = getGlobalSearchIndex()
    expect(index.length).toBeGreaterThan(200)

    const calcHits = searchGlobalIndex('y+', 'calculator')
    expect(calcHits.length).toBeGreaterThan(0)
    expect(calcHits[0].item.to).toContain('/calculators/')

    const formulaHits = searchGlobalIndex('Reynolds', 'formula')
    expect(formulaHits.length).toBeGreaterThan(0)
    expect(formulaHits[0].item.to).toContain('/formulas?q=')

    const solutionHits = searchGlobalIndex('Smooth/Swap', 'solution')
    expect(solutionHits.length).toBeGreaterThan(0)
    expect(solutionHits[0].item.to).toContain('/fluent-guide?locate=')

    const meshingHits = searchGlobalIndex('Poly-Hexcore', 'meshing')
    expect(meshingHits.length).toBeGreaterThan(0)
    expect(meshingHits[0].item.to).toContain('/fluent-meshing?task=')

    const troubleHits = searchGlobalIndex('回流', 'troubleshoot')
    expect(troubleHits.length).toBeGreaterThan(0)

    const tuiHits = searchGlobalIndex('/mesh/smooth-mesh', 'tui')
    expect(tuiHits.length).toBe(1)

    const knowledgeHits = searchGlobalIndex('压焓图', 'knowledge')
    expect(knowledgeHits.length).toBeGreaterThan(0)
    expect(knowledgeHits[0].item.to).toContain('/knowledge/refrigeration-principles/')
  })

  it('supports multi-token bilingual queries and category counts', () => {
    const multiHits = searchGlobalIndex('wall roughness')
    expect(multiHits.length).toBeGreaterThan(0)

    const bilingualHits = searchGlobalIndex('速度 入口')
    expect(bilingualHits.some((h) => h.item.category === 'solution')).toBe(true)

    const counts = countByCategory('边界层')
    expect(counts.all).toBeGreaterThan(0)
    expect(
      counts.knowledge +
        counts.meshing +
        counts.calculator +
        counts.solution +
        counts.troubleshoot +
        counts.formula +
        counts.tui,
    ).toBe(counts.all)

    expect(searchGlobalIndex('   ')).toEqual([])
  })
})
