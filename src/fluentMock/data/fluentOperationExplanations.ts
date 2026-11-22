import type { FluentMockExplanation, FluentOperationGuide } from '../fluentTypes'

const help = 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/'
const general = 'flu_ug_general_task_page.html'
const models = 'flu_ug_models_task_page.html'
const boundaries = 'flu_ug_boundary_conditions_task_page.html'
const methods = 'flu_ug_solution_methods_task_page.html'
const calculation = 'flu_ug_run_calculation_task_page.html'

type GuideContent = FluentOperationGuide &
  Pick<FluentMockExplanation, 'checkItems' | 'commonMistakes' | 'relatedControls'>

type Guide = GuideContent & { whatItIs?: string; whenToUse?: string; recommendation?: string }

const entries: Record<string, Partial<FluentMockExplanation>> = {}

function add(ids: string[], page: string, guide: Guide) {
  const { coreConcept, choices, parameterEffects, steps, example, contextNote, ...explanation } = guide
  for (const id of ids) {
    entries[id + '-explanation'] = {
      ...explanation,
      operation: { coreConcept, choices, parameterEffects, steps, example, contextNote },
      sourceUrl: help + page,
      sourceStatus: 'source-checked',
    }
  }
}

const timeChoices: FluentOperationGuide['choices'] = [
  ['稳态 Steady', '求解统计定常或时间无关的平衡态（方程去掉 ∂/∂t 项）。流体仍在高速或低速流动，只是空间各点的平均速度、压力与温度不再随物理时间漂移。'],
  ['瞬态 Transient', '保留 ∂/∂t 时间导数项，从真实初始场按时间步长 Δt 一步步向前推进，能捕获启动、停机、冷却曲线、涡脱落、晃荡或周期脉动。'],
  ['如何选型', '先问“工程问题关心稳定后的结果，还是变化过程本身”：即使入口边界固定，大分离、卡门涡街或自由液面晃荡在真实物理上仍是非定常的，需要用 Transient 才能得到真实演化与平均场。'],
]

add(['general-steady'], general, {
  whatItIs: '稳态求解（Steady）在控制方程中省略时间导数项 ∂/∂t，直接寻找与物理时间无关的流动或温度场。稳态计算中的“迭代步数（Iterations）”只是非线性方程与压力-速度耦合的数值收敛过程，迭代步数不能换算为真实秒数。',
  whenToUse: '当几何、材料物性与边界条件在关注时段内保持稳定，流场不存在显著周期性脱落或相界面运动，且工程目标只需要稳定工况下的压降、流量分配、换热系数或稳态温度分布时使用 Steady。',
  recommendation: '稳态计算先确认质量/能量整体守恒与关键监控量（如压降、出口温度、阻力系数）走平，再判断收敛；若监控量出现规律等幅振荡或残差始终卡在高位，往往说明真实流动存在非定常涡脱落，需改用瞬态检验。',
  coreConcept: '“稳态”不等于“流体静止”，而是“空间固定点上的物理量不再随时间变化”。迭代次数只代表求解器逼近稳态解的代数步数；如果要把 Steady 当作初场传给瞬态，需先确认物理上不存在反向传播的激波或完全不同的初始化要求。',
  choices: timeChoices,
  parameterEffects: [
    ['迭代次数 (Number of Iterations)', '只决定数值残差与物理量监控能否充分走平，不代表任何物理时间。'],
    ['亚松弛因子 / 伪时间步 (URF / Pseudo-Time)', '直接影响稳态迭代收敛速度与稳定性：流场振荡难收时适当收紧，稳定后可对比收敛趋势。'],
  ],
  steps: ['在 Setup → General → Time 选择 Steady。', '设置材料、边界与湍流/能量模型后执行 Hybrid 或 Standard Initialization，并建立压降、出口温度、力系数等 Report Definitions。', '在 Run Calculation 输入足够迭代步数试算；同时盯紧残差、进出口质量/能量守恒差和监控曲线是否走平。'],
  example: '恒定流量、恒定热流加热的冷板通道：工程上只关心达到热平衡后的最高温度和进出口压降，此时应先选 Steady；若研究水泵突然断电后冷板多久超温，则必须切换为 Transient。',
  contextNote: '很多初学者容易把稳态残差曲线的波浪当成瞬态时间历程——如果发现稳定几何下 Cd 或监控点温度呈现稳定正弦振荡，切记切换到 Transient 检查非定常涡脱落是否不可忽略。',
  checkItems: ['观察关键工程监控量是否走平而非仅看残差降到 1e-3', '核对进出口质量流量差与整体能量收支平衡，确保物理守恒成立'],
  commonMistakes: '把 Steady 误认为流体不流动，或把迭代 500 步强行当成物理运行了 500 秒；另常见错误是在明显存在涡街或自由液面晃荡的工况下硬算稳态。',
  relatedControls: ['general-transient', 'solver-time-formulation', 'initialization-hybrid', 'run-calculate'],
})

