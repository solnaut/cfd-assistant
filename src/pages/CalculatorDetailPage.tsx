import { Link, Navigate, useParams } from 'react-router-dom'
import { getCalculator, getCalculatorCategory } from '../calculators/registry'
import Breadcrumbs from '../components/Breadcrumbs'
import PageHeader from '../components/PageHeader'

function CalculatorDetailPage() {
  const { categoryId, calculatorId } = useParams()
  const calculator = calculatorId ? getCalculator(calculatorId) : null
  const category = categoryId ? getCalculatorCategory(categoryId) : null

  if (!calculator || !category || calculator.categoryId !== category.id) {
    return <Navigate replace to="/calculators" />
  }

  return (
    <div className="page">
      <Breadcrumbs
        items={[
          { label: '首页', to: '/' },
          { label: '参数计算', to: '/calculators' },
          { label: category.name, to: `/calculators/${category.id}` },
          { label: calculator.name },
        ]}
      />
      <PageHeader
        eyebrow={category.name}
        title={calculator.name}
        description={calculator.summary}
        actions={
          <Link className="ghost-button" to={`/calculators/${category.id}`}>
            返回列表
          </Link>
        }
      />

      <section className="calculator-detail-layout">
        <form className="calculator-panel" aria-label="Calculator input panel">
          <div className="panel-heading">
            <p className="eyebrow">Input</p>
            <h2>输入参数</h2>
          </div>
          <div className="input-stack">
            {calculator.inputs.map((input) => (
              <label className="form-field" key={input.id}>
                <span>
                  {input.label}
                  {input.defaultUnit ? ` (${input.defaultUnit})` : ''}
                </span>
                <input disabled placeholder="稍后启用" type="text" />
              </label>
            ))}
          </div>
          <div className="action-row">
            <button disabled className="button-link" type="button">
              开始计算
            </button>
            <button disabled className="ghost-button" type="reset">
              重置
            </button>
          </div>
        </form>

        <aside className="result-panel" aria-label="Calculator result panel">
          <div className="panel-heading">
            <p className="eyebrow">Result</p>
            <h2>结果展示</h2>
          </div>
          <div className="empty-result">
            <strong>该计算器正在完善中</strong>
            <p>输入项与结果展示结构已预留，后续会补充完整计算逻辑与工程说明。</p>
          </div>
          <ul className="result-preview-list">
            {calculator.resultPreview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="formula-panel">
        <div>
          <p className="eyebrow">Reference</p>
          <h2>公式与说明</h2>
        </div>
        <p>公式、参数含义、适用范围和示例数据会在内容确认后补充到这里。</p>
      </section>
    </div>
  )
}

export default CalculatorDetailPage
