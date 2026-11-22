const cmu = 0.09

export function inletTurbulence(speed: number, intensityPercent: number, density: number, viscosity: number,
  scale: { diameter: number } | { viscosityRatio: number }) {
  if (intensityPercent > 100) throw new Error('湍流强度应按百分数输入，范围为 0 至 100（不含 0）。')
  const k = 1.5 * (speed * intensityPercent / 100) ** 2
  const omega = 'diameter' in scale
    ? Math.sqrt(k) / (cmu ** 0.25 * 0.07 * scale.diameter)
    : density * k / (viscosity * scale.viscosityRatio)
  return {
    k,
    omega,
    epsilon: cmu * k * omega,
    length: Math.sqrt(k) / (cmu ** 0.25 * omega),
    viscosityRatio: density * k / (viscosity * omega),
  }
}

export function gridConvergence(dimension: number, cells: number[], values: number[]) {
  const [fine, medium, coarse] = cells
  const [phi1, phi2, phi3] = values
  if (!(Number.isSafeInteger(fine) && Number.isSafeInteger(medium) && Number.isSafeInteger(coarse) && fine > medium && medium > coarse && coarse > 0)) {
    throw new Error('单元数须为正整数，且细网格 > 中网格 > 粗网格。')
  }
  const delta21 = phi2 - phi1
  const delta32 = phi3 - phi2
  const resolution = Math.max(...values.map(Math.abs)) * 1e-12
  if (Math.abs(delta21) <= resolution || Math.abs(delta32) <= resolution) {
    throw new Error('相邻网格结果相同或差异过小。请核对输出精度及迭代误差。')
  }
  if (Math.sign(delta21) !== Math.sign(delta32)) {
    throw new Error('三个结果呈振荡趋势，无法用当前单调 Richardson 模型计算 GCI。请增加网格级别并检查迭代误差。')
  }
  if (phi1 === 0 || phi2 === 0) throw new Error('细网格或中网格结果为零，无法计算相对 GCI 百分比。')

  const log21 = Math.log(fine / medium) / dimension
  const log32 = Math.log(medium / coarse) / dimension
  const ratio = delta32 / delta21
  if (!Number.isFinite(ratio) || ratio <= log32 / log21) throw new Error('当前数据不产生可用的正表观收敛阶，请检查细化路径及监测量。')

  // For φ(h) = φ₀ + C hᵖ the ratio of successive differences grows with p.
  function differenceRatio(order: number) {
    const coarseStep = order * log32
    const fineStep = order * log21
    return Math.exp(coarseStep) * (-Math.expm1(-coarseStep)) / (-Math.expm1(-fineStep))
  }
  let high = 1
  while (differenceRatio(high) < ratio) high *= 2
  let low = 0
  for (let i = 0; i < 64; i++) {
    const mid = (high + low) / 2
    if (differenceRatio(mid) < ratio) low = mid
    else high = mid
  }
  const order = (high + low) / 2
  const fineCorrection = delta21 / Math.expm1(order * log21)
  const mediumCorrection = delta32 / Math.expm1(order * log32)
  const gciFine = 125 * Math.abs(fineCorrection / phi1)
  const gciMedium = 125 * Math.abs(mediumCorrection / phi2)
  return {
    order,
    extrapolation: phi1 - fineCorrection,
    gciFine,
    gciMedium,
    rangeRatio: gciMedium / (Math.exp(order * log21) * gciFine),
    ratio21: Math.exp(log21),
    ratio32: Math.exp(log32),
    approximateError: 100 * Math.abs(delta21 / phi1),
  }
}
