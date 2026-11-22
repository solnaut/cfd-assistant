import type { FluentOperationGuide } from '../fluentTypes'

export function FluentOperationDetails({ guide }: { guide: FluentOperationGuide }) {
  return (
    <>
      {guide.coreConcept && (
        <section className="fluent-core-concept">
          <h3>核心原理</h3>
          <p>{guide.coreConcept}</p>
        </section>
      )}
      {guide.choices && guide.choices.length > 0 && (
        <section className="fluent-option-comparison">
          <h3>区别与选法</h3>
          <dl>
            {guide.choices.map(([name, description]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {guide.parameterEffects && guide.parameterEffects.length > 0 && (
        <section className="fluent-parameter-effects">
          <h3>参数影响</h3>
          <dl>
            {guide.parameterEffects.map(([parameter, effect]) => (
              <div key={parameter}>
                <dt>{parameter}</dt>
                <dd>{effect}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <section className="fluent-operation-steps">
        <h3>操作顺序</h3>
        <ol>
          {guide.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      <section className="fluent-option-highlight fluent-example-card">
        <h3>算例示范</h3>
        <p>{guide.example}</p>
      </section>
      {guide.contextNote && (
        <section className="fluent-context-note">
          <h3>工程延伸</h3>
          <p>{guide.contextNote}</p>
        </section>
      )}
    </>
  )
}
