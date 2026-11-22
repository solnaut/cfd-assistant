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

// --- File & Session ---
addEntry(entries, ['ribbon-file-read-menu'], {
  whatItIs: 'Read 菜单用于向当前 Fluent 会话读取网格、算例设置（Case）、结果场（Data）、边界轮廓（Profile）、Scheme 扩展或批处理 Journal 日志脚本。',
  whenToUse: '开始新项目读入网格，或接着已有算例结果继续计算、后处理、批量复用边界轮廓时使用。',
  recommendation: '仅读入纯网格（Read Mesh）后要按模块重新设定物理模型；若需连同模型、边界和初始流场一起恢复，请选择 Case & Data。',
  checkItems: ['确认文件路径不含过深特殊字符或损坏压缩包', '读入 Case/Mesh 后立即执行 Mesh Check 检查尺度和负体积'],
  commonMistakes: '已有旧设置时误用仅读网格或读错不同版本网格的 Data，导致边界分区名称不匹配或初始场丢失。',
  operation: {
    coreConcept: 'Case 文件（.cas.h5 / .cas）保存“几何网格、物理模型、边界设定与求解设置”；Data 文件（.dat.h5 / .dat）保存“所有单元/面节点上的速度、压力、温度等物理场数值”；两者合用构成完整续算断点。',
    choices: [
      ['Mesh / Case', '仅包含网格与物理设置，不带流场结果，读入后需重新初始化才能算。'],
      ['Case & Data', '同时读取设定与收敛流场，适合断点续算、加密热启动（FMG/映射）或直接进 Results 后处理。'],
      ['Profile / Journal', 'Profile 用于导入实测入口速度/温度空间分布表；Journal（.jou）用于无界面批处理回放命令。'],
    ],
    steps: ['明确你需要只载入几何/网格、恢复完整算例还是批量执行脚本。', '在 Read 下拉菜单中选择对应格式。', '读入后看 Console 报错与区域清单是否全部正确挂载。'],
    example: '昨日已跑完 1000 步的散热算例，今天重开 Fluent 时选 File → Read → Case & Data，即可立即续算或画云图而无需从零初始化。',
  },
})

addEntry(entries, ['ribbon-file-write-menu'], {
  whatItIs: 'Write 菜单用于保存当前算例设定（Case）、流场数据（Data）、自动保存策略（Autosave）、边界轮廓（Profile）或边界网格文件。',
  whenToUse: '修改模型设置后、开始长程求解前、求解阶段结束后，或需要导出某边界面流动分布给下游模型作入口时使用。',
  recommendation: '重大参数改动前后或提交长计算前先 Write Case；若要停电/崩溃恢复及后处理完整历史，务必配合 Autosave 同时输出 Case & Data。',
  checkItems: ['如果几何或网格刚发生自适应/缩放，必须同时重新保存 Case 而非只写 Data', '核对 HDF5 (.cas.h5/.dat.h5) 与传统格式兼容要求'],
  commonMistakes: '做了网格自适应或改完边界后只保存 Data 不保存 Case，下次重新读入时由于网格拓扑不一致根本无法加载该 Data。',
  operation: {
    coreConcept: '网格或区域拓扑只要未改，续算只需配对原 Case 与新 Data；一旦发生网格自适应（Adapt）、滑移/动态网格变形或分区变更，新 Data 必须绑定同步写出的新 Case。',
    steps: ['停算或改动完模型后，选择 Write → Case & Data 保存完整状态。', '长算例或瞬态算例进入 Write → Autosave 设定保留份数与频率。'],
    example: '瞬态算完前 5 s 想先调参数测试对比，先另存一份 `baseline_5s.cas.h5 / .dat.h5` 再改边界，可随时无损回滚。',
  },
})

addEntry(
  entries,
  [
    'ribbon-read-case',
    'ribbon-read-data',
    'ribbon-read-case-data',
    'ribbon-read-case-settings',
    'ribbon-read-case-info',
    'ribbon-read-profile',
    'ribbon-read-scheme',
    'ribbon-read-journal',
  ],
  {
    whatItIs: '指定要从磁盘读取的 Fluent 算例、流场数据、边界 Profile 表、Scheme 脚本或批处理 Journal 命令流文件。',
    whenToUse: '加载已有 Case/Data 续算、复用外部轮廓文件或按脚本自动配置算例时打开。',
    recommendation: '读取 Settings Only 时请确保当前网格各分区名称、流体域数量与源 Settings 一致，防止边界未能正确映射。',
    checkItems: ['确认文件名、扩展名（.cas.h5/.dat.h5/.prof/.jou）与读取模式匹配', '读入后检查 Console 是否打印 Warning 或未匹配边界'],
    commonMistakes: '把多域算例的 Case 与另一套划分的 Data 混读，引发单元数不一致报错。',
  },
)

addEntry(
  entries,
  [
    'ribbon-write-case',
    'ribbon-write-data',
    'ribbon-write-case-data',
    'ribbon-write-profile',
    'ribbon-write-boundary-mesh',
  ],
  {
    whatItIs: '将当前 Fluent 内存中的设置、瞬态/稳态场数值、面边界轮廓或边界表面网格写出到指定磁盘路径。',
    whenToUse: '保存工作进度、提取上游出口速度/温度分布供下游模型输入，或归档结果时使用。',
    recommendation: '重要里程碑建议同时写出 Case & Data；多级串联仿真可用 Write Profile 导出上一级出口截面速度分布直接给下一级作入口。',
    checkItems: ['确认目标磁盘空间足够且不覆盖不想丢弃的历史基线文件'],
    commonMistakes: '长跑计算结束忘记保存 Data 就直接关闭软件，导致辛苦算出的流场全部丢失。',
  },
)

addEntry(
  entries,
  [
    'ribbon-import',
    'ribbon-import-abaqus',
    'ribbon-import-cfx',
    'ribbon-import-cgns',
    'ribbon-import-nastran',
    'ribbon-import-abaqus-input',
    'ribbon-import-abaqus-results',
    'ribbon-import-cfx-definition',
    'ribbon-import-cfx-results',
    'ribbon-import-cgns-mesh',
    'ribbon-import-cgns-data',
    'ribbon-import-cgns-both',
    'ribbon-import-nastran-bulkdata',
    'ribbon-import-nastran-op2',
    'ribbon-import-ensight',
    'ribbon-import-tecplot',
    'ribbon-import-fmu',
  ],
  {
    whatItIs: '导入来自第三方前处理或结构/CFD 求解器的标准数据文件（如 CGNS 通用网格/流场、CFX、ABAQUS、NASTRAN、FMU 系统耦合单元等）。',
    whenToUse: '接收非 Fluent 原生前处理网格、做流固热跨软件映射或引入 FMU 系统动力学接口时使用。',
    recommendation: '导入外部网格后第一件事是核对长度单位并运行 Mesh → Check / Quality，确认单元体积全正与边界标签清晰。',
    checkItems: ['核对外来格式坐标系及单位制（如 Nastran/Abaqus 常以 mm 为基准）', '检查边界分区是否合并或需要重命名'],
    commonMistakes: '直接按外软件结果格式默认尺度求解而漏掉 Scale 单位换算。',
  },
)