add(['general-transient'], general, {
  whatItIs: '瞬态求解（Transient）保留质量、动量、能量及湍流/多相方程中的时间导数项 ∂/∂t，解析场量随物理时间的变化。时间步长描述实际时间推进的增量，步内迭代用于减小该时间步内的方程误差。',
  whenToUse: '当关注启动/停机过渡、升降温速率、流致噪声/周期涡脱落、旋转机械瞬态干涉、活塞/滑移网格运动、VOF 自由液面晃荡，或边界条件本身随时间函数/UDF 变化时，必须启用 Transient。',
  recommendation: '瞬态精度同时取决于时间步长 Δt（满足库朗数 Co 或特征频率采样需求）、每个时间步内的 Max Iterations/Time Step（确保步内残差与监控走平）以及二阶时间离散格式。',
  coreConcept: '瞬态计算包含两层嵌套循环：外层是物理时间步进（真实流过了多少秒 = 时间步数 × Δt）；内层是每个时间步里面的非线性迭代，负责把当前时刻的方程解准再迈向下一时刻。两者承担完全不同的角色。',
  choices: timeChoices,
  parameterEffects: [
    ['时间步长 Δt (Time Step Size)', '决定时间分辨率与 Courant 数 Co = uΔt/Δx：Δt 过大不仅漏掉涡脱落高频细节，还可能引起隐式推进失真或发散；建议先按特征流速穿过最小网格或周期 1/20~1/50 估算 Δt。'],
    ['步内最大迭代 (Max Iterations/Time Step)', '控制单个时间步的求解精度，一般设为 15~30；若每步总是跑满上限而未收敛，应优先减小 Δt，而不是一味把步内迭代拉到上百。'],
    ['时间离散格式 (Transient Formulation)', 'Second Order Implicit 显著降低数值耗散与相位误差，精度研究优先考虑；First Order Implicit 更稳，常用于起步过渡阶段。'],
  ],
  steps: ['在 Setup → General → Time 选择 Transient，并在边界或源项中配置随时间变化的曲线/表达式。', '给出物理上合理的初始场（可先用稳态或贴近初始工况的 Patch 场初始化），在 Solution Methods 中选用 PISO/Coupled 及隐式时间离散格式。', '在 Run Calculation 设置 Time Step Size、Number of Time Steps 与步内迭代上限，开启 Report Plot（横轴选 Flow Time）与 Auto Save 间隔保存瞬态结果。'],
  example: '研究热源停加热后固体或电池包冷却到目标温度所需的 60 s 过程：先确保初始温度分布符合断电前稳态，设 Δt = 0.2 s、总步数 300 步并开启自动保存，持续记录核心和表面温度，最后用 Δt = 0.1 s 做时间步敏感性检验。',
  contextNote: '对于周期性非定常流（如圆柱绕流卡门涡街或叶轮转静干涉），正式采集平均量或声学/FFT 频谱前，务必先让流场跑过初始瞬态过渡段，待出现稳定等幅周期振荡后再开启 Data Sampling for Time Statistics。',
  checkItems: ['检查每个时间步结束前步内残差是否确实下降 2~3 个数量级（避免总是顶满 Max Iterations）', '在典型区域核对网格尺寸与流速对应的库朗数 Co，并做减半 Δt 的时间步敏感性对比'],
  commonMistakes: '用稳态思路处理瞬态：忽略物理初始场、时间步长随手填 1 s 导致关键瞬态过程一闪而过，或忘记设置 Auto Save 导致算完只剩最后一帧结果无法做时间历程后处理。',
  relatedControls: ['general-steady', 'run-time-step-inline', 'methods-transient-formulation', 'autosave-frequency'],
})

add(['solver-time-formulation'], general, {
  whatItIs: 'Solver Time（Steady / Transient）决定控制方程是否保留时间导数项，是从物理建模层区分“求平衡定态场”还是“求实时演化过程”的总开关。',
  coreConcept: '切换 Steady 与 Transient 不仅改变 Run Calculation 面板输入项，还会联动 Solution Methods 中的时间离散选项（Transient Formulation）、湍流尺度解析模型（LES/DES 可用性）以及多相界面和 DPM 非稳态跟踪设置。',
  choices: timeChoices,
  parameterEffects: [
    ['选择 Steady 时', 'Run Calculation 显示 Number of Iterations；适合定常流动、稳态传热及初步建立初场。'],
    ['选择 Transient 时', '解锁 Solution Methods 的时间离散格式与 Run Calculation 的 Time Stepping/Time Step Size、Extrapolation 与数据时间统计设置。'],
  ],
  steps: ['结合问题物理特征和工程关注目标选择 Steady 或 Transient。', '稳态重点设置初始化、收敛判据与迭代上限；瞬态重点设置初始场、时间步长、步内收敛判据与自动保存。'],
  example: '同一散热风道既可先用 Steady 跑出稳定风速与工作温升基线，再在关闭风扇瞬间切换为 Transient 追踪余温冷却曲线。',
  checkItems: ['定常边界下仍应评估几何绕流是否诱发强非定常涡街', '确保时间设置与后续离散格式、多相及后处理监控横轴匹配'],
  commonMistakes: '直接把稳态迭代历史曲线误读成瞬态时间响应，或切换为 Transient 后忘记重新配置时间步和自动保存。',
  relatedControls: ['general-steady', 'general-transient', 'run-time-step-inline'],
})

