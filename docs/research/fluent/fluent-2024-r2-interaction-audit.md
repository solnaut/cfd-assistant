# Fluent 2024 R2 交互核对记录

2026-11-21。以 Ansys Fluent 2024 R2 公开文档核对功能名称、路径、出现条件和操作结果，在 CFD Assistant 上执行目录审计和回归测试。界面使用 CFD Assistant 的原创视觉。核验范围为下表中的场景，原版各许可证和模型组合下的实际窗口仍待逐项核对。

| 轮次 | 检查范围 | 发现、修复与核验 |
| --- | --- | --- |
| 1 | 控件目录和引用完整性 | 首轮识别 853 个 Solution 控件、119 个窗口和 26 个无明确动作的启用按钮。新增回归检查，校验重复窗口、窗口链接、任务页链接、字段联动依赖和窗口标签归属。原有综合 Case/Data 窗口经搜索可达。 |
| 2 | Fluent 参考与覆盖范围 | 对照 Solution 与 Meshing 的 Ribbon、任务页和条件窗口。边界章节共列出 25 个窗口小节，其中也包含独立的 Periodic Conditions 与 Perforated Walls 设置。项目目录中的边界类型数量用于盘点实现，覆盖率需另行按原版路径核对。 |
| 3 | File 菜单和会话状态 | Read Mesh 支持新建或替换。替换时保留当前案例，清除流场数据，并可打开 Scale Mesh。Journal 和 Transcript 各自切换 Start 与 Stop。During Calculation 仅在 Transient 时显示，按时间步演示调度。测试覆盖 Journal 切换、保留案例和瞬态限制。 |
| 4 | 边界和材料 | 补上 Mass-Flow Outlet、风扇、通风口、Porous Jump、Radiator、Overset、Degassing 和 RANS/LES Interface 等 11 类入口及主要字段。选择修正质量流量后出现 ECMF 参考项。质量流量出口的 Radiation、DPM 随模型出现。材料数据库可按流体或固体复制示例条目，Cell Zone 的 Source Terms 可以打开子窗口。 |
| 5 | 时间推进 | Task Page 与 Run Calculation 窗口共享设置。固定步长可以直接输入、按周期或按频率定义。Adaptive 会更换目标字段，Settings 可以填写步长和变化因子范围。测试覆盖周期换算和自适应输入校验。 |
| 6 | 后处理对象 | Outline 可按名称找到已创建的表面。双击或 F2 会读回相应对象的字段，更新后仍可在报告和绘图中使用。测试从创建 Rake、重新打开、更新采样数走到 XY Plot。 |
| 7 | 网格工作流 | Watertight 从导入开始检查前置步骤，Mesh 重建或撤销上游任务时清理下游生成状态。曲率和间隙参数随 Size Functions 选择出现。Fault-Tolerant 区域识别增加 Solid 选项。测试覆盖两种工作流、重建失效以及向 Solution 交接。 |
| 8 | 教学说明 | 按文档核对读取网格、记录、自动导出、时间推进、质量流量出口、Porous Jump 和材料数据库。最终有 103 个控件条目引用已核对说明，同组控件可共用一条专业说明。其余条目显示待核对。测试校验已核对说明含 Ansys 文档链接。 |
| 9 | 键盘、筛选与控件反馈 | Outline 筛选可匹配子对象。键盘左右方向键切换对话框标签，Home 和 End 可定位两端。F2 打开对象，关闭后返回原对象。确认无响应的 24 个命令显示为待实现，其中包括若干网格编辑、动态网格和高级绘图命令。 |
| 10 | 最终复验 | 最终目录包含 948 个 Solution 控件、132 个窗口、8 个带内部标签的窗口及 23 类边界入口。静态审计中，启用按钮均有子菜单、窗口、页面链接或已登记的动作。86 项测试、lint、生产构建和差异格式检查均通过。 |

## 核验依据

- Solution 界面、Ribbon 和文件操作。[GUI Components](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_sec_gui_components.html) · [File Ribbon Tab](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_file_menu.html)
- 边界、材料、时间推进和后处理。[Boundary Conditions](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_boundary_conditions_task_page.html) · [Materials](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_materials_task_page.html) · [Run Calculation](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_run_calculation_task_page.html) · [Graphics and Animations](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_graphics_animation_task_page.html)
- 网格工作流和条件设置。[Watertight Surface Mesh](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_surface_mesh_gen.html) · [Fault-Tolerant Capping](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_fault_capping.html) · [Identify Regions](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_tasks_identify_regions.html) · [Leakage Thresholds](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_tasks_setup_hole_closing.html)

## 剩余差异

