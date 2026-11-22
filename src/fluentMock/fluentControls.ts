import type {
  FluentMockControl,
  FluentMockRibbonTab,
  FluentMockTaskPanel,
  FluentMockTreeSection,
} from './fluentTypes'
import { makeControl, makePanelControl, type ControlInput } from './data/controlHelpers'
import { extendedTaskPanels } from './data/extendedPanels'
import { extendedRibbonTabs } from './data/extendedRibbon'

function control(input: ControlInput): FluentMockControl {
  return makeControl(input)
}

function panelControl(
  id: string,
  label: string,
  module: string,
  group: string,
  controlType: FluentMockControl['controlType'] = 'button',
  options: Partial<FluentMockControl> = {},
) {
  return makePanelControl(id, label, module, group, controlType, options)
}

export const ribbonTabs: FluentMockRibbonTab[] = extendedRibbonTabs

const setupNodes = [
  ['tree-general', '一般', 'General', 'general-panel'],
  ['tree-models', '模型', 'Models', 'models-panel'],
  ['tree-materials', '材料', 'Materials', 'materials-panel'],
  ['tree-motion-definitions', 'Motion Definitions', 'Motion Definitions', 'motion-panel'],
  ['tree-cell-zone-conditions', '单元区域条件', 'Cell Zone Conditions', 'cell-zone-panel'],
  ['tree-boundary-conditions', '边界条件', 'Boundary Conditions', 'boundary-panel'],
  ['tree-mesh-interfaces', '网格界面', 'Mesh Interfaces', 'mesh-interface-panel'],
  ['tree-auxiliary-geometry', '辅助几何结构定义', 'Auxiliary Geometry', 'aux-geometry-panel'],
  ['tree-dynamic-mesh', '动态网格', 'Dynamic Mesh', 'dynamic-mesh-panel'],
  ['tree-reference-values', '参考值', 'Reference Values', 'reference-values-panel'],
  ['tree-reference-frames', '参考系', 'Reference Frames', 'reference-frames-panel'],
  ['tree-named-expressions', '已命名的表达式', 'Named Expressions', 'named-expressions-panel'],
  ['tree-curvilinear-coordinates', '曲线坐标系', 'Curvilinear Coordinates', 'curvilinear-panel'],
] as const

const solutionNodes = [
  ['tree-methods', '方法', 'Solution Methods', 'solution-methods-panel'],
  ['tree-controls', '控制', 'Solution Controls', 'solution-controls-panel'],
  ['tree-report-definitions', '报告定义', 'Report Definitions', 'report-definitions-panel'],
  ['tree-monitors', '监控器', 'Monitors', 'monitors-panel'],
  ['tree-cell-registers', '单元标记', 'Cell Registers', 'cell-registers-panel'],
  ['tree-mesh-adaptation', '网格自适应', 'Mesh Adaptation', 'mesh-adaptation-panel'],
  ['tree-initialization', '初始化', 'Initialization', 'initialization-panel'],
  ['tree-calculation-activities', '计算设置', 'Calculation Activities', 'calculation-activities-panel'],
  ['tree-run-calculation', '运行计算', 'Run Calculation', 'run-calculation-panel'],
] as const

const resultsNodes = [
  ['tree-surfaces', '表面', 'Results', 'surfaces-panel'],
  ['tree-graphics', '图形', 'Results', 'graphics-panel'],
  ['tree-plots', '图', 'Results', 'plots-panel'],
  ['tree-dashboard', 'Dashboard', 'Dashboard', 'dashboard-panel'],
  ['tree-animations', '动画', 'Animations', 'animations-panel'],
  ['tree-reports', '报告', 'Results', 'reports-panel'],
  ['tree-parameters-controls', '参数和控制', 'Parameters and Controls', 'parameters-controls-panel'],
  ['tree-simulation-report', '仿真报告', 'Simulation Report', 'simulation-report-panel'],
] as const

