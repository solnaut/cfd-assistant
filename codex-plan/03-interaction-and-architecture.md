# 03 - 交互架构、控件库、状态机与模块化设计

本文件定义重构后的前端工程架构，确保实现**真实桌面交互行为**、**多窗口层叠管理**、**跨模块状态联动**与**高质量教学解释数据流**，同时严格遵守 [AGENTS.md](../AGENTS.md) 的分层要求。

---

## 1. 桌面控件组件库（`src/fluentMock/components/controls/`）

废除旧版把所有东西塞进 `<button class="fluent-mock-control">` 的做法，建立贴近真实 Windows/Qt 桌面表单的组件族。

### 1.1 控件清单与双轨交互约定
所有控件遵循**双轨交互原则（Dual-Action Rule）**：用户点击、聚焦或修改控件值时：
1. **完成真实 UI 行为**（切换单选/复选、输入数字、展开下拉改选、选中列表项、切换 Tab）；
2. **同时通知右侧 Teaching Inspector** 更新到对应控件或当前所选下拉项的精准解释（`onInspect(explanationId)`）。

| 组件名 | 对应 Fluent 真实形态 | 关键行为与 Props |
| --- | --- | --- |
| `FluentGroupBox` | 带左上角标题嵌入边框的分组框（`fieldset` / `legend` 样式） | 用于 `General -> Solver / Time / Gravity`、`Solution Methods` 等分区 |
| `FluentRadioGroup` | 真实纵向/紧凑单选按钮组 | 同一组互斥，绑定 `value`；支持每个选项独立携带 `explanationId` |
| `FluentCheckbox` | 真实勾选框（13×13px 方框 + 勾选矢量标记） | 绑定 `checked`，支持禁用状态和点击激活解释 |
| `FluentSelect` | 桌面风格下拉选择框 + 右侧小三角 | 支持选项数组 `{ value, labelEn, labelZh, explanationId? }`；切换 `SIMPLE`→`Coupled` 时右侧自动切到对应算法对比解释 |
| `FluentNumberInput` | 标签左对齐 + 右侧带边框数字输入框 + 单位后缀 | 支持真实输入与合法数值更新，失焦/聚焦触发对应参数解释 |
| `FluentListBox` | 可滚动多行列表框（带表头或状态列，如 `Energy    Off`、`velocity-inlet    velocity-inlet`） | 单击选中行并更新右侧解释；**双击行直接打开对应设置弹窗** |
| `FluentTabs` | 弹窗或面板内的横向选项卡（如 `Momentum / Thermal / Turbulence / Radiation`） | 切换标签页并支持受控禁用态（例如 Energy 关闭时 `Thermal` Tab 灰显并提示开启方式） |
| `FluentActionButton` | 标准桌面 3D 微渐变按钮 / 主操作按钮（`Edit...`、`Display...`、`Calculate`） | 点击执行状态动作或打开/入栈目标弹窗 |

---

## 2. 多级可拖拽弹窗栈（`DialogManager.tsx`）

替换单一 `openDialogId: string | null`，改为**弹窗栈（Dialog Stack）**：

```ts
export interface FluentDialogInstance {
  instanceId: string
  dialogId: string
  parentInstanceId?: string
  contextKey?: string // 例如选中的边界名称 'velocity-inlet' 或材料名称 'air'
  x: number           // 相对于工作台的偏移像素（支持拖拽）
  y: number
  zIndex: number
}
```

### 核心行为规范
1. **多级叠加**：在 `Materials` 主弹窗中点击 `Create/Edit...` 时，不销毁父弹窗，而是在其右上偏错位（`+28px, +24px`）打开 `Create/Edit Materials` 子弹窗；再点 `Fluent Database...` 可继续打开第三层弹窗。
2. **标题栏拖拽与聚焦**：鼠标按住弹窗标题栏可自由拖动（限制在工作台可视范围内不飞出屏幕）；点击任意弹窗任意位置将其 `zIndex` 置顶。
3. **标准 Fluent 弹窗底部按钮语义**：
   - 表单编辑类弹窗采用 **草稿态（Draft State）** 或显式同步机制：
     - **`OK`**：提交修改到 `FluentSimState`，追加一行模拟 Console 日志，关闭当前弹窗；
     - **`Apply`**：立即提交修改到 `FluentSimState`，追加 Console 日志，并保持弹窗打开（供用户继续观察或联动调整）；
     - **`Cancel` / `Close` / 右上角 `×` / `Esc` 键**：放弃未提交草稿（若有）并仅关闭最顶层弹窗。

