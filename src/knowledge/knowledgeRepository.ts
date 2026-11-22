import type {
  FluentKnowledgeEntry,
  FluentKnowledgeFile,
} from '../models/knowledge'

export const DEFAULT_KNOWLEDGE_URL = `${import.meta.env.BASE_URL}knowledge/fluent-demo.json`

export async function loadFluentKnowledge(
  url = DEFAULT_KNOWLEDGE_URL,
): Promise<FluentKnowledgeFile> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Knowledge file request failed: ${response.status}`)
  }

  const data = (await response.json()) as Partial<FluentKnowledgeFile> | null
  if (!data || !Array.isArray(data.entries)) {
    throw new Error('Knowledge file is missing an entries array.')
  }
  if (typeof data.contentVersion !== 'string' || typeof data.updatedAt !== 'string') {
    throw new Error('Knowledge file is missing version or update metadata.')
  }

  const ids = new Set<string>()
  for (const entry of data.entries) {
    if (!entry || typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id) ||
      typeof entry.module !== 'string' || typeof entry.englishName !== 'string' || typeof entry.chineseName !== 'string' ||
      typeof entry.oneLineSummary !== 'string' || !isStringList(entry.menuPath) || !isStringList(entry.searchKeywords)) {
      throw new Error('Knowledge file contains a duplicate ID or invalid searchable entry.')
    }
    ids.add(entry.id)
  }
  return { contentVersion: data.contentVersion, updatedAt: data.updatedAt, entries: data.entries }
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

export function groupKnowledgeByModule(entries: FluentKnowledgeEntry[]) {
  return entries.reduce<Record<string, FluentKnowledgeEntry[]>>((groups, entry) => {
    groups[entry.module] = groups[entry.module] ?? []
    groups[entry.module].push(entry)
    return groups
  }, Object.create(null) as Record<string, FluentKnowledgeEntry[]>)
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