- 当前工作台为教学模拟。文件操作、记录状态、流场、网格质量和图形结果均使用演示数据。自适应时间推进支持参数输入和校验，其步长历史需要 Fluent 求解。
- File 高级格式、原版图形区的 Quick Property Editor、Watertight 封盖与 MultiZone、其余依赖物理模型和许可证的次级窗口仍有缺口。23 类边界入口已包含主要设置，专业子项仍待扩充。
- Vite 生产构建通过，仍有单个产物超过 500 kB 的体积提示。

## 模型与工作流补查

| 范围 | 核对及实现 |
| --- | --- |
| Multiphase | 补充 VOF、Mixture、Eulerian、Wet Steam 的独立设置路径，最多 20 个相。整数相 ID 贯通相属性、相对和边界体积分数。Phase Interaction 增加 Forces、Heat/Mass/Reactions、Interfacial Area、Discretization 和 Model Transition，Population Balance 根据模型显示。空化和蒸发冷凝进入各自设置窗口。 |
| Solver Methods | 体积分数离散格式按照 26.2.2 的表格随模型、界面类型和显隐式公式改变，和 Multiphase 窗口同步。Eulerian 可选 Phase Coupled SIMPLE。 |
| 其他物理模型 | 补充 Viscous 的独立 SAS、DES、LES 和转捩入口，辐射的 DTRM、MC、非灰波段与 S2S 子窗口，Species 的组分反应及积分设置，DPM 的喷射、UDF、积分格式与并行设置。Energy、凝固、声学、换热器、壁膜与电池也增加了条件选项。 |
| 边界和动态网格 | 增加 Periodic Conditions、Perforated Walls 及其孔位配置。Dynamic Mesh Zones 可按区域保存刚体、变形和几何子分支。 |
| Watertight Meshing | 增加 Capping 和 MultiZone 条件任务。部分区域由 MultiZone 覆盖时保留普通体网格任务，所有有效区域均覆盖时由 MultiZone 替代。 |