addEntry(entries, ['ribbon-export', 'ribbon-export-solution', 'ribbon-export-particles'], {
  whatItIs: '把 Fluent 求解得到的表面或体场变量（速度、压力、温度、壁面热流、颗粒轨迹等）导出为 CGNS、EnSight、Tecplot、ASCII 表格等通用格式。',
  whenToUse: '需要将计算场交给 CFD-Post、EnSight、ParaView、Python/MATLAB 或结构有限元软件作映射/专业绘图时使用。',
  recommendation: '给结构软件传壁面温度/压力载荷时注意勾选目标表面，并核对导出的坐标单位和物理量单位（如绝压 vs 表压）。',
  checkItems: ['确认导出格式与下游软件兼容', '检查选择的表面范围、物理量清单以及是否包含节点插值'],
  commonMistakes: '整场体积导出过密全变量 ASCII 文件导致体积上 GB；大算例可视化推荐导出二进制 EnSight/CGNS。',
})

addEntry(entries, ['ribbon-switch-to-meshing'], {
  whatItIs: '从 Fluent 求解器（Solution）模式切换回 Fluent 网格划分（Meshing）模式，以调整几何离散或重新生成体网格。',
  whenToUse: '发现现有网格质量过差、y⁺ 严重不满足要求或局部细节缺失，需要在原环境重新画网格时使用。',
  recommendation: '切换前记得先保存当前已设好的物理 Settings 或 Case，避免重划网格后重复手工配置边界条件。',
  checkItems: ['切换前是否已导出/保存现有 Case 设置作为模板', '明确重划网格的目标部位（如局部尺寸或边界层第一层高度）'],
  commonMistakes: '未保存算例设置就切回网格模式导致此前辛苦调好的热边界和监控全部清空。',
})

addEntry(entries, ['ribbon-preferences'], {
  whatItIs: '打开会话级全局偏好设置，控制覆盖文件确认、多核/GPU 求解支持、界面外观及常规运行行为。',
  whenToUse: '调整批处理不弹覆盖确认、开启支持的原生 GPU 求解器加速或自定义常用交互习惯时进入。',
  recommendation: '教学或生产阶段涉及覆盖已有文件风险时，保持 Auto-Confirm Overwrite 关闭更为稳妥。',
  checkItems: ['确认开启 GPU Solver 时所用物理模型（如常规单相/稳态湍流）是否在硬件与版本支持矩阵内'],
  commonMistakes: '把不支持多相/复杂燃烧的模型强行丢进受限硬件模式而不检查 Console 警告。',
})

// --- General & Workspace ---
addEntry(entries, ['tree-general'], {
  whatItIs: 'General 任务面板汇集仿真最底层的四大配置：网格检查/尺度/显示、压力基/密度基求解器选择、Steady/Transient 时间属性、以及重力加速度。',
  whenToUse: '每次读入新网格进入 Solution 后的第一站，必须在设置任何物理模型或边界前全部逐项确认完毕。',
  recommendation: '严格遵循“先 Check Mesh & 核对 Scale 尺度 → 再选 Solver 与 Time → 然后检查 Gravity 与 Operating Pressure”的顺序。',
  checkItems: ['Domain Extents 坐标尺寸是否与真实工程大小一致（防 mm/m 差 1000 倍）', '不存在负体积，且 Time 与 Solver 选型匹配工况马赫数与非定常性'],
  commonMistakes: '刚读入网格就急着填边界和点算，忽略了几何其实比真实大 1000 倍或忘记勾选浮力所需重力。',
})

addEntry(entries, ['ribbon-physics-general'], {
  whatItIs: 'General 任务面板汇集仿真最底层的四大配置：网格检查/尺度/显示、压力基/密度基求解器选择、Steady/Transient 时间属性、以及重力加速度。',
  whenToUse: '每次读入新网格进入 Solution 后的第一站，必须在设置任何物理模型或边界前全部逐项确认完毕。',
  recommendation: '严格遵循“先 Check Mesh & 核对 Scale 尺度 → 再选 Solver 与 Time → 然后检查 Gravity 与 Operating Pressure”的顺序。',
  checkItems: ['Domain Extents 坐标尺寸是否与真实工程大小一致（防 mm/m 差 1000 倍）', '不存在负体积，且 Time 与 Solver 选型匹配工况马赫数与非定常性'],
  commonMistakes: '刚读入网格就急着填边界和点算，忽略了几何其实比真实大 1000 倍或忘记勾选浮力所需重力。',
  operation: {
    coreConcept: 'General 面板相当于整场仿真的“总地基”：长度单位不对，后面雷诺数和压降全偏；时间模式（Steady/Transient）不对，求解方式与后处理意义全错；重力未开，热对流/VOF 自由液面失去驱动力。',
    steps: ['点击 Check 并查 Domain Extents 核对真实长宽高，有误先点 Scale 转换单位。', '确定 Solver Type（常规低速/多相用 Pressure-Based，强可压缩高速激波评估 Density-Based）及 2D 空间形态。', '设定 Steady 或 Transient；若存在自然对流、浮力或液面分层则勾选 Gravity 并设定正确方向和 -9.81 m/s²。'],
    example: '进入混合弯管教学算例后，先 Check 确认水力直径 0.1 m 无负体积，选 Pressure-Based + Steady；如果改算热浮力分层流，再补开 Gravity 设 Y = -9.81 m/s²。',
  },
})

addEntry(entries, ['ribbon-run-steady'], {
  whatItIs: 'Fluent 顶栏 Physics / Solution 工具栏中用于快速切换当前仿真时间模式为稳态（Steady）的按钮。',
  whenToUse: '当流动与换热目标关注时间无关的平衡态或统计定常平均场，且无强周期涡脱落影响目标量时选用。',
  recommendation: '与 Setup → General → Time → Steady 联动同步；切换后去 Run Calculation 输入迭代步数而非物理时间步。',
  checkItems: ['确认目标物理量不依赖启动瞬态曲线', '稳态收敛需看监控量走平与质量/能量平衡'],
  commonMistakes: '切换回 Steady 后忘记物理上原本存在的非定常脱落仍会使残差波浪状振荡。',
})

addEntry(entries, ['ribbon-run-transient'], {
  whatItIs: 'Fluent 顶栏 Physics / Solution 工具栏中用于快速切换当前仿真时间模式为瞬态（Transient）的按钮。',
  whenToUse: '需要追踪升温/冷却过程、涡街主频、自由液面晃荡、周期性旋转/滑移运动或时变边界响应时点击启用。',
  recommendation: '切换到 Transient 后务必检查三处联动：Solution Methods 时间离散格式、Run Calculation 时间步长 Δt、以及 Autosave 自动保存频率。',
  checkItems: ['计算特征库朗数 Co 核定合理 Δt', '保证每个时间步内迭代收敛而非仅算 1~2 步强行推进'],
  commonMistakes: '打开 Transient 后只调整总步数，忘记设定物理初场或时间步内最大迭代次数。',
})

