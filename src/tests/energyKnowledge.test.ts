import { describe, expect, it } from 'vitest'
import {
  energyCourses,
  energyCrossDisciplineBridges,
  energyFrameworkLayers,
  energyTopics,
  getEnergyCourse,
  getEnergyTopicsByCourse,
  getTopicById,
  getTopicQuizzes,
  searchEnergyTopics,
} from '../knowledge/energyPower'
import { energyTopicBriefs } from '../knowledge/energyPower/topicBriefs'

describe('energy & power knowledge base', () => {
  it('defines 4 courses with 3 structured modules and 9 topics each (36 total)', () => {
    expect(energyCourses.map((c) => c.id)).toEqual([
      'fluid-mechanics',
      'engineering-thermodynamics',
      'heat-transfer',
      'refrigeration-principles',
    ])
    expect(energyTopics).toHaveLength(36)
    expect(energyFrameworkLayers.length).toBe(3)
    expect(energyCrossDisciplineBridges.length).toBeGreaterThanOrEqual(6)

    const seenTopicIds = new Set<string>()
    const seenQuizIds = new Set<string>()

    for (const course of energyCourses) {
      expect(course.modules).toHaveLength(3)
      expect(course.coreCompetencies.length).toBeGreaterThanOrEqual(3)

      const moduleTopicIds = course.modules.flatMap((m) => m.topicIds)
      const topics = getEnergyTopicsByCourse(course.id)
      expect(topics).toHaveLength(9)
      expect(moduleTopicIds).toHaveLength(9)
      expect(new Set(moduleTopicIds)).toEqual(new Set(topics.map((t) => t.id)))

      for (const topic of topics) {
        expect(seenTopicIds.has(topic.id)).toBe(false)
        seenTopicIds.add(topic.id)

        expect(topic.moduleGroup).toBeTruthy()
        expect(topic.keyPoints.length).toBeGreaterThanOrEqual(3)
        expect(topic.formulas.length).toBeGreaterThanOrEqual(1)
        const brief = energyTopicBriefs[topic.id]
        expect(brief?.takeaway, topic.id).toBeTruthy()
        expect(topic.diagram ?? brief?.mechanism, topic.id).toBeDefined()

        const quizzes = getTopicQuizzes(topic)
        expect(quizzes.length).toBeGreaterThanOrEqual(2)
        for (const q of quizzes) {
          expect(seenQuizIds.has(q.id)).toBe(false)
          seenQuizIds.add(q.id)
          expect(q.options.length).toBe(4)
          expect(q.correctIndex).toBeGreaterThanOrEqual(0)
          expect(q.correctIndex).toBeLessThan(q.options.length)
        }

        for (const conn of topic.cfdConnections ?? []) {
          expect(conn.to).toMatch(/^\/(calculators|fluent-guide|fluent-meshing)/)
        }
      }
    }

    // Strict referential integrity check across prerequisites, related topics, and cross bridges
    for (const topic of energyTopics) {
      for (const preId of topic.prerequisites ?? []) {
        expect(getTopicById(preId)).toBeDefined()
      }
      for (const relId of topic.relatedTopicIds ?? []) {
        expect(getTopicById(relId)).toBeDefined()
      }
    }

    for (const bridge of energyCrossDisciplineBridges) {
      for (const tId of bridge.topicIds) {
        expect(getTopicById(tId)).toBeDefined()
      }
      if (bridge.cfdLink) {
        expect(bridge.cfdLink.to).toMatch(/^\/(calculators|fluent-guide|fluent-meshing)/)
      }
    }
  })

  it('retrieves courses and filters both foundational and expanded chapters via search', () => {
    expect(getEnergyCourse('refrigeration-principles')?.name).toBe('制冷技术原理')
    expect(searchEnergyTopics('伯努利').some((t) => t.id === 'fm-continuity-bernoulli')).toBe(true)
    expect(searchEnergyTopics('白金汉').some((t) => t.id === 'fm-dimensional-similarity')).toBe(true)
    expect(searchEnergyTopics('卡门涡街').some((t) => t.id === 'fm-external-drag-lift')).toBe(true)
    expect(searchEnergyTopics('汽蚀').some((t) => t.id === 'fm-turbomachinery-cavitation')).toBe(true)
    expect(searchEnergyTopics('朗肯').some((t) => t.id === 'td-water-vapor-rankine')).toBe(true)
    expect(searchEnergyTopics('㶲').some((t) => t.id === 'td-exergy-maxwell')).toBe(true)
    expect(searchEnergyTopics('奥托').some((t) => t.id === 'td-ic-engines-compressors')).toBe(true)
    expect(searchEnergyTopics('毕渥').some((t) => t.id === 'ht-unsteady-conduction')).toBe(true)
    expect(searchEnergyTopics('内热源').some((t) => t.id === 'ht-conduction-pde-bc')).toBe(true)
    expect(searchEnergyTopics('压焓图').some((t) => t.id === 'ref-vapor-compression')).toBe(true)
    expect(searchEnergyTopics('输气系数').some((t) => t.id === 'ref-compressors-characteristics')).toBe(true)
    expect(searchEnergyTopics('跨临界').some((t) => t.id === 'ref-co2-load-control')).toBe(true)
  })
})
