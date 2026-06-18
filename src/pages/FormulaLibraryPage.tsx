import { useState } from 'react'
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
  const [copiedId, setCopiedId] = useState<string | null>(null)

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
        description="按工程类别快速查看公式、符号含义，并复制原始 LaTeX。"
      />

      <nav className="formula-category-nav" aria-label="Formula categories">
        {formulasByCategory.map(({ category, formulas }) => (
          <a href={`#formula-category-${category.id}`} key={category.id}>
            <span>{category.name}</span>
            <strong>{formulas.length}</strong>
          </a>
        ))}
      </nav>

      <section className="formula-library" aria-label="CFD formulas">
        {formulasByCategory.map(({ category, formulas }) => (
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
    </div>
  )
}

export default FormulaLibraryPage