addEntry(entries, ['general-2d-space'], {
  whatItIs: '当网格为二维切片时，指定控制方程采用的二维空间几何假设：平面（Planar）、二维轴对称（Axisymmetric）还是带切向周向旋转速度的轴对称旋流（Axisymmetric Swirl）。',
  whenToUse: '仅在 2D 求解模式下可见并需要核对；对圆管/喷嘴首选 Axisymmetric（要求轴线为 X 轴，Y≥0），旋风分离器/带旋流喷嘴用 Axisymmetric Swirl。',
  recommendation: '用圆管截面建模切记选 Axisymmetric（此时面积和体积绕 X 轴旋转积分，相当于 3D 圆管切片）；如果选成 Planar 则变成了无限宽二维平板狭缝，流量与传热会截然不同！',
  checkItems: ['轴对称模型的对称中心线必须严格位于 y = 0（X 轴）且网格全部位于 y ≥ 0 区域', '对称中心轴线边界类型设为 Axis'],
  commonMistakes: '算圆管压降却忘记把默认 Planar 改成 Axisymmetric，或者几何没摆在 X 轴上就选 Axisymmetric 导致负体积报错。',
  operation: {
    coreConcept: 'Planar 沿深度方向 Z 取单位长度 1 m 拉伸（平板通道假设）；Axisymmetric 则绕 X 轴旋转 2π 弧度形成回转体（圆柱圆管假设），连续性方程和面积积分因此多出柱坐标因子 r。',
    choices: [
      ['Planar', '二维平面拉伸问题（如无限宽扁平风道、二维圆柱绕流尾迹测试）。'],
      ['Axisymmetric', '无切向绕流旋转的几何与边界完全轴对称体（圆管、拉瓦尔圆喷管、对称射流）。'],
      ['Axisymmetric Swirl', '二维截面网格下同时额外求解周向切线速度 w 方程，适合旋流燃烧器或涡流管简化模拟。'],
    ],
    steps: ['导入 2D 网格后先确认中心轴线是否在 y = 0 且无 y < 0 单元。', '在 2D Space 选择 Planar / Axisymmetric / Axisymmetric Swirl。', '将轴线边指定为 Axis 边界条件（而非 Wall 或 Symmetry）。'],
    example: '模拟直径 20 mm 圆形管道换热，只画半截二维矩形：将下底边落在 y = 0 设为 Axis，General 中选 Axisymmetric，即可精确等价于三维圆管结果而网格量骤降 95%。',
  },
})

addEntry(entries, ['general-absolute-velocity', 'general-relative-velocity'], {
  whatItIs: '控制动量方程中速度求解变量采用基于静止惯性系的“绝对速度（Absolute）”，还是基于各旋转/运动区域参考系的“相对速度（Relative）”。',
  whenToUse: '静止域默认用 Absolute；当绝大多数区域处于同一旋转系或做单转子外流（如孤立风力机/叶轮），采用 Relative 常有助于减小离散截断误差。',
  recommendation: '含多个不同转速旋转域与静止导叶壳体的机器（MRF 多参考系或滑移网格）通常使用 Absolute；无论选哪种，与 Cell Zone 旋转设定和壁面速度设置结合时 Fluent 都会自动换算，只需保持入口/壁面参考说明一致。',
  checkItems: ['使用 Relative 时注意入口/出口流速及边界条件说明需明确是绝对还是相对参考系'],
  commonMistakes: '多转速叶轮机同时含静止机匣和高速转子时混淆壁面相对静止的参照对象。',
})

addEntry(entries, ['general-gravity-enable', 'general-gravity-x', 'general-gravity-y', 'general-gravity-z'], {
  whatItIs: '开启重力体积力项 ρg 并定义重力加速度向量在全局 X、Y、Z 轴上的分量。',
  whenToUse: '当计算涉及自然对流换热、温差浮力分层、VOF 自由液面晃荡/射流下落、液体静压分布、多相气泡上浮或颗粒沉降时必须勾选并填准方向。',
  recommendation: '竖直方向按右手坐标系核对方向（通常建模若 Y 轴向上则设 Y = -9.81 m/s²，Z 轴向上则设 Z = -9.81 m/s²）；勾选重力后去 Operating Conditions 确认 Operating Density 以提高数值精度。',
  checkItems: ['查看图形坐标轴确定哪一根轴是竖直“向上”，重力应与竖直向上相反（负值）', '开启浮力后同时核对材料密度模式（如 Boussinesq 或 Ideal Gas / 分段拟合）'],
  commonMistakes: '开着 Y = -9.81 m/s² 算水平直管内部强制对流时无大碍，但做自然对流冷热分层却忘记勾选 Gravity，或坐标系 Z 朝上时仍沿用默认 Y = -9.81 m/s² 导致热羽流往横向歪着飘！',
  operation: {
    coreConcept: '控制方程默认不包含重力；只有在开启 Gravity 后动量方程才加上 ρgᵢ。对强迫流动若全计算域密度为常数且不看绝对静水压差，重力可并入修正压力项中不单开；一旦密度随温度/组分/相而变化，重力就会驱动核心浮升力与压头差。',
    parameterEffects: [
      ['Operating Density（配合重力使用）', '启用热对流/浮力时通常在 Operating Conditions 将参考操作密度设为环境流体最小/平均密度 ρ₀，Fluent 会求解去除静水压头的耦合场，消除大静压头下舍入误差。'],
    ],
    steps: ['在图形视口左下角坐标系确认竖直向上指向哪个坐标轴。', '勾选 Gravity，把对应竖直轴分量填入 -9.81 m/s²，其余两轴保持 0。', '前往 Operating Conditions 核对 Specified Operating Density 及参考压力点。'],
    example: '密封机柜自然对流散热，三维建模以 +Z 为竖直高度方向：启用 Gravity 并填入 X=0, Y=0, Z=-9.81 m/s²，热空气自然沿 +Z 上升排出。',
  },
})

addEntry(
  entries,
  ['general-scale', 'ribbon-mesh-scale', 'ribbon-zone-transform'],
  {
    whatItIs: '对已有网格节点的坐标执行按倍缩放（Scaling）、单位换算，以及（在 Transform 中）平移或旋转坐标系变换。',
    whenToUse: '读入网格后在 Mesh Check 发现 Domain Extents 与实际实物尺度差 1000 倍（例如按 mm 导出却被识别成 m）时立刻调整。',
    recommendation: '优先使用 Mesh Was Created In 选原始单位，Fluent 会自动把内部计算网格统一折算成米（m）；注意点击 Scale 后务必检查边界位置和参考值。',
    checkItems: ['缩放前先记录当前 Domain Extents (X/Y/Z min~max)，缩放后再次 Check Mesh 确认目标尺寸准确'],
    commonMistakes: '以为 Scale 只改显示标签，或者按多次 Scale 按钮把模型连续缩小了两次 0.001 倍！',
  },
)

