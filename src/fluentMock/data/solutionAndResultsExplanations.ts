import type { FluentMockExplanation } from '../fluentTypes'

type PartialExplanation = Partial<FluentMockExplanation>

function addEntry(
  target: Record<string, PartialExplanation>,
  ids: string[],
  entry: PartialExplanation,
) {
  for (const id of ids) {
    target[id + '-explanation'] = entry
  }
}

const entries: Record<string, PartialExplanation> = {}

// --- Tree Nodes ---
addEntry(entries, ['tree-methods', 'ribbon-methods'], {
  whatItIs: 'Solution Methods 决定流体质量、动量、能量及湍流输运偏微分方程组的离散迎风阶数（空间精度）、时间离散格式与压力-速度耦合算法。',
  whenToUse: '在确定 Steady/Transient 与物理模型之后、初始化开始求解之前配置合理求解方法与精度阶数。',
  recommendation: '现代压力基稳态与多数常规复杂问题推荐 Coupled + Second Order Upwind（动量/能量），湍流起步可选 First Order Upwind 热身，稳定后再切换回 Second Order Upwind 出最终正式数据；强扭曲多面体可勾选 Warped-Face Gradient Correction。',
  checkItems: ['正式工程数据不要停留在全部一阶迎风，否则数值假扩散严重削峰', '瞬态精算采用 Second Order Implicit 时间格式'],
  commonMistakes: '用一阶迎风算完图快直接出报告，发现射流偏短、换热偏低或涡旋消失。',
})

addEntry(entries, ['tree-controls', 'ribbon-controls'], {
  whatItIs: 'Solution Controls 管理迭代收敛稳定性工具箱：各方程亚松弛因子（Under-Relaxation Factors）、全耦合 Courant 数、开关单方程冻结求解（Equations）及物理变量防越界保护上限（Limits）与多尺度 AMG 线性求解器。',
  whenToUse: '求解出现震荡或某方程发散但网格与边界确认无误时，可适度压低对应亚松弛因子/Courant 数或做分步冻结求解（如先固定流场再解能源方程）。',
  recommendation: '仅在常规参数确实震荡不收时才微调默认亚松弛因子；切勿通过强行大幅调小松弛因子到 0.05 来掩盖原本边界设错或负体积引起的物理错误——那样残差假平稳其实流场几乎走不动！',
  checkItems: ['调整 URF 后监控残差降幅并确认核心物理量仍在实质收敛而非原地踏步', '仅在确有极端物理越界时调节 Limits'],
  commonMistakes: '为了压住报错把压力和动量松弛全降到 0.05，看残差不动就以为“收敛”了，实际上每步修改量几乎为零，流场纹丝没动。',
})

addEntry(entries, ['tree-initialization', 'ribbon-initialize'], {
  whatItIs: 'Initialization 在网格全部单元上填入第 0 步初场（初始压力、速度与温度），为迭代求偏微分非线性方程组提供合理的启动起点。',
  whenToUse: '每次新建算例开始求解前、大幅调整物理模型或修改流体材料后均必须执行一次初始化；切勿在未初始化状态下点 Calculate。',
  recommendation: '复杂多通流流道或带温度场的算例首选 Hybrid Initialization（自动跑 10 步势流估计压力与平滑流向速度初场）；遇到明确局部初场需求（如 VOF 初始液位水深、气罐高压初始区或点着火高温区）时，Initialize 后立即配合 Patch 对 Cell Register/Region 精确赋初值！',
  checkItems: ['使用 VOF 或燃烧点火算例几乎都必须用 Patch 设置初始相分布或高温火核', 'Standard Initialization 可选择从入口边界 Compute From 自动估算统一初值'],
  commonMistakes: '只点击 Hybrid Initialization 却忘了随后对 VOF 水箱液体区做 Patch，导致整个水箱开算时全是空气，或反过来全被填成液体！',
})

addEntry(entries, ['tree-report-definitions', 'tree-monitors', 'ribbon-residuals', 'ribbon-convergence-conditions', 'monitors-residuals', 'monitors-convergence-conditions', 'monitors-statistics'], {
  whatItIs: 'Report Definitions 与 Monitors 在求解过程中实时计算、打印、绘图（Report Plot）与写入数据文件（Report File）关注区域的物理工程量（如出口压降、壁面最高温度、阻力 Cd、进出口净质量流），并定义残差收敛线与稳定自动停算准则（Convergence Conditions）。',
  whenToUse: '比仅仅看默认残差（1e-3）重要得多——任何工程仿真开算之前至少应建 2~3 个工程监控量（压降/温度/质量差），才能科学判定何时真正收敛！',
  recommendation: '至少配置：① 关心表面的 Mass Flow Rate 或阻力/力矩；② 关键截面 Average Pressure / Temperature 或 Max Temperature；③ 将 Convergence Conditions 加到核心物理监控上（如连续 20 步波动率 < 1e-4），避免被默认残差虚降迷惑。',
  checkItems: ['务必区分 Mass-Weighted Average（截面平均温压首选）与 Area-Weighted Average', '确认选中的 Surface 或 Cell Zone 未遗漏多入口或多出口分支'],
  commonMistakes: '光靠默认 Residual Monitors 下降到 1e-3 就停算，实际温度场或总压还在以每百步 5% 的速率持续缓慢漂移！',
  operation: {
    coreConcept: '残差（Residuals）反映的是“上一迭代步到这一迭代步数学余量的变化”，而不等于物理答案已经找准。尤其是共轭固体导热热容大或低速分离流动，速度残差早已降到 1e-4 时温度或涡量可能还在慢慢爬坡，唯有直接盯住工程物理量曲线走平（Monitor Plot）才算真收敛。',
    steps: ['在 Report Definitions 新建 Surface Report（如出口静压、出口质量加权温度）或 Volume Report（芯片最高体温度）。', '同时勾选 Create Report Plot 与 Report File 以便实时观曲线与后续导数分析。', '可选配置 Convergence Conditions 让关键指标连续稳定后再触发停算。'],
    example: '电子冷板计算创建两个核心监控：`outlet-mass-temp`（Mass-Weighted Average 静态温）与 `chip-max-temp`（固体体域最高温 Volume Maximum）；跑 400 步时残差已降到 1e-4，但见芯片最高温还在往上涨，一直追算到第 850 步温度拉平后才收工。',
  },
})

