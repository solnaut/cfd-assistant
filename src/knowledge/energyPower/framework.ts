import type {
  EnergyCrossBridge,
  EnergyFrameworkLayer,
} from '../../models/energyKnowledge'

export const energyFrameworkLayers: EnergyFrameworkLayer[] = [
  {
    id: 'layer-conservation',
    tier: '第 1 层 · 物理守恒与状态基石',
    title: '微元守恒规律与物性状态体系',
    summary:
      '一切能源动力与流体设备都共同受控于质量、动量、能量守恒（热力学第一定律）及熵增方向规律（热力学第二定律），并由连续介质流变、理想/真实流体物性与导热/辐射基本定律闭合。',
    courseIds: ['fluid-mechanics', 'engineering-thermodynamics'],
  },
  {
    id: 'layer-transfer',
    tier: '第 2 层 · 边界层耦合与传热传质界面',
    title: '流场动量传递与热量/相变传递耦合',
    summary:
      '流体力学中的速度边界层（y+、层流转湍流）与传热学中的热边界层（Nu、Pr、Bi、Fo）同源耦合；压降摩阻往往与对流换热强化成伴生竞争关系，也是制冷/电厂换热器端差控制的关键。',
    courseIds: ['fluid-mechanics', 'heat-transfer'],
  },
  {
    id: 'layer-systems',
    tier: '第 3 层 · 动力/制冷装备与工程循环集成',
    title: '正向动力循环、逆向制冷热泵与 CFD 仿真映射',
    summary:
      '将泵/风机相似律、朗肯/布雷顿/内燃正向做功循环、蒸气压缩/吸收式/跨临界 CO₂ 逆向制冷热泵及换热器 LMTD/NTU 选型融会贯通，并直接映射至 Fluent 前处理网格与边界求解设定。',
    courseIds: ['engineering-thermodynamics', 'heat-transfer', 'refrigeration-principles'],
  },
]

export const energyCrossDisciplineBridges: EnergyCrossBridge[] = [
  {
    id: 'bridge-energy-balance',
    title: '机械能伯努利方程 vs 稳态开口热力学第一定律',
    description:
      '流体力学伯努利方程本质上是不可压缩绝热（或只计机械损）情况下开口系能量方程的特例；当高速可压缩或伴随显著传热/泵做功时，必须由机械能平衡回归完整的比焓总能量方程。',
    disciplines: ['fluid-mechanics', 'engineering-thermodynamics'],
    topicIds: [
      'fm-continuity-bernoulli',
      'td-first-law',
      'fm-turbomachinery-cavitation',
    ],
    cfdLink: {
      label: '对比 Fluent Pressure-Based 与 Energy 耦合',
      to: '/fluent-guide?locate=models-energy',
    },
  },
  {
    id: 'bridge-boundary-layer',
    title: '速度边界层 (y+) 与热边界层 (Nu / Pr) 耦合机制',
    description:
      'Prandtl 数直接决定动量扩散与热扩散的相对边界层厚度：水与油的高 Pr 流体热边界层远薄于速度边界层，因此对近壁网格 y+ ≤ 1 的解析要求比等温阻力计算更为苛刻。',
    disciplines: ['fluid-mechanics', 'heat-transfer'],
    topicIds: [
      'fm-boundary-layer',
      'ht-convection-similarity',
      'ht-internal-external-natural',
    ],
    cfdLink: {
      label: '打开 y+ 与第一层网格高度计算器',
      to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
    },
  },
  {
    id: 'bridge-throttling',
    title: '从热力学等焓节流效应到制冷膨胀阀闪发机理',
    description:
      '工程热力学中的“绝热开口节流 h₁ = h₂”与焦耳-汤姆逊系数直接解释了制冷技术中膨胀阀的工作本质：不消耗功却带来不可逆㶲损，也是跨临界 CO₂ 采用膨胀机/喷射器回收节流功的理论起因。',
    disciplines: ['engineering-thermodynamics', 'refrigeration-principles'],
    topicIds: [
      'td-first-law',
      'td-exergy-maxwell',
      'ref-vapor-compression',
      'ref-co2-load-control',
    ],
    cfdLink: {
      label: '进入温升/能量平衡估算计算器',
      to: '/calculators/heat-transfer/temperature-rise',
    },
  },
  {
    id: 'bridge-power-vs-ref',
    title: '正向动力卡诺/朗肯循环 vs 逆向制冷/热泵循环对偶体系',
    description:
      '顺时针运行的卡诺与朗肯循环把温差热能变为机械功（效率受限 1 - T₂/T₁）；逆时针驱动卡诺或蒸气压缩循环消耗轴功将热量由 T₀ 搬运至 Tk（制冷 COP = T₀/(Tk - T₀)，热泵 = ε + 1）。',
    disciplines: ['engineering-thermodynamics', 'refrigeration-principles'],
    topicIds: [
      'td-second-law-entropy',
      'td-water-vapor-rankine',
      'ref-principles-carnot',
      'ref-vapor-compression',
    ],
  },
  {
    id: 'bridge-hx-refrigeration',
    title: '换热器 LMTD / NTU 与制冷系统传热端差节能',
    description:
      '制冷冷凝温度与蒸发温度每偏离冷热环境 1 K，逆卡诺与压气机能效就跌落约 2%~3%。利用传热学热阻串联优化与逆流 LMTD/ε-NTU 扩面强化，是压缩机以外最核心的节能抓手。',
    disciplines: ['heat-transfer', 'refrigeration-principles'],
    topicIds: [
      'ht-three-modes',
      'ht-heat-exchangers',
      'ref-subcool-superheat',
      'ref-expansion-heat-exchangers',
    ],
    cfdLink: {
      label: '查看复合壁热阻计算器',
      to: '/calculators/heat-transfer/thermal-resistance',
    },
  },
  {
    id: 'bridge-moist-air-hvac',
    title: '湿空气焓湿处理、凝结相变与冷库除湿/结霜控制',
    description:
      '湿空气当壁温低于露点时在蒸发器表面发生冷表面结露与水蒸气凝结释潜热；低温冷库盘管更会进一步结霜形成高热阻保温层，迫使冷风机频繁进行热气或电热融霜循环。',
    disciplines: ['engineering-thermodynamics', 'heat-transfer', 'refrigeration-principles'],
    topicIds: [
      'td-gas-cycles-moist-air',
      'td-psychrometric-combustion',
      'ht-phase-change-radiation',
      'ref-co2-load-control',
    ],
  },
]
