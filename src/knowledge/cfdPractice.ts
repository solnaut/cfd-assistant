const fluentDocs = 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/'

type Choice = { id: string; label: string }

export const selectionQuestions = [
  { id: 'time', label: '时间特征', choices: [{ id: 'steady', label: '只关注稳态量' }, { id: 'transient', label: '关注随时间变化' }] },
  { id: 'compressibility', label: '可压缩性 / Mach 数', choices: [{ id: 'low', label: '低速，密度随压力变化可忽略' }, { id: 'compressible', label: '密度随压力明显变化' }, { id: 'shock', label: '跨声速、超声速或存在激波' }, { id: 'unknown', label: '待评估' }] },
  { id: 'turbulence', label: '流态及关注点', choices: [{ id: 'laminar', label: '已有依据采用层流' }, { id: 'internal', label: '常规内流湍流' }, { id: 'separation', label: '关注逆压梯度、分离与近壁传热' }, { id: 'swirl', label: '强旋流或显著湍流各向异性' }, { id: 'unknown', label: '待评估（含可能转捩）' }] },
  { id: 'thermal', label: '热效应', choices: [{ id: 'isothermal', label: '等温且不关心热输运' }, { id: 'energy', label: '传热或共轭传热' }, { id: 'buoyancy', label: '浮升力或自然对流' }, { id: 'radiation', label: '需要考虑热辐射' }] },
  { id: 'phases', label: '相态', choices: [{ id: 'single', label: '单相' }, { id: 'interface', label: '清晰的自由液面或可解析的界面' }, { id: 'mixture', label: '分散相，关注整体混合与滑移' }, { id: 'eulerian', label: '分散相，关注各相独立输运及相间作用' }, { id: 'particles', label: '可按离散粒子轨迹描述' }] },
  { id: 'motion', label: '旋转域与相对运动', choices: [{ id: 'none', label: '无旋转域' }, { id: 'mrf', label: '旋转域，关注准稳态平均作用' }, { id: 'sliding', label: '关注转静干涉或真实相对位置变化' }] },
] as const satisfies Array<{ id: string; label: string; choices: Choice[] }>

export type SelectionAnswers = { [Question in typeof selectionQuestions[number] as Question['id']]: Question['choices'][number]['id'] }

export const initialSelection: SelectionAnswers = {
  time: 'steady', compressibility: 'low', turbulence: 'internal', thermal: 'isothermal', phases: 'single', motion: 'none',
}

export interface PracticeAction {
  title: string
  detail: string
  controlId: string
  linkLabel: string
  relatedTool?: { label: string; to: string }
}

export function fluentControlLink(id: string) {
  return `/fluent-guide?locate=${encodeURIComponent(id)}`
}

