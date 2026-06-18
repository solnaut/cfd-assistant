import { calculatorCatalog } from '../calculators/registry'

function CalculatorsPage() {
  return (
    <div className="page">
      <section className="page-title">
        <p className="eyebrow">CFD calculators</p>
        <h1>参数计算</h1>
        <p>
          本页先展示计算器目录和数据定义边界。所有公式、适用范围、验证数据和工程结论都需要在审核后再实现。
        </p>
      </section>

      <section className="calculator-grid" aria-label="Calculator list">
        {calculatorCatalog.map((calculator) => (
          <article className="calculator-card" key={calculator.id}>
            <div className="calculator-meta">
              <span className="tag">{calculator.status}</span>
              <span className="tag">{calculator.category}</span>
            </div>
            <h2>{calculator.name}</h2>
            <p>{calculator.summary}</p>
            <dl className="field-list">
              <div className="field-row">
                <dt className="field-label">输入</dt>
                <dd>{calculator.inputs.map((input) => input.label).join('、')}</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">输出</dt>
                <dd>{calculator.outputs.map((output) => output.label).join('、')}</dd>
              </div>
              <div className="field-row">
                <dt className="field-label">验证</dt>
                <dd>{calculator.validationStatus}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section className="notice">
        <h2>实现规则</h2>
        <p>
          计算逻辑将放在 <code>src/calculators</code>，单位换算放在
          <code> src/units</code>。页面组件只负责输入、校验反馈和结果展示。
        </p>
      </section>
    </div>
  )
}

export default CalculatorsPage
