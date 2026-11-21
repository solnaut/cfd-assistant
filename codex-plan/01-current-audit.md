# 01 - 现状问题深度审计（Current Audit）

本文基于对当前仓库代码（截至 commit `39e77ed`）的逐文件核查，系统整理现有 Fluent 功能导览模块为什么“不像真实 Fluent、操作不够真、视觉仍偏普通网页”。

---

## 1. 外壳仍像普通网页而非桌面工程软件

- **页面外层包裹过重**：[src/pages/FluentGuidePage.tsx](../src/pages/FluentGuidePage.tsx#L5-L19) 将 `<FluentSolverMock />` 放在常规网页 `.page` 容器内，上方存在 `Breadcrumbs` 和大号 `PageHeader`（占去大量首屏高度）。
- **冗余横条与违和的窗口装饰**：
  - [src/fluentMock/FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L101-L106) 顶部多出一个无点击作用的 `.fluent-solver-entry-bar` 按钮条（`<button>Fluent Solver 主界面模拟器</button>`）。
  - [src/fluentMock/FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L185-L189) 与 [src/App.css](../src/App.css#L1682-L1693) 在 Ribbon 左侧画了 3 个圆点 `.fluent-window-dots`（macOS 风格红绿灯占位），而 Ansys Fluent 绝大多数工程用户使用的都是 Windows/Qt 桌面端工程软件界面。

---

## 2. 主工作区四大面板空间位置与比例不对

当前布局定义在 [src/fluentMock/FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L121-L154) 与 [src/App.css](../src/App.css#L1833-L1839)：

```text
当前错误排布：
┌──────────────┬─────────────────────────┬─────────────────────────┬──────────────┐
│ Outline      │ Task Pane (上半部分)     │ Graphics Pane           │ Explanation  │
│ (250px)      ├─────────────────────────┤ (整列独占)               │ (330px)      │
│              │ Console (在任务页下方)    │                         │              │
└──────────────┴─────────────────────────┴─────────────────────────┴──────────────┘
```

**与真实 Fluent Solver 的差异**：
- 在真实 Ansys Fluent 桌面端中，**Task Page 通常是独立贯穿高度的面板**（位于 Outline View 右侧），而 **Console / TUI 控制台位于右侧 Graphics / Plots 视口正下方**（不是压在 Task Page 底下，导致 Task Page 高度被压缩、只能显示几颗按钮，而 Graphics 区下方又没有控制台）。
- 图形视口缺少真实的 **MDI 多标签页**（如 `Mesh` / `Graphics` / `Scaled Residuals` / `XY Plot` 切换）。

---

## 3. 所有控件被拍平为“两列大按钮墙”

当前 [src/fluentMock/FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L597-L620) 中的 `MockControlButton` 以及 [src/App.css](../src/App.css#L1990-L2047) 中的 `.fluent-task-control-grid` 存在根本性失真：

- 无论是 `button`、`radio`、`checkbox`、`select` 还是 `field`，全部渲染成 `<button class="fluent-mock-control">` 放进 `grid-template-columns: repeat(2, minmax(0, 1fr))` 的圆角按钮格子里。
- 造成的体验问题：
  1. `field`（输入框，如 `No. of Iterations: 250`、`Density: 1.225`）**不能真正输入数值**，只能当按钮点一下；
  2. `select`（下拉框，如 `Pressure-Velocity Coupling: SIMPLE`）**不能真正展开选项切换**（如切换到 `Coupled` 或 `PISO` 并查看两者差异）；
  3. `radio` / `checkbox`（如 `Steady` / `Transient`、`Gravity`）没有真正的分组互斥或勾选状态管理（点击后仅靠 `activeControlId` 变色，一点击别的控件刚才的“选中圈”就消失了）；
  4. `Models`、`Materials`、`Boundary Conditions`、`Cell Zone Conditions` 在真实 Fluent 中是**带状态列的纵向列表框（ListBox）+ 底部操作按钮（`Edit...` / `Create/Edit...`）**，而不是并排大按钮。

---

## 4. 树形目录太浅、无状态联动、多级弹窗体验断裂

1. **Outline 树只有 1 层节点**：
   - [src/fluentMock/fluentControls.ts](../src/fluentMock/fluentControls.ts#L210-L285) 的 `setupNodes` / `solutionNodes` / `resultsNodes` 只建了扁平的一级按钮。
   - 用户无法像真实 Fluent 一样展开 `Models` 看到 `Energy (Off)` / `Viscous (SST k-omega)`，无法展开 `Materials -> Fluid -> air`，无法展开 `Boundary Conditions -> velocity-inlet / pressure-outlet / wall`，也不支持**双击节点直接弹窗**和**右键菜单**。
2. **完全没有跨模块状态联动**：
   - 切换 `General -> Transient` 后，`Run Calculation` 任务页依然只显示 `No. of Iterations: 250`；
   - 在 `Energy 模型` 弹窗中勾选或取消 `启用 Energy` 后，边界条件窗口里没有出现/隐藏 `Thermal` 标签页，`Solution Methods` 也不会联动变化；
   - `General -> Gravity` 与 `Operating Conditions` 各自孤立。
3. **弹窗不支持栈式叠加，定位写死，按钮无真实响应**：
   - [src/fluentMock/FluentSolverMock.tsx](../src/fluentMock/FluentSolverMock.tsx#L26) 仅维护单一字符串 `openDialogId: string | null`。在 `Materials` 弹窗点 `Create/Edit` 时，父窗口直接被替换覆盖，关闭子窗口后回不到父窗口。
   - [src/App.css](../src/App.css#L2278-L2294) 中 `.fluent-dialog-backdrop` 写死了 `inset: 150px 340px 18px 520px`，不能拖拽移动，按 `Esc` 不能关闭。
   - `MockDialog` 底部“应用（Apply）”按钮（[FluentSolverMock.tsx#L581-L583](../src/fluentMock/FluentSolverMock.tsx#L581-L583)）没有任何 `onClick` 逻辑。
4. **Console 控制台是静态写死按钮**：
   - [FluentSolverMock.tsx#L448-L482](../src/fluentMock/FluentSolverMock.tsx#L448-L482) 把整个 Console 做成了一个 `<button>`，里面硬编码 5 行静态文本（`water\nair\nMesh check completed.`），用户点 `Mesh Check`、`Initialize`、`Calculate` 没有任何控制台反馈或交互命令支持。

---

## 5. 视觉仍偏网页风格、图标简陋、图形视口缺少 Fluent 特征

- **网页卡片化美学残留**：在 [src/App.css](../src/App.css#L1656-L2333) 中存在大量大圆角（`border-radius: 10px–14px`）、大内边距（`16px–18px`）、网页阴影以及 `.fluent-dialog-titlebar` 的青绿色渐变（`#31546a → #4d7085`），一眼看去仍是网页卡片而不是桌面 CAE 软件。
- **单字方块占位图标**：[FluentSolverMock.tsx#L235-L237](../src/fluentMock/FluentSolverMock.tsx#L235-L237) 与 [#L404](../src/fluentMock/FluentSolverMock.tsx#L404) 直接用 `{control.labelZh.slice(0, 1)}` 截取第一个汉字放进方框里（例如 Ribbon 和图形工具栏里出现一堆“显 / 信 / 缩 / 检 / 选 / 旋 / 平”单字块），导致图标完全无法直观识别。
- **Graphics 画布与工具栏简陋**：[src/App.css#L2092-L2143](../src/App.css#L2092-L2143) 仅是纯白底色 CSS 网格线加一个倾斜椭圆；缺少 Fluent 标志性的**浅蓝到纯白纵向渐变背景**、**RGB 彩色 3D 坐标轴 Triad**、**比例尺（Scale Bar）**、**云图图例条（Colorbar）**以及有明确 SVG 图标的视图工具栏。

---

## 6. 界面术语翻译错乱与中英文混杂

检查 [src/fluentMock/fluentControls.ts](../src/fluentMock/fluentControls.ts) 和 [src/fluentMock/fluentDialogs.ts](../src/fluentMock/fluentDialogs.ts) 可发现明显术语问题：

- **误译**：`ribbon-tab-file`（line 49）写成了 **`'与文件'`**；`tree-section-solution`（line 275）写成了 **`'后台'`**（应为 `Solution` / `求解`）。
- **混杂**：同一棵树里既有 `一般`、`模型`、`图`，又有未汉化的 `Motion Definitions`、`Dashboard`；面板中既有 `Turbulence Specification`、`Mass Flow Rate`，又有 `基于压力`、`检查项目`。
- **与实际学习场景脱节**：国内高校与工程团队实际安装的 Fluent 软件绝大多数为英文界面（或以英文主菜单/树节点名称为对照基准）。强行全部改成不准确的中文，反而会导致学习者在真实软件里找不到对应按钮。**正确策略是：默认以 Fluent 标准英文界面为主（或一键切换“英文原版 / 双语对照 / 简体中文”），同时右侧解释面板使用清晰地道的中文工程讲解。**

---

## 7. 解释内容大量依赖通用模板、关联跳转失效

- 在 [src/fluentMock/fluentExplanations.ts](../src/fluentMock/fluentExplanations.ts#L149-L337) 中，只有约 15 个控件编写了 `overrides`，其余大量控件全部落入 `createExplanation` 的 `moduleProfiles` 通用模板，输出诸如 *“XXX 是 YYY 中的按钮，用于学习该位置对应的 Fluent 设置含义”* 的空泛话术，缺少参数意义、推荐取值、选项对比。
- 右侧 `ExplanationPane`（[FluentSolverMock.tsx#L517-L523](../src/fluentMock/FluentSolverMock.tsx#L517-L523)）的 `relatedControls` 只是纯静态 `<span>`，点击无任何反应；也完全没有跳转到本项目已经建好的 25 个 CFD 计算器（例如在 `Viscous` / `Near-Wall Treatment` 下直达 `y+ 与第一层网格高度` 计算器，在 `Run Calculation` 时间步下直达 `CFL 与时间步长` 计算器）。

---

## 8. 搜索入口形同虚设、样式与数据单体膨胀

- **假搜索框**：[FluentSolverMock.tsx#L205-L211](../src/fluentMock/FluentSolverMock.tsx#L205-L211) 的 Ribbon 顶部 `<input placeholder="查找命令" type="search" />` 没有 `value` 也没有 `onChange`，输入任何内容都不会搜索。
- **CSS 与数据文件持续膨胀**：所有 Fluent 样式全堆在 [src/App.css](../src/App.css)（已 2467 行，其中 Fluent 占 1625–2467 行约 840 行）；[fluentControls.ts](../src/fluentMock/fluentControls.ts)（684 行）与 [fluentDialogs.ts](../src/fluentMock/fluentDialogs.ts)（1218 行）已成大单体，继续往里堆数百个真实控件和弹窗会难以维护。