function treeNode([
  id,
  label,
  module,
  panelId,
]: readonly [string, string, string, string]) {
  return control({
    id,
    label,
    region: '案例视图',
    module,
    group: '功能树',
    controlType: 'tree-node',
    panelId,
  })
}

export const treeSections: FluentMockTreeSection[] = [
  {
    id: 'tree-section-setup',
    label: '设置',
    defaultExpanded: true,
    controls: setupNodes.map(treeNode),
  },
  {
    id: 'tree-section-solution',
    label: '求解',
    defaultExpanded: true,
    controls: solutionNodes.map(treeNode),
  },
  {
    id: 'tree-section-results',
    label: '结果',
    defaultExpanded: true,
    controls: resultsNodes.map(treeNode),
  },
]

const generalPanel: FluentMockTaskPanel = {
  id: 'general-panel',
  title: '一般',
  module: 'General',
  subtitle: '设置求解器类型、速度公式、时间方式和重力方向。',
  groups: [
    {
      id: 'general-mesh',
      title: '网格',
      controls: [
        panelControl('general-scale', '缩放', 'General', '网格', 'button', {
          dialogId: 'mesh-scale-dialog',
        }),
        panelControl('general-check', '网格检查', 'General', '网格', 'button', {
          dialogId: 'mesh-check-dialog',
        }),
        panelControl('general-report-quality', '报告质量', 'General', '网格', 'button', {
          dialogId: 'mesh-quality-dialog',
        }),
        panelControl('general-display', '显示', 'General', '网格', 'button', {
          dialogId: 'mesh-display-dialog',
        }),
        panelControl('general-units', '单位', 'General', '网格', 'button', {
          dialogId: 'units-dialog',
        }),
      ],
    },
    {
      id: 'general-solver',
      title: '求解器',
      controls: [
        panelControl('general-pressure-based', '基于压力', 'General', '求解器 / 类型', 'radio', {
          defaultSelected: true,
        }),
        panelControl('general-density-based', '基于密度', 'General', '求解器 / 类型', 'radio'),
        panelControl('general-2d-space', '2D Space', 'General', '求解器 / 2D 空间', 'select', {
          value: 'Planar',
          options: ['Planar', 'Axisymmetric', 'Axisymmetric Swirl'],
          visibleWhen: [{ controlId: 'solver-dimension', values: ['2d'] }],
        }),
        panelControl('general-absolute-velocity', '绝对', 'General', '求解器 / 速度公式', 'radio', {
          defaultSelected: true,
        }),
        panelControl('general-relative-velocity', '相对', 'General', '求解器 / 速度公式', 'radio'),
        panelControl('general-solver-settings', '求解器设置', 'General', '求解器', 'button', {
          dialogId: 'general-solver-dialog',
        }),
      ],
    },
    {
      id: 'general-time',
      title: '时间',
      controls: [
        panelControl('general-steady', '稳态', 'General', '时间', 'radio', {
          defaultSelected: true,
        }),
        panelControl('general-transient', '瞬态', 'General', '时间', 'radio'),
      ],
    },
    {
      id: 'general-gravity',
      title: '重力',
      controls: [
        panelControl('general-gravity-enable', '重力', 'General', '重力', 'checkbox'),
        panelControl('general-gravity-x', 'X 重力加速度', 'General', '重力', 'field', {
          value: '0 m/s²',
        }),
        panelControl('general-gravity-y', 'Y 重力加速度', 'General', '重力', 'field', {
          value: '-9.81 m/s²',
        }),
        panelControl('general-gravity-z', 'Z 重力加速度', 'General', '重力', 'field', {
          value: '0 m/s²',
        }),
        panelControl('general-operating-conditions', '操作条件', 'General', '重力', 'button', {
          dialogId: 'operating-conditions-dialog',
        }),
      ],
    },
  ],
}

