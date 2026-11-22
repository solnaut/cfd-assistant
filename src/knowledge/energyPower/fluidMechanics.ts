import type { EnergyTopic } from '../../models/energyKnowledge'

export const fluidMechanicsTopics: EnergyTopic[] = [
  {
    id: 'fm-properties-statics',
    courseId: 'fluid-mechanics',
    chapter: '第 1 章 · 基础与静力学',
    moduleGroup: '模块一 · 基础理论与三大守恒',
    title: '流体物性、牛顿内摩擦定律与静力学基础',
    englishTitle: 'Fluid Properties, Viscosity & Hydrostatics',
    difficulty: '基础',
    summary:
      '流体在任何微小剪应力作用下都会发生连续变形。掌握密度、动力黏度与运动黏度的物理本质，以及静止流体中压强随深度的线性分布规律，是理解后续粘性流动与浮力问题的前提。',
    prerequisites: [],
    relatedTopicIds: ['fm-continuity-bernoulli', 'td-basic-concepts', 'ht-convection-similarity'],
    keyPoints: [
      '连续介质假设允许将流体物性视为空间与时间的连续可微函数，绝大多数工业内流（Knudsen 数 Kn << 0.01）均满足该假设。',
      '牛顿内摩擦定律表明粘性切应力与速度梯度成正比，比例系数即为动力黏度 μ；气体黏度随温度升高而增大，液体黏度则随温度升高而下降。',
      '流体静力学基本方程揭示：同一连续静止等密度重力流体中，等压面即水平面，测量压差本质上可由液柱高度直观换算。',
      '绝对压强、表压（Gauge Pressure）与真空度之间仅差一个当地大气压基准，CFD 边界输入前必须先核对 Operating Pressure 基准。',
    ],
    formulas: [
      {
        title: '牛顿内摩擦定律',
        latex: '\\tau = \\mu \\frac{\\mathrm{d}u}{\\mathrm{d}y}',
        meaning: '平板剪切流中流层间单位面积上的粘性切应力等于动力黏度与法向速度梯度的乘积。',
        symbols: [
          { symbol: 'τ', meaning: '切应力 (Shear Stress)', unit: 'Pa (N/m²)' },
          { symbol: 'μ', meaning: '动力黏度 (Dynamic Viscosity)', unit: 'Pa·s' },
          { symbol: 'du/dy', meaning: '剪切应变率（速度梯度）', unit: 's⁻¹' },
        ],
        conditions: '适用于牛顿流体（空气、水、常规矿物油等）的一维层流平行流动。',
      },
      {
        title: '流体静力学基本方程',
        latex: 'p = p_0 + \\rho g h',
        meaning: '静止不可压缩流体中深度 h 处的绝对压强等于液面压强 p0 与液柱静压水头之和。',
        symbols: [
          { symbol: 'p', meaning: '深度 h 处压强', unit: 'Pa' },
          { symbol: 'p_0', meaning: '自由液面压强', unit: 'Pa' },
          { symbol: 'ρ', meaning: '流体密度', unit: 'kg/m³' },
          { symbol: 'h', meaning: '垂直浸没深度', unit: 'm' },
        ],
        conditions: '静止流体、密度常数 ρ = const、仅受重力场作用。',
      },
    ],
    comparisonTable: {
      caption: '常见流体分类与粘性特征速查',
      headers: ['流体类别', '本构关系特点', '典型工程介质', '温敏规律'],
      rows: [
        ['牛顿流体', '切应力与剪切速率呈线性过原点关系', '水、空气、制冷剂气体', '气体 μ 随 T↑ 而↑；液体 μ 随 T↑ 而↓'],
        ['假塑性流体 (Shear-thinning)', '表观黏度随剪切速率增大而下降', '高分子溶液、部分油漆、血液', '需采用幂律或 Carreau 模型'],
        ['胀塑性流体 (Shear-thickening)', '表观黏度随剪切速率增大而上升', '高浓度淀粉悬浮液、浆料', '高剪切区阻力剧增'],
        ['理想无粘流体 (Inviscid)', '假设 μ = 0，不存在切应力与边界层', '势流理论、外流极初步预估', '仅适用于远离壁面的主流无旋区'],
      ],
    },
    workedExample: {
      title: '例题：平板滑块油膜粘性剪切阻力估算',
      scenario: '面积 A = 0.4 m² 的平板以恒定速度 U = 2.5 m/s 沿静止底板水平滑行，中间充满厚度 δ = 0.5 mm、动力黏度 μ = 0.08 Pa·s 的润滑油（间隙极窄呈线性速度分布）。求所需驱动拉力 F。',
      given: ['A = 0.4 m²', 'U = 2.5 m/s', 'δ = 0.5 mm = 5×10⁻⁴ m', 'μ = 0.08 Pa·s'],
      steps: [
        '窄间隙稳态 Couette 剪切流速呈线性分布，速度梯度 du/dy = U / δ = 2.5 / 0.0005 = 5000 s⁻¹。',
        '由牛顿内摩擦定律计算切应力：τ = μ (du/dy) = 0.08 × 5000 = 400 Pa。',
        '平板下表面所受总粘性摩擦阻力：F = τ · A = 400 × 0.4 = 160 N。',
      ],
      answer: 'F = 160 N（切应力 τ = 400 Pa）',
      takeaway: '轴承、活塞环等微小油膜间隙虽然厚度不到 1 mm，但极高速度梯度会产生不可忽视的粘性阻力和剪切生热。',
    },
    engineeringTips: [
      '不要混淆动力黏度 μ（Pa·s）与运动黏度 ν = μ/ρ（m²/s），雷诺数计算与壁面剪切力分别用到二者，单位换算出错是最常见初学失误。',
      '在 Fluent 中设置重力场（Gravity Enabled）并模拟液体自然对流或气液界面时，Operating Density 建议设较轻相（空气）密度，避免静水压强精度损失。',
    ],
    cfdConnections: [
      {
        label: 'Operating Conditions 参考压强与重力设置',
        to: '/fluent-guide?locate=general-gravity',
        note: '查看 Fluent General 面板重力与表压基准关联',
      },
    ],
    quiz: {
      id: 'quiz-fm-statics-1',
      question: '当温度从 20 °C 升高到 80 °C 时，常压下水与空气的动力黏度变化趋势分别是？',
      options: [
        '水增大，空气减小',
        '水减小，空气增大',
        '两者均随温度升高而增大',
        '两者均随温度升高而减小',
      ],
      correctIndex: 1,
      explanation:
        '液体内摩擦主要由分子间内聚力主导，升温削弱内聚力使水黏度下降；气体内摩擦源于分子热运动动量交换，升温加剧动量交换使空气黏度上升。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-statics-2',
        question: '某水箱水深 5 m（ρ = 1000 kg/m³，g = 9.81 m/s²），水面上方与当地大气（p_atm = 101.3 kPa）相通，则水底绝对压强与表压分别是？',
        options: [
          '绝对压强 49.05 kPa，表压 150.35 kPa',
          '绝对压强 150.35 kPa，表压 49.05 kPa',
          '绝对压强 101.3 kPa，表压 49.05 kPa',
          '绝对压强 150.35 kPa，表压 101.3 kPa',
        ],
        correctIndex: 1,
        explanation:
          '液柱静水表压 ρgh = 1000 × 9.81 × 5 = 49.05 kPa；绝对压强等于当地大气压加上表压 = 101.3 + 49.05 = 150.35 kPa。',
      },
    ],
    keywords: ['牛顿内摩擦', '黏度', '静水压强', '表压', '连续介质', 'viscosity', 'statics'],
  },
  {
    id: 'fm-continuity-bernoulli',
    courseId: 'fluid-mechanics',
    chapter: '第 2 章 · 运动学与能量方程',
    moduleGroup: '模块一 · 基础理论与三大守恒',
    title: '连续性方程与伯努利能量方程',
    englishTitle: 'Continuity & Bernoulli Energy Equations',
    difficulty: '基础',
    summary:
      '连续性方程体现质量守恒，伯努利方程则是机械能守恒沿流线的优雅表达。二者的结合能迅速估算缩扩管、文丘里管、皮托管与孔板中的流速及静压变化。',
    prerequisites: ['fm-properties-statics'],
    relatedTopicIds: ['fm-navier-stokes', 'td-first-law', 'fm-turbomachinery-cavitation'],
    keyPoints: [
      '对于定常不可压缩管内流动，任一横截面的体积流量 Q = v·A 保持常数：截面面积越小，平均流速越高。',
      '理想流体伯努利方程表明沿同一流线（或无旋定常流），静压能、重力势能与动能之和沿程守恒，动压随速度平方增长。',
      '将压力能、动能、势能全部除以 ρg 后，对应压头单位为米（m）：位置水头 z、压强水头 p/(ρg) 与速度水头 v²/(2g)。',
      '实际工程管路必须引入机械能水头损失项 h_f 构成实际伯努利方程，存在泵或风机做功时还需叠加外加扬程 H_p。',
    ],
    diagram: {
      kind: 'fluid-bernoulli-pipe',
      caption: '变截面管流中总水头线 (EGL)、测压管水头线 (HGL) 与伯努利能量转化',
      note: '喉部截面缩窄时流速升高（动能水头增大），导致静压压强水头明显降低；实际有粘流动总水头线沿程单调微降。',
    },
    formulas: [
      {
        title: '一维定常不可压缩连续性方程',
        latex: '\\rho_1 v_1 A_1 = \\rho_2 v_2 A_2 \\implies v_1 A_1 = v_2 A_2',
        meaning: '在没有支管汇入或流出的单一流道中，各截面质量流量相等；密度恒定时体积流量相等。',
        symbols: [
          { symbol: 'A_1, A_2', meaning: '截面有效过流面积', unit: 'm²' },
          { symbol: 'v_1, v_2', meaning: '截面平均流速', unit: 'm/s' },
        ],
        conditions: '定常流动，不可压缩近似（Ma < 0.3 或液体）。',
      },
      {
        title: '实际工程粘性伯努利方程',
        latex: 'p_1 + \\rho g z_1 + \\frac{1}{2}\\rho v_1^2 + \\Delta p_{\\text{pump}} = p_2 + \\rho g z_2 + \\frac{1}{2}\\rho v_2^2 + \\Delta p_{\\text{loss}}',
        meaning: '描述两个截面之间静压、重力势能、动压与外加机械功及不可逆流动损失的总压平衡。',
        symbols: [
          { symbol: 'p', meaning: '断面静压 (Static Pressure)', unit: 'Pa' },
          { symbol: '\\frac{1}{2}\\rho v^2', meaning: '动压 (Dynamic Pressure)', unit: 'Pa' },
          { symbol: '\\Delta p_{\\text{loss}}', meaning: '沿程与局部阻力总压损', unit: 'Pa' },
        ],
        conditions: '定常不可压缩流动，断面水流呈缓变流且压强按静水分布。',
      },
    ],
    workedExample: {
      title: '例题：水平渐缩管静压跌落计算',
      scenario: '水平圆管中流动的常压水（ρ = 1000 kg/m³）从直径 d₁ = 100 mm、平均流速 v₁ = 1.5 m/s 的截面 1 收缩到直径 d₂ = 50 mm 的喉部截面 2。已知截面 1 静压 p₁ = 120 kPa，忽略收缩局部损，求喉部流速 v₂ 及静压 p₂。',
      given: ['z₁ = z₂', 'd₁ = 0.10 m, v₁ = 1.5 m/s', 'd₂ = 0.05 m', 'p₁ = 120 kPa, Δp_loss ≈ 0'],
      steps: [
        '由连续性方程 v₁ A₁ = v₂ A₂ 及圆管面积比 A₁/A₂ = (d₁/d₂)² = (100/50)² = 4，得 v₂ = 4 × 1.5 = 6.0 m/s。',
        '列出水平伯努利方程：p₁ + ½ρv₁² = p₂ + ½ρv₂²。',
        '计算动压差：Δp_dyn = ½ × 1000 × (6.0² - 1.5²) = 500 × (36 - 2.25) = 16,875 Pa ≈ 16.88 kPa。',
        '因此 p₂ = 120 - 16.88 = 103.12 kPa。',
      ],
      answer: 'v₂ = 6.0 m/s，喉部静压 p₂ ≈ 103.12 kPa',
      takeaway: '管径减半令速度变为 4 倍，而动压与速度平方成正比直接猛增 16 倍！喉部静压若跌破液体饱和蒸气压就会诱发汽蚀。',
    },
    engineeringTips: [
      '不要在存在剧烈分离漩涡、激波压缩或跨泵叶片内部直接套用理想伯努利方程（总压会在粘性耗散与激波处下降，在叶轮内部因做功而升高）。',
      '用伯努利原理解读 Fluent Contours 时，“总压 Total Pressure”在无热无外功绝热稳态流中的下降量直接定量反映了局部涡损大小。',
    ],
    cfdConnections: [
      {
        label: '管内平均流速计算器',
        to: '/calculators/flow-piping/mean-velocity',
        note: '由体积流量与管道截面积直接求算平均速度 v',
      },
      {
        label: '体积流量与质量流量换算',
        to: '/calculators/flow-piping/mass-flow-rate',
        note: '用于 Fluent Mass-Flow Inlet 边界输入换算',
      },
    ],
    quiz: {
      id: 'quiz-fm-bernoulli-1',
      question: '水平放置的圆管某段直径突然收缩为原来的一半（不可压缩定常理想流动），则收缩段与粗管段相比，平均流速和静压分别如何变化？',
      options: [
        '流速变为 2 倍，静压升高',
        '流速变为 4 倍，静压降低',
        '流速变为 4 倍，静压升高',
        '流速变为 2 倍，静压降低',
      ],
      correctIndex: 1,
      explanation:
        '圆管面积 A ∝ d²，直径减半后面积变为原来的 1/4；由连续性方程 v1·A1 = v2·A2 可知流速增大到 4 倍。由伯努利方程，动压激增必然伴随静压显著下降。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-bernoulli-2',
        question: '在不可压缩绝热定常无机械外功输入的真实粘性管流中，沿流动方向“测压管总水头线 (EGL)”的趋势必然是？',
        options: [
          '水平保持不变',
          '管缩处上升、管扩处下降',
          '始终沿程单调降低',
          '取决于流速快慢，可能无故升高',
        ],
        correctIndex: 2,
        explanation:
          '由于真实流体存在粘性摩擦与漩涡耗散，机械能不断不可逆转为热能，因此无外功输入时总水头线 EGL 沿程严格单调下降（仅测压管静压水头线 HGL 可在扩压段部分回升）。',
      },
    ],
    keywords: ['连续性方程', '伯努利方程', '动压', '静压', '总压', '文丘里', 'bernoulli'],
  },
  {
    id: 'fm-navier-stokes',
    courseId: 'fluid-mechanics',
    chapter: '第 3 章 · 流体动力学微分方程',
    moduleGroup: '模块一 · 基础理论与三大守恒',
    title: '控制体动量与 Navier-Stokes 方程组',
    englishTitle: 'Control Volume Momentum & Navier-Stokes Equations',
    difficulty: '进阶',
    summary:
      '现代 CFD 求解器的数学基石是建立在微元控制体上的质量、动量与能量三大守恒微分方程组。看清 N-S 方程每一项的物理含义，有助于理解时间步长、对流离散格式与湍流模型设置。',
    prerequisites: ['fm-properties-statics', 'fm-continuity-bernoulli'],
    relatedTopicIds: ['fm-laminar-turbulent', 'fm-boundary-layer', 'ht-conduction-pde-bc'],
    keyPoints: [
      '动量方程本质上是牛顿第二定律 F = ma 在运动流体控制体上的表达：速度变化率来自局部时间导数与对流输运两项。',
      '对流项 (u·∇)u 具有强烈的非线性特征，是湍流产生与流体混合的根源，也是数值计算需要二阶迎风格式保证精度的核心区域。',
      '方程右端的压力梯度 -∇p 推动流动由高压向低压加速，在不可压缩压力基求解器中需要借助 SIMPLE 或 Coupled 算法联立连续性方程求解压力场。',
      '粘性扩散项 μ∇²u 负责抹平速度尖峰并产生不可逆机械能耗散；体积力 ρg 包含重力和浮力（常配合 Boussinesq 近似处理自然对流）。',
    ],
    diagram: {
      kind: 'fluid-ns-control-volume',
      caption: '三维流体微元控制体受力平衡：法向压差、切向粘性力与重力体积力',
      note: 'CFD 有限体积法 (FVM) 在每个网格单元控制体上对通量做面积分，保证全局质量与动量严格守恒。',
    },
    formulas: [
      {
        title: '不可压缩牛顿流体 Navier-Stokes 动量方程（矢量形式）',
        latex: '\\rho \\left( \\frac{\\partial \\mathbf{u}}{\\partial t} + (\\mathbf{u} \\cdot \\nabla)\\mathbf{u} \\right) = -\\nabla p + \\mu \\nabla^2 \\mathbf{u} + \\rho \\mathbf{g}',
        meaning: '左端分别为局部加速度项与对流加速度项；右端分别为压差梯度力、粘性扩散力与单位体积重力。',
        symbols: [
          { symbol: '\\mathbf{u}', meaning: '速度矢量 (u, v, w)', unit: 'm/s' },
          { symbol: '\\partial\\mathbf{u}/\\partial t', meaning: '局部非稳态加速率', unit: 'm/s²' },
          { symbol: '(\\mathbf{u}\\cdot\\nabla)\\mathbf{u}', meaning: '非线性对流迁移项', unit: 'm/s²' },
          { symbol: '\\mu\\nabla^2\\mathbf{u}', meaning: '粘性动量扩散项', unit: 'N/m³' },
        ],
        conditions: '常物性不可压缩牛顿流体（ρ = const, μ = const）。',
      },
      {
        title: '不可压缩流体连续性微分方程',
        latex: '\\nabla \\cdot \\mathbf{u} = \\frac{\\partial u}{\\partial x} + \\frac{\\partial v}{\\partial y} + \\frac{\\partial w}{\\partial z} = 0',
        meaning: '速度场的散度处处为零，代表流入与流出任一无穷小微元体的体积通量完全平衡。',
        conditions: '不可压缩流动。',
      },
    ],
    workedExample: {
      title: '例题：宏观控制体动量定理求 90° 水平弯管水射流冲击力',
      scenario: '流量 Q = 0.02 m³/s 的水平水射流经 90° 弯管（由 +x 转向 +y），进出口直径均相同且流速均为 4 m/s。若忽略弯管内壁静压差与管重（大气环境自由出流压差为零参考），估算水流作用在弯管上的合力大小。',
      given: ['ρ = 1000 kg/m³', 'Q = 0.02 m³/s ⇒ m_dot = 20 kg/s', 'v_in = (4, 0) m/s', 'v_out = (0, 4) m/s'],
      steps: [
        '控制体动量定律：∑F_fluid = m_dot (v_out - v_in)。',
        'x 方向弯管对水施力：Fx = m_dot (0 - 4) = -80 N；y 方向：Fy = m_dot (4 - 0) = +80 N。',
        '反作用力（水对弯管的冲击力）在 x 向 +80 N、y 向 -80 N，合力大小 F = √(80² + 80²) = 113.1 N。',
      ],
      answer: 'F ≈ 113.1 N（偏向弯管外凸角平分线方向）',
      takeaway: '设计高压弯管支座、消防水枪推力或风机喷口受力时，无需深入求解管内复杂三维涡系，用控制体动量平衡即可得出精确外载荷。',
    },
    engineeringTips: [
      '直接数值模拟 (DNS) 虽不加任何近似求解原始 N-S 方程，但网格量与 Re⁹/⁴ 成正比无法用于工业常规设计；工程 CFD 普遍对 N-S 方程做雷诺平均得到 RANS 方程，再引入 k-ε 或 SST k-ω 模型封闭雷诺应力项。',
      '当在 Solution Methods 中把 Momentum 离散格式从 First Order Upwind 改为 Second Order Upwind 时，实质上是在降低对流项 (u·∇)u 的假扩散误差。',
    ],
    cfdConnections: [
      {
        label: 'Fluent 求解器类型与 RANS 湍流设置',
        to: '/fluent-guide?locate=general-solver-type',
        note: '对比 Pressure-Based 与 Density-Based 对控制方程的离散差异',
      },
    ],
    quiz: {
      id: 'quiz-fm-ns-1',
      question: '在 Navier-Stokes 方程左端，导致流体动力学呈现非线性复杂特征（并最终诱发湍流转捩与多尺度涡结构）的关键项是？',
      options: [
        '局部非稳态项 ∂u/∂t',
        '对流迁移项 (u·∇)u',
        '压力梯度项 -∇p',
        '粘性扩散项 μ∇²u',
      ],
      correctIndex: 1,
      explanation:
        '对流项 (u·∇)u 包含速度自身与速度梯度的乘积，是二次非线性项；当惯性对流远大于粘性扩散（即高 Re）时，微小扰动被非线性放大并失稳演化为湍流。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-ns-2',
        question: '在不可压缩 CFD 求解器中，为什么不能像密度基那样直接用状态方程从密度算出压力，而需要 SIMPLE 或 Coupled 算法？',
        options: [
          '因为不可压缩流体不存在压力波速',
          '因为不可压缩连续性方程 ∇·u = 0 中没有明确出现压力变量 p，必须构造压力修正泊松方程把速度场逼近无散度',
          '因为水泵叶轮不能做功',
          '因为黏度随压强剧增',
        ],
        correctIndex: 1,
        explanation:
          '密度为常数时连续性方程只是一道速度场运动学约束，需要通过动量方程与连续性联立导出压力修正方程（SIMPLE/Coupled 核心思想）来间接地保证质量守恒。',
      },
    ],
    keywords: ['Navier-Stokes', 'N-S方程', '控制体', '对流项', '粘性扩散', 'RANS', '动量方程'],
  },
  {
    id: 'fm-laminar-turbulent',
    courseId: 'fluid-mechanics',
    chapter: '第 4 章 · 管内流动与阻力计算',
    moduleGroup: '模块二 · 管路阻力、边界层与高速流',
    title: '雷诺数、层流湍流与管路沿程阻力',
    englishTitle: 'Reynolds Number, Flow Regimes & Pipe Friction Loss',
    difficulty: '基础',
    summary:
      '雷诺数量化了流体惯性力与粘性力的比值，是判断流态及选择层流还是湍流求解模型的第一尺度；达西-魏斯巴赫公式与水力直径则定量决定了管道压降与泵风机选型功率。',
    prerequisites: ['fm-continuity-bernoulli'],
    relatedTopicIds: ['fm-boundary-layer', 'fm-dimensional-similarity', 'ht-convection-similarity'],
    keyPoints: [
      '雷诺数 Re = ρvDh/μ：一般圆管流 Re < 2300 呈光滑稳定的层流；2300 ~ 4000 为不稳定过渡区；Re > 4000 进入充分发展湍流。',
      '非圆截面风道与换热器窄缝通道使用水力直径 Dh = 4A/P 代替圆管直径计算雷诺数和沿程阻力。',
      '层流沿程摩擦系数仅取决于雷诺数（圆管充分发展层流 f = 64/Re）；充分粗糙区湍流摩擦系数主要取决于壁面相对粗糙度 ε/Dh。',
      '管路系统总压力损失包含直管段沿程摩阻与弯头、三通、阀门产生的局部涡流压损（与速度平方及局部阻力系数 K 有关）。',
    ],
    formulas: [
      {
        title: '雷诺数与水力直径定义',
        latex: '\\mathrm{Re} = \\frac{\\rho v D_h}{\\mu}, \\qquad D_h = \\frac{4 A}{P_w}',
        meaning: '雷诺数为惯性力与粘性力之比；水力直径等于过流断面积的 4 倍除以湿周。',
        symbols: [
          { symbol: 'D_h', meaning: '水力直径（圆管即内径 D）', unit: 'm' },
          { symbol: 'A', meaning: '过流横截面积', unit: 'm²' },
          { symbol: 'P_w', meaning: '润湿周长（流体接触固体壁面的周长）', unit: 'm' },
        ],
        conditions: '适用于牛顿流体；长宽比极大的扁平矩形风道需注意水力直径近似误差。',
      },
      {
        title: '达西-魏斯巴赫（Darcy-Weisbach）沿程压降公式',
        latex: '\\Delta p_f = f \\frac{L}{D_h} \\frac{\\rho v^2}{2}',
        meaning: '管路沿程摩擦造成的静压下降正比于管道长径比、流体动压及达西摩擦系数 f。',
        symbols: [
          { symbol: 'f', meaning: '达西摩擦系数（注意勿与范宁摩擦系数 cf 混淆，f = 4cf）', unit: '无量纲' },
          { symbol: 'L', meaning: '直管长度', unit: 'm' },
        ],
        conditions: '充分发展不可压缩管内定常流动。',
      },
    ],
    comparisonTable: {
      caption: '圆管内层流与湍流核心工程特性对比',
      headers: ['对比维度', '充分发展层流 (Re < 2300)', '充分发展湍流 (Re > 4000)'],
      rows: [
        ['速度剖面形态', '标准抛物线，中心最大速度 vmax = 2 v_avg', '更扁平钝头剖面（对数律/1/7次方律），近壁梯度极大'],
        ['摩擦系数 f 关系', '理论精确解 f = 64 / Re，与粗糙度基本无关', '同时依赖 Re 与壁面相对粗糙度 ε/D（Moody 图 / Colebrook 方程）'],
        ['横截面动量与热量混合', '仅靠分子热扩散，传热较弱', '大尺度与小尺度涡强烈掺混，阻力与对流换热同步猛增'],
        ['CFD 模型选用', '在 Viscous Dialog 中勾选 Laminar', '优先采用 SST k-ω 或 Realizable k-ε + 合理边界层加密'],
      ],
    },
    workedExample: {
      title: '例题：机油层流冷却管路沿程压降校核',
      scenario: '20 °C 某液压油（ρ = 880 kg/m³，ν = 4×10⁻⁵ m²/s）在长 L = 12 m、内径 D = 20 mm 水平光滑圆管中以平均流速 v = 1.6 m/s 流过。判别流态并估算沿程压降。',
      given: ['ρ = 880 kg/m³', 'ν = 4×10⁻⁵ m²/s', 'D = 0.02 m, L = 12 m', 'v = 1.6 m/s'],
      steps: [
        '计算雷诺数：Re = vD/ν = (1.6 × 0.02) / (4×10⁻⁵) = 800 < 2300 ⇒ 明确属于充分发展层流。',
        '层流圆管达西摩擦系数：f = 64 / Re = 64 / 800 = 0.08。',
        '代入达西-魏斯巴赫公式：Δpf = 0.08 × (12 / 0.02) × (0.5 × 880 × 1.6²) = 0.08 × 600 × 1126.4 ≈ 54,067 Pa ≈ 54.1 kPa。',
      ],
      answer: 'Re = 800（层流），沿程压降 Δp_f ≈ 54.1 kPa',
      takeaway: '高粘度油路即使流速不高也极易落入层流区，切勿盲目在 Fluent 中开启湍流模型，否则将高估阻力。',
    },
    engineeringTips: [
      '特别区分“达西摩擦系数 f”和“范宁摩擦系数 cf”：化工/CFD文献常用 cf = τw/(0.5ρv²)，此时圆管层流 cf = 16/Re，比机械/暖通工程常用的达西系数 f = 64/Re 小 4 倍！',
      '出口段或测量段管长如果太短，Fluent 设置 Fully Developed 出口假设前应确认入口段发展长度是否充分（湍流约 10–30D，层流可达 0.05·Re·D）。',
    ],
    cfdConnections: [
      {
        label: 'Reynolds 数计算器',
        to: '/calculators/dimensionless-numbers/reynolds-number',
        note: '快速判定当前算例属于层流还是湍流',
      },
      {
        label: '水力直径计算器',
        to: '/calculators/flow-piping/hydraulic-diameter',
        note: '矩形/环形通道水力直径快速求解',
      },
      {
        label: '管道压降计算器',
        to: '/calculators/flow-piping/pipe-pressure-drop',
        note: '一键估算直管沿程压降并校核 CFD 压差结果',
      },
    ],
    quiz: {
      id: 'quiz-fm-reynolds-1',
      question: '边长为 a = 0.2 m、b = 0.4 m 的满流矩形风道，其水力直径 Dh 是多少？',
      options: ['0.20 m', '0.267 m', '0.30 m', '0.60 m'],
      correctIndex: 1,
      explanation:
        '横截面积 A = 0.2 × 0.4 = 0.08 m²，湿周 Pw = 2 × (0.2 + 0.4) = 1.2 m，所以 Dh = 4A / Pw = 4 × 0.08 / 1.2 = 0.2667 m（约 0.267 m）。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-reynolds-2',
        question: '圆管水冷流处于“水力充分粗糙湍流区”（高 Re 且 ε/D 显著）时，若仅将流速加倍而其他不变，沿程压降 Δpf 大约变为原来的多少倍？',
        options: ['1 倍', '2 倍', '4 倍', '8 倍'],
        correctIndex: 2,
        explanation:
          '完全粗糙湍流区中摩擦系数 f 基本只取决于相对粗糙度 ε/D 与流速几乎无关；由达西公式 Δpf ∝ f·v² 可知，流速翻倍会使压降暴涨至 4 倍（泵送轴功率 Δp·Q 则暴涨至 8 倍！）。',
      },
    ],
    keywords: ['雷诺数', '层流', '湍流', '水力直径', '沿程阻力', '达西公式', 'Moody', 'reynolds'],
  },
  {
    id: 'fm-boundary-layer',
    courseId: 'fluid-mechanics',
    chapter: '第 5 章 · 边界层与近壁面模型',
    moduleGroup: '模块二 · 管路阻力、边界层与高速流',
    title: '边界层理论、流动分离与近壁无量纲距离 y+',
    englishTitle: 'Boundary Layer Theory, Flow Separation & y+',
    difficulty: '进阶',
    summary:
      '普朗特边界层理论指出，高雷诺数下粘性效应主要集中于紧贴壁面极薄的一层流体中；准确用棱柱网格和 y+ 尺度分辨该薄层，直接决定了 Fluent 压降、壁面剪切力与传热计算的可信度。',
    prerequisites: ['fm-laminar-turbulent', 'fm-navier-stokes'],
    relatedTopicIds: ['fm-external-drag-lift', 'ht-convection-similarity'],
    keyPoints: [
      '由于壁面无滑移条件（u_wall = 0），速度从壁面的零急剧过渡至主流速度的 99% 所需法向厚度定义为速度边界层厚度 δ。',
      '当流道扩张遇到逆压梯度（∂p/∂x > 0）时，近壁低动能流体减速停滞并倒流，诱发边界层分离（Flow Separation），产生大尺度尾涡与剧烈形体压差阻力。',
      '湍流边界层沿壁面法向分为粘性底层（y+ < 5，线性律 u+ = y+）、缓冲层（5 ≤ y+ ≤ 30）与对数律区（30 < y+ ≤ 300）。',
      '选用 SST k-ω 或低 Re 模型解析传热、边界层分离时，应控制第一层网格 y+ ≈ 1；采用标准壁面函数 (Standard Wall Functions) 节省算力时，则需使首层中心落于 30 ≤ y+ ≤ 300。',
    ],
    diagram: {
      kind: 'fluid-boundary-layer',
      caption: '平板边界层发展转捩与湍流近壁多层速度分布结构',
      note: '严禁让壁面第一层网格重心集中落在 5 < y+ < 30 缓冲层内，该区域既不符合纯线性关系也未达到对数律。',
    },
    formulas: [
      {
        title: '无量纲壁面距离 y+ 与摩擦速度 u_τ',
        latex: 'y^+ = \\frac{\\rho u_\\tau y}{\\mu}, \\qquad u_\\tau = \\sqrt{\\frac{\\tau_w}{\\rho}}',
        meaning: '将第一层网格质心到壁面的几何距离 y 用粘性长度尺度 μ/(ρ·uτ) 无量纲化，度量近壁网格解析精细度。',
        symbols: [
          { symbol: 'y', meaning: '第一层网格单元中心距壁面真实距离', unit: 'm' },
          { symbol: 'u_τ', meaning: '壁面摩擦速度', unit: 'm/s' },
          { symbol: 'τ_w', meaning: '壁面剪切应力', unit: 'Pa' },
        ],
        conditions: '先通过平台计算器按平板经验公式估算第一层高度 h1，正式计算后必须在 Fluent 中查看 Wall Yplus 云图校核。',
      },
      {
        title: '近壁对数律速度分布公式',
        latex: 'u^+ = \\frac{1}{\\kappa} \\ln(y^+) + B \\qquad (\\kappa \\approx 0.41,\\; B \\approx 5.2)',
        meaning: '光滑壁面充分发展湍流对数区无量纲速度 u/uτ 随 ln(y+) 线性增长，是标准壁面函数的理论基石。',
        conditions: '适用于 30 < y+ < 300 且无强烈逆压梯度分离的光滑定常附着边界层。',
      },
    ],
    engineeringTips: [
      'Fluent 中绘制边界层时，先用站内 y+ 计算器算出 h1，再在 Meshing Step 8 Add Boundary Layers 选用 Uniform 模式并至少铺设 10–15 层以完整包裹边界层厚度 δ。',
      '弯管内侧拐角、扩压器、汽车尾部与翼型大攻角背风面存在逆压梯度分离，标准壁面函数会推迟分离预测，此时首选 k-ω SST + y+ ≤ 1。',
    ],
    cfdConnections: [
      {
        label: 'y+ 与第一层网格高度计算器',
        to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
        note: '输入主流速度与物性参数，反算精确首层高度 h1',
      },
      {
        label: 'Fluent Meshing · 添加边界层 Step 8',
        to: '/fluent-meshing?task=wm-boundary-layers',
        note: '对照演练 First Height、Growth Rate 与棱柱层设置',
      },
    ],
    quiz: {
      id: 'quiz-fm-bl-1',
      question: '当流动遇到强逆压梯度（顺流方向压强不断升高 ∂p/∂x > 0）并伴随流体动能被壁面耗散时，最可能发生的流动现象是？',
      options: [
        '边界层厚度迅速变薄并保持层流',
        '近壁流体停滞倒流诱发边界层分离，形体压差阻力陡增',
        '局部流动加速至超声速且不会产生涡',
        '流道沿程静压完全遵循理想伯努利恢复到入口总压',
      ],
      correctIndex: 1,
      explanation:
        '逆压梯度对流体做负功，近壁流体本就因粘性滞止而动能微弱，率先在壁面切应力 τw = 0 处停滞并倒流，导致主流脱离壁面形成回流尾涡与不可逆压降损失。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-bl-2',
        question: '在 Fluent 中对大攻角翼型失速分离和壁面精准换热采用 SST k-ω 模型时，首层贴体边界层网格的中心 y+ 理想设计目标是？',
        options: ['y+ ≈ 0.5 ~ 1.0', 'y+ ≈ 15（落在缓冲层）', 'y+ > 500', '随便画几层四面体即可'],
        correctIndex: 0,
        explanation:
          'SST k-ω 具备贯穿粘性底层的低雷诺数封闭能力，控制首层网格 y+ ≤ 1 才能直接积分出精确的壁面剪切和温度梯度；y+ ≈ 15 的缓冲层误差最大。',
      },
    ],
    keywords: ['边界层', 'y+', '流动分离', '逆压梯度', '壁面函数', '粘性底层', '对数律'],
  },
  {
    id: 'fm-compressible-flow',
    courseId: 'fluid-mechanics',
    chapter: '第 6 章 · 可压缩气体动力学基础',
    moduleGroup: '模块二 · 管路阻力、边界层与高速流',
    title: '可压缩流动、当地声速、马赫数与激波',
    englishTitle: 'Compressible Flow, Speed of Sound, Mach Number & Shocks',
    difficulty: '工程应用',
    summary:
      '当气体流速接近或超过当地声速时，压缩性使密度不再为常数，压能、热能与动能剧烈相互转化。马赫数是区分可压缩与不可压缩模型、选择 Pressure-Based 还是 Density-Based 求解器的根本标尺。',
    prerequisites: ['fm-continuity-bernoulli', 'td-basic-concepts'],
    relatedTopicIds: ['td-first-law', 'td-typical-processes'],
    keyPoints: [
      '当地声速本质上代表微小压强扰动波在弹性介质中传播的速度；对于理想气体，声速只取决于绝热指数 k、气体常数 Rg 和热力学温度 T。',
      '马赫数 Ma = v / a < 0.3 时密度变化通常小于 5%，工程上可安全采用常密度不可压缩近似；超过 0.3 须开启理想气体状态方程及能量方程。',
      '亚声速流动在渐缩管中加速、渐扩管中减速；而一旦超过声速（Ma > 1），相反呈现“缩管减速、扩管加速”特征（拉瓦尔喷管原理）。',
      '超声速流动突然减速转向或遇背压过高时，会形成极薄且熵剧增、总压严重跌落的绝热不可逆间断面——激波 (Shock Wave)。',
    ],
    formulas: [
      {
        title: '理想气体当地声速公式',
        latex: 'a = \\sqrt{k R_g T}',
        meaning: '理想气体中的弱压力扰动传播速度完全由绝热指数、比气体常数与绝对温度决定。',
        symbols: [
          { symbol: 'a', meaning: '当地声速（空气 293 K 时约为 343 m/s）', unit: 'm/s' },
          { symbol: 'k', meaning: '比热比 cp/cv（双原子干燥空气 ≈ 1.4）', unit: '无量纲' },
          { symbol: 'R_g', meaning: '比气体常数 R / M（空气约 287.05）', unit: 'J/(kg·K)' },
          { symbol: 'T', meaning: '当地静温（必须使用开尔文绝对温标 K）', unit: 'K' },
        ],
        conditions: '理想气体，小扰动等熵传播近似。',
      },
      {
        title: '马赫数与等熵滞止总温关系',
        latex: '\\mathrm{Ma} = \\frac{v}{a}, \\qquad \\frac{T_0}{T} = 1 + \\frac{k - 1}{2}\\mathrm{Ma}^2',
        meaning: '将绝热气体等熵滞止到速度为零时的总温（滞止温度 T0）显著高于静温 T。',
        conditions: '一维绝热、量热完全理想气体。',
      },
    ],
    comparisonTable: {
      caption: '马赫数分区、流动特征与 CFD 求解策略指南',
      headers: ['马赫数区间', '流态名称', '压缩性与物理特性', 'Fluent 推荐模型策略'],
      rows: [
        ['Ma < 0.3', '不可压缩亚声速', '密度相对变化 < 5%，动能热效应微弱', 'Pressure-Based + 常物性（无换热时可不开 Energy）'],
        ['0.3 ≤ Ma < 0.8', '可压缩亚声速', '需耦合能量方程与密度随压强/温度变化', 'Pressure-Based Coupled + Ideal Gas + Energy On'],
        ['0.8 ≤ Ma < 1.2', '跨声速 (Transonic)', '局部激波与亚/超混合区共存，压力激波剧变', 'Pressure-Based Coupled 或 Density-Based 配合 ROE/AUSM'],
        ['Ma ≥ 1.2', '超声速/高超声速', '强激波、膨胀波与激波/边界层干涉主导', 'Density-Based Implicit + Ideal Gas + 足够网格捕捉激波'],
      ],
    },
    workedExample: {
      title: '例题：高速来流空气滞止温升与当地声速计算',
      scenario: '飞行器高空巡航来流空气静温 T = 223 K（-50 °C），飞行马赫数 Ma = 0.85（空气 k = 1.4, Rg = 287 J/(kg·K)）。计算高空当地声速、飞行真速以及机头驻点绝热滞止总温 T0。',
      given: ['T = 223 K', 'Ma = 0.85', 'k = 1.4', 'Rg = 287 J/(kg·K)'],
      steps: [
        '当地声速：a = √(1.4 × 287 × 223) = √89601.4 ≈ 299.3 m/s。',
        '飞行速度：v = Ma × a = 0.85 × 299.3 ≈ 254.4 m/s。',
        '等熵滞止总温：T0 = T [1 + 0.5(1.4 - 1)×0.85²] = 223 × (1 + 0.1445) = 255.2 K（-18 °C）。',
      ],
      answer: 'a ≈ 299.3 m/s，v ≈ 254.4 m/s，驻点总温 T0 ≈ 255.2 K',
      takeaway: '高速飞行时气动滞止压缩会使驻点温度显着高过静温；超声速下甚至引起结构气动热防护问题。',
    },
    engineeringTips: [
      'Fluent 选择 Ideal Gas 密度时，务必开启 Energy Equation；并且在高速流中要清楚区分 boundary 条件里的 Total Pressure 与 Gauge Static Pressure，不可把两者填混。',
      '超临界/超声速出口（Ma > 1）的所有扰动无法逆流上传，Outlet 边界处的指定压强将被求解器自然外插覆盖，只需保持合理初始值与外推边界设置。',
    ],
    cfdConnections: [
      {
        label: 'Mach 数计算器',
        to: '/calculators/dimensionless-numbers/mach-number',
        note: '计算流速与静温对应的当地马赫数并核对流态区间',
      },
      {
        label: '理想气体声速计算器',
        to: '/calculators/flow-piping/ideal-gas-speed-of-sound',
        note: '按温度与气体种类换算声速 a',
      },
    ],
    quiz: {
      id: 'quiz-fm-compressible-1',
      question: '将高压储气罐内室温气体通过喷管加速至超越声速（Ma > 1）的射流，必须采用何种截面形状的喷管？',
      options: [
        '单纯的渐缩喷管',
        '单纯的渐扩喷管',
        '先渐缩后渐扩的拉瓦尔 (Laval) 喷管',
        '截面不变的等截面直管',
      ],
      correctIndex: 2,
      explanation:
        '根据等熵流面积-速度关系 dA/A = (Ma² - 1) dv/v：亚声速区 (Ma < 1) 需要截面减小 (dA < 0) 加速至喉部恰好到达 Ma = 1（壅塞声速），此后进入超声速区 (Ma > 1) 必须截面扩大 (dA > 0) 才能继续加速！',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-compressible-2',
        question: '当超声速气流垂直穿过一道静止“正激波 (Normal Shock)”后，下列热工及流动参数的变化趋势正确的是？',
        options: [
          '马赫数突然跌至亚声速，静压、静温与密度突升，而总压不可逆下降',
          '流速由亚声速瞬间跃升为超声速，总压升高',
          '正激波是等熵可逆压缩过程，总压严格不变',
          '所有参数均沿等温线连续无跳变过渡',
        ],
        correctIndex: 0,
        explanation:
          '正激波是极强耗散间断面：虽绝热保持总温 T0 守恒，但熵 s 剧增令总压 P0 严重跌落，波后气流减速为亚声速并伴随静压与静温骤升。',
      },
    ],
    keywords: ['可压缩', '声速', '马赫数', '拉瓦尔喷管', '激波', 'mach', 'density-based'],
  },
  {
    id: 'fm-dimensional-similarity',
    courseId: 'fluid-mechanics',
    chapter: '第 7 章 · 相似理论与量纲分析',
    moduleGroup: '模块三 · 相似工程与流体机械应用',
    title: '白金汉 Π 定理与流体力学相似准则（Re / Fr / Eu / St）',
    englishTitle: 'Buckingham Pi Theorem & Dynamic Similarity Laws',
    difficulty: '进阶',
    summary:
      '面对极其复杂的三维绕流与叶轮流道，单靠实验穷举全部尺寸与速度既耗时又天价。白金汉 Π 定理将多个物理变量聚合成少数无量纲数群，借助模型风洞/水洞缩放就能精确预报足尺寸真机受力与压降。',
    prerequisites: ['fm-laminar-turbulent'],
    relatedTopicIds: ['fm-external-drag-lift', 'fm-turbomachinery-cavitation', 'ht-convection-similarity'],
    keyPoints: [
      '白金汉 Π 定理：如果物理问题涉及 n 个独立物理量且涵盖 k 个基本量纲（流体力学通常为 M, L, T 三个基本量纲），则可化简为 n - k 个互相独立的无量纲准则数 Π₁ = φ(Π₂, …, Π_{n-k})。',
      '真实流体机械与结构缩比实验需依次满足：几何相似（各对应线长成固定比例）、运动相似（速度三角形相似）及动力相似（主导同类力的比值相等）。',
      '不同工程场景主导力各异：无自由液面内流阻力看 Re（惯性/粘性）；明渠水坝或船体兴波看弗劳德数 Fr（惯性/重力）；卡门涡街等脉动频率看斯特劳哈尔数 St。',
      '在实际风洞缩比试验中常难以同时令 Re 和 Fr（或 Ma）全部严格相等，工程师必须抓“主要主导力”，对次要准则采用经验外插或局部粗糙度激励补偿。',
    ],
    formulas: [
      {
        title: '经典流体动力学四大无量纲相似准则数',
        latex: '\\mathrm{Eu} = \\frac{\\Delta p}{\\rho v^2}, \\qquad \\mathrm{Fr} = \\frac{v}{\\sqrt{g L}}, \\qquad \\mathrm{St} = \\frac{f L}{v}, \\qquad \\mathrm{Re} = \\frac{\\rho v L}{\\mu}',
        meaning: '分别度量压力与惯性力之比 (欧拉数)、惯性力与重力之比 (弗劳德数)、涡脱落脉动时间尺度比 (斯特劳哈尔数) 及惯性/粘性力比。',
        symbols: [
          { symbol: 'f', meaning: '卡门涡街脱落或机械扰动频率', unit: 'Hz (1/s)' },
          { symbol: 'L', meaning: '特征几何尺度（翼弦/圆直径/水深）', unit: 'm' },
        ],
        conditions: '低速不可压缩全充满有压管道（无重力波）重点保证 Re 相似；非定常周期脱落需校核 St；溢流堰与船模看重 Fr。',
      },
    ],
    comparisonTable: {
      caption: '流体力与传热常用相似准则主导场景对照',
      headers: ['相似准则名称', '物理受力/速率对比', '主导工程研究领域'],
      rows: [
        ['Reynolds 数 (Re)', '惯性力 / 粘性力', '管网摩阻系数、风洞阻力曲线、湍流模型判定'],
        ['Froude 数 (Fr)', '惯性力 / 重力', '船体兴波阻力、明渠水流、溢洪道自由液面VOF'],
        ['Euler 数 (Eu)', '压差力 / 惯性动压', '阀门/局部阻力系数 Kv、水泵气蚀空化 Thoma 数'],
        ['Strouhal 数 (St)', '局部惯性变化速率 / 对流迁移', '圆管换热管束卡门涡街振动、风机叶片离散声频'],
      ],
    },
    workedExample: {
      title: '例题：1:5 风洞缩比车模雷诺数相似风速反算',
      scenario: '实车设计巡航速度 v_p = 30 m/s（常温常压空气），若采用 1 : 5（Lm/Lp = 0.2）的几何缩比模型在同一常压风洞（相同空气物性 ν_m = ν_p）中进行严格雷诺数动力相似实验，风洞至少需要吹出多大风速 v_m？',
      given: ['Lm / Lp = 1/5 = 0.2', 'v_p = 30 m/s', 'ν_m = ν_p'],
      steps: [
        '严格粘性动力学相似条件：Re_m = Re_p ⇒ (v_m · L_m) / ν_m = (v_p · L_p) / ν_p。',
        '由于介质相同 ν_m = ν_p，得 v_m = v_p × (L_p / L_m) = 30 × 5 = 150 m/s。',
      ],
      answer: 'v_m = 150 m/s（约为 Ma ≈ 0.44）',
      takeaway: '缩尺过小若硬保同空气下 Re 相等，所需风洞风速会猛增进入可压缩区引入多余误差，所以大缩比汽车/飞机风洞试验才常采用增压风洞或低温氮气来压低 ν_m。',
    },
    engineeringTips: [
      '当模型试验流动处于高雷诺数“自模区”（例如充分粗糙阻力系数 f 不再随 Re 改变的阻力平方区）时，只需几何相似即可让欧拉阻力系数自动重合，无需强行追齐天价 Re。',
      '用同一组算例换不同比例模型并在 CFD 无量纲报告中汇总数据时，一律把压强化为压力系数 Cp、把阻力化为阻力系数 Cd 比较才真正具有通用物理可比性。',
    ],
    quiz: {
      id: 'quiz-fm-sim-1',
      question: '一个由 5 个物理量组成的水力机械压降关联式 Δp = f(L, v, ρ, μ) 中只包含质量 M、长度 L、时间 T 三个独立基本量纲，根据白金汉 Π 定理，它最少可被整理为几个独立无量纲 Π 数的函数？',
      options: ['1 个', '2 个', '3 个', '5 个'],
      correctIndex: 1,
      explanation:
        '根据 Π 定理，独立无量纲数个数 = 物理量总数 n - 独立基本量纲数 k = 5 - 3 = 2 个，恰好就是大家熟知的欧拉数 Eu = φ(Re)！',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-sim-2',
        question: '在实验室研究某大型水利枢纽水坝溢洪道（以重力和惯性力支配的水面自由落流）做 1:25 模型缩尺试验时，必须优先满足哪个相似准则？',
        options: ['Reynolds 数相等', 'Froude 数相等', 'Mach 数相等', 'Prandtl 数相等'],
        correctIndex: 1,
        explanation:
          '开放水域波浪与溢流泄水过程以重力和惯性力为主导，必须优先保障 Fr = v/√(gL) 相等（模型流速应按比例尺平方根缩放 v_m = v_p / √25 = v_p / 5）。',
      },
    ],
    keywords: ['白金汉', '量纲分析', '相似准则', '弗劳德数', '欧拉数', '斯特劳哈尔数', '自模区'],
  },
  {
    id: 'fm-external-drag-lift',
    courseId: 'fluid-mechanics',
    chapter: '第 8 章 · 外流绕流、升阻力与涡街',
    moduleGroup: '模块三 · 相似工程与流体机械应用',
    title: '外部绕流阻力、阻力危机、机翼升力与卡门涡街',
    englishTitle: 'External Flows, Drag Crisis, Airfoil Lift & Vortex Shedding',
    difficulty: '进阶',
    summary:
      '汽车外流场、风力机叶片、建筑风载和换热管束受迫横掠都受绕流升阻力与尾部脱落涡控制。看清摩擦阻力与压差形体阻力之分，以及绕圆柱“阻力危机”与“卡门涡街共振”机理，能直接避开重大流体结构工程事故。',
    prerequisites: ['fm-boundary-layer', 'fm-dimensional-similarity'],
    relatedTopicIds: ['ht-internal-external-natural', 'fm-turbomachinery-cavitation'],
    keyPoints: [
      '绕流总阻力 Fd 由表面切应力积分（摩擦阻力）和迎背风面压强差积分（压差/形体阻力）叠加而成；钝体（圆柱、建筑）几乎 90% 以上来自压差形体阻力，流线型体才由摩擦主导。',
      '边界层“阻力危机（Drag Crisis）”：当圆球或圆柱绕流 Re 越过临界值（≈ 3×10⁵）发生附着层流提前转捩为湍流后，近壁湍流动量更饱满，分离点后移大幅缩窄尾流，反而令阻力系数 Cd 断崖暴跌近 60%！',
      '机翼或风电叶片借助合适攻角下表面高压、上表面低压的环量效应产生垂直于来流方向的巨大升力；攻角过大诱发上翼面边界层大分离会导致升力陡降——失速 (Stall)。',
      '钝体亚临界至超高亚声速区尾部周期性交替脱落“卡门涡街（Kármán Vortex Street）”，如果涡脱频率恰好撞上烟囱或换热管固有频率，会诱发毁灭性涡激共振 (VIV)。',
    ],
    diagram: {
      kind: 'fluid-external-vortex',
      caption: '圆柱绕流边界层分离产生周期交替卡门涡街 (左) 与机翼上下压差升力机制 (右)',
      note: '涡街频率满足 f = St·U/D（典型圆柱宽亚临界区 St ≈ 0.20~0.21）；高尔夫球表面的凹坑正是靠提前激发湍流“阻力危机”降低尾流压差来打得更远。',
    },
    formulas: [
      {
        title: '阻力系数 Cd、升力系数 Cl 与卡门涡街频率估算',
        latex: 'F_D = C_D \\frac{1}{2}\\rho U_\\infty^2 A, \\qquad F_L = C_L \\frac{1}{2}\\rho U_\\infty^2 A, \\qquad f = \\mathrm{St}\\frac{U_\\infty}{D}',
        meaning: '将几何受力按自由来流动压与参考面积 A（钝体用正面投影面积、机翼用弦长投影翼面积）无量纲化为工程气动系数。',
        symbols: [
          { symbol: 'C_D, C_L', meaning: '阻力系数与升力系数', unit: '无量纲' },
          { symbol: '\\mathrm{St}', meaning: '斯特劳哈尔数（光滑圆管在 Re ≈ 300~10⁵ 内近似取 0.2）', unit: '无量纲' },
        ],
        conditions: 'St ≈ 0.20–0.21 仅适用于宽亚临界区单圆柱均匀平稳来流横掠；极低 Re (<47) 不生成涡街，高临界区频谱宽化。',
      },
    ],
    workedExample: {
      title: '例题：工业冷却管道迎风卡门涡街频率检验',
      scenario: '化工厂架空冷却光滑圆管外径 D = 0.10 m，受风速 U∞ = 8 m/s 均匀横向吹拂（常温空气 ν = 1.5×10⁻⁵ m²/s）。计算雷诺数并按 St ≈ 0.21 估算交变涡脱升力主频 f。',
      given: ['D = 0.10 m', 'U∞ = 8 m/s', 'ν = 1.5×10⁻⁵ m²/s', 'St ≈ 0.21'],
      steps: [
        '核对雷诺数区间：Re = U∞·D / ν = (8 × 0.10) / (1.5×10⁻⁵) ≈ 5.33×10⁴（处于典型亚临界光滑涡街稳定区 300 ~ 2×10⁵ 内）。',
        '代入频率公式：f = St · U∞ / D = 0.21 × 8 / 0.10 = 16.8 Hz。',
      ],
      answer: 'Re ≈ 5.33×10⁴，涡脱激励频率 f ≈ 16.8 Hz',
      takeaway: '做非定常 Fluent Transient 模拟绕流声学或振动时，单个涡脱周期 T = 1/16.8 ≈ 0.06 s，时间步长 Δt 需至少取 T/20 ~ T/40（约 1~2 ms），并打开 FFT 频谱监测确认主峰频率！',
    },
    engineeringTips: [
      '工业烟囱、高层天线柱与海洋立管外表面常盘绕几圈“螺旋扰流条 (Helical Strakes)”，目的正是打乱沿轴向同步脱落的涡环相关性，彻底抹平单一频率的毁灭性共振。',
      '用 steady 稳态模型去算明显伴随大尺度周期涡脱落的钝体高攻角流动往往无法彻底收敛（残差持续周期波动），这时必须主动切为 Transient 瞬态计算（开启 URANS / LES）才符合物理真实。',
    ],
    cfdConnections: [
      {
        label: 'Force Report 与气动阻力监测设置',
        to: '/fluent-guide?locate=ribbon-forces-report',
        note: '在 Fluent Results / Reports 配置压力阻力、粘性阻力与 Cd 监测',
      },
      {
        label: 'Transient 瞬态涡街时间步长与 FFT 分析',
        to: '/calculators/transient-time-step/cfl-time-step',
        note: '根据网格尺寸估算 CFL 与时间步 Δt，再在 Results FFT 读取涡脱主频',
      },
    ],
    quiz: {
      id: 'quiz-fm-ext-1',
      question: '当横掠光滑圆球的来流雷诺数越过临界值（约 3×10⁵）突然触发“阻力危机”时，圆球总阻力系数 CD 反常剧烈下降的物理原因是？',
      options: [
        '壁面突然变为绝对光滑零摩擦',
        '前部边界层提前转捩为高动能湍流，推迟了分离角并大幅缩小低压尾迹区尺寸',
        '圆球下游彻底不再形成任何旋涡',
        '空气密度在高风速下急剧减半',
      ],
      correctIndex: 1,
      explanation:
        '钝体阻力由压差尾流决定：湍流边界层掺混更强抗逆压梯度能力远胜层流，能贴着圆球表面绕过赤道走到更后方才脱离，极大缩窄了低负压尾流宽度。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-ext-2',
        question: '如果在 Fluent 中只配置 Steady 稳态计算高雷诺数圆柱绕流时残差卡在 1e-2 上下波动且 Cd 呈规律锯齿振荡，最本质的物理与建模原因是？',
        options: [
          '求解精度选错了',
          '因为钝体背后存在随时间周期性交替脱落的卡门涡街，本质上就是强非定常流，需切换 Transient 计算',
          '圆柱体表面忘了给光滑无滑移边界',
          '只需要增大入口速度就能稳态收死',
        ],
        correctIndex: 1,
        explanation:
          '卡门涡街本身就是时变的周期性结构（St ≈ 0.2），强用定常稳态逼近在物理上就不存在严格定常解；开启 Transient + 匹配小时间步长立刻能清晰再现周期振荡。',
      },
    ],
    keywords: ['阻力系数', '阻力危机', '卡门涡街', '升力', '失速', '涡激振动', 'drag', 'vortex'],
  },
  {
    id: 'fm-turbomachinery-cavitation',
    courseId: 'fluid-mechanics',
    chapter: '第 9 章 · 流体机械（泵与风机）与汽蚀',
    moduleGroup: '模块三 · 相似工程与流体机械应用',
    title: '流体机械（泵/风机）相似定律、工作点与汽蚀防护',
    englishTitle: 'Turbomachinery Affinity Laws, Operating Point & Cavitation',
    difficulty: '工程应用',
    summary:
      '能源系统中的所有液体输运和水风冷散热均由水泵、风机和压缩机叶轮驱动。理解叶轮转速调整带来的功耗三次方节能潜力、泵曲线与管路阻力交叉工作点确定，以及毁灭叶轮的汽蚀 NPSH 校核，是工程落地的关键一环。',
    prerequisites: ['fm-continuity-bernoulli', 'fm-laminar-turbulent', 'fm-dimensional-similarity'],
    relatedTopicIds: ['td-first-law', 'ref-compressors-characteristics'],
    keyPoints: [
      '欧拉叶轮基本方程 H_th = (u₂v_{u2} - u₁v_{u1})/g 揭示流体通过叶轮获得的理论能量直接取决于叶片出口圆周线速度与流体切向分速的改变。',
      '泵/风机转速比例相似律（Affinity Laws）：同台设备在阻力抛物线上变速时，流量 Q ∝ n¹、扬程/全压 H ∝ n²、轴功率 P ∝ n³！（转速降至 80%，理论轴功率降至约 51.2%！）。',
      '水泵真实运行工况并非铭牌上写死的某个数值，而是“泵自身 H-Q 性能曲线”与“下游管网阻抗曲线 H_sys = H_st + S Q²”相交的唯一交点（工作点 Operating Point）。',
      '当叶轮进口吸液区局部静压跌破工作水温下的饱和蒸气压 p_v 时，液体沸腾形成气泡并在下游高压叶背瞬间剧烈溃灭打击金属——即“汽蚀（Cavitation）”，工程须保证 NPSHa > NPSHr + 安全余量（通常 ≥ 0.5 m）。',
    ],
    diagram: {
      kind: 'fluid-pump-curve',
      caption: '离心泵 H-Q 性能曲线与管网阻抗线工作点及变频调速 (n₁→n₂) 节能轨迹',
      note: '传统出口关小阀门节流虽也能减流量，但压差白耗在阀门涡损上（曲线变陡至虚线）；采用变频降速沿相似抛物线下移工作点则直接带来功率三次方大幅节电。',
    },
    formulas: [
      {
        title: '离心泵/风机变频调速相似定律',
        latex: '\\frac{Q_2}{Q_1} = \\frac{n_2}{n_1}, \\qquad \\frac{H_2}{H_1} = \\left(\\frac{n_2}{n_1}\\right)^2, \\qquad \\frac{P_2}{P_1} = \\left(\\frac{n_2}{n_1}\\right)^3',
        meaning: '针对同一台几何尺寸不变且忽略静扬程 Hst 占主导的纯阻力管网调速场景，直接预示变频节能巨大红利。',
        symbols: [
          { symbol: 'n', meaning: '叶轮转速', unit: 'rpm (r/min)' },
          { symbol: 'H', meaning: '泵扬程或风机全压', unit: 'm 或 Pa' },
          { symbol: 'P', meaning: '叶轮轴功率', unit: 'W' },
        ],
        conditions: '仅当管路几乎全为沿程/局部动阻（H_st ≈ 0，如闭式空调水循环或通风风网）且效率近同才严格成立；若高扬程静压提升 H_st 很高（如向高楼顶抽水），降速到一定程度流量会直接断流掉为零！',
      },
      {
        title: '装置有效汽蚀余量 NPSHa 与安全运行判据',
        latex: '\\mathrm{NPSH}_a = \\frac{p_{\\text{surf}} - p_v(T)}{\\rho g} - h_s - h_{f,\\text{suc}} \\ge \\mathrm{NPSH}_r + \\Delta_{\\text{safe}}',
        meaning: '吸入液面自由压差减去吸水高度 hs 和吸水管摩阻损失后，必须明显高于水泵叶轮入口自身所需的最低压头损失 NPSHr。',
        conditions: '输送高温热水时饱和蒸气压 p_v(T) 急速升高，导致安全吸程极大缩水甚至需要泵倒灌安装（h_s < 0，液面高于泵）。',
      },
    ],
    workedExample: {
      title: '例题：闭式冷却水泵变频降速节能定量计算',
      scenario: '某工厂闭式冷却循环水系统（静扬程 H_st = 0），额定转速 n₁ = 1450 rpm 时实测水泵流量 Q₁ = 120 m³/h、扬程 H₁ = 32 m，所需水泵轴功率 P₁ = 15 kW。现因季节负荷下降只需 Q₂ = 96 m³/h，试改用变频器调速代替关小出口阀门，求新转速 n₂ 与理论新轴功率 P₂。',
      given: ['H_st = 0', 'n₁ = 1450 rpm, Q₁ = 120 m³/h, P₁ = 15 kW', '目标 Q₂ = 96 m³/h'],
      steps: [
        '所需转速比：n₂ / n₁ = Q₂ / Q₁ = 96 / 120 = 0.80 ⇒ 新转速 n₂ = 1450 × 0.8 = 1160 rpm。',
        '新扬程按平方缩减：H₂ = 32 × 0.80² = 20.48 m。',
        '新轴功率按立方大幅跌落：P₂ = 15 × 0.80³ = 15 × 0.512 = 7.68 kW（节能率高达 48.8%！）。',
      ],
      answer: 'n₂ = 1160 rpm，轴功率由 15 kW 降至 7.68 kW',
      takeaway: '空调与工业循环水系统“关阀不降频”白白在阀门处消耗高压差；安装变频器调降 20% 流量即可砍掉近一半水泵电耗！',
    },
    engineeringTips: [
      '用 Fluent 仿真多叶轮旋转机械（水泵、风扇、压气机）有两种常用技术：稳态快速算平均流场用“Moving Reference Frame (MRF) 多重参考系（冻结转子）”；精确捕捉叶轮-蜗壳/导叶动静干涉非定常脉动时再用“Sliding Mesh 滑移网格”搭配每步转角 1°~3° 的瞬态时间步。',
      '抽送 80~95 °C 热水（如锅炉给水泵或溴化锂热泵循环泵）极易发生剧烈汽蚀，现场常见解决办法是：把水泵放到水箱最底部下方保证倒灌正吸入压头，同时把吸水管加粗减少摩阻并尽量取消不必要的吸口滤网弯头。',
    ],
    cfdConnections: [
      {
        label: '旋转机械基础时间步长计算器',
        to: '/calculators/transient-time-step/rotating-time-step',
        note: '根据叶轮转速 rpm 与叶片/网格旋转步进角估算 Sliding Mesh 时间步 Δt',
      },
      {
        label: 'Cell Zone Motion 滑移网格/MRF 参考系位置',
        to: '/fluent-guide?locate=cell-zone-fluid-frame-motion',
        note: '在 Fluent Fluid Zone 中查看 Frame Motion (MRF) 与 Mesh Motion 设置',
      },
    ],
    quiz: {
      id: 'quiz-fm-pump-1',
      question: '在一个静扬程几乎为零的纯闭式中央空调冷水循环水网中，若仅靠变频调速将循环水泵转速由 100% 降至 70%（其他工况不变，效率近似），水泵流量和耗电轴功率分别近似降至原来的？',
      options: [
        '流量 70%，轴功率 70%',
        '流量 49%，轴功率 34.3%',
        '流量 70%，轴功率 34.3%',
        '流量 34.3%，轴功率 49%',
      ],
      correctIndex: 2,
      explanation:
        '根据泵相似律，在纯动阻闭式管网中 Q ∝ n¹ ⇒ 70%；H ∝ n² ⇒ 49%；轴功率 P ∝ n³ = 0.7³ = 0.343（即 34.3%！）。',
    },
    extraQuizzes: [
      {
        id: 'quiz-fm-pump-2',
        question: '高温锅炉给水泵发生严重“汽蚀 (Cavitation)”并伴随着壳体剧烈振动与碎石劈啪噪音，下列哪项现场改进措施从原理上最能直接缓解汽蚀？',
        options: [
          '调高给水泵转速一倍',
          '提高除氧器水箱安装高度（增加倒灌压头）并增大吸水管直径、降低吸液阻力',
          '加长并缩细吸水管段',
          '关小入口吸液闸阀以限制进入水泵水量',
        ],
        correctIndex: 1,
        explanation:
          '提高吸水水箱高度、缩短加粗吸水管路并避免吸口节流，能够直接推高 NPSHa = (p_surf - pv)/ρg - hs - hf,suc，使叶片吸入口静压远高于汽化压力避免空泡溃灭！切忌关小水泵“入口”闸阀。',
      },
    ],
    keywords: ['水泵', '风机', '相似定律', '工作点', '汽蚀', 'NPSH', 'MRF', '滑移网格'],
  },
]
