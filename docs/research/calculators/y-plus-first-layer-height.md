# y+ 与第一层网格高度研究记录

## 基本信息

- 计算器 ID：y-plus-first-layer-height
- 计算器中文名称：y+ 与第一层网格高度
- 计算器英文名称：y+ and first-layer height
- 所属分类：近壁面与网格
- 研究记录版本：0.4
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-21
- 访问日期：2026-06-21
- 审核状态：source-checked
- 是否允许公开计算：是，限本记录列明的分支和适用范围

## 当前实现范围

本计算器公开三种输入方式：

1. 初始估算：根据速度、尺度和物性估算 τw、uτ、y 与 h1。
2. 修正计算：已知壁面剪切应力 τw，直接反算 y 与 h1。
3. 自定义摩擦：已知与 `τw = 0.5 Cf ρU²` 一致的 Cf，反算 y 与 h1。

初始估算模式公开两类工况：

- 平板外流：湍流局部 Cf、层流局部 Cf、用户自定义 Cf。
- 管道内流：层流 Darcy f、光滑管 Blasius Darcy f、用户自定义 Darcy f、用户自定义 Fanning Cf。

y+ 结果后自动生成“边界层网格推荐方案”，直接使用 y+ 结果中的推荐第一层完整厚度 h1。

## 核心定义

```latex
y^+=\frac{yu_\tau}{\nu}
```

```latex
u_\tau=\sqrt{\frac{\tau_w}{\rho}}
```

```latex
\nu=\frac{\mu}{\rho}
```

```latex
y=\frac{y^+\nu}{u_\tau}
```

```latex
h_1\approx 2y
```

说明：

- `y` 是壁面到第一层单元中心的距离。
- `h1` 是按第一层单元中心位于该层中点估算的完整第一层厚度。
- 该近似不替代实际网格质量检查。

## 平板外流分支

平板外流使用用户输入特征长度 `L` 作为距前缘距离 `x`。

```latex
Re_x=\frac{\rho U x}{\mu}
```

### 湍流平板局部 Cf

默认选项。

```latex
C_{f,x}=0.0592Re_x^{-1/5}
```

```latex
\tau_w=\frac{1}{2}C_{f,x}\rho U^2
```

适用说明：

- 用于零压梯度、光滑平板湍流边界层局部初始估算。
- 当 `Re_x` 未超过常用平板转捩参考值时，界面给出温和提示，但不阻止计算。

### 层流平板局部 Cf

```latex
C_{f,x}=\frac{0.664}{\sqrt{Re_x}}
```

```latex
\tau_w=\frac{1}{2}C_{f,x}\rho U^2
```

适用说明：

- 用于零压梯度、层流 Blasius 平板局部初始估算。
- 常用转捩参考值约为 `Re_x = 5e5`，超出时界面给出温和提示，但不阻止计算。

### 用户自定义 Cf

```latex
\tau_w=\frac{1}{2}C_f\rho U^2
```

适用说明：

- 用户自行保证 Cf 与参考速度和几何定义一致。
- 该分支不自动推荐平板边界层总厚度，因为单独 Cf 不足以判断边界层厚度。

## 管道内流分支

管道内流使用用户输入的管径或水力直径 `D`。

```latex
Re_D=\frac{\rho U D}{\mu}
```

### 层流 Darcy f

```latex
f=\frac{64}{Re_D}
```

适用说明：

- 用于圆管充分发展层流基础估算。
- 常用层流范围 `Re_D < 2300`，超出时界面提示。

### 光滑管 Blasius Darcy f

```latex
f=0.3164Re_D^{-1/4}
```

适用说明：

- 用于光滑管湍流工程初始估算。
- 记录来源给出的常用范围为 `4000 < Re_D < 1e5`。
- 不处理粗糙度；粗糙管、Colebrook 或 Haaland 分支后续单独研究。

### Darcy 与 Fanning 换算

本工具内部 y+ 计算统一使用：

```latex
\tau_w=\frac{1}{2}C_f\rho U^2
```

若用户选择 Darcy 摩阻系数 `f`，则：

```latex
C_f=\frac{f}{4}
```

若用户选择 Fanning 摩擦系数 `Cf`，则直接用于 `τw = 0.5 Cf ρU²`，同时输出等效 Darcy `f = 4Cf`。

## 边界层网格推荐方案

该模块不是独立计算器，始终放在 y+ 结果后面。

### 等比层高

```latex
h_i=h_1r^{i-1}
```

### 总厚度

```latex
H_n=
\begin{cases}
h_1\dfrac{r^n-1}{r-1},&r\ne1\\
nh_1,&r=1
\end{cases}
```

### 按目标总厚度反算层数

```latex
n=\left\lceil\frac{\ln\left(1+\frac{H(r-1)}{h_1}\right)}{\ln r}\right\rceil
```

当 `r = 1`：

```latex
n=\left\lceil\frac{H}{h_1}\right\rceil
```

### 自动总厚度策略

平板外流层流：

```latex
\delta=\frac{5x}{\sqrt{Re_x}}
```

