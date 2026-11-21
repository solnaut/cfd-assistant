export type MeshingWorkflowMode = 'watertight' | 'fault-tolerant'
export type MeshingViewportTab = 'cad' | 'surface-mesh' | 'volume-mesh' | 'quality'
export type MeshingTaskId =
  | 'wm-import-geometry'
  | 'wm-local-sizing'
  | 'wm-surface-mesh'
  | 'wm-describe-geometry'
  | 'wm-share-topology'
  | 'wm-update-boundaries'
  | 'wm-update-regions'
  | 'wm-boundary-layers'
  | 'wm-volume-mesh'
  | 'wm-improve-mesh'

export type MeshingTaskStatus = 'pending' | 'active' | 'completed' | 'skipped'
export type MeshingLocalSizingType =
  | 'boi'
  | 'face'
  | 'edge'
  | 'curvature'
  | 'proximity'

export type MeshingBoundaryHighlight = 'inlet' | 'outlet' | 'wall' | 'symmetry' | null

export interface MeshingBoundaryRow {
  id: string
  name: string
  type: string
  faceCount: number
  boundary: Exclude<MeshingBoundaryHighlight, null>
}

export interface MeshingRegionRow {
  id: string
  name: string
  type: 'fluid' | 'solid' | 'dead'
  estimatedCells: number
}

export interface MeshingLocalSizingItem {
  id: string
  name: string
  sizingType: MeshingLocalSizingType
  targetSize: string
  growthRate: string
  scope: string
}

export interface MeshingRibbonCommand {
  id: string
  label: string
  group: string
  targetTaskId?: MeshingTaskId
  viewportTab?: MeshingViewportTab
  actionId?:
    | 'reset-workflow'
    | 'run-surface-mesh'
    | 'run-volume-mesh'
    | 'run-improve-mesh'
    | 'toggle-cut-plane'
    | 'switch-to-solution'
    | 'open-calculators'
    | 'open-formulas'
    | 'open-troubleshoot'
  explanationId: string
}

export interface MeshingRibbonGroup {
  id: string
  label: string
  commands: MeshingRibbonCommand[]
}

export interface MeshingRibbonTab {
  id: string
  label: string
  groups: MeshingRibbonGroup[]
}

export interface MeshingWorkflowStep {
  id: MeshingTaskId
  order: number
  label: string
  labelZh: string
  explanationId: string
  optional?: boolean
}

export interface FaultTolerantStep {
  id: string
  order: number
  label: string
  labelZh: string
  summary: string
  explanationId: string
}

export interface MeshingExplanation {
  id: string
  title: string
  location: string
  whatItIs: string
  recommendation: string
  whenToUse: string
  checkItems: string[]
  commonMistakes: string
  relatedControls: string[]
  relatedCalculators?: Array<{
    label: string
    to: string
    note: string
  }>
}

export interface MeshingTroubleshootingCase {
  id: string
  symptom: string
  likelyCauses: string[]
  fixes: string[]
  targetControls: Array<{ controlId: string; label: string }>
}

export interface MeshingControlMeta {
  id: string
  label: string
  labelZh: string
  location: string
  explanationId: string
  taskId?: MeshingTaskId
  ribbonTabId?: string
}
