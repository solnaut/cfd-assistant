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

export interface FluentMockControl {
  id: string
  label: string
  labelZh: string
  region: string
  module: string
  group: string
  controlType: FluentMockControlType
  parentId?: string
  panelId?: string
  dialogId?: string
  positionHint?: string
  explanationId: string
  enabled?: boolean
  defaultSelected?: boolean
  value?: string
  icon?: string
}

export interface FluentMockExplanation {
  id: string
  title: string
  location: string
  controlType: string
  summary: string
  purpose: string
  whenToUse: string
  commonMistakes: string
  relatedControls: string[]
  sourceStatus: 'source-checked' | 'draft-public-sources' | 'natural-placeholder'
  futureWindowNotes?: string
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
