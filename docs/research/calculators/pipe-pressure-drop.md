# 管道压降研究记录

## 基本信息

- 计算器 ID：pipe-pressure-drop
- 计算器中文名称：管道压降
- 计算器英文名称：Pipe pressure drop
- 所属分类：流动与管路
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限于已知 Darcy 摩阻因子的沿程压降

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 大学课程讲义 | Pipe Flows | Purdue University / C. Wassgren | Pipe losses and Darcy-Weisbach form | https://engineering.purdue.edu/~wassgren/teaching/ME30800/NotesAndReading/PipeFlows_Losses_Reading.pdf | 2026-06-18 | Darcy-Weisbach 压降形式、摩阻因子语境 |
| S2 | 大学开放教材 | Internal Flows | Embry-Riddle Aeronautical University / J. Gordon Leishman | Internal flow losses | https://eaglepubs.erau.edu/introductiontoaerospaceflightvehicles/chapter/internal-flows/ | 2026-06-18 | 内流压降概念核对 |

## 公式定义

```text
Delta p = f_D * (L / D_h) * (rho * V^2 / 2)
```

```latex
\Delta p = f_D \frac{L}{D_h}\frac{\rho V^2}{2}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| Delta p | pressureDrop | 沿程压降 | Pa | 输出 | 由管壁摩擦引起的压力损失 |
| f_D | darcyFrictionFactor | Darcy 摩阻因子 | 1 | 输入 | 必须是 Darcy 摩阻因子，不是 Fanning 摩阻因子 |
| L | pipeLength | 管长 | m | 输入 | 计算段长度 |
| D_h | hydraulicDiameter | 水力直径 | m | 输入 | 圆管为管径，非圆通道使用水力直径 |
| rho | density | 密度 | kg/m^3 | 输入 | 流体密度 |
| V | velocity | 平均速度 | m/s | 输入 | 截面平均速度 |

## 适用范围

- 当前只计算沿程摩擦压降。
- 需要用户已知或另行确定 Darcy 摩阻因子。
- 不包含局部损失、入口损失、弯头阀门损失、泵功、重力位差、可压缩流修正或两相流。
- 非圆通道使用水力直径时，后续关联式适用范围仍需单独确认。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | f_D=0.02, L=10 m, D_h=0.1 m, rho=1000 kg/m^3, V=2 m/s | Delta p=4000 Pa | exact | 公式代入 | ready |
| unit-001 | 单位换算案例 | f_D=0.02, L=1000 cm, D_h=100 mm, rho=1 g/cm^3, V=200 cm/s | Delta p=4 kPa | 1e-9 relative | normal-001 等价单位 | ready |
| boundary-001 | 边界案例 | V=0, f_D>=0, L>=0, D_h>0, rho>0 | Delta p=0 | exact | 公式边界 | ready |
| invalid-001 | 非法输入案例 | D_h=0 或 rho<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- 内部统一使用 SI 单位。
- `D_h`、`rho` 必须大于 0。
- `f_D`、`L`、`V` 可为 0 但不能为负。
- 不自动计算摩阻因子；层流、Blasius、Colebrook、Moody 图等分支属于经验或半经验关联式，需要进一步双源核对。
- 页面必须明确 Darcy 与 Fanning 摩阻因子不能混用。
