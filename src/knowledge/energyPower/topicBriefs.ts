type Mechanism = {
  title: string
  nodes: [label: string, note: string][]
  layout: 'flow' | 'compare'
  note: string
  image?: { file: string; alt: string }
}

type TopicBrief = { takeaway: string; mechanism?: Mechanism }

export const energyTopicBriefs: Record<string, TopicBrief> = {
  'fm-properties-statics': {
    takeaway: '流动中的黏度决定剪切作用，静止液体中的压力差则由重力与液柱高度决定。',
    mechanism: { title: '同一种流体，两种受力图景', layout: 'compare',
      image: { file: 'hydrostatic-pressure.webp', alt: '密度近似恒定的静止液柱中，压力相对液面的增量随深度线性增大' }, nodes: [
      ['静止液柱', '沿深度加深，压力升高'],
      ['平板间剪切流', '相邻流层速度有差异，产生剪切应力'],
      ['读取所需物性', '静水压力用密度，牛顿流体的剪切还需要动力黏度'],
    ], note: '静水规律适用于静止流体。牛顿内摩擦定律将剪切应力与局部速度梯度相联系。' },
  },
  'fm-continuity-bernoulli': { takeaway: '先用质量守恒求流速，再用机械能方程核对压力、高程和损失。' },
  'fm-navier-stokes': { takeaway: '先划定控制体。进出动量流率的差与控制体所受的压力、黏性和体积力共同进入动量平衡。' },
  'fm-laminar-turbulent': {
    takeaway: '管路压降计算的第一步是识别流态，再选用与流态和粗糙度相符的摩阻关系。',
    mechanism: { title: '从管径和流量走到压降', layout: 'flow', nodes: [
      ['确定 Re', '用平均流速、管径和流体物性计算'],
      ['选摩阻关系', '充分发展圆管层流与湍流采用不同关系'],
      ['核算压降', '沿程阻力随相应管段长度累积，局部构件另计'],
    ], note: '过渡区受入口扰动等因素影响。使用摩阻系数前先确认资料采用 Darcy 还是 Fanning 定义。' },
  },
  'fm-boundary-layer': { takeaway: '近壁速度梯度关系到壁面剪切。网格首层高度应与湍流模型的近壁处理一起确定。' },
  'fm-compressible-flow': {
    takeaway: '马赫数描述流速与当地声速的比值，流动加速和激波两端的状态要用不同关系描述。',
    mechanism: { title: '喷管与激波中的状态变化', layout: 'flow', nodes: [
      ['上游状态', '已知总温和总压，结合边界条件判断流动支路'],
      ['喷管内加速', '面积变化与马赫数共同决定流速趋势'],
      ['若出现激波', '跨波压缩，静压上升并伴随总压损失'],
    ], note: '图示针对典型可压缩喷管中的正激波情形。激波位置取决于工况，几何包含扩张段并不能单独确定波的位置。' },
  },
  'fm-dimensional-similarity': {
    takeaway: '相似试验先找主导机制，再匹配对应的无量纲数。只匹配几何比例无法保证动力相似。',
    mechanism: { title: '缩尺试验应该保持什么', layout: 'compare', nodes: [
      ['Re', '惯性与黏性主导程度，如管流或低速绕流'],
      ['Fr', '惯性与重力的相对作用，如有自由液面的流动'],
      ['St', '周期过程的无量纲频率，如涡脱落'],
    ], note: '能够同时匹配的准则受缩尺比例、工作流体和试验条件限制，应按研究对象说明取舍。' },
  },
  'fm-external-drag-lift': { takeaway: '用攻角、来流速度和参考面积定义工况，再区分压差阻力、摩擦阻力和横向力。' },
  'fm-turbomachinery-cavitation': { takeaway: '泵的工作点由泵曲线和管路曲线共同决定。确定流量后，还要核对该工况的汽蚀余量。' },
  'td-basic-concepts': {
    takeaway: '先画系统边界。质量是否穿过边界，决定能量方程里是否需要计入流入和流出。',
    mechanism: { title: '按边界交换辨认系统', layout: 'compare', nodes: [
      ['控制质量', '固定的一团物质，边界可交换热和功'],
      ['控制体', '固定或运动的空间范围，可有进出口'],
      ['状态参数', '描述系统当下的状态，例如绝对压力和温度'],
    ], note: '理想气体方程使用绝对温度和绝对压力。比气体常数的取值取决于气体组成。' },
  },
  'td-first-law': {
    takeaway: '稳态开口系统的储能项为零，入口与出口仍可交换质量和能量。',
    mechanism: { title: '稳态设备的能量去向', layout: 'flow',
      image: { file: 'steady-control-volume.webp', alt: '稳态设备有进出工质携带的能量，图示从外部吸热并输出轴功' }, nodes: [
      ['流入', '工质带入焓、动能和位能'],
      ['设备控制体', '与外界交换热量及轴功'],
      ['流出', '应用同一符号约定，核对各输入与输出'],
    ], note: '泵、涡轮和换热器可以按这张图列能量平衡。是否忽略动能与位能由工况量级决定。' },
  },
  'td-typical-processes': { takeaway: '等温、等压、等容和绝热分别约束不同物理量。求功前须先明确过程路径。' },
  'td-second-law-entropy': { takeaway: '第一定律核对能量，第二定律限制过程方向。熵产量化不可逆性。' },
  'td-exergy-maxwell': {
    takeaway: '同样多的能量，在不同温度和环境下可用来做的功可能不同。㶲衡量这种差异。',
    mechanism: { title: '㶲分析的三步', layout: 'flow', nodes: [
      ['规定环境', '给出统一的环境温度和压力'],
      ['列出投入与产出', '识别工质、热和功携带的㶲'],
      ['定位㶲损', '不可逆过程产生熵，对应可用功能力损失'],
    ], note: '比较装置前应使用同一环境基准。麦克斯韦关系用于由可获得的状态量导出其他热力学偏导。' },
  },
  'td-water-vapor-rankine': { takeaway: '沿泵、锅炉、汽轮机和凝汽器追踪工质状态，分别核算加热、放热与净输出功。' },
  'td-gas-cycles-moist-air': {
    takeaway: '布雷顿循环以功和热评价动力装置，湿空气分析还要追踪每千克干空气所带的水分。',
    mechanism: { title: '两类问题分别追踪哪些量', layout: 'compare', nodes: [
      ['布雷顿循环', '压缩、加热、膨胀与放热'],
      ['湿空气状态', '同时确定温度和含湿量等独立状态量'],
      ['计算基准', '动力循环随工质流量，湿空气计算常用干空气质量'],
    ], note: '实际燃气轮机的性能还受压气机、涡轮效率和压损影响，不能直接套用理想循环结论。' },
  },
  'td-ic-engines-compressors': { takeaway: '理想内燃机循环的差别首先体现在加热过程。多级压缩配合中冷则用于降低压缩功。' },
  'td-psychrometric-combustion': { takeaway: '湿空气处理要分别核算显热和水分变化。燃烧计算需先闭合元素组成与空气量。' },
  'ht-three-modes': { takeaway: '先识别热量经过哪些路径，再判断热阻是串联还是并联。' },
  'ht-steady-conduction': { takeaway: '多层壁的温差分配由各层热阻决定。圆筒壁的传热面积随半径变化。' },
  'ht-conduction-pde-bc': { takeaway: '同一导热方程配上不同边界条件，会得到不同温度场。先确定给定的是温度、热流还是换热关系。' },
  'ht-unsteady-conduction': {
    takeaway: 'Bi 衡量物体内部导热阻力相对表面对流热阻的大小，可用来判断能否用一个温度代表整个物体。',
    mechanism: { title: '同样冷却，物体内部可能有两种表现', layout: 'compare',
      image: { file: 'transient-wall-cooling.webp', alt: '平壁双侧对流冷却时，中心温度高于两侧表面，温差随时间下降' }, nodes: [
      ['内部温差较小', '集总模型用随时间变化的平均温度描述'],
      ['内部温差明显', '表面与中心分开降温，应求时间和空间分布'],
      ['估计误差', '用 Bi 初筛后，还需结合几何与所需精度核对'],
    ], note: '图示平壁在对称对流冷却后期的温度剖面，采用一阶模态表示。集总判据应采用适合该物体的特征长度。' },
  },
  'ht-convection-similarity': {
    takeaway: '先找驱动流动的机制和相应特征长度，再由适用的 Nu 关系求对流换热系数。',
    mechanism: { title: '从流动机制到换热系数', layout: 'flow', nodes: [
      ['确定驱动', '来流或泵送主导，或由温差导致的浮力主导'],
      ['选相似参数', '按关联式确认 Re、Pr 或 Ra 及物性取值'],
      ['换算 h', '由 Nu、导热系数和规定特征长度得到'],
    ], note: '不同关联式可能限定壁温条件、位置、几何、流态和适用参数范围。' },
  },
  'ht-internal-external-natural': {
    takeaway: '管内入口、外掠管束和自然对流的流动与边界层发展方式不同，需要分别选择换热关系。',
    mechanism: { title: '三类典型对流换热', layout: 'compare', nodes: [
      ['管内入口', '近壁边界层沿轴向发展，并改变局部换热'],
      ['外掠管束', '上游绕流和尾迹影响后排管的换热'],
      ['自然对流', '密度变化在重力场中形成浮力驱动'],
    ], note: '平均换热与局部换热使用的长度和换热系数定义可能不同。' },
  },
  'ht-phase-change-radiation': {
    takeaway: '相变要核算潜热和传热状态，辐射要核对绝对温度、表面性质和几何关系。',
    mechanism: { title: '三种典型界面传热过程', layout: 'compare', nodes: [
      ['沸腾', '受热液体在适当条件下形成蒸汽'],
      ['凝结', '蒸汽在冷表面放热形成液体'],
      ['热辐射', '表面通过电磁辐射交换能量'],
    ], note: '相变传热机制会随表面与工况改变。辐射中使用绝对温度，并根据实际几何选择视角因子或相应模型。' },
  },
  'ht-heat-exchangers': { takeaway: '端温差已知时可用 LMTD 核算换热量。出口温度未知时，ε-NTU 常用于由设备和进口条件反求性能。' },
  'ht-enhancement-numerical': {
    takeaway: '强化传热需要同时看传热收益和流动代价。数值结果还应独立检查网格影响。',
    mechanism: { title: '评价强化方案的比较路径', layout: 'flow', nodes: [
      ['定基准', '定义有无强化结构时共同的比较工况'],
      ['量化收益', '比较换热量或 Nu，并同时记录压降'],
      ['复核公平性', '说明等流量、等泵功等约束及计算误差'],
    ], note: '评价准则的指数与比较条件有关。热接触阻力和网格离散误差也可能改变结论。' },
  },
  'ref-principles-carnot': {
    takeaway: '制冷机消耗功，把热量从冷源移到热源。COP 用制冷量除以输入功。',
    mechanism: { title: '冷量、耗功与排热的关系', layout: 'flow',
      image: { file: 'refrigeration-heat-flow.webp', alt: '制冷机吸收低温侧热量并消耗外部输入功，向高温侧排热' }, nodes: [
      ['冷源', '蒸发侧从被冷却空间吸热'],
      ['制冷设备', '消耗外部功，维持两侧过程'],
      ['热源', '冷凝侧向外界排出吸收的热量和耗功'],
    ], note: '在相同温区下，逆卡诺给出理论性能上限。公式中的高、低温都用绝对温度。' },
  },
  'ref-vapor-compression': { takeaway: '按压缩、冷凝、节流、蒸发顺序读压焓图。理想节流前后焓值相同。' },
  'ref-subcool-superheat': { takeaway: '液体过冷发生在高压液侧，吸气过热发生在低压蒸气侧，二者对性能的影响应分别核算。' },
  'ref-two-stage-cascade': {
    takeaway: '低温工况可将压缩负荷分级。双级压缩共享同一循环，复叠用换热器连接高低温两套循环。',
    mechanism: { title: '低温制冷的两种分级路线', layout: 'compare', nodes: [
      ['双级压缩', '低压级与高压级分别承担一部分升压'],
      ['复叠换热', '低温循环冷凝侧向高温循环蒸发侧放热'],
      ['中间条件', '核对中间压力或换热端差，再评估系统效率'],
    ], note: '实际中间压力和温度取决于制冷剂、部件效率与运行目标。' },
  },
  'ref-absorption-heatpump': { takeaway: '吸收式循环主要靠发生器热输入驱动。热泵则以高温侧供热为目标量。' },
  'ref-refrigerants-components': {
    takeaway: '更换制冷剂时须同时看环境指标、安全类别、实际工况和设备相容性。',
    mechanism: { title: '制冷剂替代的核对顺序', layout: 'flow', nodes: [
      ['核对约束', '法规、安全、泄漏和使用场所'],
      ['对照物性', '目标温区的压力、焓和密度范围'],
      ['核对部件', '压缩机、阀件、换热器和润滑油匹配'],
    ], note: 'ODP 和 GWP 描述不同环境影响。应用约束应核对所在地区现行法规和相应标准。' },
  },
  'ref-compressors-characteristics': {
    takeaway: '容积式压缩机靠改变封闭空间容积升压，离心压缩机靠叶轮和扩压过程升压。',
    mechanism: { title: '按压缩方式选择诊断量', layout: 'compare', nodes: [
      ['容积式', '检查排量、容积效率和吸气密度'],
      ['离心式', '在性能图上核对流量、压比与转速'],
      ['偏离工况', '离心机低流量侧需关注喘振边界'],
    ], note: '实际运行边界以对应压缩机的性能图和厂家资料为准。' },
  },
  'ref-expansion-heat-exchangers': {
    takeaway: '膨胀装置调节蒸发器供液。采用过热度控制时，应同时检查测温点和对应压力。',
    mechanism: { title: '过热度如何反馈到供液', layout: 'flow', nodes: [
      ['采集出口状态', '读取温度和对应的蒸发压力'],
      ['判断出口过热度', '用匹配的制冷剂与饱和状态定义换算'],
      ['调节供液', '控制器改变阀门开度，系统随后重新平衡'],
    ], note: '控制响应涉及阀件、蒸发器和负荷。温度与压力必须对应同一测点，混合工质须选取适当的饱和参考。' },
  },
  'ref-co2-load-control': { takeaway: '跨临界 CO₂ 在高压侧通过气体冷却器放热。设计点性能与部分负荷性能要分别核对。' },
}
