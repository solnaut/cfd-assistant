# 管内平均流速研究记录

## 基本信息

- 计算器 ID：mean-velocity
- 计算器中文名称：管内平均流速
- 计算器英文名称：Mean velocity from volumetric flow rate
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
| S1 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Poiseuille flow notes | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | 平均速度与体积流量关系 |

## 公式定义

```text
V = Q / A
```

```latex
V=\frac{Q}{A}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| V | meanVelocity | 平均速度 | m/s | 输出 | 截面平均速度 |
| Q | volumeFlowRate | 体积流量 | m³/s | 输入 | 单位时间通过截面的体积 |
| A | area | 截面积 | m² | 输入 | 实际流通截面积 |

## 适用范围与假设

- 适用于已知体积流量和流通面积的平均速度估算。
- 不描述局部速度分布或湍流脉动。
- 截面积应排除固体壁面、堵塞物或无效流通区域。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | Q=0.001 m³/s, A=0.01 m² | V=0.1 m/s | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | Q=60 L/min, A=0.01 m² | V=0.1 m/s | 1e-12 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | Q=0, A>0 | V=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | A=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- `A` 必须大于 0。
- `Q` 可为 0 但不能为负。
