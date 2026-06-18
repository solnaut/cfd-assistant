# 旋转机械基础时间步长研究记录

## 基本信息

- 计算器 ID：rotating-time-step
- 计算器中文名称：旋转机械基础时间步长
- 计算器英文名称：Rotating machinery basic time step
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
| S1 | 官方指南 | Wind-US User Guide: Numerical Modeling | NASA Glenn Research Center | Time Step | https://www.grc.nasa.gov/www/winddocs/user/numerical.html | 2026-06-18 | 瞬态物理时间步设置语境 |
| S2 | 国家标准机构资料 | NIST Guide to the SI, Chapter 8 | NIST | 8.1 Time and rotational frequency | https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8 | 2026-06-18 | 转频与 rpm/rps 单位语境 |

## 公式定义

```text
period = 60 / RPM
Delta t = period / N_rev
```

```latex
\Delta t=\frac{60}{\Omega_{\mathrm{rpm}}N_{\mathrm{rev}}}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Delta t | timeStep | 时间步长 | s | 输出 | 每个时间步对应的物理时间 |
| Omega_rpm | rotationalSpeed | 转速 | rpm | 输入 | 每分钟转数；内部换算为周期 |
| N_rev | stepsPerRevolution | 每转步数 | 1 | 输入 | 一圈划分的时间步数量 |
| T_rev | period | 单转周期 | s | 中间量 | `60 / RPM` |
| f | revolutionsPerSecond | 每秒转数 | 1/s | 中间量 | `RPM / 60` |

## 适用范围与假设

- 用于按每转角度分辨率估算旋转机械瞬态时间步。
- 不自动判断叶频、通过频率、滑移网格设置、动静干涉尺度或 CFL 上限。
- 转速必须为正，每转步数必须为正整数。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | RPM=3000, N_rev=360 | Delta t=5.5555555556e-5 s | 1e-12 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | f=50 rps, N_rev=360 | Delta t=5.5555555556e-5 s | 1e-12 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | RPM=0 或 N_rev=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部以 rpm 作为转速基准值，`rps` 输入换算为 `rpm`。
- 不将 rpm 当作角速度；如后续支持 rad/s，应单独记录 `omega=2*pi*f` 分支。
