# Fluent 导览 MVP 研究记录

## 基本信息

- 研究主题：Fluent 功能导览 MVP
- 覆盖版本：v0.2 draft
- 创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 审核状态：internal-draft
- 是否允许公开展示：是，限于高层级教学说明和界面导航结构

## 当前实现范围

第一阶段覆盖常用单相流动和传热工作流中的以下模块：

- General
- Models
- Materials
- Cell Zone Conditions
- Boundary Conditions
- Solution Methods
- Initialization
- Monitors
- Run Calculation
- Results

本阶段不覆盖多相流、燃烧、辐射、动网格、复杂化学反应和高级 UDF 工作流。

## v0.3 交互结构更新

v0.3 将 Fluent 导览从只显示主面板控件扩展为数据驱动的模拟窗口结构。知识库控件可通过 `dialog.controls` 描述窗口标题、窗口说明和窗口内部控件。页面组件只负责读取数据、渲染按钮并在右侧说明面板切换当前控件解释。

当前已补充模拟窗口的教学路径包括：

- Cell Zone Conditions -> Fluid Zone -> Source Terms。
- Boundary Conditions -> Velocity Inlet -> Turbulence。
- Boundary Conditions -> Pressure Outlet -> Backflow Conditions。
- Boundary Conditions -> Wall -> Roughness。
- Solution Methods -> SIMPLE -> Under-Relaxation Factors。
- Initialization -> Hybrid Initialization -> Initialize。
- Run Calculation -> Calculate。
- Results -> Contours -> Surfaces。

其中 Velocity Inlet -> Turbulence 已满足完整路径：功能树 -> 设置页 -> 点击控件 -> 右侧解释 -> 打开模拟窗口 -> 点击窗口控件 -> 显示窗口控件解释。

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构 | 章节或范围 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F1 | 官方用户指南 | Fluent User's Guide | Ansys | General workflow, boundary conditions, solve workflow | https://ansyshelp.ansys.com/public/account/secured?returnurl=%2FViews%2FSecured%2Fcorp%2Fv252%2Fen%2Fflu_ug%2Fflu_ug.html | 2026-06-18 | 模块路径、术语和工作流核对 |
| F2 | 官方理论指南 | Fluent Theory Guide | Ansys | Conservation equations, turbulence and solution methods | https://ansyshelp.ansys.com/public/Views/Secured/corp/v261/en/pdf/Ansys_Fluent_Theory_Guide.pdf | 2026-06-18 | Energy、Viscous、SIMPLE/Coupled 概念核对 |
| F3 | 官方用户指南 | Boundary Conditions | Ansys | Boundary condition task pages | https://ansyshelp.ansys.com/public/account/secured?returnurl=%2FViews%2FSecured%2Fcorp%2Fv242%2Fen%2Fflu_ug%2Fflu_ug_bcs_sec_bound_cond.html | 2026-06-18 | Velocity Inlet、Pressure Outlet、Wall 结构核对 |
| F4 | 官方用户指南 | Performing Time-Dependent Calculations | Ansys | Time step and run calculation workflow | https://ansyshelp.ansys.com/public/account/secured?returnurl=%2FViews%2FSecured%2Fcorp%2Fv242%2Fen%2Fflu_ug%2Fflu_ug_sec_solve_calc_time.html%3Futm_source | 2026-06-18 | Time 与 Run Calculation 概念核对 |

## 合规记录

- 未使用 Ansys 或 Fluent 官方 Logo。
- 未使用官方截图。
- 未复制官方图标。
- 未逐像素复刻官方界面。
- 页面使用自主设计的教学模拟界面。
- 用户可见文字使用自己的语言概括。
- 不展示内部 TODO、审核状态或开发过程说明。

## 当前限制

- 说明内容为 v0.2 草案，不等同于完整 Fluent 官方培训材料。
- 选项覆盖仍是高频入口，不包含每个高级模型的全部子选项。
- 部分来源链接可能要求用户具备 Ansys 帮助站访问权限；后续需要补充更多公开可访问的官方教程、大学课程或验证案例。

## 2026-06-22 Fluent Solver 主界面模拟器更新

本次将 `/fluent-guide` 的主要展示升级为 Fluent Solver 主界面教学模拟器。模拟器使用用户提供的 Fluent 求解器主界面截图作为空间布局参考，但没有嵌入、裁切或复用官方截图，也没有使用 Ansys/Fluent 官方 Logo 或图标资源。

### 当前模拟区域

- 顶部 Ribbon 菜单和工具分组。
- 左侧案例视图 / Outline 功能树。
- 中间任务页面，默认 General / 一般。
- 右侧 User Window 1 图形窗口。
- 图形窗口左右工具栏和选择过滤入口。
- 底部控制台。
- 右侧控件说明面板。

