import { getControlChecked, getControlValue, type FluentSimState } from '../state/fluentSimState'
import type { FluentMeshingState } from '../meshing/meshingState'

export type FluentDiagramKind =
  | 'solver-comparison'
  | 'turbulence-hierarchy'
  | 'near-wall-yplus'
  | 'multiphase-regimes'
  | 'heat-transfer-modes'
  | 'radiation-models'
  | 'species-combustion'
  | 'dpm-lagrangian'
  | 'boundary-conditions'
  | 'dynamic-mesh'
  | 'solution-schemes'
  | 'uds-transport'
  | 'surface-mesh-cad'
  | 'volume-mesh-layers'

export interface TeachingDiagramSpec {
  kind: FluentDiagramKind
  title: string
  caption: string
  activeModel?: string
  highlights?: string[]
}

const SOLVER_KINDS: Record<FluentDiagramKind, Omit<TeachingDiagramSpec, 'activeModel' | 'highlights'>> = {
  'solver-comparison': {
    kind: 'solver-comparison',
    title: '压力基 vs 密度基求解器物理适用图谱',
    caption: '对比低马赫数压力泊松修正耦合（Pressure-Based）与高马赫激波捕获通量雅可比矩阵耦合（Density-Based）的核心差异。',
  },
  'turbulence-hierarchy': {
    kind: 'turbulence-hierarchy',
    title: '湍流解析尺度谱系与近壁处理策略',
    caption: '从 100% 模化雷诺平均（RANS）到大涡尺度解析（LES/DES）再到直接数值模拟（DNS）的尺度截断与计算代价对比。',
  },
  'near-wall-yplus': {
    kind: 'near-wall-yplus',
    title: '近壁边界层速度剖面 u+(y+) 与第一层网格划分准则',
    caption: '解析黏性底层（y+ ≈ 1 配合 SST / EWT）与对数律壁面函数跳层（30 < y+ < 300 配合 k-ε）对应的第一层棱柱厚度差异。',
  },
  'multiphase-regimes': {
    kind: 'multiphase-regimes',
    title: '多相流三大体系物理拓扑与相间作用机制',
    caption: 'VOF 锐利自由界面（明渠/表面张力）、Mixture 混合滑移与 Eulerian-Eulerian 双向相间力耦合（曳力/升力/传热传质）示意。',
  },
  'heat-transfer-modes': {
    kind: 'heat-transfer-modes',
    title: '能量方程：导热、对流、浮升与共轭传热 (CHT) 物理机理',
    caption: '串联流固耦合热通量连续条件（q_fluid = q_solid）、热阻分布及自然对流 Boussinesq/理想气体浮升力驱动结构。',
  },
  'radiation-models': {
    kind: 'radiation-models',
    title: '热辐射模型按光学厚度 (τ = a·L) 的适用选型图',
    caption: '光学薄真空腔体（S2S 角系数）与半透明全光学厚度（DO 离散坐标射线法 / P1 / Rosseland 扩散近似）的辐射传输路径示意。',
  },
  'species-combustion': {
    kind: 'species-combustion',
    title: '组分输运与湍流燃烧模型 (Da - Ka) 物理机制图',
    caption: '层流有限速率、涡耗散快速反应（Da >> 1）、涡耗散概念 EDC 有限速率化学机理以及非预混混合分数 PDF 查表机制对比。',
  },
  'dpm-lagrangian': {
    kind: 'dpm-lagrangian',
    title: '欧拉连续相与拉格朗日离散相 (DPM) 双向耦合流程',
    caption: '在连续流体速度场网格中积分颗粒/液滴轨道方程，包含湍流随机游走（DRW）、相间源项反馈与液滴二次破碎/碰壁液膜。',
  },
  'boundary-conditions': {
    kind: 'boundary-conditions',
    title: '流体计算域出入口、壁面与内部薄面边界物理约束',
    caption: '速度/质量入口与压力出口回流边界的静压/速度互补关系，及内部 Fan 压升阶跃、Porous Jump 阻力阶跃与 Radiator 热交换规律。',
  },
  'dynamic-mesh': {
    kind: 'dynamic-mesh',
    title: '动态网格三大拓扑更新策略 (Smoothing / Layering / Remeshing)',
    caption: '根据刚体变形幅度分别选用弹性光顺、活塞直扫推进铺层、局部四面体实时重构与 6-DOF 流体载荷被动耦合运动。',
  },
  'solution-schemes': {
    kind: 'solution-schemes',
    title: '控制容积法压力-速度耦合与对流离散阶数数值行为',
    caption: '一阶迎风（强稳定耗散大）与二阶迎风/QUICK（低耗散高精度）重构梯度对比，及 Coupled / PISO / SIMPLE 耦合推进闭环。',
  },
  'uds-transport': {
    kind: 'uds-transport',
    title: '自定义标量 (UDS) 对流-扩散守恒方程与跨界面联动闭环',
    caption: '开启 UDS 方程数量后，在 Materials 指定标量扩散系数 Γ，并在所有进出口与壁面同步解锁 UDS 固定值 / 标量通量边界条件。',
  },
  'surface-mesh-cad': {
    kind: 'surface-mesh-cad',
    title: '前处理 CAD 共享拓扑 (Share Topology) 与尺寸函数控制',
    caption: '共享共节点交界面与曲率/邻近度局部加密（保证窄间隙跨越至少 2–3 层单元）确保共轭传热与流体域无缝密封。',
  },
  'volume-mesh-layers': {
    kind: 'volume-mesh-layers',
    title: '体网格单元拓扑、边界层棱柱推移与正交质量判据',
    caption: 'Poly-Hexcore 核心六面体+多面体过渡结构对比全四面体，展示第一层边界层增长率及面法向偏差偏斜度/正交质量角。',
  },
}

