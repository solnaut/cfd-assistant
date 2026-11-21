# Fluent Solver 教学模拟器高保真重构执行方案 (`codex-plan`)

本目录是为后续接手执行的 Codex（或其他开发代理）准备的**完整思路、问题审计、视觉/布局规范、交互/架构设计及分阶段里程碑计划**。

## 1. 核心目标

用户对现有 `/fluent-guide` 页面（`src/fluentMock/`）的定位和期望非常明确：

1. **高度还原 Ansys Fluent Solver 桌面端真实布局与界面样式**：
   - 顶部的 Title Bar / Quick Search + 多标签 Ribbon（与真实 Fluent Tab 与分组顺序一致）；
   - 下方从左到右按真实 Fluent Solver 区域排布：**Outline View（案例功能树） → Task Page（任务页面） → Center-Right Workspace（上方多标签 Graphics/Plots 图形视口 + 正下方 Console/TUI 控制台）**；
   - 整体采用紧凑桌面 CAE/Qt 工程风格（直角/微圆角 2px–4px、1px 细边框、紧凑字号、经典浅灰窗体与渐变窗格标题栏、蓝-白渐变 3D 视口与 RGB 坐标轴），消除“网页卡片/按钮墙/macOS 三点”感。
2. **高度还原 Fluent 真实点击操作与跨模块联动**：
   - 控件不再是扁平按钮墙，而是真正的桌面控件：`GroupBox`、`RadioButton`、`CheckBox`、`ComboBox/Select`、带单位数值框、`ListBox`、多标签弹窗（`Tabs`）；
   - 多级可折叠 Outline 树支持单击切换、双击打开设置/弹窗、右键上下文菜单；
   - 支持可拖拽、可多级层叠的模拟弹窗（`OK` / `Apply` / `Cancel`、`Esc` 关闭）；
   - 轻量级纯前端仿真状态机联动（如 Steady ↔ Transient、Energy On/Off、Viscous 模型切换、Materials 新增联动 Cell Zone、Initialize 后才能 Calculate、Run Calculation 输出真实感 Console 日志并绘制示意残差曲线）。
3. **旁边始终有结构化的中文教学解释与工程联动**：
   - 在 Solver 桌面视口最右侧停靠独立的 **Control Guide / Teaching Inspector（教学解释面板）**；
   - 点击、聚焦或切换任意控件/下拉选项时，右侧面板同步解释“是什么 / 工程建议 / 适用场景 / 设置前检查要点 / 常见误区”，并提供**可点击跳转的相关控件**以及**站内 CFD 参数计算器直达链接**（如 `y+`、`CFL`、`Reynolds`、边界层网格计算器）。

---

## 2. 当前进展快照

- ✅ **已完成**：
  - **Milestone 1–4 & Milestone 7（含局部 Milestone 5/6）**：
    - 全屏 Fluent 桌面工作台骨架、银灰+经典桌面蓝样式、自主几何 SVG 图标、[fluentLanguage.ts](../src/fluentMock/fluentLanguage.ts)（`en / both / zh`）、可用顶部 `QuickSearch`；
    - 真实桌面控件（`radio`、`checkbox`、`select`、`textbox`、`button`）、多级可展开 Outline 树（含状态回显与边界高亮联动）、可拖拽多级层叠弹窗栈（`OK / Apply / Cancel / Esc`）及多 Tab 边界窗；
    - 纯前端仿真状态机 [fluentSimState.ts](../src/fluentMock/state/fluentSimState.ts) 与 8 条跨模块联动、6 标签 MDI 视口（Mesh / Geometry / Contours+Colorbar / Vectors / Scaled Residuals / XY Plot）、交互式 Console + TUI 命令引擎 [fluentTuiCommands.ts](../src/fluentMock/state/fluentTuiCommands.ts)；
    - 选项级对比提示、计算器直达链接、10 步入门引导与 5 类常见报错排查；
    - Windows 启动脚本加固（[open-workbench.ps1](../scripts/open-workbench.ps1) 根路径健康检查、`-Target` / `-Preview` / `-Stop` 与 [停止 CFD Assistant.cmd](../%E5%81%9C%E6%AD%A2%20CFD%20Assistant.cmd)）。
- ⏳ **待继续推进**：
  - **Milestone 5–6 收口**：将 [fluentExplanations.ts](../src/fluentMock/fluentExplanations.ts) 剩余低频控件的通用模板替换为专属深度解释、补全窄屏交互细节与全套 [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) / [docs/ROADMAP.md](../docs/ROADMAP.md) 文档更新；
  - **Milestone 8–10（全站计算器与效率功能）**：常用工质物性快捷填入、计算器/公式库全局搜索与公式直达、工程单位速查换算器、湍流入口边界估算器、水力直径/边界层反算/Mach 理想气体扩展、跨计算器参数带入与本地计算历史导出。

---

## 3. 后续 Codex 必读顺序与执行协议

> 接手本任务的 Codex 请严格按以下顺序阅读与执行：