function simplePanel(
  id: string,
  title: string,
  module: string,
  controls: FluentMockControl[],
  subtitle = '选择一个控件查看其教学说明；状态与仿真面板实时联动。',
): FluentMockTaskPanel {
  return {
    id,
    title,
    module,
    subtitle,
    groups: [{ id: `${id}-main`, title: title, controls }],
  }
}

export const coreTaskPanels: FluentMockTaskPanel[] = [
  generalPanel,
  simplePanel('materials-panel', '材料', 'Materials', [
    panelControl('materials-main', 'Materials 主页面', 'Materials', '材料', 'button', {
      dialogId: 'materials-dialog',
    }),
    panelControl('materials-fluid', 'Fluid material', 'Materials', '材料', 'button', {
      dialogId: 'fluid-material-dialog',
    }),
    panelControl('materials-solid', 'Solid material', 'Materials', '材料', 'button', {
      dialogId: 'solid-material-dialog',
    }),
  ]),
  simplePanel('cell-zone-panel', '单元区域条件', 'Cell Zone Conditions', [
    panelControl('cell-zone-fluid', 'Fluid zone', 'Cell Zone Conditions', '单元区域', 'button', {
      dialogId: 'cell-zone-fluid-dialog',
    }),
    panelControl('cell-zone-solid', 'Solid zone', 'Cell Zone Conditions', '单元区域', 'button', {
      dialogId: 'cell-zone-solid-dialog',
    }),
    panelControl('cell-zone-source', 'Source terms', 'Cell Zone Conditions', '单元区域', 'button', {
      dialogId: 'cell-zone-fluid-dialog',
      dialogTab: 'source-terms',
    }),
  ]),
  simplePanel('reference-values-panel', '参考值', 'Reference Values', [
    panelControl('reference-compute-from', 'Compute From', 'Reference Values', '参考值', 'select', {
      value: 'inlet',
      options: ['inlet', 'outlet', 'all-zones', 'fluid-domain'],
      dialogId: 'reference-values-dialog',
    }),
    panelControl('reference-area', 'Area', 'Reference Values', '参考值', 'field', {
      value: '0.00785 m²',
      dialogId: 'reference-values-dialog',
    }),
    panelControl('reference-density', 'Density', 'Reference Values', '参考值', 'field', {
      value: '1.225 kg/m³',
    }),
    panelControl('reference-depth', 'Depth', 'Reference Values', '参考值', 'field', {
      value: '1 m',
    }),
    panelControl('reference-enthalpy', 'Enthalpy', 'Reference Values', '参考值', 'field', {
      value: '0 J/kg',
    }),
    panelControl('reference-length', 'Length', 'Reference Values', '参考值', 'field', {
      value: '0.1 m',
      dialogId: 'reference-values-dialog',
    }),
    panelControl('reference-pressure', 'Pressure', 'Reference Values', '参考值', 'field', {
      value: '0 Pa',
    }),
    panelControl('reference-temperature', 'Temperature', 'Reference Values', '参考值', 'field', {
      value: '300 K',
    }),
    panelControl('reference-velocity', 'Velocity', 'Reference Values', '参考值', 'field', {
      value: '2.5 m/s',
    }),
    panelControl('reference-viscosity', 'Viscosity', 'Reference Values', '参考值', 'field', {
      value: '1.7894e-5 kg/(m·s)',
    }),
    panelControl('reference-gamma', 'Ratio of Specific Heats', 'Reference Values', '参考值', 'field', {
      value: '1.4',
    }),
    panelControl('reference-zone', 'Reference Zone', 'Reference Values', '参考值', 'select', {
      value: 'fluid-domain',
      options: ['fluid-domain', 'all-fluid-zones'],
    }),
  ]),
  simplePanel('calculation-activities-panel', '计算设置', 'Calculation Activities', [
    panelControl('calculation-autosave', 'Automatic Saving', 'Calculation Activities', '自动保存', 'button', {
      dialogId: 'autosave-dialog',
    }),
    panelControl('calculation-execute-commands', 'Execute Commands', 'Calculation Activities', '执行命令', 'button', {
      dialogId: 'execute-commands-dialog',
    }),
    panelControl('calculation-data-sampling', 'Data Sampling', 'Calculation Activities', '数据采样', 'button', {
      dialogId: 'data-sampling-dialog',
    }),
  ]),
  simplePanel('report-definitions-panel', '报告定义', 'Report Definitions', [
    panelControl('report-definition-force', 'Force Report', 'Report Definitions', '报告定义', 'button', {
      dialogId: 'report-definition-dialog',
    }),
    panelControl('report-definition-surface', 'Surface Report', 'Report Definitions', '报告定义', 'button', {
      dialogId: 'report-definition-dialog',
    }),
    panelControl('report-definition-flux', 'Flux Report', 'Report Definitions', '报告定义', 'button', {
      dialogId: 'report-definition-dialog',
    }),
  ]),
  simplePanel('mesh-adaptation-panel', '网格自适应', 'Mesh Adaptation', [
    panelControl('adapt-register', 'Create Register', 'Mesh Adaptation', '网格自适应', 'button', {
      dialogId: 'mesh-adaptation-dialog',
    }),
    panelControl('adapt-refine', 'Adapt', 'Mesh Adaptation', '网格自适应', 'button'),
  ]),
  simplePanel('dynamic-mesh-panel', '动态网格', 'Dynamic Mesh', [
    panelControl('dynamic-mesh-enable', 'Enable Dynamic Mesh', 'Dynamic Mesh', '动态网格', 'checkbox', {
      dialogId: 'dynamic-mesh-dialog',
    }),
    panelControl('dynamic-mesh-zones', 'Dynamic Mesh Zones…', 'Dynamic Mesh', '动态网格', 'button', {
      dialogId: 'dynamic-mesh-zones-dialog',
    }),
  ]),
]