const solverChoices: FluentOperationGuide['choices'] = [
  ['Pressure-Based', '用连续性与动量方程建立压力修正或耦合关系，适用于广泛工况，包括低速不可压缩流动。'],
  ['Density-Based', '耦合推进连续性、动量及适用的能量方程，常用于具有显著可压缩效应的高速流。'],
]
add(['general-pressure-based', 'general-density-based', 'solver-type-pressure-based', 'solver-type-density-based'], general, {
  coreConcept: '两类求解器的核心差异在于方程耦合和密度计算方式：Pressure-Based 通过压力修正/耦合方程间接获得与连续性相容的压力场，默认密度由状态方程或常数给出；Density-Based 直接联立求解质量-动量-能量守恒通量向量，并由理想气体等状态方程直接反推压力。',
  choices: solverChoices,
  parameterEffects: [
    ['低速不可压与多相工况 (Ma < 0.3)', 'Pressure-Based 配合 Coupled/SIMPLE 数值效率最高，且 VOF、Mixture、Eulerian 等大多数多相模型仅压力基支持。'],
    ['高速跨声速与激波捕捉', 'Density-Based 的迎风特征通量分裂对强间断、强激波耦合捕获更稳健；压力基开启 Coupled + 可压缩修正也可算中高马赫数外流。'],
  ],
  steps: ['判断工况最高马赫数、密度变化剧烈程度以及是否需要多相/颗粒等专有模型。', '选定求解器后，检查 Materials 中的密度定义与 Solution Methods 中的耦合/通量格式。', '对比压比、激波位置与全局质量/动量守恒检查结果合理性。'],
  example: '低速水管压降与常规风扇散热直接从 Pressure-Based 开始；若研究 Ma = 2.0 超声速拉瓦尔喷管正激波位置，则应采用 Density-Based 或对比压力基可压缩耦合结果。',
  checkItems: ['确认密度模型、操作压力与绝对压力定义一致', '核对耦合方法与离散通量格式当前求解器是否支持'],
  commonMistakes: '只要工质是空气/气体就无脑选 Density-Based——常温低速通风气体完全应使用 Pressure-Based，否则低马赫数条件数恶化导致收敛极慢。',
  relatedControls: ['general-pressure-based', 'general-density-based', 'solution-methods-coupling'],
})

add(['models-multiphase', 'ribbon-model-multiphase', 'multiphase-model-select'], 'flu_ug_sec_multiphase_setup.html', {
  whatItIs: '多相模型描述不同流体或颗粒相在同一流动域中的分布及相互作用。应根据能否分辨相界面、相间滑移和研究目标选择模型。',
  whenToUse: '需要追踪气液自由表面、分析分散气泡或固体，或求取各相体积分数及相间交换时。',
  choices: [
    ['VOF', '以体积分数追踪可分辨的流体界面，适合自由液面、液柱或大尺度气液界面。'],
    ['Mixture', '求解混合物动量，可通过滑移模型表示相对运动。适合混合物描述足以回答问题的分散流。'],
    ['Eulerian', '分别求各相动量并通过闭合关系耦合。需要各相速度或分布、相间作用较复杂时考虑。'],
    ['Wet Steam', '用于湿蒸汽非平衡凝结。按照专用流程处理蒸汽性质和液滴生成。'],
  ],
  steps: ['判断关注的是清晰界面还是分散相，核对是否需要相间滑移或传热传质。', '在 Models → Multiphase 选择模型并定义主相、次相和材料。', '检查 Phase Interaction、入口体积分数及初始化。已充液区域需要和真实初始状态一致。'],
  example: '水箱晃荡若要看液面位置优先评估 VOF。若关注鼓泡设备中分散小气泡的速度与气含率，可评估 Mixture 或 Eulerian，并核对曳力模型。',
  checkItems: ['各相体积分数的和应满足闭合约束', '用相体积或相质量守恒监控检查时间推进和界面设置'],
  commonMistakes: '只选模型就开始计算，遗漏相材料、边界相分率或相间作用。',
  relatedControls: ['general-pressure-based', 'multiphase-num-phases', 'multiphase-eulerian-regime'],
})

add(['models-energy', 'ribbon-model-energy', 'energy-enable'], models + '#flu_ug_Energy', {
  whatItIs: 'Energy 启用能量方程，求解温度或焓，并与材料热物性、热边界、热源和所启用的其他物理模型耦合。',
  whenToUse: '需要预测温度、热流、温变物性、热浮力、可压缩热效应或相变时。',
  choices: [['On', '使用能量方程描述热过程，同时设置材料热物性和热边界。'], ['Off', '在温度无需求解且模型允许等温近似时使用。']],
  steps: ['开启 Models → Energy。', '为流体和固体核对导热系数与比热，在边界设置温度、热流或热耦合。', '建立关键温度与热流监控，核对整体热量收支。'],
  example: '已知电加热功率和进水温度，求冷却板温升。分别给定固体导热系数和热源，再检查壁面传热与冷却水带走的热量。',
  checkItems: ['共轭传热需确认流固界面配对、材质和热条件', '热流密度 W/m²、体积热源 W/m³ 和总功率 W 应分别核对'],
  commonMistakes: '启用 Energy 后仍沿用默认绝热壁，或把输入热流密度当成总热功率。',
  relatedControls: ['materials-create-edit', 'wall-thermal', 'cell-zone-solid-source-enable'],
})

