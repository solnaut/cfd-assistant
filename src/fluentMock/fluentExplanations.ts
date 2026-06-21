import { allDialogControls } from './fluentDialogs'
import { allMainControls } from './fluentControls'
import type { FluentMockControl, FluentMockExplanation } from './fluentTypes'

type ExplanationOverride = Partial<Omit<FluentMockExplanation, 'id'>>

const overrides: Record<string, ExplanationOverride> = {
  'tree-general-explanation': {
    title: '一般',
    location: '设置 / 一般',
    summary: 'General 任务页集中放置求解器类型、时间方式和重力等全局设置。',
    purpose: '帮助用户在导入网格后先确认求解框架和基础物理开关。',
    whenToUse: '开始设置算例时通常先检查此页面，再进入模型、材料和边界条件。',
    commonMistakes: '常见误解是跳过单位、网格检查和时间方式确认，导致后续设置含义偏移。',
    relatedControls: ['general-pressure-based', 'general-steady', 'general-units'],
    sourceStatus: 'draft-public-sources',
  },
  'tree-boundary-conditions-explanation': {
    title: '边界条件',
    location: '设置 / 边界条件',
    summary: '边界条件用于定义入口、出口、壁面等区域与外部环境或相邻区域的相互作用。',
    purpose: '确保求解域有明确的流动、热量和湍流输入输出约束。',
    whenToUse: '材料和模型确定后，需要逐个检查所有边界区域的类型和参数。',
    commonMistakes: '不要把 velocity inlet、pressure outlet 和 wall 的输入含义混用；回流条件也需要关注。',
    relatedControls: ['bc-velocity-inlet', 'bc-pressure-outlet', 'bc-wall'],
    sourceStatus: 'draft-public-sources',
  },
  'ribbon-mesh-check-explanation': {
    title: '网格检查',
    location: 'Ribbon → 区域 → 网格',
    summary: '用于检查网格拓扑和基础完整性，是读入网格后的常规第一步。',
    purpose: '发现负体积、连通性异常、尺寸范围异常等会阻碍求解的问题。',
    whenToUse: '导入、缩放或修改网格后，建议在正式设置物理模型前执行。',
    commonMistakes: '网格能显示不代表网格可用于求解；质量报告和拓扑检查需要分开理解。',
    relatedControls: ['mesh-check-negative-volume', 'mesh-quality-orthogonal'],
    sourceStatus: 'draft-public-sources',
  },
  'general-check-explanation': {
    title: '网格检查',
    location: '任务页面 → 一般 → 网格',
    summary: 'General 页面中的网格检查入口用于快速启动基础网格检查。',
    purpose: '确认导入网格在求解前没有明显拓扑或尺寸错误。',
    whenToUse: '读入网格、缩放网格或替换网格后使用。',
    commonMistakes: '不要把“检查通过”理解为网格质量已经足够好；仍需查看偏斜率、正交质量等指标。',
    relatedControls: ['mesh-check-negative-volume', 'general-report-quality'],
    sourceStatus: 'draft-public-sources',
  },
  'general-pressure-based-explanation': {
    title: '基于压力求解器',
    location: '任务页面 → 一般 → 求解器 → 类型',
    summary: '压力基求解框架是许多不可压缩和低速可压缩流动算例的常见选择。',
    purpose: '选择压力和速度变量的耦合求解框架，影响后续方法与控制选项。',
    whenToUse: '内部流动、外部低速流动和常见传热流动通常会从该选项开始评估。',
    commonMistakes: '它不是“只适用于不可压缩”的简单开关；具体选择仍需结合马赫数、密度变化和物理模型。',
    relatedControls: ['general-density-based', 'methods-pressure-velocity'],
    sourceStatus: 'draft-public-sources',
  },
  'general-density-based-explanation': {
    title: '基于密度求解器',
    location: '任务页面 → 一般 → 求解器 → 类型',
    summary: '密度基求解框架更常见于高速可压缩流动教学场景。',
    purpose: '强调密度、动量和能量方程耦合推进的求解框架。',
    whenToUse: '高速喷管、激波或强可压缩效应问题会考虑该方向。',
    commonMistakes: '不要只因为存在气体就选择密度基；低速气体流动常常仍可使用压力基框架。',
    relatedControls: ['general-pressure-based', 'general-transient'],
    sourceStatus: 'draft-public-sources',
  },
  'graphics-select-explanation': {
    title: '图形窗口选择工具',
    location: '图形窗口 → 左侧工具栏',
    summary: '用于在图形窗口中选择可视对象、边界或显示元素。',
    purpose: '帮助用户定位视图区中的几何、边界或图形对象。',
    whenToUse: '需要查看某个边界、表面或后处理对象时使用。',
    commonMistakes: '图形窗口选择只改变当前界面交互对象，不等同于改变求解边界条件。',
    relatedControls: ['graphics-selection-filter', 'graphics-fit'],
    sourceStatus: 'natural-placeholder',
  },
  'console-area-explanation': {
    title: '控制台',
    location: '底部控制台',
    summary: '控制台显示读入网格、检查、初始化和计算过程中的文本信息。',
    purpose: '让用户看到软件反馈、警告和命令提示，是排查设置问题的重要区域。',
    whenToUse: '执行检查、初始化、迭代或出现异常时，应同时查看控制台信息。',
    commonMistakes: '不要只看图形窗口；控制台中的警告往往能解释为什么计算没有按预期进行。',
    relatedControls: ['ribbon-mesh-check', 'run-calculate'],
    sourceStatus: 'draft-public-sources',
  },
  'general-units-explanation': {
    title: '单位设置',
    location: '任务页面 → 一般 → 网格',
    summary: '单位窗口用于查看或调整当前模型的显示单位。',
    purpose: '确认导入网格和输入参数使用一致的长度、压力、温度等单位。',
    whenToUse: '导入网格后发现尺寸不符合预期，或需要统一工程输入单位时使用。',
    commonMistakes: '单位显示与实际网格缩放要分清；必要时还要检查缩放工具。',
    relatedControls: ['units-length', 'mesh-scale-factor'],
    sourceStatus: 'draft-public-sources',
  },
  'units-length-explanation': {
    title: '长度单位',
    location: '模拟窗口 → 单位设置',
    summary: '长度单位控制界面中几何尺寸和距离量的显示方式。',
    purpose: '让用户用熟悉的工程单位查看网格尺寸和几何范围。',
    whenToUse: '导入来自 CAD 或网格软件的模型后，应核对长度单位与实际尺寸是否一致。',
    commonMistakes: '只改显示单位不能自动修复错误缩放；尺寸错了要使用缩放或重新导入正确单位。',
    relatedControls: ['mesh-scale-factor', 'units-restore-si'],
    sourceStatus: 'draft-public-sources',
  },
  'general-report-quality-explanation': {
    title: '网格质量报告',
    location: '任务页面 → 一般 → 网格',
    summary: '报告质量入口用于查看网格质量统计，辅助判断网格是否需要修复。',
    purpose: '快速定位正交质量、偏斜率、长宽比等影响稳定性的指标。',
    whenToUse: '网格检查后、求解前，或发现收敛困难时重新查看。',
    commonMistakes: '不要只看一个指标；不同网格类型和物理问题对质量指标的敏感性不同。',
    relatedControls: ['mesh-quality-orthogonal', 'mesh-quality-skewness'],
    sourceStatus: 'draft-public-sources',
  },
  'mesh-quality-orthogonal-explanation': {
    title: '最小正交质量',
    location: '模拟窗口 → 网格质量报告',
    summary: '正交质量用于反映单元方向与面法向、相邻单元连接关系的合理程度。',
    purpose: '帮助判断网格是否可能导致离散误差增加或求解稳定性变差。',
    whenToUse: '质量报告中最小值过低时，应定位相应区域并考虑局部重构或加密策略。',
    commonMistakes: '不要只凭一个固定阈值判断所有问题；还要结合偏斜率、边界层和流动区域重要性。',
    relatedControls: ['mesh-quality-skewness', 'mesh-check-negative-volume'],
    sourceStatus: 'draft-public-sources',
  },
  'models-energy-explanation': {
    title: 'Energy 模型',
    location: '设置 / 模型 / Energy',
    summary: 'Energy 入口用于教学说明能量方程与传热设置的关系。',
    purpose: '在涉及温度、热通量、导热或可压缩效应时提醒用户检查能量方程。',
    whenToUse: '存在传热、温度边界、热源或可压缩热效应时需要重点关注。',
    commonMistakes: '设置了温度边界但忘记打开能量相关模型，会导致预期的热计算没有发生。',
    relatedControls: ['energy-enable', 'wall-thermal'],
    sourceStatus: 'draft-public-sources',
  },
  'models-viscous-explanation': {
    title: 'Viscous 模型',
    location: '设置 / 模型 / Viscous',
    summary: 'Viscous 入口用于选择层流或湍流模型的教学结构。',
    purpose: '让用户理解流动模型选择会影响近壁处理、入口湍流参数和收敛表现。',
    whenToUse: '设置流动算例时，需要根据 Reynolds 数、壁面分辨率和工程目标选择。',
    commonMistakes: '不要只按默认选项运行；湍流模型和 y+ 网格策略需要配合。',
    relatedControls: ['viscous-kepsilon', 'viscous-kw-sst'],
    sourceStatus: 'draft-public-sources',
  },
}

