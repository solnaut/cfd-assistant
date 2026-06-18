import type {
  FluentKnowledgeEntry,
  FluentKnowledgeFile,
} from '../models/knowledge'

export const DEFAULT_KNOWLEDGE_URL = '/knowledge/fluent-demo.json'

export async function loadFluentKnowledge(
  url = DEFAULT_KNOWLEDGE_URL,
): Promise<FluentKnowledgeFile> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Knowledge file request failed: ${response.status}`)
  }

  const data = (await response.json()) as FluentKnowledgeFile

  if (!Array.isArray(data.entries)) {
    throw new Error('Knowledge file is missing an entries array.')
  }

  return data
}

export function groupKnowledgeByModule(entries: FluentKnowledgeEntry[]) {
  return entries.reduce<Record<string, FluentKnowledgeEntry[]>>((groups, entry) => {
    groups[entry.module] = groups[entry.module] ?? []
    groups[entry.module].push(entry)
    return groups
  }, {})
}

export function findKnowledgeEntry(
  entries: FluentKnowledgeEntry[],
  id: string,
) {
  return entries.find((entry) => entry.id === id) ?? null
}

export function searchKnowledgeEntries(
  entries: FluentKnowledgeEntry[],
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return entries
  }

  return entries.filter((entry) => {
    const searchableText = [
      entry.id,
      entry.module,
      entry.englishName,
      entry.chineseName,
      entry.menuPath.join(' '),
      entry.oneLineSummary,
      ...entry.searchKeywords,
    ]
      .join(' ')
      .toLowerCase()

    return searchableText.includes(normalizedQuery)
  })
}
