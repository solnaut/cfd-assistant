import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import { DiagramLightboxModal } from '../components/DiagramLightboxModal'
import { EnergyKnowledgeDiagram } from '../components/EnergyKnowledgeDiagram'
import { KnowledgeFrameworkMap } from '../components/KnowledgeFrameworkMap'
import MathFormula from '../components/MathFormula'
import PageHeader from '../components/PageHeader'
import { thermalLabs } from '../knowledge/thermalLabs'
import {
  ENERGY_BOOKMARKS_STORAGE_KEY,
  ENERGY_PROGRESS_STORAGE_KEY,
  energyCourses,
  energyTopics,
  getEnergyCourse,
  getEnergyTopic,
  getEnergyTopicsByCourse,
  getTopicById,
  getTopicQuizzes,
  searchEnergyTopics,
} from '../knowledge/energyPower'
import { energyTopicBriefs } from '../knowledge/energyPower/topicBriefs'
import type {
  EnergyCourseId,
  EnergyDifficulty,
  EnergyTopic,
} from '../models/energyKnowledge'
import { copyToClipboard } from '../utils/clipboard'

type KnowledgeViewMode = 'study' | 'framework' | 'quiz-bank'

function readStorageIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

function saveStorageIds(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids))
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

const DIFFICULTY_FILTERS: Array<'all' | EnergyDifficulty> = [
  'all',
  '基础',
  '进阶',
  '工程应用',
]