addEntry(entries, ['tree-calculation-activities', 'ribbon-autosave', 'ribbon-execute-commands', 'ribbon-data-sampling', 'calculation-autosave', 'calculation-execute-commands', 'calculation-data-sampling', 'monitors-statistics'], {
  whatItIs: 'Calculation Activities 控制计算期间自动触发的辅助任务：按间隔自动存盘（Autosave）、按物理时间记录时均场与脉动 RMS（Data Sampling for Time Statistics）、定时执行 TUI 命令（Execute Commands）以及阶段输出颗粒或体数据文件。',
  whenToUse: '跑长时间瞬态分析（必须按时间间隔 Autosave 才能做流场动画和时间对比）、统计非定常涡脱落或 LES 平均风场及均方根脉动强度（需启用 Data Sampling）。',
  recommendation: '瞬态算例开始长程运行前务必设好 Autosave Every Time Steps 及 Retain Most Recent Files（防爆磁盘同时留关键帧）；统计瞬态时均值前，一定要等初始起步干扰波走出计算域进入等幅周期段之后再开启 Data Sampling！',
  checkItems: ['瞬态导出动画或作图需注意 Autosave 是否同时保留了 Case & Data 还是仅更新覆盖旧 Data', '统计非定常平均速度场要明确开启 Flow Statistics，关注热疲劳传热则加上 Wall Statistics'],
  commonMistakes: '瞬态辛辛苦苦跑了两天几万个时间步，算完想回看第 2 秒流场时才发现没设 Autosave 只存下了最后一秒帧！',
})

addEntry(entries, ['tree-run-calculation', 'ribbon-run'], {
  whatItIs: 'Run Calculation 是启动和控制实际数值迭代/物理时间步进的总控台，设定总迭代次数（稳态）或时间步长 Δt、总时间步数与步内迭代上限（瞬态），并提供 Check Case 算前预检。',
  whenToUse: '全部网格、物理、边界、方法与监控建完并初始化之后正式启动求解、暂停检验或续算。',
  recommendation: '每次大算先点 Check Case 排查疏漏，然后跑几十步做一次“冒烟试算”，盯 Console 残差无飙升、入口出流向与压降数量级正常后，再加多步数正式完成。',
  checkItems: ['确保至少完成一次 Initialize（否则报错无法算）', '瞬态检查 Time Step Size 与步内 Max Iterations 是否每步都能降 2~3 个数量级再迈向下一步'],
  commonMistakes: '只改了 Run Calculation 迭代次数却忘了刚换完入口速度需要重新 Initialize 或 Check Case。',
})

// --- Methods & Controls Sub-controls ---
addEntry(entries, ['methods-gradient'], {
  whatItIs: 'Gradient 指定偏微分扩散项及面插值重构时在每个单元中心计算物理量空间梯度 ∇φ 的离散方法（Least Squares Cell Based / Green-Gauss Cell Based / Green-Gauss Node Based）。',
  whenToUse: '在 Solution Methods 中随所有方程通用设定。',
  recommendation: '现代 Fluent 对绝大多数非结构四面体、Poly-Hexcore 和多面体网格均推荐默认的 Least Squares Cell Based（最小二乘法：兼具最高综合精度与高计算效率）；传统极度扭曲纯四面体/三角形网若需极端稳健可比对 Green-Gauss Node Based（计算最耗费内存但偏斜容差大）。',
  checkItems: ['Poly-Hexcore / Polyhedra 首选 Least Squares Cell Based', 'Green-Gauss Cell Based 在粗糙非正交三角网格上梯度误差相对明显'],
  commonMistakes: '盲目换用较旧的 Green-Gauss Cell Based 导致在普通四面体/多面体网界面算出来的热流与梯度出现微小震荡。',
})

