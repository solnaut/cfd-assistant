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

// --- Tree Nodes for Setup Physics ---
addEntry(entries, ['tree-models'], {
  whatItIs: 'Models（物理模型树）统一管理多相流（Multiphase）、能量（Energy）、黏性/湍流（Viscous）、辐射（Radiation）、热交换器、组分反应（Species）、离散相颗粒（DPM）、凝固熔化、声学、液膜（Wall Film）以及电位电池模型。',
  whenToUse: '确认网格尺寸与 Solver 类型后，按工程物理过程逐个开启必须求解的控制方程开关。',
  recommendation: '坚持“奥卡姆剃刀”原则：先跑通基础流动与湍流，确认稳定后再逐步叠加热、组分、多相或离散相模型，避免一开始把不必要的高非线性模型全部打开导致难以排查发散原因。',
  checkItems: ['温度变化、浮力或高速气动热必须启用 Energy', '关闭不使用的复杂模型可大幅降低内存并加快收敛'],
  commonMistakes: '随手同时勾选多个重度模型，遇到发散时根本无从分辨是湍流、能量、多相还是反应源项引起的问题。',
})

addEntry(entries, ['tree-materials', 'ribbon-materials', 'ribbon-materials-database', 'materials-main', 'materials-fluid', 'materials-solid'], {
  whatItIs: 'Materials 管理流体与固体材料物性（密度 ρ、比热 Cp、导热系数 k、黏度 μ 及电导率/潜热等），支持常数物性、理想气体、分段线性/多项式表、Sutherland 公式及从内置 Fluent Database 复制标准工质。',
  whenToUse: '每当换用非默认 air/water 工质、温度跨越较大导致黏度/密度剧烈变化、涉及可压缩空气动力学或共轭传热固体件时必须设置。',
  recommendation: '新建/复制出实际工质（如 liquid water、copper、aluminum）后，切记回到 Cell Zone Conditions 把目标区域指派过去——仅仅把材料放进 Materials 列表并不代表流体域就自动改用了它！',
  checkItems: ['高速气体（Ma > 0.3）或大温差热流务必评估 Ideal Gas / Boussinesq / 变物性曲线', '检查完 Materials 后去 Cell Zone Conditions 确认已绑定到对应区域'],
  commonMistakes: '从数据库 Copy 了水（water-liquid）却忘了进 Cell Zone Conditions 修改分配，结果整个流场实际一直按默认常温空气（air）在算！',
  operation: {
    coreConcept: 'Fluent 材料配置分“两步走”才真正生效：第一步在 Materials 定义或从数据库 Copy 工质物性参数；第二步必须在 Cell Zone Conditions（及流体多相 Phases）中把该材料真正赋值给对应的几何区域。',
    choices: [
      ['Constant 常数物性', '温差小、低速不可压缩水冷/风冷首选，求解最稳定。'],
      ['Ideal Gas / Incompressible Ideal Gas', '高速可压缩（密度受压力温度双控）用 Ideal Gas；低速大温差浮力流可用 Incompressible Ideal Gas（忽略压降对密度影响）。'],
      ['Boussinesq 浮力近似', '仅在微小温差自然对流、密度变化 < 10% 时使用，能极大地稳定自然对流求解；注意配合正确 Thermal Expansion Coeff 与 Operating Density。'],
    ],
    steps: ['双击流体/固体材质打开 Create/Edit Materials 面板。', '从 Fluent Database 选择标准工质并点 Copy，或手动调整材料名和物性公式后点击 Change/Create。', '前往 Cell Zone Conditions 检查各区域下拉选中的 Material Name确为刚刚配置好的工质。'],
    example: '散热器铜基板液冷仿真：从库里 Copy 出 `water-liquid` 与 `copper`，然后进入流体域选 `water-liquid`，进入固体基板域选 `copper`。',
  },
})

