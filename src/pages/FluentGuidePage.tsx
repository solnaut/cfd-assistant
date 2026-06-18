import { useEffect, useMemo, useState } from 'react'
import {
  groupKnowledgeByModule,
  loadFluentKnowledge,
} from '../knowledge/knowledgeRepository'
import Breadcrumbs from '../components/Breadcrumbs'
import PageHeader from '../components/PageHeader'
import type { FluentKnowledgeEntry } from '../models/knowledge'

const contentFallbacks = {
  summary: '这部分说明正在整理中。',
  principle: '后续会补充核心概念、设置含义与使用边界。',
  useCases: '后续会补充典型使用场景。',
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

  const groupedEntries = useMemo(() => groupKnowledgeByModule(entries), [entries])
  const selectedEntry =
    entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null

  return (
    <div className="page">
      <Breadcrumbs
        items={[{ label: '首页', to: '/' }, { label: 'Fluent 功能导览' }]}
      />
      <PageHeader
        eyebrow="Fluent guide"
        title="Fluent 功能导览"
        description="通过教学化功能树浏览常见设置项，并在侧边面板查看对应说明。"
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
                          onClick={() => setSelectedId(entry.id)}
                        >
                          <span className="node-title">{entry.englishName}</span>
                          <span className="node-path">{entry.chineseName}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </nav>

          <section className="mock-interface" aria-label="Teaching interface">
            <div className="mock-panel">
              <div className="panel-heading">
                <p className="eyebrow">Teaching panel</p>
                <h2>{selectedEntry?.module ?? '加载中'}</h2>
              </div>
              <div className="teaching-surface">
                <span className="surface-line wide" />
                <span className="surface-line" />
                <span className="surface-control active">
                  {selectedEntry ? selectedEntry.menuPath.join(' / ') : 'Loading'}
                </span>
                <span className="surface-control" />
                <span className="surface-control short" />
              </div>
            </div>
          </section>

          <aside className="guide-detail" aria-label="Knowledge detail">
            {selectedEntry ? (
              <>
                <p className="eyebrow">{selectedEntry.module}</p>
                <h2>
                  {selectedEntry.englishName} · {selectedEntry.chineseName}
                </h2>
                <div className="detail-section">
                  <span className="detail-label">简介</span>
                  <p>
                    {displayContent(
                      selectedEntry.oneLineSummary,
                      contentFallbacks.summary,
                    )}
                  </p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">功能理解</span>
                  <p>
                    {displayContent(
                      selectedEntry.principle,
                      contentFallbacks.principle,
                    )}
                  </p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">使用场景</span>
                  <p>
                    {displayContent(
                      selectedEntry.useCases,
                      contentFallbacks.useCases,
                    )}
                  </p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">常见问题</span>
                  <p>
                    {displayContent(
                      selectedEntry.commonErrors,
                      contentFallbacks.commonErrors,
                    )}
                  </p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">检查建议</span>
                  <p>
                    {displayContent(
                      selectedEntry.checkSuggestions,
                      contentFallbacks.checkSuggestions,
                    )}
                  </p>
                </div>
              </>
            ) : (
              <p>正在加载知识内容...</p>
            )}
          </aside>
        </section>
      )}
    </div>
  )
}

export default FluentGuidePage
