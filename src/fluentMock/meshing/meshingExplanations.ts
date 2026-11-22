import type {
  MeshingExplanation,
  MeshingTroubleshootingCase,
} from './meshingTypes'

export const meshingExplanations: Record<string, MeshingExplanation> = {
  'meshing-watertight-capping': {
    id: 'meshing-watertight-capping',
    title: '封盖流体区域',
    location: 'Watertight Geometry Workflow → Enclose Fluid Regions',
    whatItIs: '封闭几何中的指定开口，以便后续识别内部流体区域。单面和环形开口的选择方式不同。',
    recommendation: '根据开口选择单面或环形，再为新增面指定边界类型。',
    whenToUse: '固体模型包含需要封盖的内部流道开口时。',
    checkItems: ['环形开口用标签选择时应同时包含内外两个面', '核对每个封盖的边界类型'],
    commonMistakes: '漏掉开口会影响后续流体区域识别。',
    relatedControls: ['wm-describe-geometry', 'wm-update-regions'],
  },
  'meshing-multizone-controls': {
    id: 'meshing-multizone-controls',
    title: '添加多区域网格控制',
    location: 'Watertight Geometry Workflow → Add Multizone Controls',
    whatItIs: '为待扫掠的体区域指定网格方式、填充类型及可选的扫掠尺寸。',
    recommendation: '在 Describe Geometry 启用 Apply Multizone Meshing，再为需要扫掠的区域添加控制。',
    whenToUse: '需要在部分或全部区域使用多区域扫掠网格时。',
    checkItems: ['确认选中了有效体区域', '检查扫掠尺寸和源面、目标面是否适合实际几何'],
    commonMistakes: '遗漏区域控制时，该区域不会随多区域网格任务生成。',
    relatedControls: ['wm-describe-geometry', 'wm-multizone-mesh'],
  },
  'meshing-multizone-mesh': {
    id: 'meshing-multizone-mesh',
    title: '生成多区域网格',
    location: 'Watertight Geometry Workflow → Generate the Multizone Mesh',
    whatItIs: '为已设置多区域控制并选中的体区域生成网格。覆盖全部有效区域时，该任务取代常规体网格任务。',
    recommendation: '如果只覆盖部分区域，继续为余下区域执行 Generate the Volume Mesh。',
    whenToUse: '至少一个体区域已完成 Add Multizone Controls 时。',
    checkItems: ['确认区域覆盖范围', '检查是否需要非共形连接'],
    commonMistakes: '只选了部分区域时便进入求解会缺少其余区域的网格。',
    relatedControls: ['wm-multizone-controls', 'wm-volume-mesh'],
  },
  'meshing-import-geometry': {
    id: 'meshing-import-geometry',
    title: '导入几何 (Import Geometry)',
    location: 'Watertight Geometry Workflow → Step 1',
    whatItIs:
      '从外部 CAD（如 SpaceClaim .scdoc、STEP、IGES 或 Parasolid）读入几何模型，并按设定的特征角自动识别尖锐边、表面命名选择（Named Selections）与基本尺寸单位。',
    recommendation:
      '导入前先确认 CAD 单位（如 mm vs m）以及入口、出口、壁面的 Named Selections 是否已在前处理中清晰命名，可大幅减少后续边界整理时间。',
    whenToUse: '进入 Watertight Geometry 工作流的第 1 步，准备干净水密几何时使用。',
    checkItems: [
      'Length Unit 是否与 CAD 建模导出单位完全一致（差 1000 倍是最常见失误）',
      'Feature Angle（通常 40°）是否准确切分圆柱端面与侧面边界',
      '几何是否存在未闭合缺口或多余干涉小碎面（若有需改用 Fault-Tolerant 模式）',
    ],
    commonMistakes:
      '误把毫米建的模型按米导入，会导致后续网格尺寸设置相差 1000 倍、雷诺数计算全错或面网格直接卡死。',
    relatedControls: ['wm-local-sizing', 'wm-surface-mesh'],
    relatedCalculators: [
      {
        label: '水力直径计算器',
        to: '/calculators/flow-piping/hydraulic-diameter',
        note: '结合导入几何截面尺寸核对入口水力直径 Dh',
      },
    ],
  },
  'meshing-local-sizing': {
    id: 'meshing-local-sizing',
    title: '添加局部尺寸 (Add Local Sizing)',
    location: 'Watertight Geometry Workflow → Step 2',
    whatItIs:
      '在全局尺寸场之外，针对特定边、面或空间包围盒（Body of Influence, BOI）施加局部目标尺寸与增长率，使弯管回流区、尾迹区或狭缝处的网格按需加密。',
    recommendation:
      '对弯管内侧分离区、阀门节流口、翼型尾迹优先使用 Body of Influence (BOI) 空间加密，而非全壁面一刀切减小最小尺寸。',
    whenToUse: '存在局部高梯度、几何细节、射流/尾迹或需要控制局部特征分辨度时添加。',
    checkItems: [
      'BOI 实体在 CAD 中应作为独立不参与流体域的辅助体存在',
      'Target Size 应落在全局 Min Size 与 Max Size 的合理范围内',
      'Growth Rate 建议保持 1.15–1.25，避免加密区向外过渡过快导致长宽比恶化',
    ],
    commonMistakes:
      '把过小的局部尺寸赋给大面积壁面，或 BOI 区域过于庞大，导致面网格和体网格单元数呈几何级数暴涨。',
    relatedControls: ['wm-surface-mesh', 'wm-volume-mesh'],
    relatedCalculators: [
      {
        label: 'CFL 与时间步长估算',
        to: '/calculators/transient-time-step/cfl-time-step',
        note: '局部加密尺寸 Δx 会直接约束瞬态计算的时间步长',
      },
    ],
  },
  'meshing-surface-mesh': {
    id: 'meshing-surface-mesh',
    title: '生成面网格 (Generate the Surface Mesh)',
    location: 'Watertight Geometry Workflow → Step 3',
    whatItIs:
      '在几何表面生成闭合三角形/混合表面网格，并受 Curvature（曲率）与 Proximity（狭缝邻近）尺寸函数控制，为后续体网格与边界层拉伸奠定表面质量基础。',
    recommendation:
      '常规内部管道和工程外流推荐 Size Functions = Curvature & Proximity，Growth Rate = 1.2，Cells Per Gap 至少设为 2–3。',
    whenToUse: '完成几何导入与局部尺寸设置后，生成体网格之前必须执行。',
    checkItems: [
      'Surface Mesh Max Skewness 建议控制在 < 0.75（偏斜过高会直接拖累体网格）',
      '狭缝通道处沿厚度方向是否满足至少 2–3 层表面网格单元',
      '圆弧弯管处的 Curvature Normal Angle（默认 18°）是否足够光滑捕捉轮廓',
    ],
    commonMistakes:
      '忽略面网格质量检查就强行往下推进体网格，最终在 Volume Mesh 阶段报负体积或低正交质量错误。',
    relatedControls: ['wm-local-sizing', 'wm-describe-geometry', 'wm-volume-mesh'],
  },
  'meshing-describe-geometry': {
    id: 'meshing-describe-geometry',
    title: '描述几何 (Describe Geometry)',
    location: 'Watertight Geometry Workflow → Step 4',
    whatItIs:
      '向 Fluent Meshing 声明当前几何包含纯流体、纯固体还是流固耦合共轭传热（CHT）多区域，并决定是否执行共享拓扑（Share Topology）以及是否需要自动封盖开口。',
    recommendation:
      '只要存在流固共轭传热或相邻多体需要共节点网格传递通量，就应开启 Share Topology = Yes；纯单流体域可跳过 Share Topology 以节省时间。',
    whenToUse: '面网格完成后，用于激活后续区域识别与拓扑共享任务。',
    checkItems: [
      '几何中是否既有 Fluid 也有需要导热的 Solid 实体',
      '空心封闭管道若未在 CAD 封堵进出口，需选择 Cap Openings 创建封盖面',
      '多区域接触面是否要求共节点（Share Topology）还是非共节点 Interface',
    ],
    commonMistakes:
      '包含流体与固体两套实体时选错为 Fluid Only，导致固体导热区域被当成死区丢弃或边界识别混乱。',
    relatedControls: ['wm-share-topology', 'wm-update-regions'],
  },
  'meshing-share-topology': {
    id: 'meshing-share-topology',
    title: '应用共享拓扑 (Apply Share Topology)',
    location: 'Watertight Geometry Workflow → Step 5',
    whatItIs:
      '在多个相邻几何体（例如流体域与加热管壁固体域）的交界面上合并重合边线与共面拓扑，使后续面网格和体网格实现一对一共节点（Conformal Mesh）。',
    recommendation:
      '共轭传热（CHT）或多流体分区算例强烈推荐共享拓扑，可直接在 Solution 中自动形成 Wall + Coupled Shadow 面，传热精度高且无需插值 Interface。',
    whenToUse: 'Describe Geometry 中勾选需要 Share Topology 时执行。',
    checkItems: [
      '相邻实体间的间隙是否在共享容差以内',
      '共享后交界面是否已合并为内部耦合面而非双层分离壁面',
    ],
    commonMistakes:
      '在 CAD 装配存在明显错位或大缝隙时强行 Share Topology，可能产生畸变狭长三角面；此时应回 CAD 修复或改用 Mesh Interface。',
    relatedControls: ['wm-describe-geometry', 'wm-update-regions'],
  },
  'meshing-update-boundaries': {
    id: 'meshing-update-boundaries',
    title: '更新边界条件 (Update Boundaries)',
    location: 'Watertight Geometry Workflow → Step 6',
    whatItIs:
      '在网格阶段为各个表面区域预指定边界类型（如 velocity-inlet、mass-flow-inlet、pressure-outlet、wall、symmetry），这样切换到 Solution 时即可直接对应映射。',
    recommendation:
      '尽量利用 CAD 命名规则让 Fluent 自动识别 inlet / outlet / wall，并在本步逐行核对是否有表面被误归类为 wall 或 internal。',
    whenToUse: '描述几何后、体网格生成前核对所有边界面类型。',
    checkItems: [
      '所有入口是否已正确指定为 velocity-inlet / mass-flow-inlet / pressure-inlet',
      '出口是否设定为 pressure-outlet 而非 wall（否则流体无出口直接憋死）',
      '对称面是否正确设为 symmetry',
    ],
    commonMistakes:
      '把进出口漏留在默认 wall 类型进入体网格，导致后续生成边界层时在进出口端面上也长出一层层棱柱壁面网格！',
    relatedControls: ['wm-boundary-layers', 'wm-volume-mesh'],
  },
  'meshing-update-regions': {
    id: 'meshing-update-regions',
    title: '更新体区域 (Update Regions)',
    location: 'Watertight Geometry Workflow → Step 7',
    whatItIs:
      '确认由封闭表面围成的各个体区域属性：Fluid（流体域）、Solid（固体导热域）或 Dead（不参与划分体网格的死区/空腔）。',
    recommendation:
      '确保所有不需要求解的内部结构空腔或辅助实体标记为 Dead，避免白白划分大量无用体单元。',
    whenToUse: '边界检查后、边界层与体网格生成前必须确认体区域属性。',
    checkItems: [
      '流体通道区域类型是否为 Fluid',
      '参与导热计算的壁面或固体件是否为 Solid',
      '无关封闭空腔或辅助体是否标记为 Dead',
    ],
    commonMistakes:
      '忘记把封闭实体结构标记为 Dead，或者出现拓扑漏气导致流体域与外界死区连通。',
    relatedControls: ['wm-describe-geometry', 'wm-volume-mesh'],
  },
  'meshing-boundary-layers': {
    id: 'meshing-boundary-layers',
    title: '添加边界层 (Add Boundary Layers)',
    location: 'Watertight Geometry Workflow → Step 8',
    whatItIs:
      '在壁面边界上沿法向向流场内部生长多层棱柱网格（Prism Layers），用于高精度解析近壁速度梯度与温度边界层，并与 y+ 目标直接关联。',
    recommendation:
      '对需要精确捕捉壁面剪切力、压降或对流换热的湍流问题（如 k-omega SST），建议先用本平台 y+ 计算器求出第一层高度 h1，再选 Uniform 或 Last-Ratio 模式填入；若仅快速验证趋势，可用 Smooth-Transition（默认 3–5 层）。',
    whenToUse: '黏性流壁面剪切/压降/传热仿真几乎都需要添加边界层；仅无黏或粗糙概念验证可暂不加。',
    checkItems: [
      'Offset Method：Smooth-Transition 自动过渡，Uniform 可精确控制 First Height (mm)',
      'Grow On 选择 Only Walls，防止在入口、出口或对称面上错误生长边界层',
      'First Height 与 Growth Rate (1.15–1.25) 是否覆盖整个边界层厚度 δ',
    ],
    commonMistakes:
      '直接沿用默认 Smooth-Transition 而不校核 y+，导致高雷诺数算例 y+ 落入 5–30 缓冲层；或者第一层太厚/太薄在棱柱-体网格交界产生大长宽比台阶。',
    relatedControls: ['wm-update-boundaries', 'wm-volume-mesh'],
    relatedCalculators: [
      {
        label: 'y+ 与第一层网格高度',
        to: '/calculators/near-wall-mesh/y-plus-first-layer-height',
        note: '先根据目标 y+（如 y+=1）算出准确 First Height 再填入此处',
      },
      {
        label: '边界层网格等比增长',
        to: '/calculators/near-wall-mesh/boundary-layer-mesh',
        note: '验证给定层数 n 与增长率 r 后的总边界层厚度',
      },
    ],
  },
  'meshing-volume-mesh': {
    id: 'meshing-volume-mesh',
    title: '生成体网格 (Generate the Volume Mesh)',
    location: 'Watertight Geometry Workflow → Step 9',
    whatItIs:
      '在已完成边界层拉伸的区域内部填充体单元。支持 Mosaic Poly-Hexcore（马赛克多面体-六面体核心）、Polyhedra（纯多面体）、Tetrahedral（四面体）与 Hexcore 四类典型网格。',
    recommendation:
      '常规稳态与瞬态工程流场首选 Poly-Hexcore：核心区采用正交度极高的笛卡尔六面体，近壁采用高质量棱柱边界层，中间自动以多面体共节点过渡，兼具精度高、单元数少（比四面体省 30%–50%）与收敛快三大优势。',
    whenToUse: '完成 Surface Mesh、边界/区域确认与边界层设置后生成最终体网格。',
    checkItems: [
      '切换 Cut Plane 剖面视图确认核心区网格过渡自然、边界层未发生坍塌',
      'Min Orthogonal Quality 必须 > 0.10（推荐 > 0.15–0.20）',
      'Max Skewness 建议控制在 < 0.90',
    ],
    commonMistakes:
      '未生成表面网格就直接点体网格生成，或急于求快使用纯四面体加密导致计算内存与收敛步数翻倍。',
    relatedControls: ['wm-boundary-layers', 'wm-improve-mesh', 'meshing-cut-plane-ctrl'],
  },
  'meshing-improve-mesh': {
    id: 'meshing-improve-mesh',
    title: '改善体网格质量 (Improve Volume Mesh)',
    location: 'Watertight Geometry Workflow → Step 10',
    whatItIs:
      '通过节点光顺（Node Smoothing）与局部拓扑优化，针对正交质量低于指定阈值的畸变单元进行迭代修复，在几乎不增加单元数的前提下抬升最差单元下限。',
    recommendation:
      '当 Minimum Orthogonal Quality < 0.15 时务必执行 Improve Volume Mesh（通常设置质量阈值 0.20–0.25 迭代 2–3 轮）；若改善后仍 < 0.05，则应回到面网格或局部尺寸排查尖角狭缝。',
    whenToUse: '体网格生成后若最小正交质量偏低或直方图存在长尾低质量单元时使用。',
    checkItems: [
      '观察 Quality Histogram 最低柱条是否明显右移',
      '改善后 Min Orthogonal Quality 是否满足求解器安全要求（> 0.10）',
      '核对完毕即可点击 Switch to Solution 进入物理设置与求解',
    ],
    commonMistakes:
      '指望 Improve Volume Mesh 修复几何本身的重叠或面网格严重畸变（软件只能微调节点位置，无法消除拓扑错误）。',
    relatedControls: ['wm-volume-mesh', 'meshing-ribbon-sol-switch'],
  },
  'meshing-switch-solution': {
    id: 'meshing-switch-solution',
    title: '切换到求解模式 (Switch to Solution)',
    location: 'Top Toolbar / Ribbon → Solution → Switch to Solution',
    whatItIs:
      '结束 Fluent Meshing 前处理会话，将已生成的体网格、边界区（Boundary Zones）、体区域（Cell Zones）与精度/并行配置直接无缝移交给 Fluent Solution 求解器。',
    recommendation:
      '建议在 Switch to Solution 前先完成 Volume Mesh 生成并确认 Min Orthogonal Quality > 0.15；切换后在 Solution 中再次执行一次 Mesh Check 复核体积与连通性。',
    whenToUse: '网格生成与质量检查满意后，进入物理建模、边界数值给定与求解计算时点击。',
    checkItems: [
      '体网格是否已经生成（Volume Mesh 状态已更新）',
      '边界类型与区域类型（Fluid/Solid）是否已在 Meshing 阶段核对准确',
      '是否已记录计算所需的单元规模与并行核数',
    ],
    commonMistakes:
      '未生成体网格或忘记更新出口边界类型就直接 Switch to Solution，进入求解器后才发现缺少体区域或全是 wall。',
    relatedControls: ['wm-volume-mesh', 'wm-improve-mesh'],
  },
  'meshing-ribbon-reset': {
    id: 'meshing-ribbon-reset',
    title: '重置网格工作流 (Reset Workflow)',
    location: 'Meshing Ribbon → File → Reset Workflow',
    whatItIs:
      '将当前教学算例的所有工作流任务状态、局部尺寸列表、边界设置与质量指标恢复为初始演示状态，方便重新演练完整的水密流程。',
    recommendation: '切换参数对比或重新按步骤练习水密工作流时使用。',
    whenToUse: '想从 Step 1 重新演示或清理刚才的实验修改时使用。',
    checkItems: ['确认是否需要记住当前已调好的边界层或尺寸设置'],
    commonMistakes: '误以为 Reset 会清除全局公式库或参数计算器数据（本功能仅重置 Meshing 教学工作流状态）。',
    relatedControls: ['wm-import-geometry'],
  },
  'meshing-cut-plane': {
    id: 'meshing-cut-plane',
    title: '剖面视图 (Cut Plane)',
    location: 'Graphics Toolbar / View Ribbon → Cut Plane',
    whatItIs:
      '用虚拟剖切面剖开三维体网格，直观查看流道内部笛卡尔六面体核心（Hexcore）、多面体过渡区以及贴壁棱柱边界层（Prism Layers）的衔接质量。',
    recommendation:
      '仅看外表面网格往往掩盖内部问题；生成 Volume Mesh 后必须开启 Cut Plane 拖动剖切位置检查内部层数与尺寸突变。',
    whenToUse: '生成体网格后或调试 Poly-Hexcore / Tetrahedral / 边界层过渡时使用。',
    checkItems: [
      '近壁棱柱边界层是否连续、厚度递增是否平滑',
      '边界层最外层与体网格核心单元尺寸比是否温和',
      'BOI 加密盒范围是否覆盖高梯度核心流道',
    ],
    commonMistakes:
      '只看表面三角网格觉得很漂亮就提交求解，却没发现内部因为增长率过大导致边界层发生台阶坍塌（Stair-stepping）。',
    relatedControls: ['wm-volume-mesh', 'wm-boundary-layers'],
  },
  'meshing-ft-overview': {
    id: 'meshing-ft-overview',
    title: '容错网格工作流 (Fault-Tolerant Meshing)',
    location: 'Workflow Tab → Fault-Tolerant Meshing',
    whatItIs:
      '专为存在缝隙、重叠零件、小倒角干涉且难以做完整 CAD 修复的复杂工业装配体设计的包面（Shrink-Wrap）体网格流程，核心机制是包络重划分 + Material Point 区域识别 + 泄漏路径检测。',
    recommendation:
      '若几何已干净闭合（管路、散热器、翼型、阀门单零件），优先用 Watertight Geometry 工作流以获得最高表面保真度；仅当 CAD 存在大量修复困难的重叠/破洞装配体时启用 Fault-Tolerant。',
    whenToUse: '处理大型复杂装配体（汽车发动机舱、整车外流场、大型机柜热管理）时选择。',
    checkItems: [
      '是否正确放置了内部 Material Point 以区分流体与固体侧',
      '包面尺寸是否小于最小必要物理特征但能跨越无需分辨的微缝',
      'Leak Detection 是否排除所有意外贯穿孔洞',
    ],
    commonMistakes:
      '对本身很干净的 CAD 也盲目用 Fault-Tolerant 包面，不仅丢失锐边特征，还增加了包面耗时与单元数量。',
    relatedControls: ['wm-import-geometry', 'ft-describe', 'ft-identify', 'ft-leakage'],
  },
  'meshing-ft-describe': {
    id: 'meshing-ft-describe',
    title: '描述内流几何',
    location: 'Fault-Tolerant Meshing → Describe Geometry and Flow',
    whatItIs: '为示例弯管选择是否创建开口封盖，以及是否按尺寸处理泄漏。',
    recommendation: '需要由开口形成入口或出口时，进入 Capping 任务定义封盖。',
    whenToUse: '导入几何后、识别流体区域前。',
    checkItems: ['确认入口与出口开口', '区分有意保留的流道与需要封堵的缝隙'],
    commonMistakes: '把预期的入口或出口误当作几何泄漏。',
    relatedControls: ['ft-capping', 'ft-identify', 'ft-leakage'],
  },
  'meshing-ft-capping': {
    id: 'meshing-ft-capping',
    title: '封盖流体区域',
    location: 'Fault-Tolerant Meshing → Enclose Fluid Regions',
    whatItIs: '在所选开口添加供包面识别的封盖，并指定该盖的区域类型。',
    recommendation: '分别检查所选开口和封盖类型，记录入口与出口对应关系。',
    whenToUse: '模拟需要从 CAD 开口建立内部流体区域时。',
    checkItems: ['盖面是否对应预期的开口', '封盖是否正确区分入口、出口与壁面'],
    commonMistakes: '只添加盖面后就继续，漏掉 Update 确认步骤。',
    relatedControls: ['ft-describe', 'ft-identify'],
  },
  'meshing-ft-identify': {
    id: 'meshing-ft-identify',
    title: '用材料点识别区域',
    location: 'Fault-Tolerant Meshing → Identify Regions',
    whatItIs: '以坐标指定材料点，标识示例中的流体区或空区。',
    recommendation: '让材料点落在目标空间的内部，避免落在盖面或壁上。',
    whenToUse: '描述几何并处理所需的盖面后。',
    checkItems: ['坐标单位是否与当前几何一致', '区域类型是否与材料点所在空间一致'],
    commonMistakes: '把材料点放在目标内流区域外侧。',
    relatedControls: ['ft-leakage', 'wm-update-regions'],
  },
  'meshing-ft-leakage': {
    id: 'meshing-ft-leakage',
    title: '定义泄漏阈值',
    location: 'Fault-Tolerant Meshing → Define Leakage Threshold',
    whatItIs: '示例把输入尺寸与两个演示间隙比较，并列出满足阈值的间隙数量。',
    recommendation: '先预览，再确认阈值是否会覆盖应当保留的流通间隙。',
    whenToUse: '启用了泄漏封闭并已识别区域时。',
    checkItems: ['尺寸单位是否正确', '预览数量是否与本次设定预期一致'],
    commonMistakes: '把演示间隙尺寸直接用于实际 CAD。',
    relatedControls: ['ft-identify', 'wm-update-regions', 'wm-surface-mesh'],
  },
}

