# 理想气体声速研究记录

## 基本信息

- 计算器 ID：ideal-gas-speed-of-sound
- 计算器中文名称：理想气体声速
- 计算器英文名称：Ideal-gas speed of sound
- 所属分类：流动与管路
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 官方教育资料 | Speed of Sound | NASA Glenn Research Center | Speed of sound equation | https://www.grc.nasa.gov/www/k-12/BGP/sound.html | 2026-06-18 | 理想气体声速公式 |
| S2 | 官方教育资料 | Mach Number | NASA Glenn Research Center | Mach number and local speed of sound | https://www.grc.nasa.gov/WWW/K-12/airplane/mach.html | 2026-06-18 | 与 Mach 数计算的关系 |

## 公式定义

```text
a = sqrt(gamma * R * T)
```

```latex
a = \sqrt{\gamma R T}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| a | speedOfSound | 声速 | m/s | 输出 | 理想气体中的小扰动声速 |
| gamma | heatCapacityRatio | 比热比 | 1 | 输入 | 定压比热与定容比热之比 |
| R | gasConstant | 气体常数 | J/(kg*K) | 输入 | 按气体种类取值 |
| T | temperature | 绝对温度 | K | 输入 | 必须使用绝对温标 |

## 适用范围

- 适用于理想气体声速估算。
- 可作为 Mach 数计算中的当地声速输入。
- 不适用于液体、强非理想真实气体、高温化学非平衡或声速由实验/物性表给定的场景。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | gamma=1.4, R=287.05 J/(kg*K), T=288.15 K | a=340.2922869 m/s | 1e-9 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | gamma=1.4, R=0.28705 kJ/(kg*K), T=15 degC | a=340.2922869 m/s | 1e-9 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | T<=0 或 gamma<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- 摄氏度输入必须先转换为 K。
- 页面必须说明该公式只适用于理想气体。