---

## 3. 纯前端仿真状态机（`src/fluentMock/state/`）

将 Fluent 当前算例的所有核心设置抽象为纯 TypeScript 状态树 `FluentSimState`（默认初始化为一个“3D 90° 弯管 / 管流教学示例算例”），通过纯函数 `fluentReducer(state, action)` 管理，便于编写完备的 Vitest 单元测试。

### 3.1 核心状态切片
- `ui`: 语言模式（`'en' | 'bilingual' | 'zh'`）、当前 Ribbon Tab、当前选中的 Outline 节点与 Task Page、当前活跃解释 ID（`activeExplanationId`）、视口当前 MDI Tab（`'mesh' | 'graphics' | 'residuals' | 'xy-plot'`）、视口渲染模式（`'mesh' | 'contour' | 'vector'`）、Guided Walkthrough 步骤与开关、快速搜索定位高亮 ID。
- `caseSetup`:
  - `general`: `solverType` (`'pressure-based' | 'density-based'`), `velocityFormulation` (`'absolute' | 'relative'`), `timeFormulation` (`'steady' | 'transient'`), `gravityEnabled`, `gravityVector: [number, number, number]`, `operatingPressure`, `operatingDensity`
  - `models`: `energyEnabled`, `viscousHeating`, `viscousModel` (`'laminar' | 'k-epsilon' | 'k-omega' | 'spalart-allmaras'`), `viscousSubModel` (`'standard' | 'rng' | 'realizable' | 'sst' | 'bsl'`), `nearWallTreatment` (`'standard-wall-fn' | 'enhanced-wall-treatment' | 'scalable-wall-fn'`), `radiationModel`, `multiphaseModel`
  - `materials`: `fluidMaterials` 列表（默认 `air`, `water-liquid`，支持新增/复制/修改物性）、`solidMaterials` 列表（默认 `aluminum`）
  - `cellZones`: 默认 `fluid-domain`（绑定 `fluidMaterialName`、是否开启源项）
  - `boundaries`: 列表对象（`velocity-inlet`、`mass-flow-inlet`、`pressure-outlet`、`wall-heated`、`symmetry-plane`），每条含速度/流量、表压、温度/热通量、湍流给定方式与参数
  - `referenceValues`: `computeFrom`, `area`, `length`, `density`, `velocity`
- `solution`:
  - `methods`: `pressureVelocityCoupling`, `gradient`, `pressure`, `momentum`, `turbulentKineticEnergy`, `specificDissipationRate`, `energy`, `transientFormulation`
  - `controls`: `urfPressure`, `urfMomentum`, `urfTurbulentKineticEnergy`, `urfEnergy`
  - `monitors`: `residualCriteria`（含 `continuity`, `xVelocity`, `energy` 等）、`reportDefinitions`
  - `initialization`: `method` (`'hybrid' | 'standard'`), `isInitialized`, `patchApplied`
  - `runCalculation`: `iterations`, `timeStepSize`, `numberOfTimeSteps`, `maxIterationsPerTimeStep`, `hasRun`, `iterationCount`
- `console`: `lines: ConsoleLogEntry[]`（带类型：`info | command | output | warning | success`）

### 3.2 必须实现的 8 条跨模块联动规则

1. **稳态 ↔ 瞬态联动（`General -> Time`）**：
   - 切换为 `Transient` 后，`Run Calculation` 自动从单框 `Number of Iterations` 切换为 `Time Step Size (s)` + `Number of Time Steps` + `Max Iterations/Time Step`；`Solution Methods` 自动激活 `Transient Formulation` 下拉框。
2. **重力联动（`General -> Gravity` ↔ `Operating Conditions`）**：
   - 勾选/取消 `Gravity` 同步启用/禁用 X/Y/Z 重力输入框，并双向同步到 `Operating Conditions` 弹窗中的重力开关与矢量。
3. **能量方程联动（`Models -> Energy`）**：
   - `Energy = Off` 时：`Boundary Conditions` 弹窗中的 `Thermal` 标签页显示为置灰不可编辑态（点击提示需先在 Models 中开启 Energy）；`Solution Methods` 与 `Residual Monitors` 隐藏/弱化 Energy 方程行。
   - `Energy = On` 时：上述 Thermal 选项、Energy 离散格式与能量残差行全部激活，并在 Outline 中显示 `Energy (On)`。
