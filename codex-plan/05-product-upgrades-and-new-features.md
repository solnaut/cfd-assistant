# 05 - 项目进一步提升方案与实用新功能规划

本文档在已完成 **Milestone 1（`c7d4d80`：桌面壳体、SVG 图标、语言切换、QuickSearch 与弯管视口）** 以及 **Windows 一键启动器（`50bfff7`）** 的基础上，提供面向后续 Codex 执行的**三层系统化提升方案**：

1. **一键启动脚本（`启动 CFD Assistant.cmd` / `scripts/open-workbench.ps1`）加固与体验升级**
2. **Fluent Solver 教学工作台（`/fluent-guide`）深度交互与仿真联动升级（承接 Milestone 2–6）**
3. **CFD Assistant 全站 6 项实用工程新功能（计算器、物性库、单位换算、公式联动与故障排查）**

---

## 第一部分：一键启动器加固与体验升级

当前仓库已新增 [启动 CFD Assistant.cmd](../启动%20CFD%20Assistant.cmd) 与 [scripts/open-workbench.ps1](../scripts/open-workbench.ps1)，可双击启动 Vite 并打开 `/fluent-guide`。但代码审查发现 3 个隐患与可提升点：

### 1.1 修复脆弱的端口健康检查（关键修复）
- **现状问题**：[scripts/open-workbench.ps1](../scripts/open-workbench.ps1#L6-L14) 中的 `Test-Workbench` 请求 `http://127.0.0.1:$Port/src/fluentMock/FluentSolverMock.tsx` 并检查字符串 `'Fluent Solver Workbench'`。一旦后续 `FluentSolverMock.tsx` 把标题或组件拆分重构，或者切换为 `vite preview` 静态预览模式，该健康检查就会永久失败。
- **改进方案**：
  - 将探活地址改为根路径 `http://127.0.0.1:$Port/`（或 `/index.html`）；
  - 校验 HTTP 200 且响应包含 `<title>CFD Assistant</title>`（来自 [index.html](../index.html)）；
  - 若 `dist/index.html` 存在且传入 `-Preview` 参数，可支持直接拉起 `vite preview`，日常开发仍默认 `vite`。

### 1.2 增加依赖自动检查、入口选择与一键停止能力
- **缺失依赖自动恢复**：当前检测到缺失 `node_modules/vite/bin/vite.js` 时直接抛错退出；改为提示并询问/自动执行 `npm.cmd install`（或打印清晰指引后不闪退）。
- **多目标路由启动参数**：在 `scripts/open-workbench.ps1` 增加 `-Target` 参数（支持 `fluent-guide` [默认]、`home`、`calculators`、`formulas`），避免硬编码单一路径。
- **后台进程管理与一键停止**：由于启动器以 `WindowStyle = 'Hidden'` 启动 Node/Vite，普通用户关闭浏览器后后台进程仍在监听 5173/5174。增加 `-Stop` 开关（以及可选的 `停止 CFD Assistant.cmd`），仅安全清理命令行包含本仓库路径 `cfd-assistant` 且在运行的 Vite 进程，不误杀用户其他 Node 项目。

---

## 第二部分：Fluent Solver 教学工作台深度升级（承接 Milestone 2–6）

### 2.1 对 `c7d4d80` 现状的精准定位
`c7d4d80` 已经漂亮地完成了 **Milestone 1** 的外框基建：
- 移除了网页外壳与 macOS 三点，在 [App.tsx](../src/App.tsx#L11) 对 `/fluent-guide` 启用了全屏无网页页头模式；
- 建立了 [FluentIcons.tsx](../src/fluentMock/FluentIcons.tsx)、[fluentLanguage.ts](../src/fluentMock/fluentLanguage.ts)（默认英文 + 双语 + 中文）、`styles/fluentTokens.css` / `styles/fluentWorkspace.css`、可用 `QuickSearch` 以及带 90° 弯管网格/几何切换的 [FluentViewport.tsx](../src/fluentMock/FluentViewport.tsx)。

但从真实操作还原度来看，**当前仍只是“外观重构完成，内部交互还是空壳按钮”**：
1. [FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L390-L404) 中的 `ControlRow` 仍然把 `radio`、`checkbox`、`select`、`field` 全渲染成同一类 `<button>`，无法勾选、输入或下拉改值；
2. 第 290 行 `Console` 仍然只有一行静态文字 `Ready to explore the example case.`；
3. 第 230–256 行 `Outline` 树只有 1 层，不能展开 `Models -> Energy / Viscous`、`Materials -> Fluid -> air`、`Boundary Conditions -> velocity-inlet / wall`；
4. 弹窗栈不支持标题栏拖拽，且无 `OK / Apply / Cancel` 状态提交逻辑；
5. `FluentViewport.tsx` 只有 `Mesh` 与 `Geometry` 两个标签，没有 `Contours`、`Vectors`、`Scaled Residuals` 与 `XY Plot`，也没有点击边界高亮对应边面的联动；
6. 尚无状态机（`FluentSimState`）驱动的跨模块联动，右侧说明也尚无“直达本站计算器”按钮。

### 2.2 必须补齐的高还原核心体验（对应 Milestone 2–6 + 新增排查抽屉）
1. **桌面真控件 + 8 条跨模块联动**：完整落地 [03-interaction-and-architecture.md](./03-interaction-and-architecture.md) 中的真实控件库（`GroupBox`、`RadioGroup`、`Checkbox`、`Select`、`NumberInput`、`ListBox`、`Tabs`）、多级可折叠 Outline 树、可拖拽弹窗栈及 `fluentReducer` 8 条联动规则。
2. **多模式图形视口升级（`FluentViewport.tsx`）**：
   - 在现有弯管 SVG 基础上扩展 4 个核心 MDI 标签：`Mesh` / `Contours` / `Vectors` / `Scaled Residuals`（另可选 `XY Plot`）；
   - 点击 `Boundary Conditions` 中的 `velocity-inlet`、`pressure-outlet`、`wall-heated` 时，弯管图形对应边界边高亮闪烁并标注名称；
   - 运行模拟 `Initialize` -> `Calculate` 后，绘制带色阶标尺（Colorbar）的温度/速度云图示意、矢量箭头图以及对数坐标残差收敛曲线（明确标注为教学演示图）。
3. **活起来的 `Console / TUI`**：点击 `Mesh Check`、`Report Quality`、`Initialize`、`Calculate`、弹窗 `Apply`/`OK` 时实时追加仿真控制台日志，并支持底部 `>` 输入框及快捷 TUI 命令按钮（`/mesh/check`、`/solve/initialize/hyb-initialization`、`/solve/iterate 50`、`help`、`clear`）。
4. **新增：Fluent 常见报错与收敛排查清单（Troubleshooting Drawer / Tab）**：
   - 在工作台顶部或右侧教学区增加“报错排查（Troubleshooting）”入口，覆盖初学者最常遇到的 5 类高频故障：
     1. `Floating point exception / Divergence detected`（发散/浮点溢出）
     2. `Reversed flow in pressure-outlet`（出口回流警告）
     3. `Continuity residual stalls / slow convergence`（连续性残差卡住不降）
     4. `Low orthogonal quality / High skewness`（网格正交质量过低/偏斜率过高）
     5. `Temperature limited to ... / Energy divergence`（温度超限）
   - 每条排查卡片给出“可能原因排序 + 分步检查动作”，并支持**一键跳转定位到模拟器内对应 Fluent 控件**（如 `Solution Controls` 松弛因子、`Pressure Outlet` 回流设置、`Mesh Quality`、`Initialization`）。

---

## 第三部分：全站新增 6 项实用 CFD 工程新功能

以下功能严格遵守 [AGENTS.md](../AGENTS.md) 的代码分层（计算逻辑在 `src/calculators/`、单位在 `src/units/`、研究记录在 `docs/research/calculators/`、页面只管展示与交互）与专业内容规则（经验关联式必须写明适用范围和出处，不编造结论）。

### 功能 A：湍流入口边界条件估算器（`turbulence-inlet-boundary`）
> **痛点**：Fluent 中设置 `Velocity Inlet` 或 `Mass-Flow Inlet` 时，经常要在 `Intensity and Hydraulic Diameter`、`Intensity and Length Scale`、`k and Epsilon`、`k and Omega` 之间切换或手动输入 $k, \varepsilon, \omega$，现有计算器里缺失这一高频入口工具。

- **归属分类**：`near-wall-mesh`（或 `flow-piping`，并在研究记录写明出处，如 Ansys Fluent Theory Guide / Turbulence Boundary Specifications）。
- **核心输入与分支**：
  - 来流速度 $U$、水力直径 $D_h$（或特征尺度 $L$）、密度 $\rho$、动力黏度 $\mu$；
  - 湍流强度模式：
    - 模式 1：已知湍流强度 $I$（%）+ 长度尺度 $\ell$（默认支持 $\ell = 0.07 D_h$ 建议分支或手动输入 $\ell$）；
    - 模式 2：充分发展圆管经验估算 $I = 0.16\,\text{Re}_{D_h}^{-1/8}$ + $\ell = 0.07 D_h$（**必须**显式加注适用前提：仅用于充分发展内流初始估算，非万能值）。
- **输出参数（与 Fluent 输入框 1:1 对应）**：
  - $\text{Re}_{D_h}$、湍流强度 $I$（%）、湍流长度尺度 $\ell$（m / mm）
  - 湍动能 $k = \frac{3}{2}(U I)^2$（$\text{m}^2/\text{s}^2$）
  - 湍流耗散率 $\varepsilon = C_\mu^{3/4} \frac{k^{3/2}}{\ell}$（$\text{m}^2/\text{s}^3$，其中 $C_\mu = 0.09$）
  - 比耗散率 $\omega = \frac{k^{1/2}}{C_\mu^{1/4}\ell}$（$\text{s}^{-1}$）
  - 湍流黏度 $\mu_t = \rho C_\mu \frac{k^2}{\varepsilon}$ 与湍流黏度比 $\mu_t / \mu$
- **附加联动**：支持从 `/fluent-guide` 中 `Velocity Inlet -> Turbulence` 与 `Mass-Flow Inlet -> Turbulence` 说明区一键跳转过来。

### 功能 B：常用工质（流体 / 固体）标准物性预设与一键填入
> **痛点**：每次用 `Reynolds`、`Prandtl`、`y+`、`Grashof`、`管道压降` 等计算器时，都要手工查并输入空气密度 `1.225`、黏度 `1.7894e-5` 或水的 `998.2`、`0.001003`。

- **工程实现**：
  - 新增 `src/calculators/materialPresets.ts`，内置带明确温度/压力工况标识的标准参考物性（同时保留来源记录）：
    - `Air (1 atm, 15°C · Fluent 默认)`：$\rho = 1.225\text{ kg/m}^3, \mu = 1.7894\times 10^{-5}\text{ Pa}\cdot\text{s}, c_p = 1006.43\text{ J/(kg}\cdot\text{K)}, k = 0.0242\text{ W/(m}\cdot\text{K)}$
    - `Air (1 atm, 20°C)` / `Air (1 atm, 25°C)`
    - `Water-Liquid (20°C · 常见参考)`：$\rho = 998.2\text{ kg/m}^3, \mu = 1.003\times 10^{-3}\text{ Pa}\cdot\text{s}, c_p = 4182\text{ J/(kg}\cdot\text{K)}, k = 0.6\text{ W/(m}\cdot\text{K)}$
    - `Aluminum (300 K)` / `Copper (300 K)` / `Carbon Steel (300 K)`（用于导热/Biot/热阻等固体传热计算器）
  - 在 [CalculatorDetailPage.tsx](../src/pages/CalculatorDetailPage.tsx) 中，只要当前计算器包含 `density`、`dynamic-viscosity`、`kinematic-viscosity`、`specific-heat`、`thermal-conductivity`、`thermal-diffusivity` 中的任意字段，就在输入区顶部显示紧凑的**“常用物性快速填入”**下拉/按钮条；
  - 点击填入时自动通过 [src/units/conversions.ts](../src/units/conversions.ts) 换算成用户当前选择的单位（例如单位选 `mm²/s` 时自动填入对应数值，而不是强行覆盖单位），且所有字段仍可继续手动修改。

### 功能 C：现有高频计算器的快捷几何与反算模式补齐
针对 [docs/ROADMAP.md](../docs/ROADMAP.md) 与 [docs/GOAL_PARAMETERS.md](../docs/GOAL_PARAMETERS.md) 此前预留的高价值扩展：
1. **水力直径（`hydraulic-diameter`）快捷几何分支**：
   - 增加模式切换：
     - `通用截面`（$D_h = 4A / P_w$，保留现有）
     - `圆管满管`（输入内径 $D$，直接输出 $D_h = D$、截面积 $A = \pi D^2/4$、湿周 $P_w = \pi D$）
     - `矩形风道`（输入宽 $a$、高 $b$，计算 $D_h = \frac{2ab}{a+b}$、$A = ab$、$P_w = 2(a+b)$）
     - `同心圆环管`（输入外管内径 $D_o$、内管外径 $D_i$，校验 $D_o > D_i$，计算 $D_h = D_o - D_i$、$A = \frac{\pi}{4}(D_o^2 - D_i^2)$、$P_w = \pi(D_o + D_i)$）
2. **边界层网格等比增长（`boundary-layer-mesh`）双向反算升级**：
   - 复用仓库已写好的 [src/calculators/boundaryLayerPlan.ts](../src/calculators/boundaryLayerPlan.ts)（目前仅被 `y+` 页面使用）；
   - 增加模式：
     - `已知层数 n 求总厚度 H`（正向，输出每层高度序列、累计厚度、表格/CSV 复制）
     - `已知目标总厚度 H 反算所需层数 n`（输入 $h_1, r, H$，直接反算整数层数 $n$ 并展示每层明细与实际总厚度差值）
3. **Mach 数（`mach-number`）理想气体模式**：
   - 在现有“直接输入声速 $a$”之外，增加“由理想气体温度计算声速”模式（输入 $\gamma, R, T, U$，同时输出声速 $a = \sqrt{\gamma R T}$ 与 $\text{Ma} = U/a$）。

### 功能 D：独立“工程单位双向速查换算器”与缺失常用单位补充
- **补充 [src/units/conversions.ts](../src/units/conversions.ts) 常用工程单位**：
  - `pressure` 补充 `bar`（$10^5\text{ Pa}$）、`atm`（$101325\text{ Pa}$）、`psi`；
  - `rotationalSpeed` 补充 `rad/s`（与 `rpm` 互换：$1\text{ rad/s} = 30/\pi\text{ rpm}$）；
  - `length` 可选补充 `in`（$0.0254\text{ m}$）、`ft`（$0.3048\text{ m}$）以兼容英制 CAD 网格导入核对；
  - `velocity` 可选补充 `mm/s`。
- **新增“单位快速换算”工具（可在 `/calculators` 顶部抽屉或独立子路由 `/units` 打开）**：
  - 支持按物理量类别（压力、流量、黏度、长度、速度、温度、转速、传热系数等）输入数值，**实时同时列出该类别全部常见单位的换算结果**，并提供“复制 SI 数值”按钮（例如把 `50 L/min` 一键转为 `8.3333e-4 m³/s` 或把 `25 cP` 转为 `0.025 Pa·s`）。

### 功能 E：计算器参数联动传递、本地计算历史与 Markdown 计算单导出
- **跨计算器参数带入（Pass-to-Calculator）**：
  - 工程上常按流程串联计算：`水力直径 → 管内平均流速 → Reynolds 数 → y+ 第一层网格高度`。
  - 在计算结果下方提供“将已有参数带入相关计算器”快捷跳转链接（例如通过 URL 查询参数 `?rho=1.225&mu=1.7894e-5&U=5&L=0.05` 或轻量前端上下文预填目标计算器的同名输入项），减少重复敲数。
- **本地最近计算记录与导出（`localStorage`，纯前端无后端）**：
  - 自动保存最近 10 次成功计算的快照（计算器名、模式、输入与单位、主要输出、时间）；
  - 支持在计算器页侧边或历史面板一键**恢复该次输入**、**清空记录**，或点击**“导出 Markdown 计算单”**生成整洁的工程汇报文本方便粘贴到实验报告或仿真日志。

### 功能 F：参数计算与 CFD 公式库全局搜索 + 公式库“去计算”直达
- **现状痛点**：目前 [CalculatorsPage.tsx](../src/pages/CalculatorsPage.tsx) 必须点进 5 个分类才能看到具体计算器；[FormulaLibraryPage.tsx](../src/pages/FormulaLibraryPage.tsx) 看完公式后想算数值，必须自己回顶部导航重新找一遍该计算器。
- **改进方案**：
  1. 在 `/calculators` 顶部增加实时搜索框，支持按中文名、英文关键词、变量符号（如 `y+`、`Re`、`Nu`、`压降`、`流量`）跨分类即时过滤展示匹配的计算器卡片；
  2. 在 `/formulas` 顶部增加同样的关键词过滤框，并在每张公式卡片右上角（`复制 LaTeX` 旁）新增 **`去计算 →`** 链接，点击直达对应的 `/calculators/:categoryId/:calculatorId` 页面。
