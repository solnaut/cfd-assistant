import { optionExplanations } from '../fluentTeachingExtras'
import { aiadRegime, gentopRegime } from './multiphaseDialogs'

const docs = 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/'
const models = docs + 'flu_ug/flu_ug_models_task_page.html'
const multiphase = docs + 'flu_ug/flu_ug_sec_multiphase_setup.html'
const eulerian = docs + 'flu_ug/flu_ug_sec_mphase_using_steps_eulerian.html'

function existingNotes(...values: string[]) {
  return Object.fromEntries(values.map((value) => [value, optionExplanations[value]]))
}

const pressureVelocity = {
  notes: {
    SIMPLE: '先求解动量方程，再通过压力修正更新压力和速度，使质量通量满足连续性约束。',
    SIMPLEC: '沿用 SIMPLE 的分离求解流程，修改速度修正与压力修正之间的关系。',
    PISO: '在一个求解步骤内增加压力与速度的修正，常用于瞬态求解。',
    Coupled: '在压力基求解器中联立求解动量方程和压力基连续性方程。单次迭代的内存需求通常高于分离式方法，实际收敛表现需结合算例检查。',
    'Phase Coupled SIMPLE': 'Eulerian 多相流的压力–速度耦合选项。在动量方程的求解中考虑各相之间的耦合。',
  },
  sourceUrl: docs + 'flu_ug/flu_ug_solution_methods_task_page.html',
}

const upwind = { notes: existingNotes('First Order Upwind', 'Second Order Upwind', 'QUICK') }
const pressure = {
  notes: {
    Standard: '经典线性插值，在大体压力梯度、浮力或曲率较小时尚可用；工程精算建议至少升级到 Second Order。',
    'Body Force Weighted': '把重力、离心力与多孔阻力直接计入交界面压力加权插值中，强热浮力、多孔媒体跳跃及强旋流强烈推荐。',
    ...existingNotes('Second Order', 'PRESTO!'),
  },
}
const turbulenceSpecification = { notes: existingNotes('Intensity and Hydraulic Diameter', 'Intensity and Viscosity Ratio') }

interface OptionTeaching {
  notes: Record<string, string>
  sourceUrl?: string
}