4. **湍流模型联动（`Models -> Viscous`）**：
   - 在 `Viscous Model` 弹窗中切换左栏模型（`Laminar` / `k-epsilon` / `k-omega`）时，弹窗右侧动态切换对应的子模型与近壁处理选项（例如 `k-epsilon` 显示 Standard/RNG/Realizable + Near-Wall Treatment；`k-omega` 显示 SST/BSL/GEKO）；
   - Outline 中显示当前模型名（如 `Viscous (SST k-omega)`）；
   - 选择 `Laminar` 时，入口/出口弹窗的 `Turbulence` 面板提示“当前为层流，无需设置湍流参数”。
5. **材料与体区域联动（`Materials` ↔ `Cell Zone Conditions`）**：
   - 在 `Create/Edit Materials` 中修改或新建材料并点击 `Change/Create` 后，该材料会立即出现在 `Cell Zone Conditions` 弹窗的材料下拉列表中，并显示在 Outline 的 `Materials` 子树中。
6. **网格检查与显示联动（`Mesh -> Check / Quality / Display`）**：
   - 点击 `Check` / `Report Quality` 时，Console 自动输出结构化教学检测结果（如最小体积、最小正交质量、最大偏斜率提示），Viewport 自动切到 `Mesh` 标签；点击具体边界名称高亮图形中对应面。
7. **初始化前置校验与状态联动（`Initialization`）**：
   - 点击 `Initialize`（Hybrid / Standard）后，Console 输出初始化迭代信息，设置 `isInitialized = true`，并允许正式开始计算。
8. **计算启动与残差/云图解锁联动（`Run Calculation -> Calculate`）**：
   - 若 `isInitialized === false`，点击 `Calculate` 会在 Console 输出典型 Fluent 警告提示（提醒先完成初始化）；
   - 若已初始化，点击 `Calculate` 后：Console 输出模拟迭代过程与“教学示例收敛完成”摘要，Viewport 自动切换到 `Scaled Residuals` 标签绘制残差曲线，同时解锁/激活 `Results -> Contours / Vectors` 的云图/矢量图预览。

---

## 4. 重构后的模块化目录结构

`src/fluentMock/` 保留 `FluentSolverMock.tsx` 作为页面入口（确保 [src/pages/FluentGuidePage.tsx](../src/pages/FluentGuidePage.tsx) 导入路径无缝衔接）以及 `fluentResearchIndex.ts` 作为内部来源索引：

```text
src/fluentMock/
  FluentSolverMock.tsx              # 顶层工作台装配（仅负责布局装配与顶级事件连接）
  fluentTypes.ts                    # 完整 TypeScript 类型（含双语标签、状态、弹窗栈、控件、解释）
  fluentResearchIndex.ts            # 公开权威参考索引（保留并扩展）
  styles/
    fluentTokens.css                # 桌面 CAE 视觉设计 Token
    fluentWorkspace.css             # 5+1 工作台布局、Ribbon、树、视口、控制台、弹窗与右侧 Inspector 样式
  icons/
    FluentIcons.tsx                 # 30+ 个自主设计的紧凑桌面几何 SVG 图标
  state/
    fluentInitialState.ts           # 默认单相流动+传热教学示例算例初始状态
    fluentReducer.ts                # 纯函数状态机（含 8 条跨模块联动逻辑 + 控制台日志生成）
    fluentTuiCommands.ts            # 控制台 TUI 指令解析与教学快捷命令响应
  components/
    TopUtilityBar.tsx               # 36px 页面集成顶栏（语言切换、Walkthrough、Reset、Inspector 折叠、全屏）
    TitleBarAndSearch.tsx           # 窗口标题栏 + 快速访问 + 实时全局 Quick Search 下拉跳转
    FluentRibbon.tsx                # File Backstage 下拉 + 真实大/小混排 Ribbon 命令区
    OutlinePane.tsx                 # 多级可展开树 + 过滤 + 全部展开/折叠 + 右键菜单
    TaskPagePane.tsx                # 贯穿全高的 Task Page 渲染器（含 GroupBox、ListBox 与联动按钮）
    ViewportPane.tsx                # MDI 多标签视口（Mesh / Graphics / Residuals / XY Plot + SVG 工具栏 + Triad + Colorbar）
    ConsolePane.tsx                 # 可滚动仿真控制台日志 + 可输入/点击的 TUI 命令行
    DialogManager.tsx               # 可拖拽、可层叠弹窗栈管理器（OK / Apply / Cancel / Esc）
    ExplanationInspector.tsx        # 右侧教学解释面板（含可点击关联控件跳转与 CFD 计算器直达卡片）
    WalkthroughBar.tsx              # 可选 10 步“单相管流与传热入门实操”引导横条
    controls/
      FluentGroupBox.tsx
      FluentRadioGroup.tsx
      FluentCheckbox.tsx
      FluentSelect.tsx
      FluentNumberInput.tsx
      FluentListBox.tsx
      FluentTabs.tsx
      FluentActionButton.tsx
  data/
    ribbonData.ts                   # Ribbon Tabs 与大/小混排命令定义
    treeData.ts                     # 多级静态+动态树结构映射规则
    panels/                         # 按 Setup / Solution / Results 拆分的 Task Page 定义
      setupPanels.ts
      solutionPanels.ts
      resultsPanels.ts
    dialogs/                        # 按功能域拆分的高保真对话框结构定义
      generalAndModelsDialogs.ts
      materialsAndZonesDialogs.ts
      boundaryDialogs.ts
      solutionAndInitDialogs.ts
      resultsDialogs.ts
    explanations/                   # 按功能域拆分的高质量控件+选项解释库
      ribbonAndWorkspaceExplanations.ts
      setupExplanations.ts
      boundaryExplanations.ts
      solutionExplanations.ts
      resultsExplanations.ts
      explanationRegistry.ts        # 汇总查询 + 类型安全的兜底校验
```

