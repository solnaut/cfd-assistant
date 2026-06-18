# 对流换热基本关系研究记录

## 基本信息

- 计算器 ID：convective-heat-transfer
- 计算器中文名称：对流换热基本关系
- 计算器英文名称：Convective heat transfer
- 所属分类：传热与热工
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限牛顿冷却定律基础关系

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Newton's law of cooling | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | 对流换热基本关系与 `h` 的含义 |

## 公式定义

```text
Q_dot = h * A * Delta T
```

```latex
\dot{Q}=hA\Delta T
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Q_dot | heatRate | 传热率 | W | 输出 | 对流传热功率 |
| h | heatTransferCoefficient | 对流换热系数 | W/(m²·K) | 输入 | 用户给定，不由本工具自动关联 |
| A | area | 面积 | m² | 输入 | 换热面积 |
| Delta T | temperatureDifference | 温差 | K | 输入 | 壁面与流体参考温度差幅值 |

## 适用范围与假设

- 适用于使用已知平均对流换热系数的基础换热估算。
- 不自动计算 `h`，也不选择任何 Nusselt 经验关联式。
- 温差定义必须与 `h` 的定义一致。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | h=100 W/(m²·K), A=1 m², Delta T=10 K | Q_dot=1000 W | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | h=0.01 W/(cm²·K), A=10000 cm², Delta T=10 °C | Q_dot=1000 W | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Delta T=0, h>=0, A>=0 | Q_dot=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | h<0 或 A<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 当前允许 `h=0` 或 `A=0`，输出为 0。
- 后续若要反算 `h` 或面积，应建立独立分支和测试。
