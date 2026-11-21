import type {
  FluentMockControl,
  FluentMockRibbonTab,
  FluentMockTaskPanel,
  FluentMockTreeSection,
} from './fluentTypes'

type ControlInput = Omit<
  FluentMockControl,
  'enabled' | 'explanationId' | 'label' | 'labelZh'
> & {
  label: string
  labelZh?: string
  enabled?: boolean
  explanationId?: string
}

function control(input: ControlInput): FluentMockControl {
  return {
    ...input,
    labelZh: input.labelZh ?? input.label,
    enabled: input.enabled ?? true,
    explanationId: input.explanationId ?? `${input.id}-explanation`,
  }
}

function ribbonControl(
  id: string,
  label: string,
  group: string,
  dialogId?: string,
  options: Partial<FluentMockControl> = {},
) {
  return control({
    id,
    label,
    region: 'Ribbon 菜单',
    module: 'Mesh',
    group,
    controlType: 'ribbon-button',
    dialogId,
    ...options,
  })
}

export const ribbonTabs: FluentMockRibbonTab[] = [
  {
    id: 'ribbon-tab-file',
    label: '文件',
    groups: [
      {
        id: 'ribbon-file-case',
        label: '案例',
        controls: [
          ribbonControl('ribbon-read-case', '读取', '案例', 'case-file-dialog'),
          ribbonControl('ribbon-write-case', '保存', '案例', 'case-file-dialog'),
          ribbonControl('ribbon-export', '导出', '案例'),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-domain',
    label: '区域',
    groups: [
      {
        id: 'ribbon-mesh',
        label: '网格',
        controls: [
          ribbonControl('ribbon-mesh-display', '显示网格', '网格', 'mesh-display-dialog'),
          ribbonControl('ribbon-mesh-info', '信息', '网格'),
          ribbonControl('ribbon-mesh-scale', '缩放网格', '网格', 'mesh-scale-dialog'),
          ribbonControl('ribbon-mesh-check', '检查', '网格', 'mesh-check-dialog', {
            panelId: 'general-panel',
          }),
          ribbonControl('ribbon-mesh-quality', '质量统计', '网格', 'mesh-quality-dialog'),
        ],
      },
      {
        id: 'ribbon-zone',
        label: '区域',
        controls: [
          ribbonControl('ribbon-zone-merge', '组合', '区域'),
          ribbonControl('ribbon-zone-separate', '分离', '区域'),
          ribbonControl('ribbon-zone-adjacency', '邻接', '区域'),
          ribbonControl('ribbon-zone-delete', '删除', '区域'),
          ribbonControl('ribbon-zone-replace', '替换区域', '区域'),
        ],
      },
      {
        id: 'ribbon-interface',
        label: '界面',
        controls: [
          ribbonControl('ribbon-interface-mesh', '网格界面', '界面'),
          ribbonControl('ribbon-interface-orient', '方向检查', '界面'),
        ],
      },
      {
        id: 'ribbon-mesh-model',
        label: '网格模型',
        controls: [
          ribbonControl('ribbon-dynamic-mesh', '动态网格', '网格模型', 'dynamic-mesh-dialog'),
          ribbonControl('ribbon-gap-model', '间隙模型', '网格模型'),
        ],
      },
      {
        id: 'ribbon-adapt',
        label: '适应',
        controls: [
          ribbonControl('ribbon-adapt-mark', '标记', '适应', 'mesh-adaptation-dialog'),
          ribbonControl('ribbon-adapt-refine', '加密', '适应'),
        ],
      },
      {
        id: 'ribbon-surface',
        label: '表面',
        controls: [
          ribbonControl('ribbon-surface-create', '创建表面', '表面'),
          ribbonControl('ribbon-surface-manage', '管理表面', '表面'),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-physics',
    label: '物理',
    groups: [
      {
        id: 'ribbon-physics-models',
        label: '模型',
        controls: [
          ribbonControl('ribbon-model-energy', '能量', '模型', 'energy-model-dialog'),
          ribbonControl('ribbon-model-viscous', '黏性', '模型', 'viscous-model-dialog'),
        ],
      },
      {
        id: 'ribbon-physics-materials',
        label: '材料',
        controls: [
          ribbonControl('ribbon-materials', '材料库', '材料', 'materials-dialog'),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-solution',
    label: '求解',
    groups: [
      {
        id: 'ribbon-solution-setup',
        label: '求解设置',
        controls: [
          ribbonControl('ribbon-methods', '方法设置', '求解设置', 'solution-methods-dialog'),
          ribbonControl('ribbon-controls', '控制设置', '求解设置', 'solution-controls-dialog'),
          ribbonControl('ribbon-initialize', '初始化', '求解设置', 'initialization-dialog'),
          ribbonControl('ribbon-run', '运行计算', '求解设置', 'run-calculation-dialog'),
        ],
      },
      {
        id: 'ribbon-solution-monitor',
        label: '监控',
        controls: [
          ribbonControl('ribbon-residuals', '残差监控', '监控', 'residual-monitors-dialog'),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-results',
    label: '结果',
    groups: [
      {
        id: 'ribbon-results-graphics',
        label: '图形对象',
        controls: [
          ribbonControl('ribbon-contours', '云图', '图形对象', 'contours-dialog'),
          ribbonControl('ribbon-vectors', '矢量', '图形对象', 'vectors-dialog'),
          ribbonControl('ribbon-reports', '报告定义', '图形对象', 'reports-dialog'),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-view',
    label: '查看',
    groups: [{ id: 'ribbon-view', label: '窗口', controls: [] }],
  },
  {
    id: 'ribbon-tab-parallel',
    label: '并行',
    groups: [{ id: 'ribbon-parallel', label: '并行', controls: [] }],
  },
  {
    id: 'ribbon-tab-design',
    label: '设计',
    groups: [{ id: 'ribbon-design', label: '设计', controls: [] }],
  },
  {
    id: 'ribbon-tab-parameters',
    label: '参数',
    groups: [{ id: 'ribbon-parameters', label: '参数', controls: [] }],
  },
  {
    id: 'ribbon-tab-help',
    label: '学习和技术支持',
    groups: [{ id: 'ribbon-help', label: '帮助', controls: [] }],
  },
]

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
  ['tree-surfaces', '表面', 'Surfaces', 'surfaces-panel'],
  ['tree-graphics', '图形', 'Graphics', 'graphics-panel'],
  ['tree-plots', '图', 'Plots', 'plots-panel'],
  ['tree-dashboard', 'Dashboard', 'Dashboard', 'dashboard-panel'],
  ['tree-animations', '动画', 'Animations', 'animations-panel'],
  ['tree-reports', '报告', 'Reports', 'reports-panel'],
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

function panelControl(
  id: string,
  label: string,
  module: string,
  group: string,
  controlType: FluentMockControl['controlType'] = 'button',
  options: Partial<FluentMockControl> = {},
) {
  return control({
    id,
    label,
    region: '任务页面',
    module,
    group,
    controlType,
    ...options,
  })
}

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
  subtitle = '选择一个控件查看其教学说明；本页面为初版教学模拟结构。',
): FluentMockTaskPanel {
  return {
    id,
    title,
    module,
    subtitle,
    groups: [{ id: `${id}-main`, title: title, controls }],
  }
}

export const taskPanels: FluentMockTaskPanel[] = [
  generalPanel,
  simplePanel('models-panel', '模型', 'Models', [
    panelControl('models-energy', 'Energy', 'Models', '模型', 'button', {
      dialogId: 'energy-model-dialog',
    }),
    panelControl('models-viscous', 'Viscous', 'Models', '模型', 'button', {
      dialogId: 'viscous-model-dialog',
    }),
  ]),
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
  simplePanel('boundary-panel', '边界条件', 'Boundary Conditions', [
    panelControl('bc-velocity-inlet', 'Velocity Inlet', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'velocity-inlet-dialog',
    }),
    panelControl('bc-mass-flow-inlet', 'Mass-Flow Inlet', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'mass-flow-inlet-dialog',
    }),
    panelControl('bc-pressure-outlet', 'Pressure Outlet', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'pressure-outlet-dialog',
    }),
    panelControl('bc-wall', 'Wall', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'wall-dialog',
    }),
    panelControl('bc-symmetry', 'Symmetry', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'symmetry-dialog',
    }),
    panelControl('bc-outflow', 'Outflow', 'Boundary Conditions', '边界条件', 'button', {
      dialogId: 'outflow-dialog',
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
      dialogId: 'cell-zone-source-dialog',
    }),
  ]),
  simplePanel('reference-values-panel', '参考值', 'Reference Values', [
    panelControl('reference-compute-from', 'Compute From', 'Reference Values', '参考值', 'select', {
      value: 'inlet',
      dialogId: 'reference-values-dialog',
    }),
    panelControl('reference-area', 'Area', 'Reference Values', '参考值', 'field', {
      value: '1 m²',
      dialogId: 'reference-values-dialog',
    }),
    panelControl('reference-length', 'Length', 'Reference Values', '参考值', 'field', {
      value: '1 m',
      dialogId: 'reference-values-dialog',
    }),
  ]),
  simplePanel('solution-methods-panel', '方法', 'Solution Methods', [
    panelControl('methods-pressure-velocity', 'Pressure-Velocity Coupling', 'Solution Methods', '方法', 'select', {
      value: 'SIMPLE',
      dialogId: 'solution-methods-dialog',
    }),
    panelControl('methods-gradient', 'Gradient', 'Solution Methods', '方法', 'select', {
      value: 'Least Squares Cell Based',
    }),
    panelControl('methods-momentum', 'Momentum', 'Solution Methods', '方法', 'select', {
      value: 'Second Order Upwind',
    }),
  ]),
  simplePanel('solution-controls-panel', '控制', 'Solution Controls', [
    panelControl('controls-under-relaxation', 'Under-Relaxation Factors', 'Solution Controls', '控制', 'button', {
      dialogId: 'solution-controls-dialog',
    }),
    panelControl('controls-equations', 'Equations', 'Solution Controls', '控制', 'button'),
  ]),
  simplePanel('initialization-panel', '初始化', 'Initialization', [
    panelControl('initialization-hybrid', 'Hybrid Initialization', 'Initialization', '初始化', 'button', {
      dialogId: 'initialization-dialog',
    }),
    panelControl('initialization-standard', 'Standard Initialization', 'Initialization', '初始化', 'button'),
    panelControl('initialization-patch', 'Patch', 'Initialization', '初始化', 'button', {
      dialogId: 'patch-initialization-dialog',
    }),
  ]),
  simplePanel('calculation-activities-panel', '计算设置', 'Calculation Activities', [
    panelControl('calculation-autosave', 'Automatic Saving', 'Calculation Activities', '自动保存', 'button', {
      dialogId: 'autosave-dialog',
    }),
    panelControl('calculation-execute-commands', 'Execute Commands', 'Calculation Activities', '执行命令', 'button'),
    panelControl('calculation-data-sampling', 'Data Sampling', 'Calculation Activities', '数据采样', 'button'),
  ]),
  simplePanel('run-calculation-panel', '运行计算', 'Run Calculation', [
    panelControl('run-iterations', 'No. of Iterations', 'Run Calculation', '运行计算', 'field', {
      value: '250',
    }),
    panelControl('run-calculate', 'Calculate', 'Run Calculation', '运行计算', 'button', {
      dialogId: 'run-calculation-dialog',
    }),
  ]),
  simplePanel('monitors-panel', '监控器', 'Monitors', [
    panelControl('monitors-residuals', 'Residual Monitors', 'Monitors', '监控器', 'button', {
      dialogId: 'residual-monitors-dialog',
    }),
    panelControl('monitors-report-plots', 'Report Plots', 'Monitors', '监控器', 'button'),
  ]),
  simplePanel('graphics-panel', '图形', 'Results', [
    panelControl('results-contours', 'Contours', 'Results', '图形', 'button', {
      dialogId: 'contours-dialog',
    }),
    panelControl('results-vectors', 'Vectors', 'Results', '图形', 'button', {
      dialogId: 'vectors-dialog',
    }),
    panelControl('results-display-options', 'Display Options', 'Results', '图形', 'button', {
      dialogId: 'display-options-dialog',
    }),
  ]),
  simplePanel('reports-panel', '报告', 'Results', [
    panelControl('results-reports', 'Reports', 'Results', '报告', 'button', {
      dialogId: 'reports-dialog',
    }),
    panelControl('results-surface-integrals', 'Surface Integrals', 'Results', '报告', 'button'),
  ]),
  simplePanel('report-definitions-panel', '报告定义', 'Report Definitions', [
    panelControl('report-definition-force', 'Force Report', 'Report Definitions', '报告定义', 'button', {
      dialogId: 'report-definition-dialog',
    }),
    panelControl('report-definition-surface', 'Surface Report', 'Report Definitions', '报告定义', 'button', {
      dialogId: 'surface-integrals-dialog',
    }),
  ]),
  simplePanel('surfaces-panel', '表面', 'Results', [
    panelControl('surface-plane', 'Plane Surface', 'Results', '表面', 'button', {
      dialogId: 'plane-surface-dialog',
    }),
    panelControl('surface-iso-surface', 'Iso-Surface', 'Results', '表面', 'button'),
  ]),
  simplePanel('plots-panel', '图', 'Results', [
    panelControl('plot-xy', 'XY Plot', 'Results', '图', 'button', {
      dialogId: 'xy-plot-dialog',
    }),
    panelControl('plot-residuals', 'Residual Plot', 'Results', '图', 'button'),
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
    panelControl('dynamic-mesh-zones', 'Dynamic Mesh Zones', 'Dynamic Mesh', '动态网格', 'button'),
  ]),
]

const fallbackPanelIds = [
  ['motion-panel', 'Motion Definitions', 'Motion Definitions'],
  ['mesh-interface-panel', '网格界面', 'Mesh Interfaces'],
  ['aux-geometry-panel', '辅助几何结构定义', 'Auxiliary Geometry'],
  ['reference-frames-panel', '参考系', 'Reference Frames'],
  ['named-expressions-panel', '已命名的表达式', 'Named Expressions'],
  ['curvilinear-panel', '曲线坐标系', 'Curvilinear Coordinates'],
  ['cell-registers-panel', '单元标记', 'Cell Registers'],
  ['dashboard-panel', 'Dashboard', 'Dashboard'],
  ['animations-panel', '动画', 'Animations'],
  ['parameters-controls-panel', '参数和控制', 'Parameters and Controls'],
  ['simulation-report-panel', '仿真报告', 'Simulation Report'],
] as const

export const fallbackTaskPanels: FluentMockTaskPanel[] = fallbackPanelIds.map(
  ([id, title, module]) =>
    simplePanel(id, title, module, [
      panelControl(`${id}-open`, '打开设置', module, title, 'button'),
      panelControl(`${id}-help`, '查看说明', module, title, 'button'),
    ]),
)

export const allTaskPanels = [...taskPanels, ...fallbackTaskPanels]

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

export const allMainControls = [
  ...ribbonTabs.flatMap((tab) => tab.groups.flatMap((group) => group.controls)),
  ...treeSections.flatMap((section) => section.controls),
  ...allTaskPanels.flatMap((panel) =>
    panel.groups.flatMap((group) => group.controls),
  ),
  ...graphicsControls,
  consoleControl,
  outlineFilterControl,
  quickSearchControl,
]
