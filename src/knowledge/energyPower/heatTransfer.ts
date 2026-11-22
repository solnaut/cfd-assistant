import type { EnergyTopic } from '../../models/energyKnowledge'

export const heatTransferTopics: EnergyTopic[] = [
  {
    id: 'ht-three-modes',
    courseId: 'heat-transfer',
    chapter: '第 1 章 · 绪论与传热机理',
    moduleGroup: '模块一 · 传热方式与稳态导热方程体系',
    title: '三种基本传热方式与串联热阻思想',
    englishTitle: 'Conduction, Convection, Radiation & Thermal Resistance',
    difficulty: '基础',
    summary:
      '一切工程冷却与保温归根结底是导热、对流和热辐射三种基本机制的单独或耦合传热。用类比“欧姆定律电流”的热阻网格串联并联思想处理复合壁传热，可极大简化多环节散热瓶颈诊断。',
    prerequisites: [],
    relatedTopicIds: ['ht-steady-conduction', 'ht-heat-exchangers', 'ref-expansion-heat-exchangers'],
    keyPoints: [
      '导热（热传导）依赖介质微观分子振动或自由电子迁移，服从傅里叶定律：热流密度与负温度梯度及材料导热系数 λ 成正比。',
      '对流换热是流动液体/气体与固体壁面之间的耦合传递，采用牛顿冷却公式以宏观表面传热系数 h 归纳流动传热强度。',
      '热辐射不依赖任何中间物质就能靠电磁波在真空传播，其发射本领强烈依赖于绝对温度的四次方（T⁴），高温炉膛及电子器件高温辐射尤为突出。',
      '在复杂一维串联换热网络中，总传热量等于总温差除以总热阻（总热阻最大的一环即是限制散热或决定保温效果的核心控制热阻！）。',
    ],
    diagram: {
      kind: 'ht-three-modes',
      caption: '导热、对流、热辐射物理图景及传热壁面串联热阻网络示意图',
      note: '强化散热永远优先降低占比最高的最大分热阻（如气液换热时空气侧对流热阻远高于金属壁导热与水侧对流热阻，故必须加翅片扩面）。',
    },
    formulas: [
      {
        title: '三大传热基本定律表达式',
        latex: 'q_{\\text{cond}} = -\\lambda \\frac{\\mathrm{d}T}{\\mathrm{d}x}, \\qquad q_{\\text{conv}} = h (T_w - T_\\infty), \\qquad q_{\\text{rad}} = \\varepsilon \\sigma T^4',
        meaning: '分别定量给出单位面积导热热流、壁面对流换热量与灰体表面自身辐射力。',
        symbols: [
          { symbol: 'λ', meaning: '材料导热系数 (Thermal Conductivity)', unit: 'W/(m·K)' },
          { symbol: 'h', meaning: '表面对流换热系数', unit: 'W/(m²·K)' },
          { symbol: 'σ', meaning: '斯蒂芬-玻尔兹曼常数（5.67×10⁻⁸）', unit: 'W/(m²·K⁴)' },
          { symbol: 'ε', meaning: '表面发射率 (Emissivity, 0 ~ 1)', unit: '无量纲' },
        ],
        conditions: '辐射公式中的 T 必须使用绝对温标开尔文 (K)。',
      },
      {
        title: '热阻与总传热系数 K（平壁传热）',
        latex: 'Q = \\frac{\\Delta T_{\\text{total}}}{R_{\\text{total}}} = K A \\Delta T_{\\text{total}}, \\qquad \\frac{1}{K} = \\frac{1}{h_1} + \\sum \\frac{\\delta_i}{\\lambda_i} + \\frac{1}{h_2}',
        meaning: '通过一维热阻串联叠加，直接求算冷热流体通过多层壁面的总传热量 Q。',
        conditions: '稳态一维无内热源平壁换热且接触面紧密无接触热阻。',
      },
    ],
    comparisonTable: {
      caption: '典型工况下的对流换热系数 h 参考量级（用于快速数量级校核）',
      headers: ['换热模式与介质', '典型对流系数 h 范围 [W/(m²·K)]', '常见工程情景与设计特征'],
      rows: [
        ['空气自然对流', '2 ~ 25', '室内机柜自然冷却、暖气片对外散热（空气侧热阻极大）'],
        ['空气受迫对流', '25 ~ 250', '风冷散热器、风道冷却、空冷冷凝器翅片侧'],
        ['水/液冷受迫对流', '500 ~ 10,000+', '汽车水冷散热器管内、液冷冷板微通道'],
        ['水沸腾 / 蒸汽膜状凝结', '3,000 ~ 100,000', '电厂凝汽器、制冷蒸发器/冷凝器相变侧（热阻极微）'],
      ],
    },
    engineeringTips: [
      '不要盲目用高导热铜替换铝去指望直接把空气自然对流散热翻倍！当空气侧 h 仅有 10 W/(m²·K) 时，热阻主导项在空气对流层而不在 2mm 厚金属板本身。',
      '热流体侧表面若积灰、结水垢，即使只有 1mm 钙镁水垢（λ ≈ 1 W/(m·K)），也等价于在沸腾侧陡增大量附加导热热阻，严重压低锅炉与换热器出力。',
    ],
    cfdConnections: [
      {
        label: '热通量计算器',
        to: '/calculators/heat-transfer/heat-flux',
        note: '换算总热功率与 Wall Boundary 的 Heat Flux (W/m²)',
      },
      {
        label: '复合壁热阻计算器',
        to: '/calculators/heat-transfer/thermal-resistance',
        note: '快速计算平壁导热、对流及总传热系数 K',
      },
    ],
    quiz: {
      id: 'quiz-ht-modes-1',
      question: '一台蒸汽-空气加热器中，管内为水蒸气凝结（h1 ≈ 8000 W/(m²·K)），管壁厚 2mm 为紫铜（λ ≈ 380 W/(m·K)），管外为空气横掠流动（h2 ≈ 40 W/(m²·K)）。欲最有效地提高传热量，最合理的手段是？',
      options: [
        '将铜管厚度从 2mm 减薄至 0.5mm',
        '把铜换为银以进一步提升管壁导热系数',
        '在管外空气侧加装高频翅片（肋片）或提高风速以提升外侧传热',
        '在管内加螺旋纽带扰流以提高管内蒸汽侧传热系数',
      ],
      correctIndex: 2,
      explanation:
        '三项串联热阻中：蒸汽侧 1/8000 ≈ 0.000125，铜壁 0.002/380 ≈ 0.000005，而空气侧 1/40 = 0.025！空气侧占总热阻 99% 以上，因此只有增强空气侧换热面积（加翅片）或风速才立竿见影。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-modes-2',
        question: '黑体辐射散热功率随着绝对温度由 300 K 升温到 600 K（翻倍）时，其表面向外辐射热流强度增大为原来的多少倍？',
        options: ['2 倍', '4 倍', '8 倍', '16 倍'],
        correctIndex: 3,
        explanation:
          '根据斯蒂芬-玻尔兹曼定律 E_b = σ T⁴，绝对温度 T 翻倍，辐射力增加至 2⁴ = 16 倍！高温段辐射传热几乎压倒对流成为绝对主力。',
      },
    ],
    keywords: ['傅里叶定律', '牛顿冷却', '斯蒂芬-玻尔兹曼', '热阻', '总传热系数', '导热', '对流', '辐射'],
  },
  {
    id: 'ht-steady-conduction',
    courseId: 'heat-transfer',
    chapter: '第 2 章 · 稳态热传导',
    moduleGroup: '模块一 · 传热方式与稳态导热方程体系',
    title: '一维稳态导热：多层平壁、圆筒壁与肋片强化',
    englishTitle: 'Steady 1D Conduction: Plane Wall, Cylinder & Fins',
    difficulty: '基础',
    summary:
      '稳态导热中各点温度不再随时间变化，不同壁厚截面间的导热量保持相等（无内热源）。深入理解圆筒壁对数规律带来的径向热阻分布及临界绝热直径概念，对管道保温和芯片翅片扩展至关重要。',
    prerequisites: ['ht-three-modes'],
    relatedTopicIds: ['ht-conduction-pde-bc', 'ht-unsteady-conduction'],
    keyPoints: [
      '常导热系数无内热源平壁内部温度呈严格直线下降；同一多层串联平壁中，热流相同，哪一层导热系数低或更厚，哪一层温降就最剧烈。',
      '圆筒壁由于传热面积随半径 r 线性增大（2πrL），稳态温度按对数规律衰减，内半圈材料承担的径向热阻比例显著大于外半圈。',
      '对细小金属管或导线包覆导热保温层时，如果包覆直径小于临界绝热直径 dc = 2λ / h，增加保温层反而因为大幅扩增外表面散热面积导致散热量不降反升！',
      '在空气侧加装矩形或针状肋片（Fins），需要权衡扩展面积益处与沿肋高导热衰减（引入肋片效率 η_f），并匹配“肋化条件 Biot 数准则”。',
    ],
    diagram: {
      kind: 'ht-wall-conduction',
      caption: '三层复合材料串联平壁导热温度分布与等效热阻示意图',
      note: '中间保温层虽然厚度相当，但因为导热系数 λ₂ 最小（热阻最大），其两端温度下降坡度最为陡峭。',
    },
    formulas: [
      {
        title: '单层圆筒壁稳态导热公式（长度 L）',
        latex: 'Q = \\frac{2 \\pi \\lambda L (T_1 - T_2)}{\\ln(r_2 / r_1)}, \\qquad R_{\\text{cyl}} = \\frac{\\ln(r_2 / r_1)}{2 \\pi \\lambda L}',
        meaning: '计算内半径 r1（温度 T1）到外半径 r2（温度 T2）的空心圆筒壁径向稳态导热量。',
        symbols: [
          { symbol: 'r_1, r_2', meaning: '圆筒壁内外半径', unit: 'm' },
          { symbol: 'L', meaning: '圆筒管段有效长度', unit: 'm' },
        ],
        conditions: '一维纯径向导热、常物性、无内热源。',
      },
      {
        title: '圆筒临界绝热直径',
        latex: 'd_c = \\frac{2 \\lambda_{\\text{ins}}}{h_\\infty}',
        meaning: '外包保温材料导热系数与外部表面传热系数的比值决定圆管最佳/临界增减热流分界直径。',
        conditions: '圆柱壁保温层导热与外部常系数对流耦合；对平板则无此效应。',
      },
    ],
    workedExample: {
      title: '例题：双层窑炉炉墙热流密度与交界面温度求算',
      scenario: '工业炉墙由内层耐火砖（δ₁ = 240 mm, λ₁ = 1.2 W/(m·K)）与外层保温硅酸铝砖（δ₂ = 120 mm, λ₂ = 0.2 W/(m·K)）紧密砌筑。测得内表面温度 T₁ = 900 °C，外表面温度 T₃ = 100 °C，求稳态热流密度 q 与两砖交界面温度 T₂。',
      given: ['δ₁/λ₁ = 0.24 / 1.2 = 0.20 m²·K/W', 'δ₂/λ₂ = 0.12 / 0.2 = 0.60 m²·K/W', 'ΔT = 900 - 100 = 800 K'],
      steps: [
        '串联单位面积总热阻：r_total = 0.20 + 0.60 = 0.80 m²·K/W。',
        '热流密度：q = ΔT / r_total = 800 / 0.80 = 1000 W/m²。',
        '耐火砖层温降 ΔT₁ = q · r₁ = 1000 × 0.20 = 200 K，故交界面温度 T₂ = 900 - 200 = 700 °C（保温砖需耐受 700 °C！）。',
      ],
      answer: 'q = 1000 W/m²，交界面温度 T₂ = 700 °C',
      takeaway: '绝热保温层总热阻更大因而承接了高达 600 K 温降，但务必反算出交界面 T₂ 校验保温材料自身的最高耐热温度是否超限，防止内热外闷烧熔保温棉！',
    },
    engineeringTips: [
      '绝大多数工业热水管/蒸汽管直径远大于几厘米，而优异保温棉 λ ≈ 0.04 W/(m·K)、h ≈ 10 W/(m²·K) ⇒ dc ≈ 8 mm，管径早已大于 dc，加保温必定减少热损失。但给细导线通电散热时包绝缘皮恰在小于 dc 区间，包上反倒更有利电缆散热！',
      '在 Fluent 开启固体域（Solid Zone）做共轭传热时，若使用 Shell Conduction（壳层导热），可直接在薄壁面层设定多层厚度与材料，免去划繁琐薄固体网格。',
    ],
    cfdConnections: [
      {
        label: '稳态平壁导热计算器',
        to: '/calculators/heat-transfer/conduction-heat-transfer',
        note: '快速计算材料厚度与导热系数对应的导热通量',
      },
      {
        label: 'Wall Shell Conduction 薄壁壳导热设置',
        to: '/fluent-guide?locate=wall-shell-conduction',
        note: '在 Fluent Wall 边界条件查看壳层导热层设置位置',
      },
    ],
    quiz: {
      id: 'quiz-ht-cond-1',
      question: '两层紧贴在一起的不同材料大平壁处于一维稳态导热（无内热源），A 层温降为 60 K，B 层温降为 20 K，已知两层厚度完全相同，则导热系数之比 λA / λB 等于？',
      options: ['3 : 1', '1 : 3', '1 : 1', '9 : 1'],
      correctIndex: 1,
      explanation:
        '稳态串联无内热源时，通过 A、B 两层热流密度 q 完全相等：q = λA·ΔTA/δ = λB·ΔTB/δ。由于厚度 δ 相等，导热系数与温降成反比，所以 λA/λB = ΔTB/ΔTA = 20/60 = 1/3（即 1:3）。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-cond-2',
        question: '在细电线电缆（外径 d = 4 mm）外包覆一层导热系数 λ = 0.15 W/(m·K) 的塑料绝缘层，置于表面换热系数 h = 15 W/(m²·K) 的静止室内空气中。根据圆筒临界绝热直径理论，包裹绝缘层后线缆向外界散热速率会如何变化？',
        options: [
          '包上绝缘层一定导致线缆更热散热变差',
          '因为 d_c = 2λ/h = 20 mm 远大于裸线外径 4 mm，加薄绝缘皮扩增散热周长，实际散热量反而上升更利导线降温！',
          '因为圆筒和墙壁不同，塑料导热快过铜',
          '散热量纹丝不动',
        ],
        correctIndex: 1,
        explanation:
          '临界直径 dc = 2×0.15/15 = 0.02 m = 20 mm，直到外包径扩到 20 mm 之前散热热流均一路递增！因此对细电缆涂覆适中塑料套兼顾了电气绝缘与增强空气自然对流散热。',
      },
    ],
    keywords: ['稳态导热', '平壁', '圆筒壁', '临界绝热直径', '肋片', '壳层导热', 'conduction'],
  },
  {
    id: 'ht-conduction-pde-bc',
    courseId: 'heat-transfer',
    chapter: '第 3 章 · 导热偏微分方程与定解条件',
    moduleGroup: '模块一 · 传热方式与稳态导热方程体系',
    title: '三维导热微分方程、三类边界条件与内热源导热',
    englishTitle: 'Heat Diffusion Equation, Boundary Conditions & Internal Generation',
    difficulty: '进阶',
    summary:
      '一切复杂多维几何体内热传递（如芯片发热体内部温升、电芯三维散热点分布）都服从基于傅里叶定律推导的导热微分方程，以及一/二/三类边界条件——这正直接对应于 Fluent Wall Thermal 面板的所有热边界选型。',
    prerequisites: ['ht-three-modes', 'ht-steady-conduction'],
    relatedTopicIds: ['ht-unsteady-conduction', 'ht-enhancement-numerical'],
    keyPoints: [
      '直角坐标系常物性导热微分方程把“时间温度蓄热变化 ρc ∂T/∂t”与“空间热扩散传导 λ∇²T”及“单位体积内热源强 Φ̇”严格守恒绑定。',
      '三大标准定解热边界条件：(1) 第一类 Dirichlet 等壁温（给定表面温度 Tw）；(2) 第二类 Neumann 定热流（给定热通量 qw，特例 qw = 0 即绝热边界）；(3) 第三类 Robin 对流边界（已知流温 T∞ 与表面换热系数 h）。',
      '带均匀内热源 Φ̇ (W/m³) 的大平壁（比如通电母排、核燃料棒或电芯充放热内部）稳态下内部呈现二次抛物线温度分布，温度最高峰出现在中心对称面！',
      '最高中心温升 ΔT_max = Φ̇ L² / (2λ) 与厚度的平方成正比——厚度翻倍且不增冷却，核心温差会直接飙涨 4 倍。',
    ],
    diagram: {
      kind: 'ht-conduction-bc',
      caption: '导热三大标准边界条件图景 (左) 与均质发热大平壁抛物线温度剖面 (右)',
      note: 'Fluent Wall Boundary -> Thermal 页签的 Temperature、Heat Flux、Convection 三大核心输入正分别严格对应热力学第一、二、三类边值定解条件；Coupled 则用于流固双侧界面自动联立平衡。',
    },
    formulas: [
      {
        title: '直角坐标三维常物性导热偏微分方程',
        latex: '\\frac{\\partial T}{\\partial t} = \\alpha \\left(\\frac{\\partial^2 T}{\\partial x^2} + \\frac{\\partial^2 T}{\\partial y^2} + \\frac{\\partial^2 T}{\\partial z^2}\\right) + \\frac{\\dot{\\Phi}}{\\rho c}',
        meaning: '描述物体内部温度随时间演化的基本方程；若稳态且无内热源 (∂T/∂t = 0, Φ̇ = 0)，即化简为与具体材料物性完全无关的拉普拉斯方程 ∇²T = 0！',
        symbols: [
          { symbol: 'α = λ/(ρc)', meaning: '热扩散率（导温系数）', unit: 'm²/s' },
          { symbol: '\\dot{\\Phi}', meaning: '单位体积内部发热量（焦耳热/反应热/核发热）', unit: 'W/m³' },
        ],
        conditions: '各向同性均匀固体且导热系数 λ 为常数。',
      },
      {
        title: '双侧等壁温均匀发热大平壁中心最高温度公式',
        latex: 'T(x) = T_w + \\frac{\\dot{\\Phi} L^2}{2\\lambda}\\left(1 - \\frac{x^2}{L^2}\\right), \\qquad T_{\\max} = T(0) = T_w + \\frac{\\dot{\\Phi} L^2}{2\\lambda}',
        meaning: '半厚为 L（总厚 2L）、两表面保持在恒温 Tw 的发热点在对称中面 x = 0 处的极限升温值。',
        conditions: '一维稳态常物性均匀内热源平壁，两侧冷却完全对称。',
      },
    ],
    workedExample: {
      title: '例题：带内热源锂电池/功率母排对称厚度对芯部最高温升的影响',
      scenario: '一块厚度 2L = 20 mm（即 L = 0.01 m）、等效导热系数 λ = 1.5 W/(m·K) 的均匀发热模块，内热源强度 Φ̇ = 120,000 W/m³。两外表面经充分液冷均维持在 Tw = 35 °C，求其内部中心峰值温度 Tmax 与单侧液冷排走的热通量 qw。',
      given: ['L = 0.01 m', 'λ = 1.5 W/(m·K)', 'Φ̇ = 1.2×10⁵ W/m³', 'Tw = 35 °C'],
      steps: [
        '中心最大温升：ΔT_max = (1.2×10⁵ × 0.01²) / (2 × 1.5) = 12 / 3.0 = 4.0 K ⇒ 中心峰值温度 Tmax = 35 + 4.0 = 39.0 °C。',
        '由能量守恒，半块平壁内部全部发热必须穿过一侧液冷壁排走：qw = Φ̇ · L = 1.2×10⁵ × 0.01 = 1200 W/m²。',
      ],
      answer: '中心最高温 Tmax = 39.0 °C，单侧排热热通量 qw = 1200 W/m²',
      takeaway: '一旦因为结构设计需要把发热体厚度加倍到 40 mm，同样排热强度下芯部温差立刻按平方关系飙到 4×4 = 16 K！',
    },
    engineeringTips: [
      'Fluent 设置 Cell Zone -> Source Terms 输入体积发热时务必看清单位必须是“W/m³”，切忌直接把总瓦数（W）当体积功率输进去——如果模型只有几十立方厘米，总瓦数当成密度输入算例立刻爆出上万摄氏度异常！',
      '做“流固共轭传热 (CHT)”仿真时，流体与固体共用贴合界面壁面，Fluent 会自动生成一个 `wall` 和对应的 `wall-shadow` 并默认为 `Coupled` 热边界，此时绝不需要人为强给外部 h，流固耦合会自动解算壁面连续的温差与热流。',
    ],
    cfdConnections: [
      {
        label: 'Wall Boundary Thermal 三类边界与流固耦合位置',
        to: '/fluent-guide?locate=bc-wall',
        note: '在 Fluent Wall 对话框 Thermal 标签核对 Temperature / Heat Flux / Convection',
      },
      {
        label: 'Cell Zone 体积内热源 Source Terms 输入',
        to: '/fluent-guide?locate=cell-zone-source',
        note: '核对 Solid / Fluid 单元区域内体积热源强度 (W/m³) 的输入方式',
      },
    ],
    quiz: {
      id: 'quiz-ht-pde-1',
      question: '两块几何尺寸完全一模一样、处于稳态（∂T/∂t = 0）且无内热源（Φ̇ = 0）的大板分别用铜和塑料制成，当左右边界全部给定完全相同的第一类等温边界 Tw1 和 Tw2 时，两板内部各点的温度分布形态如何？',
      options: [
        '铜内部各处温度高，塑料梯度缓',
        '两块板内部每一点的无量纲温度分布 T(x,y) 完全一模一样（只由几何与 Tw 决定），与 λ 毫无关系！（仅导热流 Q 大小成倍差异）',
        '塑料由于导热差内部会出现温度极大值隆起',
        '必须先给对流系数 h 才能算温度分布',
      ],
      correctIndex: 1,
      explanation:
        '当稳态且无内热源时偏微分方程退化为拉普拉斯方程 ∇²T = 0，材料物性参数 λ 被消掉了！第一类边界也没含 λ，故只决定总传热量 Q（铜是塑料成百上千倍），而内部温度场形态彻底重合。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-pde-2',
        question: '在热工实验和 Fluent 设置中，“绝热边界条件（∂T/∂n = 0，法向绝热对称面）”本质上是下列哪类边界条件的特例？',
        options: [
          '第一类边界条件（等温 Tw = 0）',
          '第二类边界条件（给定热流密度的特例 qw = 0）',
          '第三类边界条件（h = ∞）',
          '混合对流体积力条件',
        ],
        correctIndex: 1,
        explanation:
          '由傅里叶定律 qw = -λ (∂T/∂n)，指定壁面热通量等于零正是第二类 Neumann 边界条件的经典零通量特例；任何物理对称面必定也严格满足零热量穿越。',
      },
    ],
    keywords: ['导热微分方程', '边界条件', '第一类边界', '第二类边界', '第三类边界', '内热源', '绝热', 'laplace'],
  },
  {
    id: 'ht-unsteady-conduction',
    courseId: 'heat-transfer',
    chapter: '第 4 章 · 非稳态热传导',
    moduleGroup: '模块二 · 非稳态导热与对流换热规律',
    title: '非稳态导热、毕渥数 Bi 与集总参数法',
    englishTitle: 'Transient Conduction, Biot Number & Lumped Capacitance',
    difficulty: '进阶',
    summary:
      '零件淬火、炉膛升温与冷库预冷都涉及物体内部温度随时间持续演化。毕渥数 (Bi) 判定物体内部自身是否允许“等温近似（集总参数）”，傅里叶数 (Fo) 则扮演无量纲时间轴，决定导热扩散进行的深度。',
    prerequisites: ['ht-steady-conduction', 'ht-conduction-pde-bc'],
    relatedTopicIds: ['ht-convection-similarity'],
    keyPoints: [
      '毕渥数 Bi = h·Lc / λ 物理本质上是“物体内部导热热阻”与“表面外部对流换热热阻”的比值。',
      '当 Bi < 0.1 时，物体内部温差极小（< 5%），整个固体可近似视为处处同一均匀温度 T(t) 仅随时间按负指数规律衰减——即极度简化的集总参数法（Lumped Capacitance Method）。',
      '工程热特征时间常数 τ_th = ρ·V·c / (h·A) 表征物体温度变化速度的滞后惯性：大比热大体积低对流系数对应极长热响应时间。',
      '傅里叶数 Fo = α·t / Lc²（热扩散系数 α = λ/(ρc)）是无量纲时间，反映了从 t=0 起热扰动已渗透并波及多大范围的几何尺度。',
    ],
    formulas: [
      {
        title: '毕渥数与傅里叶数无量纲准则',
        latex: '\\mathrm{Bi} = \\frac{h L_c}{\\lambda}, \\qquad \\mathrm{Fo} = \\frac{\\alpha t}{L_c^2} = \\frac{\\lambda t}{\\rho c L_c^2} \\qquad (L_c = \\frac{V}{A_s})',
        meaning: '特征长度常取物体总体积除以表面积 Lc = V / As；二者共同决定非稳态内部温度场的演化快慢。',
        symbols: [
          { symbol: 'L_c', meaning: '特征几何尺度（平板半厚 / 球半径 / V/As）', unit: 'm' },
          { symbol: 'α', meaning: '材料热扩散率（导温系数）α = λ/(ρc)', unit: 'm²/s' },
        ],
        conditions: '集总参数简化要求 Bi < 0.1；Bi 很大时物体表面与芯部出现剧烈温度梯度（如高温大型铸件淬火开裂机理）。',
      },
      {
        title: '集总参数法指数降温解析解',
        latex: '\\frac{T(t) - T_\\infty}{T_0 - T_\\infty} = \\exp\\left(-\\frac{h A_s}{\\rho V c} t\\right) = \\exp(-\\mathrm{Bi} \\cdot \\mathrm{Fo})',
        meaning: '物体过余温度随时间呈指数规律趋向环境流体温度 T∞，时间达 3 倍时间常数后约已完成 95% 换热。',
        conditions: '常物性、恒定环境温度 T∞、且 Bi < 0.1。',
      },
    ],
    workedExample: {
      title: '例题：高温铝球风冷降温集总检验与所需时间计算',
      scenario: '直径 D = 60 mm（半径 R = 0.03 m）的铝合金球（λ = 180 W/(m·K), ρ = 2700 kg/m³, c = 900 J/(kg·K)）从初始温度 T₀ = 200 °C 置于 T∞ = 25 °C 的冷却气流中（对流系数 h = 60 W/(m²·K)）。校验能否使用集总法，并求铝球凉至 60 °C 所需的物理时间 t。',
      given: ['Lc = V/A = R/3 = 0.01 m', 'h = 60, λ = 180', 'T₀ = 200 °C, T∞ = 25 °C, T = 60 °C'],
      steps: [
        '校验毕渥数：Bi = h·Lc / λ = 60 × 0.01 / 180 = 0.00333 << 0.1 ⇒ 极优地满足集总等温近似。',
        '热时间常数：τ_th = (ρ·c·Lc)/h = (2700 × 900 × 0.01) / 60 = 405 s。',
        '由温度衰减公式：(60 - 25)/(200 - 25) = 35/175 = 0.2 = exp(-t / 405) ⇒ t = -405 × ln(0.2) ≈ 405 × 1.6094 ≈ 652 s（约 10.9 min）。',
      ],
      answer: 'Bi = 0.0033（适用集总法），降温至 60 °C 耗时约 652 s',
      takeaway: '记住时间常数 ρcLc/h 估算规律，哪怕不用手算解指数，经过 1τ_th 降掉 63.2% 温差，经过 3τ_th 基本完成 95% 冷却！',
    },
    engineeringTips: [
      '“不要把固体导热系数的 Bi 和流体热工计算的 Nu 弄混！”二者形式看似都是 hL/λ，但 Bi 中的 λ 是“固体材料本身导热系数”，Nu 中的 λ 则是“边界贴附流体的导热系数”。',
      '评估非稳态瞬态 CFD（如流体冷却热铸铁块）所需模拟总物理时长时，先用时间常数 τ_th = ρVc/(hAs) 估算出总冷却耗时，再配合固体 Fo 决定时间步长，避免盲跑几千步也等不到热稳态。',
    ],
    cfdConnections: [
      {
        label: 'Biot 数计算器',
        to: '/calculators/heat-transfer/biot-number',
        note: '检验物体是否满足 Bi < 0.1 集总近似',
      },
      {
        label: 'Fourier 数计算器',
        to: '/calculators/heat-transfer/fourier-number',
        note: '估算瞬态加热/冷却需要的无量纲导热扩散时间',
      },
    ],
    quiz: {
      id: 'quiz-ht-unsteady-1',
      question: '直径相同的一个实心紫铜球（λ ≈ 380 W/(m·K)）与一个耐火陶瓷球（λ ≈ 1.5 W/(m·K)），从 500 °C 一起放入同一剧烈搅拌油槽中冷却，哪一个更适合直接套用集总参数法预测中心温度？',
      options: [
        '陶瓷球，因为其 Bi 极大，芯部几乎没有温差',
        '紫铜球，因为高导热使铜球内部热阻极小（Bi << 0.1），内外温度几乎一致',
        '二者相同，只取决于外部油流 h 和半径',
        '二者都不行，搅拌油冷时任何球都不适用集总参数',
      ],
      correctIndex: 1,
      explanation:
        '由于 Bi = h·(R/3)/λ_solid，紫铜的 λ_solid 比陶瓷高出 200 多倍，因此铜球 Bi 极小更容易低于 0.1 满足内部均匀等温假设；陶瓷球芯部温度滞后表面非常明显，严禁直接使用集总法。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-unsteady-2',
        question: '热电偶测温珠需要能瞬态敏感跟上气流快速脉冲温度变化（减小热滞后误差），根据集总时间常数 τ_th = ρ·c·Lc / h，工业设计最直接有效的改善措施是？',
        options: [
          '尽量做大热电偶保护套管壁厚（增大 Lc）',
          '采用微细裸露焊珠减小特征尺度 Lc = V/A 并置于较高气流速度区（提高 h）',
          '选用热容量和比热极大的厚陶泥裹住测头',
          '降低周围流速减小对流换热系数',
        ],
        correctIndex: 1,
        explanation:
          '响应快慢正比于 1/τ_th；把传感器热珠微型化减低热容比 ρcLc 并增大表面对流系数 h，能把热响应时间压到几十毫秒级。',
      },
    ],
    keywords: ['非稳态导热', '毕渥数', '傅里叶数', '集总参数法', '热扩散率', '时间常数', 'biot', 'fourier'],
  },
  {
    id: 'ht-convection-similarity',
    courseId: 'heat-transfer',
    chapter: '第 5 章 · 对流换热相似原理',
    moduleGroup: '模块二 · 非稳态导热与对流换热规律',
    title: '对流换热边界层与无量纲准则数（Nu / Pr / Gr / Ra）',
    englishTitle: 'Convection Similarity & Dimensionless Numbers',
    difficulty: '进阶',
    summary:
      '对流换热本质上同时耦合流体流动与导热输运，无法靠单一解析公式解决所有工况。借助相似原理整理出的 Nu、Re、Pr、Gr、Ra 无量纲数，让我们能够将实验关联式从缩比试验外推到真机换热器设计。',
    prerequisites: ['fm-boundary-layer', 'ht-unsteady-conduction'],
    relatedTopicIds: ['ht-internal-external-natural', 'fm-dimensional-similarity'],
    keyPoints: [
      '努塞尔数 Nu = h·L / λ_fluid 表征壁面层内纯对流相对于同厚度静止流体导热的强弱程度，是求算未知对流系数 h 的最终目标输出。',
      '普朗特数 Pr = ν / α = μ·cp / λ 只取决于流体自身物性，表征动量扩散（速度边界层 δ）相对于热量扩散（热边界层 δ_t）的相对厚度。',
      '格拉晓夫数 Gr 与瑞利数 Ra = Gr·Pr 度量自然对流中温差浮升力与粘性阻力之比，主导无风机机柜、暖气片散热及密闭空腔的自然对流流型转捩。',
      '工程经验关联式（例如管内强制对流 Dittus-Boelter 关系式）具有严格限制条件，使用前必须逐项核对定性温度、Re/Pr 区间以及壁温差大小。',
    ],
    formulas: [
      {
        title: '对流四大核心准则数表达式',
        latex: '\\mathrm{Nu} = \\frac{h L}{\\lambda_f}, \\quad \\mathrm{Pr} = \\frac{\\nu}{\\alpha} = \\frac{\\mu c_p}{\\lambda_f}, \\quad \\mathrm{Gr} = \\frac{g \\beta \\Delta T L^3}{\\nu^2}, \\quad \\mathrm{Ra} = \\mathrm{Gr}\\cdot\\mathrm{Pr}',
        meaning: '分别揭示壁面换热增强比、物性双扩散率之比，以及自然对流浮升/粘性驱动相对强度。',
        symbols: [
          { symbol: 'λ_f', meaning: '注意此处的 λ_f 为流体导热系数', unit: 'W/(m·K)' },
          { symbol: 'β', meaning: '流体体积膨胀系数（理想气体 β = 1/T）', unit: '1/K' },
          { symbol: 'ΔT', meaning: '壁面与环境流体温差 |Tw - T∞|', unit: 'K' },
        ],
        conditions: 'Gr/Ra 中的定性尺寸 L 与流道/竖壁朝向密切相关（竖板取高度 H，水平圆柱取直径 D）。',
      },
      {
        title: '【参考示例】管内充分发展湍流 Dittus-Boelter 经验关联式',
        latex: '\\mathrm{Nu} = 0.023\\,\\mathrm{Re}^{0.8}\\,\\mathrm{Pr}^{n} \\quad (n=0.4\\text{ 加热},\\; n=0.3\\text{ 冷却})',
        meaning: '最常用的工程管内湍流强制换热经验关联式（用于快速手算预估并对照 CFD 校核）。',
        conditions: '适用边界限定：光滑圆管、0.6 ≤ Pr ≤ 160、Re ≥ 10,000、L/D ≥ 10，且流体与壁面温差适中（大温差粘流需加物性修正；极高精度/超临界区需另选专门关联式）。',
      },
    ],
    comparisonTable: {
      caption: '常见流体普朗特数 Pr 分布与速度/热边界层匹配规律',
      headers: ['流体种类', '典型 Pr 数量级', '边界层相对厚度 (δ / δt)', '典型工程特征'],
      rows: [
        ['液态金属（液钠、汞等）', '0.004 ~ 0.03', 'δ << δt（热扩散极大）', '热量极易穿透流场深处，即使层流对流也强；Fluent 湍流 Prt 不能直接用 0.85 常规默认值！'],
        ['常规双原子气体（空气）', '≈ 0.70 ~ 0.72', 'δ ≈ δt（二者厚度近同）', '速度和温度边界层几乎齐头并进（雷诺类比基础）'],
        ['水（常温~热水）', '1.7 ~ 13', 'δ > δt（热边界层偏薄）', '近壁温降集中，对流 CFD 传热对 y+ ≤ 1 较气体更敏感！'],
        ['矿物润滑油 / 乙二醇', '50 ~ 10,000', 'δ >> δt（热边界层极薄）', '高粘性导致极薄热边界层，急需加密壁面贴体网格'],
      ],
    },
    workedExample: {
      title: '例题：用 Dittus-Boelter 关联式估算水冷管道管内对流换热系数 h',
      scenario: '冷水以 Re = 30,000 流经内径 D = 25 mm 光滑直铜管并被管壁加热（水侧物性按定性平均温取 λ_f = 0.61 W/(m·K), Pr = 6.0, L/D = 80），估算管内充分发展对流表面换热系数 h。',
      given: ['Re = 3×10⁴ ≥ 10⁴', 'Pr = 6.0 (加热 n = 0.4)', 'λ_f = 0.61 W/(m·K)', 'D = 0.025 m'],
      steps: [
        '先校验关联式条件：光滑长圆管 L/D = 80 > 10, Re = 30,000 > 10,000，0.6 ≤ Pr ≤ 160，全部满足适用区。',
        '计算努塞尔数：Nu = 0.023 × (30000)^0.8 × (6.0)^0.4 ≈ 0.023 × 3816.7 × 2.0477 ≈ 179.7。',
        '反算对流换热系数：h = Nu · λ_f / D = 179.7 × 0.61 / 0.025 ≈ 4,385 W/(m²·K)。',
      ],
      answer: 'Nu ≈ 179.7，管内水侧 h ≈ 4,385 W/(m²·K)',
      takeaway: '水冷管内强对流轻松达到 4000+ W/(m²·K)，比空气高出两个数量级，这就是冷板液冷取代风冷压制高热流芯片的物理学底层来源。',
    },
    engineeringTips: [
      '在 Fluent 做水/高 Pr 流体耦合换热仿真时，往往需要比空气更严格地把第一层 y+ 压低到 1 左右，否则无法兜住极薄的热边界层 δ_t，算出的努塞尔数 Nu 会系统性虚高！',
      '混合对流判定准则：比较 Gr / Re²；远小于 0.1 时可忽略重力自然对流（纯强制对流），在 0.1 ~ 10 之间时必须同时开启重力与浮升耦合模型。',
    ],
    cfdConnections: [
      {
        label: 'Nusselt / Prandtl / Grashof / Rayleigh 计算器',
        to: '/calculators/dimensionless-numbers/nusselt-number',
        note: '前往无量纲数计算集群换算 Nu、Pr、Pe、Gr 与 Ra',
      },
      {
        label: '对流换热基本关系计算器',
        to: '/calculators/heat-transfer/convective-heat-transfer',
        note: '结合壁温差与换热量反算 h',
      },
    ],
    quiz: {
      id: 'quiz-ht-conv-1',
      question: '对于高普朗特数（Pr >> 1，如 80 的重油）沿光滑平板稳定受迫流动，速度边界层厚度 δ 与温度边界层厚度 δ_t 之间的相对大小关系是？',
      options: [
        '速度边界层明显厚于温度边界层（δ > δt）',
        '速度边界层明显薄于温度边界层（δ < δt）',
        '二者始终完全相等',
        '与流动速度无关且无法对比',
      ],
      correctIndex: 0,
      explanation:
        'Pr = ν / α 代表动量扩散系数 ν 与热扩散系数 α 之比。当 Pr >> 1 时动量比热量扩散得深远得多，故 δ/δt ≈ Pr^(1/3) >> 1，温度变化全部被束缚在紧贴壁面的一层极薄区域内。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-conv-2',
        question: '在 Fluent 中评估一个受迫水冷竖直槽道内“热浮升力（自然对流）能不能忽略不计”时，需要检视哪两个无量纲准数构成的比值（理查森数 Ri = Gr / Re²）？',
        options: [
          '当 Gr / Re² << 0.1 时可安然视作纯强制对流略去浮升力',
          '当 Gr / Re² >> 10 时可安全略去浮升力',
          '只要管壁导热低就能略去自然对流',
          '无论流速多慢，所有水流均可略去重力浮升项',
        ],
        correctIndex: 0,
        explanation:
          'Gr 度量浮升力、Re² 度量惯性力，Gr/Re² << 0.1 说明惯性受迫主导；反之高热壁温低流速下比值接近或超过 1，必须开启重力及密度变温模型。',
      },
    ],
    keywords: ['努塞尔数', '普朗特数', '格拉晓夫数', '瑞利数', '对流换热', 'Dittus-Boelter', '边界层'],
  },
  {
    id: 'ht-internal-external-natural',
    courseId: 'heat-transfer',
    chapter: '第 6 章 · 管内、外掠管束与自然对流工程',
    moduleGroup: '模块二 · 非稳态导热与对流换热规律',
    title: '管内层流/入口效应、外掠管束及自然对流工程规律',
    englishTitle: 'Internal Ducts, Tube Banks & Natural Convection Regimes',
    difficulty: '工程应用',
    summary:
      '对流换热计算高度依赖于流道几何特征与流动形态：热入口段传热显著高过充分发展段，光滑圆管与扁平芯片微通道存在等壁温与等热流理论差异，外掠错排管束因强烈尾流冲击显着优于顺排，而密闭狭缝腔体的自然对流存在临界抑制 Rayleigh 阈值。',
    prerequisites: ['ht-convection-similarity', 'fm-external-drag-lift'],
    relatedTopicIds: ['ht-heat-exchangers', 'ht-enhancement-numerical'],
    keyPoints: [
      '入口段效应 (Entrance Effect)：管内刚刚进流截面速度与热边界层刚起步（厚度近乎零），导致局部表面传热系数 h_x 极高并随距离增长渐近衰减至充分发展段常值。',
      '在充分发展光滑圆管“纯层流”条件下存在两大著名解析定常解：恒定热通量 (qw = const) 对应 Nu = 4.364，而恒定壁温 (Tw = const) 对应 Nu = 3.657！（与流速和 Re 无关！）。',
      '交叉掠过管束（如省煤器、空冷翅片管束、管壳式换热器）：错排（叉排）布置使后排管处于前排激涡与窄喉加速直冲路径中，因此整体换热效率明显高于顺排布置，但压降也随之升高。',
      '封闭夹层（如双层玻璃中空窗或光伏隔热夹层）内的自然对流：当基于层宽的 Rayleigh 数 Ra_δ < 1708（下热上冷水平夹层）时，粘性制止浮升对流启动，纯静止导热即 Nu = 1！',
    ],
    formulas: [
      {
        title: '充分发展光滑圆管纯层流理论解析 Nu 基准（可用于校准 CFD 基准）',
        latex: '\\mathrm{Nu}_{\\text{lam}, T_w=\\text{const}} = 3.657, \\qquad \\mathrm{Nu}_{\\text{lam}, q_w=\\text{const}} = 4.364',
        meaning: '这两组严密数学推导的精确常数为工程检验稳态层流微通道液冷散热板与数值传热格式精度提供绝对黄金参考解。',
        conditions: '牛顿流体、充分发展抛物线速度型与热发展型（Re < 2300，忽略粘性耗散与轴向导热）。',
      },
    ],
    comparisonTable: {
      caption: '常见对流换热构型工程特征与选型注意事项速查',
      headers: ['对流几何场景', '主导特征与流态特点', '实用选型与 CFD 建模核心建议'],
      rows: [
        ['圆管/微通道纯层流', '充分发展段 Nu 仅由截面几何和边条件（3.66 vs 4.36）决定', '想在芯片液冷进一步提升散热系数必须切分为短窄流道靠“入口段效应”或折弯微肋打破层流稳定边界层'],
        ['横掠单管 vs 管束（顺排/叉排）', '第 1 排至第 3 排受上游湍流扰动激升，第 4 排起才基本趋稳', '对换热强烈要求且允许稍大压降选叉排；含高浓度灰尘烟气易堵垢需要机械吹灰清理时只能选顺排'],
        ['竖直壁面大空间自然对流', '随 Ra = Gr·Pr 跨过约 10⁹ 由层流边界层自然转捩为湍流', '必须严格保持开放自然流边界（Pressure Inlet/Outlet 与恰当环境回流温），严禁把域箱框画得离发热体太近卡死引风！'],
        ['底部加热水平封闭夹层', 'Ra < ~1708 纯静止导热 (Nu=1)；超过阈值呈现规则贝纳德对流胞', '中空隔热玻璃利用窄间隙把 Ra 死锁在 1708 以下正是其彻底扼杀对流漏热的物理秘诀'],
      ],
    },
    engineeringTips: [
      '用 CFD 仿真自然对流散热（如户外机箱、变压器油箱或室内暖气片）时，一定要把周边自由空气域扩展到特征物尺寸的 5–10 倍大并设定正确重力方向，而且流场往往存在轻度振荡，如果用纯常密度+温度不兼容模型容易不收敛——应首选 Boussinesq 近似（小温差 < 20 K）或 Incompressible Ideal Gas（大温差）。',
      '微通道硅冷板如果管长很短、通道直径仅零点几毫米，绝大部分流道依然处在热入口发展段（Nu 远远高于 4.36），直接套用“充分发展段公式”往往低估实际液冷换热表现！',
    ],
    cfdConnections: [
      {
        label: 'Rayleigh 数计算器（自然对流流态判定）',
        to: '/calculators/dimensionless-numbers/rayleigh-number',
        note: '估算大空间自然对流是否已进入湍流或突破静止导热阈值',
      },
      {
        label: 'Grashof 数与浮力对流强度计算器',
        to: '/calculators/dimensionless-numbers/grashof-number',
        note: '求解浮力项相对强弱以判断是否需启用 Boussinesq 模型',
      },
    ],
    quiz: {
      id: 'quiz-ht-internal-1',
      question: '一台尺寸微型化的实验室圆管芯片散热器工作在稳态充分发展层流工况下（Re = 600 < 2300）。如果维持冷却液物性和管道尺寸不变、仅将水泵流量再翻倍变为 Re = 1200（仍然充分发展层流且恒定热流边界），请问管内充分发展段对流换热系数 h 会如何改变？',
      options: [
        '随之精准翻倍，因为流速越高传热必增',
        '基本维持在 Nu = 4.364 不变，仅热入口发展段会相对变长！',
        '剧烈下降至原来一半',
        '立刻变为湍流关联式 Nu ∝ Re^0.8',
      ],
      correctIndex: 1,
      explanation:
        '十分反直觉但极为重要的传热学结论：光滑圆管充分发展纯层流的努塞尔数严格恒定在 4.364（恒热流）或 3.657（恒壁温），h = Nu·λ/D 与流速毫不相干！（流速提高仅压缩了温升 ΔT 并拉长了前端入口段）。若要让高流速大幅拔高充分发展 h，唯有减小管径 D 或打破层流进湍流/微肋扰流！',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-internal-2',
        question: '在烟气余热锅炉和空气预热器管束布置中，将受热管从“顺排”改为几何管间距不变的“叉排（错排）”时，管外换热和烟气侧压降通常会怎么变化？',
        options: [
          '换热系数减小，压降减小',
          '换热增强但烟气侧压降随之明显增大，同时清洗吹灰难度高于顺排',
          '换热大幅增强而压降反而更低',
          '二者完全一致无任何区别',
        ],
        correctIndex: 1,
        explanation:
          '叉排迫使流体反复绕流弯曲并让后排壁面迎面挨着前排高湍动主流挤压冲击，强力减薄边界层进而明显增强外侧换热，代价则是形体尾涡损失推高流动压降。',
      },
    ],
    keywords: ['入口段效应', '层流Nu', '管束', '叉排', '顺排', '自然对流', 'Rayleigh', '微通道'],
  },
  {
    id: 'ht-phase-change-radiation',
    courseId: 'heat-transfer',
    chapter: '第 7 章 · 相变传热与热辐射',
    moduleGroup: '模块三 · 相变辐射、换热器与数值强化传热',
    title: '沸腾/凝结相变传热与灰体表面辐射换热',
    englishTitle: 'Boiling, Condensation & Surface Thermal Radiation',
    difficulty: '工程应用',
    summary:
      '汽化潜热使沸腾与凝结能够达到常规单相换热十倍至百倍的惊人热通量，但过高热流会触发膜态沸腾烧毁危机；而炉膛、航天与电热真空腔等高温环境则由灰体多表面辐射热阻网络主宰。',
    prerequisites: ['ht-three-modes', 'ht-convection-similarity'],
    relatedTopicIds: ['ht-heat-exchangers', 'ref-vapor-compression', 'ref-expansion-heat-exchangers'],
    keyPoints: [
      '大容器池沸腾随壁面过热度 ΔTe = Tw - Tsat 升高依次经历：自然对流 → 核态沸腾（高强效、安全工作区） → 临界热通量 CHF 拐点 → 过渡与危险膜态沸腾。',
      '工业冷暖冷凝器中，蒸汽呈“膜状凝结”居多（液膜导热主导阻力，故竖管往往比长卧管蓄水膜薄或采用低肋排液）；“珠状凝结”换热效率远高于膜状但难以长期稳定维持。',
      '热平衡时，任何灰体表面的发射率与吸收率严格相等（ε = α，基尔霍夫定律），而多表面封闭腔辐射角系数 F_ij 满足完整性（∑F_ij = 1）与互易性（Ai F_ij = Aj F_ji）。',
      '对封闭系统表面做辐射换热量分析可构建包含“表面辐射热阻 (1-ε)/(εA)”与“空间几何热阻 1/(Ai F_ij)”的网络图。',
    ],
    formulas: [
      {
        title: '双大平壁/封闭腔典型双表面灰体辐射净换热量',
        latex: 'Q_{12} = \\frac{\\sigma (T_1^4 - T_2^4)}{\\frac{1 - \\varepsilon_1}{\\varepsilon_1 A_1} + \\frac{1}{A_1 F_{12}} + \\frac{1 - \\varepsilon_2}{\\varepsilon_2 A_2}}',
        meaning: '明确由表面 1 自身热阻、两表面间空间角系数热阻以及表面 2 热阻串联组成的辐射净热流。',
        symbols: [
          { symbol: 'T_1, T_2', meaning: '两灰体表面的热力学温度', unit: 'K' },
          { symbol: 'ε_1, ε_2', meaning: '两表面漫灰发射率', unit: '无量纲' },
          { symbol: 'F_{12}', meaning: '表面 1 对表面 2 的辐射角系数', unit: '无量纲' },
        ],
        conditions: '等温、漫反射灰体表面，中间介质为透明不吸收不发射气体（如常压干燥 N2/O2）。',
      },
    ],
    workedExample: {
      title: '例题：高温双平壁插入薄金属辐射遮热板的效果核算',
      scenario: '两块面积极大的平行灰体平板温度分别固定于 T₁ = 800 K 和 T₂ = 400 K（两者发射率 ε₁ = ε₂ = 0.8）。如果在正中插入一块两面发射率极低的抛光铝箔遮热板（ε_s = 0.05），比较插板前后两平板间净辐射热流密度降低到原来的百分比。',
      given: ['两无限大平壁角系数 F₁₂ = 1', '1/ε₁ + 1/ε₂ - 1 = 1/0.8 + 1/0.8 - 1 = 1.5', '1/ε₁ + 1/ε_s - 1 = 1/0.8 + 1/0.05 - 1 = 20.25'],
      steps: [
        '未插板时，总无量纲辐射热阻因子 R₀ = 1/ε₁ + 1/ε₂ - 1 = 1.5。',
        '插入发射率 ε_s = 0.05 遮热板串联了上下两段（1→s 与 s→2），总串联热阻因子 R_new = (1/0.8 + 1/0.05 - 1) + (1/0.05 + 1/0.8 - 1) = 20.25 + 20.25 = 40.5。',
        '新旧热流密度比例：q_new / q_0 = R_0 / R_new = 1.5 / 40.5 = 1 / 27 ≈ 3.7%！（热漏降幅高达 96.3%）。',
      ],
      answer: '净辐射换热量降为未插板前的 3.7%（削弱 27 倍）',
      takeaway: '多层高反射铝箔隔热屏正是利用多道极低发射率串联表面辐射热阻打造真空深冷与高温航天绝热的终极防线！',
    },
    engineeringTips: [
      '核态沸腾设备（如反应堆芯、电子高热流蒸发冷却器）设计热通量务必与临界热通量 (CHF) 保持充足安全裕度，防止蒸气膜裹覆表面引起传热瞬间骤降与壁温飞升熔毁（Burnout）。',
      'Fluent Radiation 模型选用准则：不透明密闭多表面间透明空气辐射首选 S2S（预计算角系数超快）；存在烟气/水蒸气吸收参与性介质、高温喷嘴火焰或需支持任意形状局部透明面首选 DO（离散坐标）。',
    ],
    cfdConnections: [
      {
        label: 'Fluent Radiation Model 辐射模型选择面板',
        to: '/fluent-guide?locate=models-radiation',
        note: '对比 DO、S2S、P1、Rosseland 等辐射模型的工程选型要点',
      },
    ],
    quiz: {
      id: 'quiz-ht-rad-1',
      question: '两块面积极大、正对放置的平行大灰体平板之间，若插入一块发射率很低（如抛光铝箔 ε = 0.05）的轻质薄辐射遮热板，忽略导热与对流漏热，辐射净传热量大约可降至未插板前的多少倍左右（假设原平板黑体 ε ≈ 1）？',
      options: [
        '几乎不变，因为金属薄板导热极快',
        '仅取决于铝箔厚度，越薄削弱越强',
        '暴跌到原来的一半再因低发射率进一步大幅锐减（< 3%）',
        '反倒升高一倍',
      ],
      correctIndex: 2,
      explanation:
        '插入一块 ε_s = 0.05 的遮热板会串联进两面表面热阻 2×(1-ε_s)/ε_s = 38 与两段空间热阻共 40 倍以上，将原空间净辐射热流骤压约 97% 以上！这是杜瓦液氮罐隔热层的核心物理机制。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-rad-2',
        question: '在大型蒸汽冷凝器设计里，为什么水平放置的冷凝管通常比同等长管竖直直立安装时拥有更高的表面凝结换热系数？',
        options: [
          '因为水平放置液滴立刻上浮离开壁面',
          '因为蒸汽膜状凝结的最大热阻就在贴壁液膜厚度；水平圆管重力液膜流下只需绕半圈短短管径距离即滴落，比顺着数米长竖管一路汇聚增厚得薄得多！',
          '因为水平管导热系数更高',
          '因为竖直管完全不能发生凝结',
        ],
        correctIndex: 1,
        explanation:
          '膜状凝结核心瓶颈在于壁面上那层液态凝结膜的导热热阻；短管径及时排泄下滴的水平排管液膜平均厚度远薄于长竖管末端积累的重厚液膜，因此工程冷凝器普遍卧式布置。',
      },
    ],
    keywords: ['核态沸腾', '临界热通量', 'CHF', '膜状凝结', '热辐射', '发射率', '角系数', '遮热板'],
  },
  {
    id: 'ht-heat-exchangers',
    courseId: 'heat-transfer',
    chapter: '第 8 章 · 换热器热力设计与校核',
    moduleGroup: '模块三 · 相变辐射、换热器与数值强化传热',
    title: '换热器设计：对数平均温差法 LMTD 与 ε-NTU 法',
    englishTitle: 'Heat Exchanger Analysis: LMTD & ε-NTU Methods',
    difficulty: '工程应用',
    summary:
      '工程换热器设计不仅要求算准当前截面传热系数 K，更必须沿流道积分跟踪冷热流体不断改变的温度曲线。逆流布置、对数平均温差 (LMTD) 与传热单元数 (ε-NTU) 是所有蒸发器、冷凝器和回热器计算的基础。',
    prerequisites: ['ht-three-modes', 'ht-convection-similarity'],
    relatedTopicIds: ['ht-enhancement-numerical', 'ref-subcool-superheat', 'ref-expansion-heat-exchangers'],
    keyPoints: [
      '对于同等进出口温度要求与传热面积，纯逆流 (Counterflow) 的对数平均温差 ΔTm 恒大于或等于顺流 (Parallel flow)；顺流时冷流体出口温度永远无法超过热流体出口温度。',
      '已知全套四个进出口温度（Th,in, Th,out, Tc,in, Tc,out）来算需要多大的面积 A 时，最直接的是用 LMTD 法：Q = K A ΔTm。',
      '对于已选定结构尺寸 A 和传热系数 K、仅知道入口温度却要预测换热器出口能降到几度（校核问题）时，用效能-传热单元数法 ε-NTU 无需繁琐试凑迭代即可一次性直接求出。',
      '长期服役后换热壁面不可避免会附着水垢、灰垢或油污，设计计算面积前必须按行业基准叠加冷热两面污垢热阻 Rf。',
    ],
    diagram: {
      kind: 'ht-heat-exchanger',
      caption: '顺流 (Parallel Flow) 与逆流 (Counterflow) 换热器沿程温度演变剖面对比',
      note: '逆流沿程两端温差分布更均匀且允许冷流体出口高于热流体出口，是获得高温度有效度与紧凑换热体积的首选流向布置。',
    },
    formulas: [
      {
        title: '对数平均温差 (LMTD) 与传热单元数 (NTU)',
        latex: '\\Delta T_m = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}, \\qquad \\mathrm{NTU} = \\frac{K A}{C_{\\min}}, \\qquad \\varepsilon = \\frac{Q}{C_{\\min}(T_{h,\\text{in}} - T_{c,\\text{in}})}',
        meaning: 'ΔT1、ΔT2 分别为换热器两端的冷热温差；C_min 为两股流体热容量流率 (m_dot·cp) 的较小者，决定最大可能传热量基准。',
        symbols: [
          { symbol: 'ΔT_1, ΔT_2', meaning: '换热器两端点各自的温差', unit: 'K 或 °C' },
          { symbol: 'C_{\\min}', meaning: 'min(m_dot_h·cp_h, m_dot_c·cp_c)', unit: 'W/K' },
          { symbol: 'ε', meaning: '换热器热效能 (Effectiveness, 0 ~ 1)', unit: '无量纲' },
        ],
        conditions: '稳态绝热外壳、常总传热系数 K、无沿程相变干湿变化段需另分段处理；交叉流/管壳式需引入修正因子 F（Q = K A F ΔTm_counterflow）。',
      },
    ],
    workedExample: {
      title: '例题：纯逆流油水换热器 LMTD 及所需传热面积快速设计',
      scenario: '需把热润滑油从 Th,in = 110 °C 冷却至 Th,out = 70 °C，放出的总热负荷 Q = 120 kW；冷水从 Tc,in = 20 °C 流入并被逆流加热到 Tc,out = 50 °C。已知综合设计总传热系数（已计污垢）K = 400 W/(m²·K)，计算所需传热面积 A。',
      given: ['逆流热端 ΔT₁ = 110 - 50 = 60 K', '逆流冷端 ΔT₂ = 70 - 20 = 50 K', 'Q = 120,000 W, K = 400 W/(m²·K)'],
      steps: [
        '计算对数平均温差：ΔT_m = (60 - 50) / ln(60/50) = 10 / 0.18232 ≈ 54.85 K（几乎与算术平均 55 K 相同）。',
        '反算所需传热面积：A = Q / (K · ΔT_m) = 120000 / (400 × 54.85) ≈ 5.47 m²。',
      ],
      answer: 'ΔT_m ≈ 54.85 K，所需传热面积 A ≈ 5.47 m²',
      takeaway: '一旦遇到其中一股发生定温冷凝或蒸发（如制冷冷凝器 Cr = Cmin/Cmax = 0），无论顺流、逆流还是交叉流，传热修正因子 F 严格等于 1，流向均等价！',
    },
    engineeringTips: [
      '当计算 ΔT1 ≈ ΔT2 时，ln(ΔT1/ΔT2) → 0/0 会出现数值除零误差，直接取算数平均温差 (ΔT1+ΔT2)/2 即可。',
      '换热器并不是 NTU 越大性价比就无限上升：超过 NTU > 3 后，效能 ε 的边际增量急剧趋平（进入“平台钝化区”），一味加倍铺设铜管长度往往得不偿失，反而大幅增加泵送压降功耗。',
    ],
    cfdConnections: [
      {
        label: 'Fluent 换热器宏观模型面板',
        to: '/fluent-guide?locate=models-heat-exchanger',
        note: '了解 Fluent Heat Exchanger 模型如何用 NTU 与效能表直接模拟复杂芯体',
      },
    ],
    quiz: {
      id: 'quiz-ht-hx-1',
      question: '需要将 90 °C 的热机油冷却到 50 °C，同时手头只有 20 °C 的冷却水且要求水出口被加热到 60 °C（两股流体均无相变）。能实现这一目标的最起码流动布置形式是什么？',
      options: [
        '纯顺流就能做到',
        '必须是逆流（至少部分逆流占优，纯顺流绝无可能实现）',
        '只要加厚换热管壁厚就能顺流做到',
        '顺流和逆流都能同样实现',
      ],
      correctIndex: 1,
      explanation:
        '冷流体出口达到 60 °C 已经高于热流体出口 50 °C（出现所谓的“温度交叉”）；顺流末端两条线共同趋向同一平衡值，永远无法出现冷端反超热端，因此必须采用逆流布置。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-hx-2',
        question: '当需要对一台“已经买回来定型制造完毕（面积 A 与结构已知）”的板式换热器更换更高温度入口水运行，用来校核计算它实际冷热端能达到多少出口温度时，应优先使用哪种方法？',
        options: [
          '仅用 LMTD 直接乘以四口均温',
          '效能-传热单元数法 (ε-NTU 法)，无需假定猜想出口温度反复迭代试凑！',
          '先假设出口等于入口',
          '采用集总参数毕渥法',
        ],
        correctIndex: 1,
        explanation:
          'ε-NTU 法只需输入已知热容量流率与面积就能立即直出效能 ε，进而一步算出冷热出口温度和总换热量，是校核变工况问题的标准利器。',
      },
    ],
    keywords: ['换热器', 'LMTD', '对数平均温差', 'NTU', '逆流', '顺流', '污垢热阻', '效能'],
  },
  {
    id: 'ht-enhancement-numerical',
    courseId: 'heat-transfer',
    chapter: '第 9 章 · 传热强化、接触热阻与数值传热基础',
    moduleGroup: '模块三 · 相变辐射、换热器与数值强化传热',
    title: '强化传热技术 (PEC 评价)、接触热阻与数值传热基础',
    englishTitle: 'Heat Transfer Enhancement, Contact Resistance & Numerical Basis',
    difficulty: '工程应用',
    summary:
      '芯片百瓦散热、超紧凑板翅散热器都在追求用最省体积与最省风机耗功换出最大散热。用传热强化综合评价指标 PEC 衡量增强传热 vs 暴增压降之得失，并避免被高界面接触热阻与假扩散误导 CFD 散热评估。',
    prerequisites: ['ht-heat-exchangers', 'ht-conduction-pde-bc'],
    relatedTopicIds: ['fm-navier-stokes', 'fm-boundary-layer', 'ht-internal-external-natural'],
    keyPoints: [
      '单相对流强化核心思想是“减薄边界层（如开槽微肋、锯齿翅片、纵向涡发生器）”及“场协同原理”——令流场速度矢量与温度梯度矢量之间的夹角尽可能逼近 0°（正交交叉最不利于传热）。',
      '没有任何不付出压降代价就能凭空大涨对流系数的强强化手段：等泵送功耗综合绩效评价因子 PEC = (Nu/Nu₀) / (f/f₀)^(1/3) 只有严格大于 1.0 才有真实节电工程收益。',
      '看似平整打磨的两块金属干压接触，真正在微观尺度下接触面积常不足 2%！界面空隙空气导热极差造成的“界面接触热阻 R_tc”甚至可以高出金属芯片基板本身导热阻，必须涂敷硅脂/相变导热界面材料 (TIM) 挤出空气。',
      '用有限体积数值模拟验证热工算例收敛，切忌只盯着残差曲线 1e-3！务必利用 Fluent Fluxes / Total Heat Transfer Rate 校验：全计算域输入加热总功率与所有冷热进出口热流差加壁面散失的绝对热不平衡度（常要求 < 0.1%~1%）。',
    ],
    formulas: [
      {
        title: '等泵送功率基准传热强化性能评估因子 (PEC)',
        latex: '\\mathrm{PEC} = \\frac{\\mathrm{Nu} / \\mathrm{Nu}_0}{\\left(f / f_0\\right)^{1/3}}',
        meaning: '直观权衡强化结构（例如涡流发生器、螺旋翅片）带来的 Nusselt 数增强收益与达西摩阻系数飙升带来的泵/风机惩罚。',
        symbols: [
          { symbol: '\\mathrm{Nu}/\\mathrm{Nu}_0', meaning: '强化通道相对于光管/光平壁基准的换热倍增比', unit: '无量纲' },
          { symbol: 'f / f_0', meaning: '强化结构对应阻力系数与光管摩阻比', unit: '无量纲' },
        ],
        conditions: '适用于维持泵送消耗机械功率相同作为公平工程基准的强化元件比较（PEC > 1 表明总体更优）。',
      },
    ],
    workedExample: {
      title: '例题：涡流扰流翅片传热强化综合绩效因子 PEC 判定',
      scenario: '某空气流道冷板加上斜肋扰流结构后，同雷诺数下 CFD/实验测得 Nusselt 数比原本的光滑直槽提高了 65%（Nu/Nu₀ = 1.65），但摩擦阻力系数飙升了 3.375 倍（f/f₀ = 3.375）。按等泵功耗评价指标计算 PEC 判断是否综合合算？',
      given: ['Nu / Nu₀ = 1.65', 'f / f₀ = 3.375'],
      steps: [
        '计算阻力惩罚三次方根因子：(f / f₀)^(1/3) = (3.375)^(1/3) = 1.50。',
        '代入 PEC 公式：PEC = 1.65 / 1.50 = 1.10 > 1.0。',
      ],
      answer: 'PEC = 1.10（总体合算，相同风机功率下净换热效率净增 10%）',
      takeaway: '不少粗糙扰流块虽让换热升了 1.4 倍但阻力暴涨到 5 倍（5^(1/3) ≈ 1.71 ⇒ PEC ≈ 0.82 < 1），在泵功受限下其实反而更差！必须用 PEC 双指标把关。',
    },
    engineeringTips: [
      'Fluent Wall 边界中有个极易忽略但非常工程化的选项 `Wall Thickness` 与接触材料属性：当贴片硅脂仅 0.1 mm 厚时，不要傻傻用几十万四面体硬划分这一层极扁狭缝！直接开启虚拟薄壁接触热阻（Thin-wall / Contact Resistance）即可等价精确复现温阶跳变。',
      '数值传热离散阶数建议：温度方程和能量传输至少必须打开 Second Order Upwind（二阶迎风），一阶格式极易在斜切交叉流里引起横向“数值假扩散”，让人误以为热混得很均匀。',
    ],
    cfdConnections: [
      {
        label: 'Fluxes 净热平衡总热流核对（能量收支检验）',
        to: '/fluent-guide?locate=ribbon-fluxes-report',
        note: '在 Reports / Fluxes -> Total Heat Transfer Rate 核对边界净出入热量是否闭环守恒',
      },
      {
        label: 'Solution Methods 二阶迎风离散格式配置',
        to: '/fluent-guide?locate=tree-methods',
        note: '在 Fluent Methods 中检查 Energy 与 Momentum 离散阶数设置',
      },
    ],
    quiz: {
      id: 'quiz-ht-num-1',
      question: '两块高精度金属铝散热冷板表面干压贴合在一起，为什么中间未填抹导热硅脂时常在实测中出现巨大的接触温度骤降台阶（Contact Temperature Drop）？',
      options: [
        '因为铝导热系数突然变低',
        '因为再平整的表面显微镜下也是微凸峰对撞，绝大多数界面缝隙被导热极差的滞止空气膜占据，形成了高“接触热阻”',
        '因为存在电磁感应加热',
        '因为表面发射率过高',
      ],
      correctIndex: 1,
      explanation:
        '干燥空气导热系数仅约 0.026 W/(m·K)，还不到铝的 1/7000！挤走空气填充柔顺高导热硅脂（λ ≈ 3–8 W/(m·K)）能成数量级砍掉微缝热阻。',
    },
    extraQuizzes: [
      {
        id: 'quiz-ht-num-2',
        question: '评判 Fluent 流固耦合换热稳态算例“是否已经真正达到可信任的物理热平衡”时，哪一条检查最为科学致命？',
        options: [
          '仅看 Continuity 残差掉到了 1e-3 就立刻停算看最高温度',
          '同时检视关键固体最高温监控线彻底拉平不再漂移 + Fluxes Report 中“热源投入功与边界进出口/壁面散走净热量”的相对误差收拢至 < 1%',
          '只要 Energy 残差达到 1e-4 即使固体温一直在缓慢上升也算完成',
          '只要多加网格肯定就是对的',
        ],
        correctIndex: 1,
        explanation:
          '大热容固体导热热扩散极慢，能量残差常常早早就看起来很低，而固体最高温度还在每百步持续攀升几度甚至几十度！必须同时核对目标温度平台稳定与边界净能量平衡收支守恒！',
      },
    ],
    keywords: ['强化传热', 'PEC', '场协同', '接触热阻', '热平衡', '假扩散', '硅脂', '数值传热'],
  },
]
