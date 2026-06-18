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
  calculators/     计算器定义与未来计算逻辑
  units/           单位定义与换算
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

页面不得直接包含公式。未来每个计算器应有独立的公式实现文件和验证测试。

### Fluent 导览

页面启动 -> `src/knowledge/knowledgeRepository.ts` 读取 `public/knowledge/fluent-demo.json` -> 根据条目 ID 展示内容。

页面不得硬编码知识正文。修改单个解释时，只更新知识库条目。

## 静态部署

生产构建输出目录是 `dist`。`public/_redirects` 用于 Cloudflare Pages 单页应用路由回退。
