# Roadmap

## Phase 0 - Project Foundation

状态：已完成初始版本。

- 创建 React + TypeScript + Vite 项目。
- 建立文档、代码分层、知识库模板和计算器模板。
- 配置 lint、test、build 和 PWA 基础能力。
- 完成初始 Git 提交。

## Phase 1 - Calculator Framework

- 状态：参数计算专项完善中；已建立公式库、符号/单位显示策略、研究记录测试约束，并扩展一批基础正式计算器。
- 完成 v0.2 UI 与参数计算三级信息架构。
- 建立 `docs/research/calculators` 和 `docs/research/fluent` 研究记录模板。
- 优先确认 Reynolds、Mach、Prandtl、Peclet、Grashof、Rayleigh、Fourier、Biot、水力直径、CFL 与边界层网格等比增长的公式、输入、输出、单位和验证案例。
- 建立通用计算器表单组件。
- 建立输入校验、单位选择、结果复制和示例数据机制。
- 为正式发布的每个计算器编写正常案例、单位换算案例、边界案例、非法输入案例和来源验证案例。
- 已新增：理想气体声速、Darcy-Weisbach 基础管道压降、总时间步数量、旋转机械基础时间步长、Nusselt 数基础形式、管内平均流速、质量流量换算、层流管道沿程压降、热通量、热阻、对流换热、导热、温升估算。
- y+ 当前公开三种明确分支：平板外流初始估算、已知壁面剪切应力、已知壁面摩擦系数 Cf；管内自动摩阻分支继续保留内部研究，不作为通用公式公开。
- 下一步候选：边界层网格反算、水力直径快捷几何、更多复制格式测试和页面级交互测试。

## Phase 2 - Fluent Guide MVP

- 状态：v0.2 已完成 MVP，v0.3 已建立模拟窗口和窗口内部控件解释的数据结构，后续继续扩展内容深度。
- 确认知识条目字段是否足够。
- 建立由知识库 ID 驱动的高保真教学模拟界面，不使用官方 Logo、截图或图标。
- 第一阶段覆盖 General、Models、Materials、Cell Zone Conditions、Boundary Conditions、Solution Methods、Initialization、Monitors、Run Calculation 和 Results 中的常用单相流动与传热功能。
- 已扩展 Fluent Solver 教学模拟器右侧说明面板和常用工作流弹窗，覆盖 Cell Zone Conditions、Reference Values、Report Definitions、Surface Integrals、Plane Surface、XY Plot 等可点击路径。
- 增加搜索、关联功能跳转、关联计算器跳转和内容版本展示。
- 优化手机端详情阅读体验。

## Phase 2.5 - v0.3 Publish-Ready Local Iteration

- 重做首页主视觉，使其表达 CFD 计算、公式结果和 Fluent 教学导览。
- 审计已公开计算器的公式、LaTeX、实现函数、测试和研究记录一致性。
- 扩展一批来源明确的新计算器或正式分支。
- 升级 Fluent 导览为更接近真实操作逻辑的高保真教学模拟界面。
- 保持本地 Git 提交，不推送 GitHub，不部署 Cloudflare。

## Phase 3 - Static Deployment

- 创建 GitHub 仓库。
- 配置 Cloudflare Pages 构建命令和输出目录。
- 增加部署文档和回滚流程。

## Phase 4 - Growth

- 增加更多计算器和验证数据。
- 扩充 Fluent 导览知识库，逐步覆盖大部分常用界面选项、按钮、下拉项、复选框和模拟对话框选项。
- 评估 Capacitor 封装 Android 的改造成本。

## Cross-Phase Quality Gates

- 公开页面不得显示 TODO、内部审核状态或开发过程说明。
- 公开页面不显示内部来源链接；来源、访问日期和审核状态保存在研究记录中。
- 中文、英文、公式符号和单位不得乱码。
- 普通变量符号不得显示 LaTeX 反斜杠形式；公式区域必须由 KaTeX 渲染并保留原始 LaTeX。
- 每个稳定阶段运行 `npm.cmd run lint`、`npm.cmd run test`、`npm.cmd run build`。
- 通过浏览器检查首页、参数计算分类页、分类详情页、计算器详情页、CFD 公式库和 Fluent 导览页。
