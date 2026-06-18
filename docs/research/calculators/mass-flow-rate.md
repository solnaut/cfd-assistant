# 体积流量与质量流量换算研究记录

## 基本信息

- 计算器 ID：mass-flow-rate
- 计算器中文名称：体积流量与质量流量换算
- 计算器英文名称：Mass flow rate from volumetric flow rate
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
| S1 | 国家标准机构资料 | NIST Guide to the SI, Chapter 8 | NIST | Table 12 density definition | https://www.nist.gov/pml/special-publication-811/nist-guide-si-chapter-8 | 2026-06-18 | 密度 `rho=m/V` 定义 |
| S2 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Volumetric flow rate | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | 体积流量语境 |

## 公式定义

```text
m_dot = rho * Q
```

```latex
\dot{m}=\rho Q
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| m_dot | massFlowRate | 质量流量 | kg/s | 输出 | 单位时间通过截面的质量 |
| rho | density | 密度 | kg/m³ | 输入 | 流体密度 |
| Q | volumeFlowRate | 体积流量 | m³/s | 输入 | 单位时间体积流量 |

## 适用范围与假设

- 适用于密度已知且与体积流量状态一致的换算。
- 可压缩流、强温度变化或多相流中，密度应按局部或参考状态明确给定。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | rho=1000 kg/m³, Q=0.001 m³/s | m_dot=1 kg/s | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | rho=1 g/cm³, Q=60 L/min | m_dot=1 kg/s | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Q=0, rho>0 | m_dot=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | rho=0 或 Q<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `rho` 必须大于 0。
- `Q` 可为 0 但不能为负。
