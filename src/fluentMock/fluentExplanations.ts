import { allDialogControls } from './fluentDialogs'
import { allMainControls } from './fluentControls'
import { extendedExplanationOverrides } from './data/extendedExplanations'
import { solutionWorkflowExplanations } from './data/solutionWorkflowExplanations'
import { modelDocumentationExplanations } from './data/modelDocumentationExplanations'
import { fluentOperationExplanations } from './data/fluentOperationExplanations'
import { generalAndMeshExplanations } from './data/generalAndMeshExplanations'
import { physicsAndBoundaryExplanations } from './data/physicsAndBoundaryExplanations'
import { solutionAndResultsExplanations } from './data/solutionAndResultsExplanations'
import { synthesizeControlExplanation } from './data/dialogTeachingProfiles'
import type { FluentMockControl, FluentMockExplanation } from './fluentTypes'

type ExplanationOverride = Partial<Omit<FluentMockExplanation, 'id'>>

interface ModuleProfile {
  what: string
  recommendation: string
  when: string
  checks: string[]
}

const moduleProfiles: Record<string, ModuleProfile> = {
  File: {
    what: '文件操作区，用于读取、保存和导出 case/data 以及相关结果文件。',
    recommendation: '关键设置变更和长时间计算前后都应保存 case/data；不要只依赖当前内存状态。',
    when: '读入算例、保存阶段结果、导出后处理文件或准备重启计算时使用。',
    checks: ['保存路径是否明确', '是否同时保存 case 和 data', '文件名是否能区分迭代阶段'],
  },
  General: {
    what: '全局求解设置区，用来确认求解器、时间形式、网格检查和重力等基础状态。',
    recommendation: '读入网格后先检查单位、网格质量和稳态/瞬态选择，再进入模型和边界条件。',
    when: '开始任何 Fluent 算例设置时优先查看。',
    checks: ['网格尺寸和单位是否正确', '稳态或瞬态是否符合物理问题', '重力方向是否与坐标系一致'],
  },
  Mesh: {
    what: '网格相关入口，用于检查、显示、缩放和统计网格质量。',
    recommendation: '在设置物理模型前先完成网格检查和质量统计，发现异常后先修网格再求解。',
    when: '导入网格、缩放网格、修改区域或遇到收敛异常时使用。',
    checks: ['是否存在负体积或连通性错误', '正交质量和偏斜率是否可接受', '边界名称是否与工况一致'],
  },
  Models: {
    what: '物理模型设置区，用来决定是否求解能量、湍流、辐射、多相等方程或子模型。',
    recommendation: '只开启工况确实需要的模型；每打开一个模型都要同步检查材料、边界和求解方法。',
    when: '网格检查完成后、材料和边界条件设置前使用。',
    checks: ['模型是否对应实际物理过程', '新增方程是否需要额外边界条件', '湍流模型与近壁网格 y+ 是否匹配'],
  },
  Materials: {
    what: '材料物性管理区，用来定义流体、固体和混合物的密度、黏度、导热系数等属性。',
    recommendation: '先确认材料单位和温度相关性，再把材料分配到正确的流体或固体区域。',
    when: '开启能量方程、涉及多材料或需要温度相关物性时重点检查。',
    checks: ['密度、黏度和导热系数单位是否正确', '材料是否已经分配到对应 cell zone', '常数物性是否覆盖当前温度范围'],
  },
  'Cell Zone Conditions': {
    what: '单元区域条件设置区，用于把材料、源项、旋转区域、多孔介质等属性分配到体区域。',
    recommendation: '先确认每个 cell zone 是流体还是固体，再设置材料、源项和特殊区域模型。',
    when: '完成材料定义后、设置边界条件前使用。',
    checks: ['区域类型是否正确', '材料名称是否分配正确', '源项或多孔参数是否只作用于目标区域'],
  },
  'Boundary Conditions': {
    what: '边界条件设置区，用来定义入口、出口、壁面、对称面等边界如何与求解域交换质量、动量和能量。',
    recommendation: '逐个检查所有边界区域；入口、出口、壁面和回流参数不要混用。',
    when: '模型、材料和区域条件确定后使用。',
    checks: ['入口流量或速度是否与工况一致', '出口压力参考是否正确', '壁面热边界和粗糙度是否需要设置'],
  },
  'Reference Values': {
    what: '参考值设置区，用于力系数、阻力系数、换热系数等无量纲或报告量的基准尺度。',
    recommendation: '需要比较系数类结果时明确参考面积、长度、密度和速度，避免报告值失真。',
    when: '准备输出力、力矩、阻力系数或换热系数前使用。',
    checks: ['参考面积是否对应投影面积或定义面积', '参考长度是否与工程定义一致', '参考密度和速度是否来自入口或自由流'],
  },
  'Solution Methods': {
    what: '数值离散和压力速度耦合设置区，影响精度、稳定性和迭代成本。',
    recommendation: '初始调试可保守设置，稳定后再提高离散阶数；压力速度耦合方式要与稳态/瞬态和网格质量匹配。',
    when: '边界条件设置完成后、初始化前使用。',
    checks: ['压力速度耦合方式是否合适', '动量和能量离散格式是否满足精度目标', '高阶格式是否导致振荡或发散'],
  },
  'Solution Controls': {
    what: '求解控制设置区，用于调整松弛因子、方程开关和部分稳定性控制参数。',
    recommendation: '收敛困难时优先检查网格、边界和物理模型，再谨慎降低松弛因子。',
    when: '残差振荡、发散或某个方程难收敛时使用。',
    checks: ['是否存在不合理边界条件', '松弛因子是否过大', '是否误关了需要求解的方程'],
  },
  Initialization: {
    what: '初始化设置区，用于给求解变量提供起始场。',
    recommendation: '常规稳态单相流可以先用 Hybrid Initialization；复杂入口或强旋转问题可考虑局部初始化或 patch。',
    when: '完成模型、材料、边界和求解方法后使用。',
    checks: ['初始化参考区域是否合理', '速度和温度初值是否过度偏离工况', 'patch 是否只作用于目标区域'],
  },
  Monitors: {
    what: '监控设置区，用来跟踪残差、报告量、积分量和收敛历史。',
    recommendation: '不要只看残差；关键工程量应建立 report monitor 一起判断收敛。',
    when: '正式迭代前设置，计算过程中持续观察。',
    checks: ['残差标准是否合理', '质量流量或热量是否守恒', '关键报告量是否趋于稳定'],
  },
  'Report Definitions': {
    what: '报告定义区，用来创建可被监控、绘图或写文件的力、流量、面积平均等工程量。',
    recommendation: '把关键工程指标做成 report definition，比单次后处理更适合判断计算是否稳定。',
    when: '正式迭代前设置，计算过程中随残差一起观察。',
    checks: ['报告类型是否对应目标工程量', '表面选择是否完整', '是否需要 Plot 或 Write 输出历史'],
  },
  'Run Calculation': {
    what: '运行计算设置区，用来设置迭代步数、时间步、数据采样和启动计算。',
    recommendation: '点击计算前确认保存策略、监控量和时间步；不要在关键设置未核对时直接长时间运行。',
    when: '初始化完成、监控和输出设置确认后使用。',
    checks: ['迭代数或时间步数是否合理', '瞬态时间步是否满足 CFL 或物理时间尺度', '计算前是否已保存 case'],
  },
  'Calculation Activities': {
    what: '计算活动设置区，用来安排自动保存、命令执行、数据采样和计算期间的附加动作。',
    recommendation: '长时间稳态迭代或瞬态计算前先设置自动保存和必要的输出动作。',
    when: '正式计算前、需要周期性保存或执行命令时使用。',
    checks: ['自动保存频率是否合理', '文件保留数量是否足够', '执行命令是否会改变求解状态'],
  },
  Results: {
    what: '后处理结果区，用于创建云图、矢量图、报告、曲线和表面积分。',
    recommendation: '先检查守恒和监控量，再制作云图；不要只凭单张图判断计算是否可信。',
    when: '计算过程中检查趋势，或计算结束后整理结果时使用。',
    checks: ['显示变量和单位是否正确', '表面或截面选择是否正确', '结果是否与监控量和边界通量一致'],
  },
  'Mesh Adaptation': {
    what: '网格自适应区，用来按梯度、等值范围或区域标记单元并进行局部网格调整。',
    recommendation: '自适应前先确认基础网格和收敛趋势；不要用自适应掩盖错误边界或错误物性。',
    when: '需要提高局部梯度区域分辨率，或后处理发现关键区域网格不足时使用。',
    checks: ['标记变量是否对应目标物理量', '加密区域是否过大', '自适应后是否重新检查网格质量'],
  },
  'Dynamic Mesh': {
    what: '动态网格区，用来设置随时间移动、变形或重构的网格区域。',
    recommendation: '只有几何或边界真实运动时才启用；先用简单运动和小时间步验证网格更新稳定性。',
    when: '活塞、阀门、旋转/摆动部件、变形边界等瞬态运动问题使用。',
    checks: ['运动边界是否定义清楚', '时间步是否足够小', '是否需要 smoothing、remeshing 或 layering'],
  },
  'Graphics Window': {
    what: '图形窗口交互区，用来观察网格、边界、云图、矢量和几何方向。',
    recommendation: '用选择过滤和视图工具定位边界或结果对象，必要时结合 Outline 中的区域名称核对。',
    when: '检查几何方向、边界命名、网格显示和后处理图形时使用。',
    checks: ['坐标方向是否符合模型假设', '当前选择过滤是否正确', '显示对象是否来自目标边界或表面'],
  },
  Console: {
    what: '文本反馈区，显示命令、警告、检查结果、初始化和迭代信息。',
    recommendation: '执行关键操作后都看控制台反馈；警告和错误信息通常比图形窗口更直接。',
    when: '读网格、检查、初始化、迭代或结果异常时使用。',
    checks: ['是否出现 warning 或 error', '网格检查结果是否完整', '初始化或计算命令是否真正执行'],
  },
  Outline: {
    what: '功能树和过滤区，用于快速定位 Fluent 工作流中的设置页面。',
    recommendation: '按 Setup、Solution、Results 的顺序检查，不要只靠搜索跳过前置设置。',
    when: '需要在多个设置页之间切换或快速查找功能时使用。',
    checks: ['当前节点是否属于正确工作流阶段', '过滤关键词是否隐藏了需要检查的节点'],
  },
  Ribbon: {
    what: '顶部命令入口区，提供文件、网格、物理、求解、结果等常用命令。',
    recommendation: 'Ribbon 适合快速打开常见窗口；具体参数仍要在任务页或弹窗内逐项核对。',
    when: '熟悉工作流后快速调用命令时使用。',
    checks: ['当前标签页是否对应目标模块', '命令是否会打开窗口或直接执行操作'],
  },
  'User-Defined': {
    what: '用户自定义功能区，支持 C 语言 UDF（解释/编译）、自定义内存/标量（UDM/UDS）、自定义场函数以及无需编程的 Named Expressions。',
    recommendation: '简单边界函数或变物性先考虑 Named Expressions；复杂源项或自定义物理再使用 Compiled UDF 并统一采用 SI 单位。',
    when: '标准界面选项无法表达随空间/时间变化的函数、定制物理源项或后处理派生变量时使用。',
    checks: ['所有公式单位量纲是否采用 SI 国际单位', '自定义函数或表达式是否已在目标边界或区域绑定'],
  },
  Parallel: {
    what: '多核并行与网格分区管理区，用于调整 MPI 进程、自动/手动负载均衡分区（Metis）及 GPU 加速选项。',
    recommendation: '使用默认 Metis 自动分区即可获得良好负载均衡；分区数应匹配当前分配 CPU 核数。',
    when: '多核并行求解前核查分区均衡度或网络/计时性能诊断时使用。',
    checks: ['分区数量与 MPI 核心数匹配', '各分区单元数量均衡且切分面不穿过关键高耦合交界面'],
  },
  Design: {
    what: '伴随求解器（Adjoint Solver）与拓扑/外形优化模块，可直接计算压降、阻力或均匀性目标对几何边界形变的敏感度。',
    recommendation: '先确保基础稳态流场残差和工程监控量完全收敛，再设定清晰的 Observable 目标执行 Adjoint 迭代与 Morphing。',
    when: '流道减阻、流动均匀性改善或气动外形局部优化设计时使用。',
    checks: ['基线流场已高度收敛', '目标 Observable 定义与几何变形边界范围明确'],
  },
  Parameters: {
    what: '参数管理模块，用于把入口速度、温度、几何或物性绑定为 Input Parameter，把压降、温升和换热系数绑定为 Output Parameter。',
    recommendation: '需要做多工况批处理或优化设计点扫描（Design Points）时使用统一参数命名规范。',
    when: '多工况敏感性分析、实验设计与 Workbench 参数联动时使用。',
    checks: ['输入/输出参数单位准确', '确保 Output Parameter 已关联稳定收敛的 Report Definition'],
  },
  Help: {
    what: '教学辅助与工具快捷入口区，可快速呼出 10 步入门引导、常见报错排查、切换 Meshing 以及直达 CFD 参数计算器与公式库。',
    recommendation: '遇到不确定的网格尺度或发散报错时，善用 Troubleshooting 排查和站内参数计算器联动。',
    when: '教学演示、排错复盘或核对公式定义时使用。',
    checks: ['核对工况参数是否与实际模型单位一致'],
  },
  'Motion Definitions': {
    what: '刚体运动定义模块，设定旋转、平动或 6-DOF 运动轨迹，用于参考系运动（MRF）或动态/滑移网格区域。',
    recommendation: '稳态叶轮机械优先用 MRF 旋转参考系；涉及叶片与导叶真实瞬态扫掠交互时再结合滑移网格与运动定义。',
    when: '离心泵、风扇、搅拌釜或直线往复运动机构仿真时使用。',
    checks: ['旋转方向（右手定则）与旋转轴矢量一致', '角速度单位设置正确（rpm vs rad/s）'],
  },
  'Mesh Interfaces': {
    what: '非共节点交界面管理模块，用于连接静止/旋转两个独立网格区并自动插值传递质量、动量与热量。',
    recommendation: '共轭传热优先用 Meshing Share Topology 共节点；必须采用非共节点时需确保 Paired Zones 命名完整配对。',
    when: '滑移网格、分段导入的多套网格或局部独立加密体拼装时使用。',
    checks: ['主从面边界类型为 interface', '导热交界面是否需要开启 Coupled Wall'],
  },
  'Auxiliary Geometry': {
    what: '辅助虚拟几何体定义区，用于辅助标记区域、旋转参考点或后处理空间提取参考体。',
    recommendation: '在辅助标记或局部可视化参照时创建，不直接修改实际流道体网格。',
    when: '需要按精确球体/圆柱范围提取单元或辅助参考点时使用。',
    checks: ['坐标原点和半径/尺寸单位与当前长度单位一致'],
  },
  'Reference Frames': {
    what: '参考坐标系管理区，支持静止绝对系以及平移/旋转参考系（Moving Reference Frame, MRF）定义。',
    recommendation: '旋转域 MRF 计算需明确角速度方向，并在后处理时区分绝对速度与相对速度。',
    when: '存在旋转体区域、相对速度边界或嵌套运动坐标系时配置。',
    checks: ['旋转原点与轴方向矢量准确', '与对应 Cell Zone 绑定无误'],
  },
  'Named Expressions': {
    what: '免写代码的表达式编辑器，直接用数学表达式绑定时变/空变边界条件、源项或输出报告。',
    recommendation: '尽量优先用 Named Expressions 替代简单 C 语言 UDF，天然支持并行与单位自动校验。',
    when: '定义抛物线流速入口、正弦脉动压差或自定义物理监控量时使用。',
    checks: ['表达式变量方括号单位写全', '表达式在物理边界范围内有定义（避免除零）'],
  },
  'Curvilinear Coordinates': {
    what: '贴体曲线坐标系生成器，沿弯曲通道或催化载体计算沿程方向向量，以精确设定各向异性阻力或导热。',
    recommendation: '弯曲异形催化剂载体或螺旋管道多孔介质需要按流动方向给出主阻力方向时启用。',
    when: '弯曲多维体区域需要随流向变化的各向异性张量时使用。',
    checks: ['入口和出口方向指示面无误', '计算完成后在方向矢量图验证生成方向'],
  },
  'Cell Registers': {
    what: '局部单元选择标记器，按坐标范围、物理梯度或等值条件圈选单元子集，供 Patch 初始化与自适应加密调用。',
    recommendation: '执行局部 Patch 或网格自适应加密前先显示验证选中的单元区域，避免误加密全计算域。',
    when: '局部高温/射流/多相初始液位 Patch 或梯度自适应加密前使用。',
    checks: ['圈选的单元数量在合理比例范围', '不会包含边界壁面畸变网格或错选区域'],
  },
  Dashboard: {
    what: '算例全局实时汇总面板，展示计算收敛快照、质量守恒核对和关键后处理快捷入口。',
    recommendation: '作为收敛排查和快速复核结果的第一视角，配合 Reports -> Fluxes 验证质量守恒。',
    when: '迭代运行中或求解结束后全局审视算例状态时使用。',
    checks: ['残差下降且核心物理量趋势平稳', '质量流量净不平衡足够小'],
  },
  Animations: {
    what: '瞬态过程动画录制与回放管理模块，可周期性保存瞬态时间步的云图/矢量画面帧序列。',
    recommendation: '瞬态求解开始前即设置 Solution Animation，方便会后直观回放涡脱落、液面晃荡或温升过程。',
    when: '需要直观展示随时间演化的瞬态流场变化视频或连续帧时使用。',
    checks: ['录制间隔与总步数匹配，避免写入过多大文件', '已先选定待显示的可视化 Scene 或 Contour'],
  },
  'Parameters and Controls': {
    what: 'Workbench 参数与设计点控制中心，统一管理供优化和参数化扫描调用的输入变量与输出目标。',
    recommendation: '确保所有需要做参数化扫描的边界或尺寸都已正确标记为 Input/Output Parameter。',
    when: '做变转速、变风速、变热流多工况对比扫描时使用。',
    checks: ['参数名称无特殊字符或冲突', '输出参数已定义对应 Report Definition'],
  },
  'Simulation Report': {
    what: '自动化计算报告生成模块，一键收集网格概况、求解器设置、边界表与结果图表生成分享报告。',
    recommendation: '在算例完成验证后导出报告归档，便于团队评审与复现边界设置。',
    when: '仿真收尾汇报或留存基线版本文档时使用。',
    checks: ['报告包含所有关键模型、材料与收敛截图说明'],
  },
}