平板外流湍流：

```latex
\delta=\frac{0.37x}{Re_x^{1/5}}
```

管道内流：

- 未采用平板边界层厚度 δ。
- 默认工程预设为 `r = 1.2, n = 15`。
- 输出实际总厚度 `Hn` 与管径或水力直径 `D` 的比例 `Hn/D`。
- 用户可切换为指定目标总厚度 H 或指定层数 n。

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Y1 | NASA 技术报告 | A Generalized Wall Function | NASA Glenn Research Center / Shih 等 | Introduction, wall-bounded turbulent flows | https://ntrs.nasa.gov/api/citations/19990081113/downloads/19990081113.pdf | 2026-06-18 | 摩擦速度、壁面剪切、壁面函数语境 |
| Y2 | NASA 论文 | An ODE-based Wall Model for Turbulent Flow Simulations | NASA Advanced Supercomputing Division | Near-wall modeling background | https://www.nas.nasa.gov/publications/software/docs/cart3d/pages/publications/AIAA_2017-0528_berger_aftosmis.pdf | 2026-06-18 | y+ 在壁面模型中的使用背景 |
| Y3 | NASA Glenn 验证案例 | Laminar Flat Plate: Study #1 | NASA Glenn Research Center | Blasius laminar flat plate comparison | https://www.grc.nasa.gov/www/wind/valid/fplam/fplam01/fplam01.html | 2026-06-21 | 平板层流边界层和 Blasius 参考背景 |
| Y4 | 大学课程讲义 | Boundary Layer: Laminar Boundary Layer | Purdue University / C. Wassgren | Blasius flat plate summary | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/BoundaryLayer_LaminarBL_Reading.pdf | 2026-06-21 | 层流平板 Cf、δ、转捩参考 |
| Y5 | 大学课程讲义 | Turbulent Flat Plate Boundary Layer | Pennsylvania State University / J. M. Cimbala | local Cf and boundary-layer thickness summary | https://www.me.psu.edu/cimbala/me320/Lesson_Notes/Fluid_Mechanics_Lesson_13D.pdf | 2026-06-21 | 湍流平板局部 Cf、δ、局部/平均 Cf 区分 |
| Y6 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Darcy f, laminar pipe, Blasius approximation, law-of-wall | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-21 | Darcy f、`f=64/Re_D`、Blasius、`uτ` 与 y+ |
| Y7 | 大学课程讲义 | Notes on Friction Factors | TU Delft OpenCourseWare | Darcy/Fanning distinction | https://ocw.tudelft.nl/wp-content/uploads/FFHMT_07_NCR_REV_notes_on_friction_factors.pdf | 2026-06-18 | Darcy 与 Fanning 术语核对 |

## 输入参数

| 参数 ID | 名称 | SI 单位 | 说明 |
| --- | --- | --- | --- |
| `target-y-plus` | 目标 y+ | 1 | 用户希望第一层中心达到的 y+ |
| `flow-scenario` | 流动场景 | - | 平板外流或管道内流 |
| `flat-plate-friction-method` | 平板摩擦系数公式 | - | 湍流平板、层流平板或用户自定义 Cf |
| `pipe-friction-method` | 管道摩阻估算方式 | - | 层流 Darcy、Blasius Darcy、自定义 Darcy 或自定义 Fanning |
| `wall-shear-stress` | 壁面剪切应力 τw | Pa | 修正计算模式下用户输入 |
| `friction-coefficient` | Cf | 1 | 平板自定义或已知 Cf 模式使用 |
| `darcy-friction-factor` | Darcy 摩阻系数 f | 1 | 管道自定义 Darcy 输入 |
| `fanning-friction-coefficient` | Fanning 摩擦系数 Cf | 1 | 管道自定义 Fanning 输入 |
| `density` | 密度 ρ | kg/m³ | 流体密度 |
| `dynamic-viscosity` | 动力黏度 μ | Pa·s | 用于计算 ν |
| `reference-velocity` | 参考速度 U | m/s | 平板自由来流或管道平均速度 |
| `characteristic-length` | 特征长度 L | m | 平板外流中作为 x 使用 |
| `hydraulic-diameter` | 管径或水力直径 D | m | 管道内流 Reynolds 数特征长度 |
| `grid-growth-rate` | 增长率 r | 1 | 边界层网格相邻层高度比 |
| `grid-recommendation-method` | 推荐方式 | - | 自动总厚度、指定 H 或指定 n |
| `target-total-thickness` | 目标总厚度 H | m | 指定 H 分支使用 |
| `grid-layer-count` | 层数 n | 1 | 指定 n 分支使用 |

## 输出与中间量