function EnergyKnowledgePage() {
  const { courseId, topicId } = useParams<{
    courseId?: string
    topicId?: string
  }>()
  const navigate = useNavigate()

  const activeCourse = getEnergyCourse(courseId) ?? energyCourses[0]
  const courseTopics = useMemo(
    () => getEnergyTopicsByCourse(activeCourse.id),
    [activeCourse.id],
  )
  const activeTopic =
    getEnergyTopic(activeCourse.id, topicId) ?? courseTopics[0]
  const brief = energyTopicBriefs[activeTopic.id]

  const [viewMode, setViewMode] = useState<KnowledgeViewMode>('study')
  const [query, setQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | EnergyDifficulty
  >('all')
  const [onlyUnmastered, setOnlyUnmastered] = useState(false)
  const [onlyBookmarked, setOnlyBookmarked] = useState(false)
  const [masteredIds, setMasteredIds] = useState<string[]>(() =>
    readStorageIds(ENERGY_PROGRESS_STORAGE_KEY),
  )
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    readStorageIds(ENERGY_BOOKMARKS_STORAGE_KEY),
  )
  const [expandedExamples, setExpandedExamples] = useState<
    Record<string, boolean>
  >({})
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, number>
  >({})
  const [quizBankOnlyUnansweredOrWrong, setQuizBankOnlyUnansweredOrWrong] =
    useState(false)
  const [copiedFormulaKey, setCopiedFormulaKey] = useState<string | null>(null)
  const [openFigure, setOpenFigure] = useState<'diagram' | 'mechanism' | null>(null)

  const searchHits = useMemo(
    () => (query.trim() ? searchEnergyTopics(query) : []),
    [query],
  )

  const matchingSidebarIds = useMemo(
    () =>
      new Set(
        courseTopics
          .filter((topic) => {
            if (
              difficultyFilter !== 'all' &&
              topic.difficulty !== difficultyFilter
            ) {
              return false
            }
            if (onlyUnmastered && masteredIds.includes(topic.id)) {
              return false
            }
            if (onlyBookmarked && !bookmarkedIds.includes(topic.id)) {
              return false
            }
            return true
          })
          .map((t) => t.id),
      ),
    [courseTopics, difficultyFilter, onlyUnmastered, onlyBookmarked, masteredIds, bookmarkedIds],
  )

  const activeIndex = courseTopics.findIndex((t) => t.id === activeTopic.id)
  const prevTopic = activeIndex > 0 ? courseTopics[activeIndex - 1] : undefined
  const nextTopic =
    activeIndex >= 0 && activeIndex < courseTopics.length - 1
      ? courseTopics[activeIndex + 1]
      : undefined

  const isMastered = masteredIds.includes(activeTopic.id)
  const isBookmarked = bookmarkedIds.includes(activeTopic.id)
  const topicQuizzes = getTopicQuizzes(activeTopic)
  const topicAnsweredCount = topicQuizzes.filter(
    (q) => selectedAnswers[q.id] !== undefined,
  ).length
  const topicCorrectCount = topicQuizzes.filter(
    (q) => selectedAnswers[q.id] === q.correctIndex,
  ).length

  const courseQuizItems = useMemo(
    () =>
      courseTopics.flatMap((topic) =>
        getTopicQuizzes(topic).map((quiz) => ({ topic, quiz })),
      ),
    [courseTopics],
  )
  const courseQuizAnswered = courseQuizItems.filter(
    ({ quiz }) => selectedAnswers[quiz.id] !== undefined,
  ).length
  const courseQuizCorrect = courseQuizItems.filter(
    ({ quiz }) => selectedAnswers[quiz.id] === quiz.correctIndex,
  ).length

  function toggleMastered(id: string) {
    setMasteredIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      saveStorageIds(ENERGY_PROGRESS_STORAGE_KEY, next)
      return next
    })
  }

  function toggleBookmarked(id: string) {
    setBookmarkedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
      saveStorageIds(ENERGY_BOOKMARKS_STORAGE_KEY, next)
      return next
    })
  }

  function jumpToTopic(topic: EnergyTopic) {
    setViewMode('study')
    setQuery('')
    navigate(`/knowledge/${topic.courseId}/${topic.id}`)
  }

  async function handleCopyLatex(latex: string, key: string) {
    const ok = await copyToClipboard(latex)
    if (ok) {
      setCopiedFormulaKey(key)
      window.setTimeout(() => {
        setCopiedFormulaKey((curr) => (curr === key ? null : curr))
      }, 1800)
    }
  }

  function courseMasteredCount(cId: EnergyCourseId) {
    return getEnergyTopicsByCourse(cId).filter((t) =>
      masteredIds.includes(t.id),
    ).length
  }

  const prerequisites = (activeTopic.prerequisites ?? [])
    .map((id) => getTopicById(id))
    .filter((t): t is EnergyTopic => Boolean(t))

  const relatedTopics = (activeTopic.relatedTopicIds ?? [])
    .map((id) => getTopicById(id))
    .filter((t): t is EnergyTopic => Boolean(t))

  const exampleExpanded = Boolean(expandedExamples[activeTopic.id])
  const relatedLab = thermalLabs.find(({ lesson }) => lesson.endsWith('/' + activeTopic.id))

  return (
    <div className="page energy-page">
      <Breadcrumbs
        items={[
          { label: '首页', to: '/' },
          { label: '热流体工程图解', to: '/knowledge' },
          { label: activeCourse.name },
        ]}
      />
      <PageHeader
        title="热流体工程图解"
        description="用示意图读懂流动、热力过程、传热与制冷，再用方程和例题核对工程判断。"
        actions={
          <div className="energy-overall-progress" aria-live="polite">
            已掌握 <strong>{masteredIds.length}</strong> / {energyTopics.length} 节
            {bookmarkedIds.length > 0 && (
              <span className="energy-bookmark-count">
                {' '}· ★ 收藏 {bookmarkedIds.length}
              </span>
            )}
          </div>
        }
      />

      {/* Global across-course topic search */}
      <div className="inline-search-bar" role="search">
        <label className="inline-search-field">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            aria-label="搜索热流体知识点"
            placeholder="跨学科搜索知识点、公式、例题或术语（如 伯努利、㶲、汽蚀、内热源、跨临界 CO2）…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {query.trim() && (
          <div className="inline-search-meta">
            <span>共匹配 {searchHits.length} 个专题</span>
            <button
              type="button"
              className="ghost-button button-link-small"
              onClick={() => setQuery('')}
            >
              清空
            </button>
          </div>
        )}
      </div>

      {query.trim() && (
        <section
          className="energy-search-results"
          aria-label="专业知识搜索结果"
        >
          {searchHits.length === 0 ? (
            <div className="empty-result" role="status">
              <p>未找到与“{query.trim()}”匹配的专题，请尝试更换核心概念词汇。</p>
            </div>
          ) : (
            <div className="energy-search-grid">
              {searchHits.map((hit) => {
                const hitCourse = getEnergyCourse(hit.courseId)
                return (
                  <button
                    key={hit.id}
                    type="button"
                    className={`energy-search-card ${hitCourse?.themeClass ?? ''}`}
                    onClick={() => jumpToTopic(hit)}
                  >
                    <div className="energy-search-card-meta">
                      <span>{hitCourse?.name}</span>
                      <small>{hit.chapter}</small>
                    </div>
                    <strong>{hit.title}</strong>
                    <p>{hit.summary}</p>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* 4 Core Courses Selector */}
      <nav
        className="energy-course-switcher"
        aria-label="能源动力核心课程"
      >
        {energyCourses.map((course) => {
          const selected = course.id === activeCourse.id
          const courseTopicsList = getEnergyTopicsByCourse(course.id)
          const doneCount = courseMasteredCount(course.id)
          const pct = Math.round((doneCount / courseTopicsList.length) * 100)
          return (
            <Link
              key={course.id}
              to={`/knowledge/${course.id}`}
              aria-current={selected ? 'page' : undefined}
              className={`energy-course-tab ${course.themeClass}${selected ? ' active' : ''}`}
            >
              <div className="energy-course-tab-head">
                <span className="energy-course-tag">{course.shortTag}</span>
                <small>
                  {doneCount}/{courseTopicsList.length}
                </small>
              </div>
              <strong>{course.name}</strong>
              <span className="energy-course-en">{course.englishName}</span>
              <p>{course.tagline}</p>
              <div className="energy-progress-track" aria-hidden="true">
                <span style={{ width: `${pct}%` }} />
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Study View Mode Tabs */}
      <div
        className="energy-view-tabs"
        role="tablist"
        aria-label="学习视图模式"
      >
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'study'}
          className={viewMode === 'study' ? 'active' : ''}
          onClick={() => setViewMode('study')}
        >
          章节精学 ({activeCourse.name})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'framework'}
          className={viewMode === 'framework' ? 'active' : ''}
          onClick={() => setViewMode('framework')}
        >
          知识框架图谱 (36 节全链路 + 跨学科桥梁)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={viewMode === 'quiz-bank'}
          className={viewMode === 'quiz-bank' ? 'active' : ''}
          onClick={() => setViewMode('quiz-bank')}
        >
          本学科刷题自测 ({courseQuizAnswered}/{courseQuizItems.length})
        </button>
      </div>

      {viewMode === 'framework' && (
        <KnowledgeFrameworkMap
          masteredIds={masteredIds}
          onSelectTopic={jumpToTopic}
        />
      )}

      {viewMode === 'quiz-bank' && (
        <section
          className={`energy-quiz-bank ${activeCourse.themeClass}`}
          aria-label={`${activeCourse.name}综合刷题自测`}
        >
          <div className="energy-quiz-bank-head">
            <div>
              <p className="eyebrow">{activeCourse.englishName}</p>
              <h2>{activeCourse.name}专题综合自测（共 {courseQuizItems.length} 题）</h2>
              <p>
                当前已作答 <strong>{courseQuizAnswered}</strong> 题，答对{' '}
                <strong>{courseQuizCorrect}</strong> 题
                {courseQuizAnswered > 0 &&
                  `（正确率 ${Math.round((courseQuizCorrect / courseQuizAnswered) * 100)}%）`}
              </p>
            </div>
            <div className="energy-quiz-bank-controls">
              <label className="energy-unmastered-check">
                <input
                  type="checkbox"
                  checked={quizBankOnlyUnansweredOrWrong}
                  onChange={(event) =>
                    setQuizBankOnlyUnansweredOrWrong(event.target.checked)
                  }
                />
                <span>仅看未答或错题</span>
              </label>
              <button
                type="button"
                className="ghost-button button-link-small"
                onClick={() =>
                  setSelectedAnswers((prev) => {
                    const next = { ...prev }
                    for (const { quiz } of courseQuizItems) delete next[quiz.id]
                    return next
                  })
                }
              >
                重置本学科自测
              </button>
            </div>
          </div>

          <div className="energy-quiz-bank-list">
            {courseQuizItems
              .filter(({ quiz }) => {
                if (!quizBankOnlyUnansweredOrWrong) return true
                const ans = selectedAnswers[quiz.id]
                return ans === undefined || ans !== quiz.correctIndex
              })
              .map(({ topic, quiz }, idx) => {
                const chosen = selectedAnswers[quiz.id]
                const answered = chosen !== undefined
                return (
                  <article className="energy-quiz-card" key={quiz.id}>
                    <div className="energy-quiz-head">
                      <span className="energy-chapter-badge">
                        Q{idx + 1} · {topic.chapter}
                      </span>
                      <button
                        type="button"
                        className="ghost-button button-link-small"
                        onClick={() => jumpToTopic(topic)}
                      >
                        回到对应章节：{topic.title} →
                      </button>
                    </div>
                    <p className="energy-quiz-question">{quiz.question}</p>
                    <div className="energy-quiz-options">
                      {quiz.options.map((opt, optIdx) => {
                        const picked = chosen === optIdx
                        const isRight = optIdx === quiz.correctIndex
                        let cls = ''
                        if (answered) {
                          if (isRight) cls = ' correct'
                          else if (picked) cls = ' wrong'
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={picked}
                            className={`energy-quiz-option${cls}`}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [quiz.id]: optIdx,
                              }))
                            }
                          >
                            <span className="energy-quiz-letter">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                    {answered && (
                      <div
                        role="status"
                        className={
                          'energy-quiz-feedback' +
                          (chosen === quiz.correctIndex
                            ? ' is-right'
                            : ' is-wrong')
                        }
                      >
                        <strong>
                          {chosen === quiz.correctIndex
                            ? '回答正确：'
                            : `回答有误（正确答案应为 ${String.fromCharCode(65 + quiz.correctIndex)}）：`}
                        </strong>
                        <span>{quiz.explanation}</span>
                      </div>
                    )}
                  </article>
                )
              })}
          </div>
        </section>
      )}

      {viewMode === 'study' && (
        <div className={`energy-workspace ${activeCourse.themeClass}`}>
          <aside className="energy-sidebar" aria-label={`${activeCourse.name}目录`}>
            <div className="energy-course-overview">
              <p className="eyebrow">{activeCourse.englishName}</p>
              <h2>{activeCourse.name}学习路线</h2>
              <p>{activeCourse.description}</p>
              <ol className="energy-path-list">
                {activeCourse.learningPath.map((stage) => (
                  <li key={stage}>{stage}</li>
                ))}
              </ol>
            </div>

            <div className="energy-sidebar-filters">
              <div
                className="energy-difficulty-pills"
                role="group"
                aria-label="按难度筛选"
              >
                {DIFFICULTY_FILTERS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={difficultyFilter === level}
                    className={difficultyFilter === level ? 'active' : ''}
                    onClick={() => setDifficultyFilter(level)}
                  >
                    {level === 'all' ? '全部' : level}
                  </button>
                ))}
              </div>
              <div className="energy-filter-toggles">
                <label className="energy-unmastered-check">
                  <input
                    type="checkbox"
                    checked={onlyUnmastered}
                    onChange={(event) => setOnlyUnmastered(event.target.checked)}
                  />
                  <span>
                    仅看未掌握 ({courseTopics.length - courseMasteredCount(activeCourse.id)})
                  </span>
                </label>
                <label className="energy-unmastered-check">
                  <input
                    type="checkbox"
                    checked={onlyBookmarked}
                    onChange={(event) => setOnlyBookmarked(event.target.checked)}
                  />
                  <span>仅看收藏</span>
                </label>
              </div>
            </div>

            <nav className="energy-topic-nav" aria-label="课程章节导航">
              {matchingSidebarIds.size === 0 ? (
                <p className="energy-empty-nav">当前筛选条件下暂无专题。</p>
              ) : (
                activeCourse.modules.map((mod) => {
                  const visibleTopicIds = mod.topicIds.filter((id) =>
                    matchingSidebarIds.has(id),
                  )
                  if (!visibleTopicIds.length) return null
                  const modMastered = mod.topicIds.filter((id) =>
                    masteredIds.includes(id),
                  ).length
                  return (
                    <div className="energy-module-group" key={mod.id}>
                      <div className="energy-module-header">
                        <strong>{mod.title}</strong>
                        <span>
                          {modMastered}/{mod.topicIds.length}
                        </span>
                      </div>
                      {visibleTopicIds.map((tId) => {
                        const topic = getTopicById(tId)
                        if (!topic) return null
                        const current = topic.id === activeTopic.id
                        const done = masteredIds.includes(topic.id)
                        const starred = bookmarkedIds.includes(topic.id)
                        return (
                          <Link
                            key={topic.id}
                            to={`/knowledge/${topic.courseId}/${topic.id}`}
                            className={
                              'energy-topic-link' +
                              (current ? ' active' : '') +
                              (done ? ' mastered' : '')
                            }
                            aria-current={current ? 'page' : undefined}
                          >
                            <div className="energy-topic-link-meta">
                              <span>{topic.chapter}</span>
                              <span className="energy-diff-pill">
                                {topic.difficulty}
                              </span>
                            </div>
                            <div className="energy-topic-link-title">
                              <strong>{topic.title}</strong>
                              <span className="energy-link-icons">
                                {starred && (
                                  <span
                                    className="energy-star-mark"
                                    aria-label="已收藏"
                                  >
                                    ★
                                  </span>
                                )}
                                {done && (
                                  <span
                                    className="energy-done-mark"
                                    aria-label="已掌握"
                                  >
                                    ✓
                                  </span>
                                )}
                              </span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )
                })
              )}
            </nav>
          </aside>

          <article className="energy-reader" aria-label={activeTopic.title}>
            <header className="energy-reader-header">
              <div className="energy-reader-badges">
                {activeTopic.moduleGroup && (
                  <span className="energy-module-badge">
                    {activeTopic.moduleGroup}
                  </span>
                )}
                <span className="energy-chapter-badge">
                  {activeTopic.chapter}
                </span>
                <span className="energy-diff-badge">
                  {activeTopic.difficulty}
                </span>
              </div>
              <div className="energy-reader-title-row">
                <div>
                  <h2>{activeTopic.title}</h2>
                  <p className="energy-reader-subtitle">
                    {activeTopic.englishTitle}
                  </p>
                </div>
                <div className="energy-reader-actions">
                  <button
                    type="button"
                    aria-pressed={isBookmarked}
                    className={
                      'energy-bookmark-btn' + (isBookmarked ? ' bookmarked' : '')
                    }
                    onClick={() => toggleBookmarked(activeTopic.id)}
                  >
                    {isBookmarked ? '★ 已收藏' : '☆ 收藏重点'}
                  </button>
                  <button
                    type="button"
                    aria-pressed={isMastered}
                    className={
                      'energy-master-btn' + (isMastered ? ' mastered' : '')
                    }
                    onClick={() => toggleMastered(activeTopic.id)}
                  >
                    {isMastered ? '已掌握 ✓' : '标记已掌握'}
                  </button>
                </div>
              </div>
              <div className="energy-takeaway">
                <strong>本节要点</strong>
                <p>{brief?.takeaway ?? activeTopic.summary}</p>
              </div>
              {relatedLab && <Link className="ghost-button" to={`/thermal-lab?experiment=${relatedLab.id}`}>打开交互实验 ↗</Link>}

              {(prerequisites.length > 0 || relatedTopics.length > 0) && (
                <div className="energy-prereq-strip">
                  {prerequisites.length > 0 && (
                    <div className="energy-prereq-row">
                      <span className="energy-prereq-label">前置知识：</span>
                      {prerequisites.map((pre) => {
                        const c = getEnergyCourse(pre.courseId)
                        return (
                          <Link
                            key={pre.id}
                            to={`/knowledge/${pre.courseId}/${pre.id}`}
                            className="energy-prereq-chip"
                          >
                            {pre.courseId !== activeTopic.courseId && c
                              ? `${c.name} · `
                              : ''}
                            {pre.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                  {relatedTopics.length > 0 && (
                    <div className="energy-prereq-row">
                      <span className="energy-prereq-label">知识延展：</span>
                      {relatedTopics.map((rel) => {
                        const c = getEnergyCourse(rel.courseId)
                        return (
                          <Link
                            key={rel.id}
                            to={`/knowledge/${rel.courseId}/${rel.id}`}
                            className="energy-prereq-chip is-related"
                          >
                            {rel.courseId !== activeTopic.courseId && c
                              ? `${c.name} · `
                              : ''}
                            {rel.title} →
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </header>

            {activeTopic.diagram && (
              <figure className="energy-section energy-diagram-card">
                <div
                  className="diagram-zoom-stage"
                  onClick={() => setOpenFigure('diagram')}
                >
                  <EnergyKnowledgeDiagram
                    kind={activeTopic.diagram.kind}
                    caption={activeTopic.diagram.caption}
                  />
                  <span className="diagram-zoom-pill" aria-hidden="true">点击放大</span>
                </div>
                <figcaption className="energy-diagram-caption">
                  <div className="energy-diagram-caption-row">
                    <strong>{activeTopic.diagram.caption}</strong>
                    <button
                      type="button"
                      className="diagram-zoom-btn"
                      aria-label={`放大查看：${activeTopic.diagram.caption}`}
                      onClick={() => setOpenFigure('diagram')}
                    >
                      放大查看
                    </button>
                  </div>
                  <span>{activeTopic.diagram.note}</span>
                </figcaption>
              </figure>
            )}

            {brief?.mechanism && (
              <figure className="energy-section energy-mechanism" aria-label={brief.mechanism.title}>
                <div className="energy-mechanism-head">
                  <h3>{brief.mechanism.title}</h3>
                  {brief.mechanism.image && (
                    <button
                      type="button"
                      className="diagram-zoom-btn"
                      aria-label={`放大查看：${brief.mechanism.title}`}
                      onClick={() => setOpenFigure('mechanism')}
                    >
                      放大查看
                    </button>
                  )}
                </div>
                {brief.mechanism.image && (
                  <div
                    className="diagram-zoom-stage"
                    onClick={() => setOpenFigure('mechanism')}
                  >
                    <img
                      className="energy-mechanism-picture"
                      loading="lazy"
                      src={import.meta.env.BASE_URL + 'knowledge/figures/' + brief.mechanism.image.file}
                      alt={brief.mechanism.image.alt}
                    />
                    <span className="diagram-zoom-pill" aria-hidden="true">点击放大</span>
                  </div>
                )}
                <ol className={'energy-mechanism-nodes is-' + brief.mechanism.layout}>
                  {brief.mechanism.nodes.map(([title, note]) => (
                    <li key={title}><strong>{title}</strong><span>{note}</span></li>
                  ))}
                </ol>
                <figcaption>{brief.mechanism.note}</figcaption>
              </figure>
            )}

            <DiagramLightboxModal
              open={Boolean(
                (openFigure === 'diagram' && activeTopic.diagram) ||
                  (openFigure === 'mechanism' && brief?.mechanism?.image),
              )}
              onClose={() => setOpenFigure(null)}
              title={
                openFigure === 'mechanism' && brief?.mechanism
                  ? brief.mechanism.title
                  : activeTopic.diagram?.caption ?? activeTopic.title
              }
              badge={activeCourse.name}
              caption={
                openFigure === 'mechanism' && brief?.mechanism
                  ? brief.mechanism.note
                  : activeTopic.diagram?.note
              }
            >
              {openFigure === 'diagram' && activeTopic.diagram && (
                <EnergyKnowledgeDiagram
                  kind={activeTopic.diagram.kind}
                  caption={activeTopic.diagram.caption}
                  decorative
                />
              )}
              {openFigure === 'mechanism' && brief?.mechanism?.image && (
                <img
                  className="diagram-lightbox-img"
                  src={import.meta.env.BASE_URL + 'knowledge/figures/' + brief.mechanism.image.file}
                  alt=""
                  aria-hidden="true"
                />
              )}
            </DiagramLightboxModal>

            <details className="energy-section energy-topic-details" key={activeTopic.id}>
              <summary>原理与关键条件</summary>
              <p>{activeTopic.summary}</p>
              <ul className="energy-keypoints-list">
                {activeTopic.keyPoints.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </details>

            {activeTopic.formulas.length > 0 && (
              <section className="energy-section">
                <h3>关键方程与物理意义</h3>
                <div className="energy-formulas-grid">
                  {activeTopic.formulas.map((formula, idx) => {
                    const key = `${activeTopic.id}-f-${idx}`
                    return (
                      <div className="energy-formula-card" key={key}>
                        <div className="energy-formula-head">
                          <h4>{formula.title}</h4>
                          <button
                            type="button"
                            className="ghost-button button-link-small"
                            onClick={() => handleCopyLatex(formula.latex, key)}
                          >
                            {copiedFormulaKey === key ? '已复制' : '复制 LaTeX'}
                          </button>
                        </div>
                        <div className="energy-formula-math">
                          <MathFormula latex={formula.latex} />
                        </div>
                        <p className="energy-formula-meaning">
                          {formula.meaning}
                        </p>
                        {formula.symbols && formula.symbols.length > 0 && (
                          <div className="formula-symbol-table-wrap">
                            <table className="formula-symbol-table">
                              <thead>
                                <tr>
                                  <th>符号</th>
                                  <th>物理意义</th>
                                  <th>常用单位</th>
                                </tr>
                              </thead>
                              <tbody>
                                {formula.symbols.map((sym) => (
                                  <tr key={`${key}-${sym.symbol}`}>
                                    <td>
                                      <strong className="math-symbol">
                                        {sym.symbol}
                                      </strong>
                                    </td>
                                    <td>{sym.meaning}</td>
                                    <td>{sym.unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                        {formula.conditions && (
                          <p className="energy-formula-conditions">
                            <strong>适用假设与限定条件：</strong>
                            {formula.conditions}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {activeTopic.comparisonTable && (
              <section className="energy-section">
                <h3>{activeTopic.comparisonTable.caption}</h3>
                <div className="energy-table-wrap">
                  <table className="energy-compare-table">
                    <thead>
                      <tr>
                        {activeTopic.comparisonTable.headers.map((header) => (
                          <th key={header}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTopic.comparisonTable.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTopic.workedExample && (
              <section
                className="energy-section energy-example-card"
                aria-label="经典工程例题"
              >
                <div className="energy-example-head">
                  <div>
                    <span className="energy-example-tag">工程例题演练</span>
                    <h3>{activeTopic.workedExample.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="ghost-button button-link-small"
                    aria-expanded={exampleExpanded}
                    onClick={() =>
                      setExpandedExamples((prev) => ({
                        ...prev,
                        [activeTopic.id]: !exampleExpanded,
                      }))
                    }
                  >
                    {exampleExpanded ? '收起解析 ▲' : '查看分步求解 ▼'}
                  </button>
                </div>
                <p className="energy-example-scenario">
                  {activeTopic.workedExample.scenario}
                </p>
                <div className="energy-example-given">
                  <strong>已知条件：</strong>
                  {activeTopic.workedExample.given.map((item) => (
                    <span key={item} className="energy-given-chip">
                      {item}
                    </span>
                  ))}
                </div>

                {exampleExpanded && (
                  <div className="energy-example-solution">
                    <ol>
                      {activeTopic.workedExample.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <div className="energy-example-answer">
                      <strong>结论答案：</strong>
                      <span>{activeTopic.workedExample.answer}</span>
                    </div>
                    {activeTopic.workedExample.takeaway && (
                      <p className="energy-example-takeaway">
                        <strong>工程启示：</strong>
                        {activeTopic.workedExample.takeaway}
                      </p>
                    )}
                  </div>
                )}
              </section>
            )}

            <section className="energy-section energy-tips-box">
              <h3>工程直觉与常见误区警示</h3>
              <ul>
                {activeTopic.engineeringTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>

            {activeTopic.cfdConnections &&
              activeTopic.cfdConnections.length > 0 && (
                <section className="energy-section">
                  <h3>关联 CFD 计算器与 Fluent 实战入口</h3>
                  <div className="energy-cfd-links">
                    {activeTopic.cfdConnections.map((conn) => (
                      <Link
                        key={conn.to}
                        to={conn.to}
                        className="energy-cfd-link-card"
                      >
                        <strong>{conn.label} →</strong>
                        <small>{conn.note}</small>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

            <section
              className="energy-section energy-quiz-card"
              aria-label="随堂概念自测"
            >
              <div className="energy-quiz-head">
                <div>
                  <h3>随堂概念自测（{topicQuizzes.length} 题）</h3>
                  <small className="energy-quiz-score">
                    本节已答 {topicAnsweredCount}/{topicQuizzes.length} · 答对{' '}
                    {topicCorrectCount}
                  </small>
                </div>
                {topicAnsweredCount > 0 && (
                  <button
                    type="button"
                    className="ghost-button button-link-small"
                    onClick={() =>
                      setSelectedAnswers((prev) => {
                        const next = { ...prev }
                        for (const q of topicQuizzes) delete next[q.id]
                        return next
                      })
                    }
                  >
                    重新作答
                  </button>
                )}
              </div>

              {topicQuizzes.map((quiz, qIdx) => {
                const quizAnswer = selectedAnswers[quiz.id]
                const hasAnswered = quizAnswer !== undefined
                return (
                  <div className="energy-quiz-block" key={quiz.id}>
                    <p className="energy-quiz-question">
                      {qIdx + 1}. {quiz.question}
                    </p>
                    <div className="energy-quiz-options">
                      {quiz.options.map((opt, idx) => {
                        const chosen = quizAnswer === idx
                        const isCorrectOpt = idx === quiz.correctIndex
                        let stateClass = ''
                        if (hasAnswered) {
                          if (isCorrectOpt) stateClass = ' correct'
                          else if (chosen) stateClass = ' wrong'
                        }
                        return (
                          <button
                            key={opt}
                            type="button"
                            aria-pressed={chosen}
                            className={`energy-quiz-option${stateClass}`}
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [quiz.id]: idx,
                              }))
                            }
                          >
                            <span className="energy-quiz-letter">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        )
                      })}
                    </div>
                    {hasAnswered && (
                      <div
                        role="status"
                        className={
                          'energy-quiz-feedback' +
                          (quizAnswer === quiz.correctIndex
                            ? ' is-right'
                            : ' is-wrong')
                        }
                      >
                        <strong>
                          {quizAnswer === quiz.correctIndex
                            ? '回答正确：'
                            : `回答有误（正确答案应为 ${String.fromCharCode(65 + quiz.correctIndex)}）：`}
                        </strong>
                        <span>{quiz.explanation}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>

            <footer className="energy-reader-footer">
              <div className="energy-prev-next">
                {prevTopic ? (
                  <Link
                    className="ghost-button"
                    to={`/knowledge/${prevTopic.courseId}/${prevTopic.id}`}
                  >
                    ← 上一节：{prevTopic.title}
                  </Link>
                ) : (
                  <span />
                )}
                {nextTopic ? (
                  <Link
                    className="button-link"
                    to={`/knowledge/${nextTopic.courseId}/${nextTopic.id}`}
                  >
                    下一节：{nextTopic.title} →
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => setViewMode('framework')}
                  >
                    本课程 {courseTopics.length} 节已浏览完毕 · 查看跨学科框架图谱 →
                  </button>
                )}
              </div>
              <p className="energy-reference-note">
                专业学习说明：页面公式与关联式均附带理想化假设与使用条件说明，涉及真实设备定型设计与压力容器/制冷剂物性计算时，请核对最新国家标准及实测物性手册。
              </p>
            </footer>
          </article>
        </div>
      )}
    </div>
  )
}

export default EnergyKnowledgePage
