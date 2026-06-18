# Fluent Knowledge Entry Template

知识条目 JSON 模板位于 `public/knowledge/knowledge-entry.template.json`。新增条目时复制该模板，修改 ID 和字段。

## 必填字段

- `id`：唯一 ID，建议使用 `module.item` 格式。
- `module`：所属模块，例如 `General`。
- `englishName`：英文名称。
- `chineseName`：中文名称。
- `menuPath`：菜单或教学路径数组。
- `oneLineSummary`：一句话说明。
- `principle`：功能原理。
- `useCases`：使用场景。
- `majorOptions`：主要选项。
- `optionDifferences`：不同选项的区别。
- `impactOnAccuracyStabilityCost`：对精度、稳定性和计算成本的影响。
- `prerequisites`：前置条件。
- `commonErrors`：常见错误。
- `checkSuggestions`：检查建议。
- `relatedFeatures`：关联功能 ID。
- `relatedCalculators`：关联计算器 ID。
- `applicableFluentVersions`：适用 Fluent 版本。
- `contentVersion`：内容版本。
- `updatedAt`：更新时间，使用 `YYYY-MM-DD`。
- `searchKeywords`：搜索关键词。
- `contentStatus`：`todo`、`draft` 或 `reviewed`。

## 内容规则

- 不复制官方帮助文档的大段原文。
- 不使用官方截图或 Logo。
- 未确认内容保留 TODO。
- 每次从 TODO 改为正式内容时，需要记录来源、审核人或验证依据。