addEntry(entries, ['methods-pressure-scheme'], {
  whatItIs: 'Pressure 空间离散格式控制压力场从单元中心外推插值到交界面的方式，在应对强体积力、强旋流、大曲率或压力梯度陡峭工况时决定连续性平衡稳健性。',
  whenToUse: '在 Pressure-Based 求解器下所有算例均须关注。',
  recommendation: '一般平稳内流选默认 Second Order（精度最优）；存在自然对流浮力（开启重力+大密度差）、强旋转机械（MRF/多相气液界面）或多孔阶跃阻力时强烈推荐选用 Body Force Weighted 或 PRESTO!（Staggered-style 交错压力插值），避免界面产生锯齿伪压差！',
  checkItems: ['高旋转/多相/浮力/多孔介质突跃首选 PRESTO! 或 Body Force Weighted', 'Standard 精度最低一般不作正式交付'],
  commonMistakes: '用着高强度自然对流或气液 VOF 自由液面，却因为压力离散留了默认 Second Order 造成气液交界面或密度跃变区连续性振荡不收！',
})

addEntry(entries, ['methods-momentum', 'methods-tke', 'methods-omega', 'methods-energy-scheme'], {
  whatItIs: '分别控制动量、湍动能 k、比耗散率 ω/ε 以及能量温度输运方程的对流项空间迎风插值格式（一阶/二阶迎风/QUICK/Bounded Central Differencing 等）。',
  whenToUse: '调整对流项截断精度、压制数值耗散或处理刚起步的高非线性稳定问题时选择。',
  recommendation: '最终工程出图务必保证 Momentum 与 Energy 为 Second Order Upwind（六面体对齐流向可评估 QUICK）；仅当极度不稳需要热身时暂用 50~100 步 First Order Upwind 过渡，稳定后立刻切回二阶！注意 LES 模型必须配 Bounded Central Differencing 或 Central Differencing，不可用一二阶迎风过度耗散涡尺度！',
  checkItems: ['确认正式计算结果处于 Second Order Upwind 以上高精度阶数', 'LES 尺解析湍流勿用 First Order Upwind，否则将把本应解出来的微涡抹平'],
  commonMistakes: '拿一阶迎风算到底得出压降虚高、射流过快衰减和传热偏差 20% 却不知原因。',
})

addEntry(entries, ['methods-volume-fraction'], {
  whatItIs: 'Volume Fraction 空间离散专门用于多相流（尤其是 VOF）中追踪清晰气液/液液交界面各相体积分数分布，决定界面究竟能算得有多“锐利”而不涂抹成一团雾。',
  whenToUse: '启用 Multiphase（VOF / Mixture / Eulerian）后解锁显示与选择。',
  recommendation: '算清晰自由液面（如水箱晃荡、射流液滴）在瞬态下必选 Geo-Reconstruct（几何重构：能还原刀锋般锐利的单单元厚界面！）或 Compressive；稳态 VOF 或普通分散 Mixture 需用 Compressive / Modified HRIC 或二阶格式（注意 Geo-Reconstruct 不适用于稳态！）。',
  checkItems: ['瞬态追踪明晰水气自由面优先选 Geo-Reconstruct（配 Explicit VOF）或 Compressive', '若算稳态 VOF 界面需用 Modified HRIC 或 Compressive 防止无法算'],
  commonMistakes: '想看清晰水花波浪液面却误用 First Order Upwind，结果液面直接虚化成跨越七八层网格的雾状渐变层！',
})

addEntry(entries, ['methods-coupled-courant', 'methods-dbns-formulation', 'methods-dbns-flux', 'methods-dbns-courant', 'methods-warped-face', 'methods-high-order-relax', 'methods-pseudo-time'], {
  whatItIs: 'Coupled / Density-Based 求解高阶控制组：包含全耦合/密度基步进 Courant 数（控制伪时间跨步大小）、通量分裂格式（Roe-FDS / AUSM）、畸变面梯度修正（Warped-Face）及高阶松弛（HOTR）稳定器。',
  whenToUse: '采用 Pressure-Based Coupled 或 Density-Based 求解高速/强非线性/多面体网格问题，需要改善收敛速度或解决偶发性高频震荡时调整。',
  recommendation: 'Coupled Courant Number 默认 200 较快但初算强激波/强热交换可压到 20~50 起步，稳态跑平可打开 Pseudo Time Method（选 Global Time Step）自动找稳健步长；使用多面体或边界微扭曲网格打开 Warped-Face Gradient Correction 与 High Order Term Relaxation 可大幅稳住二阶精度收敛！',
  checkItems: ['Density-Based 计算超音速激波与强剪切常选 AUSM（对强强激波低耗散稳定性极佳）或 Roe-FDS', '出现局部高频小跳动可压低 Courant 数或开启 HOTR'],
  commonMistakes: '强可压缩激波算例把 Density-Based Courant Number 直接从 5 强拉到 50 起步，第 2 步就浮点溢出发散。',
})