1. **先读根目录规则**：[AGENTS.md](../AGENTS.md)（了解目录权限、安全约束、专业内容约束、代码分层与 Windows `npm.cmd` 命令要求）。
2. **按顺序通读本目录 5 份设计文档**：
   - [01-current-audit.md](./01-current-audit.md)：旧版问题审计（含精确文件路径与行号定位）。
   - [02-visual-and-layout-spec.md](./02-visual-and-layout-spec.md)：Fluent 桌面视觉系统、设计 Token、5 大区域精确布局、语言切换与图形视口规范。
   - [03-interaction-and-architecture.md](./03-interaction-and-architecture.md)：桌面控件库、可拖拽层叠弹窗栈、纯前端仿真状态机与 8 条核心联动规则、模块化目录结构、解释质量与测试规范。
   - [04-roadmap-and-acceptance.md](./04-roadmap-and-acceptance.md)：Milestone 1–10 完整路线图、验收标准、质量门禁与可直接复制使用的 Codex 启动指令。
   - [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md)：基于 `c7d4d80`/`50bfff7` 现状的启动器加固方案、Fluent 工作台深度交互升级与全站 6 项新增实用功能规范。
3. **严格按 Milestone 顺序分步推进（当前从 Milestone 2 开始，或按用户指定的 Milestone 执行）**：
   - 禁止一次性大爆炸重写全部文件；每个 Milestone 完成后必须运行完整检查：
     ```powershell
     npm.cmd run lint
     npm.cmd run test
     npm.cmd run build
     ```
   - 并在真实浏览器中检查交互与控制台无报错后，按 Milestone 提交清晰的本地 `git commit`。
   - **未经用户明确要求，不要执行 `git push` 或任何远程部署操作**（遵守仓库现有约定）。

---

## 4. 合规性与 `AGENTS.md` 边界对齐说明

用户在满足“界面样式、位置、点击操作等高度还原，旁边有解释”的同时，**必须继续严格遵守 [AGENTS.md](../AGENTS.md)** 中的专业内容与版权/品牌红线：

| 边界项 | 必须遵守的做法（允许） | 严格禁止的做法（红线） |
| --- | --- | --- |
| **品牌与 Logo** | 使用纯文字标题如 `Fluent Solver Simulator [3d, dp, pbns, sstkw]`，使用自主几何图标 | 使用 Ansys / Fluent 官方 Logo、商标图像或启动图 |
| **图标与界面资源** | 100% 自主编写的轻量几何 SVG 图标（[FluentIcons.tsx](../src/fluentMock/)）与自主 CSS 桌面 Token | 抓取/复制/嵌入 Ansys 官方软件截图、官方 `.png`/`.svg` 图标包或图标雪碧图 |
| **界面样式与布局** | 用自主 HTML/CSS 还原 Windows/Qt CAE 桌面工程软件通用的高密度排版、面板位置、树形结构、弹窗逻辑与 Fluent 常用英文术语 | 任何形式的逆向工程或拷贝官方二进制/样式资源 |
| **帮助文档与专业内容** | 使用准确、简洁、结构化的**原创中文教学解释**，并在内部索引文件 [fluentResearchIndex.ts](../src/fluentMock/fluentResearchIndex.ts) 记录权威来源；不确定的关联式或工程结论保留在研究记录或加注前提条件 | 大段复制 Ansys 官方 Help 文档原文；把“不运行真实求解的演示结果”伪装成真实数值计算结果 |
| **运行边界** | 纯前端教学模拟器，所有检查/初始化/残差曲线均明确标注为“教学示例状态反馈” | 连接本地 Fluent、后端 API、或声称执行了真实 CFD 求解 |

> **文档同步提醒**：现有 [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) 第 65–74 行曾写有“简化占位图标”和“不逐像素复制官方视觉设计”。请在 **Milestone 6** 收口时同步更新 `docs/ARCHITECTURE.md` 中“Fluent Solver 教学模拟器”章节，将其修正为“基于自主 HTML/CSS 设计 Token 与自主几何 SVG 图标的高保真桌面工程界面教学复刻（继续严格不使用官方 Logo、截图、官方图标文件及大段文档拷贝）”。

---

## 5. 目录文件索引

| 文件 | 内容定位 |
| --- | --- |
| [README.md](./README.md) | 总入口：核心目标、当前进度快照、执行协议、合规边界说明与文档索引 |
| [01-current-audit.md](./01-current-audit.md) | 现状审计：从代码结构、布局、控件、交互、视觉、术语、解释质量 8 个维度剖析旧版不足 |
| [02-visual-and-layout-spec.md](./02-visual-and-layout-spec.md) | 视觉与布局规范：设计 Token、页面全屏集成、Ribbon/Outline/Task Page/Viewport+Console/Inspector 五区规格 |
| [03-interaction-and-architecture.md](./03-interaction-and-architecture.md) | 交互与架构设计：桌面控件 Kit、弹窗栈管理、8 条跨模块联动规则、重构后目录树与测试门禁 |
| [04-roadmap-and-acceptance.md](./04-roadmap-and-acceptance.md) | 实施路线图：Milestone 1–10 完整任务拆解、验收门禁与可直接复制使用的 Codex 启动指令 |
| [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md) | 进一步提升方案：一键启动器加固、Fluent 工作台深度交互升级与全站 6 项新增实用功能详细规格 |
