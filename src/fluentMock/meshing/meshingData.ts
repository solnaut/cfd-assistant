import type {
  MeshingControlMeta,
  MeshingRibbonTab,
  MeshingTaskId,
  MeshingWorkflowStep,
} from './meshingTypes'

export const watertightWorkflowSteps: MeshingWorkflowStep[] = [
  {
    id: 'wm-import-geometry',
    order: 1,
    label: 'Import Geometry',
    labelZh: '导入几何',
    explanationId: 'meshing-import-geometry',
  },
  {
    id: 'wm-local-sizing',
    order: 2,
    label: 'Add Local Sizing',
    labelZh: '添加局部尺寸',
    explanationId: 'meshing-local-sizing',
    optional: true,
  },
  {
    id: 'wm-surface-mesh',
    order: 3,
    label: 'Generate the Surface Mesh',
    labelZh: '生成面网格',
    explanationId: 'meshing-surface-mesh',
  },
  {
    id: 'wm-describe-geometry',
    order: 4,
    label: 'Describe Geometry',
    labelZh: '描述几何',
    explanationId: 'meshing-describe-geometry',
  },
  {
    id: 'wm-share-topology',
    order: 5,
    label: 'Apply Share Topology',
    labelZh: '应用共享拓扑',
    explanationId: 'meshing-share-topology',
    optional: true,
  },
  {
    id: 'wm-capping',
    order: 6,
    label: 'Enclose Fluid Regions (Capping)',
    labelZh: '封盖流体区域',
    explanationId: 'meshing-watertight-capping',
    requiresCapping: true,
  },
  {
    id: 'wm-update-boundaries',
    order: 7,
    label: 'Update Boundaries',
    labelZh: '更新边界条件',
    explanationId: 'meshing-update-boundaries',
  },
  {
    id: 'wm-update-regions',
    order: 8,
    label: 'Update Regions',
    labelZh: '更新体区域',
    explanationId: 'meshing-update-regions',
  },
  {
    id: 'wm-boundary-layers',
    order: 9,
    label: 'Add Boundary Layers',
    labelZh: '添加边界层',
    explanationId: 'meshing-boundary-layers',
    optional: true,
  },
  {
    id: 'wm-multizone-controls',
    order: 10,
    label: 'Add Multizone Controls',
    labelZh: '添加多区域网格控制',
    explanationId: 'meshing-multizone-controls',
    requiresMultizone: true,
  },
  {
    id: 'wm-multizone-mesh',
    order: 11,
    label: 'Generate the Multizone Mesh',
    labelZh: '生成多区域网格',
    explanationId: 'meshing-multizone-mesh',
    requiresMultizone: true,
  },
  {
    id: 'wm-volume-mesh',
    order: 12,
    label: 'Generate the Volume Mesh',
    labelZh: '生成体网格',
    explanationId: 'meshing-volume-mesh',
  },
  {
    id: 'wm-improve-mesh',
    order: 13,
    label: 'Improve Volume Mesh',
    labelZh: '改善体网格质量',
    explanationId: 'meshing-improve-mesh',
    optional: true,
  },
]

export function visibleWatertightSteps(multizone: boolean, replaceVolumeTask: boolean, capping = false) {
  return watertightWorkflowSteps
    .filter((step) => (multizone || !step.requiresMultizone) && (capping || !step.requiresCapping) &&
      (!replaceVolumeTask || step.id !== 'wm-volume-mesh'))
    .map((step, index) => ({ ...step, order: index + 1 }))
}

const watertightStepById = new Map(watertightWorkflowSteps.map((step) => [step.id, step]))