addEntry(
  entries,
  [
    'controls-urf-pressure',
    'controls-urf-density',
    'controls-urf-body-forces',
    'controls-urf-momentum',
    'controls-urf-tke',
    'controls-urf-omega',
    'controls-urf-turb-visc',
    'controls-urf-energy',
    'controls-under-relaxation',
    'controls-equations',
    'controls-limits',
    'controls-reset-default',
  ],
  {
    whatItIs: 'Solution Controls 精细管理各输运方程每次迭代更新的步幅占比（Under-Relaxation Factors，亚松弛因子 0~1）、选择性启用/冻结某个方程组以及限幅物理量边界 Limits（最低/最高静态温、最大湍流黏性比）。',
    whenToUse: '稳态耦合（或分离式 SIMPLE）遇到温度/密度剧烈震荡或某方程迟迟卡滞时用于调节稳健步幅或分步热启动。',
    recommendation: 'SIMPLE 分离求解典型推荐基准 URF 约为 Pressure=0.3、Momentum=0.7、k/ω=0.8、Energy/Density=1.0；若开局湍流或能量冲顶报错，先把对应 URF 适当下调（例如 Momentum 到 0.5、Density/Body Force 到 0.5）或者先去 Equations 仅算流场收敛后再打开 Energy；排查完后建议逐步恢复常规松弛度！',
    checkItems: ['URF 过低会造成“伪收敛”（曲线走平是因为每步几乎没更新），不能用来掩盖错误设置', '出现 Turbulent Viscosity Ratio exceeded limit 提示时，不要一味抬高 Limits 上限，应优先回头查网格畸变、入口湍流设定或局部死区边界'],
    commonMistakes: '碰到 Turbulent Viscosity Ratio 超过默认上限 10⁵ 的警告，直接进 Limits 把上限调成 10¹⁰ 眼不见为净——这通常是入口湍流强度尺度设错或回流/坏网格引起的真问题信号！',
  },
)

addEntry(
  entries,
  [
    'initialization-ref-frame-inline',
    'initialization-std-xvel',
    'initialization-std-temp',
    'initialization-run-inline',
    'initialization-hybrid-settings',
    'initialization-patch',
    'initialization-reset',
  ],
  {
    whatItIs: '提供 Standard / Hybrid（混合初始化）的具体参考系、初始速度与初始温度参数配置，以及局部覆盖写入 Patch 与重置初始化字段功能。',
    whenToUse: '选择标准初始化直接全城填同值、调优 Hybrid 迭代次数/初场速度维持，或者针对热区、点火点、VOF 液柱单独作局部 Patch。',
    recommendation: '对管路/外流场推荐用 Hybrid Initialization（快速生成连贯顺畅无旋初场加速早期收敛）；若算封闭室内自然对流（全封闭无进出口边界，Hybrid 势流全为零），可用 Standard 给定初始室温与微扰，并对热壁或核心热点配合 Patch 设置热启动温度。',
    checkItems: ['确认初始压力基准与温度接近真实工作起态，防止可压缩 Ideal Gas 密度在第一步崩掉', 'Patch 前先建好精确 Cell Register 或选对 Zone 再确认写入'],
    commonMistakes: '封闭水箱/自然对流腔没有进出口边界，却想让 Hybrid Initialization 自动猜出对流速度，必须配合重力+实际热边界迭代驱动起来。',
  },
)

// --- Results & Post-Processing ---
addEntry(entries, ['tree-surfaces', 'ribbon-surface-create', 'ribbon-surface-manage', 'ribbon-create-point-surface', 'ribbon-create-line-rake', 'ribbon-create-plane-surface', 'ribbon-plane-surface', 'ribbon-create-iso-surface', 'ribbon-iso-surface', 'ribbon-create-iso-clip', 'surface-point', 'surface-line-rake', 'surface-plane', 'surface-iso-surface', 'surface-iso-clip'], {
  whatItIs: 'Create & Manage Surfaces 用于在已经算出的计算域中抽取辅助几何探测实体（监测点 Point、测线/耙 Line/Rake、三维切平面 Plane、等值面 Iso-Surface 与按阈值裁剪面 Iso-Clip），而不改变计算网格。',
  whenToUse: '需要观察流体内部某剖面的速度/温度云图、提取圆管径向速度分布曲线（XY Plot）、截取 310 K 等温面或 0.5 液相体积分数 VOF 液面三维外形时创建。',
  recommendation: '分析三维管道核心温度与速度结构，用 Plane Surface（如 Z=0 或 X=0.1m）；在等值面 Iso-Surface 中选 `Phases → Volume fraction = 0.5` 可直观立体渲染水花、液柱及气泡自由界面，再用 Display/Manage Surfaces 一键复用或清理冗余截面。',
  checkItems: ['创建的 Point / Line / Plane 坐标必须确实落在当前 Mesh Domain Extents 包络之内（注意 mm/m 尺度！），否则切片画出来为空'],
  commonMistakes: '网格按 m 缩放了但创建截面随手按 mm 坐标填 `X = 50`，截面直接画到几何外头十万八千里，画云图一片空白还以为没算出来！',
  operation: {
    coreConcept: '边界界面（inlet、outlet、wall）是流体域天然的外壳，而计算域“肚子里面”是看不见的；创建 Surface 就是往三维流场内部插一根探针（Point）、一把直尺（Line/Rake）、一把手术切刀（Plane）或一块等浓度切片（Iso-Surface），让原本藏在体内的速度峰值、热核心与涡旋暴露出来。',
    choices: [
      ['Point / Line / Rake', 'Point 用于随步监控单点参数或做探针点 FFT；Line（沿连续线段采样）/ Rake（等间距离散探针点）专为画管道截面速度和温度 XY 分布图而建。'],
      ['Plane Surface', '用一点一法向、三点法或恒定 X/Y/Z 坐标切出剖面，是绘制二维纵截面云图和矢量图的最常用工具。'],
      ['Iso-Surface / Iso-Clip', '提取物理量处处相等的曲面（如 VOF=0.5 气液自由液面、特定 Q 准则涡结构面、超温报警包络面），Iso-Clip 则切去低于/高于阈值部分只留下关注范围。'],
    ],
    steps: ['根据你想观察点测量、沿线分布、二维剖切还是等值面形态，挑选对应 Surface 类型。', '核对长度单位（m/mm）填入点、法向矢量、坐标系数值或选定等值面变量后点击 Create。', '打开 Contours / Vectors / XY Plot 时直接选中新建的 Surface 名称即可实时绘图。'],
    example: '画弯管中心纵向截面速度云图：新建 Plane Surface 取 `YX-Plane` 坐标 Z=0 命名 `mid-plane`；要提取出口前 50 mm 截面从管壁到中心的抛物线速度分布，再建一条径向 Line 并喂给 XY Plot。',
  },
})