export function getModelRecommendations(answers: SelectionAnswers): PracticeAction[] {
  const { time, compressibility, turbulence, thermal, phases, motion } = answers
  const phaseModel = phases === 'interface' || phases === 'mixture' || phases === 'eulerian'
  const transient = time === 'transient' || motion === 'sliding'
  const densityBased = compressibility === 'shock' && !phaseModel
  const solver: PracticeAction = {
    title: densityBased ? '将 Density-Based 纳入对比' : compressibility === 'unknown' ? '先核对 Mach 数与密度变化' : '从 Pressure-Based 起步',
    detail: phaseModel && compressibility === 'shock'
      ? '当前教学路径中的 VOF、Mixture、Eulerian 采用压力基。该工况含激波，应另核对密度模型和激波捕捉能力，不能仅凭此向导定型。'
      : densityBased ? '跨声速或激波问题可比较密度基和压力基 Coupled，核对密度状态方程、能量方程以及激波附近的网格分辨率。'
        : compressibility === 'unknown' ? '先用特征速度和声速估算 Mach 数。即使 Mach 数低，明显温差、压力变化或组分变化仍可能需要可变密度。'
          : compressibility === 'compressible' ? '压力基可处理可压缩工况。核对绝压、材料状态方程和能量方程后，再比较所需耦合方法。'
            : '低速工况可从压力基求解器建立基线。先核对连续性、边界条件及所关注的报告量。',
    controlId: densityBased ? 'general-density-based' : 'general-pressure-based', linkLabel: '定位 General 求解器',
    relatedTool: { label: '计算 Mach 数', to: '/calculators/dimensionless-numbers/mach-number' },
  }

  const turbulenceOptions: Record<SelectionAnswers['turbulence'], Pick<PracticeAction, 'title' | 'detail'>> = {
    laminar: { title: 'Laminar', detail: '使用已有工况依据。管流经验临界条件不宜直接套到复杂几何、分离或旋转流动。' },
    internal: { title: '两方程 RANS 基线', detail: '将 Realizable k–ε 作为可比较的起点。结合几何、近壁处理与目标 y⁺ 核对；关键结果应做网格与模型敏感性验证。' },
    separation: { title: '对比 k–ω SST', detail: '可作为关注逆压梯度和分离时的候选。应核对近壁分辨率、入口湍流和与基准数据的一致性。' },
    swirl: { title: '比较 RANS 基线与 Reynolds Stress', detail: '强旋流和各向异性可能要求直接描述雷诺应力输运。可比较 RSM 与较低代价的 RANS 基线。' },
    unknown: { title: '先判断层流、转捩或湍流', detail: '结合 Re、表面粗糙度、入口扰动和参考数据判断。仅有几何和平均速度时，模型暂作候选。' },
  }

  const actions: PracticeAction[] = [
    solver,
    { title: transient ? 'Transient 时间推进' : 'Steady 建立基线',
      detail: motion === 'sliding' ? '真实转静相对运动需要瞬态处理，即使目标是时均量。先核对转子角步长、接口与时间步独立性。'
        : transient ? '根据物理时间尺度与局部 CFL 选择时间步，并检查时间步独立性。' : '可先用稳态迭代建立基线，检查关键物理量是否保持稳定；持续周期变化时评估瞬态。',
      controlId: transient ? 'general-transient' : 'general-steady', linkLabel: '定位时间形式',
      relatedTool: { label: '估算 CFL 时间步', to: '/calculators/transient-time-step/cfl-time-step' } },
    { ...turbulenceOptions[turbulence], controlId: 'models-viscous', linkLabel: '打开 Viscous',
      relatedTool: { label: '换算入口湍流参数', to: '/calculators/flow-piping/inlet-turbulence' } },
  ]

  if (thermal !== 'isothermal' || compressibility === 'shock' || compressibility === 'compressible') {
    actions.push({ title: '核对 Energy 与热边界',
      detail: thermal === 'buoyancy' ? '核对重力方向和密度对温度的响应；Boussinesq 只适用于相对密度变化足够小的场合。'
        : '启用能量方程后核对材料的热物性、壁面热条件和温度单位。可压缩工况同时核对绝压与状态方程。',
      controlId: 'models-energy', linkLabel: '打开 Energy' })
  }
  if (thermal === 'radiation') actions.push({ title: '比较辐射模型', detail: '先判断介质参与性和光学厚度。非参与介质可评估 S2S；介质参与时可比较 DO、P1 等，核对边界发射率。', controlId: 'ribbon-model-radiation', linkLabel: '打开 Radiation' })

  const phaseNotes = {
    interface: ['VOF', '用于解析清晰界面。核对界面附近的网格和时间尺度。Explicit 需要 Transient，稳态只提供 Implicit。'],
    mixture: ['Mixture', '从混合物输运与滑移假设判断是否适合工况。若需独立解析各相输运，可与 Eulerian 比较。'],
    eulerian: ['Eulerian', '按相核对体积分数、材料、相对及相间作用，曳力和传热按工况逐项选取。'],
    particles: ['Discrete Phase Model', '核对粒子尺度、负载、轨迹及连续相耦合需要。高体积分数时需另行核对稠密颗粒模型。'],
  } as const
  if (phases !== 'single') {
    const [title, detail] = phaseNotes[phases]
    actions.push({ title, detail, controlId: phases === 'particles' ? 'ribbon-model-dpm' : 'models-multiphase', linkLabel: '打开相态模型' })
  }
  if (motion !== 'none') actions.push({ title: motion === 'mrf' ? 'MRF 旋转参考系' : '滑移网格与瞬态接口',
    detail: motion === 'mrf' ? '旋转域可先评估 MRF 准稳态近似。检查轴、原点、角速度单位和相邻域交界。'
      : '分配转动区域与对应接口，核对相对运动、时间步与周期监测量。',
    controlId: motion === 'mrf' ? 'cell-zone-fluid' : 'tree-mesh-interfaces', linkLabel: '定位旋转域设置' })

  actions.push(
    { title: densityBased ? '密度基离散与时间推进' : '压力–速度耦合与离散',
      detail: densityBased ? '按密度基方法核对通量与离散选项，并检查激波附近的有界性与网格敏感性。'
        : `${phases === 'eulerian' ? 'Eulerian 可比较 Phase Coupled SIMPLE 与适用的耦合方法。' : transient ? '可在压力基瞬态下比较 PISO 与适用的 Coupled 等方法。' : '可从 SIMPLE 建立压力基基线，再评估 Coupled。'} 对适用方程检查二阶离散，并比较工程量而非只看残差。`,
      controlId: densityBased ? 'methods-momentum' : 'methods-pressure-velocity', linkLabel: '定位 Solution Methods' },
    { title: '初始化并监测关键物理量', detail: `可先尝试 Hybrid Initialization，再检查初始场。${phases === 'interface' ? '按初始液位使用 Patch 设置相体积分数。' : ''}开始迭代后同时监测残差、守恒与关心的工程量。`,
      controlId: 'initialization-run-inline', linkLabel: '定位 Initialization' },
  )
  return actions
}

