import { Link } from 'react-router-dom'

interface FeatureCardProps {
  title: string
  description: string
  to: string
  tag: string
}

function FeatureCard({ title, description, to, tag }: FeatureCardProps) {
  return (
    <article className="feature-card">
      <span className="tag">{tag}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button-link" to={to}>
        进入
      </Link>
    </article>
  )
}

export default FeatureCard