addEntry(entries, ['tree-graphics', 'tree-plots', 'tree-reports', 'ribbon-contours', 'ribbon-vectors', 'ribbon-pathlines', 'ribbon-particle-tracks', 'ribbon-scene', 'ribbon-xy-plot', 'ribbon-histogram', 'ribbon-fft', 'ribbon-fluxes-report', 'ribbon-forces-report', 'ribbon-surface-integrals', 'ribbon-volume-integrals', 'ribbon-reports', 'results-contours', 'results-vectors', 'results-pathlines', 'results-particle-tracks', 'results-scene', 'results-display-options', 'results-summary', 'plot-xy', 'plot-histogram', 'plot-fft', 'plot-residuals', 'results-fluxes', 'results-forces', 'results-surface-integrals', 'results-volume-integrals', 'results-reports'], {
  whatItIs: 'Results（后处理体系）提供从空间定性洞察到严密定量验收的全套工具：云图（Contours）、矢量（Vectors）、流线（Pathlines）、颗粒轨迹（Particle Tracks）、多图层合成场景（Scene）、沿线 XY 曲线与直方/频谱图（Histogram / FFT），以及质量/能量守恒通量（Fluxes）、壁面阻力与升力（Forces）、面/体积积分（Surface / Volume Integrals）及 Case Summary。',
  whenToUse: '每算完一步工程仿真，均按“先查守恒通量 Fluxes → 再看面/体积积分关键数值 → 再绘制切面云图/矢量/流线验证物理合理性”的顺序输出工程结论。',
  recommendation: '展示物理场平滑连续渐变推荐 Contours 勾选 Node Values；查看严格贴体壁面 y⁺ 与单网格级质量极值对比必须同时关一次 Node Values 看真实单元中心阶跃值；验收质量收支（Fluxes → Mass Flow Rate）确保所有入口+出口代数总净误差接近于零（通常 < 总流量 0.1%~1%）。',
  checkItems: ['Forces 报告不仅包含压差阻力（Pressure Force）还包含黏性摩擦阻力（Viscous Force），注意 Force Vector 与自由来流朝向保持正方向投影一致性', 'Surface Integrals 严格区别 Area-Weighted 与 Mass-Weighted，且传热总量查 Total Surface Heat Transfer Rate'],
  commonMistakes: '画云图开着默认 Local Auto-Range 不同工况截了几张彩图就硬放一块对比，实际上颜色条上下限尺度根本不同！对比多方案工况务必在 Display Options 或 Contours 里关闭 Auto Range 并手动统一色标最小值/最大值范围！',
})

// --- UDF, Named Expressions, Dashboard, Animations, Parallel, Design, Parameters ---
addEntry(
  entries,
  [
    'tree-named-expressions',
    'ribbon-udf-expressions',
    'ribbon-param-expressions',
    'expr-name',
    'expr-definition',
    'expr-use-in-bc',
  ],
  {
    whatItIs: 'Named Expressions（命名表达式）支持直接使用带真实物理单位的数学公式（含坐标 `x,y,z`、物理时间 `t`、内置变量 `VelocityMagnitude`、`StaticTemperature`、条件分支 `IF(...)` 及还原函数）定义抛物线入口分布、随时间规律开关边界、温变材料拟合或自定义监控指标，完全免编译 C 代码！',
    whenToUse: '当公式逻辑可以通过标准代数/三角/分段函数与坐标时间直接写出（如充分发展管流抛物线速度剖面、正弦脉冲入口、温度控制开关热源），应首选 Named Expressions 代替手写 UDF。',
    recommendation: 'Fluent Named Expressions 幂运算符号是 `**`（例如 `(y / 0.05 [m])**2`），物理常量和数字必须带方括号单位如 `[m s^-1]`、`[K]`，变量/坐标用 `sqrt(x**2 + y**2)` 而非自定义裸字母 `r`；输入完务必看实时单位量纲推演检查是否显示绿色匹配！',
    checkItems: ['确认表达式整体最终推导出的量纲与被绑定字段（如速度 m/s、热通量 W/m²）量纲一致', '支持在 Boundary Conditions 输入框旁的下拉直接选该 Expression 并可设为 Workbench Input Parameter'],
    commonMistakes: '把 MATLAB/Excel 的 `^` 幂次方或无量纲坐标数字直接写进 Fluent Expression（Fluent 报错要求用 `**` 且需要单位方括号 `[m]` 等），导致语法错误无法识别！',
    operation: {
      coreConcept: 'Named Expressions 相当于内置“强单位检查的安全版计算器语言”，无需配置 C 编译器即可实现空间不均匀剖面（如抛物线入口）、瞬态规律曲线（`sin(2*PI*5[Hz]*t)`）、物理状态反馈条件控制以及自定义监测指标。',
      steps: ['在 Named Expressions 新建表达式名称（如 `inlet_parabola`）。', '用正确 `**` 幂次、变量（如 `x, y, z, t`）和带方括号单位写出公式（例如 `2.5 [m s^-1] * (1 - (sqrt(x**2 + y**2) / 0.05 [m])**2)`）。', '确认语法和最终推导出正确单位后，到 Velocity Inlet 或热边界条件里直接选择使用，还可一键转为优化输入参数。'],
      example: '创建半径 0.05 m 圆管的层流充分发展抛物线速度入口（中心流速 2.5 m/s）：定义表达 `2.5 [m s^-1] * (1 - (sqrt(x**2 + y**2) / 0.05 [m])**2)` 命名为 `inlet_profile`，随后绑定到入口速度，即可精确生成充分发展抛物线剖面而免去写 UDF 或加长前置引导段。',
    },
  },
)