const allControls = [...allMainControls, ...allDialogControls]

export const fluentExplanations: FluentMockExplanation[] = allControls.map(
  (control) => createExplanation(control, overrides[control.explanationId]),
)

export const fluentExplanationById = new Map(
  fluentExplanations.map((entry) => [entry.id, entry]),
)

function createExplanation(
  control: FluentMockControl,
  override: ExplanationOverride = {},
): FluentMockExplanation {
  const title = override.title ?? control.labelZh

  return {
    id: control.explanationId,
    title,
    location:
      override.location ??
      `${control.region}${control.group ? ` → ${control.group}` : ''}`,
    controlType: override.controlType ?? control.controlType,
    summary:
      override.summary ??
      `${control.labelZh} 是 ${control.module} 模块中的教学控件，用于帮助理解该位置的常见设置逻辑。`,
    purpose:
      override.purpose ??
      '本模拟器只展示学习用途的界面结构和说明，不连接 Fluent，也不执行真实求解。',
    whenToUse:
      override.whenToUse ??
      '当你在真实工作流中看到相同类型的入口时，可以先通过这里理解它通常服务于哪一类设置。',
    commonMistakes:
      override.commonMistakes ??
      '不要把该教学控件理解为真实软件操作；后续仍需结合项目算例和官方文档核对具体设置。',
    relatedControls: override.relatedControls ?? [],
    sourceStatus: override.sourceStatus ?? 'natural-placeholder',
    futureWindowNotes:
      override.futureWindowNotes ??
      (control.dialogId
        ? '该控件已接入初版模拟窗口，后续可根据用户提供的窗口截图继续细化。'
        : '后续可以继续补充更详细的窗口结构或截图替代草图。'),
  }
}
