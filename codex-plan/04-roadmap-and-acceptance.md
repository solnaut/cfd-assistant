# 04 - 分阶段实施路线图、验收标准与交接 Prompt

为降低变更风险并保证每个阶段均可运行、可验收、可回滚，整体迭代分为 **10 个顺序 Milestone**：
- **Milestone 1–6**：Fluent Solver 教学工作台（`/fluent-guide`）高保真桌面级重构（其中 Milestone 1 已由 commit `c7d4d80` 完成基础落地）；
- **Milestone 7–10**：Windows 一键启动器加固 + 全站 6 项高价值实用工程功能扩展（详见 [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md)）。

接手的 Codex 每次推进完一个 Milestone，都必须完成全部质量检查并提交一次本地 Git Commit，再进入下一个 Milestone。

---

## 1. 分阶段执行计划

### Milestone 1：全屏桌面框架、CSS 设计系统、图标库与语言切换 — ✅ 已完成初版（`c7d4d80`）
**已完成内容**：已实现全屏无网页页头集成（[App.tsx](../src/App.tsx#L11)）、`styles/fluentTokens.css` 与 `styles/fluentWorkspace.css`、自主几何 SVG 图标库 [FluentIcons.tsx](../src/fluentMock/FluentIcons.tsx)、`en | both | zh` 切换 [fluentLanguage.ts](../src/fluentMock/fluentLanguage.ts)、可用 `QuickSearch` 以及弯管网格 SVG 视口 [FluentViewport.tsx](../src/fluentMock/FluentViewport.tsx)。  
**后续衔接注意**：当前 [FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx) 仍保留 `ControlRow` 单层按钮墙、单层 Outline 与静态 Console，从 **Milestone 2** 起继续深化。

---

### Milestone 2：真实桌面控件 Kit、多级可交互 Outline 树与仿真状态机 — ✅ 已完成基础落地
### Milestone 3：可拖拽层叠弹窗栈与高保真核心对话框 — ✅ 已完成基础落地
### Milestone 4：经典 Fluent 图形视口（MDI Viewport）与交互式 Console / TUI — ✅ 已完成基础落地
### Milestone 7：Windows 一键启动器加固与体验升级 — ✅ 已完成基础落地

> 说明：Milestone 2–4、7 以及 Milestone 5/6 中的部分能力（选项对比建议、计算器直达链接、10 步引导与 5 类报错排查）已集成到 `src/fluentMock/`、`scripts/open-workbench.ps1` 与 `停止 CFD Assistant.cmd`。后续可直接推进 **Milestone 5–6 收口** 以及 **Milestone 8–10**。

---

### Milestone 2（归档参考）：真实桌面控件 Kit、多级可交互 Outline 树与仿真状态机
**目标**：用真表单控件取代两列大按钮墙，建立纯前端状态机与跨模块联动基础。
- **核心任务**：
  1. 实现 `src/fluentMock/components/controls/` 下的全套桌面控件（`GroupBox`、`RadioGroup`、`Checkbox`、`Select`、`NumberInput`、`ListBox`、`Tabs`、`ActionButton`）。
  2. 新建 `src/fluentMock/state/fluentInitialState.ts` 与 `fluentReducer.ts`，完成状态建模与 8 条联动规则。
  3. 升级 `OutlinePane.tsx`：支持多级展开/折叠（如 `Models -> Energy / Viscous`、`Materials -> Fluid -> air`、`Boundary Conditions -> velocity-inlet / pressure-outlet / wall`）、树内状态回显（如 `(Off)` / `(SST k-omega)`）、双击打开、右键菜单（`Edit...` / `Display` / `Explain`）以及“全部展开/全部折叠”按钮。
  4. 将 `setupPanels`、`solutionPanels`、`resultsPanels` 迁出并重构为真实 `GroupBox + ListBox + Form` 排版（例如 `General` 任务页真实可操作单选框/勾选框/数字框；`Models` / `Boundary Conditions` 呈现经典 ListBox + 底部 `Edit...` 按钮）。
- **验收标准**：
  - 用户能真正输入数字、勾选/取消 Checkbox、切换 Radio、在 Select 切换选项并看到状态持久保留；
  - 切换 `Steady ↔ Transient`、`Energy On/Off`、`Gravity`、`Viscous` 等关键设置时，相关面板/树节点状态实时联动变化；
  - `fluentReducer.test.ts` 通过全部状态联动单元测试。

---

### Milestone 3：可拖拽层叠弹窗栈与高保真核心对话框
**目标**：让弹窗真正具备桌面软件多窗口体验，补齐高频核心对话框内部真实排布。
- **核心任务**：
  1. 实现 `DialogManager.tsx`：支持多级层叠弹窗（如 `Materials` → `Create/Edit Materials` → `Fluent Database`）、标题栏拖拽、点击置顶、`OK / Apply / Cancel` 草稿提交与回滚、`Esc` 关闭最顶层弹窗。
  2. 拆分并高保真重构核心对话框数据与布局（`src/fluentMock/data/dialogs/`）：
     - **Setup 核心**：`Viscous Model`（左列模型单选 + 右列动态子选项 + 近壁处理下拉）、`Energy`、`Operating Conditions`、`Materials` 与 `Create/Edit Materials`、`Cell Zone Conditions (Fluid/Solid + Source Terms)`、`Reference Values`。
     - **边界条件核心（带 `Momentum / Thermal / Radiation` 等多 Tab）**：`Velocity Inlet`、`Mass-Flow Inlet`、`Pressure Outlet`、`Wall`、`Symmetry`、`Outflow`。
     - **Solution & Results 核心**：`Solution Methods`、`Residual Monitors`、`Initialization & Patch`、`Automatic Saving`、`Contours`、`Vectors`、`Surface Integrals`、`Plane Surface`、`XY Plot`、`Report Definitions`。
- **验收标准**：
  - 打开二级弹窗不会顶掉一级弹窗；
  - 拖拽标题栏顺畅且不会拖出工作台边界；
  - `Apply` 可即时提交并同步刷新树/Task Page/Console，`Cancel` 不污染已保存状态；
  - Energy 关闭时边界条件里的 `Thermal` 标签页呈现受控灰显/引导态。

---

### Milestone 4：经典 Fluent 图形视口（MDI Viewport）与交互式 Console / TUI
**目标**：让图形视口与控制台成为真正响应操作的活模块，而不再是静态图片与 5 行写死文本。
- **核心任务**：
  1. 重建 `ViewportPane.tsx`：
     - 顶部 MDI 标签切换（`Mesh` / `Graphics` / `Scaled Residuals` / `XY Plot`）；
     - 经典 Fluent 蓝-白垂直渐变背景 + 右下角 RGB 3D Triad + 左下角比例尺；
     - 自主高精度 SVG 示例模型（3D 混合弯管或台阶管流）：支持 `Mesh` 网格/边界高亮（点某边界即在模型上高亮该面）、`Contours` 云图+右侧 Colorbar、`Vectors` 速度矢量箭头；
     - 左侧带真实 SVG 图标的视图工具栏（缩放、平移、适配、框选、显示网格边、重置视图）及底部 `Selection Filter` 下拉框；
     - 在 `Run Calculation` 后自动绘制 `Scaled Residuals` 对数收敛曲线，在 `XY Plot` 标签展示截面分布图，并明确标注为“教学示例演示图形”。
  2. 重建 `ConsolePane.tsx` 与 `fluentTuiCommands.ts`：
     - 随工作台各种操作（Check、Quality、Initialize、Calculate、Apply）追加仿真 Console 日志；
     - 支持输入命令（如 `help`、`/mesh/check`、`/solve/initialize/hyb-initialization`、`/solve/iterate 50`、`clear`）及一键点击常用 TUI 快捷按钮。
- **验收标准**：
  - 未初始化直接点 `Calculate` 会按真实 Fluent 逻辑在 Console 报错/警告提示先初始化；
  - 完成 `Initialize` → `Calculate` 后，Console 滚动输出模拟迭代日志，Viewport 自动切到残差曲线并解锁 `Contours` / `Vectors` 可视化预览。

---

### Milestone 5：深度控件/选项级教学解释、计算器直达与全局实时搜索
**目标**：将右侧 Explanation Inspector 升级为真正的 Fluent 随行教练，把教学与本站计算器打通，并实现全站全局快速搜索。
- **核心任务**：
  1. 重构并扩充 `src/fluentMock/data/explanations/`，为所有主控面板、核心对话框控件及重要下拉选项（如 `SIMPLE` vs `SIMPLEC` vs `PISO` vs `Coupled`、`SST k-omega` vs `Realizable k-epsilon`、`Enhanced Wall Treatment` vs `Standard Wall Functions`、`Hybrid` vs `Standard Initialization`）补齐高质量原创中文工程解释，消除通用模板废话。
  2. 将 `ExplanationInspector.tsx` 升级：
     - `relatedControls` 变为**可点击导航按钮**（点击后自动切换到对应 Tab/树节点/弹窗，并闪烁橙色定位框 1.5 秒）；
     - 新增**“关联 CFD 计算器”卡片**：按上下文直接跳转到本站对应计算器（如在 `Viscous / Near-Wall` 直达 `/calculators/near-wall-mesh/y-plus-first-layer-height`；在 `Transient Time Step` 直达 `/calculators/transient-time-step/cfl-time-step`；在 `Velocity Inlet` 直达 `/calculators/dimensionless-numbers/reynolds-number`）。
  3. 激活顶部 `Quick Search`：输入英文或中文关键词实时弹出匹配列表（Ribbon 按钮、树节点、Task Page 控件、弹窗控件），点击即定位高亮并弹出解释。
- **验收标准**：
  - Tier-1 核心控件 100% 为定制解释，无通用模板兜底文本；
  - 切换下拉框不同选项时，右侧解释可随之细化到当前所选算法；
  - 点击 `relatedControls` 和 Quick Search 结果都能精准跳转并高亮目标控件。

---

### Milestone 6：10 步入门引导、全量测试、移动端兜底与项目文档收口
**目标**：补齐教学闭环、全面测试防线和文档同步，确保整体达到可长期维护和交付的高质量标准。
- **核心任务**：
  1. 实现 `WalkthroughBar.tsx`：提供可选开启的**“单相稳态管流与传热 10 步入门演练”**引导条（例如：Step 1 Mesh Check → Step 2 General → Step 3 Energy & Viscous → Step 4 Materials → Step 5 Cell Zone → Step 6 Boundary Conditions → Step 7 Solution Methods → Step 8 Residual Monitors → Step 9 Initialize & Run → Step 10 Contours & Surface Integrals），点击“定位当前步”可直接带学生到对应位置并高亮提示。
  2. 完善窄屏/平板响应式兜底（例如 `< 1100px` 时支持在“工作台主区 / 教学解释”标签间平滑切换，不压扁窗口）。
  3. 编写完备的测试矩阵：数据完整性测试 + 反模板守卫测试 + Reducer 联动单测 + UI 端到端交互测试。
  4. 同步更新 [docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)（修改旧版对 Fluent 模拟器的保守表述，保留合规边界）、[docs/ROADMAP.md](../docs/ROADMAP.md) 与 [CHANGELOG.md](../CHANGELOG.md)。
  5. 运行 `npm.cmd run lint`、`npm.cmd run test`、`npm.cmd run build`，并用真实浏览器检查全流程与控制台零报错。
- **验收标准**：
  - 全部 lint、test、build 绿灯通过；
  - 桌面端与窄屏布局均无溢出错位、无控制台 error、无未处理异常；
  - 公开界面不含 `TODO`、内部状态标记、官方 Logo/截图或大段官方原文。

---

### Milestone 7：Windows 一键启动器加固与体验升级
**目标**：修复 `50bfff7` 启动脚本对源码文件内容的脆弱依赖，补齐多路由启动、缺失依赖处理与一键停止后台服务能力（详见 [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md) 第一部分）。
- **核心任务**：
  1. 修改 [scripts/open-workbench.ps1](../scripts/open-workbench.ps1)：`Test-Workbench` 改为探测根路径 `/` 或 `/index.html` 并验证 `<title>CFD Assistant</title>`；
  2. 支持 `-Target`（`fluent-guide` / `home` / `calculators` / `formulas`）、`-Preview`（支持 `dist` 静态预览）以及缺失 `node_modules` 时自动提示/安装；
  3. 增加 `-Stop` 参数（及可选的 `停止 CFD Assistant.cmd`），安全停止由本项目启动在 5173/5174 端口的后台 Vite 进程。
- **验收标准**：
  - 即使重命名或重构 `src/fluentMock/FluentSolverMock.tsx`，启动器依然能稳定识别已运行实例与启动新实例；
  - 重复双击不会残留多个僵尸端口监听，停止命令能准确回收后台服务。

---

### Milestone 8：全站实用效率提升（快捷物性、计算器全局搜索、公式库直达、单位速查换算器）
**目标**：提升参数计算、公式库与单位换算日常使用效率（详见 [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md) 第三部分 功能 B、D、F）。
- **核心任务**：
  1. 新增 `src/calculators/materialPresets.ts`，在含密度/黏度/比热/导热系数输入项的计算器详情页顶部提供“常用流体/固体标准物性一键填入”，按当前所选单位自动换算填入（不强改单位且保留手工编辑）；
  2. 升级 [CalculatorsPage.tsx](../src/pages/CalculatorsPage.tsx) 与 [FormulaLibraryPage.tsx](../src/pages/FormulaLibraryPage.tsx)：增加跨分类实时关键词/符号搜索框，并在每张公式卡新增 `去计算 →` 按钮直达对应计算器；
  3. 扩展 [src/units/conversions.ts](../src/units/conversions.ts) 常用工程单位（`bar`、`atm`、`psi`、`rad/s`、`in`、`ft`、`mm/s`），提供多单位同屏实时互换工具（支持一键复制 SI 值）。
- **验收标准**：
  - 物性快捷填入与单位换算全部通过单元测试验证精度；
  - 公式库卡片可直接跳转对应计算器，搜索可跨 5 个分类精准命中目标工具。

---

### Milestone 9：高频专业计算器扩充（湍流入口估算器 + 快捷几何 + 双向反算）
**目标**：补齐 Fluent 上机最高频的入口湍流估算及常用几何/边界层/声速快捷分支（详见 [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md) 第三部分 功能 A、C）。
- **核心任务**：
  1. 新增正式计算器 `turbulence-inlet-boundary`（入口湍流参数 $I, \ell, k, \varepsilon, \omega, \mu_t/\mu$ 估算，含独立研究记录 `docs/research/calculators/turbulence-inlet-boundary.md` 与双分支适用范围声明）；
  2. 升级 `hydraulic-diameter`（增加圆管、矩形通道、同心圆环快捷几何分支，同时输出面积 $A$ 与湿周 $P_w$）；
  3. 升级 `boundary-layer-mesh`（复用 [src/calculators/boundaryLayerPlan.ts](../src/calculators/boundaryLayerPlan.ts) 开放“已知目标总厚度 $H$ 反算层数 $n$”模式及明细表/CSV 复制）；
  4. 升级 `mach-number`（增加理想气体温度直接算声速并求 $\text{Ma}$ 的模式）。
- **验收标准**：
  - 遵循 [AGENTS.md](../AGENTS.md) 规则，所有新公式与分支均具备 `docs/research/calculators/` 记录及正常/单位换算/边界/非法输入/研究验证测试；
  - `src/tests/calculatorMetadata.test.ts`、`calculatorImplementations.test.ts` 与全套测试 100% 通过。

---

### Milestone 10：计算器跨工具联动、本地历史记录与 Fluent 常见报错排查清单
**目标**：打通计算器之间的串联工作流与本地数据留存，并在 Fluent 工作台增加实战排错向导（详见 [05-product-upgrades-and-new-features.md](./05-product-upgrades-and-new-features.md) 第二部分与第三部分 功能 E）。
- **核心任务**：
  1. 实现计算器结果区“带入相关计算器”快捷联动（URL 查询参数或轻量状态传递共用物性/速度/特征长度）；
  2. 实现纯前端 `localStorage` 最近 10 次计算历史记录（一键恢复输入、清空、导出 Markdown 计算单）；
  3. 在 Fluent 教学工作台新增“常见报错与收敛排查清单（Troubleshooting）”面板/抽屉，覆盖发散、出口回流、连续性残差卡住、网格质量差、温度超限等典型故障，每条提供原因排序与一键定位模拟控件；
  4. 最终运行全套检查与浏览器端到端回归，同步更新文档并提交本地 Git Commit。
- **验收标准**：
  - 历史记录与参数传递在刷新页面及非法 query 参数下均健壮不报错；
  - Fluent 报错排查条目可精准跳转并高亮模拟器对应控件；
  - `npm.cmd run lint`、`npm.cmd run test`、`npm.cmd run build` 全部通过。

---

## 2. 全局质量门禁（每个 Milestone 结束必须核对）

1. **命令检查**（在 Windows PowerShell 中使用 `npm.cmd`）：
   ```powershell
   npm.cmd run lint
   npm.cmd run test
   npm.cmd run build
   ```
   必须全部退出码为 `0` 且无跳过的断言或被弱化的测试。
2. **代码分层检查**（遵守 [AGENTS.md](../AGENTS.md)）：
   - Fluent 仿真状态逻辑在 `src/fluentMock/state/`，数据定义在 `src/fluentMock/data/`，UI 组件在 `src/fluentMock/components/`；
   - 计算器纯函数逻辑在 `src/calculators/`，单位换算在 `src/units/`，研究记录在 `docs/research/calculators/`；
   - 不得把计算公式或大段硬编码知识混入页面组件。
3. **视觉与产品化检查清单**：
   - 无单汉字方块占位图标；
   - 无 macOS 三圆点；
   - 无把输入框/下拉框伪装成的两列大按钮墙；
   - 无“与文件”“后台”等错误翻译；
   - 无 Ansys/Fluent 官方 Logo、官方截图或内部 `TODO` 文本。
4. **Git 习惯**：
   - 每个 Milestone 验收通过后做一次清晰、原子化的本地 `git commit`；
   - **禁止擅自执行 `git push` 或部署操作**，除非用户在对话中明确要求。

---

## 3. 可直接发送给 Codex 的启动 Prompt 模板

### 模板 A：按顺序继续完成 Fluent 高保真重构与全站功能扩展（Milestone 2 → 10，推荐）
```text
请先阅读仓库根目录的 AGENTS.md，以及 codex-plan/ 目录下的全部规划文档（README.md、01-current-audit.md、02-visual-and-layout-spec.md、03-interaction-and-architecture.md、04-roadmap-and-acceptance.md、05-product-upgrades-and-new-features.md）。

目前 Milestone 1（c7d4d80）和初版启动器（50bfff7）已完成。请严格按照 codex-plan/04-roadmap-and-acceptance.md 的 Milestone 2 到 Milestone 10 顺序依次推进（可按我的确认节奏逐个 Milestone 汇报）。
要求：
1. 每次只推进一个 Milestone，不要跳过或一次性大爆炸重写；
2. 严格遵守 AGENTS.md 中的合规边界与代码分层（自主 HTML/CSS/SVG 实现，不使用 Ansys/Fluent 官方 Logo、官方截图、官方图标包或大段帮助原文；新计算公式必须同步补齐研究记录与测试）；
3. 每个 Milestone 完成后，必须运行 npm.cmd run lint、npm.cmd run test、npm.cmd run build 并确认全部通过，检查浏览器交互与控制台无报错后，提交一个清晰的本地 git commit（不要 git push）。
4. 请先从 Milestone 2 开始执行，完成后向我汇报改动内容与验证结果。
```

### 模板 B：单步推进指定 Milestone（例如仅执行 Milestone 2 或 Milestone 8）
```text
请先阅读 AGENTS.md 以及 codex-plan/ 下的全部文件，然后仅执行 codex-plan/04-roadmap-and-acceptance.md 中的【Milestone X】。
完成后运行 npm.cmd run lint、npm.cmd run test、npm.cmd run build，验证通过后做一次本地 git commit（不要推送 GitHub），再向我汇报。
```

### 模板 C：优先完成全站实用增强（Milestone 7–9），再深化 Fluent 模拟器
```text
请先阅读 AGENTS.md 以及 codex-plan/ 下的全部文件（重点查看 05-product-upgrades-and-new-features.md）。
我想先完善一键启动器和参数计算实用功能，请依次执行 Milestone 7、Milestone 8、Milestone 9（每次只做一个 Milestone，全部通过 lint/test/build 并本地 git commit，不要 git push），先从 Milestone 7 开始。
```
