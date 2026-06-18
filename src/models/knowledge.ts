export type KnowledgeContentStatus = 'todo' | 'draft' | 'reviewed'

export interface FluentKnowledgeOption {
  name: string
  description: string
}

export interface FluentKnowledgeEntry {
  id: string
  module: string
  englishName: string
  chineseName: string
  menuPath: string[]
  oneLineSummary: string
  principle: string
  useCases: string
  majorOptions: FluentKnowledgeOption[]
  optionDifferences: string
  impactOnAccuracyStabilityCost: string
  prerequisites: string
  commonErrors: string
  checkSuggestions: string
  relatedFeatures: string[]
  relatedCalculators: string[]
  applicableFluentVersions: string[]
  contentVersion: string
  updatedAt: string
  searchKeywords: string[]
  contentStatus: KnowledgeContentStatus
}

export interface FluentKnowledgeFile {
  contentVersion: string
  updatedAt: string
  entries: FluentKnowledgeEntry[]
}
