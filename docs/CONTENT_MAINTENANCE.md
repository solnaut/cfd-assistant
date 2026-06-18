# Content Maintenance

## Fluent 知识库维护

当前演示知识库位于：

- `public/knowledge/fluent-demo.json`
- `public/knowledge/knowledge-entry.template.json`

新增条目时：

1. 复制模板字段。
2. 设置唯一 `id`。
3. 填写路径、名称、关键词和内容版本。
4. 未确认专业内容保留 TODO。
5. 更新 `updatedAt`。
6. 运行 lint、test 和 build。

## 计算器维护

当前计算器定义位于：

- `src/calculators/registry.ts`
- `src/calculators/templates/calculatorDefinitionTemplate.ts`

实现计算器前必须先填写 `docs/FORMULA_VALIDATION_TEMPLATE.md` 中的公式、输入、输出、单位和验证案例。计算逻辑应使用纯函数，并配套自动测试。

## 内容审核状态

- `todo`：占位或待确认，不可作为正式专业建议。
- `draft`：已初步填写，但未完成审核或验证。
- `reviewed`：已由用户确认，可作为正式内容展示。
