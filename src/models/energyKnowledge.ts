export type EnergyCourseId =
  | 'fluid-mechanics'
  | 'engineering-thermodynamics'
  | 'heat-transfer'
  | 'refrigeration-principles'

export type EnergyDifficulty = '基础' | '进阶' | '工程应用'

export type EnergyDiagramKind =
  | 'fluid-bernoulli-pipe'
  | 'fluid-ns-control-volume'
  | 'fluid-boundary-layer'
  | 'fluid-external-vortex'
  | 'fluid-pump-curve'
  | 'thermo-pv-processes'
  | 'thermo-carnot-ts'
  | 'thermo-rankine-cycle'
  | 'thermo-ic-cycles'
  | 'thermo-hd-psychrometric'
  | 'ht-three-modes'
  | 'ht-wall-conduction'
  | 'ht-conduction-bc'
  | 'ht-heat-exchanger'
  | 'ref-vapor-compression'
  | 'ref-subcool-superheat'
  | 'ref-absorption-cycle'
  | 'ref-co2-transcritical'

export interface EnergyFormulaSymbol {
  symbol: string
  meaning: string
  unit: string
}

export interface EnergyFormulaBlock {
  title: string
  latex: string
  meaning: string
  symbols?: EnergyFormulaSymbol[]
  conditions?: string
}

export interface EnergyQuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface EnergyWorkedExample {
  title: string
  scenario: string
  given: string[]
  steps: string[]
  answer: string
  takeaway?: string
}

export interface EnergyCrossBridge {
  id: string
  title: string
  description: string
  disciplines: EnergyCourseId[]
  topicIds: string[]
  cfdLink?: {
    label: string
    to: string
  }
}

export interface EnergyFrameworkLayer {
  id: string
  tier: string
  title: string
  summary: string
  courseIds: EnergyCourseId[]
}

export interface EnergyTopic {
  id: string
  courseId: EnergyCourseId
  chapter: string
  moduleGroup?: string
  title: string
  englishTitle: string
  difficulty: EnergyDifficulty
  summary: string
  prerequisites?: string[]
  relatedTopicIds?: string[]
  keyPoints: string[]
  formulas: EnergyFormulaBlock[]
  comparisonTable?: {
    caption: string
    headers: string[]
    rows: string[][]
  }
  diagram?: {
    kind: EnergyDiagramKind
    caption: string
    note: string
  }
  workedExample?: EnergyWorkedExample
  engineeringTips: string[]
  cfdConnections?: Array<{
    label: string
    to: string
    note: string
  }>
  quiz: EnergyQuizQuestion
  extraQuizzes?: EnergyQuizQuestion[]
  keywords: string[]
}

export interface EnergyCourseModule {
  id: string
  title: string
  summary: string
  topicIds: string[]
}

export interface EnergyCourse {
  id: EnergyCourseId
  name: string
  englishName: string
  shortTag: string
  tagline: string
  description: string
  themeClass: string
  learningPath: string[]
  modules: EnergyCourseModule[]
  coreCompetencies: string[]
}
