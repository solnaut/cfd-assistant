import { makeControl, type ControlInput } from './controlHelpers'
import type { FluentMockDialog } from '../fluentTypes'
import { timeAdvancementDefaults } from './timeAdvancement'

type Setting = Pick<ControlInput, 'id' | 'label' | 'controlType' | 'value' | 'defaultSelected' | 'dialogId' | 'options' | 'visibleWhen' | 'group'>

export function solutionDialog(
  id: string,
  title: string,
  module: string,
  subtitle: string,
  settings: Setting[],
): FluentMockDialog {
  return {
    id, title, module, subtitle,
    controls: settings.map((setting) => makeControl({
      ...setting, parentId: id, module, region: '模拟窗口',
    })),
  }
}

export const solutionBranchDialogs: FluentMockDialog[] = [
  solutionDialog('fluent-database-materials-dialog', 'Fluent Database Materials', 'Materials',
    '选择材料类别并将一个示例材料名称加入当前案例。物性由真实案例中的材料数据决定。', [
      { id: 'database-material-type', label: 'Material Type', group: 'Database', controlType: 'select', value: 'fluid', options: ['fluid', 'solid'] },
      { id: 'database-fluid-material', label: 'Fluent Fluid Materials', group: 'Database', controlType: 'select', value: 'nitrogen', options: ['air', 'water-liquid', 'nitrogen', 'carbon-dioxide'], visibleWhen: [{ controlId: 'database-material-type', values: ['fluid'] }] },
      { id: 'database-solid-material', label: 'Fluent Solid Materials', group: 'Database', controlType: 'select', value: 'copper', options: ['aluminum', 'copper', 'steel'], visibleWhen: [{ controlId: 'database-material-type', values: ['solid'] }] },
      { id: 'database-material-copy', label: 'Copy', group: 'Database', controlType: 'button' },
    ]),
  solutionDialog('adaptive-time-stepping-dialog', 'Adaptive Time Stepping', 'Run Calculation',
    '设定自适应步长的上下限和单步变化因子。计算演示使用输入值检查设置。', [
      { id: 'run-min-time-step', label: 'Minimum Time Step Size (s)', group: 'Time Step Limits', controlType: 'field', value: timeAdvancementDefaults['run-min-time-step'] },
      { id: 'run-max-time-step', label: 'Maximum Time Step Size (s)', group: 'Time Step Limits', controlType: 'field', value: timeAdvancementDefaults['run-max-time-step'] },
      { id: 'run-min-change-factor', label: 'Minimum Step Change Factor', group: 'Step Change Factor', controlType: 'field', value: timeAdvancementDefaults['run-min-change-factor'] },
      { id: 'run-max-change-factor', label: 'Maximum Step Change Factor', group: 'Step Change Factor', controlType: 'field', value: timeAdvancementDefaults['run-max-change-factor'] },
    ]),
  solutionDialog('fmg-initialization-dialog', 'FMG Initialization', 'Initialization',
    '从已有初始流场开始，设置 Full Multigrid 初始化参数。', [
      { id: 'fmg-levels', label: 'Number of Levels', group: 'FMG Controls', controlType: 'field', value: '5' },
      { id: 'fmg-courant', label: 'Courant Number', group: 'FMG Controls', controlType: 'field', value: '0.75' },
      { id: 'fmg-initialize', label: 'Initialize', group: 'FMG Controls', controlType: 'button' },
    ]),
  solutionDialog('data-file-quantities-dialog', 'Data File Quantities', 'Calculation Activities',
    '选择要写入旧版 Fluent data 文件的附加量。标准量会随文件保存。', [
      { id: 'data-quantities-velocity', label: 'Velocity Magnitude', group: 'Additional Quantities', controlType: 'checkbox' },
      { id: 'data-quantities-mach', label: 'Mach Number', group: 'Additional Quantities', controlType: 'checkbox' },
      { id: 'data-quantities-total-pressure', label: 'Total Pressure', group: 'Additional Quantities', controlType: 'checkbox' },
    ]),
]

for (const kind of ['plot', 'file'] as const) {
  const prefix = 'report-' + kind
  const title = kind === 'plot' ? 'Report Plot' : 'Report File'
  solutionBranchDialogs.push(
    solutionDialog(prefix + 's-dialog', title + 's', 'Monitors',
      kind === 'plot' ? '选择已有报告曲线查看采样结果，或创建新曲线。' : '查看已配置的报告文件，或添加一个新的输出设置。', [
        { id: prefix + '-existing', label: title + ' Name', group: title, controlType: 'select' },
        { id: prefix + '-new', label: 'New…', group: title, controlType: 'button', dialogId: prefix + '-editor-dialog' },
        ...(kind === 'plot' ? [{ id: 'report-plot-display', label: 'Display', group: title, controlType: 'button' as const }] : []),
      ]),
    { ...solutionDialog(prefix + '-editor-dialog', 'New ' + title, 'Monitors',
      '先保存报告定义，再选择此输出要跟踪的报告量及采样频率。', [
        { id: prefix + '-name', label: 'Name', group: title, controlType: 'field' },
        { id: prefix + '-active', label: 'Active', group: title, controlType: 'checkbox', defaultSelected: true },
        { id: prefix + '-definition', label: 'Report Definition', group: title, controlType: 'select' },
        { id: prefix + '-destination', label: kind === 'plot' ? 'Plot Title' : 'File Name', group: title, controlType: 'field' },
        { id: prefix + '-every', label: 'Get Data Every', group: title, controlType: 'field', value: '1' },
        { id: prefix + '-basis', label: 'Frequency Type', group: title, controlType: 'select', value: 'Iterations' },
      ]), okOnly: true },
  )
}
