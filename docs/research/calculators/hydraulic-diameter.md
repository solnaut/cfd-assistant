# 水力直径研究记录

## 基本信息

- 计算器 ID：hydraulic-diameter
- 计算器中文名称：水力直径
- 计算器英文名称：Hydraulic diameter
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
| S1 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Eq. 11.43, non-circular pipes | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | 公式、变量定义、示例 |
| S2 | 大学开放教材 | Internal Flows | Embry-Riddle Aeronautical University / J. Gordon Leishman | Hydraulic diameter section | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/internal-flows/ | 2026-06-18 | 公式核对 |

## 公式定义

```text
D_h = 4 * A / P_w
```

```latex
D_h = \frac{4A}{P_w}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| D_h | hydraulicDiameter | 水力直径 | m | 输出 | 非圆截面等效直径 |
| A | flowArea | 流通截面积 | m^2 | 输入 | 应为实际流体截面积 |
| P_w | wettedPerimeter | 湿周 | m | 输入 | 与流体接触的周长 |

## 适用范围

- 用于非圆管道、非满流管道或需要以等效直径表示的内流几何。
- 首版只提供通用 `4A/P_w` 计算；矩形、环形、半满圆管等快捷几何可后续增加。
- 使用水力直径替代真实几何时，摩擦因子或换热关联式的适用范围仍需单独确认。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | A=0.02 m^2, P_w=0.6 m | D_h=0.1333333333 m | 1e-9 relative | 公式代入 | ready |
| square-001 | 来源示例 | square side L=0.1 m, A=0.01 m^2, P_w=0.4 m | D_h=0.1 m | exact | Purdue square duct example | ready |
| unit-001 | 单位换算案例 | A=200 cm^2, P_w=60 cm | D_h=0.1333333333 m | 1e-9 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | P_w=0 或 A<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- P_w 必须大于 0，A 必须大于等于 0。
- 结果摘要必须说明输入的湿周定义由用户负责。
