import {
  getCalculatorFormulaEntries,
  getFormulaVariables,
} from '../calculators/formulas'
import {
  calculatorCatalog,
  calculatorCategories,
} from '../calculators/registry'
import { fluentExplanationById } from '../fluentMock/fluentExplanations'
import { labelIn } from '../fluentMock/fluentLanguage'
import { fluentMockLayout } from '../fluentMock/fluentLayoutData'
import { troubleshootingCases } from '../fluentMock/fluentTeachingExtras'
import { meshingControlCatalog } from '../fluentMock/meshing/meshingData'
import {
  meshingExplanations,
  meshingTroubleshootingCases,
} from '../fluentMock/meshing/meshingExplanations'
import { solutionTuiCatalog } from '../fluentMock/state/fluentTuiCommands'
import { energyTopics, getEnergyCourse } from '../knowledge/energyPower'
import { energyTopicBriefs } from '../knowledge/energyPower/topicBriefs'
import { diagnosisPaths } from '../knowledge/cfdPractice'
import { thermalLabs } from '../knowledge/thermalLabs'

export type GlobalSearchCategory =
  | 'all'
  | 'knowledge'
  | 'solution'
  | 'meshing'
  | 'calculator'
  | 'formula'
  | 'troubleshoot'
  | 'tui'

export interface GlobalSearchAction {
  kind:
    | 'solution-locate'
    | 'solution-troubleshoot'
    | 'solution-tui'
    | 'meshing-task'
    | 'meshing-troubleshoot'
    | 'meshing-tui'
    | 'formula-query'
  value: string
}

export interface GlobalSearchItem {
  id: string
  category: Exclude<GlobalSearchCategory, 'all'>
  title: string
  subtitle?: string
  location: string
  summary: string
  to: string
  action?: GlobalSearchAction
  keywords: string[]
}

export interface GlobalSearchHit {
  item: GlobalSearchItem
  score: number
}

export const OPEN_GLOBAL_SEARCH_EVENT = 'cfd-open-global-search'
export const WORKBENCH_LOCATE_EVENT = 'cfd-workbench-locate'
export const MESHING_LOCATE_EVENT = 'cfd-meshing-locate'
export const FORMULA_SEARCH_EVENT = 'cfd-formula-search'

export const DEFAULT_SEARCH_SUGGESTIONS = [
  'y+',
  '压焓图',
  '卡诺循环',
  'k-omega SST',
  'Poly-Hexcore',
  '发散',
  '傅里叶定律',
  '雷诺数',
] as const

export const GLOBAL_SEARCH_CATEGORY_LABELS: Record<GlobalSearchCategory, string> = {
  all: '全部',
  knowledge: '热流体工程图解',
  solution: 'Fluent 求解器',
  meshing: 'Fluent Meshing',
  calculator: '参数计算',
  formula: 'CFD 公式',
  troubleshoot: '报错排查',
  tui: 'TUI 命令',
}

const meshingTuiCatalog: ReadonlyArray<{ command: string; description: string }> = [
  { command: '/workflow/status', description: '查看 Meshing 工作流完成进度与正交质量摘要' },
  { command: '/mesh/surface-mesh', description: '生成表面网格并刷新面网格质量统计' },
  { command: '/mesh/volume-mesh', description: '生成 Poly-Hexcore / 多面体 / 四面体体网格' },
  { command: '/mesh/check-quality', description: '检查面偏斜率、体最小正交质量与最大长宽比' },
  { command: '/mesh/improve', description: '光顺优化体网格以抬升最小正交质量' },
]

const categoryById = new Map(calculatorCategories.map((c) => [c.id, c]))

let cachedIndex: GlobalSearchItem[] | null = null