addEntry(entries, ['ribbon-udf-interpreted', 'ribbon-udf-compiled', 'ribbon-udf-hooks', 'ribbon-udf-demand', 'ribbon-udf-udm', 'ribbon-udf-cff'], {
  whatItIs: 'User-Defined体系扩展 Fluent 定制求解能力：Interpreted / Compiled UDF（用 C 语言通过 `DEFINE_*` 宏挂接复杂空间时间边界、非标准流变粘性物性、多相源项、动网格变形和定制源函数钩子 Hooks）、UDM/UDS（自定义内存槽与额外通用标量输运方程）及 Custom Field Functions（后处理公式衍生场变量计算器）。',
  whenToUse: '当数学公式复杂到需要迭代网格相邻单元循环（例如多组分滞后逻辑或跨单元查找，Named Expressions 写不出来）时使用 UDF / UDM / UDS；若是做已有收敛结果变量的代数后处理显示，仅需点开无需编程的 Custom Field Functions。',
  recommendation: '小试原型且无结构指针循环耗时压力用 Interpreted UDF；凡涉及高频网格单元循环、并行 MPI 跨核同步、三维多相计算或大网格商业计算务必使用 Compiled UDF（需匹配 Visual Studio/Built-in Clang 编译生成 DLL 共享库）以获十倍以上运行性能并避免解释器语法限制！',
  checkItems: ['必须分配足够数量的 User-Defined Memory Locations (UDM) 之后才能加载读写 `C_UDMI(c,t,i)` 的 UDF，否则直接内存越界闪退！', '多核并行下的 UDF 务必包含 `#if !RP_HOST` / `#if RP_NODE` 及全局归约宏以防结果因分区而错算'],
  commonMistakes: '编译好 UDF 加载时却忘了进 Function Hooks 把 `DEFINE_ADJUST`、`DEFINE_INIT` 或 `DEFINE_EXECUTE_AT_END` 挂上去，结果算完整场你的 UDF 根本一次都没运行过；或者忘了提前开 UDM 个数！',
})

addEntry(entries, ['tree-dashboard', 'dash-show-contours', 'dash-check-fluxes', 'dash-show-residuals', 'tree-animations', 'anim-name', 'anim-record-every', 'anim-storage', 'tree-simulation-report', 'ribbon-sim-report', 'sim-report-title', 'sim-report-include-mesh', 'sim-report-generate'], {
  whatItIs: '集成教学工作台的算例工作概览仪表盘（Dashboard）、计算过程帧动画录制（Solution Animation）以及一键打包工程汇总报告工具（Simulation Report）。',
  whenToUse: '做汇报或教学演示时快速概览全局设置状态、在瞬态过程中录制流场演变动画，并在验证通过后自动输出包含网格规模、边界清单、收敛曲线及云图截图的规范 HTML/PDF 报告。',
  recommendation: '录制瞬态流场动画前先在场景或 Contours 里固定好视角与色标上下界（Global Range = Off 并手动锁定范围），再设好合适的 Record Every 时间步间隔，否则每一帧颜色刻度自己跳来跳去会完全没法看趋势！',
  checkItems: ['生成最终报告前先保证 Mass/Energy Flux 守恒误差已落到安全区且监控曲线走平', '动画存盘目录磁盘空间充足'],
  commonMistakes: '忘掉锁死云图颜色标尺上下界就录制整个瞬态升温动画，结果每一帧最高温永远亮红色、看不出整体温度升高演化规律！',
})

