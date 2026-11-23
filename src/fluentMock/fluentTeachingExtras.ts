import {
  extendedControlOptionsById,
  extendedOptionExplanations,
  extendedRelatedCalculatorsByControlId,
} from './data/extendedExplanations'
import type { FluentVisibilityCondition } from './fluentTypes'
import { multiphaseDialogId, multiphaseTabs } from './data/multiphaseDialogs'
import { physicsModelTabs } from './data/physicsModelBranches'
import { extendedWorkflowDialogTabs } from './data/extendedWorkflowDialogs'
import { nestedSubDialogTabs } from './data/nestedSubDialogs'

export interface SelectOptionItem {
  value: string
  label: string
  disabled?: boolean
  reason?: string
}

export interface RelatedCalculatorLink {
  label: string
  to: string
  note: string
}

export interface WalkthroughStep {
  id: number
  title: string
  instruction: string
  controlId: string
}

export interface TroubleshootingCase {
  id: string
  symptom: string
  likelyCauses: string[]
  fixes: string[]
  targetControls: Array<{ controlId: string; label: string }>
}

export const controlOptionsById: Record<string, SelectOptionItem[]> = {
  'methods-pressure-velocity': [
    { value: 'SIMPLE', label: 'SIMPLE' },
    { value: 'SIMPLEC', label: 'SIMPLEC' },
    { value: 'PISO', label: 'PISO' },
    { value: 'Coupled', label: 'Coupled' },
  ],
  'solution-methods-coupling': [
    { value: 'SIMPLE', label: 'SIMPLE' },
    { value: 'SIMPLEC', label: 'SIMPLEC' },
    { value: 'PISO', label: 'PISO' },
    { value: 'Coupled', label: 'Coupled' },
  ],
  'methods-gradient': [
    { value: 'Least Squares Cell Based', label: 'Least Squares Cell Based' },
    { value: 'Green-Gauss Cell Based', label: 'Green-Gauss Cell Based' },
    { value: 'Green-Gauss Node Based', label: 'Green-Gauss Node Based' },
  ],
  'solution-methods-pressure': [
    { value: 'Standard', label: 'Standard' },
    { value: 'Second Order', label: 'Second Order' },
    { value: 'PRESTO!', label: 'PRESTO!' },
    { value: 'Body Force Weighted', label: 'Body Force Weighted' },
  ],
  'methods-momentum': [
    { value: 'First Order Upwind', label: 'First Order Upwind' },
    { value: 'Second Order Upwind', label: 'Second Order Upwind' },
    { value: 'QUICK', label: 'QUICK' },
  ],
  'solution-methods-momentum': [
    { value: 'First Order Upwind', label: 'First Order Upwind' },
    { value: 'Second Order Upwind', label: 'Second Order Upwind' },
    { value: 'QUICK', label: 'QUICK' },
  ],
  'viscous-wall-treatment': [
    { value: 'Enhanced Wall Treatment', label: 'Enhanced Wall Treatment' },
    { value: 'Standard Wall Functions', label: 'Standard Wall Functions' },
    { value: 'Scalable Wall Functions', label: 'Scalable Wall Functions' },
  ],
  'velocity-inlet-turbulence': [
    {
      value: 'Intensity and Hydraulic Diameter',
      label: 'Intensity and Hydraulic Diameter',
    },
    {
      value: 'Intensity and Viscosity Ratio',
      label: 'Intensity and Viscosity Ratio',
    },
    { value: 'K and Omega', label: 'K and Omega' },
    { value: 'K and Epsilon', label: 'K and Epsilon' },
  ],
  'mass-flow-inlet-turbulence': [
    {
      value: 'Intensity and Hydraulic Diameter',
      label: 'Intensity and Hydraulic Diameter',
    },
    {
      value: 'Intensity and Viscosity Ratio',
      label: 'Intensity and Viscosity Ratio',
    },
    { value: 'K and Omega', label: 'K and Omega' },
    { value: 'K and Epsilon', label: 'K and Epsilon' },
  ],
  'mass-flow-inlet-direction': [
    { value: 'Normal to Boundary', label: 'Normal to Boundary' },
    { value: 'Direction Vector', label: 'Direction Vector' },
  ],
  'pressure-outlet-turbulence': [
    {
      value: 'Intensity and Viscosity Ratio',
      label: 'Intensity and Viscosity Ratio',
    },
    {
      value: 'Intensity and Hydraulic Diameter',
      label: 'Intensity and Hydraulic Diameter',
    },
  ],
  'material-type': [
    { value: 'fluid', label: 'fluid' },
    { value: 'solid', label: 'solid' },
  ],
  'material-density-method': [
    { value: 'constant', label: 'constant' },
    { value: 'ideal-gas', label: 'ideal-gas' },
    { value: 'incompressible-ideal-gas', label: 'incompressible-ideal-gas' },
    { value: 'boussinesq', label: 'boussinesq' },
    { value: 'polynomial', label: 'polynomial' },
  ],
  'material-viscosity-method': [
    { value: 'constant', label: 'constant' },
    { value: 'sutherland', label: 'sutherland' },
    { value: 'power-law', label: 'power-law' },
    { value: 'piecewise-linear', label: 'piecewise-linear' },
  ],
  'wall-motion': [
    { value: 'Stationary Wall', label: 'Stationary Wall' },
    { value: 'Moving Wall', label: 'Moving Wall' },
  ],
  'wall-thermal': [
    { value: 'Heat Flux', label: 'Heat Flux' },
    { value: 'Temperature', label: 'Temperature' },
    { value: 'Convection', label: 'Convection' },
    { value: 'Coupled', label: 'Coupled' },
  ],
  'units-length': [
    { value: 'm', label: 'm' },
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
    { value: 'in', label: 'in' },
    { value: 'ft', label: 'ft' },
  ],
  'units-pressure': [
    { value: 'Pa', label: 'Pa' },
    { value: 'kPa', label: 'kPa' },
    { value: 'bar', label: 'bar' },
    { value: 'atm', label: 'atm' },
    { value: 'psi', label: 'psi' },
    { value: 'dyn/cm2', label: 'dyn/cm²' },
  ],
  'units-temperature': [
    { value: 'K', label: 'K' },
    { value: 'C', label: 'C' },
    { value: 'F', label: 'F' },
  ],
  'contours-field-variable': [
    { value: 'Velocity Magnitude', label: 'Velocity Magnitude' },
    { value: 'Static Pressure', label: 'Static Pressure' },
    { value: 'Static Temperature', label: 'Static Temperature' },
  ],
  'contours-surfaces': [
    { value: 'wall, inlet, outlet', label: 'wall, inlet, outlet' },
    { value: 'symmetry-plane', label: 'symmetry-plane' },
    { value: 'fluid-domain', label: 'fluid-domain' },
  ],
  'vectors-field': [
    { value: 'Velocity', label: 'Velocity' },
    { value: 'Relative Velocity', label: 'Relative Velocity' },
  ],
  'display-options-colormap': [
    { value: 'Rainbow', label: 'Rainbow' },
    { value: 'Blue to Red', label: 'Blue to Red' },
    { value: 'Turbo', label: 'Turbo' },
    { value: 'Viridis', label: 'Viridis' },
    { value: 'Grayscale', label: 'Grayscale' },
  ],
  'solver-velocity-formulation': [
    { value: 'Absolute', label: 'Absolute' },
    { value: 'Relative', label: 'Relative' },
  ],
  'solver-time-formulation': [
    { value: 'Steady', label: 'Steady' },
    { value: 'Transient', label: 'Transient' },
  ],
  'reference-compute-from': [
    { value: 'inlet', label: 'inlet' },
    { value: 'outlet', label: 'outlet' },
    { value: 'all-zones', label: 'all-zones' },
  ],
  'reference-values-compute-from': [
    { value: 'inlet', label: 'inlet' },
    { value: 'outlet', label: 'outlet' },
    { value: 'all-zones', label: 'all-zones' },
  ],
  'initialization-reference-frame': [
    { value: 'Relative to Cell Zone', label: 'Relative to Cell Zone' },
    { value: 'Absolute', label: 'Absolute' },
  ],
  'initialization-patch-region': [
    { value: 'fluid-domain', label: 'fluid-domain' },
    { value: 'inlet-region', label: 'inlet-region' },
  ],
  'initialization-patch-variable': [
    { value: 'Temperature', label: 'Temperature' },
    { value: 'X Velocity', label: 'X Velocity' },
    { value: 'Pressure', label: 'Pressure' },
  ],
  'mesh-scale-units': [
    { value: 'm', label: 'm' },
    { value: 'mm', label: 'mm' },
    { value: 'cm', label: 'cm' },
  ],
  'mesh-display-surfaces': [
    { value: 'all', label: 'all' },
    { value: 'inlet, outlet', label: 'inlet, outlet' },
    { value: 'wall', label: 'wall' },
  ],
  'autosave-file-type': [
    { value: 'case and data', label: 'case and data' },
    { value: 'data only', label: 'data only' },
  ],
  'reports-type': [
    { value: 'Surface Integral', label: 'Surface Integral' },
    { value: 'Fluxes', label: 'Fluxes' },
    { value: 'Forces', label: 'Forces' },
  ],
  'reports-field-variable': [
    { value: 'Mass Flow Rate', label: 'Mass Flow Rate' },
    { value: 'Total Heat Transfer Rate', label: 'Total Heat Transfer Rate' },
    { value: 'Area-Weighted Velocity', label: 'Area-Weighted Velocity' },
  ],
  'report-definition-type': [
    { value: 'Force', label: 'Force' },
    { value: 'Area-Weighted Average', label: 'Area-Weighted Average' },
    { value: 'Volume-Average', label: 'Volume-Average' },
    { value: 'Mass Flow Rate', label: 'Mass Flow Rate' },
  ],
  'report-definition-surfaces': [
    { value: 'wall', label: 'wall' },
    { value: 'inlet', label: 'inlet' },
    { value: 'outlet', label: 'outlet' },
  ],
  'surface-integrals-type': [
    { value: 'Area-Weighted Average', label: 'Area-Weighted Average' },
    { value: 'Mass-Weighted Average', label: 'Mass-Weighted Average' },
    { value: 'Facet Average', label: 'Facet Average' },
  ],
  'surface-integrals-field': [
    { value: 'Temperature', label: 'Temperature' },
    { value: 'Velocity Magnitude', label: 'Velocity Magnitude' },
    { value: 'Static Pressure', label: 'Static Pressure' },
  ],
  'surface-integrals-surfaces': [
    { value: 'outlet', label: 'outlet' },
    { value: 'inlet', label: 'inlet' },
    { value: 'wall', label: 'wall' },
  ],
  'plane-surface-method': [
    { value: 'Point and Normal', label: 'Point and Normal' },
    { value: 'YZ Plane', label: 'YZ Plane' },
    { value: 'XZ Plane', label: 'XZ Plane' },
    { value: 'XY Plane', label: 'XY Plane' },
  ],
  'xy-plot-x-axis': [
    { value: 'Position', label: 'Position' },
    { value: 'Arc Length', label: 'Arc Length' },
  ],
  'xy-plot-y-axis': [
    { value: 'Pressure', label: 'Pressure' },
    { value: 'Velocity Magnitude', label: 'Velocity Magnitude' },
    { value: 'Temperature', label: 'Temperature' },
  ],
  'xy-plot-surfaces': [
    { value: 'centerline', label: 'centerline' },
    { value: 'wall', label: 'wall' },
  ],
  'mesh-adaptation-method': [
    { value: 'Gradient', label: 'Gradient' },
    { value: 'Boundary', label: 'Boundary' },
    { value: 'Iso-Value', label: 'Iso-Value' },
  ],
  'mesh-adaptation-field': [
    { value: 'Velocity Magnitude', label: 'Velocity Magnitude' },
    { value: 'Static Temperature', label: 'Static Temperature' },
  ],
  'graphics-selection-filter': [
    { value: 'all', label: 'all' },
    { value: 'faces', label: 'faces' },
    { value: 'edges', label: 'edges' },
    { value: 'cells', label: 'cells' },
  ],
  ...extendedControlOptionsById,
}