addEntry(entries, ['general-check', 'ribbon-mesh-check'], {
  whatItIs: '执行全面拓扑与几何自检：统计 Domain Extents 坐标包络范围、检验是否存在负体积单元（Minimum Volume < 0）、左右手准则错误（Face Handedness）及区域连通性。',
  whenToUse: '每次读入新网格、执行缩放/变换、合并接口或网格自适应之后必须执行。',
  recommendation: '确保 Minimum Volume > 0 且无致命报错才能初始化计算；若有负体积，先回到前处理修复或局部 Smooth，绝对不要带负体积强算。',
  checkItems: ['Domain Extents 长度是否和实际物理对象一致', 'Minimum Volume 严格为正，Interfaces 与相邻面均对齐'],
  commonMistakes: '跳过 Mesh Check 直接初始化，发散半天才发现几何导出时其实按 mm 算大了一千倍。',
})

addEntry(entries, ['general-report-quality', 'ribbon-mesh-info', 'ribbon-mesh-quality'], {
  whatItIs: '输出并量化评估当前三维/二维网格的核心数值质量指标：最小正交质量（Minimum Orthogonal Quality）、最大偏斜率（Maximum Skewness）以及最大长宽比（Maximum Aspect Ratio）。',
  whenToUse: '评价一套划分好的网格是否满足有限体积求解器稳定性与二阶精度的安全门槛。',
  recommendation: '稳妥准则：Minimum Orthogonal Quality 最好 > 0.15（底线 > 0.05~0.10）、最大偏斜率 < 0.90（理想 < 0.85）；若极个别单元不达标，用 Smooth/Swap 改善。',
  checkItems: ['分清内部体网格质量（对求解稳定性影响更大）与近壁边界层合理大长宽比', '记录单元数量并估算所需内存与核数'],
  commonMistakes: '看见高纵横比提示就盲目嫌弃——贴壁棱柱边界层原本就需要沿壁向扁平伸展，较高长宽比在此处属正常现象，重点看贴壁外核心单元的正交质量。',
})

addEntry(entries, ['general-display', 'ribbon-mesh-display', 'results-mesh'], {
  whatItIs: '在图形视口选择要绘制的边界面或内部体区，并控制是否显示网格线框（Edges）与面渲染（Faces），用于定位边界分布并检视网格疏密。',
  whenToUse: '确认新读入几何的入口/出口面位置是否正确、核对界面配色以及叠加在云图上的模型外形轮廓时使用。',
  recommendation: '习惯上刚进算例立刻显示一次入口（蓝色）与出口（红色）表面确认方向无误；展示百万级大型网格时关闭不必要内表面仅留边界壳面可显著减少显卡卡顿。',
  checkItems: ['确认进/出口命名与实际几何端面一一对应', '叠加云图显示时可用轮廓线（Edges Outline）让外部几何一目了然'],
  commonMistakes: '因未单独点开选表面而误以为部分管道几何丢失，实际只是该表面未被勾选 Display。',
})

addEntry(entries, ['general-units', 'ribbon-physics-units'], {
  whatItIs: '切换Fluent 界面输入框和后处理报告显示的物理量单位（如 mm、°C、kPa、rpm、g/s），而控制方程底层仍严格以 SI 国际单位运算。',
  whenToUse: '工程图纸给定的是温度 °C、流速 L/min、气压 bar 或长度 mm 时，可将显示单位切为习惯单位以避免手工换算出错。',
  recommendation: '改单位后注意所有面板及后处理会跟着切换；多人协作或提交报告前，可借助 Restore SI 或在括号单位处反复核对。',
  checkItems: ['区分绝压与表压单位差异', '改变温度单位（K ↔ C）时核对表达式和曲线表中的数值单位一致性'],
  commonMistakes: '刚把温度单位改成 °C 后在边界面板误把绝对温度 300 K 填成 300 °C！',
})

// --- Mesh Operations & Interfaces ---
addEntry(entries, ['ribbon-mesh-reorder', 'ribbon-mesh-reorder-domain', 'ribbon-mesh-reorder-zones', 'ribbon-mesh-reorder-bandwidth'], {
  whatItIs: '通过 Reverse Cuthill-McKee 等矩阵带宽压缩重排算法，优化网格单元与节点在内存中的编号排列顺序。',
  whenToUse: '读入由外部开源或第三方软件（如 ICEM 合并域或 HyperMesh）生成的编号杂乱网格后，用于加速迭代矩阵访存局部性并缩小矩阵带宽。',
  recommendation: '读入较大非原生网格后执行一次 Reorder Domain 往往能白赚 10%~20% 的求解迭代速度提升，且完全不改变物理坐标与网格形状。',
  checkItems: ['可先点击 Print Bandwidth 查看带宽优化前后对比', '多区域可同时重排 Zones'],
  commonMistakes: '误以为 Reorder 会改变几何形状、增加单元或修改边界条件——它纯粹重排编号序号，安全无副作用。',
})

addEntry(entries, ['ribbon-mesh-smooth'], {
  whatItIs: '使用 Laplace/Skewness 光顺微调内部节点坐标或对不良三角/四面体局部面边执行拓扑交换（Swap），提升最差单元正交质量与偏斜率。',
  whenToUse: 'Quality 报告显示极少数非边界层核心单元偏斜率接近 0.95 或正交质量跌破 0.05 时，在 Solution 内部快速补救。',
  recommendation: '光顺/交换后务必再次运行 Check & Report Quality，确认最差单元确有提升且壁面几何轮廓未变形。',
  checkItems: ['优先选用基于 Skewness 准则的局部修正', '仅限修复少量孤立坏单元；整片区域质量极差应回 Meshing 重划'],
  commonMistakes: '过度放宽边界点光顺把尖锐特征倒角或关键管壁位置拉跑偏。',
})

addEntry(entries, ['ribbon-mesh-polyhedra'], {
  whatItIs: '将现有纯四面体（Tetrahedral）或含四面体区域的网格直接在 Solution 中合并转换为多面体（Polyhedral）网格，可保留贴体边界层。',
  whenToUse: '手中只有老旧纯四面体网格且单元数过多、收敛困难，来不及回前处理重划时现场原地转为多面体网格。',
  recommendation: '勾选 Preserve Boundary Layers 以防止破坏已经按 y⁺ 生成好的贴壁棱柱层；转换后记得重新 Check Mesh 并保存新的 Case 文件！',
  checkItems: ['转换后会大幅减少总单元数量并显著增加单元平均面数，收敛速度往往翻倍', '转换后重新核对 Report Quality 并保存新 .cas.h5'],
  commonMistakes: '转换前如果本来就存在严重的负体积，原位合并无法消除拓扑错误；转换后忘记重新保存 Case 导致读不回旧 Data。',
})

