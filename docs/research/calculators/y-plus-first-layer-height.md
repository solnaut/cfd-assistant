# y+ 与第一层网格高度研究记录

## 基本信息

- 计算器 ID：y-plus-first-layer-height
- 计算器中文名称：y+ 与第一层网格高度
- 计算器英文名称：y+ and first-layer height
- 所属分类：近壁面与网格
- 研究记录版本：0.2
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限“用户输入壁面剪切应力”分支

## 当前结论

y+ 与第一层网格高度不应按单一经验式直接公开计算。该功能需要先区分外流/内流、局部/平均摩擦系数、Darcy/Fanning 摩阻系数、层流/湍流、壁面函数/近壁解析网格，以及第一层单元中心距离/完整第一层厚度。

本阶段公开最保守的“用户输入壁面剪切应力”分支。该分支不自动选择外流平板或管内摩阻关联式，只使用 y+ 定义、摩擦速度定义和用户输入的壁面剪切应力估算第一层中心距离。

公开公式：

```latex
y^+=\frac{yu_\tau}{\nu},\quad u_\tau=\sqrt{\frac{\tau_w}{\rho}},\quad h_1\approx 2y
```

其中 `y` 是壁面到第一层单元中心的距离，`h1` 是按单元中心位于第一层中点估算的完整第一层厚度。

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Y1 | NASA 技术报告 | A Generalized Wall Function | NASA Glenn Research Center / Shih 等 | Introduction, wall-bounded turbulent flows | https://ntrs.nasa.gov/api/citations/19990081113/downloads/19990081113.pdf | 2026-06-18 | 摩擦速度、壁面剪切、壁面法向距离和壁面函数语境 |
| Y2 | NASA 论文 | An ODE-based Wall Model for Turbulent Flow Simulations | NASA Advanced Supercomputing Division | Near-wall modeling background | https://www.nas.nasa.gov/publications/software/docs/cart3d/pages/publications/AIAA_2017-0528_berger_aftosmis.pdf | 2026-06-18 | y+ 在壁面模型中的使用背景 |
| Y3 | NASA 论文 | Investigation of Wall Function and Turbulence Model Performance | NASA Glenn Research Center | y+ grid spacing study | https://www.grc.nasa.gov/www/wind/papers/AIAA-2005-1002-Dippold.pdf | 2026-06-18 | y+ 范围对壁面函数和湍流模型表现的影响背景 |
| Y4 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Darcy friction factor, laminar pipe flow | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | 管内流动、Darcy 摩阻因子和层流条件 |
| Y5 | 大学课程讲义 | Notes on Friction Factors | TU Delft OpenCourseWare | Darcy/Fanning distinction | https://ocw.tudelft.nl/wp-content/uploads/FFHMT_07_NCR_REV_notes_on_friction_factors.pdf | 2026-06-18 | Darcy 与 Fanning 摩阻因子的区别核对 |

## 必须研究的问题

| 主题 | 需要确认的问题 | 当前状态 |
| --- | --- | --- |
| y+ 定义 | y+ 中的 y 是壁面到第一层单元中心距离，还是用户常说的完整第一层厚度 | source-checked for center-distance branch |
| 摩擦速度 | `u_tau = sqrt(tau_w/rho)` 的 tau_w 来源如何获得 | source-checked for user-input tau_w branch |
| 第一层中心距离/完整厚度 | `y` 是中心距离；`h1≈2y` 只在第一层中心位于单元中点时成立 | source-checked as geometry assumption |
| 动力黏度/运动黏度 | `nu=mu/rho`；当前公开分支使用 `mu` 与 `rho` 输入 | source-checked through Reynolds/y+ definitions |
| 外流平板经验关联式 | 平板层流、湍流局部/平均 Cf 公式与适用 Reynolds 范围 | internal-only; not public |
| 内流摩阻系数 | Darcy 与 Fanning 摩阻系数换算，光滑/粗糙管，层流/湍流分支 | internal-only; Darcy laminar branch source-checked in pipe calculator |
| 层流、湍流和转捩 | 管内层流 `Re_D<2300` 已记录；外流转捩默认不自动判断 | internal-only for y+ auto branches |
| 湍流模型 | 壁面函数、scalable wall functions、enhanced wall treatment、k-omega SST 近壁解析的 y+ 要求 | internal-only; requires Fluent-version-specific review |
| 几何场景 | 平板、管内流、外部绕流、旋转机械和复杂三维壁面的默认假设是否允许 | internal-only; no universal default |
| 验证案例 | 当前公开分支用公式代入测试；自动摩擦分支需另行双源验证 | implemented for public branch |