addEntry(entries, ['tree-cell-zone-conditions', 'ribbon-zones-cell', 'cell-zone-fluid', 'cell-zone-solid'], {
  whatItIs: 'Cell Zone Conditions 控制每个三维/二维体区域（Cell Zone）的物理属性：赋予流体/固体材料、设置局部旋转/平动（MRF Frame Motion 或 Sliding Mesh Motion）、多孔介质阻力（Porous Zone）、动量/热量体积源项以及固定值与局部层流区。',
  whenToUse: '确认每块区域的工质归属、设置旋转叶轮流道（MRF/滑移）、模拟过滤网/散热翅片多孔阻力或给定芯片体积热源功率（W/m³）时进入。',
  recommendation: '添加体积热源（如 100 W 芯片均匀发热）时务必先用量测得的固体区域体积 V（m³）算出体积热源密度 q\'\'\' = P / V（W/m³）再填入 Energy Source，不可直接填总瓦数 W！',
  checkItems: ['核对 Fluid/Solid 区域分别分配了对应流体与固体材料', '旋转域开启 Frame Motion 时关注旋转中心、方向向量与转速正负号（右手定则）'],
  commonMistakes: '误把芯片总功率（如 50 W）直接填成体积源密度（单位是 W/m³），导致发热量放大或缩小成千上万倍，温度瞬间飙飞或几乎不变！',
  operation: {
    coreConcept: 'Boundary Conditions 只控制“容器外皮”，而 Cell Zone Conditions 控制“装在容器内部的整个体积块”——它决定了这一整块体积是什么物质（材料）、整块区域是否在旋转（MRF/Mesh Motion）、里面有没有多孔阻力或体热源发生器。',
    steps: ['在分区列表中选中某个 Fluid 或 Solid 区域并点 Edit。', '先检查 Material Name 是否为目标工质。', '按需勾选并配置 Frame Motion / Mesh Motion（叶轮机械）、Porous Zone（过滤/催化多孔区）或 Source Terms（体积发热量/动量源）。'],
    example: '模拟 60 W 热功率的 20 mm × 20 mm × 2 mm 硅芯片（体积 V = 8×10⁻⁷ m³）：勾选 Solid Zone 的 Source Terms，填入 Energy 常数体积热源 = 60 / 8e-7 = 7.5e7 W/m³。',
  },
})

addEntry(entries, ['tree-reference-values', 'ribbon-physics-reference', 'reference-compute-from', 'reference-area', 'reference-length'], {
  whatItIs: 'Reference Values（参考值）提供后处理与无量纲系数计算用的基准尺度和来流参考参数（如参考面积 Area、参考长度 Length、参考速度 Velocity、参考密度 Density），用于换算升力系数 Cl、阻力系数 Cd、压力系数 Cp、努塞尔数 Nu 等。',
  whenToUse: '计算并输出 Cd、Cl、Cm、Cp、Stanton 数等无量纲工程指标前必须准确设定；它不直接改变控制方程的流场求解结果本身，但直接决定系数报告是否算错！',
  recommendation: '可用 Compute From 从主入口（如 velocity-inlet）自动抓取来流密度、速度和温度，但 Area（特征迎风面积或机翼弦展面积）与 Length（管道直径或机翼弦长）在三维算例中往往默认是 1 m²/1 m，必须按真实几何投影面积手动修改！',
  checkItems: ['先用 Compute From 选入口，再手动检查并修正 Area（注意与平面迎风面积或参考面积定义一致）与 Length', '确认二维计算参考深度 Depth 默认为 1 m 是否符合图纸要求'],
  commonMistakes: '做汽车或翼型外流算阻力系数 Cd 时完全不动默认 Area = 1 m²，结果软件算出的阻力是对的、但除以错面积得出的 Cd 却差好几倍！',
})

// --- Boundary Conditions Panel & Extended BC Types ---
addEntry(entries, ['tree-boundary-conditions', 'ribbon-zones-boundary'], {
  whatItIs: 'Boundary Conditions 按区域分类展示并配置计算域全部边界（入口、出口、壁面、对称面、周期面、内部渗透面与风扇等），控制流体进出方式、压降跃变及传热约束。',
  whenToUse: '完成材料分配后，在所有入口、出口和壁面上给出符合真实物理实验或设计手册的流动与热条件时使用。',
  recommendation: '稳健入口-出口配合通常为“Velocity/Mass-Flow Inlet（指定流量）+ Pressure Outlet（指定静压基准）”或“Pressure Inlet（指定总压）+ Pressure Outlet（指定静压）”；尽量避免双端同时定死流量又无压力定锚点，并避免回流切在出口截面。',
  checkItems: ['至少有一处压力类边界或内部锚点确定流场参考压力基准', '物理对称边界（Symmetry）只用在流场本身也严格对称的静止切片上（非定常涡脱落横切过对称面不可强制 Symmetry）'],
  commonMistakes: '全封闭盒子或进出口全部设速度入口却忘记出口改成压力出口导致连续性不守恒发散；或者把内部壁面阴影对（wall-shadow）误拆成单侧固定温度边界。',
})