add(['models-viscous', 'ribbon-model-viscous', 'viscous-kepsilon', 'viscous-kw-sst', 'viscous-laminar', 'viscous-les', 'viscous-des', 'viscous-transition-sst', 'viscous-sa', 'viscous-rsm', 'viscous-inviscid', 'viscous-sas', 'viscous-ke-submodel', 'viscous-kw-submodel'], models + '#flu_ug_Viscous_Model', {
  whatItIs: 'Viscous 指定如何描述黏性剪切及湍流输运。模型与近壁网格共同决定壁面摩擦、分离及换热的计算质量。',
  whenToUse: '依据雷诺数范围、几何、分离与转捩风险，以及需要平均场还是解析时变结构来选模型。',
  choices: [
    ['Inviscid', '忽略分子黏性。用于可接受无黏近似的流动，不能描述近壁剪切与边界层摩擦。'],
    ['Laminar', '求解分子黏性作用，适用于可合理判为层流的工况。'],
    ['Spalart–Allmaras', '一方程湍流模型，常用于以附着流为主的外部气动。'],
    ['k-ε / k-ω SST', 'RANS 模型用于获得平均量。k-ε 常用于内部流和自由剪切的基线计算，SST 常用于关注逆压梯度或分离的壁面流动。'],
    ['Transition SST', '针对转捩过程，需特别核对入口扰动与近壁网格。'],
    ['Reynolds Stress', '分别求解雷诺应力分量，适合评估强旋转、曲率或湍流各向异性的影响。'],
    ['SAS', '在满足分辨率等条件时，允许流动不稳定性形成可解析的非定常结构。'],
    ['LES / DES', 'LES 解析较大的涡并对亚格子尺度建模。DES 结合 RANS 近壁处理与分离区的尺度解析，需核对网格和时间步。'],
  ],
  steps: ['在 Viscous 选择与工况匹配的模型和子模型。', '使用湍流模型时，核对所需的近壁网格、入口湍流强度与尺度定义。', '计算后查看摩擦、分离点或换热量等目标量。采用近壁湍流处理时还要复核 y⁺ 分布。'],
  example: '扩压器若首先关心平均分离区，可先用 SST 建立基线。要研究涡结构随时间演化或脉动频谱时，再评估瞬态模拟与尺度解析模型。',
  checkItems: ['依据选用的近壁处理解释 y⁺，避免把单一阈值套给所有模型', '比较网格、边界扰动和模型对目标量的影响'],
  commonMistakes: '只换湍流模型，沿用不匹配的壁面网格与进流湍流条件。',
  relatedControls: ['general-transient', 'velocity-inlet-turbulence', 'energy-enable'],
})

add(['viscous-ke-submodel'], models + '#flu_ug_Viscous_Model', {
  whatItIs: 'k–ε 模型求解湍动能 k 和耗散率 ε。三个子模型使用不同的方程系数或附加项定义湍流黏度与输运。',
  choices: [['Standard', '经典两方程模型，可用作充分湍流的工程基线。'], ['RNG', '对耗散率方程等闭合做修正，可按问题评估强应变或旋转场。'], ['Realizable', '采用变化的湍流黏度系数和不同的耗散率方程，可按问题评估射流扩展与分离。']],
  steps: ['确定流态和关心的工程量。', '选择子模型及相容的近壁处理并核对进流湍流条件。', '在同等网格和边界条件下比较目标量与基准数据。'],
  example: '研究管内突扩后的平均回流长度时，保持入口与近壁网格一致，可比较 Standard 和 Realizable 对分离区的预测。',
  checkItems: ['记录子模型及近壁处理', '检查压降或分离点的模型敏感性'],
  commonMistakes: '根据残差降低速度直接判定某个子模型对工程量最准确。',
  relatedControls: ['viscous-wall-treatment', 'velocity-inlet-turbulence'],
})

add(['viscous-kw-submodel'], models + '#flu_ug_Viscous_Model', {
  whatItIs: 'k–ω 模型求解湍动能 k 和比耗散率 ω。子模型改变对近壁和外流区湍流的处理。',
  recommendation: '先按流动特征与参考结果挑选基线。评估分离或剪切层时，将选模与入口湍流、近壁网格和验证数据一起考虑。',
  choices: [
    ['Standard', '使用 k–ω 形式，需注意自由来流 ω 对结果的影响。'],
    ['BSL', '在近壁采用 k–ω，外层混合到等效 k–ε，以减弱对自由来流 ω 的敏感性。'],
    ['SST', '在 BSL 混合形式上限制湍流剪应力，可评估带逆压梯度或分离的壁面流。'],
    ['GEKO', '提供可调的闭合系数，允许针对分离或自由剪切等现象调整模型。调整后需要用独立工况核对。'],
  ],
  steps: ['核对算例是否关心壁面剪切、分离或外流边界。', '选择对应子模型，填写湍流条件并检查近壁分辨率。', '对比壁面摩擦、分离位置或压降，必要时核对自由来流条件的影响。'],
  example: '用 SST 预测扩压段的分离时，同时比较壁面剪切为零的位置和下游压力恢复。',
  checkItems: ['确认入口 ω 或用于估算它的湍流资料', '按所选近壁处理核对 y⁺ 和首层网格'],
  commonMistakes: '只关注压力残差，遗漏验证分离以及局部壁面剪切。',
  relatedControls: ['viscous-wall-treatment', 'velocity-inlet-turbulence'],
})

add(['models-radiation', 'ribbon-model-radiation', 'radiation-model-select'], models + '#flu_ug_Radiation_Model', {
  whatItIs: '辐射模型描述物体通过辐射传递热量，并按选用模型处理表面性质、遮挡和介质吸收、发射或散射。',
  choices: [
    ['S2S', '表面对表面交换，适用于可忽略介质参与时的封闭或几何可表示的区域。'],
    ['P1', '将辐射传输近似为扩散形式。选用时评估光学厚度以及几何和方向性限制。'],
    ['DO', '沿离散方向求解辐射传输。适合需要处理参与性介质、定向入射等情况。'],
    ['DTRM / Monte Carlo / Rosseland', '分别对应射线、统计抽样或光学厚介质扩散近似。按模型假设核对遮挡、散射、介质和壁面条件。'],
  ],
  steps: ['开启 Energy，判断介质是否吸收、发射或散射。', '选择 Radiation 模型，填写壁面发射率以及所需的吸收系数、波段或角度离散参数。', '比较辐射热流与其他换热量，复核关键表面温度。'],
  example: '高温炉壁向工件辐射时，若气体吸收显著，应核对参与性介质设置。透明介质中的表面交换可先评估 S2S。',
  checkItems: ['发射率与温度、材料及模型假设一致', '检查各热边界的净辐射热流与能量平衡'],
  commonMistakes: '把 S2S 当作能直接计算气体吸收和发射的模型。',
  relatedControls: ['energy-enable', 'wall-thermal', 'radiation-model-select'],
})

