import { useEffect, useMemo, useState } from 'react'
import {
  groupKnowledgeByModule,
  loadFluentKnowledge,
} from '../knowledge/knowledgeRepository'
import type { FluentKnowledgeEntry } from '../models/knowledge'

function renderText(value: string) {
  if (value.startsWith('TODO')) {
    return <span className="todo-text">{value}</span>
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
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setLoadError(error instanceof Error ? error.message : '知识库读取失败')
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
      <section className="page-title">
        <p className="eyebrow">Fluent guide</p>
        <h1>Fluent 功能导览</h1>
        <p>
          这里是自主设计的教学界面，不连接 Fluent，也不复制官方界面。点击功能节点后从本地 JSON 知识库读取解释。
        </p>
      </section>

      {loadError ? (
        <section className="notice" role="alert">
          <h2>知识库加载失败</h2>
          <p>{loadError}</p>
        </section>
      ) : (
        <section className="guide-layout">
          <nav className="guide-workspace" aria-label="Fluent guide modules">
            <h2>功能目录</h2>
            <ul className="module-list">
              {Object.entries(groupedEntries).map(([moduleName, moduleEntries]) => (
                <li key={moduleName}>
                  <p className="field-label">{moduleName}</p>
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
              <p className="eyebrow">Teaching panel</p>
              <h2>{selectedEntry?.module ?? '加载中'}</h2>
              <p>
                当前模拟区域只展示教学导航逻辑。后续会根据知识库 ID
                扩展为更接近工作流的设置面板。
              </p>
              {selectedEntry ? (
                <button className="panel-button active" type="button">
                  {selectedEntry.menuPath.join(' / ')}
                </button>
              ) : null}
            </div>
          </section>

          <aside className="guide-detail" aria-label="Knowledge detail">
            {selectedEntry ? (
              <>
                <p className="eyebrow">{selectedEntry.id}</p>
                <h2>
                  {selectedEntry.englishName} · {selectedEntry.chineseName}
                </h2>
                <div className="detail-section">
                  <span className="detail-label">一句话说明</span>
                  <p>{renderText(selectedEntry.oneLineSummary)}</p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">功能原理</span>
                  <p>{renderText(selectedEntry.principle)}</p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">使用场景</span>
                  <p>{renderText(selectedEntry.useCases)}</p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">常见错误</span>
                  <p>{renderText(selectedEntry.commonErrors)}</p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">检查建议</span>
                  <p>{renderText(selectedEntry.checkSuggestions)}</p>
                </div>
                <div className="detail-section">
                  <span className="detail-label">内容版本</span>
                  <p>
                    {selectedEntry.contentVersion} · {selectedEntry.updatedAt}
                  </p>
                </div>
              </>
            ) : (
              <p>正在加载知识库...</p>
            )}
          </aside>
        </section>
      )}
    </div>
  )
}

export default FluentGuidePage
