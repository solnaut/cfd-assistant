import type { CalculatorDefinition } from '../../models/calculator'

export const calculatorDefinitionTemplate: CalculatorDefinition = {
  id: 'todo-calculator-id',
  name: 'TODO: 计算器名称',
  category: 'TODO: 分类',
  summary: 'TODO: 用一句话说明用途。不得写入未经审核的工程结论。',
  status: 'todo',
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
  validationStatus: 'TODO: 填写验证状态和验证数据来源。',
  formulaTodo: 'TODO: 填写公式、适用范围、限制条件和需要确认的问题。',
}