add(['models-species', 'ribbon-model-species', 'species-model-select'], models + '#flu_ug_Species_Model', {
  whatItIs: 'Species 用于描述多组分的输运与混合。联用反应模型时，还需要描述化学反应及其与湍流或扩散的耦合。',
  choices: [
    ['Species Transport', '计算组分质量分数的输运，可用于混合，也可按模型设置反应。'],
    ['Non-Premixed / Premixed', '分别针对燃料和氧化剂分开进入或在入口前已混合的典型燃烧方式，所需边界量不同。'],
    ['Partially Premixed / Composition PDF', '适合需要同时描述混合与反应进程，或对湍流化学统计提供专门处理的模型分支。'],
  ],
  steps: ['明确只计算混合还是也计算反应，并定义混合工质。', '给定入口组成、扩散及需要的反应机制，核对能量与湍流设置。', '检查组分闭合、反应区位置和质量守恒。'],
  example: '两股不同浓度的气流在风道中混合，关注出口均匀性时可选 Species Transport，使用非反应设置。',
  checkItems: ['区分质量分数和摩尔分数，核对组分和单位', '用进出口组分流量及温升检查混合与反应结果'],
  commonMistakes: '把体积分数数据直接填写在质量分数输入框中。',
  relatedControls: ['energy-enable', 'species-model-select', 'bc-velocity-inlet'],
})

add(['models-dpm', 'ribbon-model-dpm', 'dpm-enable'], models + '#flu_ug_Discrete_Phase_Model', {
  whatItIs: 'DPM 以拉格朗日方式跟踪离散颗粒、液滴或气泡在连续相中的运动，可按设置加入颗粒受力、传热和质量传递。',
  choices: [
    ['单向耦合', '连续相影响颗粒，颗粒对连续相的反馈可忽略时使用。'],
    ['双向耦合', '让颗粒交换的动量、热和质量进入连续相方程，需要检查源项更新与收敛。'],
    ['稳态 / 非稳态跟踪', '根据喷射、连续相和目标量选跟踪方式。非稳态跟踪要核对颗粒时间步和流体时间步的关系。'],
  ],
  steps: ['为连续相建立速度场，再开启 DPM 并创建 Injection。', '设置颗粒类型、直径或粒径分布、速度、质量流率及材料。', '给入口、出口和壁面设置颗粒行为，统计逃逸、捕集和轨迹。'],
  example: '带颗粒的风道除尘问题，用入口颗粒粒径分布和壁面捕集条件估计捕集率。颗粒负载显著时需评估连续相反馈。',
  checkItems: ['检查喷射位置、颗粒材料和质量流率单位', '核对 Escape、Trap 和 Reflect 对统计量的影响'],
  commonMistakes: '把显示出来的一条轨迹当作全部粒径和喷射分布的统计结果。',
  relatedControls: ['general-transient', 'dpm-injections', 'dpm-unsteady-tracking'],
})

add(['models-solidification', 'ribbon-model-solidification', 'solidification-enable'], models + '#flu_ug_Solidification_and_Melting', {
  whatItIs: '凝固与熔化模型通过焓和液相率表示潜热。部分熔化区可通过阻力项抑制液体速度，并形成随时间变化的固液分布。',
  choices: [['纯物质近似', '根据相变温度、潜热和物性建立相变关系。'], ['存在熔化区间', '分别核对固相线、液相线及材料相变物性。涉及合金组分时要核对相应组分设置。']],
  steps: ['启用 Energy 与 Solidification & Melting，检查材料相变参数。', '设置初始温度、冷却边界及时间步。', '监控液相率、固液界面和总能量随时间的变化。'],
  example: '熔融材料在冷壁附近凝固，比较不同时间下的固壳增长。除温度外，检查液相率的空间分布。',
  checkItems: ['核对固相线、液相线与潜热单位', '对网格、时间步和糊状区参数做敏感性检查'],
  commonMistakes: '只根据一幅温度云图判定相变区，忽略模型给出的液相率。',
  relatedControls: ['energy-enable', 'general-transient', 'materials-create-edit'],
})

add(['models-heat-exchanger', 'hx-model-type', 'hx-dual-performance-data'], models + '#flu_ug_Set_Dual_Cell_Heat_Exchanger', {
  whatItIs: '换热器模型用性能数据和简化区域表示设备的热量交换，适合设备级或系统级计算。',
  choices: [['性能模型', '适合关注进出口温度、换热量及系统流量分配。需提供适用工况的性能数据。'], ['显式建模', '需分析局部流道、翅片或界面温差时，可考虑布置真实几何并做共轭换热。']],
  steps: ['启用 Energy，并按可用模型选择换热器类型。', '定义冷热两侧的区域、进出口和性能参数。Dual Cell 中按已有数据选择 Raw Data 或 NTU Data。', '单独核对冷热侧热量收支和设备压降。'],
  example: '在整机风道中估算散热器对出口温度的影响。先用性能曲线标定简化设备，再考察风量变化。',
  checkItems: ['确认性能数据中的流量、温度与换热量单位', '验证数据是否覆盖当前运行点'],
  commonMistakes: '把某一额定工况下的换热量当成所有流量下的固定值。',
  relatedControls: ['energy-enable', 'hx-dual-performance-data'],
})

