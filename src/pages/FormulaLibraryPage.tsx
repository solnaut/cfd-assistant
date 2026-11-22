import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import MathFormula from '../components/MathFormula'
import PageHeader from '../components/PageHeader'
import {
  getCalculatorFormulaEntries,
  getFormulaVariables,
} from '../calculators/formulas'
import {
  calculatorCatalog,
  calculatorCategories,
} from '../calculators/registry'
import { FORMULA_SEARCH_EVENT } from '../search/globalSearchIndex'
import {
  formatVariableSymbol,
} from '../utils/engineeringDisplay'
import { copyToClipboard } from '../utils/clipboard'

const formulasByCategory = calculatorCategories
  .map((category) => ({
    category,
    formulas: calculatorCatalog.flatMap((calculator) => {
      if (
        calculator.categoryId !== category.id ||
        calculator.availability !== 'available'
      ) {
        return []
      }

      return getCalculatorFormulaEntries(calculator).map((formula) => ({
        calculator,
        formula,
        variables: getFormulaVariables(calculator, formula),
      }))
    }),
  }))
  .filter((group) => group.formulas.length > 0)

function FormulaLibraryPage() {
  const location = useLocation()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [query, setQuery] = useState(
    () => new URLSearchParams(location.search).get('q') ?? '',
  )

  useEffect(() => {
    function handleFormulaSearch(event: Event) {
      const detail = (event as CustomEvent<string>).detail
      if (typeof detail === 'string') {
        setQuery(detail)
      }
    }
    window.addEventListener(FORMULA_SEARCH_EVENT, handleFormulaSearch)
    return () => {
      window.removeEventListener(FORMULA_SEARCH_EVENT, handleFormulaSearch)
    }
  }, [])

  const tokens = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [query],
  )

  const filteredGroups = useMemo(() => {
    if (!tokens.length) return formulasByCategory
    return formulasByCategory
      .map(({ category, formulas }) => ({
        category,
        formulas: formulas.filter(({ calculator, formula, variables }) => {
          const text = [
            category.name,
            category.eyebrow,
            calculator.name,
            calculator.shortName,
            formula.title,
            formula.description ?? '',
            formula.plainText,
            formula.latex,
            ...variables.flatMap((v) => [
              v.symbol,
              v.displaySymbol ?? '',
              v.name,
              v.description,
            ]),
          ]
            .join(' ')
            .toLowerCase()
          return tokens.every((token) => text.includes(token))
        }),
      }))
      .filter((group) => group.formulas.length > 0)
  }, [tokens])

  const totalMatches = filteredGroups.reduce(
    (sum, group) => sum + group.formulas.length,
    0,
  )

  async function copyText(text: string, id: string) {
    const copied = await copyToClipboard(text)

    if (copied) {
      setCopiedId(id)
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current))
      }, 1800)
    }
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: '首页', to: '/' }, { label: 'CFD 公式库' }]} />
      <PageHeader
        eyebrow="Formula library"
        title="CFD 公式库"
        description="按工程类别快速查看公式、符号含义，支持关键词/符号筛选与复制原始 LaTeX。"
      />

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
            aria-label="搜索 CFD 公式"
            placeholder="按公式名称、符号（如 Re、Nu、y+）或物理量筛选…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {tokens.length > 0 && (
          <div className="inline-search-meta">
            <span>共匹配 {totalMatches} 条公式</span>
            <button
              type="button"
              className="ghost-button button-link-small"
              onClick={() => setQuery('')}
            >
              清空筛选
            </button>
          </div>
        )}
      </div>

      {filteredGroups.length > 0 && (
        <nav className="formula-category-nav" aria-label="Formula categories">
          {filteredGroups.map(({ category, formulas }) => (
            <a href={`#formula-category-${category.id}`} key={category.id}>
              <span>{category.name}</span>
              <strong>{formulas.length}</strong>
            </a>
          ))}
        </nav>
      )}

      {filteredGroups.length === 0 ? (
        <div className="empty-result" role="status">
          <p>未找到与“{query.trim()}”匹配的 CFD 公式或符号定义。</p>
          <button
            type="button"
            className="ghost-button button-link-small"
            onClick={() => setQuery('')}
          >
            清空筛选
          </button>
        </div>
      ) : (
        <section className="formula-library" aria-label="CFD formulas">
          {filteredGroups.map(({ category, formulas }) => (
            <section
              className="formula-category-section"
              id={`formula-category-${category.id}`}
              key={category.id}
            >
              <div className="formula-section-heading">
                <div>
                  <p className="eyebrow">{category.eyebrow}</p>
                  <h2>{category.name}</h2>
                </div>
                <span>{formulas.length} 条公式</span>
              </div>

              <div className="formula-card-grid">
                {formulas.map(({ calculator, formula, variables }) => {
                  const formulaId = `${calculator.id}-${formula.id ?? formula.title}`
                  return (
                    <article className="formula-card" key={formulaId}>
                      <div className="formula-card-heading">
                        <div>
                          <p className="eyebrow">{category.name}</p>
                          <h3>{formula.title}</h3>
                        </div>
                        <button
                          className="ghost-button button-link-small"
                          onClick={() => void copyText(formula.latex, formulaId)}
                          type="button"
                        >
                          {copiedId === formulaId ? '已复制' : '复制 LaTeX'}
                        </button>
                      </div>
                      <div className="formula-equation-wrap">
                        <MathFormula latex={formula.latex} />
                      </div>

                      {variables.length ? (
                        <div className="formula-symbol-table-wrap">
                          <table className="formula-symbol-table">
                            <thead>
                              <tr>
                                <th>符号</th>
                                <th>含义</th>
                              </tr>
                            </thead>
                            <tbody>
                              {variables.map((variable) => (
                                <tr key={`${formulaId}-${variable.symbol}`}>
                                  <td>
                                    <strong className="math-symbol">
                                      {formatVariableSymbol(variable)}
                                    </strong>
                                  </td>
                                  <td>{variable.name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>
          ))}
        </section>
      )}
    </div>
  )
}

export default FormulaLibraryPage
