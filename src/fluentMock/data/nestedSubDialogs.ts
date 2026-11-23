import { makeControl, type ControlInput } from './controlHelpers'
import type { DialogTabGroup } from '../fluentTeachingExtras'
import type { FluentMockControl, FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'

function when(controlId: string, ...values: FluentVisibilityCondition['values']): FluentVisibilityCondition {
  return { controlId, values }
}

function dlgCtrl(
  parentId: string,
  group: string,
  module: string,
  input: Omit<ControlInput, 'region' | 'parentId' | 'group' | 'module'>,
): FluentMockControl {
  return makeControl({
    ...input,
    region: '模拟窗口',
    module,
    parentId,
    group,
  })
}

function makeSubDialog(
  id: string,
  title: string,
  module: string,
  subtitle: string,
  controls: Array<Omit<ControlInput, 'region' | 'parentId' | 'module'>>,
  sharedGroups?: string[],
): FluentMockDialog {
  return {
    id,
    title,
    module,
    subtitle,
    ...(sharedGroups ? { sharedGroups } : {}),
    controls: controls.map((ctrl) =>
      makeControl({
        ...ctrl,
        region: '模拟窗口',
        module,
        parentId: id,
      }),
    ),
  }
}

export const nestedSubDialogs: FluentMockDialog[] = [
  makeSubDialog(
    'case-check-dialog',
    'Case Check',
    'Run Calculation',
    '逐项核查网格、物理模型、边界条件、材料与求解设置的一致性与潜在警告。',
    [
      { id: 'cc-check-quality', label: 'Check Mesh Quality', group: 'Mesh', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-min-vol', label: 'Check Minimum Cell Volume', group: 'Mesh', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-open-mesh-check', label: 'Mesh Check…', group: 'Mesh', controlType: 'button', dialogId: 'mesh-check-dialog' },
      { id: 'cc-check-models', label: 'Verify Active Physical Models', group: 'Models', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-materials', label: 'Verify Assigned Materials', group: 'Models', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-zones', label: 'Check Cell & Boundary Zones', group: 'Boundaries & Zones', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-bc-balance', label: 'Check Inlet/Outlet Pairing', group: 'Boundaries & Zones', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-disc', label: 'Verify Discretization & URF', group: 'Solver', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-check-init', label: 'Check Initialization Status', group: 'Solver', controlType: 'checkbox', defaultSelected: true },
      { id: 'cc-run-btn', label: 'Run Case Check', group: 'Solver', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'mesh-info-dialog',
    'Mesh Info',
    'Mesh',
    '查看当前算例的网格规模、分区数量、区域清单与求解器内存估算。',
    [
      { id: 'mi-info-cells', label: 'Cells', group: 'Size', controlType: 'field', value: '18420' },
      { id: 'mi-info-faces', label: 'Faces', group: 'Size', controlType: 'field', value: '41280' },
      { id: 'mi-info-nodes', label: 'Nodes', group: 'Size', controlType: 'field', value: '21650' },
      { id: 'mi-info-partitions', label: 'Partitions', group: 'Size', controlType: 'field', value: '4' },
      { id: 'mi-info-print-size', label: 'Print Size', group: 'Size', controlType: 'button' },
      { id: 'mi-info-zone-filter', label: 'Zone Filter', group: 'Zones', controlType: 'select', value: 'All', options: ['All', 'Cell Zones', 'Boundary Zones'] },
      { id: 'mi-info-list-zones', label: 'List Zones', group: 'Zones', controlType: 'button' },
      { id: 'mi-info-memory-btn', label: 'Print Memory Usage', group: 'Memory', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'zone-adjacency-dialog',
    'Zone Adjacency',
    'Mesh',
    '查询目标边界面或体区域相邻的体区与边界连接关系，定位孤立或错误连接区域。',
    [
      { id: 'zone-adj-target', label: 'Target Zone', group: 'Adjacency', controlType: 'select', value: 'fluid-domain', options: ['fluid-domain', 'wall-heated', 'velocity-inlet', 'pressure-outlet'] },
      { id: 'zone-adj-include-faces', label: 'Include Adjacent Boundary Faces', group: 'Adjacency', controlType: 'checkbox', defaultSelected: true },
      { id: 'zone-adj-check-btn', label: 'Check Adjacency', group: 'Adjacency', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'interface-orient-dialog',
    'Check Interface Orientation',
    'Mesh Interfaces',
    '校核边界面与交界面法向朝向一致性，避免双面壁耦合或通量方向反转。',
    [
      { id: 'orient-target-zone', label: 'Target Interface / Zone', group: 'Orientation', controlType: 'select', value: 'rotor-stator-interface', options: ['rotor-stator-interface', 'fluid-domain', 'wall-heated'] },
      { id: 'orient-right-handed', label: 'Verify Right-Handed Face Normals', group: 'Orientation', controlType: 'checkbox', defaultSelected: true },
      { id: 'orient-auto-fix', label: 'Auto-Orient Outward Normals', group: 'Orientation', controlType: 'checkbox', defaultSelected: false },
      { id: 'orient-check-btn', label: 'Check Orientation', group: 'Orientation', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'motion-definition-dialog',
    'Motion Definition',
    'Motion Definitions',
    '创建或编辑刚体旋转、平动或 6-DOF 运动规律，供旋转域或滑移/动网格调用。',
    [
      { id: 'motion-def-name', label: 'Motion Name', group: 'Motion', controlType: 'field', value: 'impeller-rotation' },
      { id: 'motion-def-type', label: 'Motion Mode', group: 'Motion', controlType: 'select', value: 'Rotational', options: ['Rotational', 'Translational', 'Six DOF'] },
      { id: 'motion-def-rpm', label: 'Rotational Speed', group: 'Motion', controlType: 'field', value: '1200 rpm', visibleWhen: [when('motion-def-type', 'Rotational')] },
      { id: 'motion-def-axis', label: 'Rotation-Axis Direction', group: 'Motion', controlType: 'field', value: '0, 0, 1', visibleWhen: [when('motion-def-type', 'Rotational')] },
      { id: 'motion-def-origin', label: 'Rotation-Axis Origin (m)', group: 'Motion', controlType: 'field', value: '0, 0, 0', visibleWhen: [when('motion-def-type', 'Rotational')] },
      { id: 'motion-def-vel', label: 'Translational Velocity (m/s)', group: 'Motion', controlType: 'field', value: '1.5, 0, 0', visibleWhen: [when('motion-def-type', 'Translational')] },
      { id: 'motion-def-mass', label: 'Rigid Body Mass (kg)', group: 'Motion', controlType: 'field', value: '2.5', visibleWhen: [when('motion-def-type', 'Six DOF')] },
      { id: 'motion-def-save', label: 'Save Motion', group: 'Motion', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'mesh-interface-create-dialog',
    'Create/Edit Mesh Interfaces',
    'Mesh Interfaces',
    '配对两个非共节点交界面（Interface Zones），配置耦合传热壁面与周期映射选项。',
    [
      { id: 'mi-dlg-name', label: 'Mesh Interface', group: 'Interface', controlType: 'field', value: 'rotor-stator-interface' },
      { id: 'mi-dlg-zone1', label: 'Interface Zone 1', group: 'Interface', controlType: 'select', value: 'interface-rotor', options: ['interface-rotor', 'interface-left'] },
      { id: 'mi-dlg-zone2', label: 'Interface Zone 2', group: 'Interface', controlType: 'select', value: 'interface-stator', options: ['interface-stator', 'interface-right'] },
      { id: 'mi-dlg-coupled', label: 'Coupled Wall', group: 'Interface Options', controlType: 'checkbox', defaultSelected: true },
      { id: 'mi-dlg-periodic', label: 'Periodic Repeats', group: 'Interface Options', controlType: 'checkbox', defaultSelected: false },
      { id: 'mi-dlg-matching', label: 'Matching', group: 'Interface Options', controlType: 'checkbox', defaultSelected: false },
      { id: 'mi-dlg-mapped', label: 'Mapped Interface', group: 'Interface Options', controlType: 'checkbox', defaultSelected: false },
      { id: 'mi-dlg-periodic-type', label: 'Periodic Type', group: 'Interface Options', controlType: 'select', value: 'Rotational', options: ['Rotational', 'Translational'], visibleWhen: [when('mi-dlg-periodic', true)] },
      { id: 'mi-dlg-create-btn', label: 'Create Interface', group: 'Interface Options', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'aux-geometry-dialog',
    'Create/Edit Auxiliary Geometry',
    'Auxiliary Geometry',
    '定义圆柱、长方体、球体或圆锥等辅助虚拟几何体，用于局部单元标记或可视化定位。',
    [
      { id: 'aux-dlg-name', label: 'Geometry Name', group: 'Geometry', controlType: 'field', value: 'aux-cyl-1' },
      { id: 'aux-dlg-shape', label: 'Shape', group: 'Geometry', controlType: 'select', value: 'Cylinder', options: ['Cylinder', 'Box', 'Sphere', 'Cone'] },
      { id: 'aux-dlg-origin', label: 'Origin (m)', group: 'Geometry', controlType: 'field', value: '0, 0, 0' },
      { id: 'aux-dlg-radius', label: 'Radius (m)', group: 'Geometry', controlType: 'field', value: '0.05', visibleWhen: [when('aux-dlg-shape', 'Cylinder', 'Sphere', 'Cone')] },
      { id: 'aux-dlg-height', label: 'Height (m)', group: 'Geometry', controlType: 'field', value: '0.2', visibleWhen: [when('aux-dlg-shape', 'Cylinder', 'Cone')] },
      { id: 'aux-dlg-extents', label: 'Box Extents (m)', group: 'Geometry', controlType: 'field', value: '0,0,0 -> 0.1,0.1,0.1', visibleWhen: [when('aux-dlg-shape', 'Box')] },
      { id: 'aux-dlg-create-btn', label: 'Create Geometry', group: 'Geometry', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'reference-frame-dialog',
    'Reference Frame',
    'Reference Frames',
    '定义静止参考系或旋转/平移移动参考系（MRF），并配置角速度与旋转轴原点。',
    [
      { id: 'rf-dlg-name', label: 'Frame Name', group: 'Reference Frame', controlType: 'field', value: 'mrf-impeller-frame' },
      { id: 'rf-dlg-parent', label: 'Parent Frame', group: 'Reference Frame', controlType: 'select', value: 'global', options: ['global', 'stationary-frame'] },
      { id: 'rf-dlg-motion', label: 'Frame Motion', group: 'Reference Frame', controlType: 'select', value: 'Stationary', options: ['Stationary', 'Moving'] },
      { id: 'rf-dlg-origin', label: 'Origin (m)', group: 'Reference Frame', controlType: 'field', value: '0, 0, 0', visibleWhen: [when('rf-dlg-motion', 'Moving')] },
      { id: 'rf-dlg-axis', label: 'Rotation Axis', group: 'Reference Frame', controlType: 'field', value: '0, 0, 1', visibleWhen: [when('rf-dlg-motion', 'Moving')] },
      { id: 'rf-dlg-omega', label: 'Rotational Velocity (rad/s)', group: 'Reference Frame', controlType: 'field', value: '125.66', visibleWhen: [when('rf-dlg-motion', 'Moving')] },
      { id: 'rf-dlg-trans', label: 'Translational Velocity (m/s)', group: 'Reference Frame', controlType: 'field', value: '0, 0, 0', visibleWhen: [when('rf-dlg-motion', 'Moving')] },
      { id: 'rf-dlg-save-btn', label: 'Create/Update Frame', group: 'Reference Frame', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'named-expression-dialog',
    'Expression Editor',
    'Named Expressions',
    '编写带物理量纲单位的 Named Expression，可用于边界条件、源项或参数化输出。',
    [
      { id: 'expr-dlg-name', label: 'Expression Name', group: 'Expression', controlType: 'field', value: 'inlet_profile' },
      { id: 'expr-dlg-def', label: 'Definition', group: 'Expression', controlType: 'field', value: '2.5 [m s^-1] * (1 - (sqrt(x**2 + y**2) / 0.05 [m])**2)' },
      { id: 'expr-dlg-desc', label: 'Description', group: 'Expression', controlType: 'field', value: 'Parabolic velocity profile at inlet' },
      { id: 'expr-dlg-fn', label: 'Insert Function', group: 'Expression', controlType: 'select', value: 'None', options: ['None', 'sin()', 'cos()', 'sqrt()', 'IF()', 'AreaAve()'] },
      { id: 'expr-dlg-input-param', label: 'Use as Input Parameter', group: 'Expression', controlType: 'checkbox', defaultSelected: false },
      { id: 'expr-dlg-output-param', label: 'Use as Output Parameter', group: 'Expression', controlType: 'checkbox', defaultSelected: false },
      { id: 'expr-dlg-eval-btn', label: 'Evaluate Expression', group: 'Expression', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'curvilinear-dialog',
    'Curvilinear Coordinate System',
    'Curvilinear Coordinates',
    '沿弯曲流道入口至出口生成贴体曲线坐标方向场，用于各向异性多孔阻力或导热。',
    [
      { id: 'curv-dlg-name', label: 'Coordinate Name', group: 'Curvilinear', controlType: 'field', value: 'curv-duct-1' },
      { id: 'curv-dlg-zone', label: 'Target Cell Zone', group: 'Curvilinear', controlType: 'select', value: 'fluid-domain', options: ['fluid-domain', 'all-fluid-zones'] },
      { id: 'curv-dlg-inlet', label: 'Inlet Surface', group: 'Curvilinear', controlType: 'select', value: 'velocity-inlet', options: ['velocity-inlet', 'pressure-inlet'] },
      { id: 'curv-dlg-outlet', label: 'Outlet Surface', group: 'Curvilinear', controlType: 'select', value: 'pressure-outlet', options: ['pressure-outlet', 'outflow'] },
      { id: 'curv-dlg-method', label: 'Generation Method', group: 'Curvilinear', controlType: 'select', value: 'Inlet-to-Outlet Potential', options: ['Inlet-to-Outlet Potential', 'Guide Curve'] },
      { id: 'curv-dlg-compute-btn', label: 'Compute & Display', group: 'Curvilinear', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'cell-register-dialog',
    'New Cell Register',
    'Cell Registers',
    '按空间几何体、物理量场值/梯度、边界邻接或等值面标记局部单元子集。',
    [
      { id: 'reg-dlg-name', label: 'Register Name', group: 'Register', controlType: 'field', value: 'high-grad-region' },
      { id: 'reg-dlg-type', label: 'Register Type', group: 'Register', controlType: 'select', value: 'Field Value', options: ['Region', 'Field Value', 'Boundary', 'Iso-Value'] },
      { id: 'reg-dlg-shape', label: 'Shape Type', group: 'Register', controlType: 'select', value: 'Hexahedron', options: ['Hexahedron', 'Sphere', 'Cylinder'], visibleWhen: [when('reg-dlg-type', 'Region')] },
      { id: 'reg-dlg-min', label: 'Min Point (X, Y, Z)', group: 'Register', controlType: 'field', value: '0, 0, 0', visibleWhen: [when('reg-dlg-type', 'Region')] },
      { id: 'reg-dlg-max', label: 'Max Point (X, Y, Z)', group: 'Register', controlType: 'field', value: '0.2, 0.1, 0.05', visibleWhen: [when('reg-dlg-type', 'Region')] },
      { id: 'reg-dlg-field', label: 'Field Variable', group: 'Register', controlType: 'select', value: 'Velocity Magnitude', options: ['Velocity Magnitude', 'Static Pressure', 'Static Temperature', 'Turbulent Kinetic Energy'], visibleWhen: [when('reg-dlg-type', 'Field Value', 'Iso-Value')] },
      { id: 'reg-dlg-deriv', label: 'Derivative Option', group: 'Register', controlType: 'select', value: 'Gradient', options: ['Value', 'Gradient', 'Curvature'], visibleWhen: [when('reg-dlg-type', 'Field Value')] },
      { id: 'reg-dlg-threshold', label: 'Threshold Value', group: 'Register', controlType: 'field', value: '0.5', visibleWhen: [when('reg-dlg-type', 'Field Value', 'Iso-Value')] },
      { id: 'reg-dlg-bc', label: 'Boundary Zone', group: 'Register', controlType: 'select', value: 'wall-heated', options: ['wall-heated', 'velocity-inlet', 'pressure-outlet'], visibleWhen: [when('reg-dlg-type', 'Boundary')] },
      { id: 'reg-dlg-inside', label: 'Mark Cells Inside', group: 'Register', controlType: 'checkbox', defaultSelected: true },
      { id: 'reg-dlg-mark-btn', label: 'Save & Mark', group: 'Register', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'solution-animation-dialog',
    'Animation Definition',
    'Animations',
    '定义计算过程中的帧录制频率、存储格式与绑定的可视化图形对象。',
    [
      { id: 'anim-dlg-name', label: 'Animation Name', group: 'Animation', controlType: 'field', value: 'velocity-transient-anim' },
      { id: 'anim-dlg-every', label: 'Record After Every', group: 'Animation', controlType: 'field', value: '5' },
      { id: 'anim-dlg-freq', label: 'Record Frequency', group: 'Animation', controlType: 'select', value: 'Time Step', options: ['Time Step', 'Iteration'] },
      { id: 'anim-dlg-storage', label: 'Storage Type', group: 'Animation', controlType: 'select', value: 'HSF File', options: ['HSF File', 'Metafile', 'PPM Image', 'PNG'] },
      { id: 'anim-dlg-object', label: 'Display Object', group: 'Animation', controlType: 'select', value: 'contour-1', options: ['contour-1', 'vector-1', 'pathlines-1', 'scene-1'] },
      { id: 'anim-dlg-preview', label: 'Preview Frame', group: 'Animation', controlType: 'button' },
      { id: 'anim-dlg-open-playback', label: 'Playback…', group: 'Animation', controlType: 'button', dialogId: 'animation-playback-dialog' },
    ],
  ),
  makeSubDialog(
    'animation-playback-dialog',
    'Animation Playback',
    'Animations',
    '回放已录制的仿真动画序列并导出为视频或连续帧图像文件。',
    [
      { id: 'anim-play-seq', label: 'Sequences', group: 'Playback', controlType: 'select', value: 'velocity-transient-anim', options: ['velocity-transient-anim', 'pressure-transient-anim'] },
      { id: 'anim-play-speed', label: 'Playback Speed', group: 'Playback', controlType: 'select', value: '1x', options: ['0.5x', '1x', '2x'] },
      { id: 'anim-play-loop', label: 'Loop Mode', group: 'Playback', controlType: 'select', value: 'Repeat', options: ['Repeat', 'Once', 'Autoreverse'] },
      { id: 'anim-play-export', label: 'Write Format', group: 'Playback', controlType: 'select', value: 'MPEG', options: ['MPEG', 'AVI', 'Picture Frames'] },
      { id: 'anim-play-run', label: 'Play', group: 'Playback', controlType: 'button' },
      { id: 'anim-play-write', label: 'Write Animation', group: 'Playback', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'case-summary-dialog',
    'Case Summary',
    'Results',
    '汇总打印当前算例的网格拓扑、启用模型、材料物性、边界条件与求解设置报告。',
    [
      { id: 'csum-models', label: 'Include Models', group: 'Summary', controlType: 'checkbox', defaultSelected: true },
      { id: 'csum-bc', label: 'Include Boundary Conditions', group: 'Summary', controlType: 'checkbox', defaultSelected: true },
      { id: 'csum-materials', label: 'Include Material Properties', group: 'Summary', controlType: 'checkbox', defaultSelected: true },
      { id: 'csum-solver', label: 'Include Solver Settings', group: 'Summary', controlType: 'checkbox', defaultSelected: true },
      { id: 'csum-print', label: 'Print Summary', group: 'Summary', controlType: 'button' },
      { id: 'csum-write', label: 'Write Summary', group: 'Summary', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'simulation-report-dialog',
    'Simulation Report',
    'Simulation Report',
    '配置仿真技术报告的标题、内容章节与导出格式（HTML / PDF / Markdown）。',
    [
      { id: 'simrep-title', label: 'Report Title', group: 'General', controlType: 'field', value: 'Mixing Elbow CFD Analysis Report' },
      { id: 'simrep-author', label: 'Author', group: 'General', controlType: 'field', value: 'CFD Engineer' },
      { id: 'simrep-format', label: 'Output Format', group: 'General', controlType: 'select', value: 'HTML', options: ['HTML', 'PDF', 'Markdown'] },
      { id: 'simrep-sec-mesh', label: 'Include Mesh Summary', group: 'Sections', controlType: 'checkbox', defaultSelected: true },
      { id: 'simrep-sec-physics', label: 'Include Physics & Models', group: 'Sections', controlType: 'checkbox', defaultSelected: true },
      { id: 'simrep-sec-residuals', label: 'Include Residuals & Monitors', group: 'Sections', controlType: 'checkbox', defaultSelected: true },
      { id: 'simrep-sec-graphics', label: 'Include Post-Processing Graphics', group: 'Sections', controlType: 'checkbox', defaultSelected: true },
      { id: 'simrep-dir', label: 'Output Directory', group: 'Export', controlType: 'field', value: './reports' },
      { id: 'simrep-generate-btn', label: 'Generate Report', group: 'Export', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'parallel-network-dialog',
    'Parallel Network & Processes',
    'Parallel',
    '检查多进程 MPI 互联网络带宽、节点延迟及当前主机进程负载分布。',
    [
      { id: 'pnet-interconnect', label: 'MPI Interconnect', group: 'Network', controlType: 'select', value: 'default', options: ['default', 'msmpi', 'intel', 'ofed'] },
      { id: 'pnet-host-check', label: 'Verify Host Connectivity', group: 'Network', controlType: 'checkbox', defaultSelected: true },
      { id: 'pnet-bandwidth-test', label: 'Run Network Check', group: 'Network', controlType: 'button' },
      { id: 'pnet-show-hosts', label: 'Show Host Processes', group: 'Network', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'parallel-timer-dialog',
    'Performance Timer Usage',
    'Parallel',
    '打印或重置求解器迭代、线性求解与并行 MPI 通信耗时统计，定位性能瓶颈。',
    [
      { id: 'ptimer-scope', label: 'Timer Scope', group: 'Timer', controlType: 'select', value: 'Flow Iterations', options: ['Flow Iterations', 'All Timers', 'Communication Only'] },
      { id: 'ptimer-print-btn', label: 'Print Timer Usage', group: 'Timer', controlType: 'button' },
      { id: 'ptimer-reset-btn', label: 'Reset Timers', group: 'Timer', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'gpu-solver-dialog',
    'Native GPU Solver Settings',
    'Parallel',
    '配置 Fluent 原生 GPU 求解器加速设备数、计算精度与物理模型兼容性校验。',
    [
      { id: 'gpu-enable', label: 'Enable Native GPU Solver', group: 'GPU Solver', controlType: 'checkbox', valueId: 'pref-gpu-enable', defaultSelected: false },
      { id: 'gpu-count', label: 'Number of GPUs', group: 'GPU Solver', controlType: 'select', value: '1', options: ['1', '2', '4', '8'], visibleWhen: [when('pref-gpu-enable', true)] },
      { id: 'gpu-precision', label: 'Solver Precision', group: 'GPU Solver', controlType: 'select', value: 'Double', options: ['Double', 'Single'], visibleWhen: [when('pref-gpu-enable', true)] },
      { id: 'gpu-memory-mode', label: 'Memory Mode', group: 'GPU Solver', controlType: 'select', value: 'Balanced', options: ['Balanced', 'Performance', 'Low Memory'], visibleWhen: [when('pref-gpu-enable', true)] },
      { id: 'gpu-check-btn', label: 'Check Physics Compatibility', group: 'GPU Solver', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'material-polynomial-dialog',
    'Polynomial Profile',
    'Materials',
    '输入随绝对温度 T 变化的多项式物性系数：a0 + a1·T + a2·T² + a3·T³。',
    [
      { id: 'mat-poly-count', label: 'Number of Coefficients', group: 'Polynomial', controlType: 'select', value: '3', options: ['2', '3', '4'] },
      { id: 'mat-poly-tmin', label: 'Min Temperature (K)', group: 'Polynomial', controlType: 'field', value: '250' },
      { id: 'mat-poly-tmax', label: 'Max Temperature (K)', group: 'Polynomial', controlType: 'field', value: '1200' },
      { id: 'mat-poly-c0', label: 'Coefficient c0', group: 'Polynomial', controlType: 'field', value: '1.225' },
      { id: 'mat-poly-c1', label: 'Coefficient c1', group: 'Polynomial', controlType: 'field', value: '-0.0032' },
      { id: 'mat-poly-c2', label: 'Coefficient c2', group: 'Polynomial', controlType: 'field', value: '1.2e-6', visibleWhen: [when('mat-poly-count', '3', '4')] },
      { id: 'mat-poly-c3', label: 'Coefficient c3', group: 'Polynomial', controlType: 'field', value: '0', visibleWhen: [when('mat-poly-count', '4')] },
    ],
  ),
  makeSubDialog(
    'material-piecewise-linear-dialog',
    'Piecewise-Linear Profile',
    'Materials',
    '逐点录入不同温度点（K）对应的实验物性表，求解器将在区间内分段线性插值。',
    [
      { id: 'mat-pwl-points', label: 'Number of Points', group: 'Piecewise-Linear', controlType: 'select', value: '3', options: ['2', '3', '4'] },
      { id: 'mat-pwl-t1', label: 'Point 1 Temperature (K)', group: 'Piecewise-Linear', controlType: 'field', value: '300' },
      { id: 'mat-pwl-v1', label: 'Point 1 Value', group: 'Piecewise-Linear', controlType: 'field', value: '1.789e-5' },
      { id: 'mat-pwl-t2', label: 'Point 2 Temperature (K)', group: 'Piecewise-Linear', controlType: 'field', value: '400' },
      { id: 'mat-pwl-v2', label: 'Point 2 Value', group: 'Piecewise-Linear', controlType: 'field', value: '2.286e-5' },
      { id: 'mat-pwl-t3', label: 'Point 3 Temperature (K)', group: 'Piecewise-Linear', controlType: 'field', value: '500', visibleWhen: [when('mat-pwl-points', '3', '4')] },
      { id: 'mat-pwl-v3', label: 'Point 3 Value', group: 'Piecewise-Linear', controlType: 'field', value: '2.671e-5', visibleWhen: [when('mat-pwl-points', '3', '4')] },
      { id: 'mat-pwl-t4', label: 'Point 4 Temperature (K)', group: 'Piecewise-Linear', controlType: 'field', value: '600', visibleWhen: [when('mat-pwl-points', '4')] },
      { id: 'mat-pwl-v4', label: 'Point 4 Value', group: 'Piecewise-Linear', controlType: 'field', value: '3.017e-5', visibleWhen: [when('mat-pwl-points', '4')] },
    ],
  ),
  makeSubDialog(
    'material-power-law-dialog',
    'Power-Law Viscosity',
    'Materials',
    '设置非牛顿幂律流体黏度模型或温度幂律指数模型参数与剪切黏度截断上下限。',
    [
      { id: 'mat-plaw-type', label: 'Power Law Variant', group: 'Power-Law', controlType: 'select', value: 'Non-Newtonian Power Law', options: ['Non-Newtonian Power Law', 'Temperature Power Law'] },
      { id: 'mat-plaw-k', label: 'Consistency Index k (kg·s^(n-2)/m)', group: 'Power-Law', controlType: 'field', value: '0.001' },
      { id: 'mat-plaw-n', label: 'Power-Law Index n', group: 'Power-Law', controlType: 'field', value: '0.85' },
      { id: 'mat-plaw-min', label: 'Minimum Viscosity Limit (kg/m·s)', group: 'Power-Law', controlType: 'field', value: '1e-5' },
      { id: 'mat-plaw-max', label: 'Maximum Viscosity Limit (kg/m·s)', group: 'Power-Law', controlType: 'field', value: '1.0' },
    ],
  ),
  makeSubDialog(
    'material-user-database-dialog',
    'User-Defined Database Materials',
    'Materials',
    '从自定义扩展材料库（.scm）中浏览并将专用工程材料复制到当前算例中。',
    [
      { id: 'mat-udb-file', label: 'Database File', group: 'User Database', controlType: 'field', value: 'user_materials.scm' },
      { id: 'mat-udb-type', label: 'Material Category', group: 'User Database', controlType: 'select', value: 'fluid', options: ['fluid', 'solid'] },
      { id: 'mat-udb-fluid', label: 'User Fluid Materials', group: 'User Database', controlType: 'select', value: 'custom-oil', options: ['custom-oil', 'nanofluid-al2o3', 'glycol-water'], visibleWhen: [when('mat-udb-type', 'fluid')] },
      { id: 'mat-udb-solid', label: 'User Solid Materials', group: 'User Database', controlType: 'select', value: 'alloy-inconel', options: ['alloy-inconel', 'silicon-carbide'], visibleWhen: [when('mat-udb-type', 'solid')] },
      { id: 'mat-udb-copy', label: 'Copy to Case', group: 'User Database', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'dynamic-mesh-incylinder-dialog',
    'In-Cylinder Settings',
    'Dynamic Mesh',
    '设置往复活塞机械（IC 发动机/压缩机）的曲轴转速、起始曲轴转角、冲程与气门升程参数。',
    [
      { id: 'dm-incyl-rpm', label: 'Crank Shaft Speed (rpm)', group: 'In-Cylinder', controlType: 'field', value: '2000' },
      { id: 'dm-incyl-start-ca', label: 'Starting Crank Angle (deg)', group: 'In-Cylinder', controlType: 'field', value: '360' },
      { id: 'dm-incyl-period', label: 'Crank Period (deg)', group: 'In-Cylinder', controlType: 'field', value: '720' },
      { id: 'dm-incyl-step-ca', label: 'Crank Angle Step Size (deg)', group: 'In-Cylinder', controlType: 'field', value: '0.5' },
      { id: 'dm-incyl-stroke', label: 'Piston Stroke (m)', group: 'In-Cylinder', controlType: 'field', value: '0.09' },
      { id: 'dm-incyl-rod', label: 'Connecting Rod Length (m)', group: 'In-Cylinder', controlType: 'field', value: '0.15' },
      { id: 'dm-incyl-min-lift', label: 'Minimum Valve Lift (m)', group: 'In-Cylinder', controlType: 'field', value: '0.0002' },
    ],
  ),
  makeSubDialog(
    'dynamic-mesh-sixdof-dialog',
    'Six DOF Solver Settings',
    'Dynamic Mesh',
    '配置流固耦合被动刚体运动（Six-DOF）的重力、隐式耦合开关、质量惯量与自由度约束。',
    [
      { id: 'dm-sixdof-gravity', label: 'Include Gravity', group: 'Six DOF', controlType: 'checkbox', defaultSelected: true },
      { id: 'dm-sixdof-implicit', label: 'Implicit Update', group: 'Six DOF', controlType: 'checkbox', defaultSelected: false },
      { id: 'dm-sixdof-mass', label: 'Body Mass (kg)', group: 'Six DOF', controlType: 'field', value: '1.5' },
      { id: 'dm-sixdof-inertia', label: 'Moments of Inertia (Ixx, Iyy, Izz)', group: 'Six DOF', controlType: 'field', value: '0.02, 0.02, 0.04' },
      { id: 'dm-sixdof-constraints', label: 'DOF Constraints', group: 'Six DOF', controlType: 'select', value: '6-DOF Free', options: ['6-DOF Free', '1-DOF Translation', '1-DOF Rotation'] },
    ],
  ),
  makeSubDialog(
    'dynamic-mesh-contact-dialog',
    'Contact Detection Settings',
    'Dynamic Mesh',
    '设定运动壁面极限接近接触时的最小间隙阈值及接触后的间隙阻断或止动策略。',
    [
      { id: 'dm-contact-thresh', label: 'Contact Gap Threshold (m)', group: 'Contact Detection', controlType: 'field', value: '0.0005' },
      { id: 'dm-contact-method', label: 'Contact Handling Method', group: 'Contact Detection', controlType: 'select', value: 'Gap Model', options: ['Gap Model', 'Porous Resistance', 'Stop Motion'] },
      { id: 'dm-contact-pair', label: 'Contact Boundary Pair', group: 'Contact Detection', controlType: 'field', value: 'valve-seat-pair' },
      { id: 'dm-contact-block', label: 'Block Flow at Contact', group: 'Contact Detection', controlType: 'checkbox', defaultSelected: true },
    ],
  ),
  makeSubDialog(
    'dynamic-mesh-preview-dialog',
    'Mesh Motion Preview',
    'Dynamic Mesh',
    '在求解流场前以给定时间步长空跑检查动态网格光顺、铺层与重构行为，及时暴露负体积。',
    [
      { id: 'dm-prev-dt', label: 'Preview Time Step Size (s)', group: 'Preview', controlType: 'field', value: '0.001' },
      { id: 'dm-prev-steps', label: 'Preview Number of Steps', group: 'Preview', controlType: 'field', value: '20' },
      { id: 'dm-prev-freq', label: 'Display Frequency', group: 'Preview', controlType: 'field', value: '2' },
      { id: 'dm-prev-save', label: 'Save Motion Frames', group: 'Preview', controlType: 'checkbox', defaultSelected: false },
      { id: 'dm-prev-run', label: 'Preview', group: 'Preview', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'dynamic-mesh-events-dialog',
    'Dynamic Mesh Events',
    'Dynamic Mesh',
    '定义在特定物理时间或曲轴转角触发的拓扑事件（如激活/冻结区域或重建滑移交界面）。',
    [
      { id: 'dm-evt-name', label: 'Event Name', group: 'Events', controlType: 'field', value: 'valve-open-event' },
      { id: 'dm-evt-at', label: 'At Time / Crank Angle', group: 'Events', controlType: 'field', value: '0.01 s' },
      { id: 'dm-evt-type', label: 'Event Type', group: 'Events', controlType: 'select', value: 'Activate Cell Zone', options: ['Activate Cell Zone', 'Deactivate Cell Zone', 'Change Zone Type', 'Create Sliding Interface'] },
      { id: 'dm-evt-zone', label: 'Target Zone', group: 'Events', controlType: 'field', value: 'fluid-domain' },
      { id: 'dm-evt-define', label: 'Define Event', group: 'Events', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'viscous-constants-dialog',
    'Viscous Model Constants',
    'Models',
    '查看并微调当前所选湍流模型的经验封闭系数及湍流普朗特数。',
    [
      { id: 'vconst-cmu', label: 'Cmu', group: 'Constants', controlType: 'field', value: '0.09', visibleWhen: [when('viscous-kepsilon', true)] },
      { id: 'vconst-c1e', label: 'C1-Epsilon', group: 'Constants', controlType: 'field', value: '1.44', visibleWhen: [when('viscous-kepsilon', true)] },
      { id: 'vconst-c2e', label: 'C2-Epsilon', group: 'Constants', controlType: 'field', value: '1.92', visibleWhen: [when('viscous-kepsilon', true)] },
      { id: 'vconst-ke-pr', label: 'TKE / TDR Prandtl Number', group: 'Constants', controlType: 'field', value: '1.0 / 1.3', visibleWhen: [when('viscous-kepsilon', true)] },
      { id: 'vconst-alpha-inf', label: 'Alpha_inf*', group: 'Constants', controlType: 'field', value: '0.52', visibleWhen: [when('viscous-kw-sst', true)] },
      { id: 'vconst-beta-i', label: 'Beta_i (Inner)', group: 'Constants', controlType: 'field', value: '0.075', visibleWhen: [when('viscous-kw-sst', true)] },
      { id: 'vconst-a1', label: 'SST a1 Coefficient', group: 'Constants', controlType: 'field', value: '0.31', visibleWhen: [when('viscous-kw-sst', true)] },
      { id: 'vconst-kw-pr', label: 'TKE / Omega Prandtl Number', group: 'Constants', controlType: 'field', value: '1.176 / 2.0', visibleWhen: [when('viscous-kw-sst', true)] },
      { id: 'vconst-cb1', label: 'Cb1', group: 'Constants', controlType: 'field', value: '0.1355', visibleWhen: [when('viscous-sa', true)] },
      { id: 'vconst-cb2', label: 'Cb2', group: 'Constants', controlType: 'field', value: '0.622', visibleWhen: [when('viscous-sa', true)] },
      { id: 'vconst-cv1', label: 'Cv1', group: 'Constants', controlType: 'field', value: '7.1', visibleWhen: [when('viscous-sa', true)] },
      { id: 'vconst-cs', label: 'Smagorinsky Constant Cs', group: 'Constants', controlType: 'field', value: '0.1', visibleWhen: [when('viscous-les', true)] },
      { id: 'vconst-energy-pr', label: 'Energy Prandtl Number', group: 'Constants', controlType: 'field', value: '0.85' },
      { id: 'vconst-reset', label: 'Reset Defaults', group: 'Constants', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'species-chemkin-dialog',
    'CHEMKIN Mechanism Import',
    'Models',
    '导入 CHEMKIN 格式气相化学反应机理、热力学数据库及输运参数文件。',
    [
      { id: 'chemkin-gas-file', label: 'CHEMKIN Gas-Phase Input File', group: 'CHEMKIN', controlType: 'field', value: 'gri30.inp' },
      { id: 'chemkin-thermo-file', label: 'Thermodynamic Database File', group: 'CHEMKIN', controlType: 'field', value: 'thermo30.dat' },
      { id: 'chemkin-trans-file', label: 'Transport Database File', group: 'CHEMKIN', controlType: 'field', value: 'tran30.dat' },
      { id: 'chemkin-surf-file', label: 'Surface Chemistry File (Optional)', group: 'CHEMKIN', controlType: 'field', value: '' },
      { id: 'chemkin-import-btn', label: 'Import Mechanism', group: 'CHEMKIN', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'species-reactions-dialog',
    'Reactions',
    'Models',
    '定义体相化学反应机理的 Arrhenius 指前因子、活化能与温度指数参数。',
    [
      { id: 'rxn-total', label: 'Total Number of Reactions', group: 'Reactions', controlType: 'field', value: '1' },
      { id: 'rxn-name', label: 'Reaction Name', group: 'Reactions', controlType: 'field', value: 'ch4-air-1step' },
      { id: 'rxn-pre-exp', label: 'Pre-Exponential Factor', group: 'Reactions', controlType: 'field', value: '2.119e11' },
      { id: 'rxn-act-energy', label: 'Activation Energy (J/kgmol)', group: 'Reactions', controlType: 'field', value: '2.027e8' },
      { id: 'rxn-temp-exp', label: 'Temperature Exponent', group: 'Reactions', controlType: 'field', value: '0' },
      { id: 'rxn-save-btn', label: 'Save Reaction', group: 'Reactions', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'species-pdf-table-dialog',
    'PDF Table Generation',
    'Models',
    '配置燃料与氧化剂组分、入口温度与网格点数并预先生成非预混/部分预混 PDF 查询表。',
    [
      { id: 'pdf-tbl-fuel', label: 'Fuel Composition', group: 'PDF Table', controlType: 'field', value: 'ch4: 1.0' },
      { id: 'pdf-tbl-ox', label: 'Oxidizer Composition', group: 'PDF Table', controlType: 'field', value: 'o2: 0.23, n2: 0.77' },
      { id: 'pdf-tbl-tfuel', label: 'Fuel Inlet Temperature (K)', group: 'PDF Table', controlType: 'field', value: '300' },
      { id: 'pdf-tbl-tox', label: 'Oxidizer Inlet Temperature (K)', group: 'PDF Table', controlType: 'field', value: '300' },
      { id: 'pdf-tbl-grid', label: 'Mean Mixture Fraction Grid Points', group: 'PDF Table', controlType: 'field', value: '20' },
      { id: 'pdf-tbl-calc-btn', label: 'Calculate PDF Table', group: 'PDF Table', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'species-pollutants-dialog',
    'Pollutants (NOx / Soot)',
    'Models',
    '开启热力型/快速型/燃料型 NOx 以及碳烟（Soot）污染物后处理/耦合预测模型。',
    [
      { id: 'nox-enable', label: 'Enable NOx Model', group: 'NOx', controlType: 'checkbox', defaultSelected: false },
      { id: 'nox-thermal', label: 'Thermal NOx', group: 'NOx', controlType: 'checkbox', defaultSelected: true, visibleWhen: [when('nox-enable', true)] },
      { id: 'nox-prompt', label: 'Prompt NOx', group: 'NOx', controlType: 'checkbox', defaultSelected: false, visibleWhen: [when('nox-enable', true)] },
      { id: 'nox-fuel', label: 'Fuel NOx', group: 'NOx', controlType: 'checkbox', defaultSelected: false, visibleWhen: [when('nox-enable', true)] },
      { id: 'nox-tci', label: 'Turbulence Interaction Mode', group: 'NOx', controlType: 'select', value: 'temperature', options: ['none', 'temperature', 'temperature-species'], visibleWhen: [when('nox-enable', true)] },
      { id: 'soot-model', label: 'Soot Model', group: 'Soot', controlType: 'select', value: 'Off', options: ['Off', 'One-Step', 'Two-Step', 'Moss-Brookes', 'Method of Moments'] },
      { id: 'soot-fuel', label: 'Soot Fuel Species', group: 'Soot', controlType: 'field', value: 'ch4', visibleWhen: [when('soot-model', 'One-Step', 'Two-Step', 'Moss-Brookes', 'Method of Moments')] },
      { id: 'soot-rad', label: 'Soot-Radiation Interaction', group: 'Soot', controlType: 'checkbox', defaultSelected: false, visibleWhen: [when('soot-model', 'One-Step', 'Two-Step', 'Moss-Brookes', 'Method of Moments')] },
    ],
  ),
  makeSubDialog(
    'radiation-dtrm-rays-dialog',
    'DTRM Ray Tracing',
    'Models',
    '配置离散传递辐射模型（DTRM）的角向射线划分数量与表面聚类数并生成射线文件。',
    [
      { id: 'dtrm-theta', label: 'Theta Divisions', group: 'DTRM Rays', controlType: 'field', value: '2' },
      { id: 'dtrm-phi', label: 'Phi Divisions', group: 'DTRM Rays', controlType: 'field', value: '2' },
      { id: 'dtrm-clusters', label: 'Surface Clusters', group: 'DTRM Rays', controlType: 'field', value: '5' },
      { id: 'dtrm-file', label: 'Ray File Name', group: 'DTRM Rays', controlType: 'field', value: 'dtrm.ray' },
      { id: 'dtrm-compute-btn', label: 'Compute Rays', group: 'DTRM Rays', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'battery-echemistry-dialog',
    'Battery E-Chemistry Parameters',
    'Models',
    '设置电化学子模型（NTGK / ECM / Newman P2D）的电芯标称电压、容量与内阻参数。',
    [
      { id: 'bat-echem-model', label: 'Submodel Type', group: 'E-Chemistry', controlType: 'select', value: 'NTGK', options: ['NTGK', 'ECM', 'Newman P2D'] },
      { id: 'bat-echem-vnom', label: 'Nominal Voltage (V)', group: 'E-Chemistry', controlType: 'field', value: '3.7' },
      { id: 'bat-echem-vrange', label: 'Min / Max Stop Voltage (V)', group: 'E-Chemistry', controlType: 'field', value: '2.8 - 4.2' },
      { id: 'bat-echem-cap', label: 'Reference Capacity (Ah)', group: 'E-Chemistry', controlType: 'field', value: '14.6' },
      { id: 'bat-echem-r0', label: 'Internal Ohmic Resistance R0 (Ohm)', group: 'E-Chemistry', controlType: 'field', value: '0.015', visibleWhen: [when('bat-echem-model', 'ECM')] },
      { id: 'bat-echem-thick', label: 'Anode / Cathode Thickness (um)', group: 'E-Chemistry', controlType: 'field', value: '70 / 73', visibleWhen: [when('bat-echem-model', 'Newman P2D')] },
    ],
  ),
  makeSubDialog(
    'dpm-rosin-rammler-dialog',
    'Rosin-Rammler Diameter Distribution',
    'Models',
    '定义离散相颗粒粒径的 Rosin-Rammler 对数分布参数（最小/最大/平均粒径与分布指数）。',
    [
      { id: 'dpm-rr-min', label: 'Min. Diameter (m)', group: 'Rosin-Rammler', controlType: 'field', value: '1e-6' },
      { id: 'dpm-rr-max', label: 'Max. Diameter (m)', group: 'Rosin-Rammler', controlType: 'field', value: '1e-4' },
      { id: 'dpm-rr-mean', label: 'Mean Diameter (m)', group: 'Rosin-Rammler', controlType: 'field', value: '2e-5' },
      { id: 'dpm-rr-spread', label: 'Spread Parameter', group: 'Rosin-Rammler', controlType: 'field', value: '3.5' },
      { id: 'dpm-rr-count', label: 'Number of Diameters', group: 'Rosin-Rammler', controlType: 'field', value: '10' },
    ],
  ),
  makeSubDialog(
    'cell-zone-source-edit-dialog',
    'Edit Source Term Profile',
    'Cell Zone Conditions',
    '选择对应控制方程的体积源项数量及定义方式（常数、表达式或 UDF 钩子）。',
    [
      { id: 'src-edit-eq', label: 'Source Equation', group: 'Source Profile', controlType: 'select', value: 'Energy', options: ['Mass', 'X-Momentum', 'Y-Momentum', 'Z-Momentum', 'Energy'] },
      { id: 'src-edit-count', label: 'Number of Sources', group: 'Source Profile', controlType: 'select', value: '1', options: ['1', '2'] },
      { id: 'src-edit-method', label: 'Source Input Method', group: 'Source Profile', controlType: 'select', value: 'constant', options: ['constant', 'expression', 'udf'] },
      { id: 'src-edit-val', label: 'Constant Value', group: 'Source Profile', controlType: 'field', value: '0', visibleWhen: [when('src-edit-method', 'constant')] },
      { id: 'src-edit-expr', label: 'Source Expression', group: 'Source Profile', controlType: 'field', value: '1000 [W m^-3]', visibleWhen: [when('src-edit-method', 'expression')] },
      { id: 'src-edit-udf', label: 'Source UDF Function', group: 'Source Profile', controlType: 'select', value: 'source_heat_udf', options: ['source_heat_udf', 'source_mom_udf'], visibleWhen: [when('src-edit-method', 'udf')] },
    ],
  ),
  makeSubDialog(
    'porous-advanced-dialog',
    'Porous Zone Advanced Options',
    'Cell Zone Conditions',
    '设置多孔介质的速度公式（表观速度 vs 物理速度）及非平衡双能量方程热交换参数。',
    [
      { id: 'porous-adv-form', label: 'Porous Formulation', group: 'Porous Advanced', controlType: 'select', value: 'Superficial Velocity', options: ['Superficial Velocity', 'Physical Velocity'] },
      { id: 'porous-adv-rel', label: 'Relative Velocity Resistance Formulation', group: 'Porous Advanced', controlType: 'checkbox', defaultSelected: false },
      { id: 'porous-adv-thermal', label: 'Thermal Model', group: 'Porous Advanced', controlType: 'select', value: 'Equilibrium', options: ['Equilibrium', 'Non-Equilibrium'], visibleWhen: [when('energy-enable', true)] },
      { id: 'porous-adv-solid', label: 'Porous Solid Material', group: 'Porous Advanced', controlType: 'select', value: 'aluminum', options: ['aluminum', 'steel', 'copper'], visibleWhen: [when('energy-enable', true), when('porous-adv-thermal', 'Non-Equilibrium')] },
      { id: 'porous-adv-area', label: 'Interfacial Area Density (1/m)', group: 'Porous Advanced', controlType: 'field', value: '500', visibleWhen: [when('energy-enable', true), when('porous-adv-thermal', 'Non-Equilibrium')] },
      { id: 'porous-adv-htc', label: 'Heat Transfer Coefficient (W/m²·K)', group: 'Porous Advanced', controlType: 'field', value: '200', visibleWhen: [when('energy-enable', true), when('porous-adv-thermal', 'Non-Equilibrium')] },
    ],
  ),
  makeSubDialog(
    'boundary-profiles-dialog',
    'Boundary Profiles',
    'Boundary Conditions',
    '读取外部实验或上游计算出口导出的 `.prof` 剖面数据文件并插值映射到当前边界。',
    [
      { id: 'bprof-file', label: 'Profile File Name', group: 'Profiles', controlType: 'field', value: 'inlet_measured.prof' },
      { id: 'bprof-name', label: 'Profile Name', group: 'Profiles', controlType: 'field', value: 'measured-velocity-profile' },
      { id: 'bprof-var', label: 'Field Variable', group: 'Profiles', controlType: 'select', value: 'Velocity Magnitude', options: ['Velocity Magnitude', 'Static Temperature', 'Turbulent Kinetic Energy', 'Heat Flux'] },
      { id: 'bprof-interp', label: 'Interpolation Method', group: 'Profiles', controlType: 'select', value: 'Linear', options: ['Constant', 'Zero-Order', 'Linear', 'Inverse-Distance'] },
      { id: 'bprof-coord', label: 'Coordinate System', group: 'Profiles', controlType: 'select', value: 'Cartesian', options: ['Cartesian', 'Cylindrical'] },
      { id: 'bprof-read-btn', label: 'Read Profile', group: 'Profiles', controlType: 'button' },
      { id: 'bprof-apply-btn', label: 'Apply Profile', group: 'Profiles', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'fan-profile-dialog',
    'Fan Pressure-Jump Profile',
    'Boundary Conditions',
    '定义风扇内部边界面压升 ΔP 随法向流速变化的多项式系数或分段线性性能曲线（P-Q 曲线）。',
    [
      { id: 'fan-curve-type', label: 'Curve Representation', group: 'Fan Curve', controlType: 'select', value: 'Polynomial', options: ['Polynomial', 'Piecewise-Linear'] },
      { id: 'fan-curve-coeffs', label: 'Polynomial Coefficients (c0, c1, c2)', group: 'Fan Curve', controlType: 'field', value: '250, -12.5, -0.8', visibleWhen: [when('fan-curve-type', 'Polynomial')] },
      { id: 'fan-curve-vpts', label: 'Velocity Points (m/s)', group: 'Fan Curve', controlType: 'field', value: '0, 5, 10, 15', visibleWhen: [when('fan-curve-type', 'Piecewise-Linear')] },
      { id: 'fan-curve-ppts', label: 'Pressure Jump Points (Pa)', group: 'Fan Curve', controlType: 'field', value: '250, 210, 130, 20', visibleWhen: [when('fan-curve-type', 'Piecewise-Linear')] },
      { id: 'fan-curve-plot-btn', label: 'Preview Fan Curve', group: 'Fan Curve', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'hotr-options-dialog',
    'High Order Term Relaxation Options',
    'Solution Methods',
    '控制高阶对流离散项的局部延迟松弛因子及参与平滑的输运方程，提升强非正交网格稳定性。',
    [
      { id: 'hotr-factor', label: 'HOTR Relaxation Factor', group: 'HOTR', controlType: 'field', value: '0.25' },
      { id: 'hotr-flow', label: 'Apply to Flow', group: 'HOTR', controlType: 'checkbox', defaultSelected: true },
      { id: 'hotr-turb', label: 'Apply to Turbulence', group: 'HOTR', controlType: 'checkbox', defaultSelected: true },
      { id: 'hotr-energy', label: 'Apply to Energy', group: 'HOTR', controlType: 'checkbox', defaultSelected: false, visibleWhen: [when('energy-enable', true)] },
      { id: 'hotr-species', label: 'Apply to Species', group: 'HOTR', controlType: 'checkbox', defaultSelected: false, visibleWhen: [when('species-model-select', 'Species Transport', 'Non-Premixed Combustion', 'Premixed Combustion', 'Partially Premixed Combustion', 'Composition PDF Transport')] },
    ],
  ),
  makeSubDialog(
    'nita-controls-dialog',
    'Non-Iterative Time Advancement Controls',
    'Solution Methods',
    '设定 NITA 非迭代时间推进在每时间步内的最大子修正次数与外迭代容差。',
    [
      { id: 'nita-max-corr', label: 'Max Corrections per Time Step', group: 'NITA', controlType: 'field', value: '5' },
      { id: 'nita-corr-tol', label: 'Correction Tolerance', group: 'NITA', controlType: 'field', value: '0.25' },
      { id: 'nita-res-tol', label: 'Residual Tolerance', group: 'NITA', controlType: 'field', value: '0.0001' },
      { id: 'nita-relax', label: 'NITA Explicit Relaxation', group: 'NITA', controlType: 'field', value: '1.0' },
    ],
  ),
  makeSubDialog(
    'multigrid-controls-dialog',
    'Multigrid Controls (AMG)',
    'Solution Controls',
    '配置代数多重网格（AMG）的循环策略、终止准则、粗化单元数以及 BCGSTAB 稳定化方法。',
    [
      { id: 'amg-dlg-cycle', label: 'AMG Cycle Type', group: 'Algebraic Multigrid', controlType: 'select', valueId: 'solution-controls-amg-cycle', value: 'Flexible', options: ['Flexible', 'V-Cycle', 'W-Cycle', 'F-Cycle'] },
      { id: 'amg-dlg-term', label: 'Termination Criterion', group: 'Algebraic Multigrid', controlType: 'field', value: '0.1' },
      { id: 'amg-dlg-max-cells', label: 'Max Coarse Cells', group: 'Algebraic Multigrid', controlType: 'field', value: '2' },
      { id: 'amg-dlg-levels', label: 'Max AMG Levels', group: 'Algebraic Multigrid', controlType: 'field', value: '30' },
      { id: 'amg-dlg-smoother', label: 'Smoother Type', group: 'Advanced Stabilization', controlType: 'select', value: 'Gauss-Seidel', options: ['Gauss-Seidel', 'ILU'] },
      { id: 'amg-dlg-stab', label: 'Stabilization Method', group: 'Advanced Stabilization', controlType: 'select', value: 'None', options: ['None', 'BCGSTAB', 'RPM'] },
      { id: 'amg-dlg-verb', label: 'Verbosity Level', group: 'Advanced Stabilization', controlType: 'select', value: '0', options: ['0', '1', '2'] },
    ],
  ),
  makeSubDialog(
    'residual-scaling-dialog',
    'Residual Scaling & Normalization',
    'Monitors',
    '调整残差收敛判据模式（绝对/相对）、全局或局部归一化参考基准步数。',
    [
      { id: 'res-scale-crit', label: 'Convergence Criterion', group: 'Scaling', controlType: 'select', value: 'absolute', options: ['absolute', 'relative', 'relative or absolute', 'none'] },
      { id: 'res-scale-mode', label: 'Residual Display Mode', group: 'Scaling', controlType: 'select', value: 'Scale', options: ['Scale', 'Normalize', 'None'] },
      { id: 'res-scale-from', label: 'Scale Reference', group: 'Scaling', controlType: 'select', value: 'Global', options: ['Global', 'Local'] },
      { id: 'res-scale-iters', label: 'Normalization Reference Iterations', group: 'Scaling', controlType: 'field', value: '5' },
      { id: 'res-scale-store', label: 'Compute Local Scaling', group: 'Scaling', controlType: 'checkbox', defaultSelected: true },
    ],
  ),
  makeSubDialog(
    'colormap-options-dialog',
    'Colormap Options',
    'Results',
    '定制图形视口色标图例的配色方案、分段色阶数、停靠方位与数值格式。',
    [
      { id: 'cmap-scheme', label: 'Color Map', group: 'Colormap', controlType: 'select', valueId: 'display-options-colormap', value: 'Rainbow', options: ['Rainbow', 'Blue to Red', 'Turbo', 'Viridis', 'Grayscale'] },
      { id: 'cmap-size', label: 'Colormap Size', group: 'Colormap', controlType: 'field', value: '100' },
      { id: 'cmap-align', label: 'Alignment', group: 'Colormap', controlType: 'select', value: 'Left', options: ['Left', 'Right', 'Top', 'Bottom'] },
      { id: 'cmap-format', label: 'Number Format', group: 'Colormap', controlType: 'select', value: 'float', options: ['float', 'exponential', 'general'] },
      { id: 'cmap-precision', label: 'Precision', group: 'Colormap', controlType: 'field', value: '2' },
      { id: 'cmap-skip', label: 'Label Skip', group: 'Colormap', controlType: 'field', value: '1' },
      { id: 'cmap-log', label: 'Logarithmic Scale', group: 'Colormap', controlType: 'checkbox', defaultSelected: false },
      { id: 'cmap-title', label: 'Show Colormap Title', group: 'Colormap', controlType: 'checkbox', defaultSelected: true },
    ],
  ),
  makeSubDialog(
    'vector-options-dialog',
    'Vector Options',
    'Results',
    '调整速度矢量箭头的三维样式、固定长度模式、箭头比例及显示分量范围。',
    [
      { id: 'vec-opt-style', label: 'Arrow Style', group: 'Vector Options', controlType: 'select', valueId: 'vectors-style', value: 'Arrow', options: ['3D Arrow', '3D Arrowhead', 'Cone', 'Filled-Arrow', 'Arrow', 'Harpoon', 'Headless'] },
      { id: 'vec-opt-fixed', label: 'Fixed Length', group: 'Vector Options', controlType: 'checkbox', defaultSelected: false },
      { id: 'vec-opt-scale-head', label: 'Arrowhead Scale', group: 'Vector Options', controlType: 'field', value: '0.3' },
      { id: 'vec-opt-min', label: 'Min Vector Magnitude', group: 'Vector Options', controlType: 'field', value: '0' },
      { id: 'vec-opt-max', label: 'Max Vector Magnitude', group: 'Vector Options', controlType: 'field', value: '10' },
      { id: 'vec-opt-comp', label: 'Component Filter', group: 'Vector Options', controlType: 'select', value: 'All', options: ['All', 'X Only', 'Y Only', 'Z Only'] },
    ],
  ),
  makeSubDialog(
    'pathline-attributes-dialog',
    'Pathline Attributes',
    'Results',
    '定制迹线的几何管线样式、线宽半径、逆向追踪、表面油流图与动态脉冲效果。',
    [
      { id: 'path-attr-style', label: 'Pathline Style', group: 'Attributes', controlType: 'select', valueId: 'pathlines-style', value: 'Line', options: ['Line', 'Ribbon', 'Tube', 'Sphere'] },
      { id: 'path-attr-width', label: 'Line Width (px)', group: 'Attributes', controlType: 'field', value: '2' },
      { id: 'path-attr-radius', label: 'Tube Radius (m)', group: 'Attributes', controlType: 'field', value: '0.002', visibleWhen: [when('pathlines-style', 'Tube')] },
      { id: 'path-attr-reverse', label: 'Reverse Pathlines', group: 'Attributes', controlType: 'checkbox', defaultSelected: false },
      { id: 'path-attr-oil', label: 'Oil Flow Mode', group: 'Attributes', controlType: 'checkbox', defaultSelected: false },
      { id: 'path-attr-pulse', label: 'Pulse Mode', group: 'Attributes', controlType: 'select', value: 'Off', options: ['Off', 'Continuous', 'Single'] },
      { id: 'path-attr-pulse-btn', label: 'Pulse Now', group: 'Attributes', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'xy-plot-axes-dialog',
    'Axes - Solution XY Plot',
    'Results',
    '设置 XY 曲线图的横纵坐标轴范围、对数坐标变换、主次网格线与坐标轴标题。',
    [
      { id: 'xy-ax-which', label: 'Axis', group: 'Axes', controlType: 'select', value: 'X', options: ['X', 'Y'] },
      { id: 'xy-ax-auto', label: 'Auto Range', group: 'Axes', controlType: 'checkbox', defaultSelected: true },
      { id: 'xy-ax-min', label: 'Range Minimum', group: 'Axes', controlType: 'field', value: '0', visibleWhen: [when('xy-ax-auto', false)] },
      { id: 'xy-ax-max', label: 'Range Maximum', group: 'Axes', controlType: 'field', value: '1', visibleWhen: [when('xy-ax-auto', false)] },
      { id: 'xy-ax-log', label: 'Log Scale', group: 'Axes', controlType: 'checkbox', defaultSelected: false },
      { id: 'xy-ax-major', label: 'Major Rules', group: 'Axes', controlType: 'checkbox', defaultSelected: true },
      { id: 'xy-ax-minor', label: 'Minor Rules', group: 'Axes', controlType: 'checkbox', defaultSelected: false },
      { id: 'xy-ax-label', label: 'Axis Label', group: 'Axes', controlType: 'field', value: 'Position (m)' },
    ],
  ),
  makeSubDialog(
    'xy-plot-curves-dialog',
    'Curves - Solution XY Plot',
    'Results',
    '设置 XY 曲线的线型、颜色、线宽与数据点标记符号，便于多曲线对比导出。',
    [
      { id: 'xy-cur-idx', label: 'Curve', group: 'Curves', controlType: 'select', value: 'Curve 0', options: ['Curve 0', 'Curve 1'] },
      { id: 'xy-cur-pattern', label: 'Line Pattern', group: 'Curves', controlType: 'select', value: 'Solid', options: ['Solid', 'Dashed', 'Dotted', 'None'] },
      { id: 'xy-cur-color', label: 'Line Color', group: 'Curves', controlType: 'select', value: 'Blue', options: ['Blue', 'Red', 'Green', 'Black'] },
      { id: 'xy-cur-weight', label: 'Line Weight', group: 'Curves', controlType: 'field', value: '2' },
      { id: 'xy-cur-symbol', label: 'Marker Symbol', group: 'Curves', controlType: 'select', value: 'Circle', options: ['Circle', 'Cross', 'Square', 'Triangle', 'None'] },
      { id: 'xy-cur-size', label: 'Symbol Size', group: 'Curves', controlType: 'field', value: '1.0' },
    ],
  ),
  makeSubDialog(
    'xy-plot-load-file-dialog',
    'Load XY Data File',
    'Results',
    '读取外部实验测试数据或历史基准 `.xy` 曲线文件，与当前 CFD 计算曲线同屏叠加对比。',
    [
      { id: 'xy-load-file', label: 'XY File Name', group: 'Load File', controlType: 'field', value: 'experiment_profile.xy' },
      { id: 'xy-load-label', label: 'Legend Label', group: 'Load File', controlType: 'field', value: 'Exp. Data' },
      { id: 'xy-load-btn', label: 'Load File', group: 'Load File', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'report-plot-options-dialog',
    'Report Plot Options',
    'Monitors',
    '定制实时监控曲线图的图形窗口编号、横轴物理量、Y 轴对数缩放与网格线显示。',
    [
      { id: 'rplot-opt-win', label: 'Graphics Window', group: 'Plot Options', controlType: 'select', value: 'Window 2', options: ['Window 2', 'Window 3', 'Window 4'] },
      { id: 'rplot-opt-xlabel', label: 'X-Axis Label', group: 'Plot Options', controlType: 'select', value: 'Iteration', options: ['Iteration', 'Time Step', 'Flow Time'] },
      { id: 'rplot-opt-logy', label: 'Logarithmic Y-Axis', group: 'Plot Options', controlType: 'checkbox', defaultSelected: false },
      { id: 'rplot-opt-autoscale', label: 'Auto-Scale Axes', group: 'Plot Options', controlType: 'checkbox', defaultSelected: true },
      { id: 'rplot-opt-grid', label: 'Show Grid Lines', group: 'Plot Options', controlType: 'checkbox', defaultSelected: true },
      { id: 'rplot-opt-print', label: 'Print to Console', group: 'Plot Options', controlType: 'checkbox', defaultSelected: false },
    ],
  ),
  makeSubDialog(
    'adjoint-observable-dialog',
    'Manage Adjoint Observables',
    'Design',
    '新建或编辑伴随灵敏度分析的工程目标函数（如压降、阻力、力矩或旋流度）及其作用边界。',
    [
      { id: 'adj-obs-name', label: 'Observable Name', group: 'Observables', controlType: 'field', value: 'pressure-drop-obs' },
      { id: 'adj-obs-op', label: 'Observable Operation', group: 'Observables', controlType: 'select', value: 'Pressure Drop', options: ['Pressure Drop', 'Force', 'Moment', 'Mass Flow', 'Swirl'] },
      { id: 'adj-obs-zones', label: 'Target Zones', group: 'Observables', controlType: 'field', value: 'inlet, outlet' },
      { id: 'adj-obs-weight', label: 'Weighting Factor', group: 'Observables', controlType: 'field', value: '1.0' },
      { id: 'adj-obs-save', label: 'Save Observable', group: 'Observables', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'param-create-dialog',
    'Create Parameter',
    'Parameters',
    '创建用于 Workbench 多工况设计点扫描的输入参数或输出响应参数。',
    [
      { id: 'param-new-role', label: 'Parameter Role', group: 'Create Parameter', controlType: 'select', value: 'Input Parameter', options: ['Input Parameter', 'Output Parameter'] },
      { id: 'param-new-name', label: 'Parameter Name', group: 'Create Parameter', controlType: 'field', value: 'v_in_2' },
      { id: 'param-new-val', label: 'Default Value', group: 'Create Parameter', controlType: 'field', value: '3.5 m/s', visibleWhen: [when('param-new-role', 'Input Parameter')] },
      { id: 'param-new-report', label: 'Linked Report Definition', group: 'Create Parameter', controlType: 'select', value: 'drag-monitor', options: ['drag-monitor', 'outlet-pressure'], visibleWhen: [when('param-new-role', 'Output Parameter')] },
      { id: 'param-new-save', label: 'Create Parameter', group: 'Create Parameter', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'radiator-profile-dialog',
    'Radiator Loss & Heat-Transfer Curve',
    'Boundary Conditions',
    '定义散热器压降损失系数 KL 与换热系数 HTC 随法向流速变化的多项式或分段线性性能表。',
    [
      { id: 'rad-curve-target', label: 'Profile Variable', group: 'Radiator Curve', controlType: 'select', value: 'Loss Coefficient', options: ['Loss Coefficient', 'Heat Transfer Coefficient'] },
      { id: 'rad-curve-type', label: 'Curve Representation', group: 'Radiator Curve', controlType: 'select', value: 'Polynomial', options: ['Polynomial', 'Piecewise-Linear'] },
      { id: 'rad-curve-coeffs', label: 'Polynomial Coefficients (c0, c1, c2)', group: 'Radiator Curve', controlType: 'field', value: '1.5, 0.25, 0.02', visibleWhen: [when('rad-curve-type', 'Polynomial')] },
      { id: 'rad-curve-vpts', label: 'Velocity Points (m/s)', group: 'Radiator Curve', controlType: 'field', value: '1, 3, 6, 10', visibleWhen: [when('rad-curve-type', 'Piecewise-Linear')] },
      { id: 'rad-curve-ypts', label: 'Curve Values', group: 'Radiator Curve', controlType: 'field', value: '1.2, 1.5, 1.85, 2.3', visibleWhen: [when('rad-curve-type', 'Piecewise-Linear')] },
      { id: 'rad-curve-plot-btn', label: 'Preview Radiator Curve', group: 'Radiator Curve', controlType: 'button' },
    ],
  ),
  makeSubDialog(
    'material-nasa-cp-dialog',
    'NASA Piecewise-Polynomial Profile',
    'Materials',
    '设置高温反应流常用的两温区 7 系数 NASA 多项式比热模型 Cp(T)/R = a1 + a2·T + a3·T² + a4·T³ + a5·T⁴。',
    [
      { id: 'mat-nasa-band', label: 'Temperature Range', group: 'NASA Polynomial', controlType: 'select', value: 'Range 1 (Low T)', options: ['Range 1 (Low T)', 'Range 2 (High T)'] },
      { id: 'mat-nasa-tmin', label: 'Min Temperature (K)', group: 'NASA Polynomial', controlType: 'field', value: '200' },
      { id: 'mat-nasa-tmax', label: 'Max Temperature (K)', group: 'NASA Polynomial', controlType: 'field', value: '1000' },
      { id: 'mat-nasa-a1', label: 'Coefficient a1', group: 'NASA Polynomial', controlType: 'field', value: '3.568396' },
      { id: 'mat-nasa-a2', label: 'Coefficient a2', group: 'NASA Polynomial', controlType: 'field', value: '-6.78729e-4' },
      { id: 'mat-nasa-a3', label: 'Coefficient a3', group: 'NASA Polynomial', controlType: 'field', value: '1.55371e-6' },
      { id: 'mat-nasa-a4', label: 'Coefficient a4', group: 'NASA Polynomial', controlType: 'field', value: '-3.29937e-12' },
      { id: 'mat-nasa-a5', label: 'Coefficient a5', group: 'NASA Polynomial', controlType: 'field', value: '-4.66395e-13' },
      { id: 'mat-nasa-a6', label: 'Enthalpy Offset a6', group: 'NASA Polynomial', controlType: 'field', value: '-1.06234e5' },
      { id: 'mat-nasa-a7', label: 'Entropy Offset a7', group: 'NASA Polynomial', controlType: 'field', value: '3.71583' },
    ],
  ),
]

export const nestedSubDialogTabs: Record<string, DialogTabGroup[]> = {
  'case-check-dialog': [
    { id: 'mesh', label: 'Mesh', groups: ['Mesh'] },
    { id: 'models', label: 'Models', groups: ['Models'] },
    { id: 'zones', label: 'Boundaries & Zones', groups: ['Boundaries & Zones'] },
    { id: 'solver', label: 'Solver', groups: ['Solver'] },
  ],
  'mesh-info-dialog': [
    { id: 'size', label: 'Size', groups: ['Size'] },
    { id: 'zones', label: 'Zones', groups: ['Zones'] },
    { id: 'memory', label: 'Memory', groups: ['Memory'] },
  ],
  'simulation-report-dialog': [
    { id: 'general', label: 'General', groups: ['General'] },
    { id: 'sections', label: 'Sections', groups: ['Sections'] },
    { id: 'export', label: 'Export', groups: ['Export'] },
  ],
  'species-pollutants-dialog': [
    { id: 'nox', label: 'NOx', groups: ['NOx'] },
    { id: 'soot', label: 'Soot', groups: ['Soot'] },
  ],
  'multigrid-controls-dialog': [
    { id: 'amg', label: 'Algebraic Multigrid', groups: ['Algebraic Multigrid'] },
    { id: 'stabilization', label: 'Advanced Stabilization', groups: ['Advanced Stabilization'] },
  ],
  'dpm-injection-dialog': [
    { id: 'point-properties', label: 'Point Properties', groups: ['Point Properties'] },
    { id: 'turbulent-dispersion', label: 'Turbulent Dispersion', groups: ['Turbulent Dispersion'] },
    { id: 'physical-models', label: 'Physical Models', groups: ['Physical Models'] },
    { id: 'components', label: 'Components', groups: ['Components'], visibleWhen: [{ controlId: 'dpm-inj-evap', values: ['Multicomponent'] }] },
    { id: 'breakup', label: 'Breakup', groups: ['Breakup'], visibleWhen: [{ controlId: 'dpm-breakup', values: [true] }] },
  ],
  'udm-uds-dialog': [
    { id: 'udm', label: 'User-Defined Memory', groups: ['Memory'] },
    { id: 'uds', label: 'User-Defined Scalars', groups: ['Scalars'] },
  ],
  'fft-dialog': [
    { id: 'signal', label: 'Signal & Window', groups: ['FFT'] },
    { id: 'axes', label: 'Axes Options', groups: ['FFT Axes'] },
  ],
  'particle-tracks-dialog': [
    { id: 'release', label: 'Release & Variables', groups: ['particle-tracks'] },
    { id: 'style', label: 'Track Style', groups: ['Track Style'] },
  ],
  'preferences-dialog': [
    { id: 'appearance', label: 'Appearance', groups: ['Appearance'] },
    { id: 'general', label: 'General', groups: ['General'] },
    { id: 'graphics', label: 'Graphics', groups: ['Graphics'] },
    { id: 'simulation', label: 'Simulation', groups: ['Simulation'] },
  ],
}

export function enhanceNestedDialogs(dialog: FluentMockDialog): FluentMockDialog {
  switch (dialog.id) {
    case 'material-create-edit-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.flatMap((ctrl) => {
            if (ctrl.id === 'material-density-method') {
              return [{
                ...ctrl,
                options: ['constant', 'ideal-gas', 'incompressible-ideal-gas', 'boussinesq', 'polynomial'],
                optionDialogs: { polynomial: 'material-polynomial-dialog' },
              }]
            }
            if (ctrl.id === 'material-viscosity-method') {
              return [{
                ...ctrl,
                options: ['constant', 'sutherland', 'power-law', 'piecewise-linear'],
                optionDialogs: {
                  'power-law': 'material-power-law-dialog',
                  'piecewise-linear': 'material-piecewise-linear-dialog',
                },
              }]
            }
            if (ctrl.id === 'material-cp-val') {
              return [
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'material-cp-method',
                  label: 'Cp Method',
                  controlType: 'select',
                  value: 'constant',
                  options: ['constant', 'piecewise-linear', 'polynomial', 'piecewise-polynomial'],
                  optionDialogs: {
                    'piecewise-linear': 'material-piecewise-linear-dialog',
                    polynomial: 'material-polynomial-dialog',
                    'piecewise-polynomial': 'material-nasa-cp-dialog',
                  },
                  section: 'Properties',
                }),
                { ...ctrl, visibleWhen: [when('material-cp-method', 'constant')] },
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'mat-cp-pwl-btn',
                  label: 'Edit Cp Piecewise-Linear…',
                  controlType: 'button',
                  dialogId: 'material-piecewise-linear-dialog',
                  section: 'Properties',
                  visibleWhen: [when('material-cp-method', 'piecewise-linear')],
                }),
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'mat-cp-poly-btn',
                  label: 'Edit Cp Polynomial…',
                  controlType: 'button',
                  dialogId: 'material-polynomial-dialog',
                  section: 'Properties',
                  visibleWhen: [when('material-cp-method', 'polynomial')],
                }),
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'mat-edit-nasa-btn',
                  label: 'Edit NASA Polynomial…',
                  controlType: 'button',
                  dialogId: 'material-nasa-cp-dialog',
                  section: 'Properties',
                  visibleWhen: [when('material-cp-method', 'piecewise-polynomial')],
                }),
              ]
            }
            if (ctrl.id === 'material-k-val') {
              return [
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'material-k-method',
                  label: 'Thermal Conductivity Method',
                  controlType: 'select',
                  value: 'constant',
                  options: ['constant', 'piecewise-linear', 'polynomial'],
                  optionDialogs: {
                    'piecewise-linear': 'material-piecewise-linear-dialog',
                    polynomial: 'material-polynomial-dialog',
                  },
                  section: 'Properties',
                }),
                { ...ctrl, visibleWhen: [when('material-k-method', 'constant')] },
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'mat-k-pwl-btn',
                  label: 'Edit Conductivity Piecewise-Linear…',
                  controlType: 'button',
                  dialogId: 'material-piecewise-linear-dialog',
                  section: 'Properties',
                  visibleWhen: [when('material-k-method', 'piecewise-linear')],
                }),
                dlgCtrl(dialog.id, 'Properties', 'Materials', {
                  id: 'mat-k-poly-btn',
                  label: 'Edit Conductivity Polynomial…',
                  controlType: 'button',
                  dialogId: 'material-polynomial-dialog',
                  section: 'Properties',
                  visibleWhen: [when('material-k-method', 'polynomial')],
                }),
              ]
            }
            return [ctrl]
          }),
          dlgCtrl(dialog.id, 'Properties', 'Materials', {
            id: 'material-uds-diffusivity',
            label: 'UDS Diffusivity (kg/m·s)',
            controlType: 'field',
            value: '1e-5',
            section: 'Properties',
            visibleWhen: [when('uds-count', '1', '2', '3')],
          }),
          dlgCtrl(dialog.id, 'Properties', 'Materials', {
            id: 'mat-edit-poly-btn',
            label: 'Edit Polynomial…',
            controlType: 'button',
            dialogId: 'material-polynomial-dialog',
            section: 'Properties',
            visibleWhen: [when('material-density-method', 'polynomial')],
          }),
          dlgCtrl(dialog.id, 'Properties', 'Materials', {
            id: 'mat-edit-plaw-btn',
            label: 'Edit Power-Law…',
            controlType: 'button',
            dialogId: 'material-power-law-dialog',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'power-law')],
          }),
          dlgCtrl(dialog.id, 'Properties', 'Materials', {
            id: 'mat-edit-pwl-btn',
            label: 'Edit Piecewise-Linear…',
            controlType: 'button',
            dialogId: 'material-piecewise-linear-dialog',
            section: 'Properties',
            visibleWhen: [when('material-viscosity-method', 'piecewise-linear')],
          }),
          dlgCtrl(dialog.id, 'Operation', 'Materials', {
            id: 'mat-user-db-btn',
            label: 'User-Defined Database…',
            controlType: 'button',
            dialogId: 'material-user-database-dialog',
            section: 'Actions',
          }),
        ],
      }

    case 'dynamic-mesh-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'dynamic-mesh-preview'
              ? { ...ctrl, dialogId: 'dynamic-mesh-preview-dialog' }
              : ctrl,
          ),
          dlgCtrl(dialog.id, 'Options', 'Dynamic Mesh', {
            id: 'dm-incylinder-btn',
            label: 'In-Cylinder Settings…',
            controlType: 'button',
            dialogId: 'dynamic-mesh-incylinder-dialog',
            section: 'Motion Options',
            visibleWhen: [when('dynamic-mesh-in-cylinder', true)],
          }),
          dlgCtrl(dialog.id, 'Options', 'Dynamic Mesh', {
            id: 'dm-sixdof-btn',
            label: 'Six DOF Settings…',
            controlType: 'button',
            dialogId: 'dynamic-mesh-sixdof-dialog',
            section: 'Motion Options',
            visibleWhen: [when('dynamic-mesh-six-dof', true)],
          }),
          dlgCtrl(dialog.id, 'Options', 'Dynamic Mesh', {
            id: 'dm-contact-btn',
            label: 'Contact Detection Settings…',
            controlType: 'button',
            dialogId: 'dynamic-mesh-contact-dialog',
            section: 'Motion Options',
            visibleWhen: [when('dynamic-mesh-contact', true)],
          }),
          dlgCtrl(dialog.id, 'Zones', 'Dynamic Mesh', {
            id: 'dm-events-btn',
            label: 'Events…',
            controlType: 'button',
            dialogId: 'dynamic-mesh-events-dialog',
            section: 'Dynamic Mesh Zones',
          }),
        ],
      }

    case 'viscous-model-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Options', 'Models', {
            id: 'viscous-model-constants-btn',
            label: 'Model Constants…',
            controlType: 'button',
            dialogId: 'viscous-constants-dialog',
            visibleWhen: [when('viscous-inviscid', false), when('viscous-laminar', false)],
          }),
        ],
      }

    case 'species-model-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Species', 'Models', {
            id: 'species-import-chemkin-btn',
            label: 'Import CHEMKIN Mechanism…',
            controlType: 'button',
            dialogId: 'species-chemkin-dialog',
            visibleWhen: [when('species-model-select', 'Species Transport')],
          }),
          dlgCtrl(dialog.id, 'Reactions', 'Models', {
            id: 'species-edit-reactions-btn',
            label: 'Edit Reactions…',
            controlType: 'button',
            dialogId: 'species-reactions-dialog',
            visibleWhen: [when('species-model-select', 'Species Transport'), when('species-volumetric-reactions', true)],
          }),
          dlgCtrl(dialog.id, 'Combustion', 'Models', {
            id: 'species-pdf-table-btn',
            label: 'PDF Table…',
            controlType: 'button',
            dialogId: 'species-pdf-table-dialog',
            visibleWhen: [when('species-model-select', 'Non-Premixed Combustion', 'Partially Premixed Combustion')],
          }),
          dlgCtrl(dialog.id, 'Reactions', 'Models', {
            id: 'species-pollutants-btn',
            label: 'Pollutants (NOx / Soot)…',
            controlType: 'button',
            dialogId: 'species-pollutants-dialog',
            visibleWhen: [when('species-model-select', 'Species Transport', 'Non-Premixed Combustion', 'Premixed Combustion', 'Partially Premixed Combustion', 'Composition PDF Transport')],
          }),
        ],
      }

    case 'radiation-model-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Iteration Parameters', 'Models', {
            id: 'radiation-dtrm-rays-btn',
            label: 'Ray Tracing…',
            controlType: 'button',
            dialogId: 'radiation-dtrm-rays-dialog',
            visibleWhen: [when('radiation-model-select', 'Discrete Transfer (DTRM)')],
          }),
        ],
      }

    case 'battery-model-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Electrical Parameters', 'Models', {
            id: 'battery-echem-params-btn',
            label: 'E-Chemistry Parameters…',
            controlType: 'button',
            dialogId: 'battery-echemistry-dialog',
            visibleWhen: [when('battery-enable', true), when('battery-solution-method', 'MSMD')],
          }),
        ],
      }

    case 'dpm-injection-dialog':
      return {
        ...dialog,
        sharedGroups: ['Injection'],
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-material',
            label: 'Particle Material',
            controlType: 'select',
            value: 'anthracite',
            options: ['anthracite', 'water-liquid', 'inert-particle'],
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-dist',
            label: 'Diameter Distribution',
            controlType: 'select',
            value: 'uniform',
            options: ['uniform', 'linear', 'rosin-rammler'],
            optionDialogs: { 'rosin-rammler': 'dpm-rosin-rammler-dialog' },
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-rr-btn',
            label: 'Rosin-Rammler Settings…',
            controlType: 'button',
            dialogId: 'dpm-rosin-rammler-dialog',
            visibleWhen: [when('dpm-inj-dist', 'rosin-rammler')],
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-vel',
            label: 'Velocity Magnitude (m/s)',
            controlType: 'field',
            value: '5.0',
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-cone-angle',
            label: 'Cone Half-Angle (°)',
            controlType: 'field',
            value: '25',
            visibleWhen: [when('dpm-injection-type', 'cone')],
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-cone-swirl',
            label: 'Swirl Fraction',
            controlType: 'field',
            value: '0.2',
            visibleWhen: [when('dpm-injection-type', 'cone')],
          }),
          dlgCtrl(dialog.id, 'Point Properties', 'Models', {
            id: 'dpm-inj-flow',
            label: 'Total Flow Rate (kg/s)',
            controlType: 'field',
            value: '0.001',
          }),
          dlgCtrl(dialog.id, 'Turbulent Dispersion', 'Models', {
            id: 'dpm-inj-drw',
            label: 'Discrete Random Walk Model',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Turbulent Dispersion', 'Models', {
            id: 'dpm-inj-tries',
            label: 'Number of Tries',
            controlType: 'field',
            value: '10',
            visibleWhen: [when('dpm-inj-drw', true)],
          }),
          dlgCtrl(dialog.id, 'Physical Models', 'Models', {
            id: 'dpm-inj-drag',
            label: 'Drag Law',
            controlType: 'select',
            value: 'spherical',
            options: ['spherical', 'nonspherical', 'stokes-cunningham', 'dynamic-drag'],
          }),
          dlgCtrl(dialog.id, 'Physical Models', 'Models', {
            id: 'dpm-inj-evap',
            label: 'Particle Type',
            controlType: 'select',
            value: 'Inert',
            options: ['Inert', 'Droplet', 'Combusting', 'Multicomponent'],
          }),
          dlgCtrl(dialog.id, 'Physical Models', 'Models', {
            id: 'dpm-inj-volatile-frac',
            label: 'Volatile Component Fraction',
            controlType: 'field',
            value: '0.35',
            visibleWhen: [when('dpm-inj-evap', 'Combusting')],
          }),
          dlgCtrl(dialog.id, 'Physical Models', 'Models', {
            id: 'dpm-inj-devol-model',
            label: 'Devolatilization Model',
            controlType: 'select',
            value: 'Single Kinetic Rate',
            options: ['Constant Rate', 'Single Kinetic Rate', 'Kobayashi Two Competing Rates'],
            visibleWhen: [when('dpm-inj-evap', 'Combusting')],
          }),
          dlgCtrl(dialog.id, 'Components', 'Models', {
            id: 'dpm-inj-comp-1',
            label: 'Component 1 Material',
            controlType: 'select',
            value: 'h2o<l>',
            options: ['h2o<l>', 'c7h16<l>', 'c2h5oh<l>'],
          }),
          dlgCtrl(dialog.id, 'Components', 'Models', {
            id: 'dpm-inj-comp-1-frac',
            label: 'Component 1 Mass Fraction',
            controlType: 'field',
            value: '0.7',
          }),
          dlgCtrl(dialog.id, 'Components', 'Models', {
            id: 'dpm-inj-comp-2',
            label: 'Component 2 Material',
            controlType: 'select',
            value: 'c7h16<l>',
            options: ['c7h16<l>', 'c2h5oh<l>', 'c8h18<l>'],
          }),
          dlgCtrl(dialog.id, 'Components', 'Models', {
            id: 'dpm-inj-comp-2-frac',
            label: 'Component 2 Mass Fraction',
            controlType: 'field',
            value: '0.3',
          }),
          dlgCtrl(dialog.id, 'Breakup', 'Models', {
            id: 'dpm-inj-breakup-model',
            label: 'Secondary Breakup Model',
            controlType: 'select',
            value: 'Wave (KH-RT)',
            options: ['TAB', 'Wave (KH-RT)', 'SSD', 'Madabhushi'],
          }),
          dlgCtrl(dialog.id, 'Breakup', 'Models', {
            id: 'dpm-inj-breakup-b0',
            label: 'KH Wave Size Constant B0',
            controlType: 'field',
            value: '0.61',
            visibleWhen: [when('dpm-inj-breakup-model', 'Wave (KH-RT)')],
          }),
          dlgCtrl(dialog.id, 'Breakup', 'Models', {
            id: 'dpm-inj-breakup-b1',
            label: 'KH Time Constant B1',
            controlType: 'field',
            value: '1.73',
            visibleWhen: [when('dpm-inj-breakup-model', 'Wave (KH-RT)')],
          }),
          dlgCtrl(dialog.id, 'Breakup', 'Models', {
            id: 'dpm-inj-breakup-we',
            label: 'Critical Weber Number',
            controlType: 'field',
            value: '12',
          }),
        ],
      }

    case 'cell-zone-fluid-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Zone Settings', 'Cell Zone Conditions', {
            id: 'cz-edit-material-btn',
            label: 'Edit Material…',
            controlType: 'button',
            dialogId: 'material-create-edit-dialog',
          }),
          dlgCtrl(dialog.id, 'Motion', 'Cell Zone Conditions', {
            id: 'cz-edit-frame-btn',
            label: 'Create/Edit Reference Frame…',
            controlType: 'button',
            dialogId: 'reference-frame-dialog',
            visibleWhen: [when('cell-zone-fluid-frame-motion', true)],
          }),
          dlgCtrl(dialog.id, 'Porous Zone', 'Cell Zone Conditions', {
            id: 'cz-porous-adv-btn',
            label: 'Advanced Porous Settings…',
            controlType: 'button',
            dialogId: 'porous-advanced-dialog',
            visibleWhen: [when('cell-zone-fluid-porous', true)],
          }),
        ],
      }

    case 'cell-zone-source-dialog':
      return {
        ...dialog,
        controls: dialog.controls.map((ctrl) =>
          ctrl.id === 'cell-zone-source-udf'
            ? { ...ctrl, dialogId: 'cell-zone-source-edit-dialog' }
            : ctrl,
        ),
      }

    case 'velocity-inlet-dialog':
    case 'pressure-inlet-dialog':
    case 'mass-flow-inlet-dialog': {
      const prefix = dialog.id.replace(/-dialog$/, '')
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Momentum', 'Boundary Conditions', {
            id: prefix + '-profiles-btn',
            label: 'Boundary Profiles…',
            controlType: 'button',
            dialogId: 'boundary-profiles-dialog',
          }),
        ],
      }
    }

    case 'wall-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Thermal', 'Boundary Conditions', {
            id: 'wall-edit-material-btn',
            label: 'Edit Material…',
            controlType: 'button',
            dialogId: 'material-create-edit-dialog',
          }),
          dlgCtrl(dialog.id, 'Thermal', 'Boundary Conditions', {
            id: 'wall-profiles-btn',
            label: 'Boundary Profiles…',
            controlType: 'button',
            dialogId: 'boundary-profiles-dialog',
          }),
          dlgCtrl(dialog.id, 'Species', 'Boundary Conditions', {
            id: 'wall-species-reaction',
            label: 'Surface Reaction',
            controlType: 'checkbox',
            defaultSelected: false,
          }),
          dlgCtrl(dialog.id, 'Wall Film', 'Boundary Conditions', {
            id: 'wall-film-bc-enable',
            label: 'Enable Wall Film on Wall',
            controlType: 'checkbox',
            defaultSelected: false,
          }),
          dlgCtrl(dialog.id, 'Wall Film', 'Boundary Conditions', {
            id: 'wall-film-init-thick',
            label: 'Initial Film Thickness (m)',
            controlType: 'field',
            value: '0',
            visibleWhen: [when('wall-film-bc-enable', true)],
          }),
        ],
      }

    case 'fan-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'fan-pressure-profile'
              ? {
                  ...ctrl,
                  optionDialogs: {
                    polynomial: 'fan-profile-dialog',
                    'piecewise-linear': 'fan-profile-dialog',
                  },
                }
              : ctrl,
          ),
          dlgCtrl(dialog.id, 'Pressure-Jump Specification', 'Boundary Conditions', {
            id: 'fan-edit-curve-btn',
            label: 'Edit Fan Curve…',
            controlType: 'button',
            dialogId: 'fan-profile-dialog',
            visibleWhen: [when('fan-pressure-profile', 'polynomial', 'piecewise-linear')],
          }),
        ],
      }

    case 'solution-methods-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Spatial Discretization', 'Solution Methods', {
            id: 'sm-hotr-btn',
            label: 'HOTR Options…',
            controlType: 'button',
            dialogId: 'hotr-options-dialog',
            visibleWhen: [when('methods-high-order-relax', true)],
          }),
          dlgCtrl(dialog.id, 'Spatial Discretization', 'Solution Methods', {
            id: 'sm-nita-btn',
            label: 'NITA Controls…',
            controlType: 'button',
            dialogId: 'nita-controls-dialog',
            visibleWhen: [when('general-transient', true), when('methods-nita', true)],
          }),
        ],
      }

    case 'solution-controls-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Multigrid', 'Solution Controls', {
            id: 'sc-amg-advanced-btn',
            label: 'Advanced AMG Settings…',
            controlType: 'button',
            dialogId: 'multigrid-controls-dialog',
          }),
        ],
      }

    case 'patch-initialization-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Patch', 'Initialization', {
            id: 'patch-new-register-btn',
            label: 'New Cell Register…',
            controlType: 'button',
            dialogId: 'cell-register-dialog',
          }),
        ],
      }

    case 'mesh-adaptation-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Register', 'Mesh Adaptation', {
            id: 'adapt-new-register-btn',
            label: 'New Cell Register…',
            controlType: 'button',
            dialogId: 'cell-register-dialog',
            section: 'Execution',
          }),
        ],
      }

    case 'residual-monitors-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Residual Options', 'Monitors', {
            id: 'residual-scaling-btn',
            label: 'Scaling Options…',
            controlType: 'button',
            dialogId: 'residual-scaling-dialog',
            section: 'Options',
          }),
        ],
      }

    case 'contours-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Contour Colormap', 'Results', {
            id: 'contours-colormap-options-btn',
            label: 'Colormap Options…',
            controlType: 'button',
            dialogId: 'colormap-options-dialog',
            section: 'Coloring',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', 'Results', {
            id: 'contours-new-surface-btn',
            label: 'New Surface…',
            controlType: 'button',
            dialogId: 'plane-surface-dialog',
            section: 'Coloring',
          }),
          dlgCtrl(dialog.id, 'Contour Colormap', 'Results', {
            id: 'contours-mesh-display-btn',
            label: 'Mesh Display…',
            controlType: 'button',
            dialogId: 'mesh-display-dialog',
            section: 'Options',
            visibleWhen: [when('contours-draw-mesh', true)],
          }),
        ],
      }

    case 'vectors-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Vector Options', 'Results', {
            id: 'vectors-options-btn',
            label: 'Vector Options…',
            controlType: 'button',
            dialogId: 'vector-options-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Vector Options', 'Results', {
            id: 'vectors-colormap-options-btn',
            label: 'Colormap Options…',
            controlType: 'button',
            dialogId: 'colormap-options-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Vector Options', 'Results', {
            id: 'vectors-mesh-display-btn',
            label: 'Mesh Display…',
            controlType: 'button',
            dialogId: 'mesh-display-dialog',
            section: 'Options',
            visibleWhen: [when('vectors-draw-mesh', true)],
          }),
        ],
      }

    case 'pathlines-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Pathlines', 'Results', {
            id: 'pathlines-attr-btn',
            label: 'Pathline Attributes…',
            controlType: 'button',
            dialogId: 'pathline-attributes-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Pathlines', 'Results', {
            id: 'pathlines-colormap-options-btn',
            label: 'Colormap Options…',
            controlType: 'button',
            dialogId: 'colormap-options-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'Pathlines', 'Results', {
            id: 'pathlines-mesh-display-btn',
            label: 'Mesh Display…',
            controlType: 'button',
            dialogId: 'mesh-display-dialog',
            section: 'Options',
            visibleWhen: [when('pathlines-draw-mesh', true)],
          }),
        ],
      }

    case 'display-options-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Display Colormap', 'Results', {
            id: 'display-colormap-options-btn',
            label: 'Colormap Options…',
            controlType: 'button',
            dialogId: 'colormap-options-dialog',
          }),
        ],
      }

    case 'xy-plot-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'XY Plot', 'Results', {
            id: 'xy-plot-open-axes',
            label: 'Axes…',
            controlType: 'button',
            dialogId: 'xy-plot-axes-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'XY Plot', 'Results', {
            id: 'xy-plot-open-curves',
            label: 'Curves…',
            controlType: 'button',
            dialogId: 'xy-plot-curves-dialog',
            section: 'Options',
          }),
          dlgCtrl(dialog.id, 'XY Plot', 'Results', {
            id: 'xy-plot-open-load',
            label: 'Load File…',
            controlType: 'button',
            dialogId: 'xy-plot-load-file-dialog',
            section: 'Options',
          }),
        ],
      }

    case 'report-definition-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Definition', 'Report Definitions', {
            id: 'report-new-surface-btn',
            label: 'New Surface…',
            controlType: 'button',
            dialogId: 'plane-surface-dialog',
            section: 'Definition',
          }),
        ],
      }

    case 'report-plots-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Report Plot', 'Monitors', {
            id: 'report-plot-options-btn',
            label: 'Plot Options…',
            controlType: 'button',
            dialogId: 'report-plot-options-dialog',
          }),
        ],
      }

    case 'adjoint-solver-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Adjoint', 'Design', {
            id: 'adjoint-obs-manage-btn',
            label: 'Manage Observables…',
            controlType: 'button',
            dialogId: 'adjoint-observable-dialog',
          }),
        ],
      }

    case 'parameters-table-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Parameters', 'Parameters', {
            id: 'param-new-input-btn',
            label: 'Create Input Parameter…',
            controlType: 'button',
            dialogId: 'param-create-dialog',
          }),
          dlgCtrl(dialog.id, 'Output Parameters', 'Parameters', {
            id: 'param-new-output-btn',
            label: 'Create Output Parameter…',
            controlType: 'button',
            dialogId: 'param-create-dialog',
          }),
        ],
      }

    case 'preferences-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, 'Appearance', 'File', {
            id: 'pref-ui-theme',
            label: 'Workbench Theme',
            controlType: 'select',
            valueId: 'display-options-theme',
            value: 'light',
            options: ['light', 'dark'],
          }),
          dlgCtrl(dialog.id, 'Appearance', 'File', {
            id: 'pref-font-scale',
            label: 'Font Scale',
            controlType: 'select',
            value: 'Default',
            options: ['Compact', 'Default', 'Large'],
          }),
          dlgCtrl(dialog.id, 'Appearance', 'File', {
            id: 'pref-show-tips',
            label: 'Show Inline Teaching Tips',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'pref-auto-save-case'
              ? { ...ctrl, group: 'General' }
              : ctrl.id === 'pref-gpu-enable'
                ? { ...ctrl, group: 'Simulation' }
                : ctrl,
          ),
          dlgCtrl(dialog.id, 'General', 'File', {
            id: 'pref-work-dir',
            label: 'Working Directory',
            controlType: 'field',
            value: 'C:\\FluentWork',
          }),
          dlgCtrl(dialog.id, 'General', 'File', {
            id: 'pref-confirm-exit',
            label: 'Confirm Before Resetting Case',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Graphics', 'Graphics Window', {
            id: 'pref-gfx-driver',
            label: 'Graphics Driver',
            controlType: 'select',
            value: 'Auto',
            options: ['Auto', 'DX11', 'OpenGL2'],
          }),
          dlgCtrl(dialog.id, 'Graphics', 'Graphics Window', {
            id: 'pref-mouse-map',
            label: 'Mouse Mapping',
            controlType: 'select',
            value: 'Fluent',
            options: ['Fluent', 'Workbench', 'Classic'],
          }),
          dlgCtrl(dialog.id, 'Graphics', 'Graphics Window', {
            id: 'pref-antialias',
            label: 'Hardware Anti-Aliasing',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Graphics', 'Graphics Window', {
            id: 'pref-headlight',
            label: 'Headlight On',
            controlType: 'checkbox',
            valueId: 'display-lights-headlight',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'Simulation', 'Parallel', {
            id: 'pref-open-gpu-dialog',
            label: 'GPU Solver Settings…',
            controlType: 'button',
            dialogId: 'gpu-solver-dialog',
          }),
          dlgCtrl(dialog.id, 'Simulation', 'File', {
            id: 'pref-auto-check',
            label: 'Auto Run Mesh Check After Read',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
        ],
      }

    case 'units-dialog':
      return {
        ...dialog,
        controls: [
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-system',
            label: 'Unit System',
            controlType: 'select',
            value: 'SI',
            options: ['SI', 'British', 'CGS'],
          }),
          ...dialog.controls.filter((ctrl) => ctrl.group === '单位'),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-velocity',
            label: 'Velocity Unit',
            controlType: 'select',
            value: 'm/s',
            options: ['m/s', 'ft/s', 'mm/s'],
          }),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-mass-flow',
            label: 'Mass Flow Unit',
            controlType: 'select',
            value: 'kg/s',
            options: ['kg/s', 'g/s', 'lbm/s'],
          }),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-angular-vel',
            label: 'Angular Velocity Unit',
            controlType: 'select',
            value: 'rad/s',
            options: ['rad/s', 'rpm', 'deg/s'],
          }),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-heat-flux',
            label: 'Heat Flux Unit',
            controlType: 'select',
            value: 'W/m²',
            options: ['W/m²', 'kW/m²', 'BTU/(h·ft²)'],
          }),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-density',
            label: 'Density Unit',
            controlType: 'select',
            value: 'kg/m³',
            options: ['kg/m³', 'g/cm³', 'lbm/ft³'],
          }),
          dlgCtrl(dialog.id, '单位', 'Mesh', {
            id: 'units-viscosity',
            label: 'Viscosity Unit',
            controlType: 'select',
            value: 'kg/(m·s)',
            options: ['kg/(m·s)', 'cP', 'Pa·s'],
          }),
          ...dialog.controls.filter((ctrl) => ctrl.group !== '单位'),
        ],
      }

    case 'fft-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls.map((ctrl) =>
            ctrl.id === 'fft-x-func' || ctrl.id === 'fft-y-func'
              ? { ...ctrl, group: 'FFT Axes' }
              : ctrl,
          ),
          dlgCtrl(dialog.id, 'FFT Axes', 'Results', {
            id: 'fft-x-log',
            label: 'Logarithmic Frequency Axis',
            controlType: 'checkbox',
            defaultSelected: false,
          }),
          dlgCtrl(dialog.id, 'FFT Axes', 'Results', {
            id: 'fft-y-auto',
            label: 'Auto-Scale Magnitude Axis',
            controlType: 'checkbox',
            defaultSelected: true,
          }),
          dlgCtrl(dialog.id, 'FFT Axes', 'Results', {
            id: 'fft-freq-max',
            label: 'Max Frequency (Hz)',
            controlType: 'field',
            value: '5000',
            visibleWhen: [when('fft-y-auto', false)],
          }),
        ],
      }

    case 'particle-tracks-dialog':
      return {
        ...dialog,
        controls: [
          ...dialog.controls,
          dlgCtrl(dialog.id, 'Track Style', 'Results', {
            id: 'particle-tracks-style',
            label: 'Track Style',
            controlType: 'select',
            value: 'Line',
            options: ['Line', 'Cylinder', 'Ribbon', 'Point'],
          }),
          dlgCtrl(dialog.id, 'Track Style', 'Results', {
            id: 'particle-tracks-steps',
            label: 'Max Number of Steps',
            controlType: 'field',
            value: '500',
          }),
          dlgCtrl(dialog.id, 'Track Style', 'Results', {
            id: 'particle-tracks-step-len',
            label: 'Step Length Factor',
            controlType: 'field',
            value: '5',
          }),
          dlgCtrl(dialog.id, 'Track Style', 'Results', {
            id: 'particle-tracks-radius',
            label: 'Tube / Ribbon Width (m)',
            controlType: 'field',
            value: '0.002',
            visibleWhen: [when('particle-tracks-style', 'Cylinder', 'Ribbon')],
          }),
        ],
      }

    default:
      return dialog
  }
}