add(['models-acoustics', 'ribbon-model-acoustics', 'acoustics-model-select'], models + '#flu_ug_Acoustics_Model', {
  whatItIs: '声学模型从流动与压力波动估计噪声。可用于远场声传播、波动方程求解或对宽频声源区域作初步识别。',
  choices: [['FW–H', '利用定义的积分面和接收点估算远场声压时程或频谱。'], ['Wave Equation', '求解时域声波方程，需检查瞬态与时间离散格式要求。'], ['Broadband Noise Sources', '由湍流统计量估算宽频声源强度，适合定位可能的噪声源。']],
  steps: ['确定输出是远场频谱、传播声场还是可能的声源区域。', '按方法设定瞬态流场、声源区、接收点和所需的采样长度。', '比较声压时间信号和频谱，说明采样对频率范围与分辨率的影响。'],
  example: '评估风道出口附近涡脱落的主频时，先保证非定常流动已充分发展，再按目标最高频率选择采样。',
  checkItems: ['采样间隔与记录时长支持所需频率范围', '检查接收点和声源面位置及反射边界影响'],
  commonMistakes: '把宽频声源强度图当作指定接收点的实测声压谱。',
  relatedControls: ['general-transient', 'acoustics-define-sources', 'methods-transient-formulation'],
})

add(['models-wall-film', 'ribbon-model-wall-film', 'wall-film-enable'], models + '#flu_ug_Eulerian_Wall_Film', {
  whatItIs: 'Eulerian Wall Film 在壁面上求解薄液膜的厚度、流动及可用的能量和相交换，避免沿很薄的膜厚方向划分大量体网格。',
  choices: [['壁面薄膜模型', '适合薄膜厚度、排液和壁面相互作用为主要输出的情况。'], ['体网格解析界面', '若需直接分辨大尺度波面、液块或界面形状，应根据相界面需求评估多相方法。']],
  steps: ['判断薄膜假设是否适用，开启 Wall Film 并指定材料和成膜壁面。', '按问题设置液膜来源、初始厚度、与气相或颗粒的相互作用。', '监控液膜厚度、液膜质量和排出量。'],
  example: '喷雾冷却中若关注撞壁后形成的薄膜，可在合适的壁面启用膜模型，并依模型核对颗粒沉积和蒸发耦合。',
  checkItems: ['确认实际启用液膜的墙面与相耦合条件', '检查膜质量的来源和去向是否能闭合'],
  commonMistakes: '只启用模型，未给壁面设置成膜条件或液膜来源。',
  relatedControls: ['dpm-enable', 'wall-film-phase-coupling', 'energy-enable'],
})

add(['models-battery', 'ribbon-model-battery', 'battery-model-select', 'battery-solution-method', 'electric-potential-enable'], 'flu_bat_MSMD_sec_use_battery_model.html#flu_bat_MSMD_sec_battery_model_options', {
  whatItIs: '电位与电池模型用于描述电学行为，电池模型还可按求解方法计算电化学或等效电路响应及热源。',
  choices: [['Electric Potential', '单独求解导电区域的电位，按问题填写电导率和电学边界。'], ['Battery / MSMD', '按电池几何与目标选求解方法。MSMD 可配合不同电化学或等效子模型。']],
  steps: ['确定关注电流分布、端电压、热源还是温度。', '选择模型并填写材料、电连接、工作模式和所需的电池模型参数。', '记录端电压、电流、热功率和关键位置温度。'],
  example: '对比不同冷却方案的电芯温升时，保持放电工况和电池参数一致，再比较温升与温差。',
  checkItems: ['按模型核对端子、极性及 C-Rate 或电流定义', '热分析应核对 Energy 与焦耳热、反应热等热源设置'],
  commonMistakes: '只输入倍率而未核对额定容量和放电方向。',
  relatedControls: ['energy-enable', 'electric-potential-enable', 'battery-solution-method'],
})

add(['multiphase-eulerian-regime', 'multiphase-aiad-drag-options', 'multiphase-aiad-entrainment-options', 'multiphase-phase-gentop-hybrid'], 'flu_ug_sec_mphase_using_steps_eulerian.html', {
  choices: [
    ['AIAD', '用局部形态处理分层界面、液滴与气泡等形态，按对应分支设置相身份、相间曳力及所需的卷吸。'],
    ['GENTOP', '用混合相模型处理可分辨与分散结构的转变，按应用场景核对混合次相及群体平衡配置。'],
  ],
  steps: ['在 Eulerian 的 Regime Transition Modeling 选择方法并 Apply。', '进入 Phases 检查材料、主次相和各相的角色。', '回到 Phase Interaction，按模型核对 Forces、传质和可用的配套设置。'],
  example: '带气体卷吸的液面计算，要先区分可分辨气相界面与被卷入的气泡场，再选择模型并设置各相角色。',
  checkItems: ['核对模型适用的形态和相材料分配', '分别检查主相与次相的质量守恒及相分布'],
  commonMistakes: '直接开启相间传质，但遗漏相身份、材料或相对的曳力配置。',
  relatedControls: ['multiphase-model-select', 'multiphase-aiad-secondary-role', 'multiphase-aiad-drag-options'],
})