export const optionExplanations: Record<string, string> = {
  SIMPLE:
    '分离式压力速度耦合经典算法，每步内存占用小；一般单相稳态建议先用或对比 Coupled，若收敛慢可尝试 Coupled。',
  SIMPLEC:
    '对 SIMPLE 压力修正做了欠松弛简化，简单管道/稳态问题有时收敛略快于 SIMPLE；网格扭曲较大时仍需留意稳定性。',
  PISO:
    '带邻近修正的分离算法，常用于瞬态小步长或网格质量一般需要较好每步耦合的场合。',
  Coupled:
    '压力与动量联立求解时，稳态收敛步数通常大幅少于 SIMPLE（单步内存占用更高）；若用于 Wall 热边界条件，则表示流固耦合交界面自动传递热量。',
  'First Order Upwind':
    '一阶迎风数值耗散大、稳定性极强，常用于初始调试前几十步过渡，但不建议作为最终高精度工程结果格式。',
  'Second Order Upwind':
    '二阶迎风兼顾精度与稳定性，是大多数工程流动动量与能量离散的常用主力选择。',
  QUICK:
    '适用于结构化/六面体主导网格的高阶格式，非结构四面体网格上通常优先二阶迎风。',
  'PRESTO!':
    '常用于强旋流、强浮力自然对流、多孔介质或大压力梯度弯曲流道。',
  'Second Order':
    '多数常规单相低速稳态压力插值的标准选项，精度优于 Standard。',
  'Enhanced Wall Treatment':
    '兼顾细网格（y+≈1）解析黏性底层与中等 y+ 过渡的近壁处理；若配合 k-omega SST 则自带 y+ 不敏感近壁过渡公式。',
  'Standard Wall Functions':
    '经典对数律壁面函数，要求第一层网格中心落在对数区（通常期望 y+ 在 30–300），不适合 y+<5 的超细壁面网格。',
  'Scalable Wall Functions':
    '对标准壁面函数设置 y+ 下限保护，防止局部网格过密进入黏性底层导致壁面函数失效。',
  constant:
    '常物性近似，适合温差小、压力变化微弱的不可压缩流动起步验证。',
  'ideal-gas':
    '可压缩理想气体状态方程（密度随绝对压力与温度变化），通常需同步开启 Energy 方程并核对 Operating Pressure。',
  'incompressible-ideal-gas':
    '密度仅随温度按理想气体变化而不受表压波动影响，适合低速温差浮力流或加热管道。',
  'Heat Flux':
    '给定壁面热流密度（0 代表绝热壁面 adiabatic），需要 Energy 方程开启后才参与计算。',
  Temperature:
    '定壁温边界条件，适用于已知恒温表面或相变恒温壁面。',
  Convection:
    '第三类对流换热边界，需输入环境自由流温度与传热系数 h。',
  'Intensity and Hydraulic Diameter':
    '内部管流、风道入口最常用的湍流给定方式：只需输入估算湍流强度（%）与水力直径 Dh。',
  'Intensity and Viscosity Ratio':
    '外部绕流或几何尺度不易用水力直径定义的入口，常用湍流强度 + 涡黏度比（μt/μ）。',
  ...extendedOptionExplanations,
}

