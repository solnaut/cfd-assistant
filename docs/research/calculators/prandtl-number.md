# Prandtl 数研究记录

## 基本信息

- 计算器 ID：prandtl-number
- 计算器中文名称：Prandtl 数
- 计算器英文名称：Prandtl number
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
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Prandtl Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 公式、物理含义 |

## 公式定义

```text
Pr = nu / alpha = mu * cp / k
```

```latex
Pr = \frac{\nu}{\alpha} = \frac{\mu c_p}{k}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Pr | prandtlNumber | Prandtl 数 | 1 | 输出 | 动量扩散率与热扩散率之比 |
| nu | kinematicViscosity | 运动黏度 | m^2/s | 输入 | 直接模式 |
| alpha | thermalDiffusivity | 热扩散率 | m^2/s | 输入 | 直接模式或中间量 |
| mu | dynamicViscosity | 动力黏度 | Pa*s | 输入 | 物性模式 |
| cp | specificHeat | 定压比热 | J/(kg*K) | 输入 | 物性模式 |
| k | thermalConductivity | 导热系数 | W/(m*K) | 输入 | 物性模式 |

## 适用范围

- 用于热对流和传热量纲分析。
- 物性应取同一流体、同一参考温度或明确说明的物性温度。
- 公式不包含相变、非牛顿效应或强温度依赖物性处理。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | mu=1.8e-5 Pa*s, cp=1005 J/(kg*K), k=0.026 W/(m*K) | Pr=0.695769 | 1e-6 relative | 公式代入 | ready |
| direct-001 | 正常案例 | nu=1.5e-5 m^2/s, alpha=2.2e-5 m^2/s | Pr=0.681818 | 1e-6 relative | 公式代入 | ready |
| unit-001 | 单位换算案例 | mu=0.018 mPa*s, cp=1.005 kJ/(kg*K), k=0.026 W/(m*K) | Pr=0.695769 | 1e-6 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | k=0 或 alpha<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 支持 `nu/alpha` 和 `mu*cp/k` 两种模式。
- 内部统一使用 SI 单位。
- 所有分母必须为正数。
