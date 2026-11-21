# 02 - 视觉系统与桌面级布局规范（Visual & Layout Spec）

本规范定义重构后 Fluent Solver 教学模拟器的视觉风格、设计 Token、页面集成方式以及与真实 Ansys Fluent Solver（2024 R2 / 2025 R1 风格基准）1:1 对齐的 5 大工作区 + 1 个右侧教学伴随面板。

---

## 1. 视觉美学定位：桌面工程 CAE 软件（而非网页卡片）

### 1.1 设计原则
- **高信息密度与克制装饰**：去除所有 10px 以上大圆角、网页渐变按钮、浮夸阴影；使用桌面端常见的 `2px–4px` 微圆角与 `1px` 清晰物理边界线。
- **严格区分“模拟器区”和“教学区”**：
  - 左侧主工作台（Titlebar + Ribbon + Outline + Task Page + Viewport + Console）严格模拟桌面 CAE 窗口风格（冷灰窗体 `#e8ebef` / `#f0f2f5` + 纯白表单区 + 经典 Windows/Qt 蓝高亮 `#0078d4` / `#cce4f7`）；
  - 最右侧 **Teaching Inspector（教学解释面板）** 使用清晰舒适的浅色阅读排版（保留合适行距与字号），让用户一眼分清“左面是 Fluent 操作界面，右面是老师在旁边讲”。
- **100% 自主实现，合规安全**：所有色彩 Token、边框与自主几何 SVG 图标均由本项目自主编写，不引入 Ansys Logo、官网截图或官方软件提取图标。

### 1.2 核心 CSS Design Tokens（`src/fluentMock/styles/fluentTokens.css`）

```css
.fluent-workbench-theme {
  /* 窗体与背景层级 */
  --fl-bg-shell: #e3e7ec;          /* 主工作台分隔底色 */
  --fl-bg-ribbon: #f3f5f8;         /* Ribbon 命令区底色 */
  --fl-bg-ribbon-tabbar: #e6ebf1;  /* Titlebar & Tab 条底色 */
  --fl-bg-pane: #f7f8fa;           /* Outline / Task Page 容器背景 */
  --fl-bg-surface: #ffffff;        /* ListBox / Input / GroupBox 内底色 */
  --fl-bg-header-start: #f4f6f9;   /* 窗格标题栏顶部渐变 */
  --fl-bg-header-end: #e2e7ee;     /* 窗格标题栏底部渐变 */

  /* 边框与分割线 */
  --fl-border-strong: #9aa5b4;     /* 窗口外框与激活框 */
  --fl-border-pane: #b8c2ce;       /* 窗格边框 */
  --fl-border-control: #aeb8c4;    /* 按钮、输入框、下拉框边框 */
  --fl-border-subtle: #d5dce4;     /* GroupBox 与列表分割线 */

  /* 选中、悬停与强调色 */
  --fl-accent: #0078d4;            /* 桌面蓝主高亮 */
  --fl-accent-hover: #106ebe;
  --fl-accent-soft: #d9ecfa;       /* 树节点 / 列表行选中底色 */
  --fl-accent-soft-border: #84bce8;
  --fl-file-tab-bg: #124d78;       /* File 菜单按钮经典深蓝强调 */
  --fl-focus-flash: #f59e0b;       /* 全局搜索 / 关联控件跳转时的闪烁定位框 */

  /* 文字色阶 */
  --fl-text-primary: #1a222d;
  --fl-text-secondary: #495668;
  --fl-text-muted: #6e7b8c;
  --fl-text-disabled: #9ba5b2;

  /* 图形视口经典渐变 */
  --fl-viewport-top: #74a6d4;
  --fl-viewport-mid: #c5dcf0;
  --fl-viewport-bottom: #f7fafe;

  /* 字体与紧凑尺寸 */
  --fl-font-ui: 'Segoe UI', 'Microsoft YaHei UI', system-ui, sans-serif;
  --fl-font-mono: Consolas, 'Cascadia Mono', 'Courier New', monospace;
  --fl-radius-sm: 2px;
  --fl-radius-md: 3px;
  --fl-shadow-dialog: 0 10px 28px rgba(15, 25, 38, 0.24);
}
```