addEntry(entries, ['ribbon-zone-merge', 'ribbon-zone-separate', 'ribbon-zone-adjacency', 'ribbon-zone-delete', 'ribbon-zone-replace', 'ribbon-zone-append', 'ribbon-interface-orient'], {
  whatItIs: 'Mesh Zone 分区管理工具组：支持合并多个碎片边界（Merge）、按角度/连通域拆分单个边界或体区（Separate）、查看相邻连接（Adjacency）、替换/删除及追加拼装多套独立网格（Append）与法向朝向检查。',
  whenToUse: '前处理忘给某面命名需按几何折角拆出独立入口，或者需把多个子部件独立划分的网格（如转子区+蜗壳区）拼接进同一算例时使用。',
  recommendation: '把多个组件 Mesh 用 Append Case 拼在一起后，务必紧接创建 Mesh Interface 或合并邻接界面并再次 Check Mesh；拆分 Separate 时按 Feature Angle（常取 30°~45°）先预览分离效果。',
  checkItems: ['Append 后立即执行 Mesh Check 确认区域不冲突重叠（滑动交界面除外）', '用 Adjacency 与 Orient 确认各面邻接区域未漏连'],
  commonMistakes: '把多个本来共享节点的区域误删除了内部 interior 分界面导致流体域直接开天窗报错。',
})

addEntry(entries, ['tree-mesh-interfaces', 'ribbon-interface-mesh', 'interface-pair-name', 'interface-option', 'interface-matching', 'interface-create'], {
  whatItIs: 'Mesh Interfaces 用于将两套彼此贴近但不共享节点（Non-Conformal Mesh）的边界面配对建立流场与热通量插值连接，也支持旋转机械滑移网格（Sliding Mesh）相对旋转和共轭传热 Coupled Wall。',
  whenToUse: '独立生成后再拼接的两部分网格（如旋转叶片域 vs 静止壳体域、局部六面体网格块 vs 外围多面体网格块）无法直接通过共享拓扑合并节点时建立。',
  recommendation: '配对后一定要勾选正确的 Interface Option：两流体域连通无需壁面阻隔保持默认或 Interior 类连通；流固之间交界应自动生成 Coupled Wall；几乎重合或尺寸齐整且无相对运动时可选 Matching（若存在大旋转运动如叶轮绝对不选不适用静态假设，或检查静止拼合重叠度）。',
  checkItems: ['配对两面尺寸比例尽量接近（不要一边 1 mm 另一边 20 mm 导致插值守恒漂移）', '创建后查看自动生成的 interior 与 wall-non-overlapping 面积是否异常巨大'],
  commonMistakes: '非共形界面两端原本尺寸空隙太大时未检查未重合面（non-overlapping wall）占比，导致本该通水的通道一半面积被堵成墙壁！',
  operation: {
    coreConcept: '理想情况是前处理 Share Topology 实现 1:1 节点对齐（零插值误差）。当结构受限无法共享节点（例如转静滑移网格必不能共享节点，否则转起来会拉扯网格撕裂）时，Mesh Interface 就是两套独立网格跨界传递质量、动量和能量的“翻译桥梁”。',
    steps: ['先在 Mesh → Boundary Conditions 将要对接的两侧接触面均设为 Interface 类型。', '进入 Mesh Interfaces 新建界面名，分别选中 Mesh Zone 1 与 Mesh Zone 2 并设定选项后点击 Create。', '检查生成的重叠连通区（interior）面积和未重叠孤立死区面积是否合理。'],
    example: '搅拌罐内圈叶轮旋转域与外圈静止挡板域各自划好网格后，将两圈圆柱交界面均设为 interface，建立 `impeller-tank-interface` 即可支持稳态 MRF 或瞬态 Sliding Mesh 转动传递流动。',
  },
})

addEntry(entries, ['ribbon-interface-overset'], {
  whatItIs: '配置重迭网格（Overset Mesh / Chimera）交界面：在背景静止网格与可大幅度平移/摆动/旋转的组件网格重叠区域之间自动挖洞（Hole Cutting）和建立施主-受体单元（Donor-Acceptor）插值。',
  whenToUse: '当物体出现极大幅度的跨尺度运动（如导弹分离、阀门完全关闭打开、船舶六自由度大幅摇荡）导致普通动网格重构极易产生负体积畸变时选用。',
  recommendation: '组件网格外边界必须设为 Overset 边界，且与背景网格在重叠插值层处的单元尺寸必须处于同一个量级（尺寸比最好控制在 0.5~2.0 倍以内），才能成功找到可用 Donor 单元。',
  checkItems: ['使用 Overset 需将界面两侧重叠处网格加密匹配', '创建 Interface 后立即执行 Create/Initialize 验证无孤立 Orphan Cells'],
  commonMistakes: '背景网格远粗于组件网格 10 倍，导致系统搜不到足够厚度的重叠插值单元，报 Orphan Cells 大面积插值失败。',
})

// --- Adaptation & Cell Registers ---
addEntry(
  entries,
  [
    'tree-mesh-adaptation',
    'ribbon-adapt-refine',
    'ribbon-adapt-mark',
    'ribbon-adapt-controls',
    'adapt-refine',
    'adapt-register',
    'tree-cell-registers',
    'ribbon-cell-registers',
    'register-name',
    'register-shape',
    'register-open-adapt',
    'register-open-patch',
  ],
  {
    whatItIs: 'Cell Registers 根据几何包络、物理量场值（如压力梯度、温度、VOF 气液相界面、壁面 y⁺）选出一批指定单元集合；既可用于 Patch 局部初始化，也可驱动 Mesh Adaptation 在求解中途按物理高梯度区域自动加密/粗化网格（AMR）。',
    whenToUse: '冲击激波/自由液面需要高分辨率但不想全网格暴力加密，或者局部管道想给特定温度/相分率初始区域填值时使用。',
    recommendation: '自适应加密（Dynamic / Manual Adapt）务必设置 Maximum Refinement Level（通常 2~4 级）与最小单元尺寸下限，防止局部无限分裂把内存吃光；记得保存加密后同期改变拓扑的新 Case & Data！',
    checkItems: ['先 Mark + Display 预览被选中的单元范围再点 Adapt/Patch，避免误中全域', '动态自适应多相界面（如 VOF）注意同时允许满足条件后释放加密的 Coarsen 以节省总单元数'],
    commonMistakes: '先做完网格自适应（网格单元数量已变），接着只写了个 Data 覆盖文件却不保存新 Case，致使下回打不开文件。',
    operation: {
      coreConcept: '如果算前划分网格是“按经验预先估计哪里梯度大”，网格自适应（Mesh Adaptation）就是“等流场算出激波、液面或大温度梯度位置之后，让求解器精准对这些真正有需要的区域做局部分裂细化”。',
      steps: ['在 Cell Registers 根据 Field Variable（如流场梯度、VOF 体积分率区间或几何形状）新建标记条件。', '检查被 Mark 选中的单元分布及数量占总网格比例。', '点击 Adapt 执行局部加密，或跳至 Initialization 使用该 Register 区域做精准 Patch 赋初值。'],
      example: '超声速激波管与两相自由液面（VOF）晃荡问题，可依据液相体积分率梯度（0.1~0.9 相界面处）做动态自适应加密，用 1/3 的计算量捕获同样锐利的液面波纹。',
    },
  },
)

