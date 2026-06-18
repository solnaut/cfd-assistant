# Nusselt 数基础形式研究记录

## 基本信息

- 计算器 ID：nusselt-number
- 计算器中文名称：Nusselt 数基础形式
- 计算器英文名称：Nusselt number
- 所属分类：无量纲数
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限基础定义 `Nu=hL/k`

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Nusselt Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | Nusselt 数基础定义与用途 |
| S2 | 大学开放教材 | Introduction to Engineering Heat Transfer | MIT OpenCourseWare 16.050 | Convective heat transfer coefficient | https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf | 2026-06-18 | 对流换热系数语境 |

## 公式定义

```text
Nu = h * L / k
```

```latex
Nu=\frac{hL}{k}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Nu | nusseltNumber | Nusselt 数 | 1 | 输出 | 对流换热与导热尺度的无量纲比值 |
| h | heatTransferCoefficient | 对流换热系数 | W/(m²·K) | 输入 | 用户输入，不由本工具关联式估算 |
| L | characteristicLength | 特征长度 | m | 输入 | 与几何和关联式定义相关 |
| k | thermalConductivity | 流体导热系数 | W/(m·K) | 输入 | 对应参考温度下的流体物性 |

## 适用范围与假设

- 当前只公开 Nusselt 数定义，不实现任何具体经验关联式。
- 特征长度和物性温度需由用户按问题定义。
- 不自动判断层流、湍流、内流、外流或自然对流。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | h=100 W/(m²·K), L=0.05 m, k=0.6 W/(m·K) | Nu=8.3333333333 | 1e-12 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | h=0.01 W/(cm²·K), L=50 mm, k=0.6 W/(m·K) | Nu=8.3333333333 | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | h=0, L>=0, k>0 | Nu=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | k=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 不把具体 Nusselt 关联式写入本计算器。
- 后续如增加关联式，需要独立记录 Re、Pr、几何、边界条件和适用范围。
