import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCalculator } from '../calculators/registry'
import Breadcrumbs from '../components/Breadcrumbs'
import PageHeader from '../components/PageHeader'
import {
  findKnowledgeEntry,
  groupKnowledgeByModule,
  loadFluentKnowledge,
  searchKnowledgeEntries,
} from '../knowledge/knowledgeRepository'
import type {
  FluentKnowledgeControl,
  FluentKnowledgeEntry,
} from '../models/knowledge'

const contentFallbacks = {
  summary: '这部分说明正在整理中。',
  principle: '后续会补充核心概念、设置含义与使用边界。',
  useCases: '后续会补充典型使用场景。',
  optionDifferences: '后续会补充不同选项的区别。',
  impact: '后续会补充对精度、稳定性和计算成本的影响。',
  prerequisites: '后续会补充前置条件。',
  commonErrors: '后续会补充常见误区。',
  checkSuggestions: '后续会补充检查建议。',
}

function displayContent(value: string, fallback: string) {
  if (!value || value.trim().startsWith('TODO')) {
    return fallback
  }

  return value
}

function FluentGuidePage() {
  const [entries, setEntries] = useState<FluentKnowledgeEntry[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    loadFluentKnowledge()
      .then((knowledgeFile) => {
        if (cancelled) {
          return
        }

        setEntries(knowledgeFile.entries)
        setSelectedId(knowledgeFile.entries[0]?.id ?? null)
      })
      .catch(() => {
        if (cancelled) {
          return
        }

        setLoadError('知识内容暂时无法加载，请稍后重试。')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filteredEntries = useMemo(
    () => searchKnowledgeEntries(entries, searchQuery),
    [entries, searchQuery],
  )
  const groupedEntries = useMemo(
    () => groupKnowledgeByModule(filteredEntries),
    [filteredEntries],
  )
  const selectedEntry =
    entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null
  const selectedControl =
    selectedEntry?.controls?.find((control) => control.id === selectedControlId) ??
    selectedEntry?.controls?.[0] ??
    null

  function selectEntry(entryId: string) {
    setSelectedId(entryId)
    setSelectedControlId(null)
  }

  return (
    <div className="page">
      <Breadcrumbs
        items={[{ label: '首页', to: '/' }, { label: 'Fluent 功能导览' }]}
      />
      <PageHeader
        eyebrow="Fluent guide"
        title="Fluent 功能导览"
        description="通过自主设计的教学界面浏览常见设置项，点击节点或控件即可查看说明。"
      />

      {loadError ? (
        <section className="notice" role="alert">
          <h2>内容加载失败</h2>
          <p>{loadError}</p>
        </section>
      ) : (
        <section className="guide-layout">
          <nav className="guide-workspace" aria-label="Fluent guide modules">
            <div className="panel-heading">
              <p className="eyebrow">Workflow</p>
              <h2>功能目录</h2>
            </div>
            <label className="guide-search">
              <span>搜索功能或设置</span>
              <input
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="例如 velocity、wall、初始化"
                type="search"
                value={searchQuery}
              />
            </label>

            {filteredEntries.length ? (
              <ul className="module-list">
                {Object.entries(groupedEntries).map(([moduleName, moduleEntries]) => (
                  <li key={moduleName}>
                    <p className="module-heading">{moduleName}</p>
                    <ul className="node-list">
                      {moduleEntries.map((entry) => (
                        <li key={entry.id}>
                          <button
                            className={
                              entry.id === selectedEntry?.id
                                ? 'node-button active'
                                : 'node-button'
                            }
                            type="button"
                            onClick={() => selectEntry(entry.id)}
                          >
                            <span className="node-title">{entry.englishName}</span>
                            <span className="node-path">
                              {entry.menuPath.join(' / ')}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-result compact">
                <strong>没有匹配的功能项</strong>
                <p>请尝试使用英文名称、中文名称或常用关键词搜索。</p>
              </div>
            )}
          </nav>

          <TeachingPanel
            entry={selectedEntry}
            selectedControl={selectedControl}
            onSelectControl={setSelectedControlId}
          />

          <KnowledgeDetail
            control={selectedControl}
            entries={entries}
            entry={selectedEntry}
            onSelectEntry={selectEntry}
          />
        </section>
      )}
    </div>
  )
}

interface TeachingPanelProps {
  entry: FluentKnowledgeEntry | null
  selectedControl: FluentKnowledgeControl | null
  onSelectControl: (controlId: string) => void
}

function TeachingPanel({
  entry,
  selectedControl,
  onSelectControl,
}: TeachingPanelProps) {
  return (
    <section className="mock-interface" aria-label="Teaching interface">
      <div className="mock-panel">
        <div className="panel-heading">
          <p className="eyebrow">Teaching panel</p>
          <h2>{entry?.module ?? '加载中'}</h2>
        </div>

        {entry ? (
          <div className="teaching-surface">
            <div className="mock-path">{entry.menuPath.join(' / ')}</div>
            <div className="mock-window">
              <div className="mock-window-title">
                <strong>{entry.englishName}</strong>
                <span>{entry.chineseName}</span>
              </div>
              <div className="mock-control-grid">
                {entry.controls?.map((control) => (
                  <button
                    className={
                      control.id === selectedControl?.id
                        ? `mock-control mock-control-${control.controlType} active`
                        : `mock-control mock-control-${control.controlType}`
                    }
                    key={control.id}
                    onClick={() => onSelectControl(control.id)}
                    type="button"
                  >
                    <span>{control.label}</span>
                    {control.value ? <small>{control.value}</small> : null}
                  </button>
                ))}
              </div>
            </div>

            {selectedControl?.opensDialog ? (
              <div className="mock-dialog" role="presentation">
                <div className="mock-dialog-title">
                  {selectedControl.label} 设置
                </div>
                <div className="surface-control active">
                  {selectedControl.description}
                </div>
                <div className="surface-control short">Apply</div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="empty-result compact">
            <strong>正在加载教学界面</strong>
            <p>功能树加载后会显示对应设置面板。</p>
          </div>
        )}
      </div>
    </section>
  )
}

interface KnowledgeDetailProps {
  entry: FluentKnowledgeEntry | null
  control: FluentKnowledgeControl | null
  entries: FluentKnowledgeEntry[]
  onSelectEntry: (entryId: string) => void
}

function KnowledgeDetail({
  control,
  entries,
  entry,
  onSelectEntry,
}: KnowledgeDetailProps) {
  if (!entry) {
    return (
      <aside className="guide-detail" aria-label="Knowledge detail">
        <p>正在加载知识内容...</p>
      </aside>
    )
  }

  return (
    <aside className="guide-detail" aria-label="Knowledge detail">
      <p className="eyebrow">{entry.module}</p>
      <h2>
        {entry.englishName} · {entry.chineseName}
      </h2>

      {control ? (
        <div className="detail-section active-control-detail">
          <span className="detail-label">当前控件</span>
          <strong>{control.label}</strong>
          <p>{control.description}</p>
        </div>
      ) : null}

      <DetailText
        label="简介"
        text={displayContent(entry.oneLineSummary, contentFallbacks.summary)}
      />
      <DetailText
        label="功能理解"
        text={displayContent(entry.principle, contentFallbacks.principle)}
      />
      <DetailText
        label="使用场景"
        text={displayContent(entry.useCases, contentFallbacks.useCases)}
      />

      {entry.majorOptions.length ? (
        <div className="detail-section">
          <span className="detail-label">主要选项</span>
          <ul className="option-list">
            {entry.majorOptions.map((option) => (
              <li key={option.id ?? option.name}>
                <strong>{option.name}</strong>
                <span>{option.description}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <DetailText
        label="选项区别"
        text={displayContent(
          entry.optionDifferences,
          contentFallbacks.optionDifferences,
        )}
      />
      <DetailText
        label="影响"
        text={displayContent(
          entry.impactOnAccuracyStabilityCost,
          contentFallbacks.impact,
        )}
      />
      <DetailText
        label="前置条件"
        text={displayContent(entry.prerequisites, contentFallbacks.prerequisites)}
      />
      <DetailText
        label="常见问题"
        text={displayContent(entry.commonErrors, contentFallbacks.commonErrors)}
      />
      <DetailText
        label="检查建议"
        text={displayContent(
          entry.checkSuggestions,
          contentFallbacks.checkSuggestions,
        )}
      />

      <RelatedFeatures
        entries={entries}
        entry={entry}
        onSelectEntry={onSelectEntry}
      />
      <RelatedCalculators entry={entry} />
      {entry.sources?.length ? (
        <div className="detail-section">
          <span className="detail-label">来源</span>
          <ul className="source-list">
            {entry.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} rel="noreferrer" target="_blank">
                  {source.title}
                </a>
                <span>
                  {source.organization} · 访问日期 {source.accessedAt}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  )
}

function DetailText({ label, text }: { label: string; text: string }) {
  return (
    <div className="detail-section">
      <span className="detail-label">{label}</span>
      <p>{text}</p>
    </div>
  )
}

function RelatedFeatures({
  entries,
  entry,
  onSelectEntry,
}: {
  entries: FluentKnowledgeEntry[]
  entry: FluentKnowledgeEntry
  onSelectEntry: (entryId: string) => void
}) {
  const relatedEntries = entry.relatedFeatures
    .map((entryId) => findKnowledgeEntry(entries, entryId))
    .filter((relatedEntry): relatedEntry is FluentKnowledgeEntry => Boolean(relatedEntry))

  if (!relatedEntries.length) {
    return null
  }

  return (
    <div className="detail-section">
      <span className="detail-label">关联功能</span>
      <div className="related-pill-list">
        {relatedEntries.map((relatedEntry) => (
          <button
            className="related-pill"
            key={relatedEntry.id}
            onClick={() => onSelectEntry(relatedEntry.id)}
            type="button"
          >
            {relatedEntry.englishName}
          </button>
        ))}
      </div>
    </div>
  )
}

function RelatedCalculators({ entry }: { entry: FluentKnowledgeEntry }) {
  const calculators = entry.relatedCalculators
    .map((calculatorId) => getCalculator(calculatorId))
    .filter((calculator): calculator is NonNullable<typeof calculator> => Boolean(calculator))

  if (!calculators.length) {
    return null
  }

  return (
    <div className="detail-section">
      <span className="detail-label">关联计算器</span>
      <div className="related-pill-list">
        {calculators.map((calculator) => (
          <Link
            className="related-pill"
            key={calculator.id}
            to={`/calculators/${calculator.categoryId}/${calculator.id}`}
          >
            {calculator.shortName}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default FluentGuidePage
