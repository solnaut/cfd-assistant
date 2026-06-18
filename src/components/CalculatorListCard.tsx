import { Link } from 'react-router-dom'
import type { CalculatorDefinition } from '../models/calculator'

interface CalculatorListCardProps {
  calculator: CalculatorDefinition
}

function CalculatorListCard({ calculator }: CalculatorListCardProps) {
  return (
    <article className="calculator-list-card">
      <div>
        <p className="eyebrow">{calculator.shortName}</p>
        <h2>{calculator.name}</h2>
        <p>{calculator.summary}</p>
      </div>
      <div className="calculator-card-footer">
        <span>{calculator.inputs.length} 个输入项</span>
        <Link
          className="button-link button-link-small"
          to={`/calculators/${calculator.categoryId}/${calculator.id}`}
        >
          打开
        </Link>
      </div>
    </article>
  )
}

export default CalculatorListCard