同时从 [src/App.css](../src/App.css) 第 1625–2467 行清理并迁移旧 `.fluent-*` 样式到 `src/fluentMock/styles/`，减少全站样式耦合。

---

## 5. 解释内容质量与测试守卫

### 5.1 解释条目质量要求（拒绝“万金油模板废话”）
每一条核心解释条目（`FluentMockExplanation`）必须包含：
- `titleEn` / `titleZh` 与精确 `location` 面包屑；
- `whatItIs`：用工程直白语言说明物理/数值含义；
- `recommendation`：直接给出**工程常用选择与参数对比建议**（例如：为什么一般低速不可压缩推荐 `Pressure-Based`、为什么 `SIMPLE` 与 `Coupled` 各在什么网格/工况选用）；
- `whenToUse`：触发条件；
- `checkItems`：设置前后具体核对项（避免“检查是否合理”这类空话）；
- `commonMistakes`：初学者最容易踩的坑（例如表压与绝对压力混淆、未开 Energy 找温度边界、入口湍流默认 5% 与 1m 黏度比直接沿用）；
- `relatedControls`：可点击跳转的目标控件 ID；
- `relatedCalculators`（新增）：直接映射到站内计算器路由（如 `{ id: 'y-plus-first-layer-height', categoryId: 'near-wall-mesh', label: '估算第一层网格高度 (y+)' }`、`{ id: 'reynolds-number', categoryId: 'dimensionless-numbers', label: '计算入口 Reynolds 数' }`、`{ id: 'cfl-time-step', categoryId: 'transient-time-step', label: '估算瞬态时间步长 (CFL)' }`）。

### 5.2 自动化测试必须覆盖的维度
1. **数据完整性守卫（Vitest）**：
   - 所有控件 ID（含静态节点、动态边界、弹窗内部控件）全局唯一；
   - 所有控件及重要下拉选项的 `explanationId` 均存在于 `explanationRegistry`；
   - **反模板守卫**：所有核心工作流（Tier-1）控件和弹窗控件禁止落入通用占位模板，必须拥有专属解释；
   - 公开页面及所有展示字段不含 `TODO`、`futureWindowNotes`、`natural-placeholder`、源码路径或官方版权禁用资源。
2. **状态机单测（`fluentReducer.test.ts`）**：
   - 全部 8 条跨模块联动规则均需有对应单元测试验证状态迁移与 Console 输出。
3. **UI 集成测试（`fluentMockUi.test.tsx`）**：
   - 覆盖“切换语言 → 展开多级树 → 切换 Energy/Transient 观察跨面板联动 → 打开多层弹窗并拖动/Apply/Esc 关闭 → 初始化并运行计算观察残差曲线与云图解锁 → 点击相关控件与搜索跳转”。