const baseOverrides: Record<string, ExplanationOverride> = {
  'tree-general-explanation': {
    title: '一般',
    location: '设置 / 一般',
    relatedControls: ['general-pressure-based', 'general-steady', 'general-units'],
  },
  'tree-boundary-conditions-explanation': {
    title: '边界条件',
    location: '设置 / 边界条件',
    relatedControls: ['bc-velocity-inlet', 'bc-pressure-outlet', 'bc-wall'],
  },
  'ribbon-mesh-check-explanation': {
    title: '网格检查',
    location: 'Ribbon → 区域 → 网格',
    relatedControls: ['mesh-check-negative-volume', 'mesh-quality-orthogonal'],
  },
  'general-pressure-based-explanation': {
    title: '基于压力求解器',
    location: '任务页面 → 一般 → 求解器 → 类型',
    whatItIs: '压力基求解器以压力速度耦合为核心，是很多低速单相流动和常规传热算例的常用入口。',
    recommendation: '低速不可压缩或弱可压缩流动优先从压力基开始；高速激波类问题再评估密度基。',
    checkItems: ['马赫数是否处于低速范围', '密度变化是否影响主导物理', '后续压力速度耦合方式是否匹配'],
    relatedControls: ['general-density-based', 'methods-pressure-velocity'],
  },
  'general-density-based-explanation': {
    title: '基于密度求解器',
    location: '任务页面 → 一般 → 求解器 → 类型',
    whatItIs: '密度基求解器更强调密度、动量和能量方程的耦合推进，常用于高速可压缩流教学场景。',
    recommendation: '存在激波、喷管或强可压缩效应时再考虑；普通低速气体流不要仅因为是气体就切换。',
    checkItems: ['是否存在强可压缩效应', '能量方程是否需要开启', '边界条件是否支持高速可压缩设置'],
    relatedControls: ['general-pressure-based', 'general-transient'],
  },
  'energy-enable-explanation': {
    title: '启用 Energy',
    location: '模拟窗口 → Energy 模型',
    whatItIs: 'Energy 开关表示求解能量方程，使温度、热通量、导热和对流换热设置参与计算。',
    recommendation: '适合存在热传导、热通量、温度边界或可压缩热效应的算例。',
    whenToUse: '有温度场、热源、壁面热边界、固体导热或热流体耦合时使用。',
    checkItems: ['材料是否有导热系数和比热', '壁面或入口温度边界是否设置', '求解方法中能量离散格式是否合理'],
    relatedControls: ['models-energy', 'wall-thermal', 'solution-controls-energy'],
  },
  'general-units-explanation': {
    title: '单位设置',
    location: '任务页面 → 一般 → 网格',
    relatedControls: ['units-length', 'mesh-scale-factor'],
  },
  'units-length-explanation': {
    title: '长度单位',
    location: '模拟窗口 → 单位设置',
    relatedControls: ['mesh-scale-factor', 'units-restore-si'],
  },
  'general-report-quality-explanation': {
    title: '网格质量报告',
    location: '任务页面 → 一般 → 网格',
    relatedControls: ['mesh-quality-orthogonal', 'mesh-quality-skewness'],
  },
  'graphics-select-explanation': {
    title: '图形窗口选择工具',
    location: '图形窗口 → 左侧工具栏',
    relatedControls: ['graphics-selection-filter', 'graphics-fit'],
  },
  'models-energy-explanation': {
    title: 'Energy 模型',
    location: '设置 / 模型 / Energy',
    relatedControls: ['energy-enable', 'wall-thermal'],
  },
  'models-viscous-explanation': {
    title: 'Viscous 模型',
    location: '设置 / 模型 / Viscous',
    relatedControls: ['viscous-laminar', 'viscous-kepsilon', 'viscous-kw-sst'],
  },
  'velocity-inlet-turbulence-explanation': {
    title: 'Turbulence Specification',
    location: '模拟窗口 → Velocity Inlet → Turbulence',
    whatItIs: '入口湍流指定方式用于给湍流模型提供入口处的湍动能、耗散率或等效尺度。',
    recommendation: '内部流常用强度加水力直径作为初始估算；有试验或上游计算数据时优先使用更可靠输入。',
    whenToUse: '开启湍流模型且入口边界为 velocity inlet 或 mass-flow inlet 时检查。',
    checkItems: ['检查入口湍流强度、长度尺度或水力直径是否来自工况估算。', '湍流参数是否与 Reynolds 数和入口发展程度一致', '不要把默认值当成所有工况的可靠输入'],
    relatedControls: ['viscous-kepsilon', 'viscous-kw-sst', 'bc-velocity-inlet'],
  },
  'mass-flow-inlet-flow-rate-explanation': {
    title: 'Mass Flow Rate',
    location: '模拟窗口 → Mass-Flow Inlet → Momentum',
    whatItIs: '质量流量入口用总质量流量约束入口，Fluent 会结合边界面积和方向得到入口速度规模。',
    recommendation: '适合已知质量流量的入口；同时核对湍流、温度和方向设置。',
    whenToUse: '风机、管路、设备入口给定质量流量而不是速度时使用。',
    checkItems: ['质量流量单位是否为 kg/s', '方向是否为法向或指定方向', '多个入口时总流量是否守恒'],
    relatedControls: ['bc-mass-flow-inlet', 'mass-flow-inlet-direction', 'mass-flow-inlet-turbulence'],
  },
  'operating-pressure-explanation': {
    title: 'Operating Pressure',
    location: '模拟窗口 → Operating Conditions',
    whatItIs: '操作压力是表压边界和绝对压力换算的参考压力，也会影响部分浮力和可压缩设置的解释。',
    recommendation: '低速不可压缩流通常保持默认参考压力；涉及浮力、可压缩或表压边界时要主动核对。',
    whenToUse: '使用 pressure inlet/outlet、理想气体密度、浮力或高度压力变化问题时检查。',
    checkItems: ['边界压力是表压还是绝对压力', '操作压力是否与实验或工程参考一致', '密度模型是否依赖绝对压力'],
    relatedControls: ['general-operating-conditions', 'pressure-outlet-gauge', 'operating-density'],
  },
  'initialization-patch-region-explanation': {
    title: 'Patch Region',
    location: '模拟窗口 → Patch',
    whatItIs: 'Patch Region 指定要写入初始变量值的局部区域、cell zone 或寄存器。',
    recommendation: '只在明确知道局部初始场时使用 Patch，避免把局部速度或温度误写到全域。',
    whenToUse: '需要给局部热区、旋涡区、液位区或特定区域设置不同初值时使用。',
    checkItems: ['区域选择是否只包含目标单元', '变量和值是否符合物理初值', 'Patch 后是否检查云图确认写入范围'],
    relatedControls: ['initialization-patch', 'initialization-patch-variable', 'initialization-patch-value'],
  },
  'autosave-frequency-explanation': {
    title: 'Save Every',
    location: '模拟窗口 → Automatic Saving',
    whatItIs: '自动保存频率决定 Fluent 在计算过程中隔多少迭代步或时间步写出 case/data。',
    recommendation: '长时间迭代或瞬态计算应设置自动保存频率，避免中断后丢失关键阶段结果。',
    whenToUse: '长时间稳态收敛、瞬态计算、参数扫描或不稳定算例调试时使用。',
    checkItems: ['保存频率是否不会生成过多文件', '是否同时保存 data', '磁盘空间是否足够'],
    relatedControls: ['calculation-autosave', 'autosave-file-type', 'autosave-retain-files'],
  },
  'material-density-method-explanation': {
    title: 'Density Method',
    location: '模拟窗口 → Create/Edit Materials',
    whatItIs: '材料密度方法决定密度是常数、理想气体、分段函数还是其他表达。',
    recommendation: '不可压缩低速流可先用常数密度；温度或压力显著影响密度时再选择合适模型。',
    whenToUse: '创建或编辑流体材料时必须检查，尤其是可压缩、浮力或传热问题。',
    checkItems: ['密度单位是否为 kg/m³', '密度是否随温度或压力变化', '所选密度模型是否与求解器和能量方程匹配'],
    relatedControls: ['materials-create-edit', 'fluid-density', 'operating-pressure'],
  },
  'mesh-quality-orthogonal-explanation': {
    title: '最小正交质量',
    location: '模拟窗口 → 网格质量报告',
    whatItIs: '正交质量反映单元连接和面法向关系的合理程度，是判断网格稳定性的常用指标之一。',
    recommendation: '最小值过低时先定位区域，再结合偏斜率和局部物理重要性决定是否重构或局部加密。',
    checkItems: ['最小值位置是否在关键流动区域', '是否同时存在高偏斜率', '边界层单元是否被质量指标误判'],
    relatedControls: ['mesh-quality-skewness', 'mesh-check-negative-volume'],
  },
  'console-area-explanation': {
    title: '控制台',
    location: '底部控制台',
    relatedControls: ['ribbon-mesh-check', 'run-calculate'],
  },
}