add(['bc-velocity-inlet', 'velocity-inlet-magnitude'], boundaries + '#flu_ug_Velocity_Inlet', {
  whatItIs: '速度入口通过速度大小与方向，或直接用速度分量，描述流体进入计算域的条件。',
  choices: [['Velocity Inlet', '已知入口速度或速度分量时使用，按页面选择速度的方向定义。'], ['Mass-Flow Inlet', '已知入口质量流率时使用，特别要区分总质量流率与单位面积通量。'], ['Pressure Inlet', '使用已知的压力条件，由求解结果确定入口流量。']],
  steps: ['选中入口区域并设置 Velocity Inlet。', '选择方向定义，输入速度和适用的湍流、温度或组分参数。', '显示入口和法向，计算后核对朝向和实际流量。'],
  example: '已知水道体积流量和入口面积，可先换算截面平均速度，再审核均匀进口剖面的假设。',
  checkItems: ['核对方向、速度单位和参考系', '检查模型所需的入口湍流、热或组分条件'],
  commonMistakes: '把体积流量数值直接填入速度输入框，或误用相反法向。',
  relatedControls: ['bc-mass-flow-inlet', 'bc-pressure-outlet', 'general-operating-conditions'],
})

add(['velocity-inlet-turbulence'], boundaries + '#flu_ug_Velocity_Inlet', {
  choices: [
    ['Intensity and Hydraulic Diameter', '按湍流强度与截面水力直径估计入口湍流尺度，适用于能用该尺度描述的内部流。'],
    ['Intensity and Length Scale', '适合有代表性湍流长度尺度的入口。'],
    ['直接指定输运量', '有测量或上游计算结果时，可按所选湍流模型填入 k 与 ε 或 ω 等量。'],
  ],
  steps: ['先确定湍流模型及入口所代表的上游流况。', '选择与已有物理量匹配的指定方式，再输入强度和尺度或直接给定输运量。', '在入口影响明显时，比较合理变化的湍流输入对目标量的影响。'],
  example: '对已知内径、但缺少实测湍流剖面的管道入口，可用相符的强度与水力直径作初始设置。已充分发展的实测入口可进一步使用相应数据。',
  checkItems: ['检查入口湍流强度、长度尺度或水力直径是否来自工况估算。', '核对测得或估算值是否与雷诺数和上游发展程度一致'],
  commonMistakes: '把水力直径当成适用于任意入口的固定湍流长度尺度。',
  relatedControls: ['bc-velocity-inlet', 'models-viscous', 'viscous-kw-sst'],
})

add(['bc-pressure-outlet', 'pressure-outlet-gauge', 'pressure-outlet-backflow'], boundaries + '#flu_ug_Pressure_Outlet', {
  whatItIs: '压力出口用给定的出口压力约束流动。对亚声速流出指定静压，出现回流时使用相应的回流条件。',
  choices: [['Gauge Pressure', '按操作压力基准输入压力。亚声速流出时用于指定静压。'], ['Backflow', '发生局部流入时采用相应的温度、组分、湍流和相状态等设置。']],
  steps: ['选中出口并核对出口静压与 Operating Pressure 基准。', '填写工况可能需要的回流属性。', '监控出口正反向流量以及质量收支，检查出口所在位置。'],
  example: '出口与大气连通且操作压力采用当地大气压时，表压通常设为 0。若出口切在大范围回流区内，应核对边界位置和真实外部工况。',
  checkItems: ['分清表压与绝压', '判断回流是否符合物理现象、是否影响工程量'],
  commonMistakes: '看到回流提示就盲目更改出口压力，且忽略出口截面位置与回流属性。',
  relatedControls: ['operating-pressure', 'bc-velocity-inlet', 'general-check'],
})

add(['bc-wall', 'wall-thermal'], boundaries + '#flu_ug_Wall', {
  whatItIs: '壁面边界描述壁面对流动和传热的约束，包含速度与剪切设置，以及开启 Energy 时所需的热条件。',
  choices: [['指定温度或热流', '输入已知壁面温度或热流密度。绝热可用零热流边界。'], ['对流或辐射', '用于等效外部环境换热，需给定环境及对应参数。'], ['Coupled', '用于相邻区域的耦合传热，检查两侧及对应的 wall-shadow。']],
  steps: ['在 Momentum 按实际速度与参考系设置壁面。', '开启 Energy 后在 Thermal 选择已有的温度、热流、外部换热或耦合条件。', '核对材料、壁厚、方向与整体热流。'],
  example: '给固体输入电加热功率、并显式划分冷却水域时，流固公共界面使用耦合传热，外露表面按工况设置散热。',
  checkItems: ['移动壁、旋转域和绝对速度应使用一致的参考系', '区分面热流密度、体热源和总热功率'],
  commonMistakes: '给流固耦合界面误设固定温度，切断两侧温度与热流的联动。',
  relatedControls: ['energy-enable', 'cell-zone-source-enable', 'models-radiation'],
})

