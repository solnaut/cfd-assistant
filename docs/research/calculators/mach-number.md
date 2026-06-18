# Mach 数研究记录

## 基本信息

- 计算器 ID：mach-number
- 计算器中文名称：Mach 数
- 计算器英文名称：Mach number
- 所属分类：无量纲数
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 官方教育资料 | Mach Number | NASA Glenn Research Center | Mach number definition | https://www.grc.nasa.gov/WWW/K-12/airplane/mach.html | 2026-06-18 | Mach 数定义和流动区间 |
| S2 | 官方教育资料 | Speed of Sound | NASA Glenn Research Center | Speed of sound equation | https://www.grc.nasa.gov/www/k-12/BGP/sound.html | 2026-06-18 | 理想气体声速公式 |
| S3 | 大学开放教材 | Mach Number & Reynolds Number | Embry-Riddle Aeronautical University / J. Gordon Leishman | Definition of Mach Number | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/mach-number-and-reynolds-number/ | 2026-06-18 | 公式核对和变量说明 |

## 公式定义

### 原始公式

```text
M = U / a
a = sqrt(gamma * R * T)  (ideal gas)
```

### LaTeX

```latex
M = \frac{U}{a}, \qquad a = \sqrt{\gamma R T}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| M | machNumber | Mach 数 | 1 | 输出 | 流速与当地声速之比 |
| U | velocity | 流速 | m/s | 输入 | 应使用相对于流体的当地速度大小 |
| a | speedOfSound | 声速 | m/s | 输入或中间量 | 可由用户直接输入，或按理想气体公式计算 |
| gamma | heatCapacityRatio | 比热比 | 1 | 输入 | 理想气体声速模式使用 |
| R | gasConstant | 气体常数 | J/(kg*K) | 输入 | 理想气体声速模式使用 |
| T | absoluteTemperature | 绝对温度 | K | 输入 | 必须为绝对温标 |

## 适用范围

- `M = U / a` 是通用比值定义。
- `a = sqrt(gamma R T)` 仅用于理想气体、等熵小扰动声速估算。
- 液体、真实气体或强非平衡高温气体的声速不应默认使用理想气体公式。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | U=170 m/s, a=340 m/s | M=0.5 | exact | 公式代入 | ready |
| ideal-gas-001 | 正常案例 | U=170.15 m/s, gamma=1.4, R=287.05 J/(kg*K), T=288.15 K | M≈0.5 | 1e-3 relative | 理想气体声速公式 | ready |
| unit-001 | 单位换算案例 | U=612 km/h, a=340 m/s | M=0.5 | 1e-6 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | a=0 或 T<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 首版支持“直接输入声速”和“理想气体声速”两种模式。
- 内部统一使用 SI 单位。
- 必须阻止 a<=0、gamma<=0、R<=0、T<=0、NaN 和 Infinity。
- 流动区间说明只作解释，不作为计算分支。