const viscousCalculators: RelatedCalculatorLink[] = [
  {
    label: 'y+ 与第一层网格高度',
    to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
    note: '根据目标 y+ 估算第一层网格厚度 h1 与边界层方案',
  },
  {
    label: '边界层网格等比增长',
    to: '/calculators/near-wall-mesh/boundary-layer-mesh',
    note: '计算多层膨胀网格累计厚度',
  },
]

const energyCalculators: RelatedCalculatorLink[] = [
  {
    label: 'Prandtl 数计算器',
    to: '/calculators/dimensionless-numbers/prandtl-number',
    note: '评估动量扩散与热扩散相对强弱',
  },
  {
    label: '对流换热关系',
    to: '/calculators/heat-transfer/convective-heat-transfer',
    note: '估算换热功率与温差规模',
  },
  {
    label: '热通量计算器',
    to: '/calculators/heat-transfer/heat-flux',
    note: '在总热功率 Q 与壁面 Heat Flux 间换算',
  },
]

const transientCalculators: RelatedCalculatorLink[] = [
  {
    label: 'CFL 与时间步长',
    to: '/calculators/transient-time-step/cfl-time-step',
    note: '根据网格尺寸与特征速度估算初始 Δt',
  },
  {
    label: '总时间步数量',
    to: '/calculators/transient-time-step/total-time-steps',
    note: '根据总仿真物理时长换算步数',
  },
]

