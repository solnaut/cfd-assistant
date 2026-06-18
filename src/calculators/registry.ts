import type {
  CalculatorCategory,
  CalculatorDefinition,
} from '../models/calculator'

export const calculatorCategories: CalculatorCategory[] = [
  {
    id: 'near-wall-mesh',
    name: '近壁面与网格',
    eyebrow: 'Wall & mesh',
    description: '组织近壁面分辨率、第一层高度和边界层网格相关计算流程。',
    icon: 'mesh',
  },
  {
    id: 'transient-time-step',
    name: '瞬态与时间步长',
    eyebrow: 'Transient',
    description: '围绕 CFL、特征尺寸和时间步长搭建瞬态计算辅助入口。',
    icon: 'time',
  },
  {
    id: 'dimensionless-numbers',
    name: '无量纲数',
    eyebrow: 'Dimensionless',
    description: '集中管理 Reynolds、Mach、Prandtl、Peclet、Rayleigh 等常用量纲分析入口。',
    icon: 'dimensionless',
  },
  {
    id: 'flow-piping',
    name: '流动与管路',
    eyebrow: 'Flow & piping',
    description: '预留管路、压降、水力直径等工程计算工具的分类位置。',
    icon: 'pipe',
  },
  {
    id: 'heat-transfer',
    name: '传热与热工',
    eyebrow: 'Heat transfer',
    description: '预留热工参数、换热与热物性辅助计算入口。',
    icon: 'heat',
  },
]

