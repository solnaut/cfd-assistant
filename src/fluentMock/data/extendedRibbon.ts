import type { FluentMockRibbonTab } from '../fluentTypes'
import { makeRibbonControl } from './controlHelpers'

export const extendedRibbonTabs: FluentMockRibbonTab[] = [
  {
    id: 'ribbon-tab-file',
    label: '文件',
    groups: [
      {
        id: 'ribbon-file-case',
        label: '案例',
        controls: [
          makeRibbonControl('ribbon-read-case', '读取', '案例', 'case-file-dialog', {
            module: 'File',
          }),
          makeRibbonControl('ribbon-write-case', '保存', '案例', 'case-file-dialog', {
            module: 'File',
          }),
          makeRibbonControl('ribbon-import', 'Import', '案例', 'case-file-dialog', {
            module: 'File',
          }),
          makeRibbonControl('ribbon-export', '导出', '案例', 'case-file-dialog', {
            module: 'File',
          }),
        ],
      },
      {
        id: 'ribbon-file-session',
        label: 'Session',
        controls: [
          makeRibbonControl('ribbon-preferences', 'Preferences', 'Session', 'preferences-dialog', {
            module: 'File',
          }),
          makeRibbonControl('ribbon-switch-to-meshing', 'Switch to Meshing', 'Session', undefined, {
            module: 'File',
          }),
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
          makeRibbonControl('ribbon-mesh-display', '显示网格', '网格', 'mesh-display-dialog'),
          makeRibbonControl('ribbon-mesh-info', '信息', '网格', 'mesh-quality-dialog'),
          makeRibbonControl('ribbon-mesh-scale', '缩放网格', '网格', 'mesh-scale-dialog'),
          makeRibbonControl('ribbon-mesh-check', '检查', '网格', 'mesh-check-dialog', {
            panelId: 'general-panel',
          }),
          makeRibbonControl('ribbon-mesh-quality', '质量统计', '网格', 'mesh-quality-dialog'),
          makeRibbonControl('ribbon-mesh-reorder', 'Reorder', '网格'),
          makeRibbonControl('ribbon-mesh-smooth', 'Smooth/Swap', '网格'),
          makeRibbonControl('ribbon-mesh-polyhedra', 'Make Polyhedra', '网格'),
        ],
      },
      {
        id: 'ribbon-zone',
        label: 'Zones',
        controls: [
          makeRibbonControl('ribbon-zone-merge', '组合', 'Zones'),
          makeRibbonControl('ribbon-zone-separate', '分离', 'Zones'),
          makeRibbonControl('ribbon-zone-adjacency', '邻接', 'Zones'),
          makeRibbonControl('ribbon-zone-delete', '删除', 'Zones'),
          makeRibbonControl('ribbon-zone-replace', '替换区域', 'Zones'),
          makeRibbonControl('ribbon-zone-append', 'Append', 'Zones'),
          makeRibbonControl('ribbon-zone-transform', 'Transform', 'Zones', 'mesh-scale-dialog'),
        ],
      },
      {
        id: 'ribbon-interface',
        label: '界面',
        controls: [
          makeRibbonControl('ribbon-interface-mesh', '网格界面', '界面', undefined, {
            panelId: 'mesh-interface-panel',
          }),
          makeRibbonControl('ribbon-interface-orient', '方向检查', '界面'),
          makeRibbonControl('ribbon-interface-overset', 'Overset', '界面', undefined, {
            panelId: 'mesh-interface-panel',
          }),
        ],
      },
      {
        id: 'ribbon-mesh-model',
        label: '网格模型',
        controls: [
          makeRibbonControl('ribbon-dynamic-mesh', '动态网格', '网格模型', 'dynamic-mesh-dialog', {
            module: 'Dynamic Mesh',
            panelId: 'dynamic-mesh-panel',
          }),
          makeRibbonControl('ribbon-gap-model', '间隙模型', '网格模型'),
        ],
      },
      {
        id: 'ribbon-adapt',
        label: '适应',
        controls: [
          makeRibbonControl('ribbon-adapt-mark', '标记', '适应', 'mesh-adaptation-dialog', {
            module: 'Mesh Adaptation',
            panelId: 'mesh-adaptation-panel',
          }),
          makeRibbonControl('ribbon-adapt-refine', '加密', '适应', undefined, {
            module: 'Mesh Adaptation',
            panelId: 'mesh-adaptation-panel',
          }),
          makeRibbonControl('ribbon-adapt-controls', 'Adapt Controls', '适应', 'mesh-adaptation-dialog', {
            module: 'Mesh Adaptation',
          }),
        ],
      },
      {
        id: 'ribbon-surface',
        label: '表面',
        controls: [
          makeRibbonControl('ribbon-surface-create', '创建表面', '表面', 'plane-surface-dialog', {
            module: 'Results',
            panelId: 'surfaces-panel',
          }),
          makeRibbonControl('ribbon-surface-manage', '管理表面', '表面', undefined, {
            module: 'Results',
            panelId: 'surfaces-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-physics',
    label: '物理',
    groups: [
      {
        id: 'ribbon-physics-solver',
        label: 'Solver',
        controls: [
          makeRibbonControl('ribbon-physics-general', 'General', 'Solver', undefined, {
            module: 'General',
            panelId: 'general-panel',
          }),
          makeRibbonControl('ribbon-physics-units', 'Units', 'Solver', 'units-dialog', {
            module: 'General',
          }),
          makeRibbonControl('ribbon-physics-operating', 'Operating Conditions', 'Solver', 'operating-conditions-dialog', {
            module: 'General',
          }),
          makeRibbonControl('ribbon-physics-reference', 'Reference Values', 'Solver', 'reference-values-dialog', {
            module: 'Reference Values',
            panelId: 'reference-values-panel',
          }),
        ],
      },
      {
        id: 'ribbon-physics-models',
        label: '模型',
        controls: [
          makeRibbonControl('ribbon-model-multiphase', 'Multiphase', '模型', 'multiphase-model-dialog', {
            module: 'Models',
            panelId: 'models-panel',
          }),
          makeRibbonControl('ribbon-model-energy', '能量', '模型', 'energy-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-viscous', '黏性', '模型', 'viscous-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-radiation', 'Radiation', '模型', 'radiation-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-species', 'Species', '模型', 'species-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-dpm', 'Discrete Phase', '模型', 'dpm-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-solidification', 'Solidification & Melting', '模型', 'solidification-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-acoustics', 'Acoustics', '模型', 'acoustics-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-wall-film', 'Eulerian Wall Film', '模型', 'wall-film-model-dialog', {
            module: 'Models',
          }),
          makeRibbonControl('ribbon-model-battery', 'Potential / Battery', '模型', 'battery-model-dialog', {
            module: 'Models',
          }),
        ],
      },
      {
        id: 'ribbon-physics-materials',
        label: '材料',
        controls: [
          makeRibbonControl('ribbon-materials', '材料库', '材料', 'materials-dialog', {
            module: 'Materials',
          }),
          makeRibbonControl('ribbon-materials-database', 'Create/Edit', '材料', 'material-create-edit-dialog', {
            module: 'Materials',
          }),
        ],
      },
      {
        id: 'ribbon-physics-zones',
        label: 'Zones',
        controls: [
          makeRibbonControl('ribbon-zones-cell', 'Cell Zone Conditions', 'Zones', 'cell-zone-fluid-dialog', {
            module: 'Cell Zone Conditions',
            panelId: 'cell-zone-panel',
          }),
          makeRibbonControl('ribbon-zones-boundary', 'Boundary Conditions', 'Zones', undefined, {
            module: 'Boundary Conditions',
            panelId: 'boundary-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-user-defined',
    label: 'User-Defined',
    groups: [
      {
        id: 'ribbon-ud-udf',
        label: 'Functions',
        controls: [
          makeRibbonControl('ribbon-udf-interpreted', 'Interpreted UDF', 'Functions', 'udf-dialog', {
            module: 'User-Defined',
          }),
          makeRibbonControl('ribbon-udf-compiled', 'Compiled UDF', 'Functions', 'udf-dialog', {
            module: 'User-Defined',
          }),
          makeRibbonControl('ribbon-udf-hooks', 'Function Hooks', 'Functions', 'udf-dialog', {
            module: 'User-Defined',
          }),
          makeRibbonControl('ribbon-udf-demand', 'Execute On Demand', 'Functions', 'udf-dialog', {
            module: 'User-Defined',
          }),
        ],
      },
      {
        id: 'ribbon-ud-fields',
        label: 'Fields & Expressions',
        controls: [
          makeRibbonControl('ribbon-udf-udm', 'UDM / UDS', 'Fields & Expressions', 'udm-uds-dialog', {
            module: 'User-Defined',
          }),
          makeRibbonControl('ribbon-udf-cff', 'Custom Field Functions', 'Fields & Expressions', 'custom-field-function-dialog', {
            module: 'User-Defined',
          }),
          makeRibbonControl('ribbon-udf-expressions', 'Named Expressions', 'Fields & Expressions', undefined, {
            module: 'User-Defined',
            panelId: 'named-expressions-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-solution',
    label: '求解',
    groups: [
      {
        id: 'ribbon-solution-runtype',
        label: 'Time',
        controls: [
          makeRibbonControl('ribbon-run-steady', 'Steady', 'Time', undefined, {
            module: 'General',
            panelId: 'general-panel',
          }),
          makeRibbonControl('ribbon-run-transient', 'Transient', 'Time', undefined, {
            module: 'General',
            panelId: 'general-panel',
          }),
        ],
      },
      {
        id: 'ribbon-solution-reports',
        label: 'Reports',
        controls: [
          makeRibbonControl('ribbon-report-defs', 'Report Definitions', 'Reports', 'report-definition-dialog', {
            module: 'Report Definitions',
            panelId: 'report-definitions-panel',
          }),
          makeRibbonControl('ribbon-report-plots', 'Report Plots', 'Reports', undefined, {
            module: 'Monitors',
            panelId: 'monitors-panel',
          }),
          makeRibbonControl('ribbon-report-files', 'Report Files', 'Reports', undefined, {
            module: 'Monitors',
            panelId: 'monitors-panel',
          }),
        ],
      },
      {
        id: 'ribbon-solution-monitor',
        label: '监控',
        controls: [
          makeRibbonControl('ribbon-residuals', '残差监控', '监控', 'residual-monitors-dialog', {
            module: 'Monitors',
          }),
          makeRibbonControl('ribbon-convergence-conditions', 'Convergence Conditions', '监控', 'convergence-conditions-dialog', {
            module: 'Monitors',
          }),
        ],
      },
      {
        id: 'ribbon-solution-setup',
        label: '求解设置',
        controls: [
          makeRibbonControl('ribbon-methods', '方法设置', '求解设置', 'solution-methods-dialog', {
            module: 'Solution Methods',
            panelId: 'solution-methods-panel',
          }),
          makeRibbonControl('ribbon-controls', '控制设置', '求解设置', 'solution-controls-dialog', {
            module: 'Solution Controls',
            panelId: 'solution-controls-panel',
          }),
          makeRibbonControl('ribbon-equations', 'Equations', '求解设置', 'solution-equations-dialog', {
            module: 'Solution Controls',
          }),
          makeRibbonControl('ribbon-limits', 'Limits', '求解设置', 'solution-limits-dialog', {
            module: 'Solution Controls',
          }),
          makeRibbonControl('ribbon-cell-registers', 'Cell Registers', '求解设置', undefined, {
            module: 'Mesh Adaptation',
            panelId: 'cell-registers-panel',
          }),
        ],
      },
      {
        id: 'ribbon-solution-init',
        label: 'Initialization',
        controls: [
          makeRibbonControl('ribbon-initialize', '初始化', 'Initialization', 'initialization-dialog', {
            module: 'Initialization',
            panelId: 'initialization-panel',
          }),
          makeRibbonControl('ribbon-patch', 'Patch', 'Initialization', 'patch-initialization-dialog', {
            module: 'Initialization',
          }),
          makeRibbonControl('ribbon-initialize-fmg', 'FMG Initialization', 'Initialization', 'initialization-dialog', {
            module: 'Initialization',
          }),
        ],
      },
      {
        id: 'ribbon-solution-activities',
        label: 'Activities',
        controls: [
          makeRibbonControl('ribbon-autosave', 'Automatic Saving', 'Activities', 'autosave-dialog', {
            module: 'Calculation Activities',
            panelId: 'calculation-activities-panel',
          }),
          makeRibbonControl('ribbon-execute-commands', 'Execute Commands', 'Activities', undefined, {
            module: 'Calculation Activities',
            panelId: 'calculation-activities-panel',
          }),
          makeRibbonControl('ribbon-data-sampling', 'Data Sampling', 'Activities', undefined, {
            module: 'Calculation Activities',
            panelId: 'calculation-activities-panel',
          }),
        ],
      },
      {
        id: 'ribbon-solution-run',
        label: 'Run Calculation',
        controls: [
          makeRibbonControl('ribbon-check-case', 'Check Case', 'Run Calculation', undefined, {
            module: 'Run Calculation',
            panelId: 'run-calculation-panel',
          }),
          makeRibbonControl('ribbon-run', '运行计算', 'Run Calculation', 'run-calculation-dialog', {
            module: 'Run Calculation',
            panelId: 'run-calculation-panel',
          }),
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
          makeRibbonControl('ribbon-contours', '云图', '图形对象', 'contours-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-vectors', '矢量', '图形对象', 'vectors-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-pathlines', 'Pathlines', '图形对象', 'pathlines-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-particle-tracks', 'Particle Tracks', '图形对象', 'pathlines-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-scene', 'Scene', '图形对象', 'display-options-dialog', {
            module: 'Results',
            panelId: 'graphics-panel',
          }),
        ],
      },
      {
        id: 'ribbon-results-plots',
        label: 'Plots',
        controls: [
          makeRibbonControl('ribbon-xy-plot', 'XY Plot', 'Plots', 'xy-plot-dialog', {
            module: 'Results',
            panelId: 'plots-panel',
          }),
          makeRibbonControl('ribbon-histogram', 'Histogram', 'Plots', undefined, {
            module: 'Results',
            panelId: 'plots-panel',
          }),
          makeRibbonControl('ribbon-fft', 'FFT', 'Plots', undefined, {
            module: 'Results',
            panelId: 'plots-panel',
          }),
        ],
      },
      {
        id: 'ribbon-results-surfaces',
        label: 'Surfaces',
        controls: [
          makeRibbonControl('ribbon-plane-surface', 'Plane Surface', 'Surfaces', 'plane-surface-dialog', {
            module: 'Results',
            panelId: 'surfaces-panel',
          }),
          makeRibbonControl('ribbon-iso-surface', 'Iso-Surface', 'Surfaces', 'iso-surface-dialog', {
            module: 'Results',
            panelId: 'surfaces-panel',
          }),
        ],
      },
      {
        id: 'ribbon-results-reports',
        label: 'Reports',
        controls: [
          makeRibbonControl('ribbon-fluxes-report', 'Fluxes', 'Reports', 'fluxes-report-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-forces-report', 'Forces', 'Reports', 'forces-report-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-surface-integrals', 'Surface Integrals', 'Reports', 'surface-integrals-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-volume-integrals', 'Volume Integrals', 'Reports', 'volume-integrals-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-reports', '报告定义', 'Reports', 'reports-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-sim-report', 'Simulation Report', 'Reports', undefined, {
            module: 'Results',
            panelId: 'simulation-report-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-view',
    label: '查看',
    groups: [
      {
        id: 'ribbon-view-camera',
        label: 'Views',
        controls: [
          makeRibbonControl('ribbon-view-iso', 'Isometric', 'Views', undefined, {
            module: 'Graphics Window',
          }),
          makeRibbonControl('ribbon-view-front', 'Front', 'Views', undefined, {
            module: 'Graphics Window',
          }),
          makeRibbonControl('ribbon-view-top', 'Top', 'Views', undefined, {
            module: 'Graphics Window',
          }),
          makeRibbonControl('ribbon-view-left', 'Left', 'Views', undefined, {
            module: 'Graphics Window',
          }),
          makeRibbonControl('ribbon-view-fit', 'Fit View', 'Views', undefined, {
            module: 'Graphics Window',
          }),
        ],
      },
      {
        id: 'ribbon-view-appearance',
        label: 'Display',
        controls: [
          makeRibbonControl('ribbon-view-display', 'Display Options', 'Display', 'display-options-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-view-lights', 'Lights', 'Display', 'display-options-dialog', {
            module: 'Graphics Window',
          }),
          makeRibbonControl('ribbon-view-colormap', 'Colormap', 'Display', 'display-options-dialog', {
            module: 'Results',
          }),
          makeRibbonControl('ribbon-view-reset', 'Reset Layout', 'Display', undefined, {
            module: 'Graphics Window',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-parallel',
    label: '并行',
    groups: [
      {
        id: 'ribbon-parallel-network',
        label: 'Network',
        controls: [
          makeRibbonControl('ribbon-parallel-processes', 'Show Processes', 'Network', 'parallel-partition-dialog', {
            module: 'Parallel',
          }),
          makeRibbonControl('ribbon-parallel-network', 'Network Check', 'Network', undefined, {
            module: 'Parallel',
          }),
          makeRibbonControl('ribbon-parallel-timer', 'Timer Usage', 'Network', undefined, {
            module: 'Parallel',
          }),
        ],
      },
      {
        id: 'ribbon-parallel-partition',
        label: 'Load Balancing',
        controls: [
          makeRibbonControl('ribbon-parallel-auto-partition', 'Auto Partition', 'Load Balancing', 'parallel-partition-dialog', {
            module: 'Parallel',
          }),
          makeRibbonControl('ribbon-parallel-manual-partition', 'Manual Partition', 'Load Balancing', 'parallel-partition-dialog', {
            module: 'Parallel',
          }),
          makeRibbonControl('ribbon-parallel-check-partition', 'Check Partition', 'Load Balancing', 'parallel-partition-dialog', {
            module: 'Parallel',
          }),
          makeRibbonControl('ribbon-parallel-gpu', 'GPU Solver', 'Load Balancing', 'preferences-dialog', {
            module: 'Parallel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-design',
    label: '设计',
    groups: [
      {
        id: 'ribbon-design-adjoint',
        label: 'Adjoint Solver',
        controls: [
          makeRibbonControl('ribbon-design-adjoint-obs', 'Adjoint Observables', 'Adjoint Solver', 'adjoint-solver-dialog', {
            module: 'Design',
          }),
          makeRibbonControl('ribbon-design-adjoint-methods', 'Adjoint Methods', 'Adjoint Solver', 'adjoint-solver-dialog', {
            module: 'Design',
          }),
          makeRibbonControl('ribbon-design-adjoint-run', 'Adjoint Solver', 'Adjoint Solver', 'adjoint-solver-dialog', {
            module: 'Design',
          }),
        ],
      },
      {
        id: 'ribbon-design-opt',
        label: 'Optimization',
        controls: [
          makeRibbonControl('ribbon-design-morphing', 'Mesh Morphing', 'Optimization', 'adjoint-solver-dialog', {
            module: 'Design',
          }),
          makeRibbonControl('ribbon-design-points', 'Design Points', 'Optimization', 'parameters-table-dialog', {
            module: 'Design',
            panelId: 'parameters-controls-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-parameters',
    label: '参数',
    groups: [
      {
        id: 'ribbon-parameters-manage',
        label: 'Parameters',
        controls: [
          makeRibbonControl('ribbon-param-input', 'Input Parameters', 'Parameters', 'parameters-table-dialog', {
            module: 'Parameters',
            panelId: 'parameters-controls-panel',
          }),
          makeRibbonControl('ribbon-param-output', 'Output Parameters', 'Parameters', 'parameters-table-dialog', {
            module: 'Parameters',
            panelId: 'parameters-controls-panel',
          }),
          makeRibbonControl('ribbon-param-table', 'Parameter Table', 'Parameters', 'parameters-table-dialog', {
            module: 'Parameters',
          }),
          makeRibbonControl('ribbon-param-expressions', 'Named Expressions', 'Parameters', undefined, {
            module: 'Parameters',
            panelId: 'named-expressions-panel',
          }),
        ],
      },
    ],
  },
  {
    id: 'ribbon-tab-help',
    label: '学习和技术支持',
    groups: [
      {
        id: 'ribbon-help-learn',
        label: 'Learning & Tools',
        controls: [
          makeRibbonControl('ribbon-help-walkthrough', '10-Step Guide', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
          makeRibbonControl('ribbon-help-troubleshoot', 'Troubleshooting', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
          makeRibbonControl('ribbon-help-meshing', 'Switch to Meshing', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
          makeRibbonControl('ribbon-help-calculators', 'Parameter Calculators', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
          makeRibbonControl('ribbon-help-formulas', 'Formula Library', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
          makeRibbonControl('ribbon-help-tui', 'TUI Cheatsheet', 'Learning & Tools', undefined, {
            module: 'Help',
          }),
        ],
      },
    ],
  },
]
