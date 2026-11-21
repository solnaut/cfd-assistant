export type FluentWorkbenchMode = 'meshing' | 'solution'
export type FluentDimension = '3d' | '2d'

export interface FluentLauncherConfig {
  mode: FluentWorkbenchMode
  dimension: FluentDimension
  doublePrecision: boolean
  processes: number
}

export interface MeshingBoundarySummaryItem {
  name: string
  type: string
}

export interface MeshingToSolutionHandoff {
  fromMeshing: boolean
  meshType: 'poly-hexcore' | 'polyhedra' | 'tetrahedral' | 'hexcore'
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
      meshType: parsed.meshType ?? 'poly-hexcore',
      cellCount: typeof parsed.cellCount === 'number' ? parsed.cellCount : 48620,
      surfaceFaceCount:
        typeof parsed.surfaceFaceCount === 'number' ? parsed.surfaceFaceCount : 6420,
      minOrthogonalQuality:
        typeof parsed.minOrthogonalQuality === 'number'
          ? parsed.minOrthogonalQuality
          : 0.34,
      maxSkewness: typeof parsed.maxSkewness === 'number' ? parsed.maxSkewness : 0.72,
      boundaryLayers:
        typeof parsed.boundaryLayers === 'number' ? parsed.boundaryLayers : 5,
      dimension: parsed.dimension === '2d' ? '2d' : '3d',
      doublePrecision: Boolean(parsed.doublePrecision),
      processes:
        typeof parsed.processes === 'number' && parsed.processes >= 1
          ? parsed.processes
          : 4,
      boundarySummary: Array.isArray(parsed.boundarySummary)
        ? parsed.boundarySummary
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
  if (npRaw) {
    const np = Number.parseInt(npRaw, 10)
    if (Number.isFinite(np) && np >= 1 && np <= 64) {
      result.processes = np
    }
  }
  return result
}