---

## 2. 页面外壳重构（全屏桌面式工作台）

修改 [src/pages/FluentGuidePage.tsx](../src/pages/FluentGuidePage.tsx)：
- 在 `/fluent-guide` 路由下，去掉占用高度的网页 `Breadcrumbs` 和大号 `PageHeader`，避免上下滚动才能看见 Console。
- 顶部保留一条 **36px 紧凑集成顶栏（Top Utility Strip）**：
  - 左侧：返回首页 / 参数计算 / CFD 公式库快捷链接 + 本页面标题徽标（纯文本 `CFD Assistant · Fluent Solver 教学工作台`）；
  - 右侧功能控制区：
    1. **界面语言切换器**：`English (Fluent 原版)`（**默认**）/ `双语对照 (EN/中文)` / `简体中文`；
    2. **Guided Walkthrough 按钮**：开启/收起“10 步单相流动入门实操引导条”；
    3. **重置算例状态（Reset Case）**：恢复初始案例状态；
    4. **展开/收起右侧解释面板**：让用户在小屏或想专注看界面时可一键折叠右侧教学栏；
    5. **全屏模式切换**：调用浏览器 Fullscreen API 或铺满视口（`100vw × 100vh`）。
- 桌面端下整个模拟器外框占据 `width: 100%; height: calc(100vh - 96px)`（视顶部全局导航保留情况调整，全屏模式下占 `100vh - 36px`），内部各窗格独立滚动，**禁止整页出现割裂的二级横向大滚动条**。

---

## 3. 整体 5+1 区域空间布局蓝图

桌面端（`>= 1200px`）严格按照真实 Ansys Fluent Solver + 右侧教学伴随面板排布：

```text
+---------------------------------------------------------------------------------------------------+
| [Title Bar & QAT]  Fluent Solver Simulator [3d, dp, pbns, sstkw]   [Quick Search______] [?] [-][x]|
+---------------------------------------------------------------------------------------------------+
| [File] | Domain | Physics | User-Defined | Solution | Results | View | Parallel | Design | ...    |
+---------------------------------------------------------------------------------------------------+
| [Large/Stacked Ribbon Groups: Mesh | Zones | Interfaces | Mesh Model | Adapt | Surface ...]       |
+-------------------+-------------------------+---------------------------------+-------------------+
| Outline View      | Task Page               | MDI Viewport Tabs               | Teaching          |
| (230px)           | (310px, full height)    | [Mesh] [Graphics] [Residuals]   | Inspector         |
|                   |                         +--+---------------------------+--+ (350px)          |
| [Filter tree...]  | General / Viscous /     |T |                           |  |                   |
| v Setup           | Materials / BC ...      |o |   Fluent Blue-White       |  | Location Badge    |
|   > General       |                         |o |   Gradient 3D Viewport    |  | Title (EN / ZH)   |
|   v Models        | +-[GroupBox]----------+ |l |   (Demo Elbow / Pipe,     |  |                   |
|     Multiphase    | | (o) Pressure-Based  | |b |    Contours / Mesh /      |  | [是什么]          |
|     Energy (Off)  | | ( ) Density-Based   | |a |    Vectors, Scale, Triad) |  | [工程建议]        |
|     Viscous (SST) | +---------------------+ |r |                           |  | [适用场景]        |
|   > Materials     |                         +--+---------------------------+--+ [设置前检查]      |
|   > Cell Zones    | +-[ListBox]-----------+ |  [Selection Filter: all v]      | [常见误区]        |
|   > Boundary Cond.| | velocity-inlet      | +---------------------------------+                   |
| v Solution        | | pressure-outlet     | | Console / TUI                   | [关联控件跳转]    |
|   > Methods       | | wall-heated         | | > /mesh/check                   | [关联CFD计算器]   |
|   > Initialization| +---------------------+ | Mesh check completed.           |                   |
|   > Run Calc...   | [Edit...] [Display...]  | > _                             |                   |
+-------------------+-------------------------+---------------------------------+-------------------+
```

