import Breadcrumbs from '../components/Breadcrumbs'
import MathFormula from '../components/MathFormula'
import PageHeader from '../components/PageHeader'
import {
  calculatorCatalog,
  calculatorCategories,
} from '../calculators/registry'
import {
  formatVariableSymbol,
  formatVariableUnit,
} from '../utils/engineeringDisplay'
import { copyToClipboard } from '../utils/clipboard'

const formulasByCategory = calculatorCategories
  .map((category) => ({
    category,
    formulas: calculatorCatalog.filter(
      (calculator) =>
        calculator.categoryId === category.id &&
        calculator.availability === 'available' &&
        calculator.formula,
    ),
  }))
  .filter((group) => group.formulas.length > 0)

function FormulaLibraryPage() {
  function copyText(text: string) {
    void copyToClipboard(text)
  }

  return (
    <div className="page">
      <Breadcrumbs items={[{ label: '首页', to: '/' }, { label: 'CFD 公式库' }]} />
      <PageHeader
        eyebrow="Formula library"
        title="CFD 公式库"
        description="集中查看参数计算模块正在使用的公式、变量说明和 LaTeX 源码。"
      />

      <section className="formula-library" aria-label="CFD formulas">
        {formulasByCategory.map(({ category, formulas }) => (
          <article className="formula-category-section" key={category.id}>
            <div className="panel-heading">
              <p className="eyebrow">{category.eyebrow}</p>
              <h2>{category.name}</h2>
            </div>

            <div className="formula-card-grid">
              {formulas.map((calculator) => {
                const formula = calculator.formula

                if (!formula) {
                  return null
                }

                return (
                  <div className="formula-card" key={calculator.id}>
                    <div className="formula-card-heading">
                      <div>
                        <p className="eyebrow">{calculator.shortName}</p>
                        <h3>{formula.title}</h3>
                      </div>
                      <button
                        className="ghost-button button-link-small"
                        onClick={() => copyText(formula.latex)}
                        type="button"
                      >
                        复制 LaTeX
                      </button>
                    </div>
                    <p>{formula.description ?? calculator.summary}</p>
                    <MathFormula latex={formula.latex} />

                    {calculator.variables?.length ? (
                      <div className="formula-variable-list">
                        {calculator.variables.map((variable) => (
                          <div key={`${calculator.id}-${variable.symbol}`}>
                            <strong className="math-symbol">
                              {formatVariableSymbol(variable)}
                            </strong>
                            <span>{variable.name}</span>
                            <small>{formatVariableUnit(variable.unit)}</small>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {calculator.scope?.[0] ? (
                      <p className="formula-scope">{calculator.scope[0]}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default FormulaLibraryPage
