import type { CalculatorDefinition } from '../models/calculator'

export const calculatorCatalog: CalculatorDefinition[] = [
  {
    id: 'y-plus-first-layer-height',
    name: 'y+ 与第一层网格高度',
    category: 'Mesh',
    summary: 'TODO: 等待用户提供并审核公式、适用范围和验证案例。',
    status: 'todo',
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
    ],
    outputs: [
      {
        id: 'first-layer-height',
        label: '第一层网格高度',
        quantity: 'length',
        defaultUnit: 'm',
      },
    ],
    validationStatus: 'TODO: 等待验证数据',
    formulaTodo: 'TODO: 用户确认摩擦速度/壁面剪切估算方法后实现。',
  },
  {
    id: 'cfl-time-step',
    name: 'CFL 与时间步长',
    category: 'Transient',
    summary: 'TODO: 等待用户提供并审核公式、适用范围和验证案例。',
    status: 'todo',
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
    ],
    outputs: [
      {
        id: 'time-step',
        label: '时间步长',
        quantity: 'time',
        defaultUnit: 's',
      },
    ],
    validationStatus: 'TODO: 等待验证数据',
    formulaTodo: 'TODO: 用户确认 CFL 定义、速度尺度和显式/隐式适用边界后实现。',
  },
  {
    id: 'reynolds-number',
    name: 'Reynolds 数',
    category: 'Dimensionless',
    summary: 'TODO: 等待用户提供并审核公式、适用范围和验证案例。',
    status: 'todo',
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
    ],
    outputs: [
      {
        id: 'reynolds-number',
        label: 'Reynolds 数',
        quantity: 'dimensionless',
      },
    ],
    validationStatus: 'TODO: 等待验证数据',
    formulaTodo: 'TODO: 用户确认采用动力黏度或运动黏度输入形式后实现。',
  },
]