export function getGlobalSearchIndex(): GlobalSearchItem[] {
  if (cachedIndex) return cachedIndex

  const items: GlobalSearchItem[] = []
  const seenIds = new Set<string>()

  function pushUnique(item: GlobalSearchItem) {
    if (seenIds.has(item.id)) return
    seenIds.add(item.id)
    items.push(item)
  }

  pushUnique({ id: 'tool:unit-converter', category: 'calculator', title: '工程单位换算器', location: '参数计算',
    summary: '压力基准、冷量、黏度及理想气体工况流量。', to: '/unit-converter', keywords: ['表压', '绝压', 'USRT', '单位转换', '标况'].map((word) => word.toLowerCase()) })
  pushUnique({ id: 'tool:cfd-selection', category: 'solution', title: 'CFD 模型与求解器选型向导', location: 'CFD 实战向导',
    summary: '按工况查看 Fluent 设置候选与验证要点。', to: '/cfd-practice', keywords: ['模型选型', '求解器推荐', '物理模型'] })
  for (const path of diagnosisPaths) {
    pushUnique({ id: `practice:${path.id}`, category: 'troubleshoot', title: path.label, location: 'CFD 实战向导',
      summary: path.steps[0].detail, to: `/cfd-practice?mode=diagnosis&symptom=${path.id}`,
      keywords: path.steps.flatMap(({ title, detail }) => [title, detail]).map((word) => word.toLowerCase()) })
  }
  for (const lab of thermalLabs) {
    pushUnique({ id: `lab:${lab.id}`, category: 'knowledge', title: lab.title + '实验', location: '热工交互实验室',
      summary: lab.description, to: `/thermal-lab?experiment=${lab.id}`, keywords: lab.keywords.map((word) => word.toLowerCase()) })
  }

  for (const calc of calculatorCatalog) {
    if (calc.availability !== 'available') continue
    const cat = categoryById.get(calc.categoryId)
    const ioTokens = [
      ...calc.inputs.flatMap((i) => [i.label, i.quantity, i.helperText ?? '']),
      ...calc.outputs.flatMap((o) => [o.label, o.quantity]),
    ]
    pushUnique({
      id: `calc:${calc.id}`,
      category: 'calculator',
      title: calc.name,
      subtitle: calc.shortName !== calc.name ? calc.shortName : undefined,
      location: `参数计算 → ${cat?.name ?? calc.categoryId}`,
      summary: calc.summary,
      to: `/calculators/${calc.categoryId}/${calc.id}`,
      keywords: [calc.id, calc.shortName, calc.name, cat?.name ?? '', cat?.eyebrow ?? '', ...ioTokens]
        .filter(Boolean)
        .map((t) => t.toLowerCase()),
    })

    for (const formula of getCalculatorFormulaEntries(calc)) {
      const vars = getFormulaVariables(calc, formula)
      const formulaId = formula.id ?? formula.title
      pushUnique({
        id: `formula:${calc.id}:${formulaId}`,
        category: 'formula',
        title: formula.title,
        subtitle: calc.shortName,
        location: `CFD 公式库 → ${cat?.name ?? calc.categoryId}`,
        summary: formula.description ?? formula.plainText,
        to: `/formulas?q=${encodeURIComponent(formula.title)}`,
        action: { kind: 'formula-query', value: formula.title },
        keywords: [
          formula.title,
          formula.plainText,
          formula.latex,
          formula.description ?? '',
          calc.name,
          calc.shortName,
          cat?.name ?? '',
          ...vars.flatMap((v) => [v.symbol, v.displaySymbol ?? '', v.name]),
        ]
          .filter(Boolean)
          .map((t) => t.toLowerCase()),
      })
    }
  }

  for (const topic of energyTopics) {
    const course = getEnergyCourse(topic.courseId)
    pushUnique({
      id: `knowledge:${topic.id}`,
      category: 'knowledge',
      title: topic.title,
      subtitle: topic.englishTitle,
      location: `热流体工程图解 → ${course?.name ?? topic.courseId} (${topic.chapter})`,
      summary: energyTopicBriefs[topic.id]?.takeaway ?? topic.summary,
      to: `/knowledge/${topic.courseId}/${topic.id}`,
      keywords: [
        '能源动力知识',
        topic.summary,
        topic.id,
        topic.title,
        topic.englishTitle,
        topic.chapter,
        topic.moduleGroup ?? '',
        course?.name ?? '',
        course?.englishName ?? '',
        ...topic.keyPoints,
        ...(topic.formulas ?? []).flatMap((f) => [f.title, f.meaning, f.latex]),
        topic.workedExample?.title ?? '',
        topic.workedExample?.scenario ?? '',
        ...topic.keywords,
      ]
        .filter(Boolean)
        .map((t) => t.toLowerCase()),
    })
  }

  const dialogTitleById = new Map(fluentMockLayout.dialogs.map((d) => [d.id, d.title]))
  const allSolutionControls = [
    ...fluentMockLayout.allControls,
    ...fluentMockLayout.dialogs.flatMap((d) => d.controls),
  ]

  for (const control of allSolutionControls) {
    if (!control.enabled || control.id === fluentMockLayout.quickSearchControl.id) continue
    const zh = labelIn('zh', control.label)
    const ownerDialogTitle = control.parentId ? dialogTitleById.get(control.parentId) : undefined
    const expl = fluentExplanationById.get(control.explanationId)
    const displayEn = control.label
    const displayZh = zh !== control.label ? zh : control.labelZh
    pushUnique({
      id: `solution:${control.id}`,
      category: 'solution',
      title: displayEn,
      subtitle: displayZh !== displayEn ? displayZh : undefined,
      location: `Fluent Solution → ${ownerDialogTitle ? `${ownerDialogTitle} (${control.module})` : control.module}`,
      summary: expl?.whatItIs || `${control.group} · ${control.region}`,
      to: `/fluent-guide?locate=${encodeURIComponent(control.id)}`,
      action: { kind: 'solution-locate', value: control.id },
      keywords: [
        control.id,
        control.label,
        control.labelZh,
        zh,
        control.module,
        control.group,
        ownerDialogTitle ?? '',
        labelIn('zh', ownerDialogTitle ?? ''),
        expl?.title ?? '',
        expl?.whatItIs ?? '',
        expl?.location ?? '',
        ...(control.optionDisplay === 'choices' ? control.options ?? [] : []),
      ]
        .filter(Boolean)
        .map((t) => t.toLowerCase()),
    })
  }

  for (const item of meshingControlCatalog) {
    const expl = meshingExplanations[item.explanationId]
    const taskTarget = item.taskId ?? 'wm-import-geometry'
    pushUnique({
      id: `meshing:${item.id}`,
      category: 'meshing',
      title: item.label,
      subtitle: item.labelZh !== item.label ? item.labelZh : undefined,
      location: `Fluent Meshing → ${item.location}`,
      summary: expl?.whatItIs ?? item.location,
      to: `/fluent-meshing?task=${encodeURIComponent(taskTarget)}`,
      action: { kind: 'meshing-task', value: taskTarget },
      keywords: [
        item.id,
        item.label,
        item.labelZh,
        labelIn('zh', item.label),
        item.location,
        expl?.title ?? '',
        expl?.whatItIs ?? '',
      ]
        .filter(Boolean)
        .map((t) => t.toLowerCase()),
    })
  }

  for (const t of troubleshootingCases) {
    pushUnique({
      id: `trouble:solution:${t.id}`,
      category: 'troubleshoot',
      title: t.symptom,
      subtitle: 'Solution 收敛与报错排查',
      location: 'Fluent Solution → 报错排查',
      summary: [...t.likelyCauses, ...t.fixes].join(' '),
      to: `/fluent-guide?panel=troubleshoot&case=${encodeURIComponent(t.id)}`,
      action: { kind: 'solution-troubleshoot', value: t.id },
      keywords: [
        t.id,
        t.symptom,
        ...t.likelyCauses,
        ...t.fixes,
        ...t.targetControls.map((c) => c.label),
      ]
        .filter(Boolean)
        .map((s) => s.toLowerCase()),
    })
  }

  for (const t of meshingTroubleshootingCases) {
    pushUnique({
      id: `trouble:meshing:${t.id}`,
      category: 'troubleshoot',
      title: t.symptom,
      subtitle: 'Meshing 网格报错排查',
      location: 'Fluent Meshing → 报错排查',
      summary: [...t.likelyCauses, ...t.fixes].join(' '),
      to: `/fluent-meshing?panel=troubleshoot&case=${encodeURIComponent(t.id)}`,
      action: { kind: 'meshing-troubleshoot', value: t.id },
      keywords: [
        t.id,
        t.symptom,
        ...t.likelyCauses,
        ...t.fixes,
        ...t.targetControls.map((c) => c.label),
      ]
        .filter(Boolean)
        .map((s) => s.toLowerCase()),
    })
  }

  for (const tui of solutionTuiCatalog) {
    pushUnique({
      id: `tui:solution:${tui.command}`,
      category: 'tui',
      title: tui.command,
      subtitle: 'Solution TUI',
      location: 'Fluent Solution → Console TUI',
      summary: tui.description,
      to: `/fluent-guide?tui=${encodeURIComponent(tui.command)}`,
      action: { kind: 'solution-tui', value: tui.command },
      keywords: [tui.command, tui.description, 'tui', 'console', '命令'].map((s) => s.toLowerCase()),
    })
  }

  for (const tui of meshingTuiCatalog) {
    pushUnique({
      id: `tui:meshing:${tui.command}`,
      category: 'tui',
      title: tui.command,
      subtitle: 'Meshing TUI',
      location: 'Fluent Meshing → Console TUI',
      summary: tui.description,
      to: `/fluent-meshing?tui=${encodeURIComponent(tui.command)}`,
      action: { kind: 'meshing-tui', value: tui.command },
      keywords: [tui.command, tui.description, 'tui', 'meshing', '命令'].map((s) => s.toLowerCase()),
    })
  }

  cachedIndex = items
  return items
}

