import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs'
import CalculatorCategoryCard from '../components/CalculatorCategoryCard'
import CalculatorListCard from '../components/CalculatorListCard'
import PageHeader from '../components/PageHeader'
import {
  calculatorCatalog,
  calculatorCategories,
  getCalculatorsByCategory,
} from '../calculators/registry'

const categoryNameMap = new Map(calculatorCategories.map((c) => [c.id, c.name]))

function CalculatorsPage() {
  const [query, setQuery] = useState('')
  const tokens = useMemo(
    () =>
      query
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [query],
  )

  const matchingCalculators = useMemo(() => {
    if (!tokens.length) return []
    return calculatorCatalog.filter((calc) => {
      if (calc.availability !== 'available') return false
      const catName = categoryNameMap.get(calc.categoryId) ?? ''
      const text = [
        calc.id,
        calc.name,
        calc.shortName,
        calc.summary,
        catName,
        ...calc.inputs.flatMap((i) => [i.label, i.quantity]),
        ...calc.outputs.flatMap((o) => [o.label, o.quantity]),
      ]
        .join(' ')
        .toLowerCase()
      return tokens.every((token) => text.includes(token))
    })
  }, [tokens])

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: '首页', to: '/' }, { label: '参数计算' }]} />
      <PageHeader
        eyebrow="Calculators"
        title="参数计算"
        description="按工程主题选择计算器分类，或直接搜索计算器名称、物理量与关键符号。"
        actions={<Link className="ghost-button" to="/unit-converter">工程单位换算器</Link>}
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
            aria-label="搜索参数计算器"
            placeholder="搜索 25+ 参数计算器（如 y+、雷诺数、压降、CFL、马赫数）…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        {tokens.length > 0 && (
          <div className="inline-search-meta">
            <span>找到 {matchingCalculators.length} 个匹配计算器</span>
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

      {tokens.length > 0 ? (
        matchingCalculators.length > 0 ? (
          <section className="calculator-list" aria-label="Matched calculators">
            {matchingCalculators.map((calculator) => (
              <CalculatorListCard calculator={calculator} key={calculator.id} />
            ))}
          </section>
        ) : (
          <div className="empty-result" role="status">
            <p>未找到与“{query.trim()}”匹配的计算器，请换个关键词（如 y+、压力、导热）试试。</p>
            <button
              type="button"
              className="ghost-button button-link-small"
              onClick={() => setQuery('')}
            >
              返回分类视图
            </button>
          </div>
        )
      ) : (
        <section className="category-grid" aria-label="Calculator categories">
          {calculatorCategories.map((category) => (
            <CalculatorCategoryCard
              category={category}
              count={getCalculatorsByCategory(category.id).length}
              key={category.id}
            />
          ))}
        </section>
      )}
    </div>
  )
}

export default CalculatorsPage
