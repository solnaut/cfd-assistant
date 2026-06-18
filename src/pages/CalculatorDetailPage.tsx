import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  calculate,
  type CalculationResult,
  formatCalculationValue,
} from '../calculators/implementations'
import { getCalculator, getCalculatorCategory } from '../calculators/registry'
import Breadcrumbs from '../components/Breadcrumbs'
import MathFormula from '../components/MathFormula'
import PageHeader from '../components/PageHeader'
import type { CalculatorCategory, CalculatorDefinition } from '../models/calculator'
import { getUnits } from '../units/conversions'

interface FieldState {
  value: string
  unitId?: string
}

type FormState = Record<string, FieldState>

function CalculatorDetailPage() {
  const { categoryId, calculatorId } = useParams()
  const calculator = calculatorId ? getCalculator(calculatorId) : null
  const category = categoryId ? getCalculatorCategory(categoryId) : null

  if (!calculator || !category || calculator.categoryId !== category.id) {
    return <Navigate replace to="/calculators" />
  }

  return (
    <CalculatorDetailContent
      key={calculator.id}
      calculator={calculator}
      category={category}
    />
  )
}

interface CalculatorDetailContentProps {
  calculator: CalculatorDefinition
  category: CalculatorCategory
}

function CalculatorDetailContent({
  calculator,
  category,
}: CalculatorDetailContentProps) {
  const initialState = useMemo(
    () => createInitialState(calculator),
    [calculator],
  )
  const [formState, setFormState] = useState<FormState>(initialState)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAvailable = calculator.availability === 'available'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!calculator || !isAvailable) {
      return
    }

    try {
      setResult(calculate(calculator, toCalculatorInputs(formState)))
      setError(null)
    } catch (caughtError) {
      setResult(null)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : '计算失败，请检查输入。',
      )
    }
  }

  function handleReset() {
    setFormState(createInitialState(calculator))
    setResult(null)
    setError(null)
  }

  function copyText(text: string) {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(text)
    }
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
        <form
          className="calculator-panel"
          aria-label="Calculator input panel"
          onSubmit={handleSubmit}
        >
          <div className="panel-heading">
            <p className="eyebrow">Input</p>
            <h2>输入参数</h2>
          </div>

          {calculator.inputs.length > 0 ? (
            <div className="input-stack">
              {calculator.inputs.map((input) => {
                const field = formState[input.id] ?? { value: '' }

                return (
                  <label className="form-field" key={input.id}>
                    <span>{input.label}</span>
                    <div className="input-with-unit">
                      <input
                        disabled={!isAvailable}
                        inputMode="decimal"
                        min={input.min}
                        onChange={(event) => {
                          setFormState((current) => ({
                            ...current,
                            [input.id]: {
                              ...field,
                              value: event.target.value,
                            },
                          }))
                        }}
                        placeholder="输入数值"
                        step={input.integer ? 1 : 'any'}
                        type="number"
                        value={field.value}
                      />
                      {input.unitCategory ? (
                        <select
                          aria-label={`${input.label}单位`}
                          disabled={!isAvailable}
                          onChange={(event) => {
                            setFormState((current) => ({
                              ...current,
                              [input.id]: {
                                ...field,
                                unitId: event.target.value,
                              },
                            }))
                          }}
                          value={field.unitId ?? input.defaultUnit ?? '1'}
                        >
                          {getUnits(input.unitCategory).map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.symbol}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>
                    {input.helperText ? (
                      <small className="field-help">{input.helperText}</small>
                    ) : null}
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="empty-result compact">
              <strong>该计算器正在完善中</strong>
              <p>输入项与结果展示结构会随公式确认后开放。</p>
            </div>
          )}

          <div className="action-row">
            <button disabled={!isAvailable} className="button-link" type="submit">
              开始计算
            </button>
            <button
              disabled={!isAvailable}
              className="ghost-button"
              onClick={handleReset}
              type="button"
            >
              重置
            </button>
          </div>
        </form>

        <aside className="result-panel" aria-label="Calculator result panel">
          <div className="panel-heading">
            <p className="eyebrow">Result</p>
            <h2>结果展示</h2>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          {result ? (
            <ResultView
              calculator={calculator}
              copyText={copyText}
              result={result}
            />
          ) : (
            <div className="empty-result">
              <strong>
                {isAvailable ? '输入参数后即可计算' : '该计算器暂未开放自动计算'}
              </strong>
              <p>
                {isAvailable
                  ? '结果区会展示主要输出、中间量和可复制的计算摘要。'
                  : '当前保留页面结构和研究记录，待公式分支确认后再开放结果。'}
              </p>
            </div>
          )}

          {!result ? (
            <ul className="result-preview-list">
              {calculator.resultPreview.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </section>

      <section className="formula-panel">
        <div>
          <p className="eyebrow">Reference</p>
          <h2>公式与说明</h2>
          {calculator.updatedAt ? (
            <span className="update-tag">更新于 {calculator.updatedAt}</span>
          ) : null}
        </div>

        <div className="formula-content">
          {calculator.formula ? (
            <>
              <h3>{calculator.formula.title}</h3>
              <MathFormula latex={calculator.formula.latex} />
              <div className="copy-row">
                <button
                  className="ghost-button button-link-small"
                  onClick={() => copyText(calculator.formula?.latex ?? '')}
                  type="button"
                >
                  复制 LaTeX
                </button>
              </div>
            </>
          ) : (
            <p>完整公式会在来源和验证案例确认后展示。</p>
          )}

          {calculator.variables?.length ? (
            <div className="reference-section">
              <h3>变量说明</h3>
              <div className="variable-grid">
                {calculator.variables.map((variable) => (
                  <div className="variable-card" key={variable.symbol}>
                    <strong>{variable.symbol}</strong>
                    <span>{variable.name}</span>
                    <small>{variable.unit}</small>
                    <p>{variable.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {calculator.scope?.length ? (
            <ReferenceList title="适用范围" items={calculator.scope} />
          ) : null}
          {calculator.notes?.length ? (
            <ReferenceList title="注意事项" items={calculator.notes} />
          ) : null}

          {calculator.sources?.length ? (
            <div className="reference-section">
              <h3>来源</h3>
              <ul className="source-list">
                {calculator.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} rel="noreferrer" target="_blank">
                      {source.label}: {source.title}
                    </a>
                    <span>
                      {source.organization} · 访问日期 {source.accessedAt}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

interface ResultViewProps {
  calculator: CalculatorDefinition
  result: CalculationResult
  copyText: (text: string) => void
}

function ResultView({ calculator, copyText, result }: ResultViewProps) {
  const resultText = createResultText(calculator, result)

  return (
    <div className="calculation-result">
      <div className="result-card-grid">
        {result.outputs.map((output) => (
          <div className="result-card primary" key={output.id}>
            <span>{output.label}</span>
            <strong>{formatCalculationValue(output)}</strong>
          </div>
        ))}
      </div>

      {result.intermediates.length ? (
        <div className="reference-section">
          <h3>中间结果</h3>
          <div className="result-card-grid">
            {result.intermediates.map((intermediate) => (
              <div className="result-card" key={intermediate.id}>
                <span>{intermediate.label}</span>
                <strong>{formatCalculationValue(intermediate)}</strong>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {result.summary.length ? (
        <ReferenceList title="计算说明" items={result.summary} />
      ) : null}

      <div className="copy-row">
        <button
          className="ghost-button button-link-small"
          onClick={() => copyText(resultText)}
          type="button"
        >
          复制结果
        </button>
        <button
          className="ghost-button button-link-small"
          onClick={() => {
            copyText(`${resultText}\n\n公式：${calculator.formula?.plainText ?? ''}`)
          }}
          type="button"
        >
          复制完整摘要
        </button>
      </div>
    </div>
  )
}

function ReferenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="reference-section">
      <h3>{title}</h3>
      <ul className="clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function createInitialState(calculator: CalculatorDefinition): FormState {
  return Object.fromEntries(
    calculator.inputs.map((input) => [
      input.id,
      {
        value: input.defaultValue?.toString() ?? '',
        unitId: input.defaultUnit,
      },
    ]),
  )
}

function toCalculatorInputs(formState: FormState) {
  return Object.fromEntries(
    Object.entries(formState).map(([inputId, field]) => [
      inputId,
      {
        value: Number(field.value),
        unitId: field.unitId,
      },
    ]),
  )
}

function createResultText(
  calculator: CalculatorDefinition,
  result: CalculationResult,
) {
  const outputs = result.outputs
    .map((item) => `${item.label}: ${formatCalculationValue(item)}`)
    .join('\n')
  const intermediates = result.intermediates
    .map((item) => `${item.label}: ${formatCalculationValue(item)}`)
    .join('\n')

  return [
    calculator.name,
    outputs,
    intermediates ? `中间结果:\n${intermediates}` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

export default CalculatorDetailPage
