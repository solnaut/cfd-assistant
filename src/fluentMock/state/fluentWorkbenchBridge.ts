export type FluentWorkbenchMode = 'meshing' | 'solution'
export type FluentDimension = '3d' | '2d'

export interface FluentLauncherConfig {
  mode: FluentWorkbenchMode
  dimension: FluentDimension
  doublePrecision: boolean
  processes: number
}

export interface FluentLauncherPreferences {
  theme: 'light' | 'dark'
  displayMeshAfterReading: boolean
  graphicsDriver: 'auto' | 'dx11' | 'opengl2' | 'null'
  workingDirectory: string
  parallelMode: 'local' | 'serial' | 'cluster'
  interconnect: 'default' | 'msmpi' | 'intel'
  gpgpus: number
  startupWorkflow: 'watertight' | 'fault-tolerant'
  startupJournal: string
  setupUdfCompiler: boolean
  useScheduler: boolean
  schedulerType: 'Windows HPC' | 'Slurm' | 'LSF' | 'PBS'
  schedulerQueue: string
  environmentVars: string
  language: 'en' | 'both' | 'zh'
}

export const DEFAULT_LAUNCHER_PREFERENCES: FluentLauncherPreferences = {
  theme: 'light',
  displayMeshAfterReading: true,
  graphicsDriver: 'auto',
  workingDirectory: 'C:\\Users\\CFD\\Documents\\mixing-elbow-demo',
  parallelMode: 'local',
  interconnect: 'default',
  gpgpus: 0,
  startupWorkflow: 'watertight',
  startupJournal: '',
  setupUdfCompiler: false,
  useScheduler: false,
  schedulerType: 'Windows HPC',
  schedulerQueue: 'default',
  environmentVars: 'FLUENT_AFFINITY=0',
  language: 'en',
}

const PREFS_STORAGE_KEY = 'cfd_assistant_launcher_prefs_v1'

