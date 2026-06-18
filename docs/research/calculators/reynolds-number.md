# Reynolds 数研究记录

## 基本信息

- 计算器 ID：reynolds-number
- 计算器中文名称：Reynolds 数
- 计算器英文名称：Reynolds number
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
| S1 | 官方教育资料 | Reynolds Number | NASA Glenn Research Center | Reynolds number derivation | https://www.grc.nasa.gov/WWW/K-12/airplane/reynolds.html | 2026-06-18 | 公式、变量、无量纲性质 |
| S2 | 大学开放教材 | Mach Number & Reynolds Number | Embry-Riddle Aeronautical University / J. Gordon Leishman | Definition of Reynolds Number | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/mach-number-and-reynolds-number/ | 2026-06-18 | 公式核对、特征长度说明 |
| S3 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Reynolds Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 物理含义核对 |

## 公式定义

### 原始公式

```text
Re = rho * U * L / mu
Re = U * L / nu
nu = mu / rho
```

### LaTeX

```latex
Re = \frac{\rho U L}{\mu} = \frac{U L}{\nu}, \qquad \nu = \frac{\mu}{\rho}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Re | reynoldsNumber | Reynolds 数 | 1 | 输出 | 惯性效应与黏性效应的相对量级 |
| rho | density | 密度 | kg/m^3 | 输入 | 流体密度 |
| U | velocity | 参考速度 | m/s | 输入 | 需要与所选特征长度场景一致 |
| L | characteristicLength | 特征长度 | m | 输入 | 例如管径、翼弦、物体长度等，必须在结果摘要中说明 |
| mu | dynamicViscosity | 动力黏度 | Pa*s | 输入 | 需要为正数 |
| nu | kinematicViscosity | 运动黏度 | m^2/s | 输入或中间量 | 与 rho、mu 二选一或作为中间量 |

## 适用范围

- 用于连续介质流体中的量纲分析和流动相似性判断。
- 公式本身不限定内流或外流，但特征长度和参考速度必须由用户按问题定义。
- 不直接给出层流、湍流判据；不同几何和扰动条件下临界值不同。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | rho=1.225 kg/m^3, U=10 m/s, L=1 m, mu=1.7894e-5 Pa*s | Re=684587.01 | 1e-6 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | rho=0.001225 g/cm^3, U=36 km/h, L=100 cm, mu=1.7894e-5 Pa*s | Re=684587.01 | 1e-6 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | U=0 m/s, rho>0, L>0, mu>0 | Re=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | mu=0 或 L<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- 支持两种输入模式：`rho + U + L + mu` 或 `U + L + nu`。
- 必须阻止 rho<=0、L<0、mu<=0、nu<=0、NaN 和 Infinity。
- 结果摘要必须显示用户选择的特征长度定义。
