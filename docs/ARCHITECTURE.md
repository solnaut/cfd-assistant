# Architecture

## 技术栈

- React：页面和交互。
- TypeScript：类型约束和可维护性。
- Vite：开发服务器和静态构建。
- React Router：前端路由。
- Vitest：单元测试和组件测试。
- PWA：为后续移动端访问和安装体验预留基础。

## 分层原则

页面、计算逻辑、单位换算、知识库读取和数据模型必须分开。

```text
src/
  components/      可复用 UI 组件
  pages/           页面入口
  calculators/     计算器定义与纯函数计算逻辑
  units/           单位定义、换算和显示符号
  knowledge/       知识库读取和查询
  models/          TypeScript 数据模型
  tests/           测试设置和测试文件
public/
  knowledge/       本地 JSON 知识库
docs/              项目文档
```

## 数据流

### 参数计算

用户输入页面 -> 表单校验 -> 单位换算模块 -> 计算器纯函数 -> 结果展示。

页面不得直接包含公式计算逻辑。当前计算器元数据集中在 `src/calculators/registry.ts`，纯函数实现集中在 `src/calculators/implementations.ts`，单位换算集中在 `src/units/conversions.ts`。公式展示使用计算器元数据中的 LaTeX，并由 KaTeX 渲染。

`/formulas` 公式库通过 `src/calculators/formulas.ts` 读取 `calculatorCatalog` 中的公式定义，不维护第二份公式文本。计算器可以只有一个 `formula`，也可以用 `formulas` 提供多个细分公式条目。计算器详情页和公式库页面共享公式标题、原始 LaTeX 和变量说明；公式库只显示公式总览，不展示适用范围、注意事项或来源链接。

变量符号和单位显示分为两层：

- 内部 ID 保持稳定 ASCII，例如 `Pa*s`、`kg/m^3`、`m^2/s`。
- 用户界面通过 `displaySymbol`、`formatVariableSymbol` 和 `formatUnitSymbol` 显示 `Pa·s`、`kg/m³`、`m²/s`、`μ`、`ρ` 等可读文本。

正式计算器必须保持以下内容一致：

- 研究记录中的公式。
- 纯函数实现。
- 页面展示公式。
- 原始 LaTeX 字符串。
- 验证测试案例。
- 公式库展示内容。
- `docs/research/calculators/<calculator-id>.md` 内部研究记录。

公开页面不展示外部来源链接。来源、访问日期、适用范围、验证案例和审核状态保存在 `docs/research/calculators` 以及计算器元数据中，用于维护者审查。

公式库页面的变量说明使用简化格式“符号 / 含义”；计算器详情页变量说明使用完整格式“符号 / 名称 / 单位 / 含义”。普通变量符号通过 `formatVariableSymbol` 转换为用户可读文本，复制 LaTeX 时仍使用原始 LaTeX 字符串。

### Fluent 导览

页面启动 -> `src/knowledge/knowledgeRepository.ts` 读取 `public/knowledge/fluent-demo.json` -> 根据条目 ID 展示内容。

页面不得硬编码知识正文。修改单个解释时，只更新知识库条目。v0.3 已在知识库控件模型中加入 `dialog.controls`，用于描述模拟窗口和窗口内部可点击控件。页面组件只根据这些结构渲染窗口、切换当前控件并在右侧解释面板显示对应说明。

### Fluent Solver 教学模拟器

2026-06-22 起，`/fluent-guide` 以新的 Fluent Solver 主界面教学模拟器作为主要展示方式。该模拟器仍然遵守第三方教学工具边界：

- 不连接 Fluent。
- 不执行真实仿真。
- 不使用 Ansys 或 Fluent 官方 Logo、截图、图标资源。
- 不逐像素复制官方视觉设计。
- 使用自主 CSS、HTML 结构和简化占位图标表达界面区域与操作逻辑。

模拟器代码和数据集中在 `src/fluentMock/`：

```text
src/fluentMock/
  FluentSolverMock.tsx      Fluent Solution 主工作台与事件调度
  fluentTypes.ts            控件、任务页、弹窗、解释和来源索引类型
  fluentControls.ts         Ribbon、功能树、任务页、图形窗口、控制台控件数据
  fluentDialogs.ts          模拟弹窗汇总入口与分支装配
  fluentExplanations.ts     控件解释数据汇总与占位解释生成
  fluentLayoutData.ts       汇总页面布局数据
  fluentLanguage.ts         EN / 中文 / 双语显示标签映射
  fluentTeachingExtras.ts   弹窗选项卡、下拉选项与关联计算器配置
  fluentResearchIndex.ts    Fluent 模拟器公开来源索引
  components/               UI 子组件（DialogStack、ExplanationPane、OutlinePane、FluentTeachingDiagram 等）
  data/                     分层教学数据（nestedSubDialogs、fluentTeachingDiagrams、dialogTeachingProfiles、boundaryBranches、dynamicMeshWorkflow 等）
  state/                    状态机与 TUI/桥接逻辑（fluentSimState、fluentMultiphaseState、fluentTuiCommands、fluentWorkbenchBridge 等）
  meshing/                  Fluent Meshing 工作台（FluentMeshingWorkbench、MeshingDialogs、meshingData、meshingOperationGuides 等）
```

数据流：

```text
用户点击控件 -> control.id -> control.explanationId -> fluentExplanationById -> 解释面板
用户点击树节点 -> panelId -> taskPanels -> 中间任务页切换
用户点击带 dialogId 的控件 -> fluentDialogs -> 模拟弹窗打开
用户点击弹窗控件 -> dialog control explanationId -> 解释面板
用户点击带 dialogId 的弹窗控件 -> fluentDialogs -> 下一层模拟弹窗打开
```

`FluentMockExplanation` 面向初学者解释控件时采用结构化字段：`whatItIs`、`recommendation`、`whenToUse`、`checkItems`、`commonMistakes` 和 `relatedControls`。右侧说明面板只渲染这些字段，不展示内部研究状态、TODO 或后续开发提示。新增 Fluent 页面、弹窗或窗口内控件时，必须同时补充对应解释数据和数据完整性测试。

后续补充新的 Fluent 窗口时，优先新增或修改 `fluentDialogs.ts`、`fluentControls.ts` 和 `fluentExplanations.ts` 中的数据。只有布局能力不足时才修改 `FluentSolverMock.tsx`。

## 静态部署

生产构建输出目录是 `dist`。`public/_redirects` 用于 Cloudflare Pages 单页应用路由回退。
