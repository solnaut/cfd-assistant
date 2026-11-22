import type { FluentOperationGuide } from '../fluentTypes'

const meshingHelp = 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/'

export const meshingOperationGuides: Record<
  string,
  FluentOperationGuide & { sourceUrl?: string }
> = {
  'meshing-import-geometry': {
    coreConcept:
      '几何导入不仅决定三维实体与边界在 Fluent Meshing 中的尺度基准（毫米/米），还通过 Feature Angle（特征角）决定曲面如何自动切分为独立的边界面，以及 CAD 中的 Named Selections 能否直接映射为入口、出口和壁面。',
    parameterEffects: [
      ['Length Unit', '若导入单位与 CAD 导出单位不一致，模型会整体放大或缩小 1000 倍，直接破坏雷诺数和默认尺寸场。'],
      ['Feature Angle', '控制相邻曲面法向夹角超过多少度时切分边界；设太小会碎出大量小面，设太大会把圆柱端面和侧面合并在一起。'],
    ],
    steps: [
      '确认源 CAD 的导出长度单位，导入后立即用测量工具核对一个已知关键尺寸。',
      '检查开口、独立实体对象名称以及 inlet/outlet/wall 等边界面是否已清晰分开。',
      '确认几何水密无明显破面或严重干涉后，再进入 Local Sizing 与 Surface Mesh。',
    ],
    example:
      '已知弯管内径为 40 mm，按 mm 导入后实测内径确为 40 mm，并确认 inlet、outlet 与 wall-pipe 可分别选中后再继续下一步。',
    contextNote:
      '若上游 CAD 存在大量难以逐一缝合的小缝隙、重叠件或破孔，不必在 Watertight 中硬修几何，应直接切换 Fault-Tolerant Meshing 包面流程。',
  },
  'meshing-local-sizing': {
    coreConcept:
      '局部尺寸控制用于在全局尺寸场之外精准分配网格资源：既可以对特定边、面细化以捕捉曲率或狭缝，也可以借助独立辅助体 BOI（Body of Influence）在不改变壁面拓扑的情况下细化流场内部高梯度空间。',
    choices: [
      ['Face / Edge Size', '直接控制指定几何边或表面的三角面单元尺寸，适合锐边、小孔、冷却通道入口等表面细节。'],
      ['Body of Influence (BOI)', '用独立辅助体包围需要重点解析的空间区域（如尾迹区、混合区、弯头分离区），只在空间体内部自动加密。'],
    ],
    parameterEffects: [
      ['Target Mesh Size', '直接决定加密区节点间距，建议与相邻全局面网格尺寸呈温和过渡（一般不突跳超过 2~4 倍）。'],
      ['Growth Rate', '控制局部细化向外部背景尺寸过渡的快慢（建议 1.15~1.25）；过小导致总网格量暴涨，过大易恶化长宽比。'],
    ],
    steps: [
      '结合流动特征明确真正需要额外分辨率的局部区域（如弯头后回流区、节流狭缝或翅片区）。',
      '选择对象类型（Face/Edge 或 BOI）、目标尺寸与 Growth Rate，避免把极小尺寸施加到整个大表面。',
      '生成 Surface Mesh 后开启线框或剖面检验加密过渡是否平顺，并核对总面网格数量是否可控。',
    ],
    example:
      '在 90° 弯管下游存在二次流与分离回流区，可将上游 CAD 中的长方体辅助体设为 BOI 赋予 1.5 mm 目标尺寸，同时直管远端保持 4 mm 基准尺寸。',
  },
  'meshing-surface-mesh': {
    sourceUrl: meshingHelp + 'tgd_user_workflow_guided_surface_mesh_gen.html',
    coreConcept:
      '面网格是体网格和棱柱边界层的母模。水密工作流会根据全局最小/最大尺寸与尺寸函数（Curvature / Proximity）在几何表面生成闭合三角面网格，面上出现畸变、狭缝单元不足或尖角折叠都会直接传导给体网格。',
    choices: [
      ['Curvature', '根据表面曲率法向夹角（Normal Angle）加密圆弧、圆角和曲面，保证几何轮廓保真度。'],
      ['Proximity', '监测邻近表面或狭窄间隙之间的距离并强制跨隙生成指定层数（Cells Per Gap），防止狭缝只跨 1 个单元导致流动/传热失真。'],
      ['Curvature & Proximity', '同时启用曲率与邻近函数，是绝大多数内部流道、散热器和复杂管路的最稳妥默认组合。'],
    ],
    parameterEffects: [
      ['Minimum / Maximum Size', '限定全表面尺寸上下界；Min Size 过小会在倒角碎面上炸出百万级表面单元。'],
      ['Curvature Normal Angle', '默认约 18°（每 18° 弯转至少放一个单元，相当于整圆约 20 等分）；减小角度曲面更光滑但网格量上升。'],
    ],
    steps: [
      '核对全局 Min/Max Size、Growth Rate（约 1.2）以及所有已添加的 Local Sizing。',
      '按几何是否有圆弧曲面与狭窄流道选定 Size Functions 并设定 Cells Per Gap ≥ 2~3。',
      '生成后立刻查看 Surface Mesh Max Skewness（建议 < 0.75），对尖角、狭缝和高偏斜碎面做诊断处理后再往下走。',
    ],
    example:
      '芯片微通道散热器最小流道宽度 1.2 mm：开启 Curvature & Proximity 且设置 Cells Per Gap = 3，使面网格跨越窄缝至少分出 3 个单元（约 0.4 mm），保证后续边界层与核心体网格有足够支撑空间。',
  },
  'meshing-describe-geometry': {
    coreConcept:
      '这一步向工作流声明几何的物理角色拓扑：确定模型是“仅流体域”、“流体+固体共轭区”还是“需要先封盖内部空腔开口”，从而动态决定后续激活 Share Topology、Capping 还是 Region 更新任务。',
    choices: [
      ['Only fluid regions without voids', '纯单流体封闭实体，无需导热固体域和内部封盖，通常可跳过拓扑共享直接进入边界和区域更新。'],
      ['Fluid and solid regions', '同时包含流体通道与需要求解导热的固体壁/芯片，供共轭传热（CHT）使用，建议配合共享拓扑。'],
      ['Enclose fluid regions (Capping)', 'CAD 实体仅给了固体壳体或未在进出口端封闭内部流道，需在后续任务封盖开口以抽取内部流体域。'],
    ],
    steps: [
      '对照几何体列表确认是否存在参与导热的固体体，以及流体开口端是否已经预先闭合。',
      '如实选择 Geometry Type、是否需要 Apply Share Topology 以及是否需要 Apply Multizone Meshing。',
      '点击确认后观察左侧任务树自动展开或跳过的分支任务，确保与仿真目标一致。',
    ],
    example:
      '水冷板仿真中既有 Aluminum 固体冷板体也有内部 Water 流体体：应在 Describe Geometry 中选 Fluid and Solid 并启用 Share Topology，使流固界面共节点换热。',
  },
  'meshing-share-topology': {
    coreConcept:
      'Share Topology 在多体装配体的接触面上统一共有节点和边线。共享后相邻固体域与流体域之间是一对一连续网格（Conformal Mesh），求解器会自动生成 Wall / Wall-Shadow 耦合传热面，彻底消除非共形插值误差。',
    choices: [
      ['开启共享拓扑（Conformal）', '节点完全对齐，换热和通量严格守恒、求解收敛最稳；要求两实体接触面贴合无明显错位间隙。'],
      ['不共享 + Solution Interface', '容忍微小装配间隙或独立划分网格（如滑移网格旋转域），需要在 Solution 中手动或自动配对 Mesh Interface。'],
    ],
    steps: [
      '在 Describe Geometry 中勾选执行 Share Topology，进入本任务核对重合容差（Join/Intersect Tolerance）。',
      '执行任务后检查相邻体交界面是否由两条分离边界融合为内部耦合面。',
      '若多体间隙较大强行共享导致畸变三角面，应回 CAD 对齐尺寸或退回改用 Mesh Interface。',
    ],
    example:
      '电池液冷板与电芯铝壳贴合传热：完成 Share Topology 后进入 Update Regions 即可同时看到 Fluid 冷却液区与 Solid 铝板区无缝相连。',
  },
  'meshing-watertight-capping': {
    sourceUrl: meshingHelp + 'tgd_user_workflow_guided_tasks_capping.html',
    coreConcept:
      '当 CAD 仅提供了包覆空腔的外壳结构（例如中空阀门或未做实体抽取的泵壳）时，内部流体空间并未闭合。封盖（Capping）通过封闭指定端面开口把内部空气/液体空腔围成封闭流体区域。',
    choices: [
      ['Single Face Selection', '针对简单圆形、矩形单个端面开口，直接点选开口边圈即可封闭成一块入口或出口面。'],
      ['Annular Opening (内外环)', '针对同心套管或环形间隙开口，必须同时框选或标签选中内外两个闭合边界，否则会封成实心圆盘。'],
    ],
    steps: [
      '在 Describe Geometry 确认需要从空壳抽取内部流道并启用封盖分支（需开启 Share Topology 时先完成共享）。',
      '逐一选择所有待封闭开口，为每个新增封盖填好清晰名称（如 inlet-cap、outlet-cap）及初始边界类型。',
      '更新后高亮预览所有封盖与封闭区域，并去 Update Regions 确认内部空间已正确识别为 Fluid。',
    ],
    example:
      '导入一段仅有管壁实体厚度的弯管 CAD 后，在两端法兰面分别创建 inlet-cap（velocity-inlet）和 outlet-cap（pressure-outlet），内部中空通道随之转为可选流体域。',
  },
  'meshing-update-boundaries': {
    coreConcept:
      '边界类型预设定决定网格各外表面在体网格和求解阶段的行为。最关键的一点是：边界层棱柱只在标注为 wall 的面上生长，若忘记把进出口从默认 wall 改掉，会在进出口端面上长出封堵流道的边界层！',
    parameterEffects: [
      ['wall vs inlet / outlet', '所有 wall 会参与棱柱边界层生长；设为 velocity-inlet、mass-flow-inlet 或 pressure-outlet 后，在 Generate Volume Mesh 前才会保持边界端面畅通。'],
      ['symmetry / interface / interior', '对称面和交界面同样不能按无滑移壁面生成阻塞棱柱层，需在此步准确核对。'],
    ],
    steps: [
      '逐行浏览工作流列出的全部 Boundary Zones，核对 CAD 命名自动映射是否正确。',
      '重点把实际进风/进水/出流截面从默认的 wall 改成 velocity-inlet、mass-flow-inlet 或 pressure-outlet。',
      '确认无误后再点击 Update，使后续 Add Boundary Layers 自动避开全部非壁面边界。',
    ],
    example:
      '导入时系统把出流口 `end_face` 默认识别成 `wall`；在 Update Boundaries 中将其改为 `pressure-outlet` 后，入口/出口保持透明流通截面，仅管壁保留棱柱边界层。',
  },
  'meshing-update-regions': {
    coreConcept:
      '封闭表面组围成的三维体空间被称为 Region（区域）。此处需明确每个闭合空间在仿真中的身份——只有标记为 Fluid 或 Solid 的区域才会划分三维体网格并进入求解器，Dead 区域则会被跳过。',
    choices: [
      ['Fluid', '内部允许流体流动与对流传热的区域（水、空气、混合多相域等），内部和近壁均会按设置划分网格。'],
      ['Solid', '仅求解固体热传导（或电传导）的区域；通常不生长流体棱柱边界层，计算成本比同体积流体区低。'],
      ['Dead', '不参与流体或固体求解的封闭空腔、螺栓孔内腔或 CAD 辅助假体，务必标记为 Dead 免除多余体网格。'],
    ],
    steps: [
      '点击列表中的每一条 Region，在图形窗口确认高亮对应的三维空间是否符合预期。',
      '检查有没有多个不相连区域本应为一个流体域（说明存在拓扑未连通），或辅助体 BOI 被误留为流体域。',
      '逐一确认 Fluid / Solid / Dead 类型并更新，再进入边界层与体网格划分。',
    ],
    example:
      '带外壳保温层的换热器共分出 3 个封闭空间：内管流体设 Fluid、金属管壁设 Solid、中间封闭安装夹缝设 Dead。',
  },
  'meshing-boundary-layers': {
    coreConcept:
      '近壁处流速和温度存在极其剧烈的法向梯度，各向同性四面体或多面体难以高效解析边界层。棱柱边界层从 wall 向流场法向生长多层扁平高正交单元，能在较低总网格数下准确解析 y⁺、壁面剪切应力与表面传热系数。',
    choices: [
      ['Smooth-Transition', '根据表面局部三角网格大小自动反推过渡第一层厚度；操作门槛最低，适合常规压降、流量分配与方案快速筛选。'],
      ['Uniform', '用户直接输入精确的 First Height；当你依据目标 y⁺（如 k-ω SST 的 y⁺ ≈ 1）算出第一层高度时必须选用此模式。'],
      ['Last-Ratio / Aspect-Ratio', '既可控首层厚又或通过最后一层与核心体网格比例约束平顺衔接，用于兼顾精准 y⁺ 与防止层间体积突变。'],
    ],
    parameterEffects: [
      ['First Height', '决定壁面第一层单元无量纲距离 y⁺；过大会落入缓冲层（y⁺∈5~30）影响壁面摩擦与传热精度，过小在狭缝中易与对面边界层相撞压缩。'],
      ['Number of Layers & Growth Rate', '常用 5~15 层（低 Re 解析壁面建议 10~20 层）、增长率 1.15~1.25，以覆盖对数律/缓冲层厚度且与外层体网格平滑交接。'],
    ],
    steps: [
      '根据选定的湍流近壁策略（解析粘性底层 y⁺ ≈ 1 还是壁面函数 y⁺ ≥ 30），先用 y⁺ 计算器算得预期 First Height。',
      '设置 Grow On = Only Walls、Offset Method（Uniform 或 Smooth-Transition）、层数和 Growth Rate。',
      '生成体网格后开启 Cut Plane 放大观察近壁棱柱是否被狭缝过早挤压（Stair-stepping）或与相邻体单元大小突跳过大。',
    ],
    example:
      '计算直径 40 mm 管道内部对流换热（Re ≈ 5×10⁴，选用 k-ω SST）：先算得目标 y⁺ = 1 对应首层约 0.035 mm，选用 Uniform 填 First Height = 0.035 mm、12 层、Growth Rate = 1.2，总高约 1.38 mm 平稳进入核心六面体。',
  },
  'meshing-multizone-controls': {
    sourceUrl: meshingHelp + 'tgd_user_workflow_guided_multizone_add.html',
    coreConcept:
      '对细长等截面管段、简单翼型段或规则矩形流道，MultiZone 能从源面自动扫掠生成纯六面体或六面体为主的结构化风格网格，用比非结构网格少得多的单元数显著减少数值假扩散。',
    choices: [
      ['Hexa-Prismatic / Hexa-Core', '要求局部几何拓扑满足可扫掠（Sweepable），在顺流方向保持规则流向排列，极大幅度提升流动顺流向精度。'],
      ['局部 MultiZone + 其余 Poly-Hexcore', '不必强求全模型都扫掠；仅规整直管用 MultiZone，三通岔口留给常规 Poly-Hexcore 混合完成。'],
    ],
    steps: [
      '先在 Describe Geometry 中开启 Apply Multizone Meshing 选项。',
      '选中满足规整扫掠条件的体区域，指定源面、目标面及扫掠轴向尺寸。',
      '依次完成所需区域的 MultiZone Control 后再运行 Generate the Multizone Mesh。',
    ],
    example:
      '进气测试段分为上下游两段等截面直圆管和中间带阀门的复杂阀体：只对上下游直管添加 MultiZone 扫掠控制，中间阀体留作常规混合体网格。',
  },
  'meshing-multizone-mesh': {
    coreConcept:
      'Generate the Multizone Mesh 会按照前一步设定的控制参数，实际对支持扫掠的体区域填充六面体主导扫掠体网格；若只覆盖部分区域，剩余复杂体域随后仍由常规 Generate the Volume Mesh 补全。',
    choices: [
      ['覆盖全部体域', '所有区域均在 MultiZone 生成完毕后，工作流会自动跳过冗余的常规 Volume Mesh 步骤直接检查质量。'],
      ['仅覆盖部分体域', '生成扫掠区之后，必须继续执行 Generate the Volume Mesh 填充其余复杂非扫掠体区域。'],
    ],
    steps: [
      '确认全部可扫掠目标区均已正确挂载 MultiZone Controls。',
      '运行 Generate the Multizone Mesh，使用 Cut Plane 检查扫掠轴向分段和端面投影是否扭曲。',
      '若仍有非 MultiZone 区域，继续运行 Generate the Volume Mesh 并在交界面核对网格连通性。',
    ],
    example:
      '直管段与弯管段混合划分后，剖切观察直管内部流向网格与截面完全保持规则正交六面体，同时顺畅衔接后续非结构区域。',
  },
  'meshing-volume-mesh': {
    coreConcept:
      '体网格（Volume Mesh）填满全部 Fluid 和 Solid 封闭体域内部空间，形成控制方程离散求解的有限体积单元。选择不同填充拓扑会在网格总数、内存占用、正交质量（Orthogonal Quality）与收敛稳定性间产生决定性差异。',
    choices: [
      ['Poly-Hexcore（Mosaic，推荐首选）', '核心区域自动布置高正交笛卡尔六面体、壁面长出贴体棱柱层、两者由共节点多面体无隙过渡；单元总数比四面体少 30%~50% 且求解最快最稳。'],
      ['Polyhedra（纯多面体）', '多面体单元相邻面多（~12~14 面），梯度插值极其精确，适合强旋流或无明显主方向的紧凑复杂空腔，但同尺度下比 Poly-Hexcore 耗内存稍高。'],
      ['Tetrahedral（传统四面体）', '对尖角狭缝适应强、生成最快，但相同精度需求下网格量和人工数值扩散明显更高，工程中正逐步被 Poly-Hexcore 取代。'],
      ['Hexcore（非共节点金字塔过渡）', '早期笛卡尔核心模式，依赖金字塔与四面体过渡，一般仅在旧版本兼容性需要时使用。'],
    ],
    parameterEffects: [
      ['Fill With / Max Cell Length', '决定核心内部体单元的拓扑类型与最大步长；大体积空腔适当放大 Max Cell Length 能节省大量核心单元。'],
      ['Min Orthogonal Quality 验收红线', '体网格生成完毕最先看最小值：一般要求 > 0.10（理想 > 0.15~0.20），< 0.05 极易导致耦合求解器出现浮点溢出发散。'],
    ],
    steps: [
      '确认面网格、边界条件、Fluid/Solid 区域识别以及 Boundary Layers 均已就绪。',
      '首选 Poly-Hexcore 填充体网格，检查内部最大单元长度与壁面棱柱过渡层设置。',
      '生成后立即开启 Cut Plane 检查内部过渡与狭缝，并核对 Console 输出的 Min Orthogonal Quality。',
    ],
    example:
      '对内流冷却通道启用 Poly-Hexcore 后，体单元数量从四面体的 180 万降到 92 万，且 Min Orthogonal Quality 达到 0.24，开启 Cut Plane 可见中心全部是齐整的正交六面体方块。',
  },
  'meshing-improve-mesh': {
    coreConcept:
      '自动生成的体网格在极少数尖锐转角或贴体过渡区往往只存在几十个质量很差的畸变单元。Improve Volume Mesh 通过局部节点光顺与局部拓扑调整专门改善低于设定正交质量目标（Cell Quality Limit）的那部分最差单元。',
    parameterEffects: [
      ['Quality Method & Quality Limit', '通常按 Orthogonal Quality 将阈值设在 0.15~0.25 之间，专门针对最差尾部单元执行多轮光顺修整。'],
      ['局限性边界', '只能“微调节点坐标”抬高轻中度低质量单元（如 0.06 → 0.16）；如果网格出现负体积或几何重叠破损，必须回到面网格或 CAD 修改尺寸。'],
    ],
    steps: [
      '生成体网格后先查看质量直方图，如果 Min Orthogonal Quality < 0.15（尤其是 < 0.10），执行本步骤。',
      '填入目标质量下限（如 0.20）并运行光顺迭代。',
      '对比执行前后的 Min Orthogonal Quality 数值与最低直方图柱条占比变化，达到 ≥ 0.10~0.15 后再切换 Solution。',
    ],
    example:
      '某阀芯尖角处体网格初始 Min Orthogonal Quality = 0.08，直接算容易在角点发散；设置 Cell Quality Limit = 0.20 执行 Improve 后，最差单元提升至 0.19，满足求解安全要求。',
  },
  'meshing-switch-solution': {
    coreConcept:
      'Fluent 启动器分为前处理划分（Meshing）与物理场求解（Solution）两大模式。Switch to Solution 会把生成的三维体网格、各边界区（Boundary Zones）、各流体/固体区（Cell Zones）完整移交给求解内核并加载物理/边界树状面板。',
    steps: [
      '切换前核对三件事：体网格已生成、Minimum Orthogonal Quality > 0.10（推荐 > 0.15）、入口与出口边界均未漏设为 wall。',
      '点击顶部 Switch to Solution 将网格移入求解模式。',
      '进入 Solution 后第一步先在 General 点击 Check Mesh 复核 Domain Extents 单位尺度和负体积检查。',
    ],
    example:
      '完成 Poly-Hexcore 划分且实测最小正交质量 0.22 后点击 Switch to Solution，在求解模式下立刻看到 `inlet`、`outlet`、`wall` 均已按设定类型准备就绪。',
  },
  'meshing-ribbon-reset': {
    coreConcept:
      'Reset Workflow 用于清空当前教学演练中修改过的尺寸条目、边界指定和已执行步骤状态，把水密或容错任务流程恢复为最初的干净起点，以便重新对照比较不同网格策略。',
    steps: [
      '若需要保留当前参数对照，先记录下你刚调好的局部尺寸、边界层首层高度与体网格质量指标。',
      '点击 Reset Workflow 恢复工作流初始状态。',
      '按步骤重新体验 Watertight 或 Fault-Tolerant 全流程划分。',
    ],
    example:
      '刚演练完 Smooth-Transition 默认网格，想从头用 Uniform 精确指定第一层高度 0.035 mm 重新走一遍并对比总单元数时，可先 Reset Workflow 再重跑一遍流程。',
  },
  'meshing-cut-plane': {
    coreConcept:
      '三维模型外表面网格画得再漂亮也看不出体内部质量。Cut Plane 通过交互式剖切面切开体网格，直接暴露出边界层在拐角是否坍塌、Poly-Hexcore 六面体核心是否正常进入狭缝、以及体单元从边界向外层尺寸是否突跳。',
    steps: [
      '生成 Volume Mesh 后立即开启 Cut Plane 视图并拖动法向位置穿行流道截面与拐角。',
      '重点放大壁面与狭缝区域：检查棱柱边界层层数是否被挤压减层，以及最外层棱柱与多面体/六面体过渡是否温和。',
      '查看 BOI 辅助体内部区域是否确实按预期加密。',
    ],
    example:
      '外壳看表面三角网格非常均匀，切开 Cut Plane 才发现窄缝通道两侧边界层相撞导致中间几乎没有核心网格；发现后及时下调 Min Size 或启用 Proximity 增密狭缝解决。',
  },
  'meshing-ft-overview': {
    coreConcept:
      '工业复杂装配体（如整车机舱、服务器整机柜）往往包含上千零件、焊接缝、轻微重叠干扰且缺乏封闭流体实体，用 CAD 手动修复成水密几何代价极高。Fault-Tolerant Meshing（FTM）采用包面重构建模（Wrapper）：允许输入“带缝不干净 CAD”，靠封盖开口、放置 Material Point 与控制泄漏尺寸阈值自动提取严密闭合流体外包络后再划分体网格。',
    choices: [
      ['Watertight Geometry', '输入必须是严密闭合、无破洞无多余碎面的干净实体；表面细节保真度最高、速度最快，单零件/管路首选。'],
      ['Fault-Tolerant Meshing', '专门容忍破面、装配缝、轻微几何穿插；通过包面重划分跨越不必要的小缝，以稍高的包面代价省掉几天手工修 CAD 的时间。'],
    ],
    steps: [
      '评估 CAD 干净程度：能几分钟修好水密的优先走 Watertight；大型脏装配体切换进入 Fault-Tolerant 工作流。',
      '依次完成 Import CAD and Part Management、Describe Geometry and Flow、开口 Capping、Material Point 识别以及 Leakage 阈值设定。',
      '生成包面（Extract Edges & Create Surface Mesh）检查表面贴合与缝隙封堵情况，最后加边界层与体网格。',
    ],
    example:
      '发动机舱整舱热管理 CAD 包含几百个螺栓间隙与未闭合支架：改用 Fault-Tolerant 工作流，定义散热器开口封盖并将 3 mm 装配微缝设作泄漏封堵，无需逐件修改原几何即可直接抽取机舱内部流通空间。',
  },
  'meshing-ft-describe': {
    coreConcept:
      '在 Fault-Tolerant 流程中，CAD 零件包罗万象，软件并不知道你是要抽取“机壳内部空气流通空间”（Internal Flow），还是要建“包裹汽车外部的风洞空气域”（External Flow），亦或是两者兼有的共轭多域问题。这一步确立包面流场类型、开口处理与泄漏检查开关。',
    choices: [
      ['Internal / External / Internal+External', '明确流体在几何内部、外部还是同时包含内外流体（决定包面边界朝哪一侧抽取）。'],
      ['启用 Capping 与 Leakage Check', '若内流进出口未闭合需开启开口封盖；若装配存在需要用容差自动跨过封闭的小缝隙，需勾选允许泄漏封堵。'],
    ],
    steps: [
      '选择流动空间类型（仅内流、仅外流或内外兼有），核对是否有需要保留导热的固体部件。',
      '声明零件之间是否允许微缝自动闭合，以及是否需要创建进出流封盖面。',
      '更新后系统会在左侧自动列出 Capping、Material Points 与 Leakage 检测分支。',
    ],
    example:
      '电子机箱强迫风冷模型属于“既有小缝又需确定内外部流动空间”：选定 Flow Type 并允许使用 Capping 与 Leakage Detection，后续就能自动区分风扇进风通道与无关板金拼接缝。',
  },
  'meshing-ft-capping': {
    coreConcept:
      '与水密流程相似，Fault-Tolerant 包面也需要封闭“真实流通开口”才能把内部流动空腔与外部空气区隔开，同时这些封盖面会被直接赋名为未来求解阶段的入口与出口边界。',
    steps: [
      '框选或点选真实流道进出口边线创建 Capping 面，确保封盖完整兜住开口轮廓。',
      '为每个封盖设置名称及入口/出口边界类型，注意不要把实际流通通道误封成不透水壁面。',
      '点击确认更新并在视口核对封盖是否与周边实体顺利衔接。',
    ],
    example:
      '机箱前面板进风口与背部出风口分别建立封盖 `fan-inlet` 和 `rear-outlet`，从而和外壳壁面围成清晰的机箱内风道闭合包面空腔。',
  },
  'meshing-ft-identify': {
    coreConcept:
      '包面面对一堆互不相交或带微小穿透的面片集合时，软件靠“种子材料点（Material Point）”向四周扩散探测空间连通性——点落在哪片封闭包络区域里，那整个连通空腔就被识别为流体区或死区！',
    parameterEffects: [
      ['坐标落在边界或壁面上', '种子点如果压到壁面、封盖或固体内部边界，探测可能失败或者跑错连通域。'],
      ['流体与固体多区域识别', '每一个独立连通且你想保留划分体网格的区域，都至少对应一个落在其内部中央的种子坐标点。'],
    ],
    steps: [
      '检查当前几何坐标尺度范围（毫米或米），在目标空腔内部中轴位置拾取或键入 Material Point 坐标。',
      '指定该坐标对应的 Region Type（如 Fluid），多区域模型依次添加并命名各流体/固体种子点。',
      '预览点位确定它明显处于空腔正中而非贴壁后更新识别结果。',
    ],
    example:
      '弯管内流道进出口封盖完毕后，在管道中心线上取一点 `(0.05, 0, 0)` 作为 `fluid-domain` 的 Material Point；若流体仍能从该点一路漏到机壳外侧，则说明仍有超标缺口需要下一步 Leakage 检测堵住。',
  },
  'meshing-ft-leakage': {
    sourceUrl: meshingHelp + 'tgd_user_workflow_guided_tasks_setup_hole_closing.html',
    coreConcept:
      'Leakage Threshold（泄漏检测与封闭）通过你给出的最大缺口尺寸阈值，在包面阶段沿种子点向外搜索漏气路径，自动“搭桥补面”封堵小于该阈值的意外装配微缝，阻止内部流体区泄漏出去。',
    parameterEffects: [
      ['最大泄漏尺寸设太小', '真实存在的较大装配缝没被堵住，内部流体区域与外界仍连通导致 Extract 失败。'],
      ['最大泄漏尺寸设太大', '危险！可能把你本来想求解留着通过气流的窄风道、冷却缝也一起当作“泄漏”封死。'],
    ],
    steps: [
      '先通过 Identify Regions 放置流体种子点，再量取不想要的小缝隙宽度与要保留的最小真实风道宽度。',
      '输入介于两者之间的 Maximum Gap Size，先点击预览查看探测出的封闭面高亮位置。',
      '逐个核对被高亮封闭的均是无关小缝而非真实通道后点击 Update，并复查流体域连通性。',
    ],
    example:
      '装配体钣金折弯处留有 0.8 mm 的安装工艺微缝，而散热器真实通风槽宽 4.5 mm：把 Leakage 阈值设为 1.2 mm 并预览，确保只补上 0.8 mm 工艺缝而 4.5 mm 风道完整通畅。',
  },
}
