# 边界层网格等比增长研究记录

## 基本信息

- 计算器 ID：boundary-layer-mesh
- 计算器中文名称：边界层网格等比增长
- 计算器英文名称：Boundary-layer mesh geometric growth
- 所属分类：近壁面与网格
- 研究记录版本：0.1
- 记录创建日期：2026-06-18
- 最近更新日期：2026-06-18
- 访问日期：2026-06-18
- 审核状态：source-checked
- 是否允许公开计算：是，限于等比层高序列与总厚度计算

## 来源清单

| 来源 ID | 来源类型 | 标题 | 机构/作者 | 章节或页码 | 链接 | 访问日期 | 用途 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | 官方帮助 | Inflation Control | Ansys Meshing User's Guide | Inflation Control notes | https://ansyshelp.ansys.com/public/Views/Secured/corp/v252/en/wb_msh/ds_Inflation.html | 2026-06-18 | 增长率定义 `h_{n+1}/h_n` |
| S2 | 官方帮助 | Choosing a Layer Growth Method | Ansys SpaceClaim Help | Layer growth method | https://help.spaceclaim.com/dsm/6.0/en/Discovery/user_manual/meshing/mesh/t_mesh_choosing_layer_growth_method.html | 2026-06-18 | 首层、末层和层数关系 |
| S3 | 数学恒等式 | Geometric series | 内部数学推导 | N/A | N/A | 2026-06-18 | 总厚度求和公式 |

## 公式定义

```text
h_i = h_1 * r^(i - 1)
h_last = h_1 * r^(n - 1)
H_total = h_1 * (r^n - 1) / (r - 1), r != 1
H_total = n * h_1, r = 1
```

```latex
h_i = h_1 r^{i-1}
```

```latex
h_{\mathrm{last}} = h_1 r^{n-1}
```

```latex
H = \sum_{i=1}^{n} h_1 r^{i-1}
  =
  \begin{cases}
    h_1 \frac{r^n - 1}{r - 1}, & r \ne 1 \\
    n h_1, & r = 1
  \end{cases}
```

## 变量定义与 SI 单位

| 符号 | 变量 ID | 名称 | SI 单位 | 输入/输出/中间量 | 说明 |
| --- | --- | --- | --- | --- | --- |
| h_1 | firstLayerHeight | 第一层高度 | m | 输入 | 层高序列起点 |
| r | growthRate | 增长率 | 1 | 输入 | `h_{i+1}/h_i` |
| n | layerCount | 层数 | 1 | 输入 | 正整数 |
| h_i | layerHeights | 第 i 层高度 | m | 输出 | 等比层高序列 |
| h_last | lastLayerHeight | 最后一层高度 | m | 输出 | 第 n 层高度 |
| H | totalThickness | 总厚度 | m | 输出 | 所有层高之和 |

## 适用范围

- 仅用于等比增长的棱柱层或膨胀层厚度序列计算。
- 不计算 y+、摩擦速度、真实边界层厚度或湍流模型所需近壁分辨率。
- 不判断层数是否足以覆盖真实边界层；该判断需要流动和模型依据。

## 验证案例

| Case ID | 类型 | 输入 | 期望输出 | 容差 | 来源 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| normal-001 | 正常案例 | h_1=0.001 m, r=1.2, n=5 | h_last=0.0020736 m, H=0.0074416 m | 1e-12 relative | 公式代入 | ready |
| equal-001 | 边界案例 | h_1=0.001 m, r=1, n=5 | h_last=0.001 m, H=0.005 m | exact | 等厚层分支 | ready |
| unit-001 | 单位换算案例 | h_1=1 mm, r=1.2, n=5 | h_last=2.0736 mm, H=7.4416 mm | 1e-12 relative | normal-001 等价单位 | ready |
| invalid-001 | 非法输入案例 | n=0、h_1<0 或 r<=0 | 校验失败 | exact | 数学约束 | ready |

## 实现注意事项

- n 必须是正整数。
- r 必须大于 0；r=1 使用等厚层分支，避免除零。
- 输出层高序列时要限制显示长度，避免大量层数造成页面卡顿。
