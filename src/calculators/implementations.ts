import type {
  CalculatorDefinition,
  CalculatorImplementationId,
  CalculatorInputDefinition,
  CalculatorModeDefinition,
} from '../models/calculator'
import type { UnitCategory } from '../units/conversions'
import { fromBaseValue, getUnitDisplaySymbol, toBaseValue } from '../units/conversions'
import {
  createBoundaryLayerPlan,
  type BoundaryLayerPlan,
} from './boundaryLayerPlan'

export interface CalculatorInputValue {
  value: number | string
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
  boundaryLayerPlan?: BoundaryLayerPlan
}

type BaseInputValue = number | string

type BaseInputs = Record<string, BaseInputValue>

interface CalculatorContext {
  modeId?: string
}

type CalculatorImplementation = (
  inputs: BaseInputs,
  definition: CalculatorDefinition,
  context: CalculatorContext,
) => CalculationResult

const implementations: Record<CalculatorImplementationId, CalculatorImplementation> = {
  'biot-number': calculateBiot,
  'boundary-layer-mesh': calculateBoundaryLayerMesh,
  'cfl-time-step': calculateCflTimeStep,
  'conduction-heat-transfer': calculateConductionHeatTransfer,
  'convective-heat-transfer': calculateConvectiveHeatTransfer,
  'fourier-number': calculateFourier,
  'grashof-number': calculateGrashof,
  'heat-flux': calculateHeatFlux,
  'hydraulic-diameter': calculateHydraulicDiameter,
  'ideal-gas-speed-of-sound': calculateIdealGasSpeedOfSound,
  'laminar-pipe-pressure-drop': calculateLaminarPipePressureDrop,
  'mass-flow-rate': calculateMassFlowRate,
  'mean-velocity': calculateMeanVelocity,
  'nusselt-number': calculateNusselt,
  'mach-number': calculateMach,
  'peclet-number': calculatePeclet,
  'pipe-pressure-drop': calculatePipePressureDrop,
  'prandtl-number': calculatePrandtl,
  'rayleigh-number': calculateRayleigh,
  'reynolds-number': calculateReynolds,
  'rotating-time-step': calculateRotatingTimeStep,
  'temperature-rise': calculateTemperatureRise,
  'thermal-resistance': calculateThermalResistance,
  'total-time-steps': calculateTotalTimeSteps,
  'y-plus-first-layer-height': calculateYPlusFirstLayerHeight,
}

export function calculate(
  definition: CalculatorDefinition,
  values: CalculatorInputValues,
  options: CalculatorContext = {},
) {
  if (!definition.implementationId) {
    throw new Error('该计算器尚未开放计算。')
  }

  const implementation = implementations[definition.implementationId]
  const mode = getActiveMode(definition, options.modeId)
  const inputDefinitions = getActiveInputDefinitions(definition, mode)
  const baseInputs = toBaseInputs(inputDefinitions, values)

  return implementation(baseInputs, definition, {
    modeId: mode?.id,
  })
}

export function getDefaultModeId(definition: CalculatorDefinition) {
  return definition.defaultModeId ?? definition.modes?.[0]?.id
}

export function getActiveMode(
  definition: CalculatorDefinition,
  modeId?: string,
) {
  if (!definition.modes?.length) {
    return undefined
  }

  const fallbackModeId = getDefaultModeId(definition)

  return (
    definition.modes.find((mode) => mode.id === (modeId ?? fallbackModeId)) ??
    definition.modes[0]
  )
}

export function getActiveInputDefinitions(
  definition: CalculatorDefinition,
  mode?: CalculatorModeDefinition,
) {
  if (!mode) {
    return definition.inputs
  }

  const inputsById = new Map(
    definition.inputs.map((input) => [input.id, input]),
  )

  return mode.inputIds
    .map((inputId) => inputsById.get(inputId))
    .filter((input): input is CalculatorInputDefinition => Boolean(input))
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

  return item.unitId && item.unitId !== '1' && item.unitCategory
    ? `${formatted} ${getUnitDisplaySymbol(item.unitCategory, item.unitId)}`
    : formatted
}

