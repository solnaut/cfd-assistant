import type { FluentMockTaskPanel } from '../fluentTypes'
import { makePanelControl } from './controlHelpers'
import { extraBoundaryControls } from './boundaryBranches'
import { directStepMethods, timeAdvancementControls } from './timeAdvancement'
import { volumeFractionSchemeCondition } from './multiphaseDialogs'

export const extendedTaskPanels: FluentMockTaskPanel[] = [
  {
    id: 'models-panel',
    title: '模型',
    module: 'Models',
    subtitle: '双击或点击下列物理模型条目打开设置窗口；状态会同步回显在 Outline 树。',
    groups: [
      {
        id: 'models-panel-main',
        title: 'Models',
        controls: [
          makePanelControl('models-multiphase', 'Multiphase', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'multiphase-model-dialog',
          }),
          makePanelControl('models-energy', 'Energy', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'energy-model-dialog',
          }),
          makePanelControl('models-viscous', 'Viscous', 'Models', 'Models', 'button', {
            value: 'SST k-omega',
            dialogId: 'viscous-model-dialog',
          }),
          makePanelControl('models-radiation', 'Radiation', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'radiation-model-dialog',
          }),
          makePanelControl('models-heat-exchanger', 'Heat Exchanger', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'heat-exchanger-dialog',
          }),
          makePanelControl('models-species', 'Species', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'species-model-dialog',
          }),
          makePanelControl('models-dpm', 'Discrete Phase', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'dpm-model-dialog',
          }),
          makePanelControl('models-solidification', 'Solidification & Melting', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'solidification-model-dialog',
          }),
          makePanelControl('models-acoustics', 'Acoustics', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'acoustics-model-dialog',
          }),
          makePanelControl('models-wall-film', 'Eulerian Wall Film', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'wall-film-model-dialog',
          }),
          makePanelControl('models-battery', 'Potential / Battery', 'Models', 'Models', 'button', {
            value: 'Off',
            dialogId: 'battery-model-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'boundary-panel',
    title: '边界条件',
    module: 'Boundary Conditions',
    subtitle: '按入口、出口、壁面和内部边界查看教学类型。可用类型随启用的物理模型变化。',
    groups: [
      {
        id: 'boundary-inlet-group',
        title: 'Inlet',
        controls: [
          makePanelControl('bc-velocity-inlet', 'Velocity Inlet', 'Boundary Conditions', 'Inlet', 'button', {
            dialogId: 'velocity-inlet-dialog',
          }),
          makePanelControl('bc-pressure-inlet', 'Pressure Inlet', 'Boundary Conditions', 'Inlet', 'button', {
            dialogId: 'pressure-inlet-dialog',
          }),
          makePanelControl('bc-mass-flow-inlet', 'Mass-Flow Inlet', 'Boundary Conditions', 'Inlet', 'button', {
            dialogId: 'mass-flow-inlet-dialog',
          }),
          ...extraBoundaryControls.filter((control) => control.group === 'Inlet'),
        ],
      },
      {
        id: 'boundary-outlet-group',
        title: 'Outlet',
        controls: [
          makePanelControl('bc-pressure-outlet', 'Pressure Outlet', 'Boundary Conditions', 'Outlet', 'button', {
            dialogId: 'pressure-outlet-dialog',
          }),
          makePanelControl('bc-outflow', 'Outflow', 'Boundary Conditions', 'Outlet', 'button', {
            dialogId: 'outflow-dialog',
          }),
          makePanelControl('bc-pressure-far-field', 'Pressure Far-Field', 'Boundary Conditions', 'Outlet', 'button', {
            dialogId: 'pressure-far-field-dialog',
          }),
          ...extraBoundaryControls.filter((control) => control.group === 'Outlet'),
        ],
      },
      {
        id: 'boundary-wall-group',
        title: 'Wall',
        controls: [
          makePanelControl('bc-wall', 'Wall', 'Boundary Conditions', 'Wall', 'button', {
            dialogId: 'wall-dialog',
          }),
          makePanelControl('bc-perforated-walls', 'Perforated Walls…', 'Boundary Conditions', 'Wall', 'button', {
            dialogId: 'perforated-walls-dialog',
          }),
        ],
      },
      {
        id: 'boundary-internal-group',
        title: 'Internal & Symmetry',
        controls: [
          makePanelControl('bc-symmetry', 'Symmetry', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'symmetry-dialog',
          }),
          makePanelControl('bc-axis', 'Axis', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'axis-dialog',
          }),
          makePanelControl('bc-periodic', 'Periodic', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'periodic-dialog',
          }),
          makePanelControl('bc-periodic-conditions', 'Periodic Conditions…', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'periodic-conditions-dialog',
          }),
          makePanelControl('bc-interface', 'Interface', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'interface-bc-dialog',
          }),
          makePanelControl('bc-interior', 'Interior', 'Boundary Conditions', 'Internal & Symmetry', 'button', {
            dialogId: 'interior-dialog',
          }),
          ...extraBoundaryControls.filter((control) => control.group === 'Internal & Symmetry'),
        ],
      },
    ],
  },
  {
    id: 'solution-methods-panel',
    title: '方法',
    module: 'Solution Methods',
    subtitle: '设置压力速度耦合、梯度与空间离散格式，以及瞬态时间积分方式。',
    groups: [
      {
        id: 'methods-pv-group',
        title: 'Pressure-Velocity Coupling',
        controls: [
          makePanelControl('methods-pressure-velocity', 'Pressure-Velocity Coupling', 'Solution Methods', 'Pressure-Velocity Coupling', 'select', {
            value: 'SIMPLE',
            dialogId: 'solution-methods-dialog',
            visibleWhen: [{ controlId: 'general-pressure-based', values: [true] }],
          }),
          makePanelControl('methods-coupled-courant', 'Courant Number (Coupled)', 'Solution Methods', 'Pressure-Velocity Coupling', 'field', {
            value: '200',
            visibleWhen: [
              { controlId: 'general-pressure-based', values: [true] },
              { controlId: 'methods-pressure-velocity', values: ['Coupled'] },
            ],
          }),
          makePanelControl('methods-dbns-formulation', 'Formulation', 'Solution Methods', 'Pressure-Velocity Coupling', 'select', {
            value: 'Implicit',
            options: ['Implicit', 'Explicit'],
            visibleWhen: [{ controlId: 'general-density-based', values: [true] }],
          }),
          makePanelControl('methods-dbns-flux', 'Flux Type', 'Solution Methods', 'Pressure-Velocity Coupling', 'select', {
            value: 'Roe-FDS',
            options: ['Roe-FDS', 'AUSM'],
            visibleWhen: [{ controlId: 'general-density-based', values: [true] }],
          }),
          makePanelControl('methods-dbns-courant', 'Solver Courant Number', 'Solution Methods', 'Pressure-Velocity Coupling', 'field', {
            value: '5.0',
            visibleWhen: [{ controlId: 'general-density-based', values: [true] }],
          }),
        ],
      },
      {
        id: 'methods-spatial-group',
        title: 'Spatial Discretization',
        controls: [
          makePanelControl('methods-gradient', 'Gradient', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Least Squares Cell Based',
          }),
          makePanelControl('methods-pressure-scheme', 'Pressure', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order',
            visibleWhen: [{ controlId: 'general-pressure-based', values: [true] }],
          }),
          makePanelControl('methods-momentum', 'Momentum', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
          }),
          makePanelControl('methods-tke', 'Turbulent Kinetic Energy', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
            visibleWhen: [{ controlId: 'viscous-has-tke', values: [true] }],
          }),
          makePanelControl('methods-epsilon', 'Turbulent Dissipation Rate', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
            options: ['First Order Upwind', 'Second Order Upwind', 'QUICK'],
            visibleWhen: [{ controlId: 'viscous-has-epsilon', values: [true] }],
          }),
          makePanelControl('methods-omega', 'Specific Dissipation Rate', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
            visibleWhen: [{ controlId: 'viscous-has-omega', values: [true] }],
          }),
          makePanelControl('methods-nut', 'Modified Turbulent Viscosity', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
            options: ['First Order Upwind', 'Second Order Upwind', 'QUICK'],
            visibleWhen: [{ controlId: 'viscous-has-nut', values: [true] }],
          }),
          makePanelControl('methods-energy-scheme', 'Energy', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'Second Order Upwind',
            visibleWhen: [{ controlId: 'energy-enable', values: [true] }],
          }),
          makePanelControl('methods-do-scheme', 'Discrete Ordinates', 'Solution Methods', 'Spatial Discretization', 'select', {
            value: 'First Order Upwind',
            options: ['First Order Upwind', 'Second Order Upwind'],
            visibleWhen: [{ controlId: 'radiation-model-select', values: ['Discrete Ordinates (DO)'] }],
          }),
          makePanelControl('methods-volume-fraction', 'Volume Fraction', 'Solution Methods', 'Spatial Discretization', 'select', {
            valueId: 'multiphase-volume-fraction-scheme',
            visibleWhen: volumeFractionSchemeCondition,
          }),
        ],
      },
      {
        id: 'methods-options-group',
        title: 'Options',
        controls: [
          makePanelControl('methods-transient-formulation', 'Transient Formulation', 'Solution Methods', 'Options', 'select', {
            value: 'First Order Implicit',
            visibleWhen: [{ controlId: 'general-transient', values: [true] }],
          }),
          makePanelControl('methods-nita', 'Non-Iterative Time Advancement', 'Solution Methods', 'Options', 'checkbox', {
            visibleWhen: [{ controlId: 'general-transient', values: [true] }],
          }),
          makePanelControl('methods-warped-face', 'Warped-Face Gradient Correction', 'Solution Methods', 'Options', 'checkbox'),
          makePanelControl('methods-high-order-relax', 'High Order Term Relaxation', 'Solution Methods', 'Options', 'checkbox'),
          makePanelControl('methods-pseudo-time', 'Pseudo Time Method', 'Solution Methods', 'Options', 'select', {
            value: 'Global Time Step',
            visibleWhen: [{ controlId: 'general-steady', values: [true] }],
          }),
        ],
      },
    ],
  },
  {
    id: 'solution-controls-panel',
    title: '控制',
    module: 'Solution Controls',
    subtitle: '调整各控制方程欠松弛因子（URF）、方程求解开关与物理变量上下限。',
    groups: [
      {
        id: 'controls-urf-group',
        title: 'Under-Relaxation Factors',
        controls: [
          makePanelControl('controls-coupled-courant', 'Flow Courant Number', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '200',
            visibleWhen: [{ controlId: 'methods-is-coupled', values: [true] }],
          }),
          makePanelControl('controls-exp-momentum', 'Momentum Explicit Relaxation Factor', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.5',
            visibleWhen: [{ controlId: 'methods-is-coupled', values: [true] }],
          }),
          makePanelControl('controls-exp-pressure', 'Pressure Explicit Relaxation Factor', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.5',
            visibleWhen: [{ controlId: 'methods-is-coupled', values: [true] }],
          }),
          makePanelControl('controls-urf-pressure', 'Pressure', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.3',
            visibleWhen: [{ controlId: 'methods-is-coupled', values: [false] }],
          }),
          makePanelControl('controls-urf-density', 'Density', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '1.0',
          }),
          makePanelControl('controls-urf-body-forces', 'Body Forces', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '1.0',
          }),
          makePanelControl('controls-urf-momentum', 'Momentum', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.7',
            visibleWhen: [{ controlId: 'methods-is-coupled', values: [false] }],
          }),
          makePanelControl('controls-urf-tke', 'Turbulent Kinetic Energy', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.8',
            visibleWhen: [{ controlId: 'viscous-has-tke', values: [true] }],
          }),
          makePanelControl('controls-urf-epsilon', 'Turbulent Dissipation Rate', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.8',
            visibleWhen: [{ controlId: 'viscous-has-epsilon', values: [true] }],
          }),
          makePanelControl('controls-urf-omega', 'Specific Dissipation Rate', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.8',
            visibleWhen: [{ controlId: 'viscous-has-omega', values: [true] }],
          }),
          makePanelControl('controls-urf-nut', 'Modified Turbulent Viscosity', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '0.8',
            visibleWhen: [{ controlId: 'viscous-has-nut', values: [true] }],
          }),
          makePanelControl('controls-urf-turb-visc', 'Turbulent Viscosity', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '1.0',
          }),
          makePanelControl('controls-urf-energy', 'Energy', 'Solution Controls', 'Under-Relaxation Factors', 'field', {
            value: '1.0',
            visibleWhen: [{ controlId: 'energy-enable', values: [true] }],
          }),
        ],
      },
      {
        id: 'controls-advanced-group',
        title: 'Equations & Limits',
        controls: [
          makePanelControl('controls-under-relaxation', 'Under-Relaxation Factors', 'Solution Controls', 'Equations & Limits', 'button', {
            dialogId: 'solution-controls-dialog',
          }),
          makePanelControl('controls-equations', 'Equations', 'Solution Controls', 'Equations & Limits', 'button', {
            dialogId: 'solution-equations-dialog',
          }),
          makePanelControl('controls-limits', 'Limits', 'Solution Controls', 'Equations & Limits', 'button', {
            dialogId: 'solution-limits-dialog',
          }),
          makePanelControl('controls-reset-default', 'Default', 'Solution Controls', 'Equations & Limits', 'button'),
        ],
      },
    ],
  },
  {
    id: 'initialization-panel',
    title: '初始化',
    module: 'Initialization',
    subtitle: '先选择 Hybrid 或 Standard，再执行 Initialize。已有初始流场时可以继续使用 FMG 或 Patch。',
    groups: [
      {
        id: 'init-methods-group',
        title: 'Initialization Methods',
        controls: [
          makePanelControl('initialization-hybrid', 'Hybrid Initialization', 'Initialization', 'Initialization Methods', 'radio', {
            defaultSelected: true,
          }),
          makePanelControl('initialization-hybrid-settings', 'More Settings…', 'Initialization', 'Initialization Methods', 'button', {
            dialogId: 'hybrid-init-settings-dialog',
            visibleWhen: [{ controlId: 'initialization-hybrid', values: [true] }],
          }),
          makePanelControl('initialization-standard', 'Standard Initialization', 'Initialization', 'Initialization Methods', 'radio'),
          makePanelControl('initialization-compute-from', 'Compute From', 'Initialization', 'Initialization Methods', 'select', {
            value: 'inlet',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-ref-frame-inline', 'Reference Frame', 'Initialization', 'Initialization Methods', 'select', {
            value: 'Relative to Cell Zone',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-std-pressure', 'Gauge Pressure (Pa)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-std-xvel', 'Initial X Velocity (m/s)', 'Initialization', 'Initialization Methods', 'field', {
            value: '2.5',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-std-yvel', 'Y Velocity (m/s)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-std-zvel', 'Z Velocity (m/s)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }],
          }),
          makePanelControl('initialization-std-k', 'Turbulent Kinetic Energy (m²/s²)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0.023',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }, { controlId: 'viscous-has-tke', values: [true] }],
          }),
          makePanelControl('initialization-std-epsilon', 'Turbulent Dissipation Rate (m²/s³)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0.08',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }, { controlId: 'viscous-has-epsilon', values: [true] }],
          }),
          makePanelControl('initialization-std-omega', 'Specific Dissipation Rate (1/s)', 'Initialization', 'Initialization Methods', 'field', {
            value: '38.4',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }, { controlId: 'viscous-has-omega', values: [true] }],
          }),
          makePanelControl('initialization-std-nut', 'Modified Turbulent Viscosity (m²/s)', 'Initialization', 'Initialization Methods', 'field', {
            value: '0.0006',
            visibleWhen: [{ controlId: 'initialization-standard', values: [true] }, { controlId: 'viscous-has-nut', values: [true] }],
          }),
          makePanelControl('initialization-std-temp', 'Initial Temperature (K)', 'Initialization', 'Initialization Methods', 'field', {
            value: '300',
            visibleWhen: [
              { controlId: 'initialization-standard', values: [true] },
              { controlId: 'energy-enable', values: [true] },
            ],
          }),
          makePanelControl('initialization-run-inline', 'Initialize', 'Initialization', 'Initialization Methods'),
        ],
      },
      {
        id: 'init-tools-group',
        title: 'Patch & Advanced',
        controls: [
          makePanelControl('initialization-patch', 'Patch', 'Initialization', 'Patch & Advanced', 'button', {
            dialogId: 'patch-initialization-dialog',
          }),
          makePanelControl('initialization-fmg', 'FMG Initialization', 'Initialization', 'Patch & Advanced', 'button', {
            dialogId: 'fmg-initialization-dialog',
          }),
          makePanelControl('initialization-reset', 'Reset Initialization', 'Initialization', 'Patch & Advanced', 'button'),
        ],
      },
    ],
  },
  {
    id: 'run-calculation-panel',
    title: '运行计算',
    module: 'Run Calculation',
    subtitle: '先执行 Check Case 检查算例完整性，再设定迭代或时间步数启动求解。',
    groups: [
      {
        id: 'run-check-group',
        title: 'Pre-Run Verification',
        controls: [
          makePanelControl('run-check-case', 'Check Case', 'Run Calculation', 'Pre-Run Verification', 'button'),
        ],
      },
      {
        id: 'run-parameters-group',
        title: 'Parameters',
        controls: [
          ...timeAdvancementControls(),
          makePanelControl('run-iterations', 'No. of Iterations', 'Run Calculation', 'Parameters', 'field', {
            value: '250',
            visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Steady'] }],
          }),
          makePanelControl('run-time-step-inline', 'Time Step Size', 'Run Calculation', 'Parameters', 'field', {
            visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Transient'] }, { controlId: 'run-effective-time-method', values: ['User-Specified'] }],
          }),
          makePanelControl('run-transient-steps', 'Number of Time Steps', 'Run Calculation', 'Parameters', 'field', {
            visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Transient'] }, { controlId: 'run-effective-time-method', values: directStepMethods }],
          }),
          makePanelControl('run-max-iterations-inline', 'Max Iterations/Time Step', 'Run Calculation', 'Parameters', 'field', {
            visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Transient'] }],
          }),
          makePanelControl('run-reporting-interval', 'Reporting Interval', 'Run Calculation', 'Parameters', 'field', {
            value: '1',
            visibleWhen: [{ controlId: 'solver-time-formulation', values: ['Steady'] }],
          }),
          makePanelControl('run-profile-interval', 'Profile Update Interval', 'Run Calculation', 'Parameters', 'field', {
            value: '1',
          }),
          makePanelControl('run-data-quantities', 'Data File Quantities', 'Run Calculation', 'Parameters', 'button', {
            dialogId: 'data-file-quantities-dialog',
          }),
          makePanelControl('run-calculate', 'Calculate', 'Run Calculation', 'Parameters'),
        ],
      },
    ],
  },
  {
    id: 'monitors-panel',
    title: '监控器',
    module: 'Monitors',
    subtitle: '配置残差曲线、收敛判据、Report Plots 实时曲线与计算统计采样。',
    groups: [
      {
        id: 'monitors-main-group',
        title: 'Monitors',
        controls: [
          makePanelControl('monitors-residuals', 'Residual Monitors', 'Monitors', 'Monitors', 'button', {
            dialogId: 'residual-monitors-dialog',
          }),
          makePanelControl('monitors-convergence-conditions', 'Convergence Conditions', 'Monitors', 'Monitors', 'button', {
            dialogId: 'convergence-conditions-dialog',
          }),
          makePanelControl('monitors-report-plots', 'Report Plots', 'Monitors', 'Monitors', 'button', {
            dialogId: 'report-plots-dialog',
          }),
          makePanelControl('monitors-report-files', 'Report Files', 'Monitors', 'Monitors', 'button', {
            dialogId: 'report-files-dialog',
          }),
          makePanelControl('monitors-statistics', 'Statistics', 'Monitors', 'Monitors', 'button', {
            dialogId: 'statistics-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'surfaces-panel',
    title: '表面',
    module: 'Results',
    subtitle: '创建用于采样与绘图的点、线、平面、等值面与裁剪面。',
    groups: [
      {
        id: 'surfaces-main-group',
        title: 'Create Surfaces',
        controls: [
          makePanelControl('surface-point', 'Point Surface', 'Results', 'Create Surfaces', 'button', {
            dialogId: 'point-surface-dialog',
          }),
          makePanelControl('surface-line-rake', 'Line/Rake', 'Results', 'Create Surfaces', 'button', {
            dialogId: 'line-rake-dialog',
          }),
          makePanelControl('surface-plane', 'Plane Surface', 'Results', 'Create Surfaces', 'button', {
            dialogId: 'plane-surface-dialog',
          }),
          makePanelControl('surface-iso-surface', 'Iso-Surface', 'Results', 'Create Surfaces', 'button', {
            dialogId: 'iso-surface-dialog',
          }),
          makePanelControl('surface-iso-clip', 'Iso-Clip', 'Results', 'Create Surfaces', 'button', {
            dialogId: 'iso-clip-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'graphics-panel',
    title: '图形',
    module: 'Results',
    subtitle: '管理网格、云图、矢量、迹线、颗粒轨迹及多对象组合场景。',
    groups: [
      {
        id: 'graphics-main-group',
        title: 'Graphics Objects',
        controls: [
          makePanelControl('results-mesh', 'Mesh', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'mesh-display-dialog',
          }),
          makePanelControl('results-contours', 'Contours', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'contours-dialog',
          }),
          makePanelControl('results-vectors', 'Vectors', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'vectors-dialog',
          }),
          makePanelControl('results-pathlines', 'Pathlines', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'pathlines-dialog',
          }),
          makePanelControl('results-particle-tracks', 'Particle Tracks', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'particle-tracks-dialog',
          }),
          makePanelControl('results-scene', 'Scene', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'scene-dialog',
          }),
          makePanelControl('results-display-options', 'Display Options', 'Results', 'Graphics Objects', 'button', {
            dialogId: 'display-options-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'plots-panel',
    title: '图',
    module: 'Results',
    subtitle: '绘制沿线 XY 曲线、变量直方图、FFT 频谱图与残差收敛曲线。',
    groups: [
      {
        id: 'plots-main-group',
        title: 'Plots',
        controls: [
          makePanelControl('plot-xy', 'XY Plot', 'Results', 'Plots', 'button', {
            dialogId: 'xy-plot-dialog',
          }),
          makePanelControl('plot-histogram', 'Histogram', 'Results', 'Plots', 'button', {
            dialogId: 'histogram-dialog',
          }),
          makePanelControl('plot-fft', 'FFT', 'Results', 'Plots', 'button', {
            dialogId: 'fft-dialog',
          }),
          makePanelControl('plot-residuals', 'Residual Plot', 'Results', 'Plots', 'button'),
        ],
      },
    ],
  },
  {
    id: 'reports-panel',
    title: '报告',
    module: 'Results',
    subtitle: '计算边界质量/热量通量平衡（Fluxes）、壁面力（Forces）与面积/体积积分。',
    groups: [
      {
        id: 'reports-main-group',
        title: 'Reports',
        controls: [
          makePanelControl('results-fluxes', 'Fluxes', 'Results', 'Reports', 'button', {
            dialogId: 'fluxes-report-dialog',
          }),
          makePanelControl('results-forces', 'Forces', 'Results', 'Reports', 'button', {
            dialogId: 'forces-report-dialog',
          }),
          makePanelControl('results-surface-integrals', 'Surface Integrals', 'Results', 'Reports', 'button', {
            dialogId: 'surface-integrals-dialog',
          }),
          makePanelControl('results-volume-integrals', 'Volume Integrals', 'Results', 'Reports', 'button', {
            dialogId: 'volume-integrals-dialog',
          }),
          makePanelControl('results-reports', 'Reports', 'Results', 'Reports', 'button', {
            dialogId: 'reports-dialog',
          }),
          makePanelControl('results-summary', 'Summary', 'Results', 'Reports', 'button'),
        ],
      },
    ],
  },
  // Replacement for ALL 11 former fallback panels with authentic Fluent controls
  {
    id: 'motion-panel',
    title: 'Motion Definitions',
    module: 'Motion Definitions',
    subtitle: '定义刚体旋转、平移或六自由度（6-DOF）运动规律，供旋转域或动网格引用。',
    groups: [
      {
        id: 'motion-panel-group',
        title: 'Motion Profile',
        controls: [
          makePanelControl('motion-type', 'Motion Type', 'Motion Definitions', 'Motion Profile', 'select', {
            value: 'Rotational',
          }),
          makePanelControl('motion-rpm', 'Rotational Speed', 'Motion Definitions', 'Motion Profile', 'field', {
            value: '1200 rpm',
          }),
          makePanelControl('motion-axis', 'Rotation Axis', 'Motion Definitions', 'Motion Profile', 'field', {
            value: '0, 0, 1',
          }),
          makePanelControl('motion-apply-zone', 'Cell Zone Conditions', 'Motion Definitions', 'Motion Profile', 'button', {
            dialogId: 'cell-zone-fluid-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'mesh-interface-panel',
    title: '网格界面',
    module: 'Mesh Interfaces',
    subtitle: '建立非共节点交界面（Non-Conformal Interface），支持滑移网格与周期性映射。',
    groups: [
      {
        id: 'mesh-interface-group',
        title: 'Interface Pairs',
        controls: [
          makePanelControl('interface-pair-name', 'Interface Name', 'Mesh Interfaces', 'Interface Pairs', 'field', {
            value: 'rotor-stator-interface',
          }),
          makePanelControl('interface-option', 'Interface Option', 'Mesh Interfaces', 'Interface Pairs', 'select', {
            value: 'Coupled Wall',
          }),
          makePanelControl('interface-matching', 'Matching', 'Mesh Interfaces', 'Interface Pairs', 'checkbox'),
          makePanelControl('interface-create', 'Create', 'Mesh Interfaces', 'Interface Pairs', 'button'),
        ],
      },
    ],
  },
  {
    id: 'aux-geometry-panel',
    title: '辅助几何结构定义',
    module: 'Auxiliary Geometry',
    subtitle: '定义用于虚拟区域标记、后处理提取或旋转对称轴辅助参考的几何对象。',
    groups: [
      {
        id: 'aux-geometry-group',
        title: 'Auxiliary Shapes',
        controls: [
          makePanelControl('aux-shape-type', 'Shape Type', 'Auxiliary Geometry', 'Auxiliary Shapes', 'select', {
            value: 'Cylinder',
          }),
          makePanelControl('aux-origin', 'Origin', 'Auxiliary Geometry', 'Auxiliary Shapes', 'field', {
            value: '0, 0, 0 m',
          }),
          makePanelControl('aux-radius', 'Radius', 'Auxiliary Geometry', 'Auxiliary Shapes', 'field', {
            value: '0.05 m',
          }),
        ],
      },
    ],
  },
  {
    id: 'reference-frames-panel',
    title: '参考系',
    module: 'Reference Frames',
    subtitle: '管理绝对静止坐标系、平移/旋转参考系（MRF）及其从属层级关系。',
    groups: [
      {
        id: 'reference-frames-group',
        title: 'Frame Definition',
        controls: [
          makePanelControl('ref-frame-name', 'Frame Name', 'Reference Frames', 'Frame Definition', 'field', {
            value: 'mrf-impeller-frame',
          }),
          makePanelControl('ref-frame-motion', 'Motion Type', 'Reference Frames', 'Frame Definition', 'select', {
            value: 'Stationary',
          }),
          makePanelControl('ref-frame-omega', 'Angular Velocity', 'Reference Frames', 'Frame Definition', 'field', {
            value: '0 rad/s',
          }),
        ],
      },
    ],
  },
  {
    id: 'named-expressions-panel',
    title: '已命名的表达式',
    module: 'Named Expressions',
    subtitle: '通过类似 Python/Fluent 的表达式语法直接定义随时间/空间变化的边界或源项，无需编写 C 语言 UDF。',
    groups: [
      {
        id: 'named-expressions-group',
        title: 'Expression Editor',
        controls: [
          makePanelControl('expr-name', 'Expression Name', 'Named Expressions', 'Expression Editor', 'field', {
            value: 'inlet_profile',
          }),
          makePanelControl('expr-definition', 'Definition', 'Named Expressions', 'Expression Editor', 'field', {
            value: '2.5 [m s^-1] * (1 - (sqrt(x**2 + y**2) / 0.05 [m])**2)',
          }),
          makePanelControl('expr-use-in-bc', 'Use as Velocity Inlet', 'Named Expressions', 'Expression Editor', 'button', {
            dialogId: 'velocity-inlet-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'curvilinear-panel',
    title: '曲线坐标系',
    module: 'Curvilinear Coordinates',
    subtitle: '沿弯曲壁面或流道生成局部贴体曲线坐标方向，用于各向异性多孔阻力或材料导热定义。',
    groups: [
      {
        id: 'curvilinear-group',
        title: 'Coordinate Direction',
        controls: [
          makePanelControl('curv-method', 'Generation Method', 'Curvilinear Coordinates', 'Coordinate Direction', 'select', {
            value: 'Inlet-to-Outlet Potential',
          }),
          makePanelControl('curv-zone', 'Target Zone', 'Curvilinear Coordinates', 'Coordinate Direction', 'select', {
            value: 'fluid-domain',
          }),
          makePanelControl('curv-compute', 'Compute', 'Curvilinear Coordinates', 'Coordinate Direction', 'button'),
        ],
      },
    ],
  },
  {
    id: 'cell-registers-panel',
    title: '单元标记',
    module: 'Cell Registers',
    subtitle: '按坐标盒/球体、场变量梯度或等值范围标记单元集，供局部 Patch 初始化或网格自适应使用。',
    groups: [
      {
        id: 'cell-registers-group',
        title: 'Register Criteria',
        controls: [
          makePanelControl('register-name', 'Register Name', 'Cell Registers', 'Register Criteria', 'field', {
            value: 'high-grad-region',
          }),
          makePanelControl('register-shape', 'Register Type', 'Cell Registers', 'Register Criteria', 'select', {
            value: 'Field Value',
          }),
          makePanelControl('register-open-adapt', 'Mark / Adapt', 'Cell Registers', 'Register Criteria', 'button', {
            dialogId: 'mesh-adaptation-dialog',
          }),
          makePanelControl('register-open-patch', 'Patch Using Register', 'Cell Registers', 'Register Criteria', 'button', {
            dialogId: 'patch-initialization-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'dashboard-panel',
    title: 'Dashboard',
    module: 'Dashboard',
    subtitle: '汇总当前教学算例的收敛状态、通量质量平衡、网格规模与核心物理量监控快照。',
    groups: [
      {
        id: 'dashboard-group',
        title: 'Case Overview',
        controls: [
          makePanelControl('dash-show-residuals', 'Residual Plot', 'Dashboard', 'Case Overview', 'button'),
          makePanelControl('dash-show-contours', 'Contours', 'Dashboard', 'Case Overview', 'button', {
            dialogId: 'contours-dialog',
          }),
          makePanelControl('dash-check-fluxes', 'Fluxes', 'Dashboard', 'Case Overview', 'button', {
            dialogId: 'fluxes-report-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'animations-panel',
    title: '动画',
    module: 'Animations',
    subtitle: '针对瞬态计算或迭代过程录制 Solution Animation 帧序列与回放场景。',
    groups: [
      {
        id: 'animations-group',
        title: 'Solution Animation',
        controls: [
          makePanelControl('anim-name', 'Animation Name', 'Animations', 'Solution Animation', 'field', {
            value: 'velocity-transient-anim',
          }),
          makePanelControl('anim-record-every', 'Record After Every', 'Animations', 'Solution Animation', 'field', {
            value: '5 Time Steps',
          }),
          makePanelControl('anim-storage', 'Storage Type', 'Animations', 'Solution Animation', 'select', {
            value: 'HSF File',
          }),
        ],
      },
    ],
  },
  {
    id: 'parameters-controls-panel',
    title: '参数和控制',
    module: 'Parameters and Controls',
    subtitle: '将入口速度、几何或物性设为 Input Parameters，将压降/换热/阻力设为 Output Parameters 进行 Workbench 参数化扫描。',
    groups: [
      {
        id: 'parameters-controls-group',
        title: 'Workbench Parameters',
        controls: [
          makePanelControl('param-inlet-vel', 'Input Parameter (v_in)', 'Parameters and Controls', 'Workbench Parameters', 'field', {
            value: '2.5 m/s',
          }),
          makePanelControl('param-output-dp', 'Output Parameter (delta_p)', 'Parameters and Controls', 'Workbench Parameters', 'field', {
            value: 'Computed on Solve',
          }),
          makePanelControl('param-open-table', 'Parameter Table', 'Parameters and Controls', 'Workbench Parameters', 'button', {
            dialogId: 'parameters-table-dialog',
          }),
        ],
      },
    ],
  },
  {
    id: 'simulation-report-panel',
    title: '仿真报告',
    module: 'Simulation Report',
    subtitle: '一键汇总网格信息、模型设定、边界条件、收敛曲线与后处理云图生成结构化仿真报告。',
    groups: [
      {
        id: 'simulation-report-group',
        title: 'Report Generation',
        controls: [
          makePanelControl('sim-report-title', 'Report Title', 'Simulation Report', 'Report Generation', 'field', {
            value: 'Mixing Elbow CFD Analysis Report',
          }),
          makePanelControl('sim-report-include-mesh', 'Include Mesh & Setup Summary', 'Simulation Report', 'Report Generation', 'checkbox', {
            defaultSelected: true,
          }),
          makePanelControl('sim-report-generate', 'Generate Summary', 'Simulation Report', 'Report Generation', 'button'),
        ],
      },
    ],
  },
]