export function saveLauncherPreferences(prefs: FluentLauncherPreferences): void {
  try {
    window.sessionStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export function readLauncherPreferences(): FluentLauncherPreferences {
  try {
    const raw = window.sessionStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return DEFAULT_LAUNCHER_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<FluentLauncherPreferences>
    if (!parsed || typeof parsed !== 'object') return DEFAULT_LAUNCHER_PREFERENCES
    return {
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
      displayMeshAfterReading:
        typeof parsed.displayMeshAfterReading === 'boolean'
          ? parsed.displayMeshAfterReading
          : true,
      graphicsDriver:
        parsed.graphicsDriver && ['auto', 'dx11', 'opengl2', 'null'].includes(parsed.graphicsDriver)
          ? parsed.graphicsDriver
          : 'auto',
      workingDirectory:
        typeof parsed.workingDirectory === 'string' && parsed.workingDirectory.trim()
          ? parsed.workingDirectory
          : DEFAULT_LAUNCHER_PREFERENCES.workingDirectory,
      parallelMode:
        parsed.parallelMode && ['local', 'serial', 'cluster'].includes(parsed.parallelMode)
          ? parsed.parallelMode
          : 'local',
      interconnect:
        parsed.interconnect && ['default', 'msmpi', 'intel'].includes(parsed.interconnect)
          ? parsed.interconnect
          : 'default',
      gpgpus:
        typeof parsed.gpgpus === 'number' && Number.isInteger(parsed.gpgpus) && parsed.gpgpus >= 0 && parsed.gpgpus <= 8
          ? parsed.gpgpus
          : 0,
      startupWorkflow:
        parsed.startupWorkflow === 'fault-tolerant' ? 'fault-tolerant' : 'watertight',
      startupJournal: typeof parsed.startupJournal === 'string' ? parsed.startupJournal : '',
      setupUdfCompiler: Boolean(parsed.setupUdfCompiler),
      useScheduler: Boolean(parsed.useScheduler),
      schedulerType:
        parsed.schedulerType && ['Windows HPC', 'Slurm', 'LSF', 'PBS'].includes(parsed.schedulerType)
          ? parsed.schedulerType
          : 'Windows HPC',
      schedulerQueue:
        typeof parsed.schedulerQueue === 'string' && parsed.schedulerQueue.trim()
          ? parsed.schedulerQueue
          : 'default',
      environmentVars:
        typeof parsed.environmentVars === 'string'
          ? parsed.environmentVars
          : DEFAULT_LAUNCHER_PREFERENCES.environmentVars,
      language:
        parsed.language && ['en', 'both', 'zh'].includes(parsed.language)
          ? parsed.language
          : 'en',
    }
  } catch {
    return DEFAULT_LAUNCHER_PREFERENCES
  }
}

export interface MeshingBoundarySummaryItem {
  name: string
  type: string
}

export interface MeshingToSolutionHandoff {
  fromMeshing: boolean
  meshType: 'poly-hexcore' | 'polyhedra' | 'tetrahedral' | 'hexcore' | 'multizone'
  cellCount: number
  surfaceFaceCount: number
  minOrthogonalQuality: number
  maxSkewness: number
  boundaryLayers: number
  dimension: FluentDimension
  doublePrecision: boolean
  processes: number
  boundarySummary: MeshingBoundarySummaryItem[]
}

const HANDOFF_STORAGE_KEY = 'cfd_assistant_meshing_to_solution_handoff_v1'
const meshTypes = ['poly-hexcore', 'polyhedra', 'tetrahedral', 'hexcore', 'multizone']

function validCount(value: unknown, fallback: number, min = 0, max = Number.MAX_SAFE_INTEGER) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback
}

function validQuality(value: unknown, fallback: number) {
  return typeof value === 'number' && value >= 0 && value <= 1 ? value : fallback
}

export function saveMeshingHandoff(handoff: MeshingToSolutionHandoff): void {
  try {
    window.sessionStorage.setItem(HANDOFF_STORAGE_KEY, JSON.stringify(handoff))
  } catch {
    // Ignore storage quota or sandbox restrictions
  }
}

export function consumeMeshingHandoff(): MeshingToSolutionHandoff | null {
  try {
    const raw = window.sessionStorage.getItem(HANDOFF_STORAGE_KEY)
    if (!raw) return null
    window.sessionStorage.removeItem(HANDOFF_STORAGE_KEY)
    const parsed = JSON.parse(raw) as Partial<MeshingToSolutionHandoff>
    if (!parsed || parsed.fromMeshing !== true) return null
    return {
      fromMeshing: true,
      meshType: parsed.meshType && meshTypes.includes(parsed.meshType) ? parsed.meshType : 'poly-hexcore',
      cellCount: validCount(parsed.cellCount, 48620, 1),
      surfaceFaceCount: validCount(parsed.surfaceFaceCount, 6420, 1),
      minOrthogonalQuality: validQuality(parsed.minOrthogonalQuality, 0.34),
      maxSkewness: validQuality(parsed.maxSkewness, 0.72),
      boundaryLayers: validCount(parsed.boundaryLayers, 5),
      dimension: parsed.dimension === '2d' ? '2d' : '3d',
      doublePrecision: typeof parsed.doublePrecision === 'boolean' ? parsed.doublePrecision : true,
      processes: validCount(parsed.processes, 4, 1, 64),
      boundarySummary: Array.isArray(parsed.boundarySummary)
        ? parsed.boundarySummary.filter((row) =>
          typeof row?.name === 'string' && Boolean(row.name.trim()) &&
          typeof row.type === 'string' && Boolean(row.type.trim()))
        : [],
    }
  } catch {
    return null
  }
}

export function buildLauncherQuery(config: FluentLauncherConfig): string {
  const params = new URLSearchParams()
  params.set('dim', config.dimension)
  params.set('dp', config.doublePrecision ? '1' : '0')
  params.set('np', String(Math.max(1, Math.min(64, Math.round(config.processes)))))
  return params.toString()
}

export function parseLauncherParams(search: string): Partial<FluentLauncherConfig> {
  const params = new URLSearchParams(search)
  const result: Partial<FluentLauncherConfig> = {}
  const dim = params.get('dim')
  if (dim === '2d' || dim === '3d') {
    result.dimension = dim
  }
  const dp = params.get('dp')
  if (dp === '1' || dp === 'true') {
    result.doublePrecision = true
  } else if (dp === '0' || dp === 'false') {
    result.doublePrecision = false
  }
  const npRaw = params.get('np')
  if (npRaw && /^\d+$/.test(npRaw)) {
    const np = Number(npRaw)
    if (np >= 1 && np <= 64) {
      result.processes = np
    }
  }
  return result
}
