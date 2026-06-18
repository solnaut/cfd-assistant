# 热通量研究记录

## 基本信息

- 计算器 ID：heat-flux
- 计算器中文名称：热通量
- 计算器英文名称：Heat flux
- 所属分类：传热与热工
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Fourier's law and heat flux | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | 热通量定义与单位 |

## 公式定义

```text
q_flux = Q_dot / A
```

```latex
q''=\frac{\dot{Q}}{A}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| q'' | heatFlux | 热通量 | W/m² | 输出 | 单位面积传热率 |
| Q_dot | heatRate | 传热率 | W | 输入 | 单位时间热量传递率 |
| A | area | 面积 | m² | 输入 | 与传热率对应的面积 |

## 适用范围与假设

- 计算平均热通量，不描述局部热通量分布。
- 面积必须与传热率对应同一边界或截面。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | Q_dot=100 W, A=0.5 m² | q''=200 W/m² | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | Q_dot=0.1 kW, A=5000 cm² | q''=200 W/m² | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Q_dot=0, A>0 | q''=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | A=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `A` 必须大于 0。
- `Q_dot` 可为 0 但不能为负。
