# 层流管道沿程压降研究记录

## 基本信息

- 计算器 ID：laminar-pipe-pressure-drop
- 计算器中文名称：层流管道沿程压降
- 计算器英文名称：Laminar pipe pressure drop
- 所属分类：流动与管路
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限圆管充分发展层流基础估算

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Poiseuille flow, Darcy friction factor | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | `f_D=64/Re_D`、层流条件、压降形式 |

## 公式定义

```text
Re = rho * V * D / mu
f_D = 64 / Re
Delta p = f_D * (L / D) * rho * V^2 / 2
```

```latex
Re=\frac{\rho V D}{\mu},\quad f_D=\frac{64}{Re},\quad \Delta p=f_D\frac{L}{D}\frac{\rho V^2}{2}
```

等价的圆管层流形式：

```latex
\Delta p=\frac{32\mu V L}{D^2}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Delta p | pressureDrop | 沿程压降 | Pa | 输出 | 管段摩擦压力损失 |
| Re | reynoldsNumber | Reynolds 数 | 1 | 中间量 | 以圆管直径为特征长度 |
| f_D | darcyFrictionFactor | Darcy 摩阻因子 | 1 | 中间量 | 圆管层流为 `64/Re` |
| L | pipeLength | 管长 | m | 输入 | 计算管段长度 |
| D | pipeDiameter | 圆管直径 | m | 输入 | 圆形截面管径 |
| rho | density | 密度 | kg/m³ | 输入 | 流体密度 |
| V | velocity | 平均速度 | m/s | 输入 | 截面平均速度 |
| mu | dynamicViscosity | 动力黏度 | Pa·s | 输入 | 流体动力黏度 |

## 适用范围与假设

- 仅适用于圆管、牛顿流体、不可压、充分发展层流基础估算。
- Purdue 资料中给出的层流条件为 `Re_D < 2300`。
- 不包含入口段、局部损失、高度差、可压缩修正、粗糙度影响或湍流摩阻关联式。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | L=10 m, D=0.05 m, rho=1000 kg/m³, V=0.02 m/s, mu=0.001 Pa·s | Re=1000, f_D=0.064, Delta p=2.56 Pa | 1e-12 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | L=1000 cm, D=50 mm, rho=1 g/cm³, V=2 cm/s, mu=1 mPa·s | Delta p=2.56 Pa | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | V=0, 其他正值 | Delta p=0, Re=0, f_D 显示为 0 | exact | 静止流边界处理 | ready |
| invalid-001 | 非法输入案例 | D=0 或 mu=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `D`、`rho`、`mu` 必须大于 0。
- `L` 和 `V` 可为 0 但不能为负。
- 当前实现对 `V=0` 返回零压降；此时 `64/Re` 在数学上未定义，因此中间量 `f_D` 按工程边界处理显示为 0。
- 若 `Re` 超出层流范围，后续可在 UI 增加提示；本阶段不自动切换湍流关联式。