// --- Dynamic Mesh, Motion, Reference Frames, Aux Geometry, Curvilinear ---
addEntry(entries, ['tree-dynamic-mesh', 'ribbon-dynamic-mesh', 'ribbon-gap-model', 'dynamic-mesh-enable', 'dynamic-mesh-zones'], {
  whatItIs: 'Dynamic Mesh 用于在瞬态计算中随边界真实位移或旋转（由指定 Profile、UDF 或 6-DOF 刚体受力反算）实时变形、推移或重构周围体网格；附带的 Gap Model 则用于处理阀芯闭合/齿轮啮合极小间隙处的防漏流模拟。',
  whenToUse: '当计算域形状随物理时间实质性改变（活塞往复运动、单向阀自动启闭、气缸压缩、振翼运动、球阀闭合）时使用；若仅仅是刚体纯定轴整块旋转且流道形状不变，优先用更轻便稳定的 Sliding Mesh（滑移网格）！',
  recommendation: '依据运动幅度选网格更新方法：小幅振动用 Spring/Diffusion Smoothing；单向推拉六面体规则行程用 Layering；大幅大角度不规则变形结合四面体用 Remeshing（需控制尺寸阈值和偏斜率上限）。',
  checkItems: ['启动计算前一定要用 Preview Mesh Motion 在无流场下干跑几步检查会不会发生网格撕裂或负体积', '动态网格只能在 Transient 瞬态下开启，且时间步长必须严格满足“单步边界位移 < 相邻半个网格高度”'],
  commonMistakes: '时间步长太大导致运动壁面一步就穿透过了相邻一整排网格单元，立刻报 Negative Cell Volume 崩盘。',
  operation: {
    coreConcept: '解决边界运动问题有三个梯度：① 形状不变仅整体平移/圆周转动选 MRF（稳态近似）或 Sliding Mesh（瞬态滑移界面）；② 形状和容积发生实时拉伸压缩选 Dynamic Mesh（Smoothing/Layering/Remeshing）；③ 极大行程多体互穿选 Overset 嵌套网格。',
    choices: [
      ['Smoothing', '节点像弹簧一样弹性拉伸压缩（适合微小振幅、边界不变拓扑的蠕动）。'],
      ['Layering', '沿运动方向遇到规则棱柱/六面体网格按层生长分裂或合并消失（活塞上下运动最稳首选）。'],
      ['Remeshing', '当局部四面体/三角形扭曲超过阈值时自动重新划分局部网格（复杂大变形必备，要求背景区为可重构四面体/三角形）。'],
    ],
    steps: ['首先确认求解处于 Transient 模式，在 Dynamic Mesh 中启用所需的 Smoothing / Layering / Remeshing 机制。', '在 Dynamic Mesh Zones 为运动边界与随动体区指定 Rigid Body / Deforming 类型并挂载运动规律（Profile / 6-DOF / UDF）。', '使用 Preview Mesh Motion 空转验证整个周期内最小正交质量与无负体积，再开始真实流场求解。'],
    example: '模拟活塞在气缸内下行抽气：用四面体或棱柱层划分可压缩腔，开启 Dynamic Mesh → Layering（按理想高度分层裂解新增气缸六面体层），设置活塞 Rigid Body 简谐规律并预览无碰撞后投入瞬态求解。',
  },
})

addEntry(entries, ['tree-motion-definitions', 'motion-type', 'motion-rpm', 'motion-axis', 'motion-apply-zone'], {
  whatItIs: 'Motion Definitions 集中管理独立定义的旋转/平动运动参数（转速、旋转轴矢量、原点等），供 Cell Zone Conditions（MRF / Mesh Motion）或运动壁面快速绑定调用。',
  whenToUse: '需要将同一套叶轮转速或旋转坐标系规范地应用给流体域、旋转轴壁面等多个部位时统一定义与维护。',
  recommendation: '严格遵循右手螺旋定则确认旋转轴方向向量正负号对转向的影响；关联多个壁面时切记区分“随着坐标系转”还是“在绝对坐标系下保持静止（机匣外壁）”。',
  checkItems: ['单位（rpm vs rad/s）与旋转轴起点（Origin）不要遗漏坐标平移偏移量', '与 Cell Zone Frame Motion / Mesh Motion 核对同步状态'],
  commonMistakes: '叶轮在图形上其实应该逆时针转却填成了正方向，或者机匣内静止壁面随旋转流体域默认继承相对速度 0 而跟着旋转！',
})

addEntry(entries, ['tree-reference-frames', 'ref-frame-name', 'ref-frame-motion', 'ref-frame-omega'], {
  whatItIs: 'Reference Frames（参考系管理）定义仿真中使用的静止惯性系（Absolute）和各旋转/移动非惯性参考系（Moving Reference Frame），方便跨区域和边界统一指定相对参照物。',
  whenToUse: '做叶轮机械 MRF（多参考系稳态近似）、旋转圆盘泵体计算或需要相对某个运动坐标系报告速度与壁面条件时建立。',
  recommendation: '稳态算旋转叶轮选用 MRF（Frame Motion），在计算中网格本身不动而是方程自动加入科氏力和离心力源项；若叶片尾迹对下游静叶产生严重瞬态扫掠冲击，需进一步选用同一转速的 Mesh Motion（Sliding Mesh）。',
  checkItems: ['查看全局坐标中旋转轴指向与转速方向是否符合流道设计', '静止机匣外壁在旋转参考系中需勾选绝对静止（Moving Wall → Absolute → Speed = 0）'],
  commonMistakes: '旋转流体域包裹着静止的外壳壁面，却把外壳壁面速度留成默认的 Relative to Adjacent Cell Zone = 0，导致外壳也跟着高速自转！',
})

addEntry(entries, ['tree-auxiliary-geometry', 'aux-shape-type', 'aux-origin', 'aux-radius'], {
  whatItIs: 'Auxiliary Geometry 定义仅用于空间定位、后处理切面参考、多相局部加密或动态区域判定的几何辅助形状（圆柱、球体、平面、包围盒），不参与物理阻流或固体边界计算。',
  whenToUse: '在不改动原有网格的前提下，给 Cell Register 划定特定几何区做局部 Patch 赋初值、局部梯度监测或辅助后处理截取范围时创建。',
  recommendation: '给定 Origin、轴向与 Radius 半径时，确认尺寸采用与当前网格一致的长度基准并 Display 叠加检查是否精准包住目标区域。',
  checkItems: ['核对半径和坐标方向符号', '用作 Patch/Adapt 标记条件时注意组合逻辑（Inside vs Outside）'],
  commonMistakes: '把辅助圆柱的直径数值错填成 Radius 半径导致影响域大了一倍。',
})

