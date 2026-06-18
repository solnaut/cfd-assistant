# Peclet 数研究记录

## 基本信息

- 计算器 ID：peclet-number
- 计算器中文名称：Peclet 数
- 计算器英文名称：Peclet number
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
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Peclet Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 公式、物理含义 |
| S2 | 大学开放教材 | Viscous-Dominated Flows | Embry-Riddle Aeronautical University / J. Gordon Leishman | Peclet number examples | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/viscous-dominated-flows/ | 2026-06-18 | 公式核对 |

## 公式定义

```text
Pe = Re * Pr = U * L / alpha
```

```latex
Pe = Re\,Pr = \frac{U L}{\alpha}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Pe | pecletNumber | Peclet 数 | 1 | 输出 | 对流传热与热扩散相对量级 |
| Re | reynoldsNumber | Reynolds 数 | 1 | 输入 | 无量纲模式 |
| Pr | prandtlNumber | Prandtl 数 | 1 | 输入 | 无量纲模式 |
| U | velocity | 参考速度 | m/s | 输入 | 物理量模式 |
| L | characteristicLength | 特征长度 | m | 输入 | 需要说明定义 |
| alpha | thermalDiffusivity | 热扩散率 | m^2/s | 输入 | 分母必须为正 |

## 适用范围

- 当前记录仅覆盖热扩散形式；质量扩散形式可后续增加并明确扩散系数符号。
- 特征长度和速度需要与具体问题一致。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | U=2 m/s, L=0.5 m, alpha=1e-6 m^2/s | Pe=1000000 | exact | 公式代入 | ready |
| dimensionless-001 | 正常案例 | Re=1000, Pr=0.7 | Pe=700 | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | U=200 cm/s, L=50 cm, alpha=1 mm^2/s | Pe=1000000 | 1e-6 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | alpha=0 或 L<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 首版支持 `U*L/alpha` 和 `Re*Pr` 两种模式。
- 需要在界面标明当前为热传递 Peclet 数。