export const relatedCalculatorsByControlId: Record<string, RelatedCalculatorLink[]> = {
  'models-viscous': viscousCalculators,
  'ribbon-model-viscous': viscousCalculators,
  'velocity-inlet-turbulence': [{ label: '入口湍流参数换算', to: '/calculators/flow-piping/inlet-turbulence', note: '按强度、水力直径或黏度比换算 k、ε、ω。' }],
  'viscous-kepsilon': [
    {
      label: 'y+ 与第一层网格高度',
      to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
      note: '校验标准壁面函数（y+ 30~300）或增强壁面处理（y+≈1）网格尺度',
    },
  ],
  'viscous-kw-sst': [
    {
      label: 'y+ 与第一层网格高度',
      to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
      note: 'SST 推荐解析边界层时目标 y+≈1',
    },
  ],
  'viscous-wall-treatment': [
    {
      label: 'y+ 与第一层网格高度',
      to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
      note: '核对不同近壁处理方式对应的第一层网格尺寸',
    },
  ],
  'bc-velocity-inlet': [
    {
      label: 'Reynolds 数计算器',
      to: '/calculators/dimensionless-numbers/reynolds-number',
      note: '判断入口属于层流还是湍流状态',
    },
    {
      label: '水力直径计算器',
      to: '/calculators/flow-piping/hydraulic-diameter',
      note: '非圆管截面入口先求 Dh 再填湍流参数',
    },
  ],
  'velocity-inlet-magnitude': [
    {
      label: '管内平均流速',
      to: '/calculators/flow-piping/mean-velocity',
      note: '由体积流量 Q 与截面积 A 反算速度',
    },
    {
      label: 'Reynolds 数计算器',
      to: '/calculators/dimensionless-numbers/reynolds-number',
      note: '核对流动雷诺数',
    },
  ],
  'bc-mass-flow-inlet': [
    {
      label: '体积/质量流量换算',
      to: '/calculators/flow-piping/mass-flow-rate',
      note: '在 m_dot 与 Q 之间换算并校验密度',
    },
  ],
  'general-transient': transientCalculators,
  'run-calculation-time-step': transientCalculators,
  'run-time-step-inline': transientCalculators,
  'ribbon-run': transientCalculators,
  'models-energy': energyCalculators,
  'ribbon-model-energy': energyCalculators,
  'energy-enable': energyCalculators,
  'general-density-based': [
    {
      label: 'Mach 数计算器',
      to: '/calculators/dimensionless-numbers/mach-number',
      note: '确认 Ma 是否达到强可压缩区间（通常 Ma > 0.3）',
    },
    {
      label: '理想气体声速',
      to: '/calculators/flow-piping/ideal-gas-speed-of-sound',
      note: '计算给定温度下的当地声速',
    },
  ],
  ...extendedRelatedCalculatorsByControlId,
}

