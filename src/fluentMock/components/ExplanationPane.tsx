import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import {
  optionExplanations,
  relatedCalculatorsByControlId,
  troubleshootingCases,
} from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockExplanation } from '../fluentTypes'

export function ExplanationPane({
  activeControl,
  activeOptionValue,
  explanation,
  controlById,
  label,
  visible,
  onLocate,
  onLocateById,
}: {
  activeControl?: FluentMockControl
  activeOptionValue?: string | null
  explanation?: FluentMockExplanation
  controlById: Map<string, FluentMockControl>
  label: FluentLabel
  visible: boolean
  onLocate: (control: FluentMockControl, locate: true) => void
  onLocateById: (controlId: string) => void
}) {
  const [inspectorTab, setInspectorTab] = useState<'guide' | 'troubleshoot'>(
    'guide',
  )

  const optionNote =
    activeOptionValue && optionExplanations[activeOptionValue]
      ? optionExplanations[activeOptionValue]
      : null
  const calcLinks = activeControl
    ? relatedCalculatorsByControlId[activeControl.id] ?? []
    : []

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

          {optionNote && (
            <div className="fluent-option-highlight">
              <strong>当前选项要点：{activeOptionValue}</strong>
              <p>{optionNote}</p>
            </div>
          )}

          {[
            ['是什么', explanation.whatItIs],
            ['建议', explanation.recommendation],
            ['适用场景', explanation.whenToUse],
          ].map(([title, value]) => (
            <section key={title}>
              <h3>{title}</h3>
              <p>{value}</p>
            </section>
          ))}

          <section>
            <h3>检查要点</h3>
            <ul>
              {explanation.checkItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>常见误区</h3>
            <p>{explanation.commonMistakes}</p>
          </section>

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
        </div>
      )}

      {inspectorTab === 'troubleshoot' && (
        <div className="fluent-explanation-scroll">
          <h2>Fluent 常见报错与收敛排查</h2>
          <p className="fluent-explanation-location">
            点击下方定位按钮可直接跳到工作台对应参数位置
          </p>
          {troubleshootingCases.map((item) => (
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
