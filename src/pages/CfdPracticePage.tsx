import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { cfdSelectionSources, diagnosisPaths, fluentControlLink, getModelRecommendations, initialSelection, selectionQuestions,
  type PracticeAction, type SelectionAnswers } from '../knowledge/cfdPractice'

function ActionLinks({ action }: { action: PracticeAction }) {
  return (
    <div className="engineering-links">
      <Link to={fluentControlLink(action.controlId)}>{action.linkLabel} ↗</Link>
      {action.relatedTool && <Link to={action.relatedTool.to}>{action.relatedTool.label}</Link>}
    </div>
  )
}

function SelectionGuide() {
  const [answers, setAnswers] = useState(initialSelection)
  const recommendations = getModelRecommendations(answers)
  return (
    <div className="engineering-columns">
      <section className="engineering-panel" aria-labelledby="cfd-case-conditions">
        <h2 id="cfd-case-conditions">工况与分析目标</h2>
        <div className="engineering-fields">
          {selectionQuestions.map(({ id, label, choices }) => (
            <label key={id}>{label}
              <select value={answers[id]} onChange={(event) => {
                if (choices.some((choice) => choice.id === event.target.value)) {
                  setAnswers({ ...answers, [id]: event.target.value } as SelectionAnswers)
                }
              }}>
                {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>
      <section className="engineering-panel" aria-labelledby="cfd-settings">
        <h2 id="cfd-settings">候选设置与验证要点</h2>
        <p>用这些设置建立可比较的基线。具体模型、边界条件和离散参数仍需按工况与基准结果验证。</p>
        <ol className="engineering-steps">
          {recommendations.map((action) => <li key={action.linkLabel}>
            <h3>{action.title}</h3><p>{action.detail}</p><ActionLinks action={action} />
          </li>)}
        </ol>
        <div className="engineering-links">
          {cfdSelectionSources.map(({ label, to }) => <a key={to} href={to} target="_blank" rel="noreferrer">{label} ↗</a>)}
        </div>
      </section>
    </div>
  )
}

function DiagnosisChecklist({ path }: { path: typeof diagnosisPaths[number] }) {
  const storageKey = `cfd-assistant:diagnosis:v1:${path.id}`
  const [checked, setChecked] = useState<number[]>(() => {
    try {
      const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '[]')
      if (Array.isArray(stored)) return [...new Set(stored.filter((index) => Number.isInteger(index) && index >= 0 && index < path.steps.length))]
    } catch {
      // Checklist remains usable in browsers with storage disabled.
    }
    return []
  })

  function toggle(index: number, selected: boolean) {
    const next = selected ? [...checked, index] : checked.filter((item) => item !== index)
    setChecked(next)
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      // Keep the current checklist in memory when storage is unavailable.
    }
  }

  return (
    <div>
      <p role="status">已核查 {checked.length} / {path.steps.length} 项</p>
      <ol className="engineering-steps">
        {path.steps.map((action, index) => (
          <li key={action.title}>
            <label className="engineering-check">
              <input type="checkbox" checked={checked.includes(index)} onChange={({ target }) => toggle(index, target.checked)} />
              <strong>{action.title}</strong>
            </label>
            <p>{action.detail}</p>
            <ActionLinks action={action} />
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function CfdPracticePage() {
  const [params, setParams] = useSearchParams()
  const diagnosing = params.get('mode') === 'diagnosis'
  const path = diagnosisPaths.find(({ id }) => id === params.get('symptom')) ?? diagnosisPaths[0]
  return (
    <div className="page engineering-page">
      <PageHeader title="CFD 实战向导" description="根据工况形成 Fluent 设置候选，或从症状出发逐项排查。" />
      <nav className="engineering-tabs" aria-label="实战向导功能">
        <Link to="/cfd-practice" aria-current={diagnosing ? undefined : 'page'}>模型与求解器选型</Link>
        <Link to="/cfd-practice?mode=diagnosis" aria-current={diagnosing ? 'page' : undefined}>不收敛与报错排查</Link>
      </nav>
      {diagnosing ? (
        <section className="engineering-panel" aria-label="故障排查清单">
          <label className="engineering-field">当前症状
            <select value={path.id} onChange={(event) => setParams({ mode: 'diagnosis', symptom: event.target.value }, { replace: true })}>
              {diagnosisPaths.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
          <DiagnosisChecklist key={path.id} path={path} />
        </section>
      ) : <SelectionGuide />}
    </div>
  )
}