addEntry(entries, ['tree-curvilinear-coordinates', 'curv-method', 'curv-zone', 'curv-compute'], {
  whatItIs: 'Curvilinear Coordinates（曲线贴体坐标系）通过势流或几何方向沿弯管/弯曲风道自动建立贴合流动主方向的曲线局部坐标轴，供各向异性多孔介质阻力方向或后处理沿程分段分析使用。',
  whenToUse: '处理弯曲蛇形催化器、复杂弯曲散热芯体等多孔介质时，全局直角 X/Y/Z 无法表达沿管道弯曲转角变化的顺流阻力方向（Direction-1）与垂直过滤方向，此时用曲线坐标可自动跟随管轴旋转！',
  recommendation: '选定流体多孔区域并计算后，务必通过矢量图检查生成的曲线方向矢量是否真实顺着弯道从入口平滑指向出口。',
  checkItems: ['先保证弯曲通道区域入口、出口拓扑清晰才能算通势流切向方向', '将算出的 Curvilinear Coordinate 指派给多孔介质方向定义'],
  commonMistakes: '弯曲多孔管直接按直角坐标指定全局 X 轴作为低阻穿透主方向，导致转弯 90° 后流体正好撞进高阻力壁面方向，压降瞬间虚高十倍。',
})

// --- Graphics, Console, Outline, Help ---
addEntry(
  entries,
  [
    'graphics-select',
    'graphics-rotate',
    'graphics-pan',
    'graphics-zoom',
    'graphics-style',
    'graphics-fit',
    'graphics-selection-filter',
    'ribbon-view-iso',
    'ribbon-view-front',
    'ribbon-view-back',
    'ribbon-view-top',
    'ribbon-view-bottom',
    'ribbon-view-left',
    'ribbon-view-right',
    'ribbon-view-fit',
    'ribbon-view-reset',
    'ribbon-view-display',
    'ribbon-view-lights',
    'ribbon-view-colormap',
  ],
  {
    whatItIs: 'Graphics Window（图形视口与视图工具栏）用于交互控制三维流体模型与结果场云图的视角、旋转平移缩放、实体拾取过滤、等轴测/正交视角切换以及灯光着色渲染样式。',
    whenToUse: '日常检查网格边界位置、缩放观察近壁境界层局部特征、对齐截面视角截高质量分析图片时使用。',
    recommendation: '经常结合 Fit View / Views（Isometric / Front / Top）与切面视角对齐，在正式汇报截图前调好 Display Options 灯光亮度与色标极值刻度范围。',
    checkItems: ['选择工具失灵时看右侧 Selection Filter 是否错锁了边/面/体对象过滤', '切入小区域后按 Fit View 快速拉回完整视口'],
    commonMistakes: '鼠标滚轮把模型移飞到视野外找不到时漫无目的乱划，其实点击 Fit View 或任一预设视图即可一键回中。',
  },
)

addEntry(entries, ['console-area'], {
  whatItIs: 'Fluent 底部控制台（Console / TUI 命令行窗口）：实时输出计算残差表、Mass/Energy 通量报告、报错警告信息，并支持直接输入 TUI（Text User Interface）命令实现高效配置与脚本回放。',
  whenToUse: '任何时刻都要习惯观察 Console 提示：查看读网格/Check Mesh 诊断、检查迭代步残差与收发信息、核对报错原因或直接敲快捷 TUI 命令批处理调参。',
  recommendation: '发散报错或边界结果异常时，第一步向上翻看 Console 最先出现的那几条 WARNING 或 Error，通常答案就写在最靠前的第一条报错里，而不是只看最后几行发散符号！',
  checkItems: ['习惯使用 TUI 的 `/` 路径格式与空格补全核对长路径参数', '重要算例排查可将 Console 输出写为 Transcript 文字记录存档'],
  commonMistakes: '完全不看 Console 直接闭眼跑算例，连网格负体积警告、质量未闭合或边界类型错误提示都错过了。',
})

addEntry(entries, ['outline-filter'], {
  whatItIs: '功能树搜索过滤框（Outline View Filter）：输入中英文关键词实时过滤左侧 Setup / Solution / Results 分支节点，快速锁定藏在深层分支中的设置面板。',
  whenToUse: '模型与边界条件节点众多时，直接输入 `inlet`、`turbulence`、`report`、`contours` 等关键词一步定位。',
  recommendation: '找不见某个高级分支（如 Dynamic Mesh / Report Definitions）时，直接在这里搜比一层层折叠翻树快得多；不用时清零即可恢复全部节点树。',
  checkItems: ['清空过滤词确认被隐藏的同级树节点恢复可见'],
  commonMistakes: '忘掉自己刚在过滤栏输入过单词，以为别的模块功能节点凭空消失了！',
})

addEntry(entries, ['quick-search'], {
  whatItIs: '全局功能快速搜索框（Ribbon Search / Quick Search）：通过中英文关键词一次性跨 Ribbon、功能树、对话框与 TUI 指令检索所有控件并直接高亮定位与查看教学解释。',
  whenToUse: '只记得某个概念词（如 `y+`、`steady`、`k-omega`、`Coupled`、`residual`、`autosave`）但忘了它在界面哪个菜单位置时直接使用。',
  recommendation: '配合右侧专业教学与报错排查向导使用，能最快打通“知道概念词 → 找到准确软件开关位置 → 搞懂原理”的学习闭环。',
  checkItems: ['支持使用英文专业术语与常见中文简称检索'],
  commonMistakes: '只在当前这一个 Ribbon 页签翻找找不到就放弃，其实目标往往在隔壁选项卡或全局搜索框里一秒直达。',
})

addEntry(
  entries,
  [
    'ribbon-help-walkthrough',
    'ribbon-help-troubleshoot',
    'ribbon-help-meshing',
    'ribbon-help-calculators',
    'ribbon-help-formulas',
    'ribbon-help-tui',
  ],
  {
    whatItIs: 'Help 与平台配套学习工具栏：集中串联了从前处理切换到 Meshing 的工作流、10 步入门导览、常见报错诊断中心、专业 CFD 计算器、公式库与 Fluent TUI 命令速查表。',
    whenToUse: '遇到收敛振荡不知如何下手排查、需要立刻计算第一层网格高度 y⁺ / 水力直径 / 时间步 Δt，或要写脚本时快速直达对应辅助工具。',
    recommendation: '养成“先用计算器预估物理特征数（Re / y⁺ / Δt）再进设置，遇报错开 Troubleshooting 对比特征症状”的高效工程习惯。',
    checkItems: ['通过内置教学指引切换验证真实软件对应界面路径', '计算完物性或时间尺度参数再回来精确填数'],
    commonMistakes: '算不通时反复凭感觉瞎调参数，而不查排查向导或检验基础特征无量纲数（Re、Co、y⁺）。',
  },
)