export const calculatorCatalog: CalculatorDefinition[] = [
  {
    id: 'y-plus-first-layer-height',
    name: 'y+ 与第一层网格高度',
    shortName: 'y+ 第一层高度',
    categoryId: 'near-wall-mesh',
    summary: '用于整理目标 y+、参考速度和物性等输入，为近壁面网格设计提供计算入口。',
    availability: 'ready-for-structure',
    inputs: [
      {
        id: 'target-y-plus',
        label: '目标 y+',
        quantity: 'dimensionless',
        required: true,
      },
      {
        id: 'reference-velocity',
        label: '参考速度',
        quantity: 'velocity',
        defaultUnit: 'm/s',
        required: true,
      },
      {
        id: 'fluid-property',
        label: '流体物性',
        quantity: 'property-set',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'first-layer-height',
        label: '第一层网格高度',
        quantity: 'length',
        defaultUnit: 'm',
      },
      {
        id: 'intermediate-values',
        label: '关键中间量',
        quantity: 'calculation-detail',
      },
    ],
    resultPreview: ['第一层高度', '关键中间量', '单位换算结果'],
  },
  {
    id: 'boundary-layer-mesh',
    name: '边界层网格计算',
    shortName: '边界层网格',
    categoryId: 'near-wall-mesh',
    summary: '用于组织首层高度、增长率、层数和总厚度等边界层网格参数。',
    availability: 'planned',
    inputs: [
      {
        id: 'first-layer-height',
        label: '第一层高度',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
      {
        id: 'growth-rate',
        label: '增长率',
        quantity: 'dimensionless',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'total-thickness',
        label: '边界层总厚度',
        quantity: 'length',
        defaultUnit: 'm',
      },
    ],
    resultPreview: ['总厚度', '层高序列', '层数校核'],
  },
  {
    id: 'cfl-time-step',
    name: 'CFL 与时间步长',
    shortName: 'CFL 时间步长',
    categoryId: 'transient-time-step',
    summary: '用于组织网格尺寸、速度尺度和目标 CFL，形成瞬态时间步长计算入口。',
    availability: 'ready-for-structure',
    inputs: [
      {
        id: 'cell-size',
        label: '特征网格尺寸',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
      {
        id: 'flow-speed',
        label: '流速',
        quantity: 'velocity',
        defaultUnit: 'm/s',
        required: true,
      },
      {
        id: 'target-cfl',
        label: '目标 CFL',
        quantity: 'dimensionless',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'time-step',
        label: '时间步长',
        quantity: 'time',
        defaultUnit: 's',
      },
    ],
    resultPreview: ['建议时间步长', '单位换算结果', '输入校核信息'],
  },
  {
    id: 'reynolds-number',
    name: 'Reynolds 数',
    shortName: 'Reynolds',
    categoryId: 'dimensionless-numbers',
    summary: '用于整理密度、速度、特征长度和黏度等输入，形成 Reynolds 数计算入口。',
    availability: 'ready-for-structure',
    inputs: [
      {
        id: 'density',
        label: '密度',
        quantity: 'density',
        defaultUnit: 'kg/m^3',
        required: true,
      },
      {
        id: 'characteristic-length',
        label: '特征长度',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
      {
        id: 'viscosity',
        label: '黏度',
        quantity: 'viscosity',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'reynolds-number',
        label: 'Reynolds 数',
        quantity: 'dimensionless',
      },
    ],
    resultPreview: ['Reynolds 数', '输入物性摘要'],
  },
  {
    id: 'mach-number',
    name: 'Mach 数',
    shortName: 'Mach',
    categoryId: 'dimensionless-numbers',
    summary: '用于组织流速和声速相关输入，形成 Mach 数计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'flow-speed',
        label: '流速',
        quantity: 'velocity',
        defaultUnit: 'm/s',
        required: true,
      },
      {
        id: 'speed-of-sound',
        label: '声速',
        quantity: 'velocity',
        defaultUnit: 'm/s',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'mach-number',
        label: 'Mach 数',
        quantity: 'dimensionless',
      },
    ],
    resultPreview: ['Mach 数', '速度尺度摘要'],
  },
  {
    id: 'prandtl-number',
    name: 'Prandtl 数',
    shortName: 'Prandtl',
    categoryId: 'dimensionless-numbers',
    summary: '用于整理热物性输入，形成 Prandtl 数计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'dynamic-viscosity',
        label: '动力黏度',
        quantity: 'viscosity',
        required: true,
      },
      {
        id: 'thermal-property',
        label: '热物性参数',
        quantity: 'property-set',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'prandtl-number',
        label: 'Prandtl 数',
        quantity: 'dimensionless',
      },
    ],
    resultPreview: ['Prandtl 数', '热物性摘要'],
  },
  {
    id: 'peclet-number',
    name: 'Peclet 数',
    shortName: 'Peclet',
    categoryId: 'dimensionless-numbers',
    summary: '用于组织速度、长度和扩散相关输入，形成 Peclet 数计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'reference-velocity',
        label: '参考速度',
        quantity: 'velocity',
        defaultUnit: 'm/s',
        required: true,
      },
      {
        id: 'characteristic-length',
        label: '特征长度',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'peclet-number',
        label: 'Peclet 数',
        quantity: 'dimensionless',
      },
    ],
    resultPreview: ['Peclet 数', '扩散尺度摘要'],
  },
  {
    id: 'rayleigh-number',
    name: 'Rayleigh 数',
    shortName: 'Rayleigh',
    categoryId: 'dimensionless-numbers',
    summary: '用于整理温差、长度尺度和物性输入，形成 Rayleigh 数计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'temperature-difference',
        label: '温差',
        quantity: 'temperature',
        required: true,
      },
      {
        id: 'characteristic-length',
        label: '特征长度',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'rayleigh-number',
        label: 'Rayleigh 数',
        quantity: 'dimensionless',
      },
    ],
    resultPreview: ['Rayleigh 数', '热浮升相关输入摘要'],
  },
  {
    id: 'pipe-pressure-drop',
    name: '管道压降',
    shortName: '管道压降',
    categoryId: 'flow-piping',
    summary: '用于预留管路流动、压降和阻力相关计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'pipe-length',
        label: '管长',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
      {
        id: 'flow-rate',
        label: '流量',
        quantity: 'flow-rate',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'pressure-drop',
        label: '压降',
        quantity: 'pressure',
      },
    ],
    resultPreview: ['压降', '流动参数摘要'],
  },
  {
    id: 'hydraulic-diameter',
    name: '水力直径',
    shortName: '水力直径',
    categoryId: 'flow-piping',
    summary: '用于预留非圆截面通道的水力直径计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'area',
        label: '截面积',
        quantity: 'area',
        required: true,
      },
      {
        id: 'wetted-perimeter',
        label: '湿周',
        quantity: 'length',
        defaultUnit: 'm',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'hydraulic-diameter',
        label: '水力直径',
        quantity: 'length',
        defaultUnit: 'm',
      },
    ],
    resultPreview: ['水力直径', '几何参数摘要'],
  },
  {
    id: 'heat-transfer-setup',
    name: '传热参数整理',
    shortName: '传热参数',
    categoryId: 'heat-transfer',
    summary: '用于预留传热相关输入、结果和工程说明的计算入口。',
    availability: 'planned',
    inputs: [
      {
        id: 'temperature',
        label: '温度',
        quantity: 'temperature',
        required: true,
      },
      {
        id: 'thermal-property',
        label: '热物性参数',
        quantity: 'property-set',
        required: true,
      },
    ],
    outputs: [
      {
        id: 'heat-transfer-result',
        label: '传热相关结果',
        quantity: 'calculation-detail',
      },
    ],
    resultPreview: ['热工参数摘要', '结果区块'],
  },
]

export function getCalculatorCategory(categoryId: string) {
  return calculatorCategories.find((category) => category.id === categoryId) ?? null
}

export function getCalculatorsByCategory(categoryId: string) {
  return calculatorCatalog.filter(
    (calculator) => calculator.categoryId === categoryId,
  )
}

export function getCalculator(calculatorId: string) {
  return (
    calculatorCatalog.find((calculator) => calculator.id === calculatorId) ??
    null
  )
}
