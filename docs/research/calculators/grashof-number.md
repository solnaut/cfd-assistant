# Grashof 数研究记录

## 基本信息

- 计算器 ID：grashof-number
- 计算器中文名称：Grashof 数
- 计算器英文名称：Grashof number
- 所属分类：无量纲数
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Grashof Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 公式、物理含义 |

## 公式定义

```text
Gr = g * beta * DeltaT * L^3 / nu^2
```

```latex
Gr = \frac{g \beta \Delta T L^3}{\nu^2}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Gr | grashofNumber | Grashof 数 | 1 | 输出 | 自然对流浮力效应与黏性效应的相对量级 |
| g | gravity | 重力加速度 | m/s^2 | 输入 | 默认可使用 9.80665 m/s^2 |
| beta | thermalExpansionCoefficient | 体膨胀系数 | 1/K | 输入 | 物性温度需说明 |
| DeltaT | temperatureDifference | 温差幅值 | K | 输入 | 首版按正的温差幅值计算 |
| L | characteristicLength | 特征长度 | m | 输入 | 需由用户按几何定义 |
| nu | kinematicViscosity | 运动黏度 | m^2/s | 输入 | 分母必须为正 |

## 适用范围

- 用于自然对流量纲分析。
- 首版只计算 Grashof 数幅值，不自动判断加热方向或稳定/不稳定分层。
- 不实现任何经验换热关联式。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | g=9.80665 m/s^2, beta=0.0034 1/K, DeltaT=10 K, L=0.1 m, nu=1.5e-5 m^2/s | Gr=1481893.78 | 1e-6 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | g=9.80665 m/s^2, beta=0.0034 1/K, DeltaT=10 K, L=100 mm, nu=15 mm^2/s | Gr=1481893.78 | 1e-6 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | nu=0 或 L<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- DeltaT 输入按幅值处理，负温差应提示用户改用正值或取绝对值确认。
- 不公开任何自然对流临界或湍流判断结论，除非后续补充来源。
