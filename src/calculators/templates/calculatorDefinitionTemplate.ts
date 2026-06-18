import type { CalculatorDefinition } from '../../models/calculator'

export const calculatorDefinitionTemplate: CalculatorDefinition = {
  id: 'todo-calculator-id',
  name: 'TODO: 计算器名称',
  shortName: 'TODO: 短名称',
  categoryId: 'TODO: 分类 ID',
  summary: 'TODO: 用一句话说明用途。不得写入未经审核的工程结论。',
  availability: 'planned',
  inputs: [
    {
      id: 'todo-input-id',
      label: 'TODO: 输入参数名称',
      quantity: 'TODO: 物理量类型',
      defaultUnit: 'TODO: 默认单位',
      required: true,
    },
  ],
  outputs: [
    {
      id: 'todo-output-id',
      label: 'TODO: 输出结果名称',
      quantity: 'TODO: 物理量类型',
      defaultUnit: 'TODO: 默认单位',
    },
  ],
  resultPreview: ['TODO: 结果展示项'],
}
