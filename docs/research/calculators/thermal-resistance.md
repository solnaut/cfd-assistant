# 热阻研究记录

## 基本信息

- 计算器 ID：thermal-resistance
- 计算器中文名称：热阻
- 计算器英文名称：Thermal resistance
- 所属分类：传热与热工
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限等效热阻基础关系

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Thermal resistance | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | 热阻与传热率关系 |

## 公式定义

```text
R_th = Delta T / Q_dot
```

```latex
R_{th}=\frac{\Delta T}{\dot{Q}}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| R_th | thermalResistance | 热阻 | K/W | 输出 | 温差与传热率之比 |
| Delta T | temperatureDifference | 温差 | K | 输入 | 热阻两端温差 |
| Q_dot | heatRate | 传热率 | W | 输入 | 与温差对应的热流率 |

## 适用范围与假设

- 用于单一等效热路径的基础热阻估算。
- 串联、并联、接触热阻和辐射换热不在本计算器中自动处理。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | Delta T=20 K, Q_dot=100 W | R_th=0.2 K/W | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | Delta T=20 °C, Q_dot=0.1 kW | R_th=0.2 K/W | exact | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Delta T=0, Q_dot>0 | R_th=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | Q_dot=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `Q_dot` 必须大于 0。
- `Delta T` 可为 0 但不能为负。