addEntry(entries, ['bc-mass-flow-inlet'], {
  whatItIs: '质量流量入口（Mass-Flow Inlet）在未知精确速度截面但明确知道进入管道或阀门的每秒总质量流量（kg/s）时使用，尤其在密度随温度压力变化的强可压缩或高热交换算例中能严格保证质量流量守恒。',
  whenToUse: '已知泵/压气机输送质量流率（如 0.5 kg/s 空气或 2 kg/s 制冷剂）且流体密度随压缩/受热可能变化时选用（不可压缩匀速入流也常用以直接锁定质量流）。',
  recommendation: '填好 Mass Flow Rate 或单位面积 Mass Flux 后，同时补全 Total Temperature（可压缩/开启能量时代表滞止总温！）、入口流向及湍流参数（Intensity + Hydraulic Diameter）；注意初始计算时如给入过大质量流且初始静压偏低，可能出现超高马赫数振荡。',
  checkItems: ['核对单位是 kg/s（质量流量）还是 kg/m²·s（质量通量）', '开启能量后输入的是总温 Total Temperature 而非静温'],
  commonMistakes: '把体积流量（如 L/min 或 m³/h）乘错密度直接填成 Mass Flow Rate，或多人协作未注意入口截面积大小误把平均通量与总流量对调。',
  operation: {
    coreConcept: 'Velocity Inlet 直接定死入口流速 u，密度若受压温度影响变化则会引起质量流率波动；而 Mass-Flow Inlet 锁定入口质量流量 ṁ = ∫ρu·dA，求解器会随局部密度动态调整入口速度大小，是压气机、喷管与可压缩热流体最物理可靠的入口给定方式。',
    steps: ['选择边界类型为 Mass-Flow Inlet 并打开设定窗口。', '在 Mass Flow Specification Method 选 Mass Flow Rate（最常用）并填入精确质量流率。', '设定流动方向（常选 Normal to Boundary）、湍流强度与水力直径，以及开启 Energy 时的滞止总温。'],
    example: '空气压缩机流道已知进气质量流率 0.12 kg/s、进气总温 300 K：将入口设为 Mass-Flow Inlet，填 Mass Flow Rate = 0.12 kg/s、Total Temperature = 300 K、方向 Normal to Boundary。',
  },
})

addEntry(entries, ['bc-inlet-vent', 'bc-outlet-vent'], {
  whatItIs: 'Inlet Vent / Outlet Vent 用于把包含局部阻力系数（Loss Coefficient K_L）的进风口格栅、防尘网或百叶窗等简化为薄边界模型，按 Δp = K_L · (½ρv²) 计入压力损失而无需精细画出网格孔洞。',
  whenToUse: '机柜散热仿真中进风口或出风口装有金属冲孔网板、防尘滤网或百叶出风口，几何尺寸远小于网格分辨率，直接填试验压损系数 K_L 即可体现阻风效果。',
  recommendation: '确认厂家手册给的无量纲阻损系数 K_L 是否针对“全截面积表观风速”定义，保证边界上 Gauge Pressure 与基准压力一致。',
  checkItems: ['Loss Coefficient 无量纲阻损系数已折算到对应边界参考截面积', '明确回流或外部进入温度设定'],
  commonMistakes: '把多孔滤网压降公式（达西/惯性系数）误当作无量纲单点阻损 K_L 填入 Vent。',
})

