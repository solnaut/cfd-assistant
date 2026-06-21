export interface BoundaryLayerPlanRow {
  layer: number
  height: number
  cumulativeThickness: number
}

export interface BoundaryLayerPlan {
  methodId: string
  methodLabel: string
  firstLayerHeight: number
  growthRate: number
  layerCount: number
  actualTotalThickness: number
  targetTotalThickness?: number
  targetDifference?: number
  lastLayerHeight: number
  thicknessRatio?: number
  automaticThickness?: number
  automaticThicknessLabel?: string
  rows: BoundaryLayerPlanRow[]
  notes: string[]
}

interface BoundaryLayerPlanInput {
  firstLayerHeight: number
  growthRate?: number
  recommendationMethod?: string
  targetTotalThickness?: number
  layerCount?: number
  automaticTotalThickness?: number
  automaticThicknessLabel?: string
  pipeDiameter?: number
  presetLayerCount?: number
}

const DEFAULT_GROWTH_RATE = 1.2
const DEFAULT_PRESET_LAYER_COUNT = 15

export function createBoundaryLayerPlan({
  firstLayerHeight,
  growthRate = DEFAULT_GROWTH_RATE,
  recommendationMethod = 'auto-total-thickness',
  targetTotalThickness,
  layerCount,
  automaticTotalThickness,
  automaticThicknessLabel,
  pipeDiameter,
  presetLayerCount = DEFAULT_PRESET_LAYER_COUNT,
}: BoundaryLayerPlanInput): BoundaryLayerPlan {
  assertPositive(firstLayerHeight, '推荐第一层完整厚度 h1')
  assertAtLeast(growthRate, 1, '增长率 r')

  if (recommendationMethod === 'target-total-thickness') {
    assertPositive(targetTotalThickness, '目标总厚度 H')
    const resolvedTargetTotalThickness = targetTotalThickness as number
    const resolvedLayerCount = layersForTargetThickness(
      firstLayerHeight,
      growthRate,
      resolvedTargetTotalThickness,
    )
    return createPlan({
      firstLayerHeight,
      growthRate,
      layerCount: resolvedLayerCount,
      methodId: recommendationMethod,
      methodLabel: '用户指定目标总厚度 H',
      targetTotalThickness: resolvedTargetTotalThickness,
      pipeDiameter,
      notes: ['按目标总厚度反算层数，并向上取整保证实际总厚度不小于目标值。'],
    })
  }

  if (recommendationMethod === 'fixed-layer-count') {
    assertPositiveInteger(layerCount, '层数 n')
    const resolvedLayerCount = layerCount as number
    return createPlan({
      firstLayerHeight,
      growthRate,
      layerCount: resolvedLayerCount,
      methodId: recommendationMethod,
      methodLabel: '用户指定层数 n',
      pipeDiameter,
      notes: ['按用户指定层数正向计算每层高度和累计厚度。'],
    })
  }

  if (automaticTotalThickness !== undefined) {
    assertPositive(automaticTotalThickness, '自动推荐总厚度 H')
    const resolvedLayerCount = layersForTargetThickness(
      firstLayerHeight,
      growthRate,
      automaticTotalThickness,
    )
    return createPlan({
      firstLayerHeight,
      growthRate,
      layerCount: resolvedLayerCount,
      methodId: recommendationMethod,
      methodLabel: '自动推荐总厚度',
      targetTotalThickness: automaticTotalThickness,
      automaticTotalThickness,
      automaticThicknessLabel,
      pipeDiameter,
      notes: [
        automaticThicknessLabel
          ? `自动推荐来自 ${automaticThicknessLabel}。`
          : '自动推荐值来自当前工况的总厚度估算。',
        '该推荐只作为初始网格估算，最终应结合后处理 y+ 和边界层分辨率检查。',
      ],
    })
  }

  return createPlan({
    firstLayerHeight,
    growthRate,
    layerCount: presetLayerCount,
    methodId: recommendationMethod,
    methodLabel: '工程预设层数',
    pipeDiameter,
    notes: [
      '当前工况没有采用统一边界层总厚度公式，使用工程初始预设层数。',
      '可切换为用户指定目标总厚度 H 或用户指定层数 n 进行调整。',
    ],
  })
}

export function formatBoundaryLayerPlanCsv(plan: BoundaryLayerPlan) {
  return [
    'layer,height_m,cumulative_thickness_m',
    ...plan.rows.map((row) => [
      row.layer,
      formatNumber(row.height),
      formatNumber(row.cumulativeThickness),
    ].join(',')),
  ].join('\n')
}