const mergedModuleOverrides: Record<string, ExplanationOverride> = {
  ...extendedExplanationOverrides,
  ...generalAndMeshExplanations,
  ...physicsAndBoundaryExplanations,
  ...solutionAndResultsExplanations,
}

const overrides: Record<string, ExplanationOverride> = {
  ...mergedModuleOverrides,
  ...Object.fromEntries(
    Object.entries(baseOverrides).map(([id, entry]) => [
      id,
      { ...mergedModuleOverrides[id], ...entry },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(modelDocumentationExplanations).map(([id, source]) => [
      id,
      { ...extendedExplanationOverrides[id], ...source },
    ]),
  ),
  ...solutionWorkflowExplanations,
}

const allControls = [...allMainControls, ...allDialogControls]

export const fluentExplanations: FluentMockExplanation[] = allControls.map(
  (control) => {
    const prior = overrides[control.explanationId]
    const expanded = fluentOperationExplanations[control.explanationId]
    return createExplanation(control, {
      ...prior,
      ...expanded,
      ...(!control.dialogId && prior?.sourceStatus === 'source-checked' && {
        whatItIs: prior.whatItIs,
        sourceUrl: prior.sourceUrl,
      }),
    })
  },
)

export const fluentExplanationById = new Map(
  fluentExplanations.map((entry) => [entry.id, entry]),
)

function createExplanation(
  control: FluentMockControl,
  override: ExplanationOverride = {},
): FluentMockExplanation {
  const title = override.title ?? control.labelZh
  const profile = moduleProfiles[control.module] ?? moduleProfiles[control.region] ?? moduleProfiles.General
  const typeName = controlTypeName(control.controlType)
  const fallback = synthesizeControlExplanation(control, profile)

  const whatItIs = override.whatItIs ?? fallback.whatItIs
  const recommendation = override.recommendation ?? fallback.recommendation
  const whenToUse = override.whenToUse ?? fallback.whenToUse
  const checkItems = override.checkItems ?? fallback.checkItems
  const commonMistakes = override.commonMistakes ?? fallback.commonMistakes

  return {
    id: control.explanationId,
    title,
    location:
      override.location ??
      `${control.region}${control.group ? ` → ${control.group}` : ''}`,
    controlType: override.controlType ?? typeName,
    whatItIs,
    recommendation,
    checkItems,
    summary: override.summary ?? whatItIs,
    purpose: override.purpose ?? recommendation,
    whenToUse,
    commonMistakes,
    relatedControls: override.relatedControls ?? [],
    sourceStatus: override.sourceStatus ?? 'draft-public-sources',
    sourceUrl: override.sourceUrl,
    operation: override.operation,
  }
}

function controlTypeName(type: FluentMockControl['controlType']) {
  const names: Record<FluentMockControl['controlType'], string> = {
    button: '按钮',
    checkbox: '复选框',
    console: '控制台区域',
    'dialog-button': '弹窗按钮',
    field: '输入项',
    'graphics-tool': '图形工具',
    radio: '单选项',
    'ribbon-button': 'Ribbon 按钮',
    select: '下拉选项',
    'tree-node': '功能树节点',
  }

  return names[type]
}