addEntry(entries, ['bc-intake-fan', 'bc-exhaust-fan'], {
  whatItIs: 'Intake Fan / Exhaust Fan 边界专门模拟放置在流动域进风口或排风口边界上的薄平面风扇（轴流/离心风机），依据你提供的 P-Q 风压曲线或定压升（Pressure Jump）向流体做功泵送。',
  whenToUse: '风扇位于机箱进风壁或排风壁外口且不需要追踪内部旋转叶片瞬态涡系时，直接利用风机厂家规格书提供恒定压升或分段多项式/表格式 P-Q 特性曲线快速建模。',
  recommendation: '工程风扇随背压升高风量会下降，正式机柜模拟建议输入真实厂家的多点分段曲线或多项式而非单一固定压升常数；同时核对排风与进风抽气朝向。',
  checkItems: ['检查 Pressure Jump 正负方向是否把风往域内吹（Intake）或往外抽（Exhaust）', '注意风压曲线横坐标（体积流量还是法向速度）单位定义一致'],
  commonMistakes: '在 Intake Fan 填负压跃变或在速度跨度极大的工况直接把最大静压（零风量堵转压头）填作常数。',
})

addEntry(entries, ['bc-outflow'], {
  whatItIs: 'Outflow 边界假设流动在出口处已充分发展（法向扩散导数为零），并通过整体连续性比例分配出口流量权重，完全不需手动输入出口压力与速度。',
  whenToUse: '仅在高度受限的理想稳态不可压缩内流且“明确确定出口下游已充分发展绝无回流、不关心绝对压降精度与可压缩性”的多分支出流分配场景作为简化参考（现代 Fluent 更优先推荐 Pressure Outlet！）。',
  recommendation: '重要警示：一旦几何较短出口存在哪怕一点回流、或者开启多相流 / 强可压缩（Ideal Gas）/ 非定常瞬态，绝不可使用 Outflow，否则求解极其容易发散或严重违反物理边界！绝大多数情况请一律使用 Pressure Outlet。',
  checkItems: ['不可用于可压缩流（Ideal Gas）与 VOF 多相自由液面模型', '多出口模型确认各支管 Flow Rate Weighting 分配权重合理且无局部逆流'],
  commonMistakes: '看到 Outflow 无需填压力很省事就什么工况都用它——一旦开启能量或出口近分离区有涡回流，Outflow 就会报计算失败或死锁！',
})

addEntry(entries, ['bc-pressure-far-field'], {
  whatItIs: 'Pressure Far-Field（压力远场）利用一维局部黎曼不变量理论描述无穷远处的无反射自由来流边界（给定来流马赫数 Ma、远场静压、静温及来流方向），能有效吸收外流冲击波与压力扰动防止边界反射失真。',
  whenToUse: '机翼、翼型、导弹、高铁高速可压缩外流空气动力学计算，且远场域边界距离核心物体足够远（通常 15~20 倍特征弦长外）；要求流体密度必须开启 Ideal Gas 可压缩状态方程！',
  recommendation: '低速不可压缩液体或常数密度气体严禁使用 Pressure Far-Field（此时软件会禁止选配）；外流域远场必须设为单一连通外边界并采用基于可压缩 Ideal Gas。',
  checkItems: ['材料密度必须已设为 Ideal Gas 才可用 Pressure Far-Field', 'Mach Number 与静温/静压配合 Flow Direction 矢量严格匹配飞行或风洞状态'],
  commonMistakes: '算常温常压不可压缩空气（密度选 Constant）却找着想用 Pressure Far-Field，或者把外流场框得离模型太近导致反射误差。',
})

addEntry(entries, ['bc-degassing'], {
  whatItIs: 'Degassing（脱气边界）专用于 Eulerian 多相流（如鼓泡反应器液池顶面），允许指定分散气相按局部浮升通量自由逃逸出计算域，而将连续主液相彻底反射截留在池内。',
  whenToUse: '模拟液态气液鼓泡塔、液罐顶部开口排气等场景：气泡上升到达自由顶面后爆破排空而液体不流出池外。',
  recommendation: '开启后明确检查哪个相是待排出次相，并与顶部液面物理高度设置一致（若需要详细解析顶面液面晃荡起伏波浪，请改用 VOF 自由液面 + 顶部大气空间压力出口）。',
  checkItems: ['确认仅勾选在 Eulerian 多相气液脱气顶部自由界面上', '检查气相出口收支平衡'],
  commonMistakes: '想在 VOF 多相流里画顶面脱气或混淆了连续液相与分散气泡相号。',
})