export const cfdSelectionSources = [
  { label: 'Fluent 2024 R2 · 湍流模型选型', to: fluentDocs + 'flu_ug_sec_turb_choosing.html' },
  { label: 'Fluent 2024 R2 · 压力–速度耦合', to: fluentDocs + 'flu_ug_sec_uns_solve_pvel_1.html' },
  { label: 'Fluent 2024 R2 · 多相流设置', to: fluentDocs + 'flu_ug_sec_multiphase_setup.html' },
]

function check(title: string, detail: string, controlId: string, relatedTool?: PracticeAction['relatedTool']): PracticeAction {
  return { title, detail, controlId, relatedTool, linkLabel: '定位 Fluent 控件' }
}

const mesh = check('检查网格与域量级', '从负体积、连通性和域尺寸开始，回查异常单元所在区域。', 'ribbon-mesh-check')
const boundary = check('核对边界与单位', '对照物理工况核对流向、进口与出口组合、表压/绝压、速度和材料单位。', 'bc-pressure-outlet', { label: '换算表压与绝压', to: '/unit-converter' })
const monitor = check('核查守恒与工程量', '监测净质量流率，并对照计算域的源项、累积量或相间传质。残差值应与物理量监测一起判断。', 'ribbon-fluxes-report')
const timestep = check('核对时间尺度', '对瞬态比较更小时间步下的频率、振幅及每步迭代收敛。', 'run-time-step-inline', { label: '估算时间步长', to: '/calculators/transient-time-step/cfl-time-step' })

export const diagnosisPaths = [
  { id: 'divergence-fpe', label: 'Floating point exception / 发散', steps: [mesh, boundary,
    check('检查初始化与异常变量', '查看首次异常发生的方程及位置。核对初始场、物性和源项量级，再测试时间步或松弛调整。', 'initialization-run-inline')] },
  { id: 'oscillation', label: '残差周期震荡', steps: [monitor, boundary, timestep,
    check('区分物理非定常和数值震荡', '查看压降、力或温度是否也有稳定周期。对照网格、时间步敏感性和流动机理。', 'general-transient')] },
  { id: 'reversed-flow', label: 'Reversed flow / 压力出口回流', steps: [
    check('查看回流位置及持续时间', '从速度分布辨别回流位于分离区还是出口附近的瞬态扰动。检查出口是否切过再循环区。', 'bc-pressure-outlet'),
    check('核对 Backflow 条件', '按实际可能流入的状态核对回流温度、湍流和相组成。', 'bc-pressure-outlet'), monitor] },
  { id: 'temperature-limit', label: 'Temperature limited / 温度超限', steps: [
    check('追查热边界和温度单位', '核对给定的是绝对温度还是温差，以及壁面热流方向和材料热物性。', 'bc-wall', { label: '换算温度与温差', to: '/unit-converter' }),
    check('检查局部极值与初始场', '记录热点或低温点附近的网格、热源和初始场。调整温度限制前先确认超限原因。', 'ribbon-limits'), mesh] },
  { id: 'mass-balance', label: '质量流量不守恒', steps: [monitor, boundary, mesh] },
  { id: 'vof-instability', label: '多相流界面扩散或发散', steps: [mesh,
    check('确认界面公式与初始相分布', '核对相材料、体积分数、离散公式和初始 Patch 区域，结合界面位置变化检查误差。', 'models-multiphase'),
    check('核对显式相分数步长控制', '显式 VOF 使用界面附近的 Courant 限制进行子步进。隐式分支应检查所用物理时间步的独立性。', 'vof-courant'), timestep] },
]