addEntry(entries, ['ribbon-parallel-processes', 'ribbon-parallel-auto-partition', 'ribbon-parallel-manual-partition', 'ribbon-parallel-check-partition', 'ribbon-parallel-gpu', 'ribbon-parallel-network', 'ribbon-parallel-timer'], {
  whatItIs: 'Parallel 并行计算管理中心：控制多核 CPU 分布式/共享内存分区划分方法（METIS / Cartesian / 轴向分域等）、检验分区负载均衡度（Cell Imbalance）、开启支持的 Native GPU 求解器、以及测试节点通信带宽与 Timer Usage 求解耗时剖析。',
  whenToUse: '大模型读入后检查各个计算核心分配到的网格数是否均衡、或者计算突然大幅变慢需要揪出哪个进程或通信环节卡住时使用。',
  recommendation: '普通工业多区复杂网格保持默认 Auto Partition (Metis)，点击 Check Partition 保证 Cell Imbalance 控制在 5% 以内；遇到极慢计算查一次 Timer Usage，观察到底是流体迭代、辐射光线、DPM 颗粒还是 MPI 网络同步占用了最多壁钟时间！',
  checkItems: ['使用滑移网格/大区域 DPM 颗粒有时需评估局部负载与核数分配（并非核数越多越快，小网格用过多核反而通信耗时倒挂！）', 'Timer Usage 最长块才是真性能瓶颈'],
  commonMistakes: '只有几万几十万的小网格却硬开 64 核或跨机节点算，核间 MPI 通信时间比真正计算还慢；或者多核下启用未做好并发保护的自编脚本报错。',
})

addEntry(entries, ['ribbon-design-adjoint-obs', 'ribbon-design-adjoint-methods', 'ribbon-design-adjoint-run', 'ribbon-design-morphing', 'ribbon-design-points', 'tree-parameters-controls', 'ribbon-param-input', 'ribbon-param-output', 'ribbon-param-table', 'param-inlet-vel', 'param-output-dp', 'param-open-table'], {
  whatItIs: 'Fluent 原生参数化设计与伴随优化（Parameters / Design Points / Adjoint Solver + Mesh Morphing）：允许把几何流速/热流入口设成 Input Parameters、把压降/温升设为 Output Parameters 驱动多工况 Design Points 批算扫描；并借助伴随方程一次反求任意输出目标对全表面数万节点位置的梯度敏感度并直接驱动网格微变形（Morphing）实现气动减阻或均流自动寻优！',
  whenToUse: '要做多组进口风速/热功率对比表格（Parameters Design Points），或者已经有一个初步合格流道想自动把局部压降再降 15%、流道均匀性再提升而不想手动重画十版 CAD 时启用 Adjoint 优化。',
  recommendation: '使用 Adjoint Solver 前，原始流动（Primal Flow）必须达到高质量稳定收敛状态（最好残差与监控完全平直）；开启伴随耦合不稳定时适当打开 Stabilization Scheme（如 Preconditioned/Dissipation）并控制单次 Morphing 目标改变率（Target Change 先设为 2%~5% 分步精修），防止网格变形过猛产生负体积！',
  checkItems: ['确认伴随观察目标（Observable，如总压降 Δp 或阻力系数）已在有效表面组正确定义', '每次 Mesh Morphing 变形后务必检查生成的新网格正交质量再进行下一轮 Primal 重新验证'],
  commonMistakes: '原初流场本身还呈周期剧烈震荡没收敛稳就开始跑 Adjoint，伴随线性方程几乎必定迅速爆炸发散；或单步 Morphing 要求变化率填太猛（如 40%）直接拉扯出负体积网格！',
})

addEntry(entries, ['methods-epsilon', 'methods-nut', 'methods-do-scheme', 'methods-nita'], {
  whatItIs: '物理模型驱动的条件离散与时间推进项：包含随湍流模型自动切换的 ε 耗散率/修正湍流黏度 ν̃ 格式、DO 离散坐标辐射方向离散格式以及瞬态非迭代推进（NITA）。',
  whenToUse: '选用 k-epsilon、Spalart-Allmaras 或 DO 辐射模型后，在 Spatial Discretization 控制各附加输运标量的离散精度；不可压缩高实时效率瞬态问题在 Courant 数足够小可尝试 NITA 加速。',
  recommendation: '初步计算收敛无误后将 ε / ν̃ / DO 迎风格式切换至 Second Order Upwind 提升精度；强瞬态多耦合算例保持标准迭代时间推进而非 NITA，以保证步内强守恒残差收敛。',
  checkItems: ['检查离散列表显示项是否严格对应当前所选湍流或辐射模型', '高阶格式启动如果难以平稳收敛，可临时切换一阶迭代百步热启动后再升阶'],
  commonMistakes: '启用 DO 辐射却把 Discrete Ordinates 格式错放或误调太高阶导致无边界强反射区出现非物理“射线虚假振荡”。',
})

addEntry(entries, ['controls-coupled-courant', 'controls-exp-momentum', 'controls-exp-pressure', 'controls-urf-epsilon', 'controls-urf-nut'], {
  whatItIs: 'Coupled 联立算法专属 Courant 数、动量/压力显式松弛控制，以及随湍流模型自动关联显隐的 ε / ν̃ 方程亚松弛因子。',
  whenToUse: '使用 Coupled 压力速度耦合或 Density-Based 求解器时，通过 Flow Courant Number 与 Explicit Relaxation 掌控伪瞬态推进步幅；调整特定湍流标量松弛系数以平息近壁与强剪切振荡。',
  recommendation: 'Coupled 默认 Courant Number = 200 对常规稳定内流表现高效；若存在激波、多相或高度复杂几何导致发散，降至 10~50 并适当压低 Explicit Relaxation（如 0.25~0.5）可快速稳住迭代。',
  checkItems: ['分清楚 Coupled 调 Courant 与显式松弛，而 SIMPLE/PISO 调隐式 Pressure & Momentum URF', '切勿把松弛因子设得极低（如 0.05）后运行几百步就误以为“已平直收敛”，其实只是压根没在推进！'],
  commonMistakes: '在 SIMPLE 与 Coupled 两种算法之间切换后照搬另一方的默认经验参数，误将 Coupled 的 Courant 数调成 < 1 造成计算进展极慢。',
})