addEntry(entries, ['bc-perforated-walls'], {
  whatItIs: 'Perforated Walls 模型用于将高密微孔壁面（如发汗冷却微孔板、多孔消声/吸气蒙皮壁面）等效转化为源汇喷射与抽吸壁面边界，无需把上千个微小孔道画成体网格。',
  whenToUse: '航空发动机火焰筒发散冷却孔板、高密度多孔吸气机匣壁面需要考虑穿孔冷气注入冷却与压力穿透时采用。',
  recommendation: '输入穿孔率、孔数或从文件读入孔坐标布局并检查显式喷射松弛因子，如同时求解共轭基板热传导需勾选 CHT Coupling。',
  checkItems: ['明确喷射壁（Injection Wall）和抽取壁（Extraction Wall）的配对关系', '可压缩与不可压缩选型与整体流动匹配'],
  commonMistakes: '没指定正确的孔分布文件或孔总面积与实际等效穿孔压降系数不匹配。',
})

addEntry(entries, ['bc-symmetry'], {
  whatItIs: 'Symmetry（对称边界条件）假设穿过该边界的法向速度为零、且所有标量与切向速度在该面的法向梯度均为零，等价于“无摩擦绝热镜像平面”，从而可只画 1/2、1/4 或 1/8 对称模型大幅压缩网格量。',
  whenToUse: '不仅几何外型必须沿该平面严格镜像对称，连物理入口工况、热边界以及真实预期流场形态也对称时才可缩减模型。',
  recommendation: '做稳态管内层流/平均对称湍流计算极省算力；但如果在瞬态计算圆柱绕流卡门涡街等物理上本就会左右非对称交替脱落涡的现象时，千万不要偷懒从中心切 Symmetry，否则人为掐死了真实非对称涡脱落！',
  checkItems: ['几何截面中心精确落在对称平面上且法向方向平整', '如果算旋转机械周期重复叶片，应用 Rotational Periodic 而非 Symmetry'],
  commonMistakes: '把原本存在侧风来流、或内部叶轮持续朝同一方向切向旋转的问题错误地切一半设成 Symmetry，导致对称面把旋转横流直接憋断！',
})

addEntry(entries, ['bc-axis'], {
  whatItIs: 'Axis（二维轴对称中心轴）专用于二维 Axisymmetric 平面切片模型的回转中心轴线（必须严格位于 y = 0 线上），控制中心半径 r → 0 处的奇点对称极限条件。',
  whenToUse: '开启了 General → 2D Space → Axisymmetric 或 Axisymmetric Swirl 建模圆形直管、拉瓦尔喷管、圆柱喷射流场时，把底边中心线设为此边界（不作普通 Wall 或 Symmetry 设）。',
  recommendation: '在前处理确保所有网格单元严格落在 y ≥ 0 区域且旋转轴精准对齐 y = 0；如中心有实体细棒（例如环形套管内壁）则应按 Wall 设而非 Axis！',
  checkItems: ['轴对称网格任何一点的 Y 坐标不可小于 0', '与 General → 2D Space → Axisymmetric 模式成套对应'],
  commonMistakes: '几何切片画在 x = 0 垂直方向（Y 轴）就选 Axis，Fluent 轴对称默认中心轴永远是 X 轴（即 y = 0）！',
})

addEntry(entries, ['bc-periodic', 'bc-periodic-conditions'], {
  whatItIs: 'Periodic（周期性边界）与 Periodic Conditions 允许将高度重复排列的旋转叶片通道（例如 36 片叶轮只画 1 片，旋转周期）或长距离全发展波纹换热板段（平移周期）首尾相连成一个循环计算域，支持定质量流量或定压降驱动。',
  whenToUse: '多叶片旋转机械取单通道模拟、周期排列散热翅片/换热管束取单元周期代表（Periodic Unit Cell）做高精度加密分析时选用。',
  recommendation: '首选使用 Mesh → Create/Check Periodic Zone 确保配对两面网格节点平移或旋转角度（360° / 叶片数）完全一致，再用 Periodic Conditions 指定沿主方向的驱动质量流量或压力梯度。',
  checkItems: ['注意 Rotational（旋转角度重复）与 Translational（轴向平移重复）绝对不可混淆', '充分发展周期传热关注 Upstream Bulk Temperature 基准设置'],
  commonMistakes: '周期配对的两侧边界面角度偏离或节点没有对应上导致生成周期接口失败，或者误把单一平移周期按静止普通入/出口跑却期望内部重复循环。',
})