export const optionTeachingByControlId: Record<string, OptionTeaching> = {
  'methods-pressure-velocity': pressureVelocity,
  'solution-methods-coupling': pressureVelocity,
  'methods-momentum': upwind,
  'solution-methods-momentum': upwind,
  'methods-energy-scheme': upwind,
  'methods-tke': upwind,
  'methods-epsilon': upwind,
  'methods-omega': upwind,
  'methods-nut': upwind,
  'methods-do-scheme': { notes: existingNotes('First Order Upwind', 'Second Order Upwind') },
  'methods-pressure-scheme': pressure,
  'solution-methods-pressure': pressure,
  'velocity-inlet-turbulence': turbulenceSpecification,
  'pressure-inlet-turbulence': turbulenceSpecification,
  'pressure-outlet-turbulence': turbulenceSpecification,
  'mass-flow-inlet-turbulence': turbulenceSpecification,
  'material-density-method': {
    notes: {
      ...existingNotes('constant', 'ideal-gas', 'incompressible-ideal-gas'),
      boussinesq: 'Boussinesq 浮力近似：主方程保持参考常数密度，仅在重力动量源项按热膨胀系数引入浮力，适用于温差较小的自然对流。',
      polynomial: '通过温度多项式拟合实际流体密度曲线，适用于宽温域非线性物性模拟。',
    },
  },
  'material-viscosity-method': {
    notes: {
      constant: '为该材料指定固定的动力黏度。',
      sutherland: 'Sutherland 三系数定律按绝对温度自动计算气体动力黏度，推荐用于高速可压缩或大温差气体传热。',
      'power-law': '按幂律公式表达温度或剪切率相关的流体动力黏度变化。',
      'piecewise-linear': '按温度分断点线性插值输入实验实测流体动力黏度曲线。',
    },
  },
  'viscous-wall-treatment': { notes: existingNotes('Enhanced Wall Treatment', 'Standard Wall Functions', 'Scalable Wall Functions') },
  'methods-transient-formulation': { notes: existingNotes('Second Order Implicit', 'Bounded Second Order Implicit') },
  'methods-pseudo-time': {
    notes: {
      Off: '按标准迭代亚松弛一步一进，不引入伪时间推进尺度。',
      ...existingNotes('Global Time Step'),
      'Local Time Step': '依据各网格单元局部大小与流速自适应调整步长，在大小单元极其悬殊、多尺度稳态耦合中大幅加速大流场发展。',
    },
  },
  'partition-method': {
    notes: {
      ...existingNotes('Metis'),
      'Principal Axes': '沿着惯量主轴几何切分，规律扁长管道可直观按流向切开但复杂几何负载未必均衡。',
      'Cartesian Axes / Strips': '沿坐标 X/Y/Z 条带机械切片，常用在测试特定几何方向分解或手动调优特定网格分区实验。',
    },
  },
  'wall-thermal': {
    notes: {
      ...existingNotes('Heat Flux', 'Temperature', 'Convection'),
      Radiation: '按外部辐射环境给定辐射换热边界，输入外部辐射温度和外部发射率。',
      Mixed: '同时指定对流与辐射换热条件，分别输入外部流体温度和辐射温度等参数。',
      Coupled: '在有相邻单元区的双面壁上，将 wall 与 wall-shadow 两侧热耦合，由两侧的解确定壁面温度和热流。',
    },
    sourceUrl: docs + 'flu_ug/flu_ug_boundary_conditions_task_page.html',
  },
  'multiphase-model-select': {
    notes: {
      Off: '关闭连续介质多相模型。相定义和相间作用页签随模型关闭而隐藏。',
      'Volume of Fluid (VOF)': '以各相体积分数描述不互溶流体的界面，各相共享动量方程。选中后可设置体积分数公式和界面处理。',
      Mixture: '求解混合物的动量方程，可开启 Slip Velocity 计算不同相之间的相对运动。',
      Eulerian: '对各相分别求解连续性和动量方程，并用曳力等闭合关系描述相间作用。启用能量方程后可设置相间传热。',
      'Wet Steam': '处理蒸汽膨胀过程中的非平衡凝结，使用湿蒸汽专用的模型设置。',
    },
    sourceUrl: multiphase,
  },
  'multiphase-vof-formulation': {
    notes: {
      Explicit: '只在瞬态可选。显式推进体积分数时可使用更小的子时间步，Courant Number 控制界面附近的子时间步选择。',
      Implicit: '可用于稳态或瞬态。体积分数方程以隐式方式求解，显式分支的 Courant Number 和子时间步选项随之隐藏。',
    },
    sourceUrl: multiphase,
  },
  'multiphase-pair-heat': {
    notes: {
      none: '当前相对不启用这项相间传热关联式。',
      constant: '为当前相对输入固定的传热系数。选中后会出现 Constant Heat Transfer Coefficient 输入框。',
      'two-resistance': '把界面两侧的热阻分别处理。选中后可为当前相对的两侧分别选择传热闭合关系。',
    },
    sourceUrl: eulerian + '#flu_ug_sec_mphase_euler_heatxfr',
  },
  'multiphase-eulerian-regime': {
    notes: {
      Off: '沿用普通 Eulerian 设置。切换后点击 Apply 生效。',
      [aiadRegime]: '在 Eulerian 中区分连续界面与分散流型。点击 Apply 后配置次相处理。主相和次级连续相组成的相对使用 drag-aiad 与 ia-aiad。卷吸需要单独的第三相。',
      [gentopRegime]: '在 Eulerian 中结合非均匀离散群体平衡处理流型转变。点击 Apply 后至少有三相，再在 Phases 为一个次相指定 GENTOP Hybrid Phase Modeling。',
    },
    sourceUrl: eulerian + '#flu_multiphase_AIAD_use',
  },
  'radiation-model-select': {
    notes: {
      Off: '关闭辐射模型，模型专用的角度离散、视角系数或采样页签随之隐藏。',
      P1: '以辐射输运方程的一阶球谐近似描述辐射，求解与辐照度相关的标量方程。',
      Rosseland: '以扩散近似将辐射贡献并入等效热导率，适用于光学厚介质。',
      'Discrete Transfer (DTRM)': '沿离散射线跟踪热辐射的传输。设置时需要核对散射等物理假设。',
      'Discrete Ordinates (DO)': '沿离散方向求解辐射输运方程。选择后可以在 Angular Discretization 设置角度划分。',
      'Surface to Surface (S2S)': '用视角系数描述表面之间的辐射换热，假定中间介质不参与辐射。选择后显示视角系数与聚类设置。',
      'Monte Carlo (MC)': '用随机采样追踪辐射输运。Target Number of Histories 控制采样规模。',
    },
    sourceUrl: docs + 'flu_th/flu_th_sec_rad_intro.html',
  },
  'species-model-select': {
    notes: {
      Off: '关闭组分与燃烧模型。',
      'Species Transport': '求解组分的质量分数输运。根据算例，可只模拟混合，也可启用反应并选择相应的反应模型。',
      'Non-Premixed Combustion': '用于燃料和氧化剂分别进入的燃烧问题，使用混合分数描述混合状态。',
      'Premixed Combustion': '用于燃料和氧化剂在燃烧前已经混合的情况，使用进度变量跟踪燃烧过程。',
      'Partially Premixed Combustion': '联合描述混合状态和燃烧进度，可用于预混程度随位置变化的燃烧问题。',
      'Composition PDF Transport': '通过输运组分状态的概率密度函数描述湍流与化学反应的相互作用。',
    },
    sourceUrl: models,
  },
  'general-2d-space': {
    notes: {
      Planar: '按 Z 向单位深度（默认 1 m）处理二维平面通道问题，适合无限宽平板狭缝或二维横向绕流测试。',
      Axisymmetric: '几何沿 X 轴（y = 0 中心线）旋转一周形成三维圆管或喷管回转体，网格坐标必须全部满足 y ≥ 0。',
      'Axisymmetric Swirl': '在二维轴对称截面求解轴向与径向速度的同时，额外求解环向旋转切向速度分量，用于含旋流喷嘴与旋风分离器。',
    },
  },
  'solver-velocity-formulation': {
    notes: {
      Absolute: '在静止全局惯性系求解速度矢量；适用大多数固定流域与多不同转速混装旋转机械。',
      Relative: '以旋转/运动参考系中的相对速度作为求解变量，适合整个单连通流域围绕单一核心大面积旋转（可改善圆周对流截断误差）。',
    },
  },
  'velocity-inlet-method': {
    notes: {
      'Magnitude, Normal to Boundary': '只输入单一标量速度大小，默认流动垂直入口面朝域内吹入，是管口直吹入流最便捷安全的写法。',
      'Magnitude and Direction': '同时设定速度标量大小与方向矢量分量（例如带倾角倾斜射流），需注意方向分量为方向单位矢量比例。',
      Components: '直接指定全局/柱坐标系下的 X/Y/Z（或径向/切向/轴向）速度分量，方便与实验 PIV 测试点或解析旋转来流逐分量对接。',
    },
  },
  'mass-flow-inlet-method': {
    notes: {
      'Mass Flow Rate': '直接给定穿过当前入口界面的总质量流率（kg/s），适合已知泵/压缩机总量供给且流体可压缩温变工况。',
      'Mass Flux': '按单位面积通量（kg/m²·s）给定，可用于均匀进气渗透孔面或多尺寸边界等通量建模。',
      'Mass Flux with Average Mass Flux': '允许输入平均质量通量配合分布轮廓剖面，保持总质量流率锁定在给定平均水平上。',
    },
  },
  'wall-motion': {
    notes: {
      'Stationary Wall': '常规静止固体壁面；若紧邻旋转区域但实际上是不动外机匣，在绝对速度定义下依然选静止或设为绝对速度 0。',
      'Moving Wall': '边界本身具有切向切变牵引或旋转角速度（如履带传送带、旋转叶轮叶片壁面或静止外壳处于相对速度域时的补偿设置）。',
    },
  },
  'wall-shear-condition': {
    notes: {
      'No Slip': '真实黏性固体壁面的默认物理法则——流体紧贴壁面的一层与壁面相对速度严格为零，形成边界层。',
      'Specified Shear': '指定切应力分量（均设为 0 时等价于无剪切自由滑移 Slip Wall），可用于无边界层理想风洞外壁面简化或对称液面切向自由近似。',
    },
  },
  'methods-gradient': {
    notes: {
      'Least Squares Cell Based': '现代 Fluent 默认梯度重算法：对所有非结构、多面体与 Mosaic Poly-Hexcore 网格均具有最优综合精度和耗时性价比。',
      'Green-Gauss Cell Based': '较早期的基于单元中心插值方法，高偏斜粗糙网格上精度和稳健性略逊于 Least Squares。',
      'Green-Gauss Node Based': '先计算节点值再做面梯度积分，耗费更多计算时间但高度保精度、抑制纯四面体高扭曲网发散效果突出。',
    },
  },
  'surface-integrals-type': {
    notes: {
      'Area-Weighted Average': '按网格面积大小加权平均值（(1/A)∫φdA），适合纯几何表面覆盖温度（如散热芯片表面均温）或静压平均。',
      'Mass-Weighted Average': '按流经截面的质量流率加权平均（∫φρu·dA / ∫ρu·dA），评估流体进出口截面体相真实平均温度与滞止总压（能量流均温）的唯一正确标准！',
      'Facet Average / Minimum / Maximum': '分别直接取表面节点/面元算术均值与极大/极小值（排查局部最高温点 Maximum 是否烧毁电子器件极常用）。',
      Integral: '做空间面面积分 ∫φdA（如求传热热流量或净流量）。',
    },
  },
  'line-rake-type': {
    notes: {
      Line: '连接起点与终点绘制一条连续线段与体网格相交剖切取点，用于绘制连续变化的沿线 XY 曲线。',
      Rake: '按给定点数（Number of Points）沿直线均匀放置离散采样点，能固定输出确定抽样数量的对比测点（例如对比实验测量探针点）。',
    },
  },
  'mesh-scale-spec-method': {
    notes: {
      'Specify Scaling Factors': '直接输入几何缩放倍率（如将毫米网格缩小 0.001 倍还原为米）。',
      'Specify Domain Extents': '根据期望的目标坐标最小/最大包围盒范围自动推算各轴缩放系数。',
      'Convert Units': '按导入力学网格源长度单位直接转换至当前求解器单位。',
    },
  },
  'dynamic-mesh-smoothing-method': {
    notes: {
      'Spring/Laplace/Boundary Layer': '把网格边等价为弹性弹簧并通过节点平滑适应边界小位移，计算轻量。',
      Diffusion: '通过求解扩散偏微分方程把运动位移向远场均匀传递，大幅减少近壁网格扭曲。',
      'Linearly Elastic Solid': '按线弹性体力学方程平滑内部节点位移，较大变形下仍能保持边界层质量但开销较大。',
    },
  },
  'dynamic-mesh-layering-option': {
    notes: {
      'Height Based': '依据指定理想单元高度阈值自动触发扫掠网格层分裂或合并，适合活塞直线推拉行程。',
      'Ratio Based': '依据相邻两层网格高度比值控制动态网格层的新增或消除时机。',
    },
  },
  'mesh-adaptation-method-type': {
    notes: {
      'Hanging Node': '仅细化标记单元并在交界面形成悬挂节点，支持多面体且方便反向粗化还原。',
      Conformal: '全四面体共形加密，不产生悬挂节点，但通常无法反向合并还原网格。',
    },
  },
  'forces-option': {
    notes: {
      Forces: '积分统计指定壁面上的压力合力、黏性阻力与总阻力系数。',
      Moments: '绕指定的 Moment Center 力矩中心积分三维气动/水动力矩向量。',
      'Center of Pressure': '根据表面压力与力矩平衡关系计算压力合力在截面上的压心作用点坐标。',
    },
  },
  'report-definition-category': {
    notes: {
      Force: '定义阻力、升力、力矩与压心等壁面受力监控量。',
      Surface: '定义截面/壁面的面积加权、质量加权均值、热通量或极值监控量。',
      Volume: '定义体域内的体积平均、体积分或峰值物理量监控。',
      Flux: '定义进出边界的净质量流量或总传热功率守恒监控。',
    },
  },
}
