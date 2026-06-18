# CFL 与时间步长研究记录

## 基本信息

- 计算器 ID：cfl-time-step
- 计算器中文名称：CFL 与时间步长
- 计算器英文名称：CFL number and time step
- 所属分类：瞬态与时间步长
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，但首版仅公开一维形式

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学/军校课程讲义 | Time-Integrators | Naval Postgraduate School / Francis X. Giraldo | Courant number definition | https://faculty.nps.edu/fxgirald/projects/nseam/nps/new_section4.pdf | 2026-06-18 | 一维 Courant 数定义和显式方法约束 |
| S2 | 官方论坛资料 | Time Step Size and Courant Number | Ansys Innovation Space | CFL condition summary | https://innovationspace.ansys.com/forum/forums/topic/time-step-size-and-courant-number/ | 2026-06-18 | Fluent 语境下的概念核对，不作为唯一来源 |

## 公式定义

```text
C = U * DeltaT / DeltaX
DeltaT = C_target * DeltaX / U
```

```latex
C = \frac{U\Delta t}{\Delta x}, \qquad \Delta t = \frac{C_{\mathrm{target}}\Delta x}{U}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| C | courantNumber | Courant 数 / CFL 数 | 1 | 输出 | 一个时间步内信息穿过网格的比例 |
| C_target | targetCourantNumber | 目标 CFL | 1 | 输入 | 用户指定目标值 |
| U | characteristicSpeed | 特征速度 | m/s | 输入 | 一维形式使用速度大小 |
| Delta t | timeStep | 时间步长 | s | 输入或输出 | 需要为非负数 |
| Delta x | cellSize | 特征网格尺寸 | m | 输入 | 一维形式的网格间距 |

## 适用范围

- 首版仅实现一维估算：`C = U*DeltaT/DeltaX`。
- 多维、非结构网格、局部面通量、声速波速、旋转机械相位步长等情况需要后续分支，不在首版直接实现。
- CFL 稳定上限依赖时间积分格式、离散格式和求解器；页面只提供数值计算和注意事项，不给出通用安全阈值。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| time-step-001 | 正常案例 | C_target=1, DeltaX=0.01 m, U=2 m/s | DeltaT=0.005 s | exact | 公式代入 | ready |
| cfl-001 | 正常案例 | DeltaT=0.002 s, DeltaX=0.01 m, U=2 m/s | C=0.4 | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | C_target=1, DeltaX=10 mm, U=200 cm/s | DeltaT=0.005 s | 1e-9 relative | time-step-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | U=0 且要求反算 DeltaT | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 支持“计算 CFL”和“由目标 CFL 反算时间步长”两种模式。
- U=0 时计算 CFL 可得到 0，但不能反算时间步长。
- 页面必须明确首版是一维估算，不替代求解器局部 Courant 数报告。