- 模型窗口、选项和格式依据 Fluent 2024 R2 用户指南。 [Models Task Page](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_models_task_page.html) · [Multiphase Setup](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_sec_multiphase_setup.html) · [Solution Methods](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_solution_methods_task_page.html)
- 周期驱动、穿孔壁和动态网格区域来自对应窗口章节。 [Boundary Conditions](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_boundary_conditions_task_page.html) · [Dynamic Mesh Zones](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_dynamic_mesh_task_page.html#flu_ug_Dynamic_Mesh_Zones)
- 新增网格分支以 Watertight 指导流程为基准。 [Capping](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_tasks_capping.html) · [MultiZone Controls](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_multizone_add.html) · [MultiZone Mesh](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/tgd_user_workflow_guided_multizone_generate.html)

TODO 逐项核对当前仍未展开的高级分支。包括组分燃烧表格、Population Balance 边界及报告、自定义关联式、MultiZone 边控制、许可证和算例相关的可用性，以及原版按 Apply 提交选项卡的顺序。教学工作台对示例字段即时联动。网格、流场、传热和声学结果依赖真实 Fluent 算例。

## 物理模型复查

以 Models 任务页现有的 11 个入口为范围，检查子项出现条件、分支切换、参数读回与窗口可达性。

| 模型 | 修正与验证 |
| --- | --- |
| Multiphase | 各模型分别保留体积分数推进和离散设置，Eulerian 的颗粒相标记在 Mixture 下不会隐藏界面面积浓度。Apply 或 OK 校验同相传质、同相体积平衡、Courant 数及斜率限制器。VOF 壁面附着联动到分相对的接触角设置。 |
| Energy、Viscous | 强化壁面处理的压力梯度和热效应各自遵守开关，曲率修正随模型变化，密度基锁定黏性加热。 |
| Radiation、Discrete Phase | S2S 手动与自动聚类显示对应输入，非灰波段校验端点。DPM 粒子辐射跟随 P1、DO，线程数跟随 Workpile，保存的喷射名称可用于轨迹及导出。 |
| Species、Solidification | 开启 EDC 后可进入积分参数。FGM 限于部分预混，Scheil 回扩散分别显示常量值和 UDF。 |
| Heat Exchanger | Raw Data 与 NTU Data 分别打开不同的性能数据窗口，Effectiveness-NTU Relation 归入 Raw Data。两个窗口各演示一个工况点。 |
| Acoustics | Wave Equation 受瞬态及二阶隐式时间格式限制，远场接收器的积分面和接收点跟随 Remote Receivers。 |
| Eulerian Wall Film | Phase Coupling 支持受条件约束的 Eulerian、Mixture 及组分模型分支，子页分开显示 Phase Change 与 Phase Accretion。 |
| Potential / Battery | 电位方程联动材料电导率和壁面电势或电流密度，焦耳热跟随 Energy。电池先选择求解方法，MSMD 再显示电化学子模型及对应的 C-Rate、电流、电压或功率输入。 |

[Models Task Page](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_models_task_page.html) · [Wave Equation](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/section_nqp_jv4_x2b.html) · [Battery Model Options](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_bat_MSMD_sec_use_battery_model.html#flu_bat_MSMD_sec_battery_model_options) · [Electric Potential](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_potential_sec_use.html#flu_ug_potential_sec_options)

## 整站回归复查

- 求解工作台复核模型入口、窗口导航及参数联动。OK 校验当前模型的可用标签页，并跳转至有错误的页签。多相流传质和模型转换逐条核对两相是否独立。教学 TUI 拦截带无效参数的迭代命令。
- Watertight 和 Fault-Tolerant 网格流程均在回归范围内。验证边界层和网格质量输入，变更已确认的边界、区域、边界层或体网格设置会清除相关旧结果。撤销质量改进时保留基础体网格。Meshing 到 Solution 的交接过滤损坏的边界记录。
- 检查 25 个计算器默认示例、单位换算、公式库入口及复制逻辑。留空输入保持为空，温度下限随单位转换，修改输入后清除旧结果。边界层推荐表最多生成 1000 行，等比增长计算器只生成前 20 个预览值。
- 知识库文件包含 10 个模块的 17 条草稿，复核了条目 ID 和搜索字段。检查移动端原生全屏退出失败的回退、无匹配地址及公网入口。

## 模型窗口布局与选项补查

- Viscous 与 Radiation 改为单窗分组。Viscous 校对模型次序、近壁处理、k-ω/RSM 剪切流修正和 LES 动态选项。Radiation 校对角度、聚类、波段、太阳光谱比例及瞬态载荷更新。
- Species Transport 把反应、化学求解器和 EDC 子模型放回主设置区。Composition PDF Transport 的 Lagrangian 选项提供 Control 分支。更多燃烧边界及制表路径待逐项核对。
- Discrete Phase 保留 Tracking、Physical Models、UDF、Numerics 和 Parallel 的页签层级。跟踪步长按流体时态与跟步状态联动。两向湍流耦合、源项线性化及 DDPM 数值选项随前置设置出现。
- Acoustics 分开显示 FW–H、Wave Equation 和 Broadband Noise Sources 的字段。二维 FW–H 可填写沿深度方向的声源相关长度。

[Fluent 2024 R2 Models Task Page](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_models_task_page.html) · [Fluent 2026 R1 Models Task Page](https://ansyshelp.ansys.com/public/Views/Secured/corp/v261/en/flu_ug/flu_ug_models_task_page.html)

## 2026-11-22 逐窗复查

| 范围 | 核验结果 |
| --- | --- |
| Solution 的 175 个已登记弹窗 | 自动逐窗渲染，检查初始可见控件、默认状态可用的各级页签、禁用页签和关闭行为。目录检查追踪普通入口及选项触发的子窗。174 个窗口能沿工作台入口找到，旧版综合 Case/Data 教学窗口由搜索进入。 |
| Solution 的搜索和直达链接 | 从目标字段恢复入口、父窗和目标页签。验证 Swap 中的角度字段、通过 Materials 恢复材料编辑父窗、DPM/DEM 前置开关及关闭子窗后返回。定位不修改模型开关。 |
| 单元区域设置 | 流体区的材料、源项、多孔介质和运动设置随模型或开关显示。固体区的材料常驻，建立参考系、网格运动、固体运动、源项和固定值的独立设置区。测试覆盖源项、运动、返回父窗及多孔参数。 |
| Contours 与 Vectors | 按原版文档重组主要设置。验证云图分段和连续色带、色表、范围校验、网格叠加，以及矢量样式。教学图形继续使用示例数据，Display 提交的设置用于更新图形。 |
| Meshing 的任务面板 | 按工作流逐个打开 13 个 Watertight 和 12 个 Fault-Tolerant 任务面板，包括条件任务。验证提前打开封盖、泄漏和 MultiZone 等任务时的回退，以及应启用条件任务时的面板和操作。 |

本轮逐项读过 Fluid、Solid、Velocity Inlet、Pressure Outlet、Wall、Create/Edit Materials、Contours、Vectors 的 2024 R2 说明。修改范围集中于能确认的窗口分组、进入条件和显示反馈。窗口渲染测试覆盖当前目录，实际模型和许可证变化由重点场景另外验证。

[Cell Zone Conditions](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_cell_zone_conditions_task_page.html) · [Boundary Conditions](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_boundary_conditions_task_page.html) · [Materials](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_materials_task_page.html) · [Ribbon Dialogs](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_ribbon_dialog.html)

TODO 依赖原版算例或许可证的条件仍需实机比对。包括流体区域选相、嵌入式 LES 和 3D Fan 区域设置，固体运动的完整轴与平移选项，Vector Options 和其他高级绘图控件，以及高级边界和材料属性。此前的专业缺口继续以各节记录为准。