### 3.1 区域尺寸与可调整性
| 区域 | 宽度 / 高度定位 | 核心要求 |
| --- | --- | --- |
| **Title Bar + Ribbon** | 顶部全宽，Title Bar `30px` + Ribbon Tabs `26px` + Command Band `82px` | `File` 为深蓝填充标签页，其余为桌面灰底切换标签；支持双击标签收起/展开命令区 |
| **Outline View** | 左侧 `230px`（支持 `190px–300px` 拖拽分隔条或最小 `220px`） | 顶部搜索过滤框 + 全部展开/折叠图标；多级树带展开三角与小图标；右边缘带 4px 分隔条 |
| **Task Page** | Outline 右侧 `310px`，**贯穿整个主工作区全高** | 头部显示当前页面英文/中文名；中间为经典 `GroupBox` 表单与可滚动 `ListBox`；底部固定常用动作按钮 |
| **Viewport + Console 分栏** | 占据中间剩余全部弹性宽度（`minmax(360px, 1fr)`） | 垂直分割：**上方 66% 为 Graphics/Plots MDI 视口，下方 34% 为 Console/TUI 控制台**（带水平拖拽分隔线） |
| **Teaching Inspector** | 最右侧 `350px`（可一键收起成窄条） | 独立白色/微灰阅读样式，跟随左侧任何点击/下拉切换实时刷新；包含可点击相关控件及站内计算器跳转 |

---

## 4. 各区域细节规范

### 4.1 Ribbon 菜单与自主 SVG 图标系统
- **Tab 顺序（1:1 对齐 Fluent）**：
  1. `File`（点击后展开 Backstage 下拉菜单：`Read -> Case & Data...`、`Write -> Case & Data...`、`Import`、`Export`、`Preferences`）
  2. `Domain`（Mesh: Display, Info, Scale, Check, Quality; Zones: Combine, Separate, Adjacency, Delete; Interfaces; Mesh Model: Dynamic Mesh; Adapt: Mark, Refine; Surface: Create, Manage）
  3. `Physics`（Models: Multiphase, Energy, Viscous, Radiation, Species, Discrete Phase; Materials: Create/Edit, Database; Zones: Cell Zones, Boundaries; Reference Values; Operating Conditions）
  4. `User-Defined`（Named Expressions, Field Functions, UDF 教学入口）
  5. `Solution`（Run Type: Steady/Transient; Initialization: Hybrid, Standard, Patch; Solution: Methods, Controls, Monitors, Report Definitions; Run Calculation: Check Case, Preview Mesh Motion, Calculate）
  6. `Results`（Graphics: Mesh, Contours, Vectors, Pathlines; Plots: XY Plot, Histogram; Reports: Fluxes, Forces, Surface Integrals; Surfaces: Plane, Iso-Surface）
  7. `View`（Graphics Window Layout, Views, Annotations, Reset Layout）
  8. `Parallel`（Processes, Partitioning 教学入口）
  9. `Design` / `Parameters` / `Learning & Support`（其中 `Learning & Support` 内可直达本项目公式库与 CFD 计算器总览）
- **Ribbon 按钮形态**：
  - 支持 **大按钮**（32×32px SVG 图标在上 + 1–2 行标签在下，如 `Display`、`Check`、`Viscous`、`Calculate`）；
  - 支持 **3 行小按钮堆叠列**（16×16px SVG 图标在左 + 文本在右，如 `Scale` / `Quality` / `Info`）；
  - 彻底移除 `{labelZh.slice(0, 1)}` 单字方块。由 `src/fluentMock/icons/FluentIcons.tsx` 提供 30+ 个统一线框+双色点缀的矢量 SVG 图标（如网格立方体、温度计、涡旋流线、天平、烧杯材料、边界箭头、柱状/折线监控、放大镜、坐标轴等）。