export function scoreSearchItem(item: GlobalSearchItem, tokens: string[]): number {
  const titleLower = item.title.toLowerCase()
  const subtitleLower = (item.subtitle ?? '').toLowerCase()
  const locationLower = item.location.toLowerCase()
  const summaryLower = item.summary.toLowerCase()

  let score = 0
  for (const token of tokens) {
    let tokenBest = 0
    if (titleLower === token || subtitleLower === token) {
      tokenBest = 120
    } else if (titleLower.startsWith(token) || subtitleLower.startsWith(token)) {
      tokenBest = 80
    } else if (titleLower.includes(token)) {
      tokenBest = 50
    } else if (subtitleLower.includes(token)) {
      tokenBest = 40
    } else if (item.keywords.some((k) => k === token || k.startsWith(token))) {
      tokenBest = 32
    } else if (item.keywords.some((k) => k.includes(token))) {
      tokenBest = 22
    } else if (locationLower.includes(token)) {
      tokenBest = 18
    } else if (summaryLower.includes(token)) {
      tokenBest = 10
    }

    if (tokenBest === 0) return 0
    score += tokenBest
  }

  return score
}

export function searchGlobalIndex(
  query: string,
  category: GlobalSearchCategory = 'all',
  limit = 30,
): GlobalSearchHit[] {
  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return []

  const hits: GlobalSearchHit[] = []
  for (const item of getGlobalSearchIndex()) {
    if (category !== 'all' && item.category !== category) continue
    const score = scoreSearchItem(item, tokens)
    if (score > 0) hits.push({ item, score })
  }

  hits.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.item.title.length - b.item.title.length
  })

  return hits.slice(0, limit)
}

export function countByCategory(query: string): Record<GlobalSearchCategory, number> {
  const counts: Record<GlobalSearchCategory, number> = {
    all: 0,
    knowledge: 0,
    solution: 0,
    meshing: 0,
    calculator: 0,
    formula: 0,
    troubleshoot: 0,
    tui: 0,
  }

  const tokens = query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (tokens.length === 0) return counts

  for (const item of getGlobalSearchIndex()) {
    if (scoreSearchItem(item, tokens) > 0) {
      counts.all += 1
      counts[item.category] += 1
    }
  }

  return counts
}