export const meshingOptionExplanations: Record<string, string> = {
  'poly-hexcore':
    'Ansys Mosaic Poly-Hexcore：内部采用正交性最佳的笛卡尔六面体，近壁长出贴体棱柱层，过渡区采用多面体共节点无缝连接；通常兼具最少的单元数与最快的收敛稳定性。',
  polyhedra:
    '纯多面体网格（Polyhedra）：每个单元拥有更多相邻面，梯度计算精度高、数值扩散低，尤其适合强旋流或复杂曲率内流；但同等尺寸下内存略高于 Poly-Hexcore 核心。',
  tetrahedral:
    '传统四面体网格（Tetrahedral）：几何适应性强、生成最快，但相同解析度下单元数量约为多面体的 2–3 倍，非结构扩散偏大。',
  hexcore:
    '传统 Hexcore：核心区为笛卡尔六面体、过渡区使用四面体/金字塔过渡（非多面体过渡），多用于需要与旧版本流程兼容的场景。',
  'smooth-transition':
    'Smooth-Transition：根据局部表面三角网格大小自动计算第一层高度，使最外层棱柱体积平滑过渡到体网格；适合快速入门与常规工程建模，但不直接固定绝对第一层高度。',
  uniform:
    'Uniform（定第一层高度）：直接给定精确的 First Height（通常按目标 y+ 算得），最适合严格控制 y+≈1 或 y+∈[30,300] 的边界层仿真。',
  'last-ratio':
    'Last-Ratio：同时固定 First Height、层数与最后一层棱柱与表面尺寸的纵横比，兼顾精确 y+ 与外层平滑过渡。',
  'aspect-ratio':
    'Aspect-Ratio：基于首层高宽比自动设定第一层厚度，适用于表面网格变化范围大的算例。',
  'curvature-and-proximity':
    '同时考虑表面曲率加密与狭缝邻近加密（推荐默认）：既能保证圆角弯管光滑，又能确保窄缝通道有足够单元层数。',
  curvature:
    '仅按曲率加密：忽略窄缝间隙内的单元层数约束，适合无狭缝的大空间外流场。',
  proximity:
    '仅按邻近间隙加密：适合平板阵列等直角窄缝通道，圆弧处按全局最大尺寸划分。',
  uniform_size:
    '均匀尺寸（Uniform）：不随曲率和狭缝自动缩小，仅作特殊简单几何测试。',
  boi:
    'Body of Influence (BOI)：利用独立辅助体在流场空间内部（而不只是壁面上）精细控制体网格与面网格局部加密，是控制弯管回流、尾迹和射流解析度的利器。',
  'fluid-only':
    '纯流体域（Fluid Only）：不涉及固体导热壁厚网格，几何全部按流体区域处理，可跳过 Share Topology 以简化步骤。',
  'fluid-and-solid':
    '流固耦合区域（Fluid + Solid）：同时划分流体与固体壁面体网格，用于共轭传热（CHT）仿真；通常需要开启 Share Topology 实现交界面共节点传热。',
}

