import { makeControl, type ControlInput } from './controlHelpers'
import type { DialogTabGroup } from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'

function when(controlId: string, ...values: FluentVisibilityCondition['values']): FluentVisibilityCondition {
  return { controlId, values }
}

function dlgCtrl(
  parentId: string,
  group: string,
  input: Omit<ControlInput, 'region' | 'parentId' | 'group'>,
): FluentMockControl {
  return makeControl({
    ...input,
    region: '模拟窗口',
    parentId,
    group,
  })
}

function makeSimpleDialog(
  id: string,
  title: string,
  module: string,
  subtitle: string,
  controls: Array<Omit<ControlInput, 'region' | 'parentId'>>,
  okOnly = false,
): FluentMockDialog {
  return {
    id,
    title,
    module,
    subtitle,
    okOnly,
    controls: controls.map((ctrl) =>
      makeControl({
        ...ctrl,
        region: '模拟窗口',
        parentId: id,
      }),
    ),
  }
}

export const extendedWorkflowDialogs: FluentMockDialog[] = [
  makeSimpleDialog(
    'mesh-smooth-swap-dialog',
    'Smooth/Swap Mesh',
    'Mesh',
    '对扭曲度较高的四面体/三角形单元执行 Laplace/Skewness 光顺或面交换，提升最小正交质量。',
    [
      { id: 'mesh-smooth-method', label: 'Smoothing Method', module: 'Mesh', group: 'Smooth', controlType: 'select', value: 'Skewness', options: ['Laplace', 'Skewness'] },
      { id: 'mesh-smooth-iterations', label: 'Number of Iterations', module: 'Mesh', group: 'Smooth', controlType: 'field', value: '5' },
      { id: 'mesh-smooth-relax', label: 'Relaxation Factor', module: 'Mesh', group: 'Smooth', controlType: 'field', value: '0.2' },
      { id: 'mesh-smooth-run', label: 'Smooth', module: 'Mesh', group: 'Smooth', controlType: 'button' },
      { id: 'mesh-swap-dihedral', label: 'Min Dihedral Angle (deg)', module: 'Mesh', group: 'Swap', controlType: 'field', value: '10' },
      { id: 'mesh-swap-run', label: 'Swap', module: 'Mesh', group: 'Swap', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'make-polyhedra-dialog',
    'Make Polyhedra',
    'Mesh',
    '将四面体/混合网格合并转换为多面体（Polyhedra）网格，显著减少单元总数并提高梯度求解精度。',
    [
      { id: 'polyhedra-zone', label: 'Target Cell Zone', module: 'Mesh', group: 'Polyhedra', controlType: 'select', value: 'fluid-domain', options: ['fluid-domain', 'all-fluid-zones'] },
      { id: 'polyhedra-preserve-bl', label: 'Preserve Boundary Layers', module: 'Mesh', group: 'Polyhedra', controlType: 'checkbox', defaultSelected: true },
      { id: 'polyhedra-convert-btn', label: 'Convert Domain', module: 'Mesh', group: 'Polyhedra', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'mesh-reorder-dialog',
    'Reorder Mesh',
    'Mesh',
    '通过 Reverse Cuthill-McKee 算法重新编号单元与节点以压缩矩阵带宽并加速缓存访问。',
    [
      { id: 'reorder-method', label: 'Reorder Method', module: 'Mesh', group: 'Reorder', controlType: 'select', value: 'Reverse Cuthill-McKee', options: ['Reverse Cuthill-McKee', 'Bandwidth Reduction'] },
      { id: 'reorder-domain-btn', label: 'Reorder Domain', module: 'Mesh', group: 'Reorder', controlType: 'button' },
      { id: 'reorder-bandwidth-btn', label: 'Print Bandwidth', module: 'Mesh', group: 'Reorder', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'zone-merge-dialog',
    'Merge Zones',
    'Mesh',
    '将同类型的多个边界区或单元区合并为一个区，简化边界条件管理。',
    [
      { id: 'zone-merge-source', label: 'Zones to Merge', module: 'Mesh', group: 'Merge', controlType: 'field', value: 'wall-inlet, wall-elbow' },
      { id: 'zone-merge-target', label: 'New Merged Zone Name', module: 'Mesh', group: 'Merge', controlType: 'field', value: 'wall-heated' },
      { id: 'zone-merge-btn', label: 'Merge Zones', module: 'Mesh', group: 'Merge', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'zone-separate-dialog',
    'Separate Zones',
    'Mesh',
    '按特征角度、连通性或单元标记寄存器拆分体区域或边界面。',
    [
      { id: 'zone-separate-cell-method', label: 'Separation Method', module: 'Mesh', group: 'Cells', controlType: 'select', value: 'Region', options: ['Region', 'Mark'] },
      { id: 'zone-separate-cell-register', label: 'Cell Register', module: 'Mesh', group: 'Cells', controlType: 'field', value: 'high-grad-region', visibleWhen: [when('zone-separate-cell-method', 'Mark')] },
      { id: 'zone-separate-cell-btn', label: 'Separate Cells', module: 'Mesh', group: 'Cells', controlType: 'button' },
      { id: 'zone-separate-face-method', label: 'Face Separation Method', module: 'Mesh', group: 'Faces', controlType: 'select', value: 'Angle', options: ['Angle', 'Face', 'Mark'] },
      { id: 'zone-separate-angle', label: 'Feature Angle (deg)', module: 'Mesh', group: 'Faces', controlType: 'field', value: '40', visibleWhen: [when('zone-separate-face-method', 'Angle')] },
      { id: 'zone-separate-face-btn', label: 'Separate Faces', module: 'Mesh', group: 'Faces', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'zone-delete-dialog',
    'Delete Zone',
    'Mesh',
    '删除无效的死区或多余边界面（仅在清理无流场耦合的多余网格区时使用）。',
    [
      { id: 'zone-delete-type', label: 'Zone Category', module: 'Mesh', group: 'Delete', controlType: 'select', value: 'Cell Zones', options: ['Cell Zones', 'Boundary Zones'] },
      { id: 'zone-delete-name', label: 'Target Zone', module: 'Mesh', group: 'Delete', controlType: 'field', value: 'dead-zone' },
      { id: 'zone-delete-btn', label: 'Delete Zone', module: 'Mesh', group: 'Delete', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'zone-replace-dialog',
    'Replace Zone',
    'Mesh',
    '用指定新区域或合并后的邻接区域替换当前网格区并继承原有边界属性。',
    [
      { id: 'zone-replace-old', label: 'Zone to Replace', module: 'Mesh', group: 'Replace', controlType: 'field', value: 'wall-old' },
      { id: 'zone-replace-new', label: 'Replacement Zone', module: 'Mesh', group: 'Replace', controlType: 'field', value: 'wall-heated' },
      { id: 'zone-replace-btn', label: 'Replace', module: 'Mesh', group: 'Replace', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'zone-append-dialog',
    'Append Case/Mesh',
    'Mesh',
    '在当前算例中追加另一套独立网格文件，常与 Mesh Interfaces 配合构建多组件装配流道。',
    [
      { id: 'zone-append-file', label: 'Mesh File Name', module: 'Mesh', group: 'Append', controlType: 'field', value: 'auxiliary-duct.msh.h5' },
      { id: 'zone-append-merge-nodes', label: 'Merge Duplicate Nodes', module: 'Mesh', group: 'Append', controlType: 'checkbox' },
      { id: 'zone-append-btn', label: 'Append Mesh', module: 'Mesh', group: 'Append', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'overset-interface-dialog',
    'Overset Interfaces',
    'Mesh Interfaces',
    '配置背景网格与运动部件重叠网格（Overset）之间的挖洞与供体单元插值策略。',
    [
      { id: 'overset-name', label: 'Overset Interface', module: 'Mesh Interfaces', group: 'Overset', controlType: 'field', value: 'overset-pair-1' },
      { id: 'overset-bg-zone', label: 'Background Zones', module: 'Mesh Interfaces', group: 'Overset', controlType: 'field', value: 'fluid-domain' },
      { id: 'overset-comp-zone', label: 'Component Zones', module: 'Mesh Interfaces', group: 'Overset', controlType: 'field', value: 'rotor-component' },
      { id: 'overset-donor-method', label: 'Donor Priority Method', module: 'Mesh Interfaces', group: 'Overset', controlType: 'select', value: 'Boundary Distance', options: ['Boundary Distance', 'Cell Volume', 'Zone Based'] },
      { id: 'overset-create-btn', label: 'Create Overset Interface', module: 'Mesh Interfaces', group: 'Overset', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'gap-model-dialog',
    'Gap Model',
    'Dynamic Mesh',
    '在阀门关闭、齿轮啮合等极小间隙位置无需过度加密网格，直接通过流动阻断或阻力模拟密封效应。',
    [
      { id: 'gap-enable', label: 'Enable Gap Model', module: 'Dynamic Mesh', group: 'Gap Model', controlType: 'checkbox' },
      { id: 'gap-zone', label: 'Gap Interface Zone', module: 'Dynamic Mesh', group: 'Gap Model', controlType: 'field', value: 'valve-seat-gap', visibleWhen: [when('gap-enable', true)] },
      { id: 'gap-mode', label: 'Gap Mode', module: 'Dynamic Mesh', group: 'Gap Model', controlType: 'select', value: 'Block Flow', options: ['Block Flow', 'Flow Resistance'], visibleWhen: [when('gap-enable', true)] },
      { id: 'gap-resistance', label: 'Resistance Coefficient', module: 'Dynamic Mesh', group: 'Gap Model', controlType: 'field', value: '1e6', visibleWhen: [when('gap-enable', true), when('gap-mode', 'Flow Resistance')] },
    ],
  ),
  makeSimpleDialog(
    'manage-surfaces-dialog',
    'Manage Surfaces',
    'Results',
    '集中查看、显示和查询已创建切片/线/点表面的几何定义与采样统计。',
    [
      { id: 'manage-surface-selected', label: 'Existing Surfaces', module: 'Results', group: 'Surfaces', controlType: 'select', value: 'plane-center' },
      { id: 'manage-surface-display', label: 'Display Surface', module: 'Results', group: 'Surfaces', controlType: 'button' },
      { id: 'manage-surface-info', label: 'Surface Info', module: 'Results', group: 'Surfaces', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'hybrid-init-settings-dialog',
    'Hybrid Initialization Settings',
    'Initialization',
    '调整 Hybrid Initialization 的拉普拉斯势场迭代步数与欠松弛因子。',
    [
      { id: 'hybrid-init-iterations', label: 'Number of Iterations', module: 'Initialization', group: 'Hybrid Controls', controlType: 'field', value: '10' },
      { id: 'hybrid-init-urf', label: 'Explicit Under-Relaxation Factor', module: 'Initialization', group: 'Hybrid Controls', controlType: 'field', value: '1.0' },
      { id: 'hybrid-init-ref-frame', label: 'Reference Frame', module: 'Initialization', group: 'Hybrid Controls', controlType: 'select', value: 'Relative to Cell Zone', options: ['Relative to Cell Zone', 'Absolute'] },
      { id: 'hybrid-init-const-vel', label: 'Maintain Constant Velocity', module: 'Initialization', group: 'Hybrid Controls', controlType: 'checkbox' },
    ],
  ),
  makeSimpleDialog(
    'execute-commands-dialog',
    'Execute Commands',
    'Calculation Activities',
    '设置在迭代或时间步间隔自动触发的 TUI 命令宏（例如周期性输出通量报告或刷新图形）。',
    [
      { id: 'exec-cmd-name', label: 'Command Name', module: 'Calculation Activities', group: 'Execute Commands', controlType: 'field', value: 'monitor-flux-cmd' },
      { id: 'exec-cmd-every', label: 'Every', module: 'Calculation Activities', group: 'Execute Commands', controlType: 'field', value: '10' },
      { id: 'exec-cmd-when', label: 'When', module: 'Calculation Activities', group: 'Execute Commands', controlType: 'select', value: 'Iteration', options: ['Iteration', 'Time Step'] },
      { id: 'exec-cmd-command', label: 'Command', module: 'Calculation Activities', group: 'Execute Commands', controlType: 'field', value: '/report/fluxes/mass-flow' },
      { id: 'exec-cmd-test', label: 'Test Execute', module: 'Calculation Activities', group: 'Execute Commands', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'data-sampling-dialog',
    'Data Sampling for Time Statistics',
    'Calculation Activities',
    '针对非定常/LES 算例开启时均速度、温度及脉动均方根（RMS）时间统计采样。',
    [
      { id: 'data-sampling-enable', label: 'Data Sampling for Time Statistics', module: 'Calculation Activities', group: 'Data Sampling', controlType: 'checkbox' },
      { id: 'data-sampling-interval', label: 'Sampling Interval (Time Steps)', module: 'Calculation Activities', group: 'Data Sampling', controlType: 'field', value: '1', visibleWhen: [when('data-sampling-enable', true)] },
      { id: 'data-sampling-flow-stats', label: 'Flow Statistics', module: 'Calculation Activities', group: 'Data Sampling', controlType: 'checkbox', defaultSelected: true, visibleWhen: [when('data-sampling-enable', true)] },
      { id: 'data-sampling-wall-stats', label: 'Wall Statistics', module: 'Calculation Activities', group: 'Data Sampling', controlType: 'checkbox', defaultSelected: true, visibleWhen: [when('data-sampling-enable', true)] },
      { id: 'data-sampling-reset', label: 'Reset Statistics', module: 'Calculation Activities', group: 'Data Sampling', controlType: 'button', visibleWhen: [when('data-sampling-enable', true)] },
    ],
  ),
  makeSimpleDialog(
    'statistics-dialog',
    'Solution Statistics',
    'Monitors',
    '查看并统计当前瞬态采集到的时均场与脉动场样本数。',
    [
      { id: 'stats-compute', label: 'Compute Time Statistics', module: 'Monitors', group: 'Statistics', controlType: 'checkbox', defaultSelected: true },
      { id: 'stats-rms', label: 'Include RMS Fluctuations', module: 'Monitors', group: 'Statistics', controlType: 'checkbox', defaultSelected: true },
      { id: 'stats-samples', label: 'Collected Samples', module: 'Monitors', group: 'Statistics', controlType: 'field', value: '120' },
      { id: 'stats-evaluate', label: 'Evaluate Summary', module: 'Monitors', group: 'Statistics', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'histogram-dialog',
    'Histogram',
    'Results',
    '统计网格质量指标或单元/表面物理量的区间分布柱状图。',
    [
      { id: 'histogram-field', label: 'Histogram Variable', module: 'Results', group: 'Histogram', controlType: 'select', value: 'Orthogonal Quality', options: ['Orthogonal Quality', 'Velocity Magnitude', 'Static Temperature', 'Wall Yplus'] },
      { id: 'histogram-bins', label: 'Number of Divisions', module: 'Results', group: 'Histogram', controlType: 'select', value: '5', options: ['5', '8', '10'] },
      { id: 'histogram-plot-btn', label: 'Plot Histogram', module: 'Results', group: 'Histogram', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'fft-dialog',
    'Fourier Transform (FFT)',
    'Results',
    '将瞬态压力脉动或升阻力时域信号变换为频谱/声压级（SPL）曲线，定位主导脱落频率。',
    [
      { id: 'fft-signal', label: 'Signal Source', module: 'Results', group: 'FFT', controlType: 'select', value: 'Pressure Probe', options: ['Pressure Probe', 'Lift Coefficient', 'Acoustic Receiver'] },
      { id: 'fft-y-func', label: 'Y Axis Function', module: 'Results', group: 'FFT', controlType: 'select', value: 'Sound Pressure Level (dB)', options: ['Sound Pressure Level (dB)', 'Magnitude'] },
      { id: 'fft-x-func', label: 'X Axis Function', module: 'Results', group: 'FFT', controlType: 'select', value: 'Frequency (Hz)', options: ['Frequency (Hz)', 'Strouhal Number'] },
      { id: 'fft-window', label: 'Window Function', module: 'Results', group: 'FFT', controlType: 'select', value: 'Hanning', options: ['Hanning', 'Hamming', 'None'] },
      { id: 'fft-plot-btn', label: 'Plot FFT', module: 'Results', group: 'FFT', controlType: 'button' },
    ],
  ),
  makeSimpleDialog(
    'scene-dialog',
    'Scene Composition',
    'Results',
    '将半透明网格、等值云图、速度矢量与流线迹线叠合显示在同一个三维组合视图中。',
    [
      { id: 'scene-show-mesh', label: 'Include Mesh (Wireframe)', module: 'Results', group: 'Scene', controlType: 'checkbox', defaultSelected: true },
      { id: 'scene-show-contours', label: 'Include Contours', module: 'Results', group: 'Scene', controlType: 'checkbox', defaultSelected: true },
      { id: 'scene-show-vectors', label: 'Include Vectors', module: 'Results', group: 'Scene', controlType: 'checkbox', defaultSelected: true },
      { id: 'scene-show-pathlines', label: 'Include Pathlines', module: 'Results', group: 'Scene', controlType: 'checkbox' },
      { id: 'scene-mesh-transparency', label: 'Mesh Opacity', module: 'Results', group: 'Scene', controlType: 'field', value: '0.35' },
      { id: 'scene-display-btn', label: 'Display Scene', module: 'Results', group: 'Scene', controlType: 'button' },
    ],
  ),
]

export const extendedWorkflowDialogTabs: Record<string, DialogTabGroup[]> = {
  'mesh-scale-dialog': [
    { id: 'scale', label: 'Scale', groups: ['缩放', '操作'] },
    { id: 'translate', label: 'Translate', groups: ['Translate'] },
    { id: 'rotate', label: 'Rotate', groups: ['Rotate'] },
  ],
  'mesh-smooth-swap-dialog': [
    { id: 'smooth', label: 'Smooth', groups: ['Smooth'] },
    { id: 'swap', label: 'Swap', groups: ['Swap'] },
  ],
  'dynamic-mesh-dialog': [
    { id: 'methods', label: 'Mesh Methods', groups: ['Methods'] },
    { id: 'options', label: 'Options', groups: ['Options'] },
    { id: 'zones', label: 'Zones & Preview', groups: ['Zones'] },
  ],
  'mesh-adaptation-dialog': [
    { id: 'manual', label: 'Manual Adaptation', groups: ['Register'] },
    { id: 'adapt-controls', label: 'Controls', groups: ['Adaptation Controls'] },
  ],
  'zone-separate-dialog': [
    { id: 'cells', label: 'Cells', groups: ['Cells'] },
    { id: 'faces', label: 'Faces', groups: ['Faces'] },
  ],
  'cell-zone-fluid-dialog': [
    { id: 'reference-frame', label: 'Reference Frame', groups: ['Motion'] },
    { id: 'mesh-motion', label: 'Mesh Motion', groups: ['Mesh Motion'], enabledWhen: [when('cell-zone-mesh-motion', true)] },
    { id: 'porous-zone', label: 'Porous Zone', groups: ['Porous Zone'], enabledWhen: [when('cell-zone-fluid-porous', true)] },
    { id: 'source-terms', label: 'Source Terms', groups: ['Source Terms'], enabledWhen: [when('cell-zone-source-enable', true)] },
    { id: 'fixed-values', label: 'Fixed Values', groups: ['Fixed Values'], enabledWhen: [when('cell-zone-fixed-enable', true)] },
  ],
  'cell-zone-solid-dialog': [
    { id: 'reference-frame', label: 'Reference Frame', groups: ['Reference Frame'] },
    { id: 'mesh-motion', label: 'Mesh Motion', groups: ['Mesh Motion'], enabledWhen: [when('cell-zone-solid-mesh-motion', true)] },
    { id: 'solid-motion', label: 'Solid Motion', groups: ['Solid Motion'], enabledWhen: [when('cell-zone-solid-motion', true)] },
    { id: 'source-terms', label: 'Source Terms', groups: ['Source Terms'], enabledWhen: [when('cell-zone-solid-source-enable', true)] },
    { id: 'fixed-values', label: 'Fixed Values', groups: ['Fixed Values'], enabledWhen: [when('cell-zone-solid-fixed-temp', true), when('general-pressure-based', true)] },
  ],
  'udf-dialog': [
    { id: 'interpreted', label: 'Interpreted', groups: ['Interpreted'] },
    { id: 'compiled', label: 'Compiled', groups: ['UDF', 'Compiled'] },
    { id: 'hooks', label: 'Function Hooks', groups: ['Function Hooks'] },
    { id: 'demand', label: 'Execute On Demand', groups: ['Execute On Demand'] },
  ],
  'solution-controls-dialog': [
    { id: 'under-relaxation', label: 'Under-Relaxation', groups: ['Under-Relaxation'] },
    { id: 'equations', label: 'Equations', groups: ['Equations'] },
    { id: 'limits', label: 'Limits', groups: ['Limits'] },
    { id: 'multigrid', label: 'Multigrid (AMG)', groups: ['Multigrid'] },
  ],
  'residual-monitors-dialog': [
    { id: 'criteria', label: 'Criteria', groups: ['Residuals', 'Display'] },
    { id: 'options', label: 'Options & Plot', groups: ['Residual Options'] },
  ],
  'xy-plot-dialog': [
    { id: 'setup', label: 'Setup', groups: ['XY Plot'] },
    { id: 'axes', label: 'Curves & Axes', groups: ['XY Axes'] },
  ],
  'display-options-dialog': [
    { id: 'rendering', label: 'Rendering', groups: ['Display Options'] },
    { id: 'lights', label: 'Lights', groups: ['Lights'] },
    { id: 'colormap', label: 'Colormap & Legend', groups: ['Display Colormap'] },
  ],
  'parallel-partition-dialog': [
    { id: 'auto-partition', label: 'Auto Partition', groups: ['Partition'] },
    { id: 'manual-partition', label: 'Manual Partition', groups: ['Manual Partition'] },
    { id: 'network-load', label: 'Network & Load', groups: ['Network & Load'] },
  ],
  'adjoint-solver-dialog': [
    { id: 'observables', label: 'Observables', groups: ['Adjoint'] },
    { id: 'methods', label: 'Methods', groups: ['Adjoint Methods'] },
    { id: 'controls', label: 'Controls & Run', groups: ['Adjoint Controls'] },
    { id: 'morphing', label: 'Mesh Morphing', groups: ['Mesh Morphing'] },
  ],
  'parameters-table-dialog': [
    { id: 'input-params', label: 'Input Parameters', groups: ['Parameters'] },
    { id: 'output-params', label: 'Output Parameters', groups: ['Output Parameters'] },
    { id: 'design-points', label: 'Design Points', groups: ['Design Points'] },
  ],
}

export function enhanceWorkflowDialogs(dialog: FluentMockDialog): FluentMockDialog {
  switch (dialog.id) {
    case 'mesh-scale-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, '缩放', {
            id: 'mesh-scale-spec-method',
            label: 'Scaling Option',
            module: 'Mesh',
            controlType: 'select',
            value: 'Specify Scaling Factors',
            options: ['Specify Scaling Factors', 'Specify Domain Extents', 'Convert Units'],
            section: 'Scale Mesh',
          }),
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.group === '操作' ? 'Actions' : 'Scale Mesh',
          })),
          dlgCtrl(dialog.id, '操作', {
            id: 'mesh-scale-unscale',
            label: 'Unscale',
            module: 'Mesh',
            controlType: 'button',
            section: 'Actions',
          }),
          dlgCtrl(dialog.id, 'Translate', {
            id: 'mesh-translate-x',
            label: 'Translation Offset X (m)',
            module: 'Mesh',
            controlType: 'field',
            value: '0',
            section: 'Translate Mesh',
          }),
          dlgCtrl(dialog.id, 'Translate', {
            id: 'mesh-translate-y',
            label: 'Translation Offset Y (m)',
            module: 'Mesh',
            controlType: 'field',
            value: '0',
            section: 'Translate Mesh',
          }),
          dlgCtrl(dialog.id, 'Translate', {
            id: 'mesh-translate-z',
            label: 'Translation Offset Z (m)',
            module: 'Mesh',
            controlType: 'field',
            value: '0',
            section: 'Translate Mesh',
          }),
          dlgCtrl(dialog.id, 'Translate', {
            id: 'mesh-scale-translate-btn',
            label: 'Translate',
            module: 'Mesh',
            controlType: 'button',
            section: 'Actions',
          }),
          dlgCtrl(dialog.id, 'Rotate', {
            id: 'mesh-rotate-angle',
            label: 'Rotation Angle (deg)',
            module: 'Mesh',
            controlType: 'field',
            value: '0',
            section: 'Rotate Mesh',
          }),
          dlgCtrl(dialog.id, 'Rotate', {
            id: 'mesh-rotate-axis',
            label: 'Rotation Axis Vector',
            module: 'Mesh',
            controlType: 'field',
            value: '0, 0, 1',
            section: 'Rotate Mesh',
          }),
          dlgCtrl(dialog.id, 'Rotate', {
            id: 'mesh-rotate-origin',
            label: 'Rotation Origin (m)',
            module: 'Mesh',
            controlType: 'field',
            value: '0, 0, 0',
            section: 'Rotate Mesh',
          }),
          dlgCtrl(dialog.id, 'Rotate', {
            id: 'mesh-scale-rotate-btn',
            label: 'Rotate',
            module: 'Mesh',
            controlType: 'button',
            section: 'Actions',
          }),
        ],
      }

    case 'operating-conditions-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => {
            if (ctrl.id === 'operating-density') {
              return {
                ...ctrl,
                section: 'Gravity & Buoyancy',
                visibleWhen: [when('operating-specified-density', true)],
              }
            }
            return {
              ...ctrl,
              section: ctrl.id === 'operating-pressure' ? 'Pressure' : 'Gravity & Buoyancy',
            }
          }),
          dlgCtrl(dialog.id, 'Operating Conditions', {
            id: 'operating-ref-pressure-loc',
            label: 'Reference Pressure Location (m)',
            module: 'General',
            controlType: 'field',
            value: '0, 0, 0',
            section: 'Pressure',
          }),
          dlgCtrl(dialog.id, 'Operating Conditions', {
            id: 'operating-specified-density',
            label: 'Specified Operating Density',
            module: 'General',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Gravity & Buoyancy',
          }),
          dlgCtrl(dialog.id, 'Operating Conditions', {
            id: 'operating-temp',
            label: 'Operating Temperature (K)',
            module: 'General',
            controlType: 'field',
            value: '288.16',
            section: 'Gravity & Buoyancy',
            visibleWhen: [when('energy-enable', true)],
          }),
        ],
      }

    case 'mesh-display-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.id === 'mesh-display-surfaces' ? 'Surfaces' : 'Options',
          })),
          dlgCtrl(dialog.id, '显示', {
            id: 'mesh-display-edge-type',
            label: 'Edge Type',
            module: 'Mesh',
            controlType: 'select',
            value: 'All',
            options: ['All', 'Feature', 'Outline'],
            section: 'Options',
            visibleWhen: [when('mesh-display-edges', true)],
          }),
          dlgCtrl(dialog.id, '显示', {
            id: 'mesh-display-faces',
            label: 'Faces',
            module: 'Mesh',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, '显示', {
            id: 'mesh-display-shrink',
            label: 'Shrink Factor',
            module: 'Mesh',
            controlType: 'field',
            value: '0',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, '显示', {
            id: 'mesh-display-coloring',
            label: 'Coloring',
            module: 'Mesh',
            controlType: 'select',
            value: 'Color by ID',
            options: ['Color by ID', 'Color by Type'],
            section: 'Surfaces',
          }),
          dlgCtrl(dialog.id, '显示', {
            id: 'mesh-display-run',
            label: 'Display',
            module: 'Mesh',
            controlType: 'button',
            section: 'Surfaces',
          }),
        ],
      }

    case 'dynamic-mesh-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.group === 'Zones' ? 'Dynamic Mesh Zones' : 'Mesh Methods',
          })),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-smoothing-method',
            label: 'Smoothing Method',
            module: 'Dynamic Mesh',
            controlType: 'select',
            value: 'Diffusion',
            options: ['Spring/Laplace/Boundary Layer', 'Diffusion', 'Linearly Elastic Solid'],
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-smoothing', true)],
          }),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-spring-factor',
            label: 'Spring Constant / Diffusion Parameter',
            module: 'Dynamic Mesh',
            controlType: 'field',
            value: '0.5',
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-smoothing', true)],
          }),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-layering-option',
            label: 'Layering Option',
            module: 'Dynamic Mesh',
            controlType: 'select',
            value: 'Height Based',
            options: ['Height Based', 'Ratio Based'],
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-layering', true)],
          }),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-split-factor',
            label: 'Split Factor / Collapse Factor',
            module: 'Dynamic Mesh',
            controlType: 'field',
            value: '0.4 / 0.2',
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-layering', true)],
          }),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-remesh-skew',
            label: 'Maximum Cell Skewness',
            module: 'Dynamic Mesh',
            controlType: 'field',
            value: '0.7',
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-remeshing', true)],
          }),
          dlgCtrl(dialog.id, 'Methods', {
            id: 'dynamic-mesh-remesh-interval',
            label: 'Size Remeshing Interval',
            module: 'Dynamic Mesh',
            controlType: 'field',
            value: '5',
            section: 'Method Settings',
            visibleWhen: [when('dynamic-mesh-remeshing', true)],
          }),
          dlgCtrl(dialog.id, 'Options', {
            id: 'dynamic-mesh-in-cylinder',
            label: 'In-Cylinder',
            module: 'Dynamic Mesh',
            controlType: 'checkbox',
            section: 'Motion Options',
          }),
          dlgCtrl(dialog.id, 'Options', {
            id: 'dynamic-mesh-six-dof',
            label: 'Six DOF',
            module: 'Dynamic Mesh',
            controlType: 'checkbox',
            section: 'Motion Options',
          }),
          dlgCtrl(dialog.id, 'Options', {
            id: 'dynamic-mesh-contact',
            label: 'Contact Detection',
            module: 'Dynamic Mesh',
            controlType: 'checkbox',
            section: 'Motion Options',
          }),
          dlgCtrl(dialog.id, 'Zones', {
            id: 'dynamic-mesh-preview',
            label: 'Preview Mesh Motion…',
            module: 'Dynamic Mesh',
            controlType: 'button',
            section: 'Dynamic Mesh Zones',
          }),
        ],
      }

    case 'mesh-adaptation-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({ ...ctrl, section: 'Refinement Criterion' })),
          dlgCtrl(dialog.id, 'Register', {
            id: 'mesh-adaptation-refine-threshold',
            label: 'Refine Threshold',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '0.5',
            section: 'Execution',
          }),
          dlgCtrl(dialog.id, 'Register', {
            id: 'mesh-adaptation-coarsen-threshold',
            label: 'Coarsen Threshold',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '0.05',
            section: 'Execution',
          }),
          dlgCtrl(dialog.id, 'Register', {
            id: 'adapt-run-btn',
            label: 'Adapt',
            module: 'Mesh Adaptation',
            controlType: 'button',
            section: 'Execution',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-method-type',
            label: 'Mesh Method',
            module: 'Mesh Adaptation',
            controlType: 'select',
            value: 'Hanging Node',
            options: ['Hanging Node', 'Conformal'],
            section: 'Adaptation Method',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-max-level',
            label: 'Max Refinement Level',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '2',
            section: 'Adaptation Method',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-min-vol',
            label: 'Min Cell Volume (m³)',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '1e-12',
            section: 'Limits',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-max-cells',
            label: 'Max Number of Cells',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '500000',
            section: 'Limits',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-dynamic-enable',
            label: 'Dynamic Adaptation',
            module: 'Mesh Adaptation',
            controlType: 'checkbox',
            section: 'Limits',
          }),
          dlgCtrl(dialog.id, 'Adaptation Controls', {
            id: 'mesh-adaptation-dynamic-freq',
            label: 'Dynamic Adapt Interval',
            module: 'Mesh Adaptation',
            controlType: 'field',
            value: '10',
            section: 'Limits',
            visibleWhen: [when('mesh-adaptation-dynamic-enable', true)],
          }),
        ],
      }

    case 'material-create-edit-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.group === 'Create/Edit' ? 'Material Identity' : ctrl.group === 'Operation' ? 'Actions' : 'Properties',
          })),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-density-val',
            label: 'Density (kg/m³)',
            module: 'Materials',
            controlType: 'field',
            value: '1.225',
            section: 'Properties',
            visibleWhen: [when('material-density-method', 'constant', 'boussinesq')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-mol-weight',
            label: 'Molecular Weight (kg/kmol)',
            module: 'Materials',
            controlType: 'field',
            value: '28.966',
            section: 'Properties',
            visibleWhen: [when('material-density-method', 'ideal-gas', 'incompressible-ideal-gas')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-thermal-exp',
            label: 'Thermal Expansion Coeff (1/K)',
            module: 'Materials',
            controlType: 'field',
            value: '0.00333',
            section: 'Properties',
            visibleWhen: [when('material-density-method', 'boussinesq')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-cp-val',
            label: 'Cp (Specific Heat, J/kg·K)',
            module: 'Materials',
            controlType: 'field',
            value: '1006.43',
            section: 'Properties',
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-k-val',
            label: 'Thermal Conductivity (W/m·K)',
            module: 'Materials',
            controlType: 'field',
            value: '0.0242',
            section: 'Properties',
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-viscosity-val',
            label: 'Viscosity (kg/m·s)',
            module: 'Materials',
            controlType: 'field',
            value: '1.7894e-5',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'constant')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-sutherland-mu0',
            label: 'Sutherland Reference Viscosity',
            module: 'Materials',
            controlType: 'field',
            value: '1.716e-5',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'sutherland')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-sutherland-t0',
            label: 'Sutherland Reference Temp (K)',
            module: 'Materials',
            controlType: 'field',
            value: '273.11',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'sutherland')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-sutherland-s',
            label: 'Sutherland Effective Temp (K)',
            module: 'Materials',
            controlType: 'field',
            value: '110.56',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'sutherland')],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-solidus-temp',
            label: 'Solidus Temperature (K)',
            module: 'Materials',
            controlType: 'field',
            value: '273',
            section: 'Properties',
            visibleWhen: [when('solidification-enable', true)],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-liquidus-temp',
            label: 'Liquidus Temperature (K)',
            module: 'Materials',
            controlType: 'field',
            value: '273',
            section: 'Properties',
            visibleWhen: [when('solidification-enable', true)],
          }),
          dlgCtrl(dialog.id, 'Properties', {
            id: 'material-pure-solvent-heat',
            label: 'Pure Solvent Melting Heat (J/kg)',
            module: 'Materials',
            controlType: 'field',
            value: '334000',
            section: 'Properties',
            visibleWhen: [when('solidification-enable', true)],
          }),
          dlgCtrl(dialog.id, 'Operation', {
            id: 'material-open-database',
            label: 'Fluent Database…',
            module: 'Materials',
            controlType: 'button',
            dialogId: 'fluent-database-materials-dialog',
            section: 'Actions',
          }),
        ],
      }

    case 'cell-zone-fluid-dialog': {
      const frameOn = when('cell-zone-fluid-frame-motion', true)
      const porousOn = when('cell-zone-fluid-porous', true)
      const meshMotionOn = when('cell-zone-mesh-motion', true)
      const fixedOn = when('cell-zone-fixed-enable', true)
      return {
        ...dialog,
        sharedGroups: ['Zone Settings'],
        controls: [
          ...dialog.controls.map((control) => {
            if (control.id === 'cell-zone-fluid-material') return {
              ...control, group: 'Zone Settings', visibleWhen: [when('multiphase-model-select', 'Off'), when('species-model-select', 'Off')],
            }
            if (control.controlType === 'checkbox') return { ...control, group: 'Zone Settings' }
            return control
          }),
          dlgCtrl(dialog.id, 'Motion', {
            id: 'cell-zone-frame-origin',
            label: 'Rotation-Axis Origin (m)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '0, 0, 0',
            visibleWhen: [frameOn],
          }),
          dlgCtrl(dialog.id, 'Motion', {
            id: 'cell-zone-frame-axis',
            label: 'Rotation-Axis Direction',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '0, 0, 1',
            visibleWhen: [frameOn],
          }),
          dlgCtrl(dialog.id, 'Motion', {
            id: 'cell-zone-frame-rpm',
            label: 'Rotational Velocity (rpm)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '1200',
            visibleWhen: [frameOn],
          }),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-mesh-motion',
            label: 'Enable Mesh Motion',
            module: 'Cell Zone Conditions',
            controlType: 'checkbox',
          }),
          dlgCtrl(dialog.id, 'Mesh Motion', {
            id: 'cell-zone-mesh-speed',
            label: 'Sliding Mesh Speed (rpm)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '600',
            visibleWhen: [meshMotionOn],
          }),
          dlgCtrl(dialog.id, 'Porous Zone', {
            id: 'cell-zone-porous-dir1',
            label: 'Direction-1 Vector',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '1, 0, 0',
            visibleWhen: [porousOn],
          }),
          dlgCtrl(dialog.id, 'Porous Zone', {
            id: 'cell-zone-porous-viscous',
            label: 'Viscous Resistance (1/m²)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '2.1e7',
            visibleWhen: [porousOn],
          }),
          dlgCtrl(dialog.id, 'Porous Zone', {
            id: 'cell-zone-porous-inertial',
            label: 'Inertial Resistance (1/m)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '120',
            visibleWhen: [porousOn],
          }),
          dlgCtrl(dialog.id, 'Porous Zone', {
            id: 'cell-zone-porous-porosity',
            label: 'Fluid Porosity',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '0.45',
            visibleWhen: [porousOn],
          }),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-source-enable',
            label: 'Enable Source Terms',
            module: 'Cell Zone Conditions',
            controlType: 'checkbox',
          }),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-fixed-enable',
            label: 'Enable Fixed Values',
            module: 'Cell Zone Conditions',
            controlType: 'checkbox',
          }),
          dlgCtrl(dialog.id, 'Fixed Values', {
            id: 'cell-zone-fixed-xvel',
            label: 'Fixed X Velocity (m/s)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '0',
            visibleWhen: [fixedOn, when('general-pressure-based', true)],
          }),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-laminar-zone',
            label: 'Laminar Zone',
            module: 'Cell Zone Conditions',
            controlType: 'checkbox',
            visibleWhen: [when('cell-zone-laminar-available', true)],
          }),
        ],
      }
    }

    case 'cell-zone-solid-dialog':
      return {
        ...dialog,
        sharedGroups: ['Zone Settings'],
        controls: [
          ...dialog.controls.map((control) => {
            if (control.id === 'cell-zone-solid-fixed-temp') return {
              ...control, group: 'Zone Settings', label: 'Enable Fixed Values', visibleWhen: [when('general-pressure-based', true)],
            }
            return control.id === 'cell-zone-solid-material' ? { ...control, group: 'Zone Settings' } : control
          }),
          ...([
            ['frame-motion', 'Frame Motion', 'Reference Frame'],
            ['mesh-motion', 'Mesh Motion', 'Mesh Motion'],
          ] as const).flatMap(([suffix, label, group]) => [
            dlgCtrl(dialog.id, 'Zone Settings', {
              id: `cell-zone-solid-${suffix}`, label, module: 'Cell Zone Conditions', controlType: 'checkbox',
            }),
            dlgCtrl(dialog.id, group, {
              id: `cell-zone-solid-${suffix}-rpm`, label: 'Rotational Velocity (rpm)', module: 'Cell Zone Conditions',
              controlType: 'field', value: '0', visibleWhen: [when(`cell-zone-solid-${suffix}`, true)],
            }),
          ]),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-solid-motion',
            label: 'Solid Motion',
            module: 'Cell Zone Conditions',
            controlType: 'checkbox',
          }),
          dlgCtrl(dialog.id, 'Solid Motion', {
            id: 'cell-zone-solid-rpm',
            label: 'Solid Rotational Speed (rpm)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '0',
            visibleWhen: [when('cell-zone-solid-motion', true)],
          }),
          dlgCtrl(dialog.id, 'Fixed Values', {
            id: 'cell-zone-solid-temp-val',
            label: 'Fixed Solid Temperature (K)',
            module: 'Cell Zone Conditions',
            controlType: 'field',
            value: '350',
            visibleWhen: [when('cell-zone-solid-fixed-temp', true), when('general-pressure-based', true)],
          }),
          dlgCtrl(dialog.id, 'Zone Settings', {
            id: 'cell-zone-solid-source-enable', label: 'Enable Source Terms', module: 'Cell Zone Conditions', controlType: 'checkbox',
          }),
        ],
      }

    case 'wall-roughness-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, 'Wall Roughness', {
            id: 'wall-roughness-model',
            label: 'Roughness Model',
            module: 'Boundary Conditions',
            controlType: 'select',
            value: 'Standard',
            options: ['Standard', 'Roughness Correlation'],
          }),
          ...dialog.controls,
        ],
      }

    case 'pressure-outlet-backflow-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Backflow', {
            id: 'pressure-outlet-radial-eq',
            label: 'Radial Equilibrium Pressure Distribution',
            module: 'Boundary Conditions',
            controlType: 'checkbox',
          }),
          dlgCtrl(dialog.id, 'Backflow', {
            id: 'pressure-outlet-avg-spec',
            label: 'Average Pressure Specification',
            module: 'Boundary Conditions',
            controlType: 'checkbox',
          }),
        ],
      }

    case 'udf-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'udf-source-file' ? { ...ctrl, group: 'Interpreted' } : ctrl,
          ),
          dlgCtrl(dialog.id, 'Interpreted', {
            id: 'udf-interp-stack',
            label: 'Stack Size',
            module: 'User-Defined',
            controlType: 'field',
            value: '10000',
          }),
          dlgCtrl(dialog.id, 'Interpreted', {
            id: 'udf-interpret-btn',
            label: 'Interpret',
            module: 'User-Defined',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Compiled', {
            id: 'udf-compiled-lib',
            label: 'Library Name',
            module: 'User-Defined',
            controlType: 'field',
            value: 'libudf',
          }),
          dlgCtrl(dialog.id, 'Function Hooks', {
            id: 'udf-hook-adjust',
            label: 'Adjust Function',
            module: 'User-Defined',
            controlType: 'select',
            value: 'none',
            options: ['none', 'adjust_source_profile'],
          }),
          dlgCtrl(dialog.id, 'Function Hooks', {
            id: 'udf-hook-init',
            label: 'Initialization Function',
            module: 'User-Defined',
            controlType: 'select',
            value: 'none',
            options: ['none', 'init_parabolic_field'],
          }),
          dlgCtrl(dialog.id, 'Execute On Demand', {
            id: 'udf-demand-func',
            label: 'Execute-on-Demand Function',
            module: 'User-Defined',
            controlType: 'select',
            value: 'calc_wall_heat_flux',
            options: ['calc_wall_heat_flux', 'print_zone_summary'],
          }),
          dlgCtrl(dialog.id, 'Execute On Demand', {
            id: 'udf-demand-run',
            label: 'Execute',
            module: 'User-Defined',
            controlType: 'button',
          }),
        ],
      }

    case 'solution-methods-dialog': {
      const pbns = when('general-pressure-based', true)
      const dbns = when('general-density-based', true)
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'solution-methods-coupling' || ctrl.id === 'solution-methods-pressure'
              ? { ...ctrl, visibleWhen: [...(ctrl.visibleWhen ?? []), pbns] }
              : ctrl,
          ),
          dlgCtrl(dialog.id, 'Pressure-Velocity Coupling', {
            id: 'solution-methods-dbns-formulation',
            label: 'Formulation',
            module: 'Solution Methods',
            controlType: 'select',
            valueId: 'methods-dbns-formulation',
            value: 'Implicit',
            options: ['Implicit', 'Explicit'],
            visibleWhen: [dbns],
          }),
          dlgCtrl(dialog.id, 'Pressure-Velocity Coupling', {
            id: 'solution-methods-dbns-flux',
            label: 'Flux Type',
            module: 'Solution Methods',
            controlType: 'select',
            valueId: 'methods-dbns-flux',
            value: 'Roe-FDS',
            options: ['Roe-FDS', 'AUSM'],
            visibleWhen: [dbns],
          }),
          dlgCtrl(dialog.id, 'Pressure-Velocity Coupling', {
            id: 'solution-methods-dbns-courant',
            label: 'Courant Number',
            module: 'Solution Methods',
            controlType: 'field',
            valueId: 'methods-dbns-courant',
            value: '5.0',
            visibleWhen: [dbns],
          }),
          dlgCtrl(dialog.id, 'Pressure-Velocity Coupling', {
            id: 'solution-methods-coupled-courant',
            label: 'Courant Number (Coupled)',
            module: 'Solution Methods',
            controlType: 'field',
            valueId: 'methods-coupled-courant',
            value: '200',
            visibleWhen: [pbns, when('solution-methods-coupling', 'Coupled')],
          }),
        ],
      }
    }

    case 'solution-controls-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Under-Relaxation', {
            id: 'solution-controls-density',
            label: 'Density URF',
            module: 'Solution Controls',
            controlType: 'field',
            value: '1.0',
          }),
          dlgCtrl(dialog.id, 'Under-Relaxation', {
            id: 'solution-controls-tke',
            label: 'Turbulent Kinetic Energy URF',
            module: 'Solution Controls',
            controlType: 'field',
            value: '0.8',
          }),
          dlgCtrl(dialog.id, 'Equations', {
            id: 'solution-controls-flow-eq',
            label: 'Flow',
            module: 'Solution Controls',
            controlType: 'checkbox',
            defaultSelected: true,
            valueId: 'eq-flow',
          }),
          dlgCtrl(dialog.id, 'Equations', {
            id: 'solution-controls-turb-eq',
            label: 'Turbulence',
            module: 'Solution Controls',
            controlType: 'checkbox',
            defaultSelected: true,
            valueId: 'eq-turbulence',
          }),
          dlgCtrl(dialog.id, 'Limits', {
            id: 'solution-controls-min-temp',
            label: 'Minimum Static Temperature (K)',
            module: 'Solution Controls',
            controlType: 'field',
            valueId: 'limits-min-temp',
            value: '1',
          }),
          dlgCtrl(dialog.id, 'Limits', {
            id: 'solution-controls-max-temp',
            label: 'Maximum Static Temperature (K)',
            module: 'Solution Controls',
            controlType: 'field',
            valueId: 'limits-max-temp',
            value: '5000',
          }),
          dlgCtrl(dialog.id, 'Multigrid', {
            id: 'solution-controls-amg-cycle',
            label: 'AMG Cycle Type',
            module: 'Solution Controls',
            controlType: 'select',
            value: 'Flexible',
            options: ['Flexible', 'V-Cycle', 'W-Cycle', 'F-Cycle'],
          }),
          dlgCtrl(dialog.id, 'Multigrid', {
            id: 'solution-controls-amg-max-cycles',
            label: 'Max Cycles',
            module: 'Solution Controls',
            controlType: 'field',
            value: '30',
          }),
        ],
      }

    case 'initialization-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Method', {
            id: 'initialization-hybrid-more',
            label: 'More Settings…',
            module: 'Initialization',
            controlType: 'button',
            dialogId: 'hybrid-init-settings-dialog',
            visibleWhen: [when('initialization-method', true)],
          }),
        ],
      }

    case 'residual-monitors-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.id === 'residual-monitor-plot' ? 'Options' : 'Equations & Criteria',
          })),
          dlgCtrl(dialog.id, 'Residuals', {
            id: 'residual-vel-criteria',
            label: 'Velocity Criteria',
            module: 'Monitors',
            controlType: 'field',
            value: '1e-5',
            section: 'Equations & Criteria',
          }),
          dlgCtrl(dialog.id, 'Residuals', {
            id: 'residual-turb-criteria',
            label: 'Turbulence Criteria',
            module: 'Monitors',
            controlType: 'field',
            value: '1e-4',
            section: 'Equations & Criteria',
            visibleWhen: [when('viscous-has-tke', true)],
          }),
          dlgCtrl(dialog.id, 'Residuals', {
            id: 'residual-energy-criteria',
            label: 'Energy Criteria',
            module: 'Monitors',
            controlType: 'field',
            value: '1e-6',
            section: 'Equations & Criteria',
            visibleWhen: [when('energy-enable', true)],
          }),
          dlgCtrl(dialog.id, 'Residuals', {
            id: 'residual-check-convergence',
            label: 'Check Convergence',
            module: 'Monitors',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Equations & Criteria',
          }),
          dlgCtrl(dialog.id, 'Residual Options', {
            id: 'residual-normalize',
            label: 'Normalize Residuals',
            module: 'Monitors',
            controlType: 'checkbox',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Residual Options', {
            id: 'residual-print-console',
            label: 'Print to Console',
            module: 'Monitors',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Residual Options', {
            id: 'residual-iters-to-plot',
            label: 'Iterations to Plot',
            module: 'Monitors',
            controlType: 'field',
            value: '1000',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Residual Options', {
            id: 'residual-plot-now',
            label: 'Plot',
            module: 'Monitors',
            controlType: 'button',
            section: 'Options',
          }),
        ],
      }

    case 'contours-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((control) => ({ ...control, section: control.id === 'contours-filled' ? 'Options' : 'Contours' })),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-colormap-select',
            label: 'Colormap',
            module: 'Results',
            controlType: 'select',
            valueId: 'display-options-colormap',
            value: 'Rainbow',
            options: ['Rainbow', 'Blue to Red', 'Turbo', 'Viridis', 'Grayscale'],
            section: 'Coloring',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-coloring', label: 'Coloring', module: 'Results', controlType: 'select', section: 'Coloring',
            value: 'Smooth', options: ['Banded', 'Smooth'], visibleWhen: [when('contours-filled', true)],
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-levels',
            label: 'Levels',
            module: 'Results',
            controlType: 'field',
            value: '20',
            section: 'Coloring',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-node-values',
            label: 'Node Values',
            module: 'Results',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-draw-mesh', label: 'Draw Mesh', module: 'Results', controlType: 'checkbox', section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-global-range',
            label: 'Global Range',
            module: 'Results',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-auto-range',
            label: 'Auto Range',
            module: 'Results',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-min-val',
            label: 'Min Value',
            module: 'Results',
            controlType: 'field',
            value: '0',
            visibleWhen: [when('contours-auto-range', false)],
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', {
            id: 'contours-max-val',
            label: 'Max Value',
            module: 'Results',
            controlType: 'field',
            value: '3.4',
            visibleWhen: [when('contours-auto-range', false)],
            section: 'Options',
          }),
        ],
      }

    case 'vectors-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((control) => ({ ...control, section: control.id === 'vectors-field' ? 'Vectors' : 'Options' })),
          dlgCtrl(dialog.id, 'Vector Options', {
            id: 'vectors-surfaces',
            label: 'Surfaces',
            module: 'Results',
            controlType: 'select',
            value: 'plane-center',
            options: ['all', 'plane-center', 'inlet', 'outlet', 'symmetry'],
            section: 'Vectors',
          }),
          dlgCtrl(dialog.id, 'Vector Options', {
            id: 'vectors-style',
            label: 'Style',
            module: 'Results',
            controlType: 'select',
            value: 'Arrow',
            options: ['3D Arrow', '3D Arrowhead', 'Cone', 'Filled-Arrow', 'Arrow', 'Harpoon', 'Headless'],
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Vector Options', {
            id: 'vectors-color-by',
            label: 'Color By',
            module: 'Results',
            controlType: 'select',
            value: 'Velocity Magnitude',
            options: ['Velocity Magnitude', 'Static Pressure'],
            section: 'Vectors',
          }),
          dlgCtrl(dialog.id, 'Vector Options', {
            id: 'vectors-auto-scale',
            label: 'Auto Scale',
            module: 'Results',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Vector Options', {
            id: 'vectors-draw-mesh', label: 'Draw Mesh', module: 'Results', controlType: 'checkbox', section: 'Options',
          }),
        ],
      }

    case 'xy-plot-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({ ...ctrl, section: 'Plot Setup' })),
          dlgCtrl(dialog.id, 'XY Plot', {
            id: 'xy-plot-node-values',
            label: 'Node Values',
            module: 'Results',
            controlType: 'checkbox',
            defaultSelected: true,
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'XY Plot', {
            id: 'xy-plot-position-x',
            label: 'Position on X Axis',
            module: 'Results',
            controlType: 'select',
            value: 'Direction Vector',
            options: ['Direction Vector', 'X-Coordinate', 'Curve Length'],
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'XY Axes', {
            id: 'xy-plot-log-y',
            label: 'Log Scale Y',
            module: 'Results',
            controlType: 'checkbox',
            section: 'Curves & Axes',
          }),
          dlgCtrl(dialog.id, 'XY Axes', {
            id: 'xy-plot-direction',
            label: 'Plot Direction (X, Y, Z)',
            module: 'Results',
            controlType: 'field',
            value: '1, 0, 0',
            section: 'Curves & Axes',
          }),
          dlgCtrl(dialog.id, 'XY Axes', {
            id: 'xy-plot-write-file',
            label: 'Write to File',
            module: 'Results',
            controlType: 'checkbox',
            section: 'File Output',
          }),
        ],
      }

    case 'report-definition-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, 'Definition', {
            id: 'report-definition-category',
            label: 'Report Category',
            module: 'Report Definitions',
            controlType: 'select',
            value: 'Force',
            options: ['Force', 'Surface', 'Volume', 'Flux'],
            section: 'Definition',
          }),
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.group === 'Monitor' ? 'Monitor' : 'Definition',
          })),
          dlgCtrl(dialog.id, 'Definition', {
            id: 'report-force-per-zone',
            label: 'Per Zone',
            module: 'Report Definitions',
            controlType: 'checkbox',
            section: 'Definition',
            visibleWhen: [when('report-definition-type', 'Force')],
          }),
          dlgCtrl(dialog.id, 'Definition', {
            id: 'report-volume-zones',
            label: 'Cell Zones',
            module: 'Report Definitions',
            controlType: 'select',
            value: 'fluid-domain',
            options: ['fluid-domain', 'all-fluid-zones'],
            section: 'Definition',
            visibleWhen: [when('report-definition-category', 'Volume')],
          }),
          dlgCtrl(dialog.id, 'Monitor', {
            id: 'report-definition-print',
            label: 'Print to Console',
            module: 'Report Definitions',
            controlType: 'checkbox',
            section: 'Monitor',
          }),
        ],
      }

    case 'pathlines-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({ ...ctrl, section: 'Setup' })),
          dlgCtrl(dialog.id, 'Pathlines', {
            id: 'pathlines-color-by',
            label: 'Color By',
            module: 'Results',
            controlType: 'select',
            value: 'Velocity Magnitude',
            options: ['Velocity Magnitude', 'Particle ID', 'Static Temperature'],
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Pathlines', {
            id: 'pathlines-step-size',
            label: 'Step Size (m)',
            module: 'Results',
            controlType: 'field',
            value: '0.005',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Pathlines', {
            id: 'pathlines-style',
            label: 'Line Style',
            module: 'Results',
            controlType: 'select',
            value: 'Line',
            options: ['Line', 'Ribbon', 'Tube', 'Sphere'],
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Pathlines', {
            id: 'pathlines-draw-mesh',
            label: 'Draw Mesh',
            module: 'Results',
            controlType: 'checkbox',
            section: 'Options',
          }),
        ],
      }

    case 'forces-report-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, 'Forces', {
            id: 'forces-option',
            label: 'Options',
            module: 'Results',
            controlType: 'select',
            value: 'Forces',
            options: ['Forces', 'Moments', 'Center of Pressure'],
            section: 'Options',
          }),
          ...dialog.controls.map((ctrl) => ({ ...ctrl, section: 'Zones & Vector' })),
          dlgCtrl(dialog.id, 'Forces', {
            id: 'forces-moment-center',
            label: 'Moment Center (X, Y, Z)',
            module: 'Results',
            controlType: 'field',
            value: '0, 0, 0',
            section: 'Options',
            visibleWhen: [when('forces-option', 'Moments')],
          }),
          dlgCtrl(dialog.id, 'Forces', {
            id: 'forces-print',
            label: 'Print',
            module: 'Results',
            controlType: 'button',
            section: 'Zones & Vector',
          }),
        ],
      }

    case 'surface-integrals-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.id === 'surface-integrals-compute' ? 'Output' : 'Report Setup',
          })),
          dlgCtrl(dialog.id, 'Surface Integrals', {
            id: 'surface-integrals-write-file',
            label: 'Write to File',
            module: 'Results',
            controlType: 'checkbox',
            section: 'Output',
          }),
        ],
      }

    case 'volume-integrals-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({
            ...ctrl,
            section: ctrl.id === 'vol-int-compute' ? 'Cell Zones' : 'Report Setup',
          })),
          dlgCtrl(dialog.id, 'Volume Integrals', {
            id: 'vol-int-zones',
            label: 'Cell Zones',
            module: 'Results',
            controlType: 'select',
            value: 'fluid-domain',
            options: ['fluid-domain', 'all-fluid-zones'],
            section: 'Cell Zones',
          }),
        ],
      }

    case 'periodic-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) => ({ ...ctrl, section: 'Periodic Geometry' })),
          dlgCtrl(dialog.id, 'Periodic', {
            id: 'periodic-axis-origin',
            label: 'Rotation Axis Origin (m)',
            module: 'Boundary Conditions',
            controlType: 'field',
            value: '0, 0, 0',
            section: 'Driving Parameters',
            visibleWhen: [when('periodic-type', 'Rotational')],
          }),
          dlgCtrl(dialog.id, 'Periodic', {
            id: 'periodic-axis-dir',
            label: 'Rotation Axis Direction',
            module: 'Boundary Conditions',
            controlType: 'field',
            value: '0, 0, 1',
            section: 'Driving Parameters',
            visibleWhen: [when('periodic-type', 'Rotational')],
          }),
          dlgCtrl(dialog.id, 'Periodic', {
            id: 'periodic-pressure-grad',
            label: 'Pressure Gradient (Pa/m)',
            module: 'Boundary Conditions',
            controlType: 'field',
            value: '0',
            section: 'Driving Parameters',
            visibleWhen: [when('periodic-type', 'Translational')],
          }),
        ],
      }

    case 'display-options-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'display-options-colormap' || ctrl.id === 'display-options-show-legend'
              ? { ...ctrl, group: 'Display Colormap' }
              : ctrl,
          ),
          dlgCtrl(dialog.id, 'Display Options', {
            id: 'display-options-theme',
            label: 'Workbench Theme',
            module: 'Results',
            controlType: 'select',
            value: 'light',
            options: ['light', 'dark'],
          }),
          dlgCtrl(dialog.id, 'Lights', {
            id: 'display-lights-headlight',
            label: 'Headlight On',
            module: 'Graphics Window',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Lights', {
            id: 'display-lights-ambient',
            label: 'Ambient Light Intensity',
            module: 'Graphics Window',
            controlType: 'field',
            value: '0.35',
          }),
          dlgCtrl(dialog.id, 'Lights', {
            id: 'display-lights-specular',
            label: 'Specular Highlights',
            module: 'Graphics Window',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Display Colormap', {
            id: 'display-legend-font',
            label: 'Legend Text Size',
            module: 'Results',
            controlType: 'select',
            value: 'Normal',
            options: ['Compact', 'Normal', 'Large'],
          }),
        ],
      }

    case 'parallel-partition-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Manual Partition', {
            id: 'partition-manual-axis',
            label: 'Manual Split Axis',
            module: 'Parallel',
            controlType: 'select',
            value: 'X-Coordinate',
            options: ['X-Coordinate', 'Y-Coordinate', 'Zone'],
          }),
          dlgCtrl(dialog.id, 'Manual Partition', {
            id: 'partition-manual-value',
            label: 'Split Threshold (m)',
            module: 'Parallel',
            controlType: 'field',
            value: '0.1',
          }),
          dlgCtrl(dialog.id, 'Manual Partition', {
            id: 'partition-manual-run',
            label: 'Apply Manual Split',
            module: 'Parallel',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Network & Load', {
            id: 'partition-imbalance',
            label: 'Max Cell Imbalance (%)',
            module: 'Parallel',
            controlType: 'field',
            value: '1.6',
          }),
          dlgCtrl(dialog.id, 'Network & Load', {
            id: 'partition-check-btn',
            label: 'Check Partition',
            module: 'Parallel',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Network & Load', {
            id: 'partition-network-btn',
            label: 'Network Check',
            module: 'Parallel',
            controlType: 'button',
          }),
        ],
      }

    case 'adjoint-solver-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.filter((ctrl) => ctrl.id !== 'adjoint-advance'),
          dlgCtrl(dialog.id, 'Adjoint', {
            id: 'adjoint-eval-btn',
            label: 'Evaluate Observable',
            module: 'Design',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Adjoint Methods', {
            id: 'adjoint-stabilization',
            label: 'Stabilization Scheme',
            module: 'Design',
            controlType: 'select',
            value: 'Preconditioned',
            options: ['None', 'Dissipation', 'Preconditioned'],
          }),
          dlgCtrl(dialog.id, 'Adjoint Methods', {
            id: 'adjoint-courant',
            label: 'Adjoint Courant Number',
            module: 'Design',
            controlType: 'field',
            value: '0.5',
          }),
          ...dialog.controls
            .filter((ctrl) => ctrl.id === 'adjoint-advance')
            .map((ctrl) => ({ ...ctrl, group: 'Adjoint Controls' })),
          dlgCtrl(dialog.id, 'Adjoint Controls', {
            id: 'adjoint-init-btn',
            label: 'Initialize Adjoint',
            module: 'Design',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Adjoint Controls', {
            id: 'adjoint-run-btn',
            label: 'Advance Adjoint',
            module: 'Design',
            controlType: 'button',
          }),
          dlgCtrl(dialog.id, 'Mesh Morphing', {
            id: 'adjoint-morph-region',
            label: 'Control Region',
            module: 'Design',
            controlType: 'field',
            value: 'elbow-bend-wall',
          }),
          dlgCtrl(dialog.id, 'Mesh Morphing', {
            id: 'adjoint-morph-target',
            label: 'Target Change (%)',
            module: 'Design',
            controlType: 'field',
            value: '-10',
          }),
          dlgCtrl(dialog.id, 'Mesh Morphing', {
            id: 'adjoint-morph-btn',
            label: 'Apply Morphing',
            module: 'Design',
            controlType: 'button',
          }),
        ],
      }

    case 'parameters-table-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.filter((ctrl) => ctrl.id !== 'param-table-output'),
          dlgCtrl(dialog.id, 'Parameters', {
            id: 'param-table-heatflux',
            label: 'Input: wall_heat_flux',
            module: 'Parameters',
            controlType: 'field',
            value: '1200 W/m²',
          }),
          ...dialog.controls
            .filter((ctrl) => ctrl.id === 'param-table-output')
            .map((ctrl) => ({ ...ctrl, group: 'Output Parameters' })),
          dlgCtrl(dialog.id, 'Output Parameters', {
            id: 'param-table-dp',
            label: 'Output: pressure_drop_out',
            module: 'Parameters',
            controlType: 'field',
            value: '118.4 Pa',
          }),
          dlgCtrl(dialog.id, 'Design Points', {
            id: 'param-dp-select',
            label: 'Design Point',
            module: 'Parameters',
            controlType: 'select',
            value: 'DP 0 (Current)',
            options: ['DP 0 (Current)', 'DP 1 (v=5.0 m/s)', 'DP 2 (v=8.0 m/s)'],
          }),
          dlgCtrl(dialog.id, 'Design Points', {
            id: 'param-dp-update',
            label: 'Update Selected DP',
            module: 'Parameters',
            controlType: 'button',
          }),
        ],
      }

    default:
      return dialog
  }
}