export const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 0,
    title: '1. 网格检查 (Mesh Check)',
    instruction: '读入网格后先做负体积与域尺度检查，确认无几何单位错误或非法单元。',
    controlId: 'ribbon-mesh-check',
  },
  {
    id: 1,
    title: '2. 求解器与时间形式 (General)',
    instruction: '低速不可压缩选 Pressure-Based，稳态探索先保持 Steady。',
    controlId: 'general-pressure-based',
  },
  {
    id: 2,
    title: '3. 开启能量方程 (Energy)',
    instruction: '传热问题先在 Models 打开 Energy，解锁边界 Thermal 选项卡。',
    controlId: 'models-energy',
  },
  {
    id: 3,
    title: '4. 选择黏性/湍流模型 (Viscous)',
    instruction: '常见工程湍流选 k-omega SST 或 Realizable k-epsilon，并核对 y+。',
    controlId: 'models-viscous',
  },
  {
    id: 4,
    title: '5. 核对材料物性 (Materials)',
    instruction: '检查流体密度、黏度、导热系数和比热单位是否准确。',
    controlId: 'materials-main',
  },
  {
    id: 5,
    title: '6. 分配单元区域材料 (Cell Zone)',
    instruction: '把正确的流体材料绑定到 fluid-domain 体区域。',
    controlId: 'cell-zone-fluid',
  },
  {
    id: 6,
    title: '7. 设置入口与壁面边界 (Boundary)',
    instruction: '分别核对 Velocity Inlet 的速度、湍流参数和温度，以及壁面热条件。',
    controlId: 'bc-velocity-inlet',
  },
  {
    id: 7,
    title: '8. 选择耦合与离散格式 (Methods)',
    instruction: '动量与能量优先使用 Second Order Upwind；稳态常用 SIMPLE 或 Coupled。',
    controlId: 'methods-pressure-velocity',
  },
  {
    id: 8,
    title: '9. 初始化流场 (Initialization)',
    instruction: '选择 Hybrid 或 Standard 后点击 Initialize，再启动计算。',
    controlId: 'initialization-run-inline',
  },
  {
    id: 9,
    title: '10. 运行计算与查看云图 (Run & Results)',
    instruction: '点击 Calculate 查看示例残差，再到 Contours 或 Vectors 查看演示结果。',
    controlId: 'run-calculate',
  },
]