function toBaseInputs(
  definitions: CalculatorInputDefinition[],
  values: CalculatorInputValues,
) {
  return definitions.reduce<BaseInputs>((accumulator, definition) => {
    const input = values[definition.id]

    if (!input || input.value === undefined || input.value === '') {
      if (definition.required) {
        throw new Error(`请填写${definition.label}。`)
      }
      return accumulator
    }

    if (definition.kind === 'select') {
      const value = String(input.value)
      const option = definition.options?.find((entry) => entry.id === value)

      if (!option) {
        throw new Error(`请选择有效的${definition.label}。`)
      }

      if (option.disabled) {
        throw new Error(`${option.label}暂未开放计算。`)
      }

      accumulator[definition.id] = value
      return accumulator
    }

    const numericValue =
      typeof input.value === 'number' ? input.value : Number(input.value)

    if (!Number.isFinite(numericValue)) {
      throw new Error(`${definition.label}必须是有限数值。`)
    }

    if (definition.integer && !Number.isInteger(numericValue)) {
      throw new Error(`${definition.label}必须是整数。`)
    }

    if (definition.min !== undefined && numericValue < definition.min) {
      throw new Error(`${definition.label}不能小于 ${definition.min}。`)
    }

    accumulator[definition.id] = definition.unitCategory
      ? toBaseValue(
          numericValue,
          input.unitId ?? definition.defaultUnit ?? '1',
          definition.unitCategory,
        )
      : numericValue

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

function calculateIdealGasSpeedOfSound(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const gamma = positive(inputs['heat-capacity-ratio'], '比热比')
  const gasConstant = positive(inputs['gas-constant'], '气体常数')
  const temperature = positive(inputs.temperature, '绝对温度')
  const value = Math.sqrt(gamma * gasConstant * temperature)

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

function calculatePipePressureDrop(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const darcyFrictionFactor = nonNegative(
    inputs['darcy-friction-factor'],
    'Darcy 摩阻因子',
  )
  const pipeLength = nonNegative(inputs['pipe-length'], '管长')
  const hydraulicDiameter = positive(inputs['hydraulic-diameter'], '水力直径')
  const density = positive(inputs.density, '密度')
  const velocity = nonNegative(inputs.velocity, '平均速度')
  const dynamicPressure = (density * velocity ** 2) / 2
  const lengthDiameterRatio = pipeLength / hydraulicDiameter
  const value = darcyFrictionFactor * lengthDiameterRatio * dynamicPressure

  return result(definition, value, [
    item('dynamic-pressure', '动压', dynamicPressure, 'pressure', 'Pa'),
    item('length-diameter-ratio', '长度直径比', lengthDiameterRatio),
  ])
}

function calculateLaminarPipePressureDrop(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const pipeLength = nonNegative(inputs['pipe-length'], '管长')
  const diameter = positive(inputs['pipe-diameter'], '管径')
  const density = positive(inputs.density, '密度')
  const velocity = nonNegative(inputs.velocity, '平均速度')
  const viscosity = positive(inputs['dynamic-viscosity'], '动力黏度')
  const reynolds = (density * velocity * diameter) / viscosity
  const darcyFrictionFactor = reynolds === 0 ? 0 : 64 / reynolds
  const dynamicPressure = (density * velocity ** 2) / 2
  const value = darcyFrictionFactor * (pipeLength / diameter) * dynamicPressure

  return result(definition, value, [
    item('reynolds-number', 'Reynolds 数', reynolds),
    item('darcy-friction-factor', 'Darcy 摩阻因子', darcyFrictionFactor),
    item('dynamic-pressure', '动压', dynamicPressure, 'pressure', 'Pa'),
  ])
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

function calculateTotalTimeSteps(inputs: BaseInputs, definition: CalculatorDefinition) {
  const totalTime = nonNegative(inputs['total-time'], '总物理时间')
  const timeStep = positive(inputs['time-step'], '时间步长')
  const exactSteps = totalTime / timeStep
  const value = Math.ceil(exactSteps)

  return result(definition, value, [
    item('exact-step-count', '理论步数', exactSteps),
    item('covered-time', '覆盖物理时间', value * timeStep, 'time', 's'),
  ])
}

function calculateRotatingTimeStep(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const rpm = positive(inputs['rotational-speed'], '转速')
  const stepsPerRevolution = positiveInteger(
    inputs['steps-per-revolution'],
    '每转步数',
  )
  const period = 60 / rpm
  const value = period / stepsPerRevolution

  return result(definition, value, [
    item('period', '单转周期', period, 'time', 's'),
    item('revolutions-per-second', '每秒转数', rpm / 60),
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
            return `h${index + 1}=${formatNumber(value, 6)} ${getUnitDisplaySymbol('length', output.defaultUnit ?? 'm')}`
          })
          .join(', '),
      },
    ],
    summary: ['按等比层高序列计算总厚度，不包含 y+ 或真实边界层厚度判断。'],
  }
}

function calculateYPlusFirstLayerHeight(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
  context: CalculatorContext,
) {
  const modeId = context.modeId ?? getDefaultModeId(definition)
  const targetYPlus = positive(inputs['target-y-plus'], '目标 y+')
  const density = positive(inputs.density, '密度 ρ')
  const viscosity = positive(inputs['dynamic-viscosity'], '动力黏度 μ')
  const kinematicViscosity = viscosity / density

  if (modeId === 'initial-estimate') {
    const flowScenario = selectValue(inputs['flow-scenario'], '流动场景')
    const velocity = positive(inputs['reference-velocity'], '参考速度 U')
    const gridSettings = readBoundaryLayerGridSettings(inputs)

    if (flowScenario === 'flat-plate-external') {
      const length = positive(inputs['characteristic-length'], '特征长度 L')
      const reynolds = density * velocity * length / viscosity
      const frictionEstimate = estimateFlatPlateFrictionCoefficient(
        inputs,
        reynolds,
      )
      const wallShearStress =
        0.5 * frictionEstimate.coefficient * density * velocity ** 2
      const automaticTotalThickness = estimateFlatPlateBoundaryLayerThickness(
        frictionEstimate.methodId,
        length,
        reynolds,
      )

      return createYPlusResult(definition, {
        targetYPlus,
        density,
        kinematicViscosity,
        wallShearStress,
        frictionCoefficient: frictionEstimate.coefficient,
        reynolds,
        method: frictionEstimate.method,
        warnings: frictionEstimate.warnings,
        gridSettings,
        automaticTotalThickness,
        automaticThicknessLabel:
          automaticTotalThickness === undefined
            ? undefined
            : frictionEstimate.methodId === 'flat-plate-laminar'
              ? '层流平板边界层厚度 δ = 5x/√Re_x'
              : '湍流平板边界层厚度 δ = 0.37x/Re_x^(1/5)',
      })
    }

    if (flowScenario === 'internal-pipe') {
      const diameter = positive(inputs['hydraulic-diameter'], '管径或水力直径 D')
      const pipeEstimate = estimatePipeFrictionCoefficient(
        inputs,
        density,
        velocity,
        diameter,
        viscosity,
      )
      const wallShearStress =
        0.5 * pipeEstimate.fanningCoefficient * density * velocity ** 2

      return createYPlusResult(definition, {
        targetYPlus,
        density,
        kinematicViscosity,
        wallShearStress,
        frictionCoefficient: pipeEstimate.fanningCoefficient,
        darcyFrictionFactor: pipeEstimate.darcyFrictionFactor,
        pipeReynolds: pipeEstimate.reynolds,
        method: pipeEstimate.method,
        warnings: pipeEstimate.warnings,
        gridSettings,
        pipeDiameter: diameter,
      })
    }

    throw new Error('请选择有效的流动场景。')
  }

  if (modeId === 'known-wall-shear-stress') {
    const wallShearStress = positive(inputs['wall-shear-stress'], '壁面剪切应力 τw')
    const gridSettings = readBoundaryLayerGridSettings(inputs)

    return createYPlusResult(definition, {
      targetYPlus,
      density,
      kinematicViscosity,
      wallShearStress,
      gridSettings,
    })
  }

  if (modeId === 'known-friction-coefficient') {
    const frictionCoefficient = positive(inputs['friction-coefficient'], '壁面摩擦系数 Cf')
    const velocity = positive(inputs['reference-velocity'], '参考速度 U')
    const wallShearStress = 0.5 * frictionCoefficient * density * velocity ** 2
    const gridSettings = readBoundaryLayerGridSettings(inputs)

    return createYPlusResult(definition, {
      targetYPlus,
      density,
      kinematicViscosity,
      wallShearStress,
      frictionCoefficient,
      gridSettings,
    })
  }

  throw new Error('请选择有效的计算模式。')
}

interface YPlusResultInputs {
  targetYPlus: number
  density: number
  kinematicViscosity: number
  wallShearStress: number
  frictionCoefficient?: number
  darcyFrictionFactor?: number
  reynolds?: number
  pipeReynolds?: number
  method?: string
  warnings?: string[]
  gridSettings?: BoundaryLayerGridSettings
  automaticTotalThickness?: number
  automaticThicknessLabel?: string
  pipeDiameter?: number
}

function createYPlusResult(
  definition: CalculatorDefinition,
  values: YPlusResultInputs,
) {
  const {
    targetYPlus,
    density,
    kinematicViscosity,
    wallShearStress,
    frictionCoefficient,
    darcyFrictionFactor,
    reynolds,
    pipeReynolds,
    method,
    warnings = [],
    gridSettings,
    automaticTotalThickness,
    automaticThicknessLabel,
    pipeDiameter,
  } = values
  const frictionVelocity = Math.sqrt(wallShearStress / density)
  const centerDistance = targetYPlus * kinematicViscosity / frictionVelocity
  const fullThickness = 2 * centerDistance
  const outputs = definition.outputs
  const intermediates: CalculationItem[] = []

  if (reynolds !== undefined) {
    intermediates.push(item('reynolds-number', 'Re_x', reynolds))
  }

  if (pipeReynolds !== undefined) {
    intermediates.push(item('pipe-reynolds-number', 'Re_D', pipeReynolds))
  }

  if (darcyFrictionFactor !== undefined) {
    intermediates.push(
      item('darcy-friction-factor', 'Darcy 摩阻系数 f', darcyFrictionFactor),
    )
  }

  if (frictionCoefficient !== undefined) {
    intermediates.push(
      item('wall-friction-coefficient', 'Fanning 摩擦系数 Cf', frictionCoefficient),
    )
  }

  intermediates.push(
    item('wall-shear-stress', '壁面剪切应力 τw', wallShearStress, 'pressure', 'Pa'),
    item('friction-velocity', '摩擦速度 uτ', frictionVelocity, 'velocity', 'm/s'),
    item('kinematic-viscosity', '运动黏度 ν', kinematicViscosity, 'kinematicViscosity', 'm^2/s'),
  )

  if (method) {
    intermediates.push({
      id: 'friction-method',
      label: '摩擦系数方法',
      text: method,
    })
  }

  if (warnings.length) {
    intermediates.push({
      id: 'range-warning',
      label: '适用范围提示',
      text: warnings.join('；'),
    })
  }

  const boundaryLayerPlan = createBoundaryLayerPlan({
    firstLayerHeight: fullThickness,
    growthRate: gridSettings?.growthRate,
    recommendationMethod: gridSettings?.recommendationMethod,
    targetTotalThickness: gridSettings?.targetTotalThickness,
    layerCount: gridSettings?.layerCount,
    automaticTotalThickness,
    automaticThicknessLabel,
    pipeDiameter,
  })

  return {
    outputs: [
      item(
        outputs[0].id,
        outputs[0].label,
        centerDistance,
        outputs[0].unitCategory,
        outputs[0].defaultUnit,
      ),
      item(
        outputs[1].id,
        outputs[1].label,
        fullThickness,
        outputs[1].unitCategory,
        outputs[1].defaultUnit,
      ),
    ],
    intermediates,
    summary: definition.notes?.slice(0, 3) ?? [],
    boundaryLayerPlan,
  }
}

interface BoundaryLayerGridSettings {
  growthRate: number
  recommendationMethod: string
  targetTotalThickness?: number
  layerCount?: number
}

function readBoundaryLayerGridSettings(inputs: BaseInputs): BoundaryLayerGridSettings {
  return {
    growthRate: optionalPositive(inputs['grid-growth-rate'], '增长率 r') ?? 1.2,
    recommendationMethod:
      optionalSelectValue(inputs['grid-recommendation-method']) ??
      'auto-total-thickness',
    targetTotalThickness: optionalPositive(
      inputs['target-total-thickness'],
      '目标总厚度 H',
    ),
    layerCount: optionalPositiveInteger(inputs['grid-layer-count'], '层数 n'),
  }
}

function estimateFlatPlateFrictionCoefficient(
  inputs: BaseInputs,
  reynolds: number,
) {
  const methodId =
    optionalSelectValue(inputs['flat-plate-friction-method']) ??
    'flat-plate-turbulent'
  const warnings: string[] = []

  if (methodId === 'flat-plate-laminar') {
    if (reynolds >= 5e5) {
      warnings.push('当前 Re_x 已超过常用平板层流转捩参考值，应谨慎使用层流局部公式')
    }

    return {
      coefficient: 0.664 / Math.sqrt(reynolds),
      method: '层流平板局部摩擦系数：Cf,x = 0.664 / √Re_x',
      methodId,
      warnings,
    }
  }

  if (methodId === 'flat-plate-custom') {
    return {
      coefficient: positive(inputs['friction-coefficient'], '壁面摩擦系数 Cf'),
      method: '用户自定义平板壁面摩擦系数 Cf',
      methodId,
      warnings,
    }
  }

  if (methodId !== 'flat-plate-turbulent') {
    throw new Error('请选择有效的平板摩擦系数公式。')
  }

  if (reynolds <= 5e5) {
    warnings.push('当前 Re_x 未超过常用平板转捩参考值，应谨慎使用湍流局部公式')
  }

  return {
    coefficient: 0.0592 * reynolds ** -0.2,
    method: '湍流平板局部摩擦系数：Cf,x = 0.0592 Re_x^(-1/5)',
    methodId,
    warnings,
  }
}

function estimateFlatPlateBoundaryLayerThickness(
  methodId: string,
  length: number,
  reynolds: number,
) {
  if (methodId === 'flat-plate-laminar') {
    return 5 * length / Math.sqrt(reynolds)
  }

  if (methodId === 'flat-plate-turbulent') {
    return 0.37 * length / reynolds ** 0.2
  }

  return undefined
}

function estimatePipeFrictionCoefficient(
  inputs: BaseInputs,
  density: number,
  velocity: number,
  diameter: number,
  viscosity: number,
) {
  const methodId =
    optionalSelectValue(inputs['pipe-friction-method']) ??
    'pipe-blasius-darcy'
  const reynolds = density * velocity * diameter / viscosity
  const warnings: string[] = []
  let darcyFrictionFactor: number
  let method: string

  if (methodId === 'pipe-laminar-darcy') {
    if (reynolds >= 2300) {
      warnings.push('当前 Re_D 不在圆管层流常用范围 Re_D < 2300 内')
    }
    darcyFrictionFactor = 64 / reynolds
    method = '管道层流 Darcy 摩阻系数：f = 64 / Re_D'
  } else if (methodId === 'pipe-blasius-darcy') {
    if (reynolds <= 4000 || reynolds >= 1e5) {
      warnings.push('Blasius 光滑管估算通常用于 4000 < Re_D < 1e5')
    }
    darcyFrictionFactor = 0.3164 * reynolds ** -0.25
    method = '光滑管湍流 Blasius Darcy 摩阻系数：f = 0.3164 Re_D^(-1/4)'
  } else if (methodId === 'pipe-custom-darcy') {
    darcyFrictionFactor = positive(inputs['darcy-friction-factor'], 'Darcy 摩阻系数 f')
    method = '用户自定义 Darcy 摩阻系数 f'
  } else if (methodId === 'pipe-custom-fanning') {
    const fanningCoefficient = positive(
      inputs['fanning-friction-coefficient'],
      'Fanning 摩擦系数 Cf',
    )
    darcyFrictionFactor = 4 * fanningCoefficient
    method = '用户自定义 Fanning 摩擦系数 Cf'
  } else {
    throw new Error('请选择有效的管道摩阻估算方式。')
  }

  return {
    reynolds,
    darcyFrictionFactor,
    fanningCoefficient: darcyFrictionFactor / 4,
    method,
    warnings,
  }
}

function calculateNusselt(inputs: BaseInputs, definition: CalculatorDefinition) {
  const heatTransferCoefficient = nonNegative(
    inputs['heat-transfer-coefficient'],
    '对流换热系数',
  )
  const length = nonNegative(inputs['characteristic-length'], '特征长度')
  const thermalConductivity = positive(inputs['thermal-conductivity'], '导热系数')
  const value = (heatTransferCoefficient * length) / thermalConductivity

  return result(definition, value)
}

function calculateMeanVelocity(inputs: BaseInputs, definition: CalculatorDefinition) {
  const volumeFlowRate = nonNegative(inputs['volume-flow-rate'], '体积流量')
  const area = positive(inputs.area, '截面积')
  const value = volumeFlowRate / area

  return result(definition, value)
}

function calculateMassFlowRate(inputs: BaseInputs, definition: CalculatorDefinition) {
  const density = positive(inputs.density, '密度')
  const volumeFlowRate = nonNegative(inputs['volume-flow-rate'], '体积流量')
  const value = density * volumeFlowRate

  return result(definition, value)
}

function calculateHeatFlux(inputs: BaseInputs, definition: CalculatorDefinition) {
  const heatRate = nonNegative(inputs['heat-rate'], '传热率')
  const area = positive(inputs.area, '面积')
  const value = heatRate / area

  return result(definition, value)
}

function calculateThermalResistance(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const deltaT = nonNegative(inputs['temperature-difference'], '温差')
  const heatRate = positive(inputs['heat-rate'], '传热率')
  const value = deltaT / heatRate

  return result(definition, value)
}

function calculateConvectiveHeatTransfer(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const heatTransferCoefficient = nonNegative(
    inputs['heat-transfer-coefficient'],
    '对流换热系数',
  )
  const area = nonNegative(inputs.area, '面积')
  const deltaT = nonNegative(inputs['temperature-difference'], '温差')
  const value = heatTransferCoefficient * area * deltaT

  return result(definition, value)
}

function calculateConductionHeatTransfer(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const thermalConductivity = positive(
    inputs['thermal-conductivity'],
    '导热系数',
  )
  const area = positive(inputs.area, '面积')
  const deltaT = nonNegative(inputs['temperature-difference'], '温差')
  const thickness = positive(inputs.thickness, '厚度')
  const value = thermalConductivity * area * deltaT / thickness

  return result(definition, value, [
    item('thermal-resistance', '导热热阻', thickness / (thermalConductivity * area), 'thermalResistance', 'K/W'),
  ])
}

function calculateTemperatureRise(
  inputs: BaseInputs,
  definition: CalculatorDefinition,
) {
  const power = nonNegative(inputs.power, '功率')
  const time = nonNegative(inputs.time, '时间')
  const mass = positive(inputs.mass, '质量')
  const specificHeat = positive(inputs['specific-heat'], '比热')
  const heatInput = power * time
  const value = heatInput / (mass * specificHeat)

  return result(definition, value, [
    item('heat-input', '输入热量', heatInput, 'energy', 'J'),
  ])
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

function positive(value: BaseInputValue, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label}必须大于 0。`)
  }
  return value
}

function nonNegative(value: BaseInputValue, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`${label}不能小于 0。`)
  }
  return value
}

function positiveInteger(value: BaseInputValue, label: string) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`${label}必须是正整数。`)
  }
  return value
}

function optionalPositive(value: BaseInputValue | undefined, label: string) {
  if (value === undefined) {
    return undefined
  }

  return positive(value, label)
}

function optionalPositiveInteger(value: BaseInputValue | undefined, label: string) {
  if (value === undefined) {
    return undefined
  }

  return positiveInteger(value, label)
}

function selectValue(value: BaseInputValue, label: string) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`请选择${label}。`)
  }

  return value
}

function optionalSelectValue(value: BaseInputValue | undefined) {
  if (value === undefined) {
    return undefined
  }

  return typeof value === 'string' && value.length > 0 ? value : undefined
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