add(['solution-methods-coupling', 'methods-pressure-velocity', 'methods-transient-formulation'], methods, {
  whatItIs: 'Solution Methods 决定控制方程各向导数如何离散，以及压力与速度如何联立求解。合理的算法能在保持数值稳定的前提下大幅降低伪扩散并加快收敛。',
  coreConcept: '数值方法由三块独立配置组成：① 压力-速度耦合（怎么平衡连续性与动量）；② 空间离散梯度与插值格式（怎么由单元中心值重构交界面通量）；③ 瞬态时间离散格式（怎么近似 ∂/∂t）。迎风阶数越高假扩散越少、峰谷越锐利，但对网格扭曲更敏感。',
  choices: [['SIMPLE / SIMPLEC', '分离式依次求解动量与压力修正方程，内存占用最低，是常规稳态工业网格的可靠基线。'], ['PISO', '每个时间步内执行一次预测 + 两次修正，显著减弱时间步长内的耦合分裂误差，适合较大时间步或网格微扭曲下的瞬态压力基计算。'], ['Coupled', '将动量与连续性方程组成全耦合线性系统联立求解，瞬态收敛性更强、受强体力和大旋转网格影响更小，但需要约 1.5~2 倍内存。'], ['时间离散 First vs Second Order Implicit', '二阶隐式时间误差与 Δt² 成正比，是涡脱落、声学及精算瞬态首选；一阶隐式耗散大、极稳定，可用于起步过渡。']],
  parameterEffects: [
    ['First Order vs Second Order Upwind', '一阶迎风极其稳定但有显著数值扩散（会钝化射流和温度边界）；正式交付结果至少应确保动量与能量为 Second Order Upwind 或 QUICK。'],
    ['Warped-Face Gradient Correction / High Order Term Relaxation', '对多面体、高长宽比或轻微扭曲网格开启能改善梯度精度并稳住高阶格式。'],
  ],
  steps: ['先根据 Steady/Transient 与内存规模选定压力-速度耦合方案（稳态复杂流动首选 Coupled 或 SIMPLE）。', '把动量、能量、压力设为匹配精度的二阶或 PRESTO!/Body Force Weighted 格式；起步发散时可先用一阶热身再切回二阶。', '观察残差下降斜率与目标监控量，对比一阶与二阶及时间步之间的敏感性。'],
  example: '旋转浮力自然对流腔体稳态计算中，先采用 Coupled + PRESTO!（处理强体力压力梯度）+ Second Order Upwind；若网格极差导致发散，可开启 Pseudo Time Method 中的保守时间步或先跑 100 步一阶迎风初场。',
  checkItems: ['区分压力速度耦合、空间迎风阶数与时间离散三个层级，不混为一谈', '确认最终结果不是在一阶迎风数值粘性主导下交出的'],
  commonMistakes: '误把 SIMPLE/Coupled 当成湍流模型，或者全程一直用 First Order Upwind 算完导致压降/射流扩散严重失真。',
  relatedControls: ['general-transient', 'general-pressure-based', 'run-time-step-inline'],
})

add(['run-calculate', 'run-calculation-calculate', 'run-time-step-inline', 'run-calculation-time-step'], calculation, {
  coreConcept: '“跑完指定步数”只代表循环到达终点，不代表数学上已经收敛，更不代表物理真实。工程验收必须同时满足三道防线：残差下降到量级、核心目标监控量稳定无单调漂移、进出口质量与能量通量闭合误差远小于特征量。',
  choices: [['稳态迭代', '每一步只是向固定平衡态逼近一次；遇到难收敛算例时配合监控量与 Flux Reports 找卡住的物理区域。'], ['瞬态固定时间步', '每走一步时间推进固定的 Δt，并在步内反复迭代直至该时刻平衡。适合需要等间隔采样、FFT 或与实验时刻对比的计算。'], ['瞬态自适应时间步', '根据截断误差或 Courant 数自动缩放 Δt，能加速平缓期计算并自动压小剧烈变化期的步长。']],
  parameterEffects: [
    ['Reporting Interval / Profile Update Interval', '决定日志刷屏频率和轮廓更新周期；太密拖慢磁盘/显卡刷新，建议高频监测由 Report File/Plot 承担。'],
    ['Check Case', '计算前的一键预检能提前揪出未定义材料的区域、未连接的界面和可疑网格问题。'],
  ],
  steps: ['点击 Check Case 快速排查遗漏设置，确认已完成 Hybrid/Standard 初始化。', '稳态设置足够的迭代次数（如 500~2000 步）并勾选监控显示；瞬态设定 Time Step Size、Number of Time Steps 及每步 Max Iterations（如 20）。', '先试跑 50 步或数个时间步查看日志残差、库朗数与物理量走势，确认无发散迹象后再执行长程计算或批处理续算。'],
  example: '对周期性热冲击问题做瞬态计算：设定总时长 20 s、Δt = 0.05 s（共 400 步）、步内迭代 20 次；试跑 20 步后发现残差每步都能降 3 个数量级且稳定在 8~12 次内收完，即可放心放开跑完全程并开启 Autosave。',
  checkItems: ['日志与监控曲线均需记录对应的物理时间或迭代步数', '结束计算前务必查验 Flux Reports 进出口质量净差与总热平衡'],
  commonMistakes: '残差曲线还呈明显斜率上升/漂移或仅因为到达默认迭代次数（如 0 或 200）停下，就直接截图出结论报告。',
  relatedControls: ['general-steady', 'general-transient', 'report-definition-type', 'autosave-frequency'],
})

add(['report-definition-type', 'report-plot-display'], 'flu_ug_reporting_sec_monitoring_solution.html', {
  choices: [['Mass Flow Rate', '用于进出口流量及质量平衡，注意符号和选中的边界。'], ['Area-Weighted Average', '按面积加权求表面平均，适合目标量按面积定义的场景。'], ['Mass-Weighted Average', '按质量流率加权，适合评价流过截面的体相平均温度等量，需关注回流。']],
  steps: ['明确工程量和计算对象，创建对应的 Report Definition。', '选择区域、变量和平均方式，再创建 Report Plot 或对应的输出。', '用已知基准或手算核对最初的监控数据。'],
  example: '冷却水出口温度可按需要使用质量流量加权，并结合入口状态和流量核对吸热量。',
  checkItems: ['确认对象、单位、法向和平均方式', '明确采样频率以及所处的时间或迭代位置'],
  commonMistakes: '混用面积平均与质量流率加权平均，或把一侧流量符号直接用于求和。',
  relatedControls: ['run-calculate', 'bc-pressure-outlet'],
})

export const fluentOperationExplanations = entries
