# Architecture

## 技术栈

- React：页面和交互。
- TypeScript：类型约束和可维护性。
- Vite：开发服务器和静态构建。
- React Router：前端路由。
- Vitest：单元测试和组件测试。
- PWA：为后续移动端访问和安装体验预留基础。

## 分层原则

页面、计算逻辑、单位换算、知识库读取和数据模型必须分开。

```text
src/
  components/      可复用 UI 组件
  pages/           页面入口
  calculators/     计算器定义与纯函数计算逻辑
  units/           单位定义、换算和显示符号
  knowledge/       知识库读取和查询
  models/          TypeScript 数据模型
  tests/           测试设置和测试文件
public/
  knowledge/       本地 JSON 知识库
docs/              项目文档
```

## 数据流

### 参数计算

用户输入页面 -> 表单校验 -> 单位换算模块 -> 计算器纯函数 -> 结果展示。

页面不得直接包含公式计算逻辑。当前计算器元数据集中在 `src/calculators/registry.ts`，纯函数实现集中在 `src/calculators/implementations.ts`，单位换算集中在 `src/units/conversions.ts`。公式展示使用计算器元数据中的 LaTeX，并由 KaTeX 渲染。

`/formulas` 公式库通过 `src/calculators/formulas.ts` 读取 `calculatorCatalog` 中的公式定义，不维护第二份公式文本。计算器可以只有一个 `formula`，也可以用 `formulas` 提供多个细分公式条目。计算器详情页和公式库页面共享公式标题、原始 LaTeX 和变量说明；公式库只显示公式总览，不展示适用范围、注意事项或来源链接。

变量符号和单位显示分为两层：

- 内部 ID 保持稳定 ASCII，例如 `Pa*s`、`kg/m^3`、`m^2/s`。
- 用户界面通过 `displaySymbol`、`formatVariableSymbol` 和 `formatUnitSymbol` 显示 `Pa·s`、`kg/m³`、`m²/s`、`μ`、`ρ` 等可读文本。

正式计算器必须保持以下内容一致：

- 研究记录中的公式。
- 纯函数实现。
- 页面展示公式。
- 原始 LaTeX 字符串。
- 验证测试案例。
- 公式库展示内容。
- `docs/research/calculators/<calculator-id>.md` 内部研究记录。

公开页面不展示外部来源链接。来源、访问日期、适用范围、验证案例和审核状态保存在 `docs/research/calculators` 以及计算器元数据中，用于维护者审查。

公式库页面的变量说明使用简化格式“符号 / 含义”；计算器详情页变量说明使用完整格式“符号 / 名称 / 单位 / 含义”。普通变量符号通过 `formatVariableSymbol` 转换为用户可读文本，复制 LaTeX 时仍使用原始 LaTeX 字符串。

### Fluent 导览

页面启动 -> `src/knowledge/knowledgeRepository.ts` 读取 `public/knowledge/fluent-demo.json` -> 根据条目 ID 展示内容。

页面不得硬编码知识正文。修改单个解释时，只更新知识库条目。v0.3 已在知识库控件模型中加入 `dialog.controls`，用于描述模拟窗口和窗口内部可点击控件。页面组件只根据这些结构渲染窗口、切换当前控件并在右侧解释面板显示对应说明。

## 静态部署

生产构建输出目录是 `dist`。`public/_redirects` 用于 Cloudflare Pages 单页应用路由回退。
