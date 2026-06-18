import { Link } from 'react-router-dom'
import type { CalculatorCategory } from '../models/calculator'

interface CalculatorCategoryCardProps {
  category: CalculatorCategory
  count: number
}

function CalculatorCategoryCard({ category, count }: CalculatorCategoryCardProps) {
  return (
    <Link className="category-card" to={`/calculators/${category.id}`}>
      <span className={`category-visual category-visual-${category.icon}`} aria-hidden="true">
        <span />
      </span>
      <span className="category-card-copy">
        <span className="eyebrow">{category.eyebrow}</span>
        <strong>{category.name}</strong>
        <span>{category.description}</span>
      </span>
      <span className="card-meta">{count} 个工具</span>
    </Link>
  )
}

export default CalculatorCategoryCard
