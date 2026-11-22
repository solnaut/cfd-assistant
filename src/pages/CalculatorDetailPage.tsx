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
  formatBoundaryLayerPlanCsv,
  formatBoundaryLayerPlanSummary,
  formatBoundaryLayerPlanTable,
  type BoundaryLayerPlan,
  type BoundaryLayerPlanRow,
} from '../calculators/boundaryLayerPlan'
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
import { convertValue, getUnits } from '../units/conversions'
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

const yPlusGridInputIds = new Set([
  'grid-growth-rate',
  'grid-recommendation-method',
  'target-total-thickness',
  'grid-layer-count',
])

const yPlusPrimaryInputIds = new Set([
  'target-y-plus',
  'flow-scenario',
  'flat-plate-friction-method',
  'pipe-friction-method',
  'wall-shear-stress',
  'density',
  'dynamic-viscosity',
  'reference-velocity',
  'characteristic-length',
  'hydraulic-diameter',
  'friction-coefficient',
  'darcy-friction-factor',
  'fanning-friction-coefficient',
])

function getVisibleInputDefinitions(
  calculator: CalculatorDefinition,
  inputs: CalculatorInputDefinition[],
  formState: FormState,
  modeId?: string,
) {
  if (calculator.id !== 'y-plus-first-layer-height') {
    return inputs
  }

  return inputs.filter((input) => isVisibleYPlusInput(input.id, formState, modeId))
}

function isVisibleYPlusInput(
  inputId: string,
  formState: FormState,
  modeId?: string,
) {
  const flowScenario = fieldValue(formState, 'flow-scenario', 'flat-plate-external')
  const flatPlateMethod = fieldValue(
    formState,
    'flat-plate-friction-method',
    'flat-plate-turbulent',
  )
  const pipeMethod = fieldValue(
    formState,
    'pipe-friction-method',
    'pipe-blasius-darcy',
  )
  const gridMethod = fieldValue(
    formState,
    'grid-recommendation-method',
    'auto-total-thickness',
  )

  if (modeId === 'known-wall-shear-stress') {
    return [
      'target-y-plus',
      'wall-shear-stress',
      'density',
      'dynamic-viscosity',
      'grid-growth-rate',
      'grid-recommendation-method',
      gridMethod === 'target-total-thickness' ? 'target-total-thickness' : '',
      gridMethod === 'fixed-layer-count' ? 'grid-layer-count' : '',
    ].includes(inputId)
  }

  if (modeId === 'known-friction-coefficient') {
    return [
      'target-y-plus',
      'friction-coefficient',
      'density',
      'dynamic-viscosity',
      'reference-velocity',
      'grid-growth-rate',
      'grid-recommendation-method',
      gridMethod === 'target-total-thickness' ? 'target-total-thickness' : '',
      gridMethod === 'fixed-layer-count' ? 'grid-layer-count' : '',
    ].includes(inputId)
  }

  if (flowScenario === 'internal-pipe') {
    return [
      'target-y-plus',
      'flow-scenario',
      'pipe-friction-method',
      'density',
      'dynamic-viscosity',
      'reference-velocity',
      'hydraulic-diameter',
      pipeMethod === 'pipe-custom-darcy' ? 'darcy-friction-factor' : '',
      pipeMethod === 'pipe-custom-fanning' ? 'fanning-friction-coefficient' : '',
      'grid-growth-rate',
      'grid-recommendation-method',
      gridMethod === 'target-total-thickness' ? 'target-total-thickness' : '',
      gridMethod === 'fixed-layer-count' ? 'grid-layer-count' : '',
    ].includes(inputId)
  }

  return [
    'target-y-plus',
    'flow-scenario',
    'flat-plate-friction-method',
    'density',
    'dynamic-viscosity',
    'reference-velocity',
    'characteristic-length',
    flatPlateMethod === 'flat-plate-custom' ? 'friction-coefficient' : '',
    'grid-growth-rate',
    'grid-recommendation-method',
    gridMethod === 'target-total-thickness' ? 'target-total-thickness' : '',
    gridMethod === 'fixed-layer-count' ? 'grid-layer-count' : '',
  ].includes(inputId)
}

function fieldValue(formState: FormState, inputId: string, fallback: string) {
  return formState[inputId]?.value ?? fallback
}