addEntry(entries, ['bc-interface', 'bc-overset', 'bc-rans-les-interface'], {
  whatItIs: 'Interface（非共形交界面边界，由 Mesh Interfaces 配对插值连接两套网格）、Overset（嵌套动网格外边界）、RANS/LES Interface（结构化区域混合湍流模型交界涡生成界面）三类专用边界对接类型。',
  whenToUse: '当两段独立划分、不共享节点的流体或流固区域需要连接传流与传热时将两侧接触面均设为 Interface；使用嵌套重叠网格时组件外包边界设为 Overset；在特定分区涡解析混合交界面设定 RANS/LES 转换。',
  recommendation: 'Interface 边界在 Boundary Conditions 里必须去 Mesh Interfaces 创建了成对连接后才会真正打通流通！未配对挂空的 Interface 边界默认等同于不透水封闭墙壁，会导致彻底堵死流动。',
  checkItems: ['每一个设为 interface 的边界均应在 Mesh Interfaces 对话框里完成配对（Coupled/Connected）', 'Overset 界面确保与背景网格尺寸尺度匹配'],
  commonMistakes: '把两套网格接缝面类型改成 interface 就以为自动打通了，忘记进 Mesh Interfaces 点 Create 配对，算出来两域完全不导流不换热！',
})

addEntry(entries, ['bc-interior'], {
  whatItIs: 'Interior（内部通流界面）代表流体域内部两个单元之间可以直接自由交换质量、动量和能量的纯粹通透计算面，对流体本身没有任何机械阻碍或附加压降。',
  whenToUse: '当两个流体区共享节点连接（如流道分段加密交界面），或需要将原本错误的内部壁面/分界面彻底贯通让流体自由穿过时设为 Interior。',
  recommendation: '千万核对相邻实体在内部界面处确实共享了网格节点（Conformal）；若两套网格本身节点错位不重合，必须改设 Interface 并走 Mesh Interfaces 插值对接而不能强改 Interior！',
  checkItems: ['不可把流体域最外层与外界空气不相接的外壳边界错设成 interior（外部边界不存在另一侧单元，无法通流）', '流固交界面之间也不能设为 interior，必须保留为 wall + wall-shadow 耦合换热'],
  commonMistakes: '误把应该阻挡流体的固体壁面薄片（Baffle）留成 interior 导致流体直接透穿过去，或者流固共轭交界误删 shadow 面后设为通透。',
})

addEntry(entries, ['bc-fan'], {
  whatItIs: 'Fan（内部平面风扇跃变边界）用于在内部流道中间放置一个虚拟零厚度圆形/矩形风盘界面，按压升曲线 P(V_n)（常数、多项式或分段函数）对垂直穿过的流体直接施加静压跃升，无需模拟复杂三维旋转叶片几何。',
  whenToUse: '整机机箱、车舱空调管道或大型机柜风道中，风扇安放在风道内部截面而不是最外端进/出口处时，用内部 Fan 比画实体叶轮节省 90% 网格且直接接入厂家风压-风量曲线。',
  recommendation: '创建后第一时间查看该内部面法向（或勾选 Reverse Fan Direction）确认吹风正方向与风道设计流向完全一致，开启 Limit Polynomial Velocity Range 防超越工作区间震荡。',
  checkItems: ['验证吹风朝向矢量是否真的顺着预期出风方向而非反吹', '将厂家流量（CFM / m³/h）曲线准确除以风扇流道扫掠面积转为法向速度对应 Pressure Jump 曲线'],
  commonMistakes: '吹风方向与网格法向相反导致风机倒抽风却以为流场错了，或者忽略了内部风扇默认只加速轴向速度、若要体现离心切向旋流需额外启用 Swirl 分量。',
})

addEntry(entries, ['bc-radiator'], {
  whatItIs: 'Radiator（内部散热器芯体薄片模型）将热交换器/水冷散热排简化为内部薄面压降与热交换边界：结合给定阻力系数 K_L（压损）与换热系数/外部流体参考温度计算流体流过时带走的压降与升温/降温总量。',
  whenToUse: '汽车前端进气散热器、机柜蒸发排冷却盘等宏观整机模拟：直接忽略千百个细密翅片几何，仅划单层内部面即可精准复现压损特性与热交换规律。',
  recommendation: '如果散热器芯体存在一定厚度且需要体现内部偏流引导特性，使用三维流体多孔介质（Cell Zone Porous）配合热交换模型；薄平芯体快速整车外流建模优先用 Radiator 边界。',
  checkItems: ['检查 Loss Coefficient 阻力系数与压降实验数据单位对准表观风速', '换热系数与流体核心温度定义一致'],
  commonMistakes: '忘记在开启 Energy 条件下填准散热器内部工质参考温差或传热系数导致下游全无换热温升。',
})