export const troubleshootingCases: TroubleshootingCase[] = [
  {
    id: 'divergence-fpe',
    symptom: '1. Floating point exception / 计算发散报错',
    likelyCauses: [
      '网格存在高偏斜率（Skewness > 0.95）或负体积单元；',
      '时间步长过大（瞬态 CFL 远大于可稳范围）或初始场未合理初始化；',
      '松弛因子过高，或直接用高阶格式启动复杂强旋流算例。',
    ],
    fixes: [
      '先运行 Mesh Check 与 Report Quality 排查最差单元；',
      '在 Solution Methods 暂时用一阶迎风跑通前几十步再切回二阶；',
      '在 Solution Controls 适当降低 Pressure / Momentum 欠松弛因子，或减小瞬态时间步长。',
    ],
    targetControls: [
      { controlId: 'general-report-quality', label: 'Report Quality' },
      { controlId: 'controls-under-relaxation', label: 'Solution Controls' },
      { controlId: 'methods-momentum', label: 'Momentum 格式' },
    ],
  },
  {
    id: 'reversed-flow',
    symptom: '2. Reversed flow in faces on pressure-outlet（出口回流警告）',
    likelyCauses: [
      '压力出口截面距离涡流/分离区太近，流动在出口尚未充分发展；',
      '出口给定的 Backflow 温度或湍流参数偏离物理实际导致持续振荡。',
    ],
    fixes: [
      '优先在几何建模阶段延长出口段至回流区下游；',
      '若仅早期迭代出现并逐渐消失属正常过渡；若持续存在，核对 Pressure Outlet 的回流湍流与温度条件。',
    ],
    targetControls: [
      { controlId: 'bc-pressure-outlet', label: 'Pressure Outlet' },
      { controlId: 'pressure-outlet-turbulence', label: 'Backflow Turbulence' },
    ],
  },
  {
    id: 'continuity-stall',
    symptom: '3. Continuity 残差卡在 1e-2 ~ 1e-3 不再下降',
    likelyCauses: [
      '使用压力入口+压力出口或存在可压缩/浮力变化时，Pressure-Velocity 耦合较弱；',
      '质量守恒尚未建立（入口和出口定义存在冲突或网格过渡剧烈）。',
    ],
    fixes: [
      '将 Pressure-Velocity Coupling 从 SIMPLE 切换为 Coupled 对比收敛表现；',
      '结合 Reports -> Fluxes 核对进出口质量流量差值，不要只盯单一残差曲线。',
    ],
    targetControls: [
      { controlId: 'methods-pressure-velocity', label: 'P-V Coupling' },
      { controlId: 'results-reports', label: 'Reports / Fluxes' },
    ],
  },
  {
    id: 'poor-mesh-quality',
    symptom: '4. 最小正交质量过低 (< 0.1) 或最大偏斜率过高 (> 0.9)',
    likelyCauses: [
      '尖角倒角处四面体畸变，或边界层膨胀网格与体网格尺寸突跳。',
    ],
    fixes: [
      '定位最差单元区域修复几何/局部加密；检查梯度格式是否选用 Least Squares Cell Based 提高非正交网格鲁棒性。',
    ],
    targetControls: [
      { controlId: 'general-report-quality', label: 'Report Quality' },
      { controlId: 'methods-gradient', label: 'Gradient' },
    ],
  },
  {
    id: 'temperature-limit',
    symptom: '5. Temperature limited to ...（温度触及上下限警告）',
    likelyCauses: [
      '材料密度/比热/导热系数单位填错（如把 mm 当成 m）；',
      '热源项（Source Terms）强度单位填错（W vs W/m³）或壁面热通量过大而速度近零。',
    ],
    fixes: [
      '检查 Materials 物性、Cell Zone 体积热源单位与 Operating Conditions 参考压力/密度；',
      '核对 Boundary Conditions -> Thermal 边界设定及能量松弛因子。',
    ],
    targetControls: [
      { controlId: 'materials-main', label: 'Materials' },
      { controlId: 'cell-zone-source', label: 'Source Terms' },
      { controlId: 'bc-wall', label: 'Wall Thermal' },
    ],
  },
]