function getInputGroups(
  calculator: CalculatorDefinition,
  inputs: CalculatorInputDefinition[],
) {
  if (calculator.id !== 'y-plus-first-layer-height') {
    return [{ title: '', inputs }]
  }

  return [
    {
      title: 'y+ 输入',
      inputs: inputs.filter((input) => yPlusPrimaryInputIds.has(input.id)),
    },
    {
      title: '边界层网格推荐设置',
      inputs: inputs.filter((input) => yPlusGridInputIds.has(input.id)),
    },
  ].filter((group) => group.inputs.length)
}

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
  const visibleInputs = getVisibleInputDefinitions(
    calculator,
    activeInputs,
    formState,
    activeMode?.id,
  )
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
          toCalculatorInputs(formState, visibleInputs),
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
          onChange={() => {
            setResult(null)
            setError(null)
          }}
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

          {visibleInputs.length > 0 ? (
            <div className="input-stack">
              {getInputGroups(calculator, visibleInputs).map((group) => (
                <div className="input-group" key={group.title}>
                  {group.title ? <h3>{group.title}</h3> : null}
                  {group.inputs.map((input) => {
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
              ))}
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

  const defaultUnit = input.defaultUnit ?? '1'
  const unitId = field.unitId ?? defaultUnit
  const minimum = input.min !== undefined && input.unitCategory
    ? convertValue(input.min, defaultUnit, unitId, input.unitCategory)
    : input.min
  return (
    <div className="input-with-unit">
      <input
        disabled={!isAvailable}
        inputMode="decimal"
        min={minimum}
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
          value={unitId}
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
  copyText: (text: string, key?: string) => Promise<void>
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

      {result.boundaryLayerPlan ? (
        <BoundaryLayerPlanView
          copyText={copyText}
          plan={result.boundaryLayerPlan}
        />
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

function BoundaryLayerPlanView({
  copyText,
  plan,
}: {
  copyText: (text: string, key?: string) => Promise<void>
  plan: BoundaryLayerPlan
}) {
  return (
    <section className="boundary-plan-panel" aria-label="Boundary layer mesh plan">
      <div className="formula-card-heading compact">
        <div>
          <p className="eyebrow">Inflation Layers</p>
          <h3>边界层网格推荐方案</h3>
        </div>
      </div>

      <div className="result-card-grid">
        <PlanMetric label="推荐方式" text={plan.methodLabel} />
        <PlanMetric label="层数 n" text={plan.layerCount.toString()} />
        <PlanMetric label="实际总厚度 Hn" value={plan.actualTotalThickness} />
        <PlanMetric label="最后一层高度 hn" value={plan.lastLayerHeight} />
        {plan.targetTotalThickness !== undefined ? (
          <PlanMetric label="目标总厚度 H" value={plan.targetTotalThickness} />
        ) : null}
        {plan.targetDifference !== undefined ? (
          <PlanMetric label="差值 Hn-H" value={plan.targetDifference} />
        ) : null}
        {plan.thicknessRatio !== undefined ? (
          <PlanMetric label="Hn/D" text={formatDimensionless(plan.thicknessRatio)} />
        ) : null}
      </div>

      {plan.notes.length ? (
        <ReferenceList title="方案说明" items={plan.notes} />
      ) : null}

      <div className="boundary-plan-table-wrap">
        <table className="boundary-plan-table">
          <thead>
            <tr>
              <th>层数</th>
              <th>单层高度</th>
              <th>累计厚度</th>
            </tr>
          </thead>
          <tbody>
            {plan.rows.map((row) => (
              <BoundaryLayerPlanRowView key={row.layer} row={row} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="copy-row">
        <button
          className="ghost-button button-link-small"
          onClick={() => void copyText(formatBoundaryLayerPlanTable(plan))}
          type="button"
        >
          复制表格
        </button>
        <button
          className="ghost-button button-link-small"
          onClick={() => void copyText(formatBoundaryLayerPlanCsv(plan))}
          type="button"
        >
          复制 CSV
        </button>
        <button
          className="ghost-button button-link-small"
          onClick={() => void copyText(formatBoundaryLayerPlanSummary(plan))}
          type="button"
        >
          复制简要方案
        </button>
      </div>
    </section>
  )
}

function PlanMetric({
  label,
  text,
  value,
}: {
  label: string
  text?: string
  value?: number
}) {
  return (
    <div className="result-card">
      <span>{label}</span>
      <strong>
        {text ?? formatLength(value ?? 0)}
      </strong>
    </div>
  )
}

function BoundaryLayerPlanRowView({ row }: { row: BoundaryLayerPlanRow }) {
  return (
    <tr>
      <td>{row.layer}</td>
      <td>{formatLength(row.height)}</td>
      <td>{formatLength(row.cumulativeThickness)}</td>
    </tr>
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

function formatLength(value: number) {
  return formatCalculationValue({
    id: 'length',
    label: '长度',
    value,
    unitCategory: 'length',
    unitId: 'mm',
  })
}

function formatDimensionless(value: number) {
  return formatCalculationValue({
    id: 'dimensionless',
    label: '无量纲',
    value,
    unitCategory: 'dimensionless',
    unitId: '1',
  })
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
          value: field.value,
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