addEntry(entries, ['ribbon-model-heat-exchanger'], {
  whatItIs: 'Heat Exchanger 宏观换热器模型入口：直接设定换热器核心区的流阻特性、NTU/有效度或给定总换热量模型，替代极细密翅片全尺寸三维网格建模。',
  whenToUse: '整车热管理舱、散热模组或空调盘管内部包含大量密集细小通道、无法全部划分真实几何翅片网格时开启简化仿真。',
  recommendation: '结合多孔介质流体区域方向设置主穿透流向，选择与厂方台架试验数据形式匹配的 Dual Cell 或 Macro 换热模型曲线。',
  checkItems: ['确认主/次流道或宏观芯体换热方向与几何装配对齐', '传热计算前先确保能量方程已开启且基准进口风温准确'],
  commonMistakes: '同时按固体细翅片划好了真实实体几何又额外在芯体开启宏观 Heat Exchanger，造成压降与传热被重复计入两次！',
})

addEntry(entries, [
  'ribbon-materials-fluent-db',
  'material-sutherland-t0',
  'material-sutherland-s',
  'material-solidus-temp',
  'material-liquidus-temp',
  'material-pure-solvent-heat',
], {
  whatItIs: 'Fluent Database 材料库调用及温度相关黏度（Sutherland 参数）、凝固熔化潜热物性（Solidus/Liquidus 温度与纯溶剂熔解潜热）配置项。',
  whenToUse: '需要从内置标准材料库复制常见气体/金属固体物性，或在高速可压缩气体（Sutherland 变黏度）及相变蓄热/金属铸造（Solidification & Melting 糊状区相变潜热）时精确输入参数。',
  recommendation: '使用空气 Sutherland 定律常取 μ₀ = 1.716e-5 kg/(m·s)、T₀ = 273.11 K、S = 110.56 K；纯物质或窄温区相变适当拉开数开尔文的 Solidus-Liquidus 区间有助于缓解液固边界振荡。',
  checkItems: ['从 Fluent Database 复制物性后务必再回到 Cell Zone Conditions 指派给具体流域或固体域', '检查潜热 Pure Solvent Melting Heat 单位是 J/kg 并避免把固液相温度颠倒填反'],
  commonMistakes: '只点击数据库 Copy 后就关闭窗口，忘了去 Cell Zone Conditions 把流域默认 air 换成刚复制过来的水或导热铜材料！',
})

addEntry(entries, [
  'reference-density',
  'reference-depth',
  'reference-enthalpy',
  'reference-pressure',
  'reference-temperature',
  'reference-velocity',
  'reference-viscosity',
  'reference-gamma',
  'reference-zone',
], {
  whatItIs: 'Reference Values 全量无量纲参考参数栏：包含计算阻力/升力系数 Cp、表面传热系数 Nu/St 及总压还原基准所需的参考密度、深度、比焓、参考压力/温度、流速、黏度、绝热指数 γ 和参考计算域。',
  whenToUse: '任何时候只要报表与后处理涉及压差系数 Cp、气动升阻力系数 Cl/Cd、传热系数 HTC 或自定义无量纲结果时，均应提前全盘校验此页面。',
  recommendation: '先选 Compute From 选定进口或自由来流（如 `inlet`）自动填入对应物性与流速，再手动校准特定工程定义所需的特征投影面积 Area 与特征长度 Length。',
  checkItems: ['二维平面问题重点核对 Depth 参考拉伸深度（默认 1 m）是否符合图纸设定', '参考参数只改变后处理无量纲系数及表面传热系数标度，不会改变原始物理场偏微分方程本身解出的压强与温度'],
  commonMistakes: '修改 Reference Values 后指望改变真实计算出来的温度或压差大小——实际上它只是无量纲除数和后处理参考零点，不改变核心流场解！',
})