export interface DialogTabGroup {
  id: string
  label: string
  groups: string[]
  parentId?: string
  visibleWhen?: FluentVisibilityCondition[]
  enabledWhen?: FluentVisibilityCondition[]
  requires?: 'radiation' | 'species' | 'dpm' | 'multiphase'
}

const momentumTab: DialogTabGroup = { id: 'momentum', label: 'Momentum', groups: ['Momentum', 'Turbulence'] }
const thermalTab: DialogTabGroup = { id: 'thermal', label: 'Thermal', groups: ['Thermal'] }
const radiationTab: DialogTabGroup = { id: 'radiation', label: 'Radiation', groups: ['Radiation'], requires: 'radiation' }
const speciesTab: DialogTabGroup = { id: 'species', label: 'Species', groups: ['Species'], requires: 'species' }
const dpmTab: DialogTabGroup = { id: 'dpm', label: 'DPM', groups: ['DPM'], requires: 'dpm' }
const multiphaseTab: DialogTabGroup = { id: 'multiphase', label: 'Multiphase', groups: ['Multiphase'], requires: 'multiphase' }
const udsTab: DialogTabGroup = { id: 'uds', label: 'UDS', groups: ['UDS'], visibleWhen: [{ controlId: 'uds-count', values: ['1', '2', '3'] }] }
const flowTabs = [momentumTab, thermalTab, radiationTab, speciesTab, dpmTab, udsTab]
const fanOrVentTabs = [momentumTab, thermalTab, radiationTab, speciesTab, dpmTab, multiphaseTab, udsTab]