export const allTaskPanels: FluentMockTaskPanel[] = [
  ...coreTaskPanels,
  ...extendedTaskPanels,
]

export const graphicsControls: FluentMockControl[] = [
  control({
    id: 'graphics-select',
    label: '选择工具',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '左侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-rotate',
    label: '旋转视图',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '左侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-pan',
    label: '平移视图',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '左侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-zoom',
    label: '缩放窗口',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '左侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-style',
    label: '显示样式',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '右侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-fit',
    label: '适配视图',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '右侧工具栏',
    controlType: 'graphics-tool',
  }),
  control({
    id: 'graphics-selection-filter',
    label: '已选择 all',
    region: '图形窗口',
    module: 'Graphics Window',
    group: '选择过滤',
    controlType: 'select',
    value: 'all',
  }),
]

export const consoleControl = control({
  id: 'console-area',
  label: '控制台区域',
  region: '底部控制台',
  module: 'Console',
  group: '控制台',
  controlType: 'console',
})

export const outlineFilterControl = control({
  id: 'outline-filter',
  label: '功能树过滤',
  region: '案例视图',
  module: 'Outline',
  group: '过滤',
  controlType: 'field',
})

export const quickSearchControl = control({
  id: 'quick-search',
  label: '快速搜索',
  region: 'Ribbon 菜单',
  module: 'Ribbon',
  group: '搜索',
  controlType: 'field',
})

export function flattenControls(controls: FluentMockControl[]): FluentMockControl[] {
  return controls.flatMap((control) => [control, ...flattenControls(control.children ?? [])])
}

export const allMainControls = [
  ...ribbonTabs.flatMap((tab) => tab.groups.flatMap((group) => flattenControls(group.controls))),
  ...treeSections.flatMap((section) => section.controls),
  ...allTaskPanels.flatMap((panel) =>
    panel.groups.flatMap((group) => group.controls),
  ),
  ...graphicsControls,
  consoleControl,
  outlineFilterControl,
  quickSearchControl,
]
