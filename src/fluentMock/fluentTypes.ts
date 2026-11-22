export type FluentMockControlType =
  | 'button'
  | 'checkbox'
  | 'console'
  | 'dialog-button'
  | 'field'
  | 'graphics-tool'
  | 'radio'
  | 'ribbon-button'
  | 'select'
  | 'tree-node'

export interface FluentVisibilityCondition {
  controlId: string
  values: Array<string | boolean>
}

export interface FluentMockControl {
  id: string
  label: string
  labelZh: string
  region: string
  module: string
  group: string
  section?: string
  controlType: FluentMockControlType
  parentId?: string
  panelId?: string
  dialogId?: string
  dialogTab?: string
  children?: FluentMockControl[]
  options?: string[]
  optionDisplay?: 'choices'
  optionDialogs?: Record<string, string>
  visibleWhen?: FluentVisibilityCondition[]
  positionHint?: string
  explanationId: string
  enabled?: boolean
  unavailableReason?: string
  defaultSelected?: boolean
  value?: string
  valueId?: string
  icon?: string
}

export interface FluentOperationGuide {
  coreConcept?: string
  choices?: Array<[name: string, description: string]>
  parameterEffects?: Array<[parameter: string, effect: string]>
  steps: string[]
  example: string
  contextNote?: string
}

export interface FluentMockExplanation {
  id: string
  title: string
  location: string
  controlType: string
  whatItIs: string
  recommendation: string
  checkItems: string[]
  summary: string
  purpose: string
  whenToUse: string
  commonMistakes: string
  relatedControls: string[]
  sourceStatus: 'source-checked' | 'draft-public-sources' | 'natural-placeholder'
  sourceUrl?: string
  operation?: FluentOperationGuide
}

export interface FluentMockRibbonTab {
  id: string
  label: string
  groups: FluentMockRibbonGroup[]
}

export interface FluentMockRibbonGroup {
  id: string
  label: string
  controls: FluentMockControl[]
}

export interface FluentMockTreeSection {
  id: string
  label: string
  defaultExpanded?: boolean
  controls: FluentMockControl[]
}

export interface FluentMockTaskControlGroup {
  id: string
  title: string
  controls: FluentMockControl[]
}

export interface FluentMockTaskPanel {
  id: string
  title: string
  module: string
  subtitle?: string
  groups: FluentMockTaskControlGroup[]
}

export interface FluentMockDialog {
  id: string
  title: string
  subtitle: string
  module: string
  controls: FluentMockControl[]
  sharedGroups?: string[]
  okOnly?: boolean
  fileOperation?: {
    verb: 'Read' | 'Write' | 'Import' | 'Export'
    format: string
    extensions: string[]
    sessionKey?: 'mesh' | 'case' | 'data' | 'case-data' | 'mesh-data'
  }
}

export interface FluentMockResearchSource {
  id: string
  title: string
  organization: string
  fluentVersion: string
  section: string
  url: string
  accessedAt: string
  supports: string[]
  status: 'recorded' | 'needs-more-detail'
}