## 当前未公开分支原因

- 多个工程分支会导致完全不同的第一层高度估算。
- 经验关联式适用范围和特征长度定义不统一。
- Darcy 与 Fanning 摩阻系数混用会造成明显错误。
- 第一层中心距离与完整厚度混用会造成约 2 倍差异。

## Darcy、Fanning 与皮肤摩擦系数边界

- 当前公开分支不要求用户输入摩阻因子，因此不会在用户界面中混用 Darcy、Fanning 或外流 `Cf`。
- 管内 Darcy 摩阻因子 `f_D` 已在层流管道压降计算器中按 `f_D=64/Re_D` 单独实现。
- Fanning 摩阻因子与 Darcy 摩阻因子不是同一数值；后续如增加“用户输入摩擦系数”分支，必须在输入处明确选择 `Cf`、`f_D` 或 `f_F`，并分别写入换算和测试。
- 外流平板局部/平均摩擦系数具有不同定义，未完成双源核对前不得公开自动估算第一层高度。

## 后续实现边界

- 保持公开“用户输入壁面剪切应力”分支。
- 后续可增加“用户输入摩擦系数”分支，但必须明确 `Cf`、Darcy `fD`、Fanning `fF` 的定义。
- 外流平板和管内自动摩阻关联式必须完成来源交叉验证后才能公开。

## 输入参数

| 参数 ID | 名称 | SI 单位 | 说明 |
| --- | --- | --- | --- |
| `target-y-plus` | 目标 y+ | 1 | 用户希望第一层中心达到的 y+ |
| `wall-shear-stress` | 壁面剪切应力 | Pa | 用户输入或由已有结果估算 |
| `density` | 密度 | kg/m³ | 流体密度 |
| `dynamic-viscosity` | 动力黏度 | Pa·s | 用于计算运动黏度 |
| `reference-velocity` | 参考速度 | m/s | 用于输出 Reynolds 数与皮肤摩擦系数 |
| `characteristic-length` | 特征长度 | m | 用于输出 Reynolds 数 |

## 输出与中间量

| ID | 名称 | SI 单位 | 说明 |
| --- | --- | --- | --- |
| `first-cell-center-distance` | 第一层中心距离 | m | `y = y+ ν / uτ` |
| `first-layer-full-thickness` | 推荐第一层完整厚度 | m | `h1 ≈ 2y` |
| `reynolds-number` | Reynolds 数 | 1 | `ρUL/μ` |
| `skin-friction-coefficient` | 皮肤摩擦系数 | 1 | `Cf = 2τw/(ρU²)` |
| `wall-shear-stress` | 壁面剪切应力 | Pa | 用户输入值 |
| `friction-velocity` | 摩擦速度 | m/s | `sqrt(τw/ρ)` |
| `kinematic-viscosity` | 运动黏度 | m²/s | `μ/ρ` |

## 验证案例

| Case ID | 输入 | 期望输出 | 状态 |
| --- | --- | --- | --- |
| normal-001 | y+=1, τw=0.5 Pa, ρ=1.225 kg/m³, μ=1.7894e-5 Pa·s, U=10 m/s, L=1 m | y≈2.2862e-5 m, h1≈4.5724e-5 m, Re≈6.84587e5 | implemented |
| invalid-001 | τw=0 Pa | 抛出校验错误 | implemented |
