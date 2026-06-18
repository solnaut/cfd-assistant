import type {
  CalculatorDefinition,
  CalculatorImplementationId,
  CalculatorInputDefinition,
} from '../models/calculator'
import type { UnitCategory } from '../units/conversions'
import { fromBaseValue, toBaseValue } from '../units/conversions'

export interface CalculatorInputValue {
  value: number
  unitId?: string
}

export type CalculatorInputValues = Record<string, CalculatorInputValue>

export interface CalculationItem {
  id: string
  label: string
  value?: number
  text?: string
  unitCategory?: UnitCategory
  unitId?: string
  precision?: number
}

export interface CalculationResult {
  outputs: CalculationItem[]
  intermediates: CalculationItem[]
  summary: string[]
}

type BaseInputs = Record<string, number>

type CalculatorImplementation = (
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) => CalculationResult

const implementations: Record<CalculatorImplementationId, CalculatorImplementation> = {
  'biot-number': calculateBiot,
  'boundary-layer-mesh': calculateBoundaryLayerMesh,
  'cfl-time-step': calculateCflTimeStep,
  'fourier-number': calculateFourier,
  'grashof-number': calculateGrashof,
  'hydraulic-diameter': calculateHydraulicDiameter,
  'mach-number': calculateMach,
  'peclet-number': calculatePeclet,
  'prandtl-number': calculatePrandtl,
  'rayleigh-number': calculateRayleigh,
  'reynolds-number': calculateReynolds,
}

export function calculate(
  definition: CalculatorDefinition,
  values: CalculatorInputValues,
) {
  if (!definition.implementationId) {
    throw new Error('该计算器尚未开放计算。')
  }

  const implementation = implementations[definition.implementationId]
  const baseInputs = toBaseInputs(definition.inputs, values)

  return implementation(baseInputs, definition)
}

export function formatCalculationValue(item: CalculationItem) {
  if (item.text) {
    return item.text
  }

  if (item.value === undefined) {
    return ''
  }

  const displayValue =
    item.unitCategory && item.unitId
      ? fromBaseValue(item.value, item.unitId, item.unitCategory)
      : item.value
  const precision = item.precision ?? 6
  const formatted = formatNumber(displayValue, precision)

  return item.unitId && item.unitId !== '1'
    ? `${formatted} ${item.unitId}`
    : formatted
}

function toBaseInputs(
  definitions: CalculatorInputDefinition[],
  values: CalculatorInputValues,
) {
  return definitions.reduce<BaseInputs>((accumulator, definition) => {
    const input = values[definition.id]

    if (!input || input.value === undefined || Number.isNaN(input.value)) {
      if (definition.required) {
        throw new Error(`请填写${definition.label}。`)
      }
      return accumulator
    }

    if (!Number.isFinite(input.value)) {
      throw new Error(`${definition.label}必须是有限数值。`)
    }

    if (definition.integer && !Number.isInteger(input.value)) {
      throw new Error(`${definition.label}必须是整数。`)
    }

    if (definition.min !== undefined && input.value < definition.min) {
      throw new Error(`${definition.label}不能小于 ${definition.min}。`)
    }

    accumulator[definition.id] = definition.unitCategory
      ? toBaseValue(
          input.value,
          input.unitId ?? definition.defaultUnit ?? '1',
          definition.unitCategory,
        )
      : input.value

    return accumulator
  }, {})
}

function calculateReynolds(inputs: BaseInputs, definition: CalculatorDefinition) {
  const density = positive(inputs.density, '密度')
  const velocity = nonNegative(inputs.velocity, '参考速度')
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const viscosity = positive(inputs['dynamic-viscosity'], '动力黏度')
  const value = (density * velocity * length) / viscosity

  return result(definition, value, [
    item('kinematic-viscosity', '运动黏度', viscosity / density, 'kinematicViscosity', 'm^2/s'),
  ])
}

function calculateMach(inputs: BaseInputs, definition: CalculatorDefinition) {
  const velocity = nonNegative(inputs.velocity, '流速')
  const speedOfSound = positive(inputs['speed-of-sound'], '声速')
  const value = velocity / speedOfSound

  return result(definition, value)
}

function calculatePrandtl(inputs: BaseInputs, definition: CalculatorDefinition) {
  const viscosity = positive(inputs['dynamic-viscosity'], '动力黏度')
  const specificHeat = positive(inputs['specific-heat'], '定压比热')
  const thermalConductivity = positive(inputs['thermal-conductivity'], '导热系数')
  const value = (viscosity * specificHeat) / thermalConductivity

  return result(definition, value)
}

function calculatePeclet(inputs: BaseInputs, definition: CalculatorDefinition) {
  const velocity = nonNegative(inputs.velocity, '参考速度')
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const thermalDiffusivity = positive(inputs['thermal-diffusivity'], '热扩散率')
  const value = (velocity * length) / thermalDiffusivity

  return result(definition, value)
}

function calculateFourier(inputs: BaseInputs, definition: CalculatorDefinition) {
  const thermalDiffusivity = positive(inputs['thermal-diffusivity'], '热扩散率')
  const time = nonNegative(inputs.time, '时间')
  const length = positive(inputs['characteristic-length'], '特征长度')
  const value = (thermalDiffusivity * time) / length ** 2

  return result(definition, value)
}

