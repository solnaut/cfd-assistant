# CFD Assistant

CFD Assistant 是一个面向 CFD 工程人员和 Ansys Fluent 初学者的第三方网页辅助工具。第一阶段是纯前端静态网站，用户无需安装软件，通过固定链接在手机、平板或电脑浏览器访问。

本项目不是 Ansys 官方产品，不使用 Ansys 或 Fluent 官方 Logo，不复制官方界面截图，也不直接大段复制官方帮助文档。

## 当前阶段

- 技术栈：React、TypeScript、Vite、React Router、Vitest、PWA。
- 运行形态：纯前端静态应用，无后端、无数据库、无登录、无外部 API。
- 业务状态：已进入参数计算专项完善阶段，具备产品化首页、参数计算三级结构、CFD 公式库、首批正式计算器和 Fluent 教学导览 MVP。
- 专业内容：已实现的计算器均有研究记录和测试；复杂经验关联式仍需权威来源核对后才能公开。y+ 当前公开平板外流初始估算、已知壁面剪切应力和已知壁面摩擦系数 Cf 三种明确分支。
- 显示规则：普通变量符号使用 Unicode 或数学文本显示，公式区域使用 KaTeX 渲染并保留可复制 LaTeX；公开页面不展示内部来源链接。

## 本地命令

PowerShell 直接运行 `npm` 可能受执行策略影响；本机已验证 `npm.cmd` 可用。

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

## 目录说明

- `src/pages`：页面级组件。
- `src/components`：可复用 UI 组件。
- `src/calculators`：计算器定义和纯函数计算逻辑。
- `src/units`：单位定义、换算和用户界面显示符号。
- `src/knowledge`：知识库读取与查询逻辑。
- `src/models`：共享 TypeScript 数据模型。
- `src/tests`：基础测试。
- `public/knowledge`：本地知识库 JSON 和条目模板。
- `docs`：产品、架构、路线图、研究记录、维护和部署文档。

## 重要维护规则

计算逻辑不得写在页面组件中；单位换算必须独立管理；Fluent 知识内容必须与页面代码分离。未经确认的 CFD 专业内容只能保留在研究记录、模板或内部文档中，不得伪装为确定结论或作为公开计算结果展示。
