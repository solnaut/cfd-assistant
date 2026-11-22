import { Link } from 'react-router-dom'
import {
  energyCourses,
  energyCrossDisciplineBridges,
  energyFrameworkLayers,
  getEnergyCourse,
  getTopicById,
} from '../knowledge/energyPower'
import type { EnergyTopic } from '../models/energyKnowledge'

export function KnowledgeFrameworkMap({
  masteredIds,
  onSelectTopic,
}: {
  masteredIds: string[]
  onSelectTopic: (topic: EnergyTopic) => void
}) {
  return (
    <div className="energy-framework-view" aria-label="能源动力学科知识框架总览">
      {/* Tiered Macro Architecture */}
      <section className="energy-framework-section">
        <h3>三层贯通知识体系架构</h3>
        <div className="energy-layer-grid">
          {energyFrameworkLayers.map((layer) => (
            <article className="energy-layer-card" key={layer.id}>
              <span className="energy-layer-tier">{layer.tier}</span>
              <h4>{layer.title}</h4>
              <p>{layer.summary}</p>
              <div className="energy-layer-courses">
                {layer.courseIds.map((cId) => {
                  const course = getEnergyCourse(cId)
                  if (!course) return null
                  return (
                    <span
                      key={cId}
                      className={`energy-course-chip ${course.themeClass}`}
                    >
                      {course.name}
                    </span>
                  )
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Course Module Matrix */}
      <section className="energy-framework-section">
        <h3>四大核心课程模块图谱（36 节全链路目录）</h3>
        <div className="energy-matrix-grid">
          {energyCourses.map((course) => (
            <article
              key={course.id}
              className={`energy-matrix-card ${course.themeClass}`}
            >
              <div className="energy-matrix-head">
                <div>
                  <p className="eyebrow">{course.englishName}</p>
                  <h4>{course.name}</h4>
                </div>
                <span className="energy-course-tag">{course.shortTag}</span>
              </div>

              <div className="energy-matrix-modules">
                {course.modules.map((mod) => (
                  <div className="energy-matrix-module" key={mod.id}>
                    <strong>{mod.title}</strong>
                    <p>{mod.summary}</p>
                    <div className="energy-matrix-topics">
                      {mod.topicIds.map((tId) => {
                        const topic = getTopicById(tId)
                        if (!topic) return null
                        const done = masteredIds.includes(topic.id)
                        return (
                          <button
                            key={tId}
                            type="button"
                            className={
                              'energy-matrix-topic-pill' +
                              (done ? ' mastered' : '')
                            }
                            onClick={() => onSelectTopic(topic)}
                          >
                            <span>{topic.title}</span>
                            {done && <span aria-label="已掌握">✓</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="energy-competency-box">
                <strong>学完本课程的核心工程能力：</strong>
                <ul>
                  {course.coreCompetencies.map((comp) => (
                    <li key={comp}>{comp}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Cross-Discipline Knowledge Bridges */}
      <section className="energy-framework-section">
        <h3>跨学科物理融通桥梁（打破课程壁垒）</h3>
        <div className="energy-bridge-grid">
          {energyCrossDisciplineBridges.map((bridge) => (
            <article className="energy-bridge-card" key={bridge.id}>
              <div className="energy-bridge-tags">
                {bridge.disciplines.map((cId) => {
                  const course = getEnergyCourse(cId)
                  if (!course) return null
                  return (
                    <span
                      key={cId}
                      className={`energy-course-chip ${course.themeClass}`}
                    >
                      {course.name}
                    </span>
                  )
                })}
              </div>
              <h4>{bridge.title}</h4>
              <p>{bridge.description}</p>
              <div className="energy-bridge-links">
                {bridge.topicIds.map((tId) => {
                  const topic = getTopicById(tId)
                  if (!topic) return null
                  const course = getEnergyCourse(topic.courseId)
                  return (
                    <button
                      key={tId}
                      type="button"
                      className={`energy-bridge-topic-btn ${course?.themeClass ?? ''}`}
                      onClick={() => onSelectTopic(topic)}
                    >
                      {course?.name} · {topic.title} →
                    </button>
                  )
                })}
              </div>
              {bridge.cfdLink && (
                <Link className="energy-bridge-cfd-link" to={bridge.cfdLink.to}>
                  {bridge.cfdLink.label} ↗
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
