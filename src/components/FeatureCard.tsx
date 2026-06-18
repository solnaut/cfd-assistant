import { Link } from 'react-router-dom'

interface FeatureCardProps {
  title: string
  description: string
  to: string
  eyebrow: string
  actionLabel: string
}

function FeatureCard({
  title,
  description,
  to,
  eyebrow,
  actionLabel,
}: FeatureCardProps) {
  return (
    <article className="feature-card">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button-link" to={to}>
        {actionLabel}
      </Link>
    </article>
  )
}

export default FeatureCard
