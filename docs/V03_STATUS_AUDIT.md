# CFD Assistant v0.3 Status Audit

日期：2026-06-18  
范围：v0.3 开始实施前的当前项目状态盘点。本文用于指导后续阶段，不直接面向最终用户展示。

## 1. Git 与版本状态

- 当前分支：`main`
- 当前本地状态：本地分支领先 `origin/main`，v0.2 相关提交尚未推送。
- 最近稳定提交：
  - `75d3318 Implement Fluent guide MVP`
  - `cbfee73 Implement initial verified calculators`
  - `00483a5 Add initial calculator research records`
  - `2fb0415 Add v0.2 research record templates`
  - `f26dbbe Implement v0.2 UI architecture`
- v0.3 规则：继续只创建本地提交，不推送 GitHub，不部署 Cloudflare。

## 2. 参数计算模块状态

### 2.1 分类结构

当前参数计算模块已采用三级结构：

```text
/calculators
  /calculators/:categoryId
    /calculators/:categoryId/:calculatorId
```

当前分类：

- 近壁面与网格
- 瞬态与时间步长
- 无量纲数
- 流动与管路
- 传热与热工

### 2.2 当前计算器状态

| 计算器 ID | 名称 | 当前公开状态 | 研究记录 | 备注 |
| --- | --- | --- | --- | --- |
| `reynolds-number` | Reynolds 数 | available | 已有 | 已实现基础公式与测试 |
| `mach-number` | Mach 数 | available | 已有 | 当前为直接输入声速模式 |
| `prandtl-number` | Prandtl 数 | available | 已有 | 已实现 `mu cp / k` |
| `peclet-number` | Peclet 数 | available | 已有 | 当前为热扩散形式 |
| `grashof-number` | Grashof 数 | available | 已有 | 已实现基础自然对流无量纲数 |
| `rayleigh-number` | Rayleigh 数 | available | 已有 | 已实现完整物性输入形式 |
| `fourier-number` | Fourier 数 | available | 已有 | 已实现瞬态导热无量纲时间 |
| `biot-number` | Biot 数 | available | 已有 | 已实现 `hL/k_s` |
| `hydraulic-diameter` | 水力直径 | available | 已有 | 已实现通用 `4A/P_w` |
| `cfl-time-step` | CFL 与时间步长 | available | 已有 | 当前为一维估算 |
| `boundary-layer-mesh` | 边界层网格等比增长 | available | 已有 | 已实现等比层高序列 |
| `y-plus-first-layer-height` | y+ 与第一层网格高度 | research-only | 已有 | 不公开自动计算 |
| `pipe-pressure-drop` | 管道压降 | planned | 暂无正式记录 | v0.3 可优先研究 Darcy-Weisbach 基础形式 |

### 2.3 已知待办

- 对已公开计算器执行公式一致性审计：研究记录、实现函数、展示公式、LaTeX、测试案例必须一致。
- Mach 数可增加理想气体声速辅助输入分支，但必须保证分支条件清晰。
- Peclet 数可增加质量扩散形式，但需单独说明当前热扩散形式与质量扩散形式差异。
- 水力直径可增加矩形通道、环形通道等快捷几何输入。
- 管道压降可研究并实现以 Darcy 摩阻因子为输入的 Darcy-Weisbach 基础计算；摩阻因子经验关联式需另行双源验证。
- y+ 继续保持保守策略，未完成分支研究前不公开自动结果。

## 3. Fluent 导览状态

### 3.1 当前覆盖模块

| 模块 | 条目数 | 状态 |
| --- | ---: | --- |
| General | 3 | draft |
| Models | 2 | draft |
| Materials | 1 | draft |
| Cell Zone Conditions | 1 | draft |
| Boundary Conditions | 3 | draft |
| Solution Methods | 2 | draft |
| Initialization | 1 | draft |
| Monitors | 1 | draft |
| Run Calculation | 1 | draft |
| Results | 2 | draft |

当前知识库路径：

```text
public/knowledge/fluent-demo.json
```

当前研究记录：

```text
docs/research/fluent/fluent-guide-mvp.md
```

### 3.2 当前能力

- 左侧功能目录。
- 中间教学模拟面板。
- 右侧解释面板。
- 搜索。
- 可点击控件。
- 部分控件可显示模拟窗口。
- 关联功能跳转。
- 关联计算器跳转。

### 3.3 已知待办

- 当前模拟窗口内容仍较浅，需要支持窗口内部控件继续点击并驱动右侧解释。
- 当前知识库缺少更完整的 Task Page / dialog / tabs 数据结构。
- 当前 Fluent 条目多为 draft，需要继续补来源章节、版本和审核状态。
- 需要至少实现一条完整交互路径：
  功能树 -> 设置页 -> 点击控件 -> 右侧解释 -> 打开模拟窗口 -> 点击窗口控件 -> 显示解释。
- 移动端导览需要继续优化，避免只是桌面三栏压缩。

## 4. UI/UX 状态

### 4.1 已完成

- 首页、参数计算和 Fluent 导览已统一基础视觉系统。
- 参数计算页面已具备输入、结果、公式、变量、来源和复制操作。
- 公开页面已避免直接显示内部审核状态。

### 4.2 v0.3 优先改进

- 首页主视觉仍需从通用浏览器插画改为更贴合 CFD Assistant 的工程工具视觉。
- 首页主视觉应同时表达：
  - CFD 参数计算
  - 公式与结果
  - Fluent 学习导览
  - 工程工作台感
- 需要预留后续替换为生成式图片或独立插图资源的结构。

## 5. 公开 TODO 检查基线

当前 `TODO` 主要存在于：

- 模板文件：`public/knowledge/knowledge-entry.template.json`
- 模板文件：`src/calculators/templates/calculatorDefinitionTemplate.ts`
- 测试样例：`src/tests/knowledgeRepository.test.ts`
- 内部研究与维护文档

这些内容不应直接出现在公开页面。后续浏览器冒烟测试必须继续检查公开页面正文无 `TODO`、内部审核状态、源码路径或开发说明。

## 6. v0.3 下一步

推荐按以下顺序继续：

1. 提交 `docs/GOAL_V03.md` 和本文，完成 Stage 0。
2. 重做首页主视觉，完成 Stage 1。
3. 执行计算器公式一致性审计，修正文档中过时描述，完成 Stage 2。
4. 研究并实现新的安全计算器分支，例如理想气体声速、管道压降基础形式或水力直径快捷几何。
5. 扩展 Fluent 知识库结构和模拟窗口内控件交互。
6. 全站质量收口并运行 lint、test、build 和浏览器冒烟测试。
