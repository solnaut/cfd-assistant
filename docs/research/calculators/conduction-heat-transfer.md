# 导热基本关系研究记录

## 基本信息

- 计算器 ID：conduction-heat-transfer
- 计算器中文名称：导热基本关系
- 计算器英文名称：One-dimensional conduction heat transfer
- 所属分类：传热与热工
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限一维稳态平板导热

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Fourier's law and plane slab | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | 一维导热关系与热通量定义 |

## 公式定义

```text
Q_dot = k * A * Delta T / L
R_cond = L / (k * A)
```

```latex
\dot{Q}=\frac{kA\Delta T}{L}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Q_dot | heatRate | 传热率 | W | 输出 | 一维导热传热率 |
| k | thermalConductivity | 导热系数 | W/(m·K) | 输入 | 材料导热系数 |
| A | area | 面积 | m² | 输入 | 导热截面积 |
| Delta T | temperatureDifference | 温差 | K | 输入 | 两侧温差幅值 |
| L | thickness | 厚度 | m | 输入 | 导热路径长度 |
| R_cond | thermalResistance | 导热热阻 | K/W | 中间量 | `L/(kA)` |

## 适用范围与假设

- 适用于一维、稳态、常物性、平板导热基础估算。
- 不包含圆柱壳、球壳、多层材料、接触热阻、辐射或内部热源。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | k=10 W/(m·K), A=1 m², Delta T=10 K, L=0.01 m | Q_dot=10000 W, R_cond=0.001 K/W | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | k=10 W/(m·K), A=10000 cm², Delta T=10 °C, L=10 mm | Q_dot=10000 W | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Delta T=0, 其他正值 | Q_dot=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | k=0、A=0 或 L=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `k`、`A`、`L` 必须大于 0。
- `Delta T` 可为 0 但不能为负。
