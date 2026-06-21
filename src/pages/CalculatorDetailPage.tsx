import { useMemo, useState } from 'react'
import type { Dispatch, FormEvent, SetStateAction } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  calculate,
  type CalculationResult,
  formatCalculationValue,
  getActiveInputDefinitions,
  getActiveMode,
  getDefaultModeId,
} from '../calculators/implementations'
import {
  getCalculatorCommonFormulaEntries,
  getCalculatorFormulaEntries,
  getCalculatorLatexSummary,
  getCalculatorModeFormulaEntries,
} from '../calculators/formulas'
import { getCalculator, getCalculatorCategory } from '../calculators/registry'
import Breadcrumbs from '../components/Breadcrumbs'
import MathFormula from '../components/MathFormula'
import PageHeader from '../components/PageHeader'
import type {
  CalculatorCategory,
  CalculatorDefinition,
  CalculatorFormulaDefinition,
  CalculatorInputDefinition,
} from '../models/calculator'
import { getUnits } from '../units/conversions'
import {
  formatVariableSymbol,
  formatVariableUnit,
} from '../utils/engineeringDisplay'
import { copyToClipboard } from '../utils/clipboard'

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
  const initialModeId = useMemo(() => getDefaultModeId(calculator), [calculator])
  const [formState, setFormState] = useState<FormState>(initialState)
  const [selectedModeId, setSelectedModeId] = useState<string | undefined>(
    initialModeId,
  )
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const isAvailable = calculator.availability === 'available'
  const activeMode = getActiveMode(calculator, selectedModeId)
  const activeInputs = getActiveInputDefinitions(calculator, activeMode)
  const formulaEntries = getCalculatorFormulaEntries(calculator)
  const commonFormulaEntries = getCalculatorCommonFormulaEntries(calculator)
  const modeFormulaEntries = getCalculatorModeFormulaEntries(
    calculator,
    activeMode?.id,
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!calculator || !isAvailable) {
      return
    }

    try {
      setResult(
        calculate(
          calculator,
          toCalculatorInputs(formState, activeInputs),
          { modeId: activeMode?.id },
        ),
      )
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
    setSelectedModeId(initialModeId)
    setResult(null)
    setError(null)
  }

  function handleModeChange(modeId: string) {
    setSelectedModeId(modeId)
    setResult(null)
    setError(null)
  }

  async function copyText(text: string, key?: string) {
    const copied = await copyToClipboard(text)

    if (copied && key) {
      setCopiedKey(key)
      window.setTimeout(() => {
        setCopiedKey((current) => (current === key ? null : current))
      }, 1800)
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

          {calculator.modes?.length ? (
            <div className="mode-selector" aria-label="计算模式">
              {calculator.modes.map((mode) => (
                <button
                  className={activeMode?.id === mode.id ? 'mode-card active' : 'mode-card'}
                  key={mode.id}
                  onClick={() => handleModeChange(mode.id)}
                  type="button"
                >
                  <strong>{mode.label}</strong>
                  <span>{mode.description}</span>
                </button>
              ))}
            </div>
          ) : null}

          {activeInputs.length > 0 ? (
            <div className="input-stack">
              {activeInputs.map((input) => {
                const field = formState[input.id] ?? { value: '' }

                return (
                  <label className="form-field" key={input.id}>
                    <span>{input.label}</span>
                    <InputControl
                      field={field}
                      input={input}
                      isAvailable={isAvailable}
                      setFormState={setFormState}
                    />
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
              modeId={activeMode?.id}
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
                  : '该工具会在完整计算逻辑就绪后开放结果展示。'}
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
          {calculator.modes?.length ? (
            <>
              <FormulaEntryList
                copiedKey={copiedKey}
                copyText={copyText}
                entries={commonFormulaEntries}
                keyPrefix={`${calculator.id}-common`}
                title="公共公式"
              />
              <FormulaEntryList
                copiedKey={copiedKey}
                copyText={copyText}
                entries={modeFormulaEntries}
                keyPrefix={`${calculator.id}-${activeMode?.id ?? 'mode'}`}
                title="当前模式公式"
              />
            </>
          ) : formulaEntries.length ? (
            <>
              <FormulaEntryList
                copiedKey={copiedKey}
                copyText={copyText}
                entries={formulaEntries}
                keyPrefix={`calculator-${calculator.id}`}
              />
            </>
          ) : (
            <p>该工具正式开放计算时会同步显示公式与变量说明。</p>
          )}

          {calculator.variables?.length ? (
            <div className="reference-section">
              <h3>变量说明</h3>
              <VariableDefinitionTable variables={calculator.variables} />
            </div>
          ) : null}

          {calculator.scope?.length ? (
            <ReferenceList title="适用范围" items={calculator.scope} />
          ) : null}
          {calculator.notes?.length ? (
            <ReferenceList title="注意事项" items={calculator.notes} />
          ) : null}
        </div>
      </section>
    </div>
  )
}

interface InputControlProps {
  field: FieldState
  input: CalculatorInputDefinition
  isAvailable: boolean
  setFormState: Dispatch<SetStateAction<FormState>>
}

function InputControl({
  field,
  input,
  isAvailable,
  setFormState,
}: InputControlProps) {
  if (input.kind === 'select') {
    return (
      <select
        disabled={!isAvailable}
        onChange={(event) => {
          setFormState((current) => ({
            ...current,
            [input.id]: {
              ...field,
              value: event.target.value,
            },
          }))
        }}
        value={field.value}
      >
        {input.options?.map((option) => (
          <option disabled={option.disabled} key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    )
  }

  return (
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
              {unit.displaySymbol ?? unit.symbol}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  )
}

interface FormulaEntryListProps {
  copiedKey: string | null
  copyText: (text: string, key?: string) => Promise<void>
  entries: CalculatorFormulaDefinition[]
  keyPrefix: string
  title?: string
}

function FormulaEntryList({
  copiedKey,
  copyText,
  entries,
  keyPrefix,
  title,
}: FormulaEntryListProps) {
  if (!entries.length) {
    return null
  }

  return (
    <div className="formula-entry-group">
      {title ? <h3>{title}</h3> : null}
      <div className="calculator-formula-list">
        {entries.map((formula) => {
          const formulaKey = `${keyPrefix}-${formula.id ?? formula.title}`

          return (
            <article className="calculator-formula-item" key={formulaKey}>
              <div className="formula-card-heading compact">
                <h4>{formula.title}</h4>
                <button
                  className="ghost-button button-link-small"
                  onClick={() => void copyText(formula.latex, formulaKey)}
                  type="button"
                >
                  {copiedKey === formulaKey ? '已复制' : '复制 LaTeX'}
                </button>
              </div>
              <MathFormula latex={formula.latex} />
            </article>
          )
        })}
      </div>
    </div>
  )
}

interface ResultViewProps {
  calculator: CalculatorDefinition
  copyText: (text: string) => void
  modeId?: string
  result: CalculationResult
}

function ResultView({ calculator, copyText, modeId, result }: ResultViewProps) {
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
          onClick={() => void copyText(resultText)}
          type="button"
        >
          复制结果
        </button>
        <button
          className="ghost-button button-link-small"
          onClick={() => {
            void copyText(`${resultText}\n\n公式：${getCalculatorLatexSummary(calculator, modeId)}`)
          }}
          type="button"
        >
          复制完整摘要
        </button>
      </div>
    </div>
  )
}

function VariableDefinitionTable({
  variables,
}: {
  variables: NonNullable<CalculatorDefinition['variables']>
}) {
  return (
    <div className="variable-table-wrap">
      <table className="variable-definition-table">
        <thead>
          <tr>
            <th>符号</th>
            <th>名称</th>
            <th>单位</th>
            <th>含义</th>
          </tr>
        </thead>
        <tbody>
          {variables.map((variable) => (
            <tr key={variable.symbol}>
              <td>
                <strong className="math-symbol">
                  {formatVariableSymbol(variable)}
                </strong>
              </td>
              <td>{variable.name}</td>
              <td>{formatVariableUnit(variable.unit)}</td>
              <td>{variable.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function toCalculatorInputs(
  formState: FormState,
  inputs: CalculatorInputDefinition[],
) {
  return Object.fromEntries(
    inputs.map((input) => {
      const field = formState[input.id] ?? { value: '' }

      return [
        input.id,
        {
          value: input.kind === 'select' ? field.value : Number(field.value),
          unitId: field.unitId,
        },
      ]
    }),
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