addEntry(entries, [
  'initialization-std-pressure',
  'initialization-std-yvel',
  'initialization-std-zvel',
  'initialization-std-k',
  'initialization-std-epsilon',
  'initialization-std-omega',
  'initialization-std-nut',
], {
  whatItIs: 'Standard Initialization 展开的完整初场变量栏：允许在全场或参照 Compute From 边界手动赋予初始静压、三维速度分量以及当前激活湍流模型所需的初值（k, ε, ω 或 ν̃）。',
  whenToUse: '多相流分层初始液面、多入口互冲流道或者 Hybrid 初始化出现不合理压降猜测时，切到 Standard Initialization 从指定主入口提取物理基准值或手工填全初场。',
  recommendation: '先选用主流入口做 Compute From 自动计算合理的默认湍动能与比耗散率初值，随后检查初始绝对速度与方向和边界来流吻合再点 Initialize。',
  checkItems: ['初始速度方向及静压零点尽量靠近核心主流方向，不要使静止初场或反方向初场一开算就造成激波', '确认与当下物理场对应的全部湍流变量已被赋予合理正数（非 0 或极大值）'],
  commonMistakes: '手工设置 Standard Initialization 时把初始湍动能 k 或耗散率 ε / ω 全写成 0，导致前几十步黏性项除零或者流场退化为层流难以建立正常湍流涡黏度。',
})

addEntry(entries, [
  'ribbon-report-new-menu',
  'ribbon-report-new-force',
  'ribbon-report-new-surface',
  'ribbon-report-new-volume',
  'ribbon-report-new-flux',
  'report-definition-category',
  'report-force-per-zone',
  'report-volume-zones',
  'report-definition-print',
  'residual-turb-criteria',
  'residual-check-convergence',
  'residual-print-console',
], {
  whatItIs: 'Solution Reports 新建分类报告（Force / Surface / Volume / Flux）及 Residual Monitors 收敛监控细节：提供从顶栏菜单快速按物理类别构建收敛追踪指标，并支持逐方程收敛开关与控制台打印控制。',
  whenToUse: '算前设置关心的工程定量收敛指标（压降、平均出流温升、翼面升阻力或进出口净质量误差），并通过 Per Zone / Print to Console 灵活对比多区受力与监视日志输出。',
  recommendation: '复杂流动不要只依靠连续性残差判断结束，建立至少两个独立位置关键工程监控指标并要求它们在最后 50 步保持千分之一以内波动平稳再停算。',
  checkItems: ['勾选 Create Report Plot 可实时观察监控物理量是否真正走平而非还在缓慢单向爬坡', '确认能量方程及湍流收敛阈值已结合目标工程精度从默认 1e-3 适当收紧至 1e-5 ~ 1e-6'],
  commonMistakes: '把收敛判据 Check Convergence 盲目关掉或阈值放宽到 1e-2 就宣布工程数值稳定收敛，导致关键表面换热或压降还没发展到位。',
})

addEntry(entries, [
  'ribbon-results-surface-create',
  'ribbon-results-point-surface',
  'ribbon-results-line-rake',
  'ribbon-results-iso-clip',
  'ribbon-results-surface-manage',
  'contours-levels',
  'contours-node-values',
  'contours-global-range',
  'vectors-surfaces',
  'vectors-auto-scale',
  'pathlines-color-by',
  'pathlines-step-size',
  'pathlines-style',
  'pathlines-draw-mesh',
  'xy-plot-node-values',
  'xy-plot-position-x',
  'xy-plot-write-file',
  'forces-option',
  'forces-moment-center',
  'forces-print',
  'surface-integrals-write-file',
  'vol-int-zones',
], {
  whatItIs: 'Results 后处理精细选项集合：覆盖新建抽样点/线段/裁剪面（Point/Line-Rake/Iso-Clip）、云图等级与节点插值（Node Values / Global Range）、矢量自动缩放、流线步长线型、XY 轴方向设置及力矩/面/体积分导出。',
  whenToUse: '精雕工程后处理图像与实验对比数据时，调节色标级数 Levels、切换节点插值消除分片块状、提取力矩中心与压力中心，或把沿线 XY 数值保存输出给外部绘图对比软件。',
  recommendation: '对比同一几何不同边界条件的多张结果云图时，保持相同的 Global Range 自定义范围或固定上下限阈值；提取精准气动力矩系数先查对模型装配 Moment Center 坐标。',
  checkItems: ['查看光滑物理场渐变开启 Node Values；若想诊断真实单网格计算离散值突变则可暂时关闭 Node Values 观察单元面真实梯度跳跃', 'Line/Rake 沿线采样和 Forces 压心报告务必验证原点与流向参考方向'],
  commonMistakes: '分析三维弯道涡旋流场时直接对默认全部壁面点绘制密密麻麻的 Vectors 而不选内部核心切面（plane-center），导致箭头糊成一团看不见内部二次涡旋！',
})

export const solutionAndResultsExplanations = entries