addEntry(entries, [
  'ribbon-zone-transform-scale',
  'ribbon-zone-transform-translate',
  'ribbon-zone-transform-rotate',
  'mesh-scale-spec-method',
  'mesh-scale-unscale',
  'mesh-translate-x',
  'mesh-translate-y',
  'mesh-translate-z',
  'mesh-scale-translate-btn',
  'mesh-rotate-angle',
  'mesh-rotate-axis',
  'mesh-rotate-origin',
  'mesh-scale-rotate-btn',
], {
  whatItIs: 'Domain 网格坐标变换组（Scale / Translate / Rotate）：统一修正导入网格的实际工程尺度（如毫米转米）、坐标平移对齐以及绕指定轴线旋转装配角度。',
  whenToUse: '当 CAD 导入坐标系偏离目标零点、单位缩小/放大千倍，或需要将轴对称/旋转部件基准轴重对齐到全局 Z 轴时执行。',
  recommendation: '缩放前先看 Domain Extents 当前物理跨度，Scale 与 Unscale 成对核对；执行 Translate 或 Rotate 偏移坐标后顺手同步更新参考点或旋转轴原点。',
  checkItems: ['缩放或平移结束后重新核对 Domain Extents 数值与图纸尺寸完全一致', '确认网格内部不存在因极小缩放系数导致的精度截断'],
  commonMistakes: '误把 Scale 当成显示单位切换而反复多次点击缩放因子，导致水力直径与雷诺数同时缩小成千分之一！',
})

addEntry(entries, [
  'ribbon-physics-gravity',
  'operating-ref-pressure-loc',
  'operating-specified-density',
  'operating-temp',
], {
  whatItIs: 'Operating Conditions 与 Gravity（参考压力位置、操作密度与重力浮力源项）：确定不可压缩表压参考锚点、自然对流冷环境密度基准以及重力矢量方向。',
  whenToUse: '凡涉及封闭腔体无压力边界（需靠 Reference Pressure Location 定零压点）、自然对流换热、气液VOF分层液位或强密度温差浮力问题时必须准确配置。',
  recommendation: '开启 Gravity 后应仔细核对 Specified Operating Density：对于多相流或大温差浮力流，将其设为外围冷参考密度可消除静水压力梯度累积误差。',
  checkItems: ['重力向量正负方向（如 Y = -9.81 m/s²）与三维 CAD 模型重力朝向保持一致', '自然对流下确认 Operating Temperature 填对环境参考静温'],
  commonMistakes: '开着自然对流与 Gravity 却忘了把 Operating Density 改成环境空气密度，导致整个区域产生异常巨大的静压虚高和出口倒流！',
})

addEntry(entries, [
  'ribbon-results-mesh',
  'mesh-display-edge-type',
  'mesh-display-faces',
  'mesh-display-shrink',
  'mesh-display-coloring',
  'mesh-display-run',
], {
  whatItIs: 'Mesh Display（网格边线、边界面着色与几何收缩显示控制）：灵活切换仅看 Feature 特征轮廓边或全部细密单元边线，并按区域 ID 或边界类型着彩查看网格分布。',
  whenToUse: '排查边界名称归属是否有错、近壁边界层加密过渡是否平滑，或在百万网格中通过 Feature 特征线减轻视图卡顿时切换使用。',
  recommendation: '复杂装配网格优先选 Edge Type = Feature + Color by ID 快速定位各壁面和界面；排查个别畸变单元内部拓扑时可用轻微 Shrink Factor 缩面检查。',
  checkItems: ['核对所选 Surfaces 是否覆盖全部分割出来的入口、出口和关心壁面', '大网格尽量关闭无用体内部边线仅留 Feature 特征线提升渲染响应'],
  commonMistakes: '同时全选内部流体切面与密集体网格 Edge 导致视图漆黑一片，看不清哪条面属于哪个真实边界。',
})

addEntry(entries, [
  'ribbon-domain-registers',
  'mesh-adaptation-refine-threshold',
  'mesh-adaptation-coarsen-threshold',
  'adapt-run-btn',
  'mesh-adaptation-method-type',
  'mesh-adaptation-max-level',
  'mesh-adaptation-min-vol',
  'mesh-adaptation-max-cells',
  'mesh-adaptation-dynamic-enable',
  'mesh-adaptation-dynamic-freq',
], {
  whatItIs: 'Cell Registers 与 Mesh Adaptation Controls（网格自适应阈值及动态加密控制）：依据速度梯度、温度梯度或体积分数界面的数值阈值自动局部加密网格并控制最大细分等级与总单元上限。',
  whenToUse: '捕获激波、VOF 气液界面、火焰锋面或剪切层陡峭梯度时使用；动态开启可让加密带随非定常界面同步迁移并粗化尾迹已远离的区域。',
  recommendation: '务必设定 Max Refinement Level（通常 2~3 层）与 Max Number of Cells 上限防止激波处网格暴涨爆内存；VOF 与多面体首选 Hanging Node 模式。',
  checkItems: ['自适应前先确认 Min Cell Volume 不至于把原本正常的最小边界层微元锁死或过度切碎', '启用 Coarsen Threshold 配合 Dynamic Adaptation 及时释放不再关键的加密网格'],
  commonMistakes: '未限定 Max Number of Cells 和 Max Refinement Level 就开启随步自动动态加密，计算数步后单元总数飙升十倍以上直接耗尽内存。',
})

addEntry(entries, [
  'dynamic-mesh-smoothing-method',
  'dynamic-mesh-spring-factor',
  'dynamic-mesh-layering-option',
  'dynamic-mesh-split-factor',
  'dynamic-mesh-remesh-skew',
  'dynamic-mesh-remesh-interval',
  'dynamic-mesh-in-cylinder',
  'dynamic-mesh-six-dof',
  'dynamic-mesh-contact',
  'dynamic-mesh-preview',
], {
  whatItIs: 'Dynamic Mesh Methods & Options（光顺扩散、动态分层、局部重构及六自由度/缸内/接触选项）：具体调控各运动周期步内节点拉扯弹性、六面体层分裂比例和四面体偏斜重构触发门限。',
  whenToUse: '开启 Smoothing / Layering / Remeshing 任意组合后，依据运动部件几何行程与周围网格类型微调响应参数，并用 Preview Mesh Motion 提前排雷。',
  recommendation: '常规往复变形首选 Diffusion Smoothing 维持高质量内网格过渡；大幅摆动四面体区务必设定合理 Maximum Cell Skewness（如 0.7 左右）确保及时 Remesh 而不报负体积。',
  checkItems: ['六自由度自由体运动（Six DOF）应配合准确质量与转动惯量属性及合理时间步', '先运行 Preview Mesh Motion 验证完整动作周期全部通过无负体积，再启动真实流场耦合迭代'],
  commonMistakes: '开启 Remeshing 却把 Maximum Cell Skewness 留成接近 1.0 或将 Remeshing Interval 设得太大，导致局部单元早已压扁报负体积都还没触发重构！',
})

export const generalAndMeshExplanations = entries