addEntry(entries, [
  'pressure-far-field-dir-x',
  'pressure-far-field-dir-y',
  'pressure-far-field-dir-z',
  'pressure-far-field-turbulence',
  'pressure-far-field-turbulent-intensity',
  'pressure-far-field-hydraulic-diameter',
  'pressure-far-field-viscosity-ratio',
  'pressure-far-field-length-scale',
  'pressure-far-field-turbulent-k',
  'pressure-far-field-turbulent-epsilon',
  'pressure-far-field-turbulent-omega',
  'pressure-far-field-internal-emissivity',
  'pressure-far-field-mole-fractions',
  'pressure-far-field-species-mass-fraction',
  'pressure-far-field-species-mole-fraction',
  'pressure-far-field-particle-bc',
], {
  whatItIs: 'Pressure Far-Field（无反射远场特征线边界）的来流方向矢量、远场湍流、辐射发射率、化学组分与离散颗粒响应配置。',
  whenToUse: '模拟跨/超声速翼型、火箭外流场或无界开放空气动力学计算域外边界，且材料密度已采用 Ideal Gas 可压缩假设时使用。',
  recommendation: '精准给出对应攻角/侧滑角的单位来流方向矢量 `(cos α, sin α, 0)`；自由外流远场通常给定较低湍流强度（0.1%~1%）与小湍流黏度比（1~10）避免虚假湍流耗散污染机翼边界层。',
  checkItems: ['仅当流场采用 Ideal Gas 可压缩气体模型时 Pressure Far-Field 才在求解器中成立，常密度不可压缩请改用 Velocity Inlet + Pressure Outlet', '核对攻角矢量方向与机翼/机身坐标系方向一致'],
  commonMistakes: '常密度不可压缩空气流动直接套用 Pressure Far-Field 边界导致特征线无反射求解报错，或自由来流湍流强度填成过高的 10% 使层流转捩点严重提前！',
})

addEntry(entries, ['wall-adjacent-thickness', 'wall-heat-generation', 'wall-material'], {
  whatItIs: '一维薄壁导热属性（Wall Thickness 壁厚、内热源发热率 Heat Generation 与固体壁材料 Material）：允许在仅有二维无厚度边界面网格上自动考虑金属外壳本身的法向热阻与均匀生热。',
  whenToUse: '不值得为了薄铁皮机箱壳或塑料管壁单独划分几层实体网格，却希望精确计入外壳材料本身传热热阻或薄加热膜体积功率密度时直接在此设置。',
  recommendation: '若需要兼顾薄壳沿面内方向二维横向导热（切向扩散），再在下方配合勾选 Shell Conduction 并设置多层壳体厚度和材料。',
  checkItems: ['Wall Thickness 保持 0 代表理想零热阻薄面；输入真实壁厚（m）则按一维法向稳态导热自动累加壁温差', 'Heat Generation Rate 单位为体积功率密度 W/m³'],
  commonMistakes: '在 Shell Conduction 已勾选多层导热时重复把总发热功率（W）没除以薄板体积就直接填成体积热源率（W/m³）！',
})

addEntry(entries, ['periodic-axis-origin', 'periodic-axis-dir', 'periodic-pressure-grad', 'fan-pressure-profile', 'fan-swirl-radial', 'fan-swirl-speed'], {
  whatItIs: 'Periodic 周期面轴向原点与压降参数，以及 Fan 内部风盘压升剖面形式和切向旋流分量开关。',
  whenToUse: '配置旋转叶轮通道周期旋转轴原点/方向或直通道周期压降梯度时填写 Periodic 参数；需要体现真实轴流风扇带来的出口旋转尾流切向速度时在 Fan 中启用切向速度分量。',
  recommendation: '旋转周期面务必确认 Rotation Axis Origin 与叶轮装配中心完全一致；轴流风机如果下游紧跟换热器翅片或导风叶片，开启适当的切向旋流速度能更真实反映下游斜吹效应。',
  checkItems: ['Periodic Type 必须真实反映周期几何的对称性质（旋转 vs 平移）', 'Fan 压力-速度阶跃剖面与风机正反面法向方向严格校准'],
  commonMistakes: '旋转扇叶单通道模型的旋转中心偏离了 (0,0,0) 却保留默认旋转原点未改，造成叶片外缘线速度误差严重或网格拓扑配对失败！',
})

export const physicsAndBoundaryExplanations = entries