### 当前初版页面和弹窗

- General：Solver Type、Velocity Formulation、Time、Gravity。
- Mesh：Check、Scale、Report Quality、Display、Units。
- Models：Energy、Viscous。
- Materials：Materials 主页面、Fluid material、Solid material。
- Boundary Conditions：Velocity Inlet、Pressure Outlet、Wall。
- Solution：Methods、Controls、Initialization、Run Calculation、Residual Monitors。
- Results：Contours、Vectors、Reports。
- 其他树节点提供自然教学占位说明，用于后续按截图继续细化。

### 数据结构

模拟器数据集中在 `src/fluentMock/`：

- `fluentControls.ts`：Ribbon、功能树、任务页、图形窗口和控制台控件。
- `fluentDialogs.ts`：模拟弹窗和弹窗内部控件。
- `fluentExplanations.ts`：控件解释数据。
- `fluentResearchIndex.ts`：公开来源索引。
- `FluentSolverMock.tsx`：渲染、点击状态和弹窗交互。

控件解释通过 `control.explanationId` 查询，不在页面组件中硬编码专业解释。

### 2026-06-22 新增来源

| 来源 ID | 来源类型 | 标题 | 机构 | 章节或范围 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F5 | 官方用户指南 | Determining Mesh Statistics and Quality | Ansys | 6.3 Determining Mesh Statistics and Quality | https://ansyshelp.ansys.com/public/Views/Secured/corp/v252/en/flu_ug/tgd_user_report.html | 2026-06-22 | Mesh Check、Report Quality、网格质量指标说明核对 |
| F6 | 官方用户指南 | Solution Methods Task Page | Ansys | 51.12 Solution Methods Task Page | https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/flu_ug/flu_ug_solution_methods_task_page.html | 2026-06-22 | Solution Methods、Pressure-Velocity Coupling 结构核对 |
| F7 | 官方文档 | Post-processing Results | Ansys | 37.11 Post-processing Results | https://ansyshelp.ansys.com/public/Views/Secured/corp/v252/en/fluent_beta_doc/flu_beta_post_analysis_postprocessing.html | 2026-06-22 | Contours、Vectors、Reports、Graphics Objects 结构核对 |
| F8 | 官方教程 | Fluid Flow and Heat Transfer in a Mixing Elbow | Ansys | Solution setup and Run Calculation tutorial steps | https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_tg_workbench/flu_tg_elbow_workbench.html | 2026-06-22 | Initialization、Run Calculation、Monitors 工作流核对 |

## 2026-06-22 操作建议型说明面板与常用工作流弹窗扩展

本次迭代继续推进 Fluent Solver 教学模拟器，但仍保持第三方自主教学界面的产品边界：不连接 Fluent、不执行求解、不复用官方 Logo、截图或官方图标。页面交互结构参考真实 Fluent 的学习逻辑和公开文档中的功能层级，用自定义 HTML/CSS 与数据驱动控件表达。

### 说明面板结构

右侧控件说明面板从单段解释升级为面向操作检查的结构：

- 是什么：说明控件在工作流中的角色。
- 建议：给出初学者在该位置应如何使用或优先检查。
- 适用场景：说明何时需要关注该控件。
- 检查要点：列出执行设置前后的核对项。
- 常见误区：提示不要把默认值、窗口入口或显示操作误解为完整设置。
- 相关功能：显示相关控件的中文名称，便于跳转理解。

### 新增模拟弹窗和窗口内控件

新增或细化的教学弹窗包括：

- Cell Zone Conditions：Fluid Zone、Solid Zone、Source Terms。
- Reference Values：Compute From、Area、Length、Density、Velocity。
- Report Definitions：Force Report、Surface Report。
- Results：Surface Integrals、Plane Surface、XY Plot。

这些弹窗内部控件均通过 `explanationId` 读取解释数据，页面组件不硬编码专业解释。

### 结构来源和限制

本次结构参考了公开 Ansys Fluent 用户指南中的常见任务页层级，也结合本机 PyFluent 对 Fluent 设置树的可读层级探针结果进行模块范围核对。由于当前 Codex 会话尚未暴露已配置的 Fluent MCP 工具，实时 GUI 点击、截图和 live session 工具调用仍不能作为本次自动采集来源。后续需要在新的 Codex 会话中确认 MCP 工具可见后，再补充 `child_names`、`command_names` 和 `allowed_values` 的结构化采集记录。

## 后续待办

- 为每个 Fluent 条目拆分独立研究记录。
- 为每个控件补充更精确的版本、章节和截图替代草图说明。
- 增加多相流、辐射、燃烧、动网格等后续模块。
- 将知识库字段升级为更适合大规模维护的分文件结构。
- 继续补充公开可访问来源的章节级定位，逐步从 draft 内容推进到 reviewed 内容。
