import type { EnergyCourse } from '../../models/energyKnowledge'

export const energyCourses: EnergyCourse[] = [
  {
    id: 'fluid-mechanics',
    name: '流体力学',
    englishName: 'Fluid Mechanics',
    shortTag: '流动与 CFD 基础',
    tagline: '守恒微分方程、管路阻力、相似理论、边界层与叶轮机械',
    description:
      '系统梳理流体物性与静力学、三大宏观/微分守恒、雷诺数与管路压降、近壁边界层与 y+、可压缩激波、量纲分析 Π 定理、外流涡街以及泵/风机相似定律与汽蚀防护，打通经典流体力学与 Fluent 求解设定的底层逻辑。',
    themeClass: 'course-fluid',
    learningPath: [
      '模块一 · 静力学与三大守恒基础',
      '模块二 · 阻力损失、边界层与可压缩效应',
      '模块三 · 量纲相似、外流涡街与流体机械',
    ],
    modules: [
      {
        id: 'fm-mod-basics',
        title: '模块一 · 基础理论与三大守恒',
        summary: '建立连续介质假设、静力学压强分布、一维能量转换及微元体 Navier-Stokes 物理图像。',
        topicIds: ['fm-properties-statics', 'fm-continuity-bernoulli', 'fm-navier-stokes'],
      },
      {
        id: 'fm-mod-internal-bl',
        title: '模块二 · 管路阻力、边界层与高速流',
        summary: '打通层流/湍流流型判别、近壁面 y+ 网格解析准则与 Ma > 0.3 可压缩求解选择。',
        topicIds: ['fm-laminar-turbulent', 'fm-boundary-layer', 'fm-compressible-flow'],
      },
      {
        id: 'fm-mod-similarity-mach',
        title: '模块三 · 相似工程与流体机械应用',
        summary: '掌握模化试验Π定理、外流升阻力及卡门涡街频率估算、泵/风机变频曲线与汽蚀余量校核。',
        topicIds: ['fm-dimensional-similarity', 'fm-external-drag-lift', 'fm-turbomachinery-cavitation'],
      },
    ],
    coreCompetencies: [
      '能独立选用静压/动压/表压及流体黏度模型进行管网与边界条件换算',
      '能准确结合 Re、y+ 与 Ma 数确定 Fluent 湍流、边界层网格及密度基策略',
      '能运用相似定律、绕流特征与 NPSH 余量分析泵、风机与风洞缩比试验结果',
    ],
  },
  {
    id: 'engineering-thermodynamics',
    name: '工程热力学',
    englishName: 'Engineering Thermodynamics',
    shortTag: '热功转换与循环',
    tagline: '热力学一/二定律、㶲分析、动力循环、内燃与湿空气焓湿图',
    description:
      '围绕热力状态参数与理想气体方程、稳态开口能量方程、四大典型过程、卡诺极限与熵增、㶲分析与麦克斯韦关系、朗肯与布雷顿动力循环、多级压气机与内燃循环及湿空气焓湿图与燃烧热力核算展开，建立完整能量品位诊断框架。',
    themeClass: 'course-thermo',
    learningPath: [
      '模块一 · 状态参数与热力学第一定律',
      '模块二 · 熵增、㶲分析与蒸汽动力循环',
      '模块三 · 燃气/内燃循环与湿空气热力过程',
    ],
    modules: [
      {
        id: 'td-mod-laws',
        title: '模块一 · 基本概念、第一定律与典型过程',
        summary: '厘清状态参数与过程量、稳态开口系统五大典型简化及 p-v 多变过程做功对比。',
        topicIds: ['td-basic-concepts', 'td-first-law', 'td-typical-processes'],
      },
      {
        id: 'td-mod-entropy-exergy',
        title: '模块二 · 第二定律、㶲分析与朗肯循环',
        summary: '打通卡诺上限、熵产与古伊-斯托多拉㶲损定理、T-s 朗肯电厂循环与水蒸气相变特性。',
        topicIds: ['td-second-law-entropy', 'td-exergy-maxwell', 'td-water-vapor-rankine'],
      },
      {
        id: 'td-mod-cycles-moist',
        title: '模块三 · 动力机械循环与湿空气/燃烧',
        summary: '掌握燃机布雷顿循环、多级中冷压气机及奥托/狄塞尔内燃机、焓湿图过程与燃料燃烧核算。',
        topicIds: ['td-gas-cycles-moist-air', 'td-ic-engines-compressors', 'td-psychrometric-combustion'],
      },
    ],
    coreCompetencies: [
      '能对锅炉、透平、压气机与绝热节流阀迅速写出稳态开口能量平衡式',
      '能结合卡诺效率与㶲损失 (I = T0 S_gen) 诊断真实热工装备最大不可逆损耗部位',
      '能解读蒸汽朗肯、燃机布雷顿、内燃循环指标及湿空气焓湿图除湿加湿路线',
    ],
  },
  {
    id: 'heat-transfer',
    name: '传热学',
    englishName: 'Heat Transfer',
    shortTag: '导热·对流·辐射',
    tagline: '导热偏微分、Bi/Fo 非稳态、对流准则、相变辐射与强化传热',
    description:
      '全面涵盖三种基本传热机制与串联热阻网络、多层平壁/圆筒壁稳态导热、三维导热偏微分方程与三类边界条件、Bi/Fo 非稳态集总参数法、Nu/Pr/Gr/Ra 对流相似准则、管内/管束/自然对流规律、沸腾凝结与辐射角系数、换热器 LMTD/ε-NTU 及强化传热 PEC 指标。',
    themeClass: 'course-heat',
    learningPath: [
      '模块一 · 传热机理与稳态导热定解理论',
      '模块二 · 非稳态导热与对流换热准则框架',
      '模块三 · 相变辐射、换热器与数值强化传热',
    ],
    modules: [
      {
        id: 'ht-mod-conduction',
        title: '模块一 · 传热方式与稳态导热方程体系',
        summary: '建立串联热阻全局诊断视野，打通平壁、圆筒壁、临界绝热直径及偏微分三类边值条件。',
        topicIds: ['ht-three-modes', 'ht-steady-conduction', 'ht-conduction-pde-bc'],
      },
      {
        id: 'ht-mod-convection',
        title: '模块二 · 非稳态导热与对流换热规律',
        summary: '掌握 Bi/Fo 非稳态集总判据、对流相似准则数以及管流/外掠管束与自然对流关联框架。',
        topicIds: ['ht-unsteady-conduction', 'ht-convection-similarity', 'ht-internal-external-natural'],
      },
      {
        id: 'ht-mod-radiation-hx',
        title: '模块三 · 相变辐射、换热器与传热强化',
        summary: '贯通沸腾凝结与表面辐射热阻、LMTD / ε-NTU 换热器设计、场协同强化及数值网格检验。',
        topicIds: ['ht-phase-change-radiation', 'ht-heat-exchangers', 'ht-enhancement-numerical'],
      },
    ],
    coreCompetencies: [
      '能用串联热阻网络瞬间识别耦合散热系统中的限制环节并正确选定 CFD 边值条件',
      '能校验 Bi/Fo 与 Pr/Nu/Gr/Ra 无量纲范围，合理套用对流与导热经验关联式',
      '能完成顺流/逆流换热器 LMTD 与 ε-NTU 对比选型并兼顾强化换热与压降代价权衡',
    ],
  },
  {
    id: 'refrigeration-principles',
    name: '制冷技术原理',
    englishName: 'Principles of Refrigeration',
    shortTag: '逆循环与冷热装备',
    tagline: '逆卡诺、压焓图、过冷过热、压缩机/节流/换热与跨临界 CO₂',
    description:
      '从人工制冷本质与逆卡诺 COP 极限出发，精讲单级蒸气压缩制冷与 lg p-h 压焓图、液体过冷/吸气过热/回热、双级压缩与低温复叠、溴化锂与氨水吸收式及热泵、制冷剂 ODP/GWP 替代、四大压缩机输气特性、节流膨胀阀及蒸发冷凝匹配与跨临界 CO₂ / 冷库负荷与 IPLV 控制。',
    themeClass: 'course-ref',
    learningPath: [
      '模块一 · 制冷热力基础与压焓图循环调控',
      '模块二 · 多级复叠、吸收式与环保工质演进',
      '模块三 · 核心机械匹配、跨临界 CO₂ 与冷负荷控制',
    ],
    modules: [
      {
        id: 'ref-mod-thermo',
        title: '模块一 · 热力极限、压焓图与过冷过热',
        summary: '彻底掌握逆卡诺制冷/热泵极限公式、lg p-h 图热功读数及过冷增效/过热防液击机理。',
        topicIds: ['ref-principles-carnot', 'ref-vapor-compression', 'ref-subcool-superheat'],
      },
      {
        id: 'ref-mod-cycles',
        title: '模块二 · 双级复叠、吸收式与工质替代',
        summary: '覆盖低温双级与复叠制冷、余热驱动溴化锂/氨水吸收循环以及低 GWP 环保工质规则。',
        topicIds: ['ref-two-stage-cascade', 'ref-absorption-heatpump', 'ref-refrigerants-components'],
      },
      {
        id: 'ref-mod-equipment',
        title: '模块三 · 核心部件匹配与跨临界前沿控制',
        summary: '深入压缩机输气系数与防喘、膨胀阀/换热器结构选型、跨临界 CO₂ 及冷库 IPLV 负荷控制。',
        topicIds: ['ref-compressors-characteristics', 'ref-expansion-heat-exchangers', 'ref-co2-load-control'],
      },
    ],
    coreCompetencies: [
      '能在 lg p-h 压焓图上完整追踪制冷循环各态点并定量求解单位冷量、比功与 COP',
      '能根据温区与驱动能源合理选型单级、带经济器/双级、复叠及余热吸收式技术路线',
      '能诊断压缩机液击/排气过热、冷凝堵灰及跨临界 CO₂ 高压最优控制等工程运维问题',
    ],
  },
]
