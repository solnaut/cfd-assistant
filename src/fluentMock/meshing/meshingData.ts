import type {
  FaultTolerantStep,
  MeshingControlMeta,
  MeshingRibbonTab,
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
    id: 'wm-update-boundaries',
    order: 6,
    label: 'Update Boundaries',
    labelZh: '更新边界条件',
    explanationId: 'meshing-update-boundaries',
  },
  {
    id: 'wm-update-regions',
    order: 7,
    label: 'Update Regions',
    labelZh: '更新体区域',
    explanationId: 'meshing-update-regions',
  },
  {
    id: 'wm-boundary-layers',
    order: 8,
    label: 'Add Boundary Layers',
    labelZh: '添加边界层',
    explanationId: 'meshing-boundary-layers',
    optional: true,
  },
  {
    id: 'wm-volume-mesh',
    order: 9,
    label: 'Generate the Volume Mesh',
    labelZh: '生成体网格',
    explanationId: 'meshing-volume-mesh',
  },
  {
    id: 'wm-improve-mesh',
    order: 10,
    label: 'Improve Volume Mesh',
    labelZh: '改善体网格质量',
    explanationId: 'meshing-improve-mesh',
    optional: true,
  },
]

export const faultTolerantReferenceSteps: FaultTolerantStep[] = [
  {
    id: 'ft-import-cad',
    order: 1,
    label: 'Import CAD & Part Management',
    labelZh: '导入含缝隙/重叠的原始 CAD',
    summary: '适用于未做完美修复的复杂装配体（如整车机舱、散热器、多零件重叠几何）。',
    explanationId: 'meshing-ft-overview',
  },
  {
    id: 'ft-local-sizing',
    order: 2,
    label: 'Create Local Sizing & Material Points',
    labelZh: '定义局部加密与材料点',
    summary: '通过内部 Material Point 指定流体/固体域位置，用于后续包面与泄漏检测。',
    explanationId: 'meshing-ft-overview',
  },
  {
    id: 'ft-surface-mesh',
    order: 3,
    label: 'Generate Surface Mesh (Wrapper)',
    labelZh: '包面重构封闭面网格',
    summary: '利用 Shrink-Wrap 包面跨越微小缝隙、台阶与非流形边，生成水密包络。',
    explanationId: 'meshing-ft-overview',
  },
  {
    id: 'ft-leak-detection',
    order: 4,
    label: 'Leak Detection & Enclosures',
    labelZh: '泄漏路径检查与封堵',
    summary: '在体网格前自动追踪孔洞泄漏路径，快速添加虚拟封堵面。',
    explanationId: 'meshing-ft-overview',
  },
  {
    id: 'ft-boundary-layers',
    order: 5,
    label: 'Add Boundary Layers & Generate Volume Mesh',
    labelZh: '生成边界层与 Poly-Hexcore 体网格',
    summary: '完成区域识别与边界层参数后生成体网格并 Switch to Solution。',
    explanationId: 'meshing-ft-overview',
  },
]

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