export const dialogTabsByDialogId: Record<string, DialogTabGroup[]> = {
  ...physicsModelTabs,
  ...extendedWorkflowDialogTabs,
  ...nestedSubDialogTabs,
  'velocity-inlet-dialog': [...flowTabs, multiphaseTab],
  'pressure-inlet-dialog': [...flowTabs, multiphaseTab],
  'pressure-far-field-dialog': flowTabs,
  'pressure-outlet-dialog': [...flowTabs, multiphaseTab],
  'mass-flow-inlet-dialog': [...flowTabs, multiphaseTab],
  'mass-flow-outlet-dialog': [
    { ...momentumTab, groups: ['Zone', 'Momentum'] },
    radiationTab,
    speciesTab,
    dpmTab,
    multiphaseTab,
    udsTab,
  ],
  'inlet-vent-dialog': fanOrVentTabs,
  'outlet-vent-dialog': fanOrVentTabs,
  'intake-fan-dialog': fanOrVentTabs,
  'exhaust-fan-dialog': fanOrVentTabs,
  'fan-dialog': [
    { id: 'momentum', label: 'Momentum', groups: ['Pressure-Jump Specification'] },
    dpmTab,
    udsTab,
  ],
  'porous-jump-dialog': [
    { id: 'momentum', label: 'Momentum', groups: ['Porous Jump'] },
    thermalTab,
    dpmTab,
    udsTab,
  ],
  'radiator-dialog': [
    { id: 'momentum', label: 'Momentum', groups: ['Radiator'] },
    thermalTab,
    dpmTab,
    udsTab,
  ],
  'wall-dialog': [momentumTab, thermalTab, radiationTab, dpmTab, speciesTab, udsTab, {
    id: 'wall-film', label: 'Wall Film', groups: ['Wall Film'],
    visibleWhen: [{ controlId: 'wall-film-enable', values: [true] }],
  }, {
    id: 'potential', label: 'Potential', groups: ['Potential'],
    visibleWhen: [{ controlId: 'electric-potential-enable', values: [true] }],
  }],
  'dynamic-mesh-zones-dialog': [
    { id: 'motion-attr', label: 'Motion Attributes', groups: ['Motion Attributes'], enabledWhen: [{ controlId: 'dynamic-mesh-zone-type', values: ['Rigid Body', 'User-Defined', 'System Coupling'] }] },
    { id: 'geom-def', label: 'Geometry Definition', groups: ['Geometry Definition'], enabledWhen: [{ controlId: 'dynamic-mesh-zone-type', values: ['Deforming'] }] },
    { id: 'mesh-opts', label: 'Meshing Options', groups: ['Meshing Options'] },
  ],
  [multiphaseDialogId]: multiphaseTabs,
  'dpm-model-dialog': [
    { id: 'tracking', label: 'Tracking', groups: ['Discrete Phase', 'Tracking'] },
    { id: 'physical-models', label: 'Physical Models', groups: ['Physical Models'], requires: 'dpm' },
    { id: 'udf', label: 'UDF', groups: ['UDF'], requires: 'dpm' },
    { id: 'numerics', label: 'Numerics', groups: ['Numerics'], requires: 'dpm' },
    { id: 'parallel', label: 'Parallel', groups: ['Parallel'], requires: 'dpm' },
  ],
}
