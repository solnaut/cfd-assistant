# Biot 数研究记录

## 基本信息

- 计算器 ID：biot-number
- 计算器中文名称：Biot 数
- 计算器英文名称：Biot number
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
| S1 | 大学课程讲义 | Dimensionless Numbers | MIT OpenCourseWare 3.185 | Biot Number | https://ocw.mit.edu/courses/3-185-transport-phenomena-in-materials-engineering-fall-2003/3bbd51f45948da6a6298534e1c1cdf74_handout_numbers.pdf | 2026-06-18 | 公式、物理含义 |
| S2 | 大学课程讲义 | Biot Numbers | MIT OpenCourseWare 10.37 | Heat transfer Biot number derivation | https://ocw.mit.edu/courses/10-37-chemical-and-biological-reaction-engineering-spring-2007/ca372842a20e2e5416bcf2f3faf118f4_biot_numbers.pdf | 2026-06-18 | 变量和物理意义核对 |

## 公式定义

```text
Bi = h * L / k_s
```

```latex
Bi = \frac{h L}{k_s}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Bi | biotNumber | Biot 数 | 1 | 输出 | 固体内部导热热阻与外部对流热阻的相对量级 |
| h | heatTransferCoefficient | 对流换热系数 | W/(m^2*K) | 输入 | 外部换热边界 |
| L | characteristicLength | 特征长度 | m | 输入 | 常见可取体积/表面积特征长度，需由用户定义 |
| k_s | solidThermalConductivity | 固体导热系数 | W/(m*K) | 输入 | 固体材料导热系数 |

## 适用范围

- 用于固体与流体间对流边界下的瞬态传热或集总参数判断。
- 特征长度定义必须明确，首版只计算数值，不自动判断几何特征长度。
- 不处理相变、接触热阻、辐射边界或内部热源修正。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | h=100 W/(m^2*K), L=0.01 m, k_s=10 W/(m*K) | Bi=0.1 | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | h=0.01 W/(cm^2*K), L=10 mm, k_s=10 W/(m*K) | Bi=0.1 | 1e-6 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | h=0, L>0, k_s>0 | Bi=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | k_s=0 或 L<0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- 结果说明中必须提醒用户确认特征长度定义。