// The tutorial follows the internal-flow branch of the 2024 R2 guided workflow.
export const faultTolerantWorkflowSteps: MeshingWorkflowStep[] = ([
  { ...watertightStepById.get('wm-import-geometry')!, label: 'Import Geometry and Part Management', labelZh: '导入几何与部件管理' },
  { id: 'ft-describe', label: 'Describe Geometry and Flow', labelZh: '描述几何与流动', explanationId: 'meshing-ft-describe' },
  { id: 'ft-capping', label: 'Enclose Fluid Regions (Capping)', labelZh: '封盖流体区域', explanationId: 'meshing-ft-capping', optional: true },
  { id: 'ft-identify', label: 'Identify Regions', labelZh: '识别区域', explanationId: 'meshing-ft-identify' },
  { id: 'ft-leakage', label: 'Define Leakage Threshold', labelZh: '定义泄漏阈值', explanationId: 'meshing-ft-leakage', optional: true },
  watertightStepById.get('wm-update-regions')!,
  { ...watertightStepById.get('wm-local-sizing')!, label: 'Add Local Size Controls' },
  watertightStepById.get('wm-surface-mesh')!,
  watertightStepById.get('wm-update-boundaries')!,
  watertightStepById.get('wm-boundary-layers')!,
  watertightStepById.get('wm-volume-mesh')!,
  watertightStepById.get('wm-improve-mesh')!,
] satisfies Array<Omit<MeshingWorkflowStep, 'order'>>).map((step, index) => ({ ...step, order: index + 1 }))

export function taskForMode(taskId: MeshingTaskId, faultTolerant: boolean): MeshingTaskId {
  if (!faultTolerant) return taskId
  if (taskId === 'wm-describe-geometry') return 'ft-describe'
  if (taskId === 'wm-share-topology') return 'ft-capping'
  return taskId
}

