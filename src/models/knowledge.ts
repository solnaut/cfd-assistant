export type KnowledgeContentStatus = 'todo' | 'draft' | 'reviewed'

export type FluentControlType =
  | 'button'
  | 'checkbox'
  | 'dialog'
  | 'field'
  | 'panel'
  | 'radio'
  | 'select'
  | 'tree-node'

export interface FluentKnowledgeOption {
  id?: string
  name: string
  description: string
}

export interface FluentKnowledgeControl {
  id: string
  label: string
  controlType: FluentControlType
  value?: string
  description: string
  opensDialog?: boolean
  relatedEntryId?: string
}

export interface FluentKnowledgeSource {
  title: string
  organization: string
  url: string
  accessedAt: string
}

export interface FluentKnowledgeEntry {
  id: string
  parentId?: string | null
  controlType?: FluentControlType
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
  controls?: FluentKnowledgeControl[]
  relatedFeatures: string[]
  relatedCalculators: string[]
  applicableFluentVersions: string[]
  sources?: FluentKnowledgeSource[]
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
