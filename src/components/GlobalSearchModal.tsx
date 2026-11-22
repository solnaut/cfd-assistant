import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  countByCategory,
  DEFAULT_SEARCH_SUGGESTIONS,
  FORMULA_SEARCH_EVENT,
  GLOBAL_SEARCH_CATEGORY_LABELS,
  MESHING_LOCATE_EVENT,
  searchGlobalIndex,
  WORKBENCH_LOCATE_EVENT,
  type GlobalSearchCategory,
  type GlobalSearchItem,
} from '../search/globalSearchIndex'

const CATEGORY_ORDER: GlobalSearchCategory[] = [
  'all',
  'knowledge',
  'solution',
  'meshing',
  'calculator',
  'formula',
  'troubleshoot',
  'tui',
]

function HighlightText({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>
  const escaped = tokens
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (!escaped.length) return <>{text}</>
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, idx) =>
        tokens.some((t) => part.toLowerCase() === t.toLowerCase()) ? (
          <mark key={idx}>{part}</mark>
        ) : (
          <span key={idx}>{part}</span>
        ),
      )}
    </>
  )
}

export function GlobalSearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<GlobalSearchCategory>('all')
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  const trimmed = query.trim()
  const tokens = useMemo(
    () =>
      trimmed
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [trimmed],
  )
  const results = useMemo(
    () => searchGlobalIndex(query, category, 32),
    [query, category],
  )
  const counts = useMemo(() => countByCategory(query), [query])
  const clampedActive =
    results.length > 0 ? Math.min(activeIndex, results.length - 1) : 0

  function resetAndClose() {
    setQuery('')
    setCategory('all')
    setActiveIndex(0)
    onClose()
  }

  function handleSelectItem(item: GlobalSearchItem) {
    if (item.action) {
      if (
        (item.action.kind === 'solution-locate' ||
          item.action.kind === 'solution-troubleshoot' ||
          item.action.kind === 'solution-tui') &&
        location.pathname === '/fluent-guide'
      ) {
        window.dispatchEvent(
          new CustomEvent(WORKBENCH_LOCATE_EVENT, { detail: item.action }),
        )
      } else if (
        (item.action.kind === 'meshing-task' ||
          item.action.kind === 'meshing-troubleshoot' ||
          item.action.kind === 'meshing-tui') &&
        location.pathname === '/fluent-meshing'
      ) {
        window.dispatchEvent(
          new CustomEvent(MESHING_LOCATE_EVENT, { detail: item.action }),
        )
      } else if (
        item.action.kind === 'formula-query' &&
        location.pathname === '/formulas'
      ) {
        window.dispatchEvent(
          new CustomEvent(FORMULA_SEARCH_EVENT, { detail: item.action.value }),
        )
      }
    }

    navigate(item.to)
    resetAndClose()
  }

  if (!open) return null

  return (
    <div
      className="global-search-backdrop"
      onClick={resetAndClose}
    >
      <div
        className="global-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label="全站搜索"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            resetAndClose()
            return
          }
          if (event.key === 'ArrowDown' && results.length > 0) {
            event.preventDefault()
            setActiveIndex((prev) => (prev + 1) % results.length)
            return
          }
          if (event.key === 'ArrowUp' && results.length > 0) {
            event.preventDefault()
            setActiveIndex((prev) => (prev - 1 + results.length) % results.length)
            return
          }
          if (event.key === 'Enter' && results[clampedActive]) {
            event.preventDefault()
            handleSelectItem(results[clampedActive].item)
          }
        }}
      >
        <div className="global-search-input-row">
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
            ref={inputRef}
            type="search"
            autoFocus
            aria-label="搜索计算器、CFD 公式、Fluent 控件或报错"
            placeholder="搜索计算器、CFD 公式、Fluent 控件、TUI 命令或常见报错…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
          />
          {query && (
            <button
              type="button"
              className="global-search-clear"
              onClick={() => {
                setQuery('')
                setActiveIndex(0)
                inputRef.current?.focus()
              }}
            >
              清空
            </button>
          )}
          <button
            type="button"
            className="global-search-close"
            aria-label="关闭全站搜索"
            onClick={resetAndClose}
          >
            Esc
          </button>
        </div>

        <div className="global-search-tabs" role="group" aria-label="搜索结果分类">
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              className={category === cat ? 'active' : ''}
              onClick={() => {
                setCategory(cat)
                setActiveIndex(0)
              }}
            >
              <span>{GLOBAL_SEARCH_CATEGORY_LABELS[cat]}</span>
              {trimmed && <small>{counts[cat]}</small>}
            </button>
          ))}
        </div>

        <div className="global-search-body">
          {!trimmed ? (
            <div className="global-search-empty-guide">
              <p className="global-search-section-label">推荐快速搜索</p>
              <div className="global-search-suggestions">
                {DEFAULT_SEARCH_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion)
                      setActiveIndex(0)
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <p className="global-search-hint">
                提示：支持中英文双语、多关键词空格组合（如 <code>wall roughness</code>、<code>速度 入口</code>），支持 <kbd>↑</kbd><kbd>↓</kbd> 选择与 <kbd>Enter</kbd> 直达。
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="global-search-empty-guide" role="status">
              <p>未找到与“{trimmed}”匹配的 CFD 计算器、公式、Fluent 控件或排查条目。</p>
              <button
                type="button"
                className="ghost-button button-link-small"
                onClick={() => {
                  setCategory('all')
                  setQuery('')
                  inputRef.current?.focus()
                }}
              >
                清空搜索条件
              </button>
            </div>
          ) : (
            <div className="global-search-results" role="listbox" aria-label="全站搜索结果">
              {results.map(({ item }, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={index === clampedActive}
                  className={
                    'global-search-item' +
                    (index === clampedActive ? ' active' : '')
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelectItem(item)}
                >
                  <div className="global-search-item-head">
                    <span className={`global-search-badge cat-${item.category}`}>
                      {GLOBAL_SEARCH_CATEGORY_LABELS[item.category]}
                    </span>
                    <strong className="global-search-item-title">
                      <HighlightText text={item.title} tokens={tokens} />
                    </strong>
                    {item.subtitle && (
                      <span className="global-search-item-sub">
                        <HighlightText text={item.subtitle} tokens={tokens} />
                      </span>
                    )}
                  </div>
                  <div className="global-search-item-meta">{item.location}</div>
                  {item.summary && (
                    <p className="global-search-item-summary">{item.summary}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