| ID | 名称 | SI 单位 | 说明 |
| --- | --- | --- | --- |
| `first-cell-center-distance` | 第一层中心距离 | m | `y = y+ν/uτ` |
| `first-layer-full-thickness` | 推荐第一层完整厚度 | m | `h1 ≈ 2y` |
| `reynolds-number` | Re_x | 1 | 平板外流局部 Reynolds 数 |
| `pipe-reynolds-number` | Re_D | 1 | 管道 Reynolds 数 |
| `darcy-friction-factor` | Darcy f | 1 | 管道分支输出 |
| `wall-friction-coefficient` | Fanning 或局部 Cf | 1 | 用于 τw 计算的无量纲系数 |
| `wall-shear-stress` | 壁面剪切应力 | Pa | 输入或由摩擦系数估算 |
| `friction-velocity` | 摩擦速度 uτ | m/s | `sqrt(τw/ρ)` |
| `kinematic-viscosity` | 运动黏度 ν | m²/s | `μ/ρ` |
| `friction-method` | 摩擦系数方法 | - | 当前采用的公式或输入类型 |
| `boundaryLayerPlan` | 边界层网格推荐方案 | - | 层数、每层高度、累计厚度、Hn/D 等 |

## 验证案例

| Case ID | 输入 | 期望输出 | 状态 |
| --- | --- | --- | --- |
| flat-turbulent-001 | 平板外流湍流；y+=1, ρ=1.225 kg/m³, μ=1.7894e-5 Pa·s, U=10 m/s, L=1 m, r=1.2 | Re_x≈6.84587e5, Cf≈0.00402936, τw≈0.246798 Pa, uτ≈0.448852 m/s, y≈3.25438e-5 m, h1≈6.50876e-5 m, δ≈0.0251357 m | implemented |
| flat-laminar-001 | 平板外流层流；y+=1, ρ=1.225 kg/m³, μ=1.7894e-5 Pa·s, U=1 m/s, L=1 m, r=1.2 | Re_x≈68458.7, Cf≈0.002538, 自动 H=δ≈0.0191098 m | implemented |
| flat-custom-cf-001 | 平板外流用户 Cf=0.005 | Cf=0.005；不自动使用平板 δ；默认 n=15 | implemented |
| pipe-laminar-001 | 管道内流层流；y+=1, ρ=1000 kg/m³, μ=0.001 Pa·s, U=0.02 m/s, D=0.05 m | Re_D=1000, Darcy f=0.064, Cf=0.016, τw=0.0032 Pa, y≈5.59017e-4 m, h1≈1.11803e-3 m, 默认 n=15 | implemented |
| pipe-blasius-001 | 管道内流 Blasius；ρ=1000 kg/m³, μ=0.001 Pa·s, U=1.5 m/s, D=0.05 m | Re_D=75000, f=0.3164 Re_D^-0.25, Cf=f/4 | implemented |
| pipe-custom-darcy-001 | 管道内流用户 Darcy f=0.02 | 输出 Darcy f=0.02, Cf=0.005 | implemented |
| pipe-custom-fanning-001 | 管道内流用户 Fanning Cf=0.005 | 输出 Cf=0.005, 等效 Darcy f=0.02 | implemented |
| known-tauw-001 | 已知 τw；y+=1, τw=0.5 Pa, ρ=1.225 kg/m³, μ=1.7894e-5 Pa·s | ν≈1.46073e-5 m²/s, uτ≈0.638877 m/s, y≈2.2862e-5 m, h1≈4.5724e-5 m | implemented |
| known-cf-001 | 已知 Cf；y+=1, Cf=0.005, ρ=1.225 kg/m³, μ=1.7894e-5 Pa·s, U=10 m/s | τw=0.30625 Pa, uτ=0.5 m/s, y≈2.92147e-5 m, h1≈5.84294e-5 m | implemented |
| grid-target-001 | 已知 h1, r=1.2, H=10 mm | 按对数公式反算 n，Hn≥H，输出差值 | implemented |
| grid-fixed-n-001 | 已知 h1, r=1.2, n=5 | 正向输出 Hn、hn、每层高度和累计厚度 | implemented |
| grid-r1-001 | 已知 h1, r=1, H=1 mm | `n=ceil(H/h1)`，`Hn=n h1` | implemented |
| unit-001 | 已知 τw；ρ=0.001225 g/cm³, μ=0.017894 mPa·s，其余同 known-tauw-001 | 输出与 known-tauw-001 一致 | implemented |
| invalid-001 | 目标 y+=0 | 抛出校验错误 | implemented |
| copy-001 | n=3 的边界层方案 | 表格、CSV、简要方案格式可复制 | implemented |

## 公开页面说明边界

- y+ 结果用于初始网格估算，不是最终网格质量保证。
- 最终应以后处理 y+ 分布校核。
- 平板自动总厚度推荐只适用于零压梯度平板初始估算。
- 管道内流没有默认套用平板 δ 公式。
- 管道内流默认推荐是工程初始网格预设，用户可修改层数或总厚度。
- Darcy f 和 Fanning Cf 不得混淆。

## 后续待扩展

- 粗糙管、Colebrook、Haaland 或 Swamee-Jain 等湍流摩阻分支。
- 外流曲面、绕流、旋转机械、分离流和强压力梯度工况。
- 与不同 Fluent 近壁处理和湍流模型目标 y+ 的版本化建议。