export const meshingTroubleshootingCases: MeshingTroubleshootingCase[] = [
  {
    id: 'm-non-watertight',
    symptom: '1. Describe Geometry / Surface Mesh 提示几何不水密或存在 Free Faces',
    likelyCauses: [
      'CAD 存在微小破面、未缝合曲面或未封堵的流体域进出口；',
      '导入单位错选导致微小缝隙被放大或被 Feature Angle 误拆。',
    ],
    fixes: [
      '回到 Step 1 核对导入 Length Unit 与模型真实单位；',
      '若存在封闭管口缺失，在 Describe Geometry 开启 Cap Openings，或切换为 Fault-Tolerant 包面流程。',
    ],
    targetControls: [
      { controlId: 'wm-import-geometry', label: 'Import Geometry' },
      { controlId: 'wm-describe-geometry', label: 'Describe Geometry' },
    ],
  },
  {
    id: 'm-bl-collapse',
    symptom: '2. 边界层出现台阶坍塌（Stair-stepping）或未在正确壁面生长',
    likelyCauses: [
      '边界条件类型漏改（例如进出口仍是 wall 或壁面误标），导致边界层长在错误边界上；',
      'Grow On 选错，或者 First Height 与局部面网格尺寸差异悬殊、Growth Rate 过大。',
    ],
    fixes: [
      '先在 Step 6 Update Boundaries 确认所有入口/出口/对称面类型正确；',
      '在 Add Boundary Layers 将 Grow On 设为 Only Walls，用 y+ 计算器核对 First Height 并控制 Growth Rate ≤ 1.25。',
    ],
    targetControls: [
      { controlId: 'wm-update-boundaries', label: 'Update Boundaries' },
      { controlId: 'wm-boundary-layers', label: 'Add Boundary Layers' },
    ],
  },
  {
    id: 'm-low-ortho',
    symptom: '3. Volume Mesh 最小正交质量过低 (< 0.10) 或 Skewness > 0.90',
    likelyCauses: [
      '几何尖角夹角过小、Surface Mesh 局部曲率分辨率不足；',
      '相邻边界尺寸突跳，或核心体单元与边界层最外层体积差异过大。',
    ],
    fixes: [
      '先运行 Step 10 Improve Volume Mesh 提升最差单元正交质量；',
      '若改善仍不足，返回 Add Local Sizing 针对尖角区域加密，或将体网格填充改为 Poly-Hexcore / Polyhedra。',
    ],
    targetControls: [
      { controlId: 'wm-improve-mesh', label: 'Improve Volume Mesh' },
      { controlId: 'wm-volume-mesh', label: 'Generate Volume Mesh' },
    ],
  },
  {
    id: 'm-region-leak',
    symptom: '4. Update Regions 漏识别固体域或流体泄漏到外部死区',
    likelyCauses: [
      '多实体之间未成功 Share Topology，或局部间隙宽度大于包面最小尺寸。',
    ],
    fixes: [
      '在 Describe Geometry 确认几何类型为 Fluid + Solid 并开启 Share Topology；',
      '检查 Step 7 Update Regions 将内部无需求解的封闭空腔显式设为 Dead。',
    ],
    targetControls: [
      { controlId: 'wm-share-topology', label: 'Apply Share Topology' },
      { controlId: 'wm-update-regions', label: 'Update Regions' },
    ],
  },
  {
    id: 'm-cell-explosion',
    symptom: '5. 网格数量暴增（几百万~上千万）导致划分极慢或内存不足',
    likelyCauses: [
      'Surface Mesh 全局 Min Size 设得过小，或全局 Growth Rate 设为 1.05；',
      'BOI 局部加密盒范围过大，或误选了纯 Tetrahedral 填充。',
    ],
    fixes: [
      '适当放大全局 Min Size，仅用 BOI 精确覆盖关键高梯度区；',
      '将 Volume Mesh Fill With 改为 Poly-Hexcore 以减少 30%–50% 体单元数。',
    ],
    targetControls: [
      { controlId: 'wm-local-sizing', label: 'Add Local Sizing' },
      { controlId: 'wm-surface-mesh', label: 'Surface Mesh' },
      { controlId: 'wm-volume-mesh', label: 'Volume Mesh' },
    ],
  },
]