export const meshingRibbonTabs: MeshingRibbonTab[] = [
  {
    id: 'm-tab-file',
    label: 'File',
    groups: [
      {
        id: 'm-grp-file-io',
        label: 'Case',
        commands: [
          {
            id: 'meshing-ribbon-import',
            label: 'Import Geometry',
            group: 'Case',
            targetTaskId: 'wm-import-geometry',
            viewportTab: 'cad',
            explanationId: 'meshing-import-geometry',
          },
          {
            id: 'meshing-ribbon-reset',
            label: 'Reset Workflow',
            group: 'Case',
            actionId: 'reset-workflow',
            explanationId: 'meshing-ribbon-reset',
          },
          {
            id: 'meshing-ribbon-switch-solution',
            label: 'Switch to Solution',
            group: 'Case',
            actionId: 'switch-to-solution',
            explanationId: 'meshing-switch-solution',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-workflow',
    label: 'Workflow',
    groups: [
      {
        id: 'm-grp-wf-geometry',
        label: 'Geometry',
        commands: [
          {
            id: 'meshing-ribbon-wf-import',
            label: 'Import Geometry',
            group: 'Geometry',
            targetTaskId: 'wm-import-geometry',
            explanationId: 'meshing-import-geometry',
          },
          {
            id: 'meshing-ribbon-wf-describe',
            label: 'Describe Geometry',
            group: 'Geometry',
            targetTaskId: 'wm-describe-geometry',
            explanationId: 'meshing-describe-geometry',
          },
          {
            id: 'meshing-ribbon-wf-share',
            label: 'Apply Share Topology',
            group: 'Geometry',
            targetTaskId: 'wm-share-topology',
            explanationId: 'meshing-share-topology',
          },
        ],
      },
      {
        id: 'm-grp-wf-mesh',
        label: 'Mesh',
        commands: [
          {
            id: 'meshing-ribbon-wf-sizing',
            label: 'Add Local Sizing',
            group: 'Mesh',
            targetTaskId: 'wm-local-sizing',
            explanationId: 'meshing-local-sizing',
          },
          {
            id: 'meshing-ribbon-wf-surface',
            label: 'Surface Mesh',
            group: 'Mesh',
            targetTaskId: 'wm-surface-mesh',
            explanationId: 'meshing-surface-mesh',
          },
          {
            id: 'meshing-ribbon-wf-layers',
            label: 'Add Boundary Layers',
            group: 'Mesh',
            targetTaskId: 'wm-boundary-layers',
            explanationId: 'meshing-boundary-layers',
          },
          {
            id: 'meshing-ribbon-wf-volume',
            label: 'Volume Mesh',
            group: 'Mesh',
            targetTaskId: 'wm-volume-mesh',
            explanationId: 'meshing-volume-mesh',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-geometry',
    label: 'Geometry',
    groups: [
      {
        id: 'm-grp-geom-tools',
        label: 'Geometry',
        commands: [
          {
            id: 'meshing-ribbon-geom-view',
            label: 'CAD Geometry',
            group: 'Geometry',
            viewportTab: 'cad',
            targetTaskId: 'wm-import-geometry',
            explanationId: 'meshing-import-geometry',
          },
          {
            id: 'meshing-ribbon-geom-regions',
            label: 'Update Regions',
            group: 'Geometry',
            targetTaskId: 'wm-update-regions',
            explanationId: 'meshing-update-regions',
          },
          {
            id: 'meshing-ribbon-geom-boundaries',
            label: 'Update Boundaries',
            group: 'Geometry',
            targetTaskId: 'wm-update-boundaries',
            explanationId: 'meshing-update-boundaries',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-surface',
    label: 'Surface Mesh',
    groups: [
      {
        id: 'm-grp-surf-ops',
        label: 'Surface Mesh',
        commands: [
          {
            id: 'meshing-ribbon-surf-sizing',
            label: 'Add Local Sizing',
            group: 'Surface Mesh',
            targetTaskId: 'wm-local-sizing',
            explanationId: 'meshing-local-sizing',
          },
          {
            id: 'meshing-ribbon-surf-gen',
            label: 'Generate the Surface Mesh',
            group: 'Surface Mesh',
            actionId: 'run-surface-mesh',
            explanationId: 'meshing-surface-mesh',
          },
          {
            id: 'meshing-ribbon-surf-view',
            label: 'Surface Mesh',
            group: 'Surface Mesh',
            viewportTab: 'surface-mesh',
            explanationId: 'meshing-surface-mesh',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-volume',
    label: 'Volume Mesh',
    groups: [
      {
        id: 'm-grp-vol-ops',
        label: 'Volume Mesh',
        commands: [
          {
            id: 'meshing-ribbon-vol-bl',
            label: 'Add Boundary Layers',
            group: 'Volume Mesh',
            targetTaskId: 'wm-boundary-layers',
            explanationId: 'meshing-boundary-layers',
          },
          {
            id: 'meshing-ribbon-vol-gen',
            label: 'Generate the Volume Mesh',
            group: 'Volume Mesh',
            actionId: 'run-volume-mesh',
            explanationId: 'meshing-volume-mesh',
          },
          {
            id: 'meshing-ribbon-vol-improve',
            label: 'Improve Volume Mesh',
            group: 'Volume Mesh',
            actionId: 'run-improve-mesh',
            explanationId: 'meshing-improve-mesh',
          },
          {
            id: 'meshing-ribbon-vol-hist',
            label: 'Quality Histogram',
            group: 'Volume Mesh',
            viewportTab: 'quality',
            explanationId: 'meshing-improve-mesh',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-zones',
    label: 'Zones & Tools',
    groups: [
      {
        id: 'm-grp-zones-ops',
        label: 'Zones',
        commands: [
          {
            id: 'meshing-ribbon-zones-bc',
            label: 'Update Boundaries',
            group: 'Zones',
            targetTaskId: 'wm-update-boundaries',
            explanationId: 'meshing-update-boundaries',
          },
          {
            id: 'meshing-ribbon-zones-reg',
            label: 'Update Regions',
            group: 'Zones',
            targetTaskId: 'wm-update-regions',
            explanationId: 'meshing-update-regions',
          },
          {
            id: 'meshing-ribbon-zones-share',
            label: 'Apply Share Topology',
            group: 'Zones',
            targetTaskId: 'wm-share-topology',
            explanationId: 'meshing-share-topology',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-view',
    label: 'View',
    groups: [
      {
        id: 'm-grp-view-ops',
        label: 'View',
        commands: [
          {
            id: 'meshing-ribbon-view-cut',
            label: 'Cut Plane',
            group: 'View',
            actionId: 'toggle-cut-plane',
            viewportTab: 'volume-mesh',
            explanationId: 'meshing-cut-plane',
          },
          {
            id: 'meshing-ribbon-view-cad',
            label: 'CAD Geometry',
            group: 'View',
            viewportTab: 'cad',
            explanationId: 'meshing-import-geometry',
          },
          {
            id: 'meshing-ribbon-view-quality',
            label: 'Quality Histogram',
            group: 'View',
            viewportTab: 'quality',
            explanationId: 'meshing-improve-mesh',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-solution',
    label: 'Solution',
    groups: [
      {
        id: 'm-grp-sol-switch',
        label: 'Solution',
        commands: [
          {
            id: 'meshing-ribbon-sol-switch',
            label: 'Switch to Solution',
            group: 'Solution',
            actionId: 'switch-to-solution',
            explanationId: 'meshing-switch-solution',
          },
        ],
      },
    ],
  },
  {
    id: 'm-tab-help',
    label: 'Help',
    groups: [
      {
        id: 'm-grp-help-links',
        label: 'Help',
        commands: [
          {
            id: 'meshing-ribbon-help-trouble',
            label: 'Troubleshooting',
            group: 'Help',
            actionId: 'open-troubleshoot',
            explanationId: 'meshing-ft-overview',
          },
          {
            id: 'meshing-ribbon-help-calc',
            label: 'Parameter Calculators',
            group: 'Help',
            actionId: 'open-calculators',
            explanationId: 'meshing-boundary-layers',
          },
          {
            id: 'meshing-ribbon-help-formula',
            label: 'Formula Library',
            group: 'Help',
            actionId: 'open-formulas',
            explanationId: 'meshing-boundary-layers',
          },
        ],
      },
    ],
  },
]

export const meshingControlCatalog: MeshingControlMeta[] = [
  ...faultTolerantWorkflowSteps.filter((step) => step.id.startsWith('ft-')).map((step) => ({
    id: step.id,
    label: step.label,
    labelZh: step.labelZh,
    location: 'Fault-Tolerant Meshing → ' + step.label,
    explanationId: step.explanationId,
    taskId: step.id,
  })),
  ...watertightWorkflowSteps.map((step) => ({
    id: step.id,
    label: step.label,
    labelZh: step.labelZh,
    location: `Watertight Workflow → Step ${step.order}`,
    explanationId: step.explanationId,
    taskId: step.id,
  })),
  ...meshingRibbonTabs.flatMap((tab) =>
    tab.groups.flatMap((group) =>
      group.commands.map((cmd) => ({
        id: cmd.id,
        label: cmd.label,
        labelZh: cmd.label,
        location: `Meshing Ribbon → ${tab.label}`,
        explanationId: cmd.explanationId,
        taskId: cmd.targetTaskId,
        ribbonTabId: tab.id,
      })),
    ),
  ),
  {
    id: 'meshing-boi-target-size',
    label: 'Body of Influence (BOI) Target Size',
    labelZh: 'BOI 局部加密目标尺寸',
    location: 'Add Local Sizing → Target Mesh Size',
    explanationId: 'meshing-local-sizing',
    taskId: 'wm-local-sizing',
  },
  {
    id: 'meshing-bl-offset-method',
    label: 'Boundary Layer Offset Method',
    labelZh: '边界层偏置方式',
    location: 'Add Boundary Layers → Offset Method',
    explanationId: 'meshing-boundary-layers',
    taskId: 'wm-boundary-layers',
  },
  {
    id: 'meshing-volume-fill-with',
    label: 'Volume Fill With (Poly-Hexcore / Polyhedra / Tet)',
    labelZh: '体网格填充类型',
    location: 'Generate the Volume Mesh → Fill With',
    explanationId: 'meshing-volume-mesh',
    taskId: 'wm-volume-mesh',
  },
  {
    id: 'meshing-cut-plane-ctrl',
    label: 'Cut Plane',
    labelZh: '体网格剖面视图',
    location: 'Graphics Toolbar → Cut Plane',
    explanationId: 'meshing-cut-plane',
  },
]