export function formatBoundaryLayerPlanTable(plan: BoundaryLayerPlan) {
  return [
    '层数\t单层高度(m)\t累计厚度(m)',
    ...plan.rows.map((row) => [
      row.layer,
      formatNumber(row.height),
      formatNumber(row.cumulativeThickness),
    ].join('\t')),
  ].join('\n')
}

export function formatBoundaryLayerPlanSummary(plan: BoundaryLayerPlan) {
  const lines = [
    '边界层网格推荐方案',
    `推荐方式: ${plan.methodLabel}`,
    `第一层完整厚度 h1: ${formatNumber(plan.firstLayerHeight)} m`,
    `增长率 r: ${formatNumber(plan.growthRate)}`,
    `层数 n: ${plan.layerCount}`,
    `实际总厚度 Hn: ${formatNumber(plan.actualTotalThickness)} m`,
    `最后一层高度 hn: ${formatNumber(plan.lastLayerHeight)} m`,
  ]

  if (plan.targetTotalThickness !== undefined) {
    lines.push(`目标总厚度 H: ${formatNumber(plan.targetTotalThickness)} m`)
  }

  if (plan.targetDifference !== undefined) {
    lines.push(`差值 Hn-H: ${formatNumber(plan.targetDifference)} m`)
  }

  if (plan.thicknessRatio !== undefined) {
    lines.push(`Hn/D: ${formatNumber(plan.thicknessRatio)}`)
  }

  return lines.join('\n')
}

function createPlan({
  firstLayerHeight,
  growthRate,
  layerCount,
  methodId,
  methodLabel,
  targetTotalThickness,
  automaticTotalThickness,
  automaticThicknessLabel,
  pipeDiameter,
  notes,
}: {
  firstLayerHeight: number
  growthRate: number
  layerCount: number
  methodId: string
  methodLabel: string
  targetTotalThickness?: number
  automaticTotalThickness?: number
  automaticThicknessLabel?: string
  pipeDiameter?: number
  notes: string[]
}): BoundaryLayerPlan {
  const rows = createRows(firstLayerHeight, growthRate, layerCount)
  const lastRow = rows[rows.length - 1]
  const actualTotalThickness = lastRow.cumulativeThickness

  return {
    methodId,
    methodLabel,
    firstLayerHeight,
    growthRate,
    layerCount,
    actualTotalThickness,
    targetTotalThickness,
    targetDifference:
      targetTotalThickness === undefined
        ? undefined
        : actualTotalThickness - targetTotalThickness,
    lastLayerHeight: lastRow.height,
    thicknessRatio:
      pipeDiameter === undefined ? undefined : actualTotalThickness / pipeDiameter,
    automaticThickness: automaticTotalThickness,
    automaticThicknessLabel,
    rows,
    notes,
  }
}

function createRows(
  firstLayerHeight: number,
  growthRate: number,
  layerCount: number,
) {
  const rows: BoundaryLayerPlanRow[] = []
  let cumulativeThickness = 0

  for (let layer = 1; layer <= layerCount; layer += 1) {
    const height = isUnitGrowth(growthRate)
      ? firstLayerHeight
      : firstLayerHeight * growthRate ** (layer - 1)
    cumulativeThickness += height
    rows.push({ layer, height, cumulativeThickness })
  }

  return rows
}

function layersForTargetThickness(
  firstLayerHeight: number,
  growthRate: number,
  targetTotalThickness: number,
) {
  if (targetTotalThickness <= firstLayerHeight) {
    return 1
  }

  if (isUnitGrowth(growthRate)) {
    return Math.ceil(targetTotalThickness / firstLayerHeight)
  }

  return Math.max(
    1,
    Math.ceil(
      Math.log(1 + targetTotalThickness * (growthRate - 1) / firstLayerHeight) /
      Math.log(growthRate),
    ),
  )
}

function isUnitGrowth(growthRate: number) {
  return Math.abs(growthRate - 1) < 1e-12
}

function assertPositive(value: number | undefined, label: string) {
  if (value === undefined || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必须大于 0。`)
  }
}

function assertAtLeast(value: number, minimum: number, label: string) {
  if (!Number.isFinite(value) || value < minimum) {
    throw new Error(`${label}不能小于 ${minimum}。`)
  }
}

function assertPositiveInteger(value: number | undefined, label: string) {
  if (value === undefined || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${label}必须是正整数。`)
  }
}

function formatNumber(value: number) {
  if (value === 0) {
    return '0'
  }

  const magnitude = Math.abs(value)
  if (magnitude >= 1e5 || magnitude < 1e-4) {
    return value.toExponential(8).replace(/\.?0+e/, 'e')
  }

  return Number(value.toPrecision(8)).toString()
}
