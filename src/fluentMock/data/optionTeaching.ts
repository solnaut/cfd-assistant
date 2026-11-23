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
  'viscous-wall-treatment': {
    notes: {
      'Enhanced Wall Treatment': '结合双层近壁模型与梯度混合壁面函数，实现“y+ 不敏感”过渡：当首层 y+ ≈ 1 时自动全程精细积分黏性底层；当网格较粗 y+ > 30 时平滑衔接对数律。传热与分离算例首选。',
      'Standard Wall Functions': '经典 Launder-Spalding 对数律壁面公式，严格要求首层中心落在 30 < y+ < 300 区间；若网格意外切太密（y+ < 15）会导致壁面摩擦与传热出现显著偏差！',
      'Scalable Wall Functions': '在标准壁面函数基础上施加内部虚拟下限截断 y*_limit ≈ 11.225，避免局部极细网格（如角点加密后 y+ < 11）直接崩溃，可保障中等粗网格的鲁棒性。',
    },
  },
  'viscous-ke-submodel': {
    notes: {
      standard: '1972 经典两方程基线；在充分发展的附着高 Re 管流表现成熟，但在强逆压分离与强烈轴对称圆射流扩展率计算上偏粗糙。',
      rng: '重正化群修正版本，新增高速应变附加项与解析低 Re / 旋流修正，改善弯曲管道、高剪切及旋转弱旋流精度，但极细网格下收敛略慢。',
      realizable: '对涡黏度系数 C_μ 进行应变率敏感动态约束并重写 ε 耗散方程，彻底消除“圆射流-平射流反常”并显著提升强逆压梯度边界层分离与回流预测，是 k-ε 族首选。',
    },
  },
  'viscous-kw-submodel': {
    notes: {
      standard: 'Wilcox 原始 k-ω 模型，近壁直接积至壁面极稳，但在外流区极度依赖入口设定的自由来流湍流比耗散率 ω 数值。',
      bsl: 'Baseline 混合模型：在近壁区保持 k-ω 高精度、到主流外层区通过 F1 混合函数平滑切换到 k-ε 方程，消除了自由来流敏感性缺陷。',
      sst: 'Shear Stress Transport（剪切应力输运，全行业默认推荐）：在 BSL 基础上增加主要剪切应力 Bradshaw 限制器，防止分离点处过度产生假湍流黏度，精确捕捉翼型失速、扩压段剥离与强换热峰。',
      geko: 'Generalized k-omega，以固定稳定基底为骨架提供 6 个物理直观可调参数（CSep, CNW 等），允许标定高精气动/射流实验基准而不破坏默认壁面律。',
    },
  },
  'viscous-les-model': {
    notes: {
      'Smagorinsky-Lilly': '经典简单代数亚格子模型（需调 C_s），但壁面未自动衰减（非近壁零黏度）会人为抹平层流转捩脉动。',
      WALE: '壁面自适应局部涡黏模型：在壁面处自动按 y³ 规律自然渐近为零，能真实还原层流转捩与精细边界层涡结构，全能 LES 默认最优选。',
      WMLES: '壁面模化大涡模拟（Wall-Modeled LES）：对极端高雷诺数外流或超大气动绕流免除沿流/展向百万级微尺度限制，用 RANS 壁面模化近壁内层。',
      'Kinetic-Energy Transport': '额外求解一步亚格子动能 k_sgs 输运方程，在含高旋流强非平衡局部涡分裂场中捕捉能量局部聚集和反传效应。',
    },
  },
  'multiphase-volume-fraction-scheme': {
    notes: {
      'Geo-Reconstruct': '几何重构法（仅 Explicit VOF 可选）：在界面单元内部精确切出分段线性界面（PLIC）几何截面斜率并逐面输送，几乎零人工界面抹平，捕捉锐利波浪与液滴脱落最准。',
      CICSAM: '压缩界面捕获方案（仅 Explicit VOF 可选）：针对高低黏度比悬殊（≥ 100）多相流保持极高界面锋利度并支持常规三角/多面体网稳定推进。',
      Compressive: '无界/有界高阶二阶界面压紧格式：在 Implicit 隐式 VOF 与显式下均可显著消除相界面弥散发虚（比一阶/二阶普通格式清晰得多），是大步长稳态及隐式瞬态主选。',
      'Modified HRIC': '融合高分辨率迎风格式与界面紧缩限制器，允许以较大的局部库朗数稳定推进气液锋利界面。',
      'First Order Upwind': '一阶迎风：极其稳定绝不震荡但会使尖锐界面迅速扩散成大片过渡灰区；仅在初算热身前几十步稳住发散场使用，正式评估切回 Compressive/Geo-Reconstruct。',
    },
  },
  'multiphase-pair-drag': {
    notes: {
      'schiller-naumann': '刚性光滑球体标准通用曳力关联式，适合低体积分数、不变形硬球微粒及未剧烈拉伸变形的小气泡（d < 1–2 mm）。',
      'morsi-alexander': '基于实验阻力曲线分区拟合，涵盖全雷诺数范围的刚性球体精准关联。',
      tomiyama: '专为变形上升气液气泡设计，计及表面张力与 Eo 数（Eötvös Number）引起气泡扁平化后的阻塞曳力增加，还可区分散步污染液态（Pure vs Contaminated）。',
      'ishii-zuber': '工业气泡塔/稠密液滴群专用稠密群集曳力关联，考虑空泡含率密集引起的颗粒集群曳力衰减修正。',
      'wen-yu': '稀相/中等孔隙率气固流化床经典关联（颗粒相分率 < 0.2 附近精准）。',
      gidaspow: '自动在稀相（Wen-Yu）与密相高固含率（Ergun 固定床压降）间无缝拼接转换，鼓泡与循环流化床模拟黄金标配模型。',
      'syamlal-obrien': '直接依据终端沉降速度与流化床最低流化速度关联标定曳力系数，适合实验测得流化速度的密相床。',
    },
  },
  'multiphase-pb-method': {
    notes: {
      Off: '不追踪粒径连续演变分布，次相保留单一直径或局部简单尺度。',
      Discrete: '将粒径连续谱切分为 N 档离散体积级（Bins，如 10–15 档）单独追踪聚集与破碎，物理保真高且易观测尺度直方分布。',
      'Inhomogeneous Discrete': '当不同大小档位的气泡/液滴在流场中以明显不同的上升速度分层（GENTOP 核心依赖）时，为各分组分配独立速度场以捕捉小泡下拽和大泡上浮分选。',
      'Standard Moment': '仅输运粒径分布的前几个低阶统计矩（M0 数量密度至 M3 体积分数），计算极省内存但难以逆向还原复杂多峰尺度谱。',
      DQMOM: '直接正交矩近似法：以特征权重与节点尺寸直接输运少数几个有效分布峰位，可为不同尺度群赋予多速度场且比全离散级少解海量相分数方程。',
    },
  },
  'acoustics-model-select': {
    notes: {
      Off: '不计算远场或域内声波辐射响应。',
      'Ffowcs-Williams & Hawkings': '混合气动声学首选（FW-H）：先用高精度瞬态 LES/DES 算出近场强涡核脉动并记录封闭积分面表面压力时间历程，再用积分解直接算任意公里外远场接收点声压时间序列及 FFT 频谱。',
      'Wave Equation': '直接在网格计算域内部与瞬态流场联立求解空间声波传播（需瞬态且采用二阶隐式时间步与精细声学网格每波长 ≥ 10 网格）。',
      'Broadband Noise Sources': '仅靠定常 RANS 计算出的湍动能 k 与耗散率 ε（Proudman/Curle/Lilley 理论）一眼定量排查机身/进气道哪里是强宽频噪声发源 hotspots，速度极快但不输出某点频谱分贝曲线。',
    },
  },
  'battery-solution-method': {
    notes: {
      MSMD: '多尺度多域方法（推荐）：分别建立电化学极片空间尺度和电芯集流体三维欧姆电位/发热尺度的物理耦合，支持切换 NTGK、ECM 等效电路或精细 Newman P2D 子模型。',
      'CHT Coupling': '仅按已知外部表征发热量或一维产热曲线给电池块加发热体源并做三维流体共轭冷却换热计算（跳过内部复杂极化电位方程）。',
      'Circuit Network': '在电池包成组模组中将串联/并联铜巴排集流体等构成完整电阻网络求解电流分配、焦耳热与单体压降不均。',
    },
  },
  'dpm-inj-evap': {
    notes: {
      Inert: '惰性固体粒子或无相变球体（仅有热交换与曳力运动）。',
      Droplet: '纯组分蒸发/沸腾液滴（考虑蒸发潜热与气相蒸汽组分释放；达到沸点转为沸腾传质控制）。',
      Combusting: '煤粉或焦炭等固体可燃颗粒：先后经历水蒸发、热解挥发分脱出（Devolatilization）与表面碳灰异相氧化燃烧。',
      Multicomponent: '含多种互溶液相馏分（如汽油+乙醇/多烷烃混合物）按挥发度依次蒸馏释放；选择它会在 Injection 自动激活 [Components] 选项卡设置各组份质量比例。',
    },
  },
  'dpm-inj-breakup-model': {
    notes: {
      TAB: 'Taylor Analogy Breakup（弹性弹簧振荡类比）：以液滴受风力扭曲拉伸至临界振幅撕裂判据，适合低韦伯数（We < 100）较温和雾化液滴分裂。',
      'Wave (KH-RT)': 'Kelvin-Helmholtz 表面波增长剥离配合 Rayleigh-Taylor 加速失稳破碎模型，广泛覆盖高压柴油/航空煤油高速雾化射流（We > 100）。',
      SSD: 'Stochastic Secondary Droplet 随机二次破碎模型：把子液滴尺寸抽样按临界时间与局部湍流涡尺度做福克-普朗克尺寸谱演化。',
    },
  },
  'dynamic-mesh-zone-type': {
    notes: {
      Stationary: '网格在当前时间推进期间保持原地完全固定不变（用于贴紧活塞做六面体铺层的静壁面筒体侧边）。',
      'Rigid Body': '整片边界或体区域全部作为不变形刚体按设定的平动/转动曲线或 Six DOF 流体载荷同步运动（激活 [Motion Attributes] 选项卡）。',
      Deforming: '面或体内网格会随周边动边界被局部压扁拉长变形甚至局部重构，需在 [Geometry Definition] 选项卡绑定平滑外包几何形状防止表面网格扭曲越位。',
      'User-Defined': '完全交由用户编写的 `DEFINE_GRID_MOTION` UDF 逐节点精确指令坐标运动（如周期扑翼弹性拍动）。',
      'System Coupling': '边界节点实时接收来自 Ansys Mechanical 等结构有限元求解器传来的双向 FSI 流固形变位移。',
    },
  },
  'material-cp-method': {
    notes: {
      constant: '假定流体比热容不随温度改变；常温低速液体/空气传热可采用以加速收敛。',
      'piecewise-linear': '通过实验测量表格录入各关键温度段的比热数据点并进行分段线性插值。',
      polynomial: '用光滑多项式函数拟合宽温度区间气体/熔盐的定压比热随绝对温度 T 的演变。',
      'piecewise-polynomial': '高温燃烧/CHEMKIN 燃气标准格式：按低/高两个衔接温区分别设置 7 系数 NASA 多项式（点击激活 [Edit NASA Polynomial…] 子框），保证高温化学反应焓变绝对准确。',
    },
  },
  'material-k-method': {
    notes: {
      constant: '常规材料使用常数导热系数。',
      'piecewise-linear': '输入多组温度–导热系数（W/m·K）分段点位拟合如硅胶、合金随温度剧烈改变导热率的材料。',
      polynomial: '为高热梯度介质设置连续光滑的温度导热多项式，避免温度大跨度计算导热突跳引起收敛困难。',
    },
  },
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