### 4.2 语言显示策略（解决“中英混杂与找不到按钮”痛点）
为兼顾“与真实软件位置/名称完全一致”与“初学者能读懂”，所有界面标签数据结构统一采用 `{ labelEn: string; labelZh: string }`，由顶部切换器控制：
1. **`en`（默认：`English (Fluent 原版)`）**：Ribbon、Tree、Task Page、Dialog 控件全部显示标准 Fluent 英文原名（如 `File`、`Solution`、`General`、`Viscous (SST k-omega)`、`Pressure-Velocity Coupling`），右侧解释面板用中文标题 + 英文对照 + 详细中文解释。这是最符合高校与企业真实上机习惯的模式。
2. **`bilingual`（`双语对照`）**：主标签显示英文，在关键节点或旁注附简短中文（如 `General (常规)`、`Solution (求解)`）。
3. **`zh`（`简体中文`）**：显示准确校对后的工程中文（修正旧版错译：`File`→`文件`，`General`→`常规`，`Solution`→`求解`，`Plots`→`曲线图`）。

### 4.3 图形视口（MDI Viewport）与工具栏
- **MDI 标签栏**：顶部标签支持切换 `Mesh`、`Graphics`、`Scaled Residuals`、`XY Plot`。
- **画布背景**：Fluent 标志性自上而下蓝白渐变（`linear-gradient(180deg, #74a6d4 0%, #c5dcf0 45%, #f7fafe 100%)`），去除普通网页斜椭圆与白底网格线。
- **可控 2.5D 矢量/网格示例模型（90° 弯管或台阶管教学模型）**：
  - 视图模式随当前操作真实切换：
    - `Mesh` 模式：显示几何轮廓、边界面高亮（如选中 `velocity-inlet` 时入口蓝高亮、选中 `wall-heated` 时壁面红高亮）及示意网格线；
    - `Contours` 模式：渲染平滑分色速度/温度云图区域 + 右侧 **Fluent 风格垂直 Colorbar 色阶标尺**（含物理量名称、单位、Max/Min 刻度）；
    - `Vectors` 模式：在流道内绘制按速度大小着色的方向矢量箭头；
    - `Scaled Residuals` 模式：当用户运行模拟计算后，绘制 `continuity / x-velocity / y-velocity / z-velocity / k / omega / energy` 对数收敛曲线；
    - `XY Plot` 模式：绘制沿中心线或截面的速度/温度分布曲线。
- **视口内固定组件**：
  - 右下角：**SVG 3D RGB 坐标轴 Triad**（红色 X 轴、绿色 Y 轴、蓝色 Z 轴）；
  - 左下角：**比例尺刻度条**（如 `0 — 0.05 — 0.1 m`）；
  - 左侧竖向 **Graphics Toolbar**：全部使用 SVG 图标（Box Zoom、Pan、Rotate、Fit to Window、Probe/Select、Mesh Edges、Lighting/Shading、Reset View），支持真实缩放/平移/高亮反馈；
  - 底部：**Selection Filter Bar**（真实 `<select>` 切换 `all` / `faces` / `edges` / `cells`）。

### 4.4 控制台（Console / TUI）
- 外观：纯白背景（Fluent 默认浅色 Console）或经典等宽终端区，含历史输出日志滚动区 + 底部 `> ` 命令提示行。
- 交互能力：
  - 执行 `Check`、`Report Quality`、`Initialize`、`Calculate` 或弹窗 `Apply`/`OK` 时，自动追加带时间戳或典型 Fluent 格式的仿真输出（明确标注教学模拟日志）；
  - 支持直接输入或点击快捷 TUI 芯片运行命令：如 `help`、`/mesh/check`、`/mesh/quality`、`/solve/initialize/hyb-initialization`、`/solve/iterate 50`、`clear`。
