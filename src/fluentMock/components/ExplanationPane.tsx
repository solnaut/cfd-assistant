import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FluentIcon } from '../FluentIcons'
import { FluentOperationDetails } from './FluentOperationDetails'
import { FluentTeachingDiagram } from './FluentTeachingDiagram'
import { getSolutionTeachingDiagram } from '../data/fluentTeachingDiagrams'
import { optionTeachingByControlId } from '../data/optionTeaching'
import type { FluentLabel } from '../fluentLanguage'
import type { FluentSimState } from '../state/fluentSimState'
import {
  controlOptionsById,
  relatedCalculatorsByControlId,
  troubleshootingCases,
} from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockExplanation, FluentVisibilityCondition } from '../fluentTypes'

export function ExplanationPane({
  activeControl,
  activeOptionValue,
  prerequisites,
  explanation,
  controlById,
  simState,
  label,
  visible,
  wideGuide,
  onToggleWideGuide,
  inspectorTab: controlledTab,
  onSelectInspectorTab,
  onLocate,
  onLocateById,
}: {
  activeControl?: FluentMockControl
  activeOptionValue?: string
  prerequisites: FluentVisibilityCondition[]
  explanation?: FluentMockExplanation
  controlById: Map<string, FluentMockControl>
  simState?: FluentSimState
  label: FluentLabel
  visible: boolean
  wideGuide?: boolean
  onToggleWideGuide?: () => void
  inspectorTab?: 'guide' | 'troubleshoot'
  onSelectInspectorTab?: (tab: 'guide' | 'troubleshoot') => void
  onLocate: (control: FluentMockControl, locate: true) => void
  onLocateById: (controlId: string) => void
}) {
  const [uncontrolledTab, setUncontrolledTab] = useState<'guide' | 'troubleshoot'>(
    'guide',
  )
  const [troubleshootQuery, setTroubleshootQuery] = useState('')
  const inspectorTab = controlledTab ?? uncontrolledTab

  function setInspectorTab(tab: 'guide' | 'troubleshoot') {
    if (onSelectInspectorTab) {
      onSelectInspectorTab(tab)
    } else {
      setUncontrolledTab(tab)
    }
  }

  const normalizedTrouble = troubleshootQuery.trim().toLowerCase()
  const filteredTroubleCases = normalizedTrouble
    ? troubleshootingCases.filter((item) =>
        [item.symptom, ...item.likelyCauses, ...item.fixes]
          .join(' ')
          .toLowerCase()
          .includes(normalizedTrouble),
      )
    : troubleshootingCases

  const optionTeaching = activeControl
    ? optionTeachingByControlId[activeControl.id] ?? optionTeachingByControlId[activeControl.valueId ?? '']
    : undefined
  const optionNote = activeOptionValue && optionTeaching?.notes[activeOptionValue]
  const optionLabel = activeControl && controlOptionsById[activeControl.id]?.find(({ value }) => value === activeOptionValue)?.label
    || activeOptionValue
  const missingSettings = prerequisites.flatMap(({ controlId, values }) => {
    const control = controlById.get(controlId)
    return control?.enabled ? [{ control, values }] : []
  })
  const calcLinks = activeControl
    ? relatedCalculatorsByControlId[activeControl.id] ?? []
    : []
  const diagramSpec = getSolutionTeachingDiagram(
    explanation?.id,
    activeControl?.parentId,
    activeControl?.id,
    simState,
  )

  return (
    <aside
      className="fluent-explanation-pane"
      id="fluent-guide-panel"
      aria-label="控件说明"
      lang="zh-CN"
      hidden={!visible}
    >
      <div className="fluent-pane-title">
        <span>
          <FluentIcon name="guide" /> 教学说明
        </span>
        <div className="fluent-inspector-tabs">
          <button
            type="button"
            className={inspectorTab === 'guide' ? 'active' : ''}
            onClick={() => setInspectorTab('guide')}
          >
            {label('Control Guide')}
          </button>
          <button
            type="button"
            className={inspectorTab === 'troubleshoot' ? 'active' : ''}
            onClick={() => setInspectorTab('troubleshoot')}
          >
            {label('Troubleshooting')}
          </button>
          {onToggleWideGuide && (
            <button
              type="button"
              className={wideGuide ? 'fluent-guide-width-btn active' : 'fluent-guide-width-btn'}
              aria-label="切换教学说明面板宽度"
              aria-pressed={Boolean(wideGuide)}
              onClick={onToggleWideGuide}
            >
              {wideGuide ? '标准宽' : '宽屏'}
            </button>
          )}
        </div>
      </div>

      {inspectorTab === 'guide' && explanation && (
        <div
          className="fluent-explanation-scroll"
          key={explanation.id}
          aria-live="polite"
        >
          <p className="fluent-explanation-location">{explanation.location}</p>
          <h2>{explanation.title}</h2>

          {diagramSpec && <FluentTeachingDiagram spec={diagramSpec} />}

          {missingSettings.length > 0 && (
            <section className="fluent-option-highlight">
              <h3>此设置的开启条件</h3>
              <ul>
                {missingSettings.map(({ control, values }) => {
                  const name = label(control.label === 'Model' ? control.group + ' Model' : control.label)
                  const instruction = values[0] === true ? `启用 ${name}`
                    : values[0] === false ? `关闭 ${name}`
                      : `将 ${name} 设为 ${values.map((value) => label(String(value))).join(' 或 ')}`
                  return (
                    <li key={control.id}>
                      {instruction}
                      <div className="fluent-related-list">
                        <button type="button" onClick={() => onLocateById(control.id)}>
                          定位 {name} <FluentIcon name="chevron" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}

          {optionNote && prerequisites.length === 0 && (
            <div className="fluent-option-highlight">
              <strong>当前选项要点：{label(optionLabel ?? '')}</strong>
              <p>{optionNote}</p>
              {optionTeaching?.sourceUrl && optionTeaching.sourceUrl !== explanation.sourceUrl && (
                <p><a href={optionTeaching.sourceUrl} target="_blank" rel="noreferrer">当前选项的 Fluent 2024 R2 文档</a></p>
              )}
            </div>
          )}

          {[
            ['是什么', explanation.whatItIs],
            ['什么时候用', explanation.whenToUse],
            ...(!explanation.operation ? [['建议', explanation.recommendation]] : []),
          ].map(([title, value]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{value}</p>
            </section>
          ))}

          {explanation.operation && <FluentOperationDetails guide={explanation.operation} />}

          <section>
            <h3>检查要点</h3>
            <ul>
              {explanation.checkItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="fluent-mistake-card">
            <h3>常见误区</h3>
            <p>{explanation.commonMistakes}</p>
          </section>

          {explanation.operation && (
            <details className="fluent-guide-extra">
              <summary>补充建议</summary>
              <p>{explanation.recommendation}</p>
            </details>
          )}

          {explanation.relatedControls.some((id) => controlById.get(id)?.enabled) && (
            <section>
              <h3>相关功能</h3>
              <div className="fluent-related-list">
                {explanation.relatedControls.map((id) => {
                  const control = controlById.get(id)
                  return (
                    control?.enabled && (
                      <button
                        type="button"
                        key={id}
                        disabled={id === activeControl?.id}
                        onClick={() => onLocate(control, true)}
                      >
                        {label(control.label)} <FluentIcon name="chevron" />
                      </button>
                    )
                  )
                })}
              </div>
            </section>
          )}

          {calcLinks.length > 0 && (
            <section>
              <h3>关联 CFD 计算器</h3>
              <div className="fluent-calc-links">
                {calcLinks.map((calc) => (
                  <Link className="fluent-calc-link" key={calc.to} to={calc.to}>
                    <strong>{calc.label} →</strong>
                    <small>{calc.note}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <footer className="fluent-source-footer">
            {explanation.sourceStatus === 'source-checked' && explanation.sourceUrl ? (
              <p>
                参考依据：<a href={explanation.sourceUrl} target="_blank" rel="noreferrer">Ansys Fluent 2024 R2 文档</a>
              </p>
            ) : (
              <p>说明来源：CFD 教学原理与工程实践整理（具体算例参数请结合工况与官方文档核对）</p>
            )}
          </footer>
        </div>
      )}

      {inspectorTab === 'troubleshoot' && (
        <div className="fluent-explanation-scroll">
          <h2>Fluent 常见报错与收敛排查</h2>
          <p><Link to="/cfd-practice?mode=diagnosis">按症状打开逐步排查向导</Link></p>
          <p className="fluent-explanation-location">
            点击下方定位按钮可直接跳到工作台对应参数位置
          </p>
          <input
            type="search"
            className="fluent-troubleshoot-filter"
            aria-label="筛选报错现象"
            placeholder="输入关键词筛选报错（如 发散、回流、残差）…"
            value={troubleshootQuery}
            onChange={(event) => setTroubleshootQuery(event.target.value)}
          />
          {filteredTroubleCases.map((item) => (
            <article className="fluent-troubleshoot-card" key={item.id}>
              <h3>{item.symptom}</h3>
              <p>常见原因</p>
              <ul>
                {item.likelyCauses.map((cause) => (
                  <li key={cause}>{cause}</li>
                ))}
              </ul>
              <p>排查步骤</p>
              <ul>
                {item.fixes.map((fix) => (
                  <li key={fix}>{fix}</li>
                ))}
              </ul>
              <div className="fluent-related-list" style={{ marginTop: 6 }}>
                {item.targetControls.map((target) => (
                  <button
                    key={target.controlId}
                    type="button"
                    onClick={() => onLocateById(target.controlId)}
                  >
                    定位 {target.label} <FluentIcon name="chevron" />
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </aside>
  )
}
