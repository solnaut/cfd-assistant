# Changelog

## Unreleased

- 正式在 GitHub 公开开源（`solnaut/cfd-assistant`，MIT License），上线 GitHub Pages 在线站点（`https://solnaut.github.io/cfd-assistant/`），支持子路径部署与深链接 SPA 回退。
- 重写开源 `README.md`，补充完整功能矩阵、界面截图（由 `scripts/capture-screenshots.mjs` 自动采集）、快速开始、目录架构、自动更新与部署说明（含 GitHub Actions 自动部署工作流模板 `docs/github-actions-pages.yml.example` 与一键部署脚本 `scripts/deploy-gh-pages.mjs`）。
- 新增功能选择式首页、Fluent Launcher 交互配置器及独立启动页（`/fluent-launcher`）、Fluent Meshing 网格工作台（`/fluent-meshing`，覆盖 Watertight / Fault-Tolerant / Multizone 工作流并支持流转到 Solution）。
- 新增“热流体工程图解”（`/knowledge`，4 门能源动力核心课程、36 节专题、知识框架图谱、刷题自测与本地进度/收藏）、“热工交互实验室”（`/thermal-lab`，布雷顿循环、R134a 压焓图、换热器 LMTD/ε-NTU）、“CFD 实战向导”（`/cfd-practice`）、“工程单位换算器”（`/unit-converter`）及全站检索（`Ctrl+K`）。
- 新增 `Fluent 入口湍流参数换算` 与 `三网格收敛指数 GCI` 正式计算器及对应研究记录；新增 Windows Cloudflare Quick Tunnel 一键公网分享脚本（`公开分享 CFD Assistant.cmd`）。
- 继续扩展 Fluent Solver 教学模拟器：新增 Case/Data 文件、General Solver、Operating Conditions、Create/Edit Materials、Mass-Flow Inlet、Symmetry、Outflow、Patch、Automatic Saving、Display Options 等常用窗口和控件说明。
- Fluent 模拟窗口内部按钮支持继续打开下一层教学窗口，例如 Materials 主页面中的 Create/Edit 可以打开材料创建/编辑窗口并解释 Density Method 等物性选项。
- 升级 Fluent Solver 教学模拟器右侧说明面板，改为“是什么 / 建议 / 适用场景 / 检查要点 / 常见误区”的操作建议型结构，去除面向用户的“后续补充”式说明。
- 扩展 Fluent Solver 教学模拟器数据，新增 Cell Zone Conditions、Reference Values、Report Definitions、Surface Integrals、Plane Surface、XY Plot 等常用单相流动与传热工作流弹窗和窗口内控件。
- 新增 Fluent Solver 主界面教学模拟器：按 Ribbon、案例视图/Outline、任务页面、User Window 图形窗口、图形工具栏、底部控制台和右侧解释面板搭建自主 HTML/CSS 可点击界面，不使用官方 Logo、截图或图标资源。
- 新增 `src/fluentMock` 数据结构，拆分 Fluent 模拟器的控件、任务页、弹窗、解释内容、研究来源索引和 React 渲染组件；说明面板由控件 `explanationId` 驱动。
- Fluent 模拟器初版覆盖 General、Mesh、Models、Materials、Boundary Conditions、Solution Methods、Solution Controls、Initialization、Run Calculation、Residual Monitors、Contours、Vectors、Reports 等页面或弹窗入口。
- 为 Fluent 模拟器补充页面交互测试和数据完整性测试，覆盖主界面渲染、树节点点击、Ribbon 点击、弹窗打开/关闭、弹窗控件解释、控件 ID 去重和说明数据覆盖。
- 新增 `docs/review/PARAMETERS_AND_FORMULAS_REVIEW.md`，导出当前参数计算与 CFD 公式库的完整 Markdown 审核文档，包含 y+ 详细分支、输入输出、公式、流程、测试样例、风险项、公式总表和来源附录。
- 更新 Fluent 研究记录，补充 2026-06-22 的模拟器初版覆盖范围和公开来源索引。
- 完善 `y+ 与第一层网格高度` 计算器：初始估算模式新增平板外流公式选择和管道内流工况，支持湍流平板局部 `Cf,x = 0.0592/Re_x^(1/5)`、层流平板局部 `Cf,x = 0.664/√Re_x`、用户自定义 Cf、管道层流 Darcy `f = 64/Re_D`、光滑管 Blasius Darcy `f = 0.3164/Re_D^(1/4)`、用户自定义 Darcy f 和用户自定义 Fanning Cf。
- 在 y+ 结果后新增“边界层网格推荐方案”，直接使用推荐第一层完整厚度 h1，支持自动总厚度、指定目标总厚度 H、指定层数 n，并输出层高表、累计厚度、Hn/D、表格复制、CSV 复制和简要方案复制。
- 平板外流自动总厚度推荐使用层流 `δ = 5x/√Re_x` 或湍流 `δ = 0.37x/Re_x^(1/5)`；管道内流默认使用工程预设 `r=1.2, n=15`，不套用平板边界层厚度公式。
- 更新 y+ 研究记录，补充 Darcy/Fanning 区分、适用范围提示、管道内流 Blasius 来源、边界层网格反算公式和新增验证案例。
- 扩展 y+ 测试，覆盖平板湍流、平板层流、平板自定义 Cf、管道层流 Darcy、管道 Blasius、用户 Darcy/Fanning、已知 τw、已知 Cf、H 反算、固定层数、`r=1`、非法输入、单位换算和复制格式。
- 将 y+ 与第一层网格高度重构为三种模式：默认“初始估算：根据速度和特征长度”、已知壁面剪切应力修正计算、已知壁面摩擦系数 Cf 自定义计算；公式区同步拆分为公共公式和当前模式公式。
- 将 y+ 页面和元数据中的旧摩擦系数译法调整为“壁面摩擦系数 Cf”，并补充三种模式的计算测试、单位换算测试、输入切换测试和 LaTeX 复制测试。
- 重做 CFD 公式库为简洁公式总览页，按类别显示公式名称、所属分类、KaTeX 公式、符号含义和复制 LaTeX。
- 将 y+ 公式库条目拆分为 y+ 定义、摩擦速度、运动黏度、壁面剪切与摩擦系数、中心距离反推和完整厚度近似。
- 统一公式库与计算器详情页的公式读取方式，新增共享公式条目 helper，避免公式库另写一份硬编码公式。
- 将计算器详情页变量说明改为“符号 / 名称 / 单位 / 含义”表格，继续隐藏公开页面来源链接。
- 增强变量符号格式化，普通文本显示 `τw`、`uτ`、`Cf`、`Δx`、`Δt` 等，不显示 LaTeX 反斜杠形式。
- 新增 `docs/GOAL_PARAMETERS.md`，明确参数计算模块专项完善任务、验收标准和本阶段不扩展 Fluent 的边界。
- 新增 CFD 公式库页面，按分类集中展示当前正式计算器使用的公式、变量说明和可复制 LaTeX。
- 修正参数计算页面的变量符号和单位显示，普通变量显示 `μ`、`ρ`、`α`、`Pa·s`、`kg/m³`、`m²/s`、`W/(m·K)` 等用户可读格式。
- 隐藏公开界面的来源链接列表，来源、访问日期和验证依据继续保存在内部研究记录和元数据中。
- 将 y+ 与第一层网格高度开放为近壁面计算器，输出 Reynolds 数、壁面摩擦系数、壁面剪切应力、摩擦速度、第一层中心距离和完整第一层厚度。
- 新增正式计算器：总时间步数量、旋转机械基础时间步长、Nusselt 数基础形式、管内平均流速、体积流量与质量流量换算、层流管道沿程压降、热通量、热阻、对流换热、导热、温升估算。
- 为新增正式计算器补充 `docs/research/calculators` 内部研究记录，并增加测试约束确保所有公开计算器都有对应研究记录。
- 扩展计算器测试，覆盖新增计算器、单位换算、非法输入、公式元数据、变量显示和公式库页面渲染。
- 增加 CFD Assistant v0.3 实施任务书和当前状态审计。
- 重做首页主视觉，用工程工作台表达参数计算、公式结果和 Fluent 导览。
- 新增理想气体声速计算器。
- 将管道压降升级为基于 Darcy-Weisbach 形式的正式计算器，要求用户输入 Darcy 摩阻因子。
- 扩展 Fluent 导览知识库结构，支持模拟窗口和窗口内部控件继续点击解释。
- 增加 CFD Assistant v0.2 实施任务书。
- 完成首页、参数计算模块和 Fluent 导览的产品化 UI 架构改版。
- 将参数计算模块重构为“分类首页 -> 分类详情 -> 计算器详情”的三级结构。
- 新增计算器分类、列表和详情页组件。
- 清理公开页面中的开发过程说明、内部 TODO 和审核状态展示。
- 新增研究记录目录和计算器、Fluent 来源记录模板。
- 更新产品说明和路线图，明确最终产品需要支持真实计算、公式展示、Fluent 常用操作解释和无乱码体验。
- 新增 KaTeX 公式渲染。
- 实现首批来源明确的计算器：Reynolds、Mach、Prandtl、Peclet、Grashof、Rayleigh、Fourier、Biot、水力直径、CFL 时间步长、边界层网格等比增长。
- 为首批计算器增加单位换算、输入校验、结果展示、中间结果、来源、复制结果和计算测试。
- 将 Fluent 导览升级为知识库 ID 驱动的教学界面，增加搜索、可点击控件、模拟对话框、关联功能和关联计算器跳转。
- 扩展 Fluent demo 知识库到 General、Models、Materials、Cell Zone Conditions、Boundary Conditions、Solution Methods、Initialization、Monitors、Run Calculation 和 Results。

## 0.1.0 - 2026-06-18

- 初始化 CFD Assistant 项目。
- 创建 React、TypeScript、Vite、React Router、Vitest 和 PWA 基础配置。
- 建立首页、参数计算页和 Fluent 功能导览页。
- 建立本地知识库 JSON 演示条目和知识条目模板。
- 建立计算器定义模板、单位换算模块和基础测试。
- 编写产品说明、路线图、架构、决策、部署和内容维护文档。