function getActiveViscousLabel(simState: FluentSimState): string {
  if (getControlChecked(simState, 'viscous-inviscid')) return 'Inviscid'
  if (getControlChecked(simState, 'viscous-laminar')) return 'Laminar'
  if (getControlChecked(simState, 'viscous-sa')) return 'Spalart-Allmaras'
  if (getControlChecked(simState, 'viscous-kepsilon')) {
    return `k-epsilon (${getControlValue(simState, 'viscous-ke-submodel', 'realizable')})`
  }
  if (getControlChecked(simState, 'viscous-kw-sst')) {
    return `k-omega (${getControlValue(simState, 'viscous-kw-submodel', 'sst')})`
  }
  if (getControlChecked(simState, 'viscous-rsm')) return 'Reynolds Stress (RSM)'
  if (getControlChecked(simState, 'viscous-les')) return 'LES / DES'
  return 'k-omega SST'
}

export function getSolutionTeachingDiagram(
  explanationId?: string,
  dialogId?: string,
  controlId?: string,
  simState?: FluentSimState,
): TeachingDiagramSpec | null {
  const token = [explanationId, dialogId, controlId].filter(Boolean).join(' ').toLowerCase()
  if (!token) return null

  const activeSolver = simState ? (simState.solverType === 'density-based' ? 'Density-Based' : 'Pressure-Based') : undefined
  const activeMultiphase = simState ? getControlValue(simState, 'multiphase-model-select', 'Off') : undefined
  const activeRadiation = simState ? getControlValue(simState, 'radiation-model-select', 'Off') : undefined
  const activeSpecies = simState ? getControlValue(simState, 'species-model-select', 'Off') : undefined
  const activeViscous = simState ? getActiveViscousLabel(simState) : undefined
  const udsCount = simState ? getControlValue(simState, 'uds-count', '0') : '0'

  if (token.includes('yplus') || token.includes('wall-treatment') || token.includes('wall-roughness')) {
    return {
      ...SOLVER_KINDS['near-wall-yplus'],
      activeModel: activeViscous,
      highlights: simState ? [`Wall Treatment: ${getControlValue(simState, 'viscous-wall-treatment', 'Enhanced Wall Treatment')}`] : undefined,
    }
  }
  if (token.includes('viscous') || token.includes('turbulen') || token.includes('rans-les')) {
    return {
      ...SOLVER_KINDS['turbulence-hierarchy'],
      activeModel: activeViscous,
      highlights: simState?.energyEnabled ? ['Energy Coupled'] : undefined,
    }
  }
  if (token.includes('uds') || token.includes('udm') || token.includes('scalar')) {
    return {
      ...SOLVER_KINDS['uds-transport'],
      activeModel: `UDS Equations = ${udsCount}`,
      highlights: Number(udsCount) > 0 ? ['BC UDS Tab Active', 'Materials UDS Diffusivity Active'] : undefined,
    }
  }
  if (token.includes('multiphase') || token.includes('vof') || token.includes('phase') || token.includes('boiling') || token.includes('cavitation') || token.includes('evaporation') || token.includes('degassing') || token.includes('open-channel')) {
    return {
      ...SOLVER_KINDS['multiphase-regimes'],
      activeModel: activeMultiphase,
      highlights: simState && getControlChecked(simState, 'multiphase-open-channel') ? ['Open Channel VOF Active'] : undefined,
    }
  }
  if (token.includes('radiation') || token.includes('dtrm') || token.includes('emissivity')) {
    return {
      ...SOLVER_KINDS['radiation-models'],
      activeModel: activeRadiation,
    }
  }
  if (token.includes('species') || token.includes('combustion') || token.includes('pdf') || token.includes('chemkin') || token.includes('pollutants') || token.includes('nox') || token.includes('soot')) {
    return {
      ...SOLVER_KINDS['species-combustion'],
      activeModel: activeSpecies,
    }
  }
  if (token.includes('dpm') || token.includes('injection') || token.includes('particle') || token.includes('rosin-rammler') || token.includes('breakup') || token.includes('wall-film')) {
    return {
      ...SOLVER_KINDS['dpm-lagrangian'],
      activeModel: simState && getControlChecked(simState, 'dpm-breakup') ? 'Breakup Enabled' : 'Lagrangian Parcel Tracking',
    }
  }
  if (token.includes('dynamic-mesh') || token.includes('sixdof') || token.includes('incylinder') || token.includes('contact')) {
    return {
      ...SOLVER_KINDS['dynamic-mesh'],
      activeModel: simState ? getControlValue(simState, 'dynamic-mesh-zone-type', 'Stationary') : undefined,
    }
  }
  if (token.includes('energy') || token.includes('heat') || token.includes('thermal') || token.includes('shell-conduction') || token.includes('radiator') || token.includes('solidification') || token.includes('battery')) {
    return {
      ...SOLVER_KINDS['heat-transfer-modes'],
      activeModel: simState?.energyEnabled ? 'Energy On' : 'Energy Off',
    }
  }
  if (token.includes('general-solver') || token.includes('pressure-based') || token.includes('density-based') || token.includes('gravity') || token.includes('operating')) {
    return {
      ...SOLVER_KINDS['solver-comparison'],
      activeModel: activeSolver,
      highlights: simState ? [`Time: ${simState.timeFormulation}`] : undefined,
    }
  }
  if (token.includes('method') || token.includes('discretization') || token.includes('controls') || token.includes('amg') || token.includes('multigrid') || token.includes('hotr') || token.includes('nita') || token.includes('residual') || token.includes('initialization')) {
    return {
      ...SOLVER_KINDS['solution-schemes'],
      activeModel: simState ? getControlValue(simState, 'methods-pressure-velocity', 'Coupled') : undefined,
    }
  }
  if (token.includes('inlet') || token.includes('outlet') || token.includes('wall') || token.includes('fan') || token.includes('porous') || token.includes('periodic') || token.includes('vent') || token.includes('symmetry') || token.includes('bc-')) {
    return {
      ...SOLVER_KINDS['boundary-conditions'],
      activeModel: dialogId?.replace(/-dialog$/, '') ?? undefined,
    }
  }
  return null
}