function calculateBiot(inputs: BaseInputs, definition: CalculatorDefinition) {
  const heatTransferCoefficient = nonNegative(
    inputs['heat-transfer-coefficient'],
    '对流换热系数',
  )
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const thermalConductivity = positive(inputs['thermal-conductivity'], '固体导热系数')
  const value = (heatTransferCoefficient * length) / thermalConductivity

  return result(definition, value)
}

function calculateGrashof(inputs: BaseInputs, definition: CalculatorDefinition) {
  const gravity = nonNegative(inputs.gravity, '重力加速度')
  const beta = positive(inputs['thermal-expansion-coefficient'], '体膨胀系数')
  const deltaT = nonNegative(inputs['temperature-difference'], '温差')
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const kinematicViscosity = positive(inputs['kinematic-viscosity'], '运动黏度')
  const value =
    (gravity * beta * deltaT * length ** 3) / kinematicViscosity ** 2

  return result(definition, value)
}

function calculateRayleigh(inputs: BaseInputs, definition: CalculatorDefinition) {
  const gravity = nonNegative(inputs.gravity, '重力加速度')
  const beta = positive(inputs['thermal-expansion-coefficient'], '体膨胀系数')
  const deltaT = nonNegative(inputs['temperature-difference'], '温差')
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const kinematicViscosity = positive(inputs['kinematic-viscosity'], '运动黏度')
  const thermalDiffusivity = positive(inputs['thermal-diffusivity'], '热扩散率')
  const grashof =
    (gravity * beta * deltaT * length ** 3) / kinematicViscosity ** 2
  const prandtl = kinematicViscosity / thermalDiffusivity
  const value = grashof * prandtl

  return result(definition, value, [
    item('grashof-number', 'Grashof 数', grashof),
    item('prandtl-number', 'Prandtl 数', prandtl),
  ])
}

function calculateHydraulicDiameter(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const area = nonNegative(inputs.area, '流通截面积')
  const wettedPerimeter = positive(inputs['wetted-perimeter'], '湿周')
  const value = (4 * area) / wettedPerimeter

  return result(definition, value)
}

function calculateCflTimeStep(inputs: BaseInputs, definition: CalculatorDefinition) {
  const targetCfl = nonNegative(inputs['target-cfl'], '目标 CFL')
  const cellSize = positive(inputs['cell-size'], '特征网格尺寸')
  const velocity = positive(inputs.velocity, '特征速度')
  const value = (targetCfl * cellSize) / velocity

  return result(definition, value, [
    item('input-cfl', '目标 CFL', targetCfl),
  ])
}

function calculateBoundaryLayerMesh(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const firstLayerHeight = positive(inputs['first-layer-height'], '第一层高度')
  const growthRate = positive(inputs['growth-rate'], '增长率')
  const layerCount = positiveInteger(inputs['layer-count'], '层数')
  const layerHeights = Array.from({ length: layerCount }, (_, index) => (
    firstLayerHeight * growthRate ** index
  ))
  const totalThickness =
    growthRate === 1
      ? layerCount * firstLayerHeight
      : firstLayerHeight * (growthRate ** layerCount - 1) / (growthRate - 1)
  const lastLayerHeight = layerHeights[layerHeights.length - 1]
  const output = definition.outputs[0]

  return {
    outputs: [
      item(
        output.id,
        output.label,
        totalThickness,
        output.unitCategory,
        output.defaultUnit,
      ),
      item(
        'last-layer-height',
        '最后一层高度',
        lastLayerHeight,
        'length',
        output.defaultUnit ?? 'm',
      ),
    ],
    intermediates: [
      item('layer-count', '层数', layerCount),
      item('growth-rate', '增长率', growthRate),
      {
        id: 'layer-heights',
        label: '层高序列',
        text: layerHeights
          .slice(0, 20)
          .map((height, index) => {
            const value = fromBaseValue(height, output.defaultUnit ?? 'm', 'length')
            return `h${index + 1}=${formatNumber(value, 6)} ${output.defaultUnit ?? 'm'}`
          })
          .join(', '),
      },
    ],
    summary: ['按等比层高序列计算总厚度，不包含 y+ 或真实边界层厚度判断。'],
  }
}

function result(
  definition: CalculatorDefinition,
  value: number,
  intermediates: CalculationItem[] = [],
): CalculationResult {
  const output = definition.outputs[0]

  return {
    outputs: [
      item(
        output.id,
        output.label,
        finite(value, output.label),
        output.unitCategory,
        output.defaultUnit,
      ),
    ],
    intermediates,
    summary: definition.notes?.slice(0, 2) ?? [],
  }
}

function item(
  id: string,
  label: string,
  value: number,
  unitCategory?: UnitCategory,
  unitId?: string,
): CalculationItem {
  return {
    id,
    label,
    value: finite(value, label),
    unitCategory,
    unitId,
  }
}

function positive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必须大于 0。`)
  }
  return value
}

function nonNegative(value: number, label: string) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label}不能小于 0。`)
  }
  return value
}

function positiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label}必须是正整数。`)
  }
  return value
}

function finite(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label}计算结果不是有限数值。`)
  }
  return value
}

function formatNumber(value: number, precision: number) {
  if (value === 0) {
    return '0'
  }

  const magnitude = Math.abs(value)

  if (magnitude >= 1e5 || magnitude < 1e-4) {
    return value.toExponential(precision).replace(/\.?0+e/, 'e')
  }

  return Number(value.toPrecision(precision)).toString()
}
