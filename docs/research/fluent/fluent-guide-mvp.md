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

## 后续待办

- 为每个 Fluent 条目拆分独立研究记录。
- 为每个控件补充更精确的版本、章节和截图替代草图说明。
- 增加多相流、辐射、燃烧、动网格等后续模块。
- 将知识库字段升级为更适合大规模维护的分文件结构。
- 继续补充公开可访问来源的章节级定位，逐步从 draft 内容推进到 reviewed 内容。