export function getMeshingTeachingDiagram(
  explanationId?: string,
  state?: FluentMeshingState,
): TeachingDiagramSpec | null {
  const token = (explanationId || '').toLowerCase()
  if (!token) return null

  if (
    token.includes('volume') ||
    token.includes('boundary-layer') ||
    token.includes('prism') ||
    token.includes('improve') ||
    token.includes('check') ||
    token.includes('bl-')
  ) {
    return {
      ...SOLVER_KINDS['volume-mesh-layers'],
      activeModel: state?.volumeMesh.fillWith ?? 'poly-hexcore',
      highlights: state
        ? [`Prism Layers: ${state.boundaryLayers.numberOfLayers}`, `Min Ortho: ${state.volumeMesh.minOrthogonalQuality}`]
        : undefined,
    }
  }

  return {
    ...SOLVER_KINDS['surface-mesh-cad'],
    activeModel: state ? (state.describeGeometry.shareTopology === 'yes' ? 'Share Topology: Conformal' : 'Non-Conformal Mesh') : 'Share Topology',
    highlights: state
      ? [`Max Skewness: ${state.surfaceMesh.maxSkewness}`, `Regions: ${state.regions.length}`]
      : undefined,
  }
}

export function getDialogInlineSummaryAndDiagram(
  dialogId: string,
  simState: FluentSimState,
): { summary: string; diagram: TeachingDiagramSpec | null } | null {
  const diagram = getSolutionTeachingDiagram(undefined, dialogId, undefined, simState)

  switch (dialogId) {
    case 'viscous-model-dialog':
      return {
        summary: `当前活跃模型：${getActiveViscousLabel(simState)}；近壁处理：${getControlValue(simState, 'viscous-wall-treatment', 'Enhanced Wall Treatment')}。工程通用外/内流首选 k-omega SST 兼顾近壁高分辨率（y+ ≈ 1）与远场剪切预测；强旋流/弯曲流可切换 Realizable k-epsilon 或 RSM。`,
        diagram: SOLVER_KINDS['turbulence-hierarchy'],
      }
    case 'multiphase-model-dialog':
      return {
        summary: `当前多相模型：${getControlValue(simState, 'multiphase-model-select', 'Off')}；体积分数格式：${getControlValue(simState, 'multiphase-vof-formulation', 'Explicit')}。清晰气液界面追踪选 VOF（明渠与波浪流可同步开启下方 Open Channel），气泡/颗粒悬浮弥散滑移选 Mixture 或 Eulerian。`,
        diagram: SOLVER_KINDS['multiphase-regimes'],
      }
    case 'energy-model-dialog':
      return {
        summary: `当前状态：Energy ${simState.energyEnabled ? '已启用' : '未启用'}。启用后激活能量输运方程，并在 Materials 启用比热/热导率关联及在所有壁面/出入口解锁 Thermal（温度/热流/对流/辐射/耦合面）边界设置。`,
        diagram: SOLVER_KINDS['heat-transfer-modes'],
      }
    case 'radiation-model-dialog':
      return {
        summary: `当前辐射模型：${getControlValue(simState, 'radiation-model-select', 'Off')}。透明无吸收腔体换热优先用 S2S；需考虑烟气/玻璃等介质吸收散射与全光学厚度通用高精度预测则选用 Discrete Ordinates (DO)。`,
        diagram: SOLVER_KINDS['radiation-models'],
      }
    case 'species-model-dialog':
      return {
        summary: `当前组分/燃烧模型：${getControlValue(simState, 'species-model-select', 'Off')}。单纯多组分混合传质选 Species Transport；带化学反应时高 Da 快速火焰可用 Eddy-Dissipation 或 Non-Premixed PDF，有限速率慢反应及点燃熄火用 EDC。`,
        diagram: SOLVER_KINDS['species-combustion'],
      }
    case 'dpm-model-dialog':
    case 'dpm-injection-dialog':
      return {
        summary: `拉格朗日离散相模型用于追踪微粒/液滴/气泡轨道与气固/气液动量质量热量交换；勾选 Breakup 与 Unsteady Particle Tracking 可在喷射器面板激活二次破碎与多组分蒸发。`,
        diagram: SOLVER_KINDS['dpm-lagrangian'],
      }
    case 'dynamic-mesh-dialog':
    case 'dynamic-mesh-zones-dialog':
      return {
        summary: `动网格通过 Smoothing（小幅微调光顺）、Layering（结构六面体/楔形扫掠铺层）与 Remeshing（四面体局部重构）维持网格正交质量并防止边界运动引发负体积。`,
        diagram: SOLVER_KINDS['dynamic-mesh'],
      }
    case 'udm-uds-dialog':
      return {
        summary: `当前 UDM = ${getControlValue(simState, 'udm-count', '0')}，UDS = ${getControlValue(simState, 'uds-count', '0')}。开启 ≥ 1 个自定义标量方程后，Materials 将新增 UDS Diffusivity，且所有流体进出口与壁面边界都会自动新增 UDS 选项卡。`,
        diagram: SOLVER_KINDS['uds-transport'],
      }
    default:
      return diagram ? { summary: diagram.caption, diagram } : null
  }
}
