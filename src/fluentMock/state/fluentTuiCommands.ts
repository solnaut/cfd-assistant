import type { FluentSimAction, FluentSimState } from './fluentSimState'

export const tuiPresetCommands = [
  '/mesh/check',
  '/mesh/quality',
  '/solve/check-case',
  '/solve/initialize/hyb-initialization',
  '/solve/iterate 50',
  '/report/fluxes/mass-flow',
  'help',
  'clear',
] as const

export const solutionTuiCatalog: ReadonlyArray<{ command: string; description: string }> = [
  { command: '/mesh/check', description: '检查网格连通性、体积与边界面方向' },
  { command: '/mesh/quality', description: '报告最小正交质量、最大偏斜率与长宽比' },
  { command: '/mesh/smooth-mesh', description: '对高偏斜网格执行光顺并提升正交质量' },
  { command: '/mesh/polyhedra/convert-domain', description: '将当前体网格转换为 Polyhedra 多面体网格' },
  { command: '/mesh/reorder/reorder-domain', description: '按 Reverse Cuthill-McKee 算法重排序计算域' },
  { command: '/solve/check-case', description: '执行算例设置完整性诊断与报错检查' },
  { command: '/define/models/energy yes', description: '开启或关闭能量方程（支持 yes / no 参数）' },
  { command: '/define/models/multiphase', description: '切换多相流模型（Off / VOF）' },
  { command: '/define/models/radiation', description: '切换辐射模型（Off / DO）' },
  { command: '/solve/initialize/hyb-initialization', description: '执行混合初始化（Hybrid Initialization）' },
  { command: '/solve/initialize/initialize-flow', description: '执行标准初始化（Standard Initialization）' },
  { command: '/solve/iterate 50', description: '运行指定迭代步数求解计算（如 /solve/iterate 50）' },
  { command: '/solve/report-summary', description: '输出当前 Case 物理模型与求解配置摘要' },
  { command: '/report/fluxes/mass-flow', description: '计算进出口边界质量流量与净不平衡误差' },
  { command: '/report/forces/wall-forces', description: '计算壁面压力力、黏性阻力与气动力系数' },
  { command: '/display/contour', description: '刷新并切换图形视口显示速度/温度云图' },
  { command: '/plot/histogram', description: '切换图形视口查看场变量直方图分布' },
  { command: '/plot/fft', description: '切换图形视口查看监测信号 FFT 频谱分析' },
  { command: '/parallel/partition/auto', description: '执行并行计算域自动分区与负载均衡' },
  { command: 'help', description: '在控制台列出所有支持的教学 TUI 命令' },
  { command: 'clear', description: '清空当前控制台日志记录' },
]

export function parseAndExecuteTui(
  rawCommand: string,
  state: FluentSimState,
): FluentSimAction {
  const command = rawCommand.trim()
  const normalized = command.toLowerCase()
  const [name, ...args] = normalized.split(/\s+/)

  if (!command) {
    return {
      type: 'APPEND_CONSOLE',
      entries: [{ kind: 'info', text: '> ' }],
    }
  }

  if (normalized === 'clear' || normalized === 'cls') {
    return { type: 'CLEAR_CONSOLE' }
  }

  if (normalized === 'help' || normalized === '?') {
    return {
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> ${command}` },
        {
          kind: 'info',
          text: 'Available Teaching TUI commands: /mesh/check | /mesh/quality | /mesh/smooth-mesh | /mesh/polyhedra/convert-domain | /mesh/reorder/reorder-domain | /solve/check-case | /define/models/energy | /solve/initialize/hyb-initialization | /solve/iterate <n> | /solve/report-summary | /display/contour | /plot/histogram | /plot/fft | /report/fluxes/mass-flow | /report/forces/wall-forces | /parallel/partition/auto | clear',
        },
      ],
    }
  }

  if (normalized === '/mesh/check' || normalized === 'mesh check') {
    return { type: 'RUN_MESH_CHECK' }
  }

  if (normalized === '/mesh/quality' || normalized === 'mesh quality') {
    return { type: 'RUN_MESH_QUALITY' }
  }

  if (normalized === '/mesh/smooth-mesh' || normalized === '/mesh/modify-zones/smooth') {
    return { type: 'RUN_MESH_SMOOTH_OR_SWAP', mode: 'smooth' }
  }

  if (normalized === '/mesh/polyhedra/convert-domain') {
    return { type: 'CONVERT_TO_POLYHEDRA' }
  }

  if (normalized === '/mesh/reorder/reorder-domain') {
    return { type: 'RUN_MESH_REORDER', scope: 'domain' }
  }

  if (normalized === '/solve/check-case' || normalized === 'check case') {
    return { type: 'RUN_CASE_CHECK' }
  }

  if (normalized === '/solve/report-summary') {
    return { type: 'RUN_CASE_SUMMARY' }
  }

  if (normalized === '/display/contour') {
    return { type: 'DISPLAY_RESULT', tab: 'contours' }
  }

  if (normalized === '/plot/histogram') {
    return { type: 'DISPLAY_RESULT', tab: 'histogram' }
  }

  if (normalized === '/plot/fft') {
    return { type: 'DISPLAY_RESULT', tab: 'fft' }
  }

  if (normalized === '/report/fluxes/mass-flow') {
    return { type: 'RUN_FLUXES_REPORT' }
  }

  if (normalized === '/report/forces/wall-forces') {
    return { type: 'RUN_FORCES_REPORT' }
  }

  if (normalized === '/parallel/partition' || normalized === '/parallel/partition/auto') {
    return { type: 'RUN_PARTITION' }
  }

  if (name === '/define/models/energy' && (args.length === 0 ||
      (args.length === 1 && ['yes', 'no'].includes(args[0])))) {
    return { type: 'SET_ENERGY_ENABLED', enabled: args.length ? args[0] === 'yes' : !state.energyEnabled }
  }

  if (normalized === '/define/models/multiphase') {
    return {
      type: 'SET_CONTROL_VALUE',
      controlId: 'multiphase-model-select',
      value: state.multiphaseModel === 'Off' ? 'Volume of Fluid (VOF)' : 'Off',
    }
  }

  if (normalized === '/define/models/radiation') {
    return {
      type: 'SET_CONTROL_VALUE',
      controlId: 'radiation-model-select',
      value: state.radiationModel === 'Off' ? 'Discrete Ordinates (DO)' : 'Off',
    }
  }

  if (
    ['/solve/initialize/hyb', '/solve/initialize/hyb-initialization', '/solve/initialize/initialize-flow'].includes(normalized)
  ) {
    return {
      type: 'RUN_INITIALIZE',
      method: normalized.includes('hyb') ? 'hybrid' : 'standard',
    }
  }

  if (name === '/solve/iterate') {
    if (!args.length) return { type: 'RUN_CALCULATE' }
    const count = Number(args[0])
    if (args.length === 1 && /^\d+$/.test(args[0]) && Number.isSafeInteger(count) && count > 0) {
      return { type: 'RUN_CALCULATE', iterationsOverride: count }
    }
    return { type: 'APPEND_CONSOLE', entries: [{ kind: 'warning', text: 'Use /solve/iterate <positive integer>.' }] }
  }

  return {
    type: 'APPEND_CONSOLE',
    entries: [
      { kind: 'command', text: `> ${command}` },
      {
        kind: 'warning',
        text: `Unknown teaching TUI command "${command}". Type "help" to see supported commands.`,
      },
    ],
  }
}
