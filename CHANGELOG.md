# Changelog

## Unreleased

- 增加 CFD Assistant v0.3 实施任务书和当前状态审计。
- 重做首页主视觉，用工程工作台表达参数计算、公式结果和 Fluent 导览。
- 新增理想气体声速计算器。
- 将管道压降升级为基于 Darcy-Weisbach 形式的正式计算器，要求用户输入 Darcy 摩阻因子。
- 扩展 Fluent 导览知识库结构，支持模拟窗口和窗口内部控件继续点击解释。
- 增加 CFD Assistant v0.2 实施任务书。
- 完成首页、参数计算模块和 Fluent 导览的产品化 UI 架构改版。
- 将参数计算模块重构为“分类首页 -> 分类详情 -> 计算器详情”的三级结构。
- 新增计算器分类、列表和详情页组件。
- 清理公开页面中的开发过程说明、内部 TODO 和审核状态展示。
- 新增研究记录目录和计算器、Fluent 来源记录模板。
- 更新产品说明和路线图，明确最终产品需要支持真实计算、公式展示、Fluent 常用操作解释和无乱码体验。
- 新增 KaTeX 公式渲染。
- 实现首批来源明确的计算器：Reynolds、Mach、Prandtl、Peclet、Grashof、Rayleigh、Fourier、Biot、水力直径、CFL 时间步长、边界层网格等比增长。
- 为首批计算器增加单位换算、输入校验、结果展示、中间结果、来源、复制结果和计算测试。
- 将 Fluent 导览升级为知识库 ID 驱动的教学界面，增加搜索、可点击控件、模拟对话框、关联功能和关联计算器跳转。
- 扩展 Fluent demo 知识库到 General、Models、Materials、Cell Zone Conditions、Boundary Conditions、Solution Methods、Initialization、Monitors、Run Calculation 和 Results。

## 0.1.0 - 2026-06-18

- 初始化 CFD Assistant 项目。
- 创建 React、TypeScript、Vite、React Router、Vitest 和 PWA 基础配置。
- 建立首页、参数计算页和 Fluent 功能导览页。
- 建立本地知识库 JSON 演示条目和知识条目模板。
- 建立计算器定义模板、单位换算模块和基础测试。
- 编写产品说明、路线图、架构、决策、部署和内容维护文档。
