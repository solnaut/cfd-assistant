# Fourier 数研究记录

## 基本信息

- 计算器 ID：fourier-number
- 计算器中文名称：Fourier 数
- 计算器英文名称：Fourier number
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
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Fourier Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 公式、物理含义 |

## 公式定义

```text
Fo = alpha * t / L^2
```

```latex
Fo = \frac{\alpha t}{L^2}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Fo | fourierNumber | Fourier 数 | 1 | 输出 | 无量纲时间 |
| alpha | thermalDiffusivity | 热扩散率 | m^2/s | 输入 | 需要为正数 |
| t | time | 时间 | s | 输入 | 可为 0 |
| L | characteristicLength | 特征长度 | m | 输入 | 分母，必须为正 |

## 适用范围

- 用于瞬态导热和热扩散量纲分析。
- 特征长度应按问题定义；不同几何或解析图表可能使用不同长度尺度。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | alpha=1e-6 m^2/s, t=10 s, L=0.01 m | Fo=0.1 | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | alpha=1 mm^2/s, t=10 s, L=10 mm | Fo=0.1 | 1e-6 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | t=0, alpha>0, L>0 | Fo=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | L=0 或 alpha<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- 允许 t=0，但不允许 t<0。
