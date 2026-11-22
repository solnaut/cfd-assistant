export interface ChartPoint {
  x: number
  y: number
  label?: string
}

export interface ChartSeries {
  points: readonly ChartPoint[]
  color: string
  name?: string
  dashed?: boolean
  markersOnly?: boolean
}

export function EngineeringChart({ title, xLabel, yLabel, series, yFormat = (value) => Number(value.toPrecision(3)).toString() }: {
  title: string; xLabel: string; yLabel: string; series: readonly ChartSeries[]; yFormat?: (value: number) => string
}) {
  const points = series.flatMap((entry) => entry.points)
  const xValues = points.map(({ x }) => x)
  const yValues = points.map(({ y }) => y)
  const width = 560
  const height = 310
  const left = 63
  const right = 518
  const top = 24
  const bottom = 242
  const xMin = Math.min(...xValues)
  const xSpan = Math.max(...xValues) - xMin || 1
  const yMin = Math.min(...yValues)
  const ySpan = Math.max(...yValues) - yMin || 1
  const xAt = (value: number) => left + (right - left) * (0.05 + 0.9 * (value - xMin) / xSpan)
  const yAt = (value: number) => bottom - (bottom - top) * (0.05 + 0.9 * (value - yMin) / ySpan)

  return (
    <figure className="engineering-chart">
      <svg role="img" aria-label={`${title} · ${xLabel} · ${yLabel}`} viewBox={`0 0 ${width} ${height}`}>
        {[0, 1, 2, 3, 4].map((tick) => {
          const fraction = tick / 4
          const y = yMin + ySpan * fraction
          const x = xMin + xSpan * fraction
          return <g key={tick} className="engineering-chart-grid">
            <line x1={left} y1={yAt(y)} x2={right} y2={yAt(y)} />
            <line x1={xAt(x)} y1={top} x2={xAt(x)} y2={bottom} />
            <text x={left - 8} y={yAt(y) + 4} textAnchor="end">{yFormat(y)}</text>
            <text x={xAt(x)} y={bottom + 18} textAnchor="middle">{Number(x.toPrecision(3))}</text>
          </g>
        })}
        <path d={`M${left} ${top}V${bottom}H${right}`} fill="none" stroke="currentColor" />
        {series.map(({ points, dashed, color, markersOnly }, index) => <g key={index}>
          {!markersOnly && <polyline points={points.map(({ x, y }) => `${xAt(x)},${yAt(y)}`).join(' ')} fill="none" stroke={color} strokeWidth="2.4" strokeDasharray={dashed ? '6 4' : undefined} />}
          {points.filter(({ label }) => label).map(({ x, y, label }) => <g key={label}>
            <circle cx={xAt(x)} cy={yAt(y)} r="4" fill={color} />
            <text className="engineering-chart-marker" x={xAt(x) + 7} y={yAt(y) - 7}>{label}</text>
          </g>)}
        </g>)}
        <text x={(left + right) / 2} y={bottom + 48} textAnchor="middle">{xLabel}</text>
        <text x="16" y={(top + bottom) / 2} textAnchor="middle" transform={`rotate(-90 16 ${(top + bottom) / 2})`}>{yLabel}</text>
      </svg>
      <figcaption>
        <strong>{title}</strong>
        {series.flatMap(({ name, color }) => name ? [<span key={name}><i aria-hidden="true" style={{ background: color }} />{name}</span>] : [])}
      </figcaption>
    </figure>
  )
}
