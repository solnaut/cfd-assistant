# 温升估算基础关系研究记录

## 基本信息

- 计算器 ID：temperature-rise
- 计算器中文名称：温升估算基础关系
- 计算器英文名称：Temperature rise estimate
- 所属分类：传热与热工
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限无相变、无热损失的集中能量估算

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Heat capacity and energy balance examples | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | `m c_p Delta T` 能量关系语境 |

## 公式定义

```text
Q = P * t
Delta T = Q / (m * c_p)
```

```latex
\Delta T=\frac{Pt}{mc_p}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Delta T | temperatureRise | 温升 | K | 输出 | 平均温度升高估算 |
| P | power | 功率 | W | 输入 | 输入热功率 |
| t | time | 时间 | s | 输入 | 加热时间 |
| m | mass | 质量 | kg | 输入 | 受热物体质量 |
| c_p | specificHeat | 比热 | J/(kg·K) | 输入 | 定压或等效比热 |
| Q | heatInput | 输入热量 | J | 中间量 | `P*t` |

## 适用范围与假设

- 适用于无相变、无热损失、物体温度近似均匀的初步估算。
- 不包含空间温度梯度、散热、相变潜热、化学反应热或物性随温度变化。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | P=100 W, t=60 s, m=1 kg, c_p=4180 J/(kg·K) | Delta T=1.4354066986 K | 1e-12 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | P=0.1 kW, t=1 min, m=1000 g, c_p=4.18 kJ/(kg·K) | Delta T=1.4354066986 K | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | P=0 或 t=0, m>0, c_p>0 | Delta T=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | m=0 或 c_p=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `m` 和 `c_p` 必须大于 0。
- `P` 和 `t` 可为 0 但不能为负。
