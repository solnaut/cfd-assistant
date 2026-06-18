# 总时间步数量研究记录

## 基本信息

- 计算器 ID：total-time-steps
- 计算器中文名称：总时间步数量
- 计算器英文名称：Total time steps
- 所属分类：瞬态与时间步长
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 官方指南 | Wind-US User Guide: Numerical Modeling | NASA Glenn Research Center | Time Step | https://www.grc.nasa.gov/www/winddocs/user/numerical.html | 2026-06-18 | 瞬态计算中物理时间步的使用语境 |
| S2 | 数学定义 | Ceiling function | 内部数学定义 | N/A | N/A | 2026-06-18 | 保证覆盖目标总时间的取整规则 |

## 公式定义

```text
N_exact = T / Delta t
N = ceil(N_exact)
T_covered = N * Delta t
```

```latex
N=\left\lceil\frac{T}{\Delta t}\right\rceil
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| N | timeStepCount | 时间步数量 | 1 | 输出 | 向上取整后的整数步数 |
| T | totalTime | 总物理时间 | s | 输入 | 目标模拟物理时长 |
| Delta t | timeStep | 时间步长 | s | 输入 | 单个时间步对应的物理时间 |
| N_exact | exactStepCount | 理论步数 | 1 | 中间量 | 未取整的步数 |
| T_covered | coveredTime | 覆盖物理时间 | s | 中间量 | 实际推进步数覆盖的物理时间 |

## 适用范围与假设

- 用于基础瞬态设置中的总步数估算。
- 不判断每个时间步内的迭代收敛，也不判断 CFL 稳定性。
- 使用向上取整，保证模拟时长不短于用户输入的总物理时间。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | T=1 s, Delta t=0.001 s | N=1000, T_covered=1 s | exact | 公式代入 | ready |
| rounding-001 | 边界案例 | T=1 s, Delta t=0.3 s | N=4, T_covered=1.2 s | exact | 取整规则 | ready |
| unit-001 | 单位换算案例 | T=1000 ms, Delta t=1 ms | N=1000 | exact | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | Delta t=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `Delta t` 必须大于 0。
- `T` 可为 0；此时输出 0 步。
- 必须阻止 NaN、Infinity 和负时间。
