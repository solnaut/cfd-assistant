import { useEffect, useState } from 'react'
import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import {
  formatBatteryBadge,
  formatViscousBadge,
  getControlChecked,
  getControlValue,
  type FluentSimState,
  type HighlightedBoundary,
} from '../state/fluentSimState'
import type { FluentMockControl, FluentMockTreeSection } from '../fluentTypes'
import { extraBoundaryControls } from '../data/boundaryBranches'
import { isDialogControlVisible } from '../state/fluentDialogView'

interface TreeSubNode {
  id: string
  label: string
  badge?: string
  targetControlId: string
  boundary?: HighlightedBoundary
  surfaceName?: string
}

interface ContextMenuState {
  x: number
  y: number
  title: string
  control?: FluentMockControl
  sub?: TreeSubNode
}

function getTreeSubNodes(
  nodeId: string,
  simState: FluentSimState,
  label: FluentLabel,
): TreeSubNode[] {
  switch (nodeId) {
    case 'tree-models':
      return [
        {
          id: 'sub-model-multiphase',
          label: label('Multiphase'),
          badge: simState.multiphaseModel,
          targetControlId: 'models-multiphase',
        },
        {
          id: 'sub-model-energy',
          label: label('Energy'),
          badge: simState.energyEnabled ? 'On' : 'Off',
          targetControlId: 'models-energy',
        },
        {
          id: 'sub-model-viscous',
          label: label('Viscous'),
          badge: formatViscousBadge(simState.viscousModel),
          targetControlId: 'models-viscous',
        },
        {
          id: 'sub-model-radiation',
          label: label('Radiation'),
          badge: simState.radiationModel,
          targetControlId: 'models-radiation',
        },
        {
          id: 'sub-model-species',
          label: label('Species'),
          badge: simState.speciesModel,
          targetControlId: 'models-species',
        },
        {
          id: 'sub-model-dpm',
          label: label('Discrete Phase'),
          badge: simState.dpmEnabled ? 'On' : 'Off',
          targetControlId: 'models-dpm',
        },
        {
          id: 'sub-model-heat-exchanger',
          label: label('Heat Exchanger'),
          badge: simState.heatExchangerModel,
          targetControlId: 'models-heat-exchanger',
        },
        {
          id: 'sub-model-solidification',
          label: label('Solidification & Melting'),
          badge: simState.solidificationEnabled ? 'On' : 'Off',
          targetControlId: 'models-solidification',
        },
        {
          id: 'sub-model-acoustics',
          label: label('Acoustics'),
          badge: getControlValue(simState, 'acoustics-model-select'),
          targetControlId: 'models-acoustics',
        },
        {
          id: 'sub-model-wall-film',
          label: label('Eulerian Wall Film'),
          badge: simState.wallFilmEnabled ? 'On' : 'Off',
          targetControlId: 'models-wall-film',
        },
        {
          id: 'sub-model-battery',
          label: label('Potential / Battery'),
          badge: formatBatteryBadge(simState),
          targetControlId: 'models-battery',
        },
      ]
    case 'tree-materials':
      return [
        ...simState.materials.fluids.map((fluid) => ({
          id: `sub-mat-fluid-${fluid}`,
          label: fluid,
          badge: 'Fluid',
          targetControlId: 'materials-fluid',
        })),
        ...simState.materials.solids.map((solid) => ({
          id: `sub-mat-solid-${solid}`,
          label: solid,
          badge: 'Solid',
          targetControlId: 'materials-solid',
        })),
      ]
    case 'tree-cell-zone-conditions':
      return [
        {
          id: 'sub-zone-fluid',
          label: 'fluid-domain',
          badge: simState.cellZoneMaterial,
          targetControlId: 'cell-zone-fluid',
        },
      ]
    case 'tree-boundary-conditions':
      return [
        {
          id: 'sub-bc-velocity-inlet',
          label: 'velocity-inlet',
          badge: 'velocity-inlet',
          targetControlId: 'bc-velocity-inlet',
          boundary: 'inlet',
        },
        {
          id: 'sub-bc-pressure-inlet',
          label: 'pressure-inlet',
          badge: 'pressure-inlet',
          targetControlId: 'bc-pressure-inlet',
          boundary: 'inlet',
        },
        {
          id: 'sub-bc-mass-flow-inlet',
          label: 'mass-flow-inlet',
          badge: 'mass-flow',
          targetControlId: 'bc-mass-flow-inlet',
          boundary: 'inlet',
        },
        {
          id: 'sub-bc-pressure-outlet',
          label: 'pressure-outlet',
          badge: 'pressure-outlet',
          targetControlId: 'bc-pressure-outlet',
          boundary: 'outlet',
        },
        {
          id: 'sub-bc-wall',
          label: 'wall-heated',
          badge: 'wall',
          targetControlId: 'bc-wall',
          boundary: 'wall',
        },
        {
          id: 'sub-bc-symmetry',
          label: 'symmetry-plane',
          badge: 'symmetry',
          targetControlId: 'bc-symmetry',
          boundary: 'symmetry',
        },
        {
          id: 'sub-bc-interface',
          label: 'interface-zone',
          badge: 'interface',
          targetControlId: 'bc-interface',
        },
        ...(['outflow', 'pressure-far-field', 'axis', 'periodic', 'interior'] as const).map((type) => ({
          id: 'sub-bc-' + type,
          label: type,
          badge: type,
          targetControlId: 'bc-' + type,
          boundary: type === 'outflow' || type === 'pressure-far-field' ? 'outlet' as const
            : type === 'axis' ? 'symmetry' as const : null,
        })),
        ...extraBoundaryControls.filter((control) => isDialogControlVisible(control, {
          id: 'boundary-panel', controls: extraBoundaryControls,
        }, simState)).map((control) => ({
          id: 'sub-' + control.id,
          label: label(control.label),
          targetControlId: control.id,
          boundary: control.group === 'Inlet' ? 'inlet' as const : control.group === 'Outlet' ? 'outlet' as const : null,
        })),
      ]
    case 'tree-motion-definitions':
      return [
        {
          id: 'sub-motion-impeller',
          label: getControlValue(simState, 'motion-def-name', 'impeller-rotation'),
          badge: getControlValue(simState, 'motion-def-type', 'Rotational'),
          targetControlId: 'motion-create-edit',
        },
      ]
    case 'tree-mesh-interfaces':
      return [
        {
          id: 'sub-interface-pair',
          label: getControlValue(simState, 'mi-dlg-name', 'rotor-stator-interface'),
          badge: 'Interface',
          targetControlId: 'interface-create',
        },
      ]
    case 'tree-dynamic-mesh':
      return [
        {
          id: 'sub-dm-setup',
          label: label('Dynamic Mesh Setup'),
          badge: getControlChecked(simState, 'dynamic-mesh-enable') ? 'On' : 'Off',
          targetControlId: 'ribbon-dynamic-mesh',
        },
        {
          id: 'sub-dm-preview',
          label: label('Mesh Motion Preview'),
          targetControlId: 'ribbon-dynamic-mesh',
        },
      ]
    case 'tree-reference-frames':
      return [
        {
          id: 'sub-rf-global',
          label: 'global',
          badge: 'Absolute',
          targetControlId: 'ref-frame-create-edit',
        },
        {
          id: 'sub-rf-mrf',
          label: getControlValue(simState, 'rf-dlg-name', 'mrf-impeller-frame'),
          badge: getControlValue(simState, 'rf-dlg-motion', 'Stationary'),
          targetControlId: 'ref-frame-create-edit',
        },
      ]
    case 'tree-named-expressions':
      return [
        {
          id: 'sub-expr-default',
          label: getControlValue(simState, 'expr-dlg-name', 'inlet_profile'),
          badge: 'Expr',
          targetControlId: 'expr-open-editor',
        },
      ]
    case 'tree-report-definitions':
      return [
        {
          id: 'sub-repdef-force',
          label: label('Force Report'),
          targetControlId: 'report-definition-force',
        },
        {
          id: 'sub-repdef-surface',
          label: label('Surface Report'),
          targetControlId: 'report-definition-surface',
        },
        {
          id: 'sub-repdef-volume',
          label: label('Volume Report'),
          targetControlId: 'report-definition-volume',
        },
        ...Object.values(simState.reportDefinitions).map((item) => ({
          id: `sub-repdef-${item.name}`,
          label: item.name,
          badge: item.type,
          targetControlId:
            item.type === 'Force'
              ? 'report-definition-force'
              : item.type === 'Volume'
                ? 'report-definition-volume'
                : 'report-definition-surface',
        })),
      ]
    case 'tree-monitors':
      return [
        {
          id: 'sub-monitor-residual',
          label: label('Residual Monitors'),
          badge: simState.monitors.absoluteCriteria,
          targetControlId: 'monitors-residuals',
        },
        {
          id: 'sub-monitor-convergence',
          label: label('Convergence Conditions'),
          targetControlId: 'monitors-convergence-conditions',
        },
      ]
    case 'tree-surfaces':
      return [
        {
          id: 'sub-surf-plane',
          label: 'plane-center',
          badge: 'Plane',
          targetControlId: 'surface-plane',
        },
        {
          id: 'sub-surf-iso',
          label: 'iso-x-0.1',
          badge: 'Iso',
          targetControlId: 'surface-iso-surface',
        },
        ...simState.createdSurfaces.map((surface) => ({
          id: 'sub-surface-' + surface.name,
          label: surface.name,
          badge: surface.kind,
          surfaceName: surface.name,
          targetControlId: surface.kind === 'point-surface' ? 'surface-point'
            : surface.kind === 'plane-surface' ? 'surface-plane'
              : 'surface-' + surface.kind,
        })),
      ]
    case 'tree-graphics':
      return [
        {
          id: 'sub-gfx-mesh',
          label: label('Mesh'),
          targetControlId: 'results-mesh',
        },
        {
          id: 'sub-gfx-contours',
          label: label('Contours'),
          targetControlId: 'results-contours',
        },
        {
          id: 'sub-gfx-vectors',
          label: label('Vectors'),
          targetControlId: 'results-vectors',
        },
        {
          id: 'sub-gfx-pathlines',
          label: label('Pathlines'),
          targetControlId: 'results-pathlines',
        },
      ]
    case 'tree-plots':
      return [
        {
          id: 'sub-plot-xy',
          label: label('XY Plot'),
          targetControlId: 'plot-xy',
        },
        {
          id: 'sub-plot-res',
          label: label('Residual Plot'),
          targetControlId: 'plot-residuals',
        },
      ]
    case 'tree-reports':
      return [
        {
          id: 'sub-rep-fluxes',
          label: label('Fluxes'),
          targetControlId: 'results-fluxes',
        },
        {
          id: 'sub-rep-forces',
          label: label('Forces'),
          targetControlId: 'results-forces',
        },
        {
          id: 'sub-rep-surf',
          label: label('Surface Integrals'),
          targetControlId: 'results-surface-integrals',
        },
        {
          id: 'sub-rep-vol',
          label: label('Volume Integrals'),
          targetControlId: 'results-volume-integrals',
        },
      ]
    case 'tree-cell-registers':
      return [
        {
          id: 'sub-reg-default',
          label: getControlValue(simState, 'reg-dlg-name', 'high-grad-region'),
          badge: getControlValue(simState, 'reg-dlg-type', 'Field Value'),
          targetControlId: 'register-create-new',
        },
      ]
    case 'tree-calculation-activities':
      return [
        {
          id: 'sub-calc-autosave',
          label: label('Automatic Saving'),
          badge: simState.autosave.frequency,
          targetControlId: 'calculation-autosave',
        },
        {
          id: 'sub-calc-exec',
          label: label('Execute Commands'),
          targetControlId: 'calculation-execute-commands',
        },
        {
          id: 'sub-calc-sample',
          label: label('Data Sampling'),
          targetControlId: 'calculation-data-sampling',
        },
      ]
    case 'tree-animations':
      return [
        {
          id: 'sub-anim-def',
          label: getControlValue(simState, 'anim-dlg-name', 'velocity-transient-anim'),
          badge: getControlValue(simState, 'anim-dlg-storage', 'HSF File'),
          targetControlId: 'anim-open-definition',
        },
        {
          id: 'sub-anim-play',
          label: label('Animation Playback'),
          targetControlId: 'anim-open-playback',
        },
      ]
    case 'tree-parameters-controls':
      return [
        {
          id: 'sub-param-input',
          label: label('Input Parameters'),
          badge: '1',
          targetControlId: 'ribbon-param-input',
        },
        {
          id: 'sub-param-output',
          label: label('Output Parameters'),
          badge: '1',
          targetControlId: 'ribbon-param-output',
        },
        {
          id: 'sub-param-table',
          label: label('Parameter Table'),
          targetControlId: 'param-open-table',
        },
      ]
    default:
      return []
  }
}

export function OutlinePane({
  sections,
  activePanelId,
  activeControlId,
  filterText,
  expandedSections,
  expandedNodeIds,
  outlineFilterControl,
  simState,
  label,
  matchesControl,
  onFilterTextChange,
  onInspectFilter,
  onExpandAll,
  onCollapseAll,
  onToggleSection,
  onToggleNode,
  onActivateNode,
  onSubNodeClick,
  onSubNodeDoubleClick,
  onDisplayMesh,
}: {
  sections: FluentMockTreeSection[]
  activePanelId: string
  activeControlId: string
  filterText: string
  expandedSections: string[]
  expandedNodeIds: string[]
  outlineFilterControl: FluentMockControl
  simState: FluentSimState
  label: FluentLabel
  matchesControl: (control: FluentMockControl, query: string) => boolean
  onFilterTextChange: (value: string) => void
  onInspectFilter: () => void
  onExpandAll: () => void
  onCollapseAll: () => void
  onToggleSection: (id: string) => void
  onToggleNode: (id: string) => void
  onActivateNode: (control: FluentMockControl) => void
  onSubNodeClick: (targetControlId: string, boundary?: HighlightedBoundary) => void
  onSubNodeDoubleClick: (sub: TreeSubNode) => void
  onDisplayMesh?: (surfaceName?: string) => void
}) {
  const outlineQuery = filterText.trim().toLowerCase()
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [selectedSubNodeId, setSelectedSubNodeId] = useState('')
  const visibleSections = sections.map((section) => ({
    ...section,
    nodes: section.controls.flatMap((control) => {
      const subNodes = getTreeSubNodes(control.id, simState, label)
      if (!outlineQuery || matchesControl(control, outlineQuery)) return [{ control, subNodes }]
      const matching = subNodes.filter((sub) =>
        [sub.label, sub.badge ?? ''].some((text) => text.toLowerCase().includes(outlineQuery)),
      )
      return matching.length ? [{ control, subNodes: matching }] : []
    }),
  })).filter((section) => section.nodes.length > 0)

  useEffect(() => {
    if (!contextMenu) return
    function close() {
      setContextMenu(null)
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setContextMenu(null)
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', handleKey)
    }
  }, [contextMenu])

  return (
    <aside className="fluent-outline-pane" aria-label={label('Outline')}>
      <div className="fluent-pane-title">
        <span>{label('Outline')}</span>
        <div className="fluent-outline-actions">
          <button
            type="button"
            aria-label={label('Expand all')}
            title={label('Expand all')}
            onClick={onExpandAll}
          >
            <FluentIcon name="expand" />
          </button>
          <button
            type="button"
            aria-label={label('Collapse all')}
            title={label('Collapse all')}
            onClick={onCollapseAll}
          >
            <FluentIcon name="collapse" />
          </button>
        </div>
      </div>

      <input
        aria-label={label('Filter Outline')}
        data-fluent-control={outlineFilterControl.id}
        onChange={(event) => onFilterTextChange(event.target.value)}
        onFocus={onInspectFilter}
        placeholder={label('Filter Outline')}
        type="search"
        value={filterText}
      />

      <div className="fluent-tree-scroll">
        {visibleSections.map((section) => {
          const expanded =
            Boolean(outlineQuery) || expandedSections.includes(section.id)

          return (
            <div className="fluent-tree-section" key={section.id}>
              <button
                className="fluent-tree-section-toggle"
                aria-expanded={expanded}
                type="button"
                onClick={() => onToggleSection(section.id)}
              >
                <FluentIcon name="chevron" /> {label(section.label)}
              </button>

              {expanded && (
                <div className="fluent-tree-node-list">
                  {section.nodes.map(({ control, subNodes }) => {
                    const hasChildren = subNodes.length > 0
                    const nodeExpanded =
                      Boolean(outlineQuery) || expandedNodeIds.includes(control.id)

                    return (
                      <div key={control.id}>
                        <div className="fluent-tree-node-row">
                          {hasChildren ? (
                            <button
                              type="button"
                              aria-label={`展开或折叠 ${label(control.label)}`}
                              aria-expanded={nodeExpanded}
                              className={
                                'fluent-tree-caret' +
                                (nodeExpanded ? ' expanded' : '')
                              }
                              onClick={() => onToggleNode(control.id)}
                            >
                              <FluentIcon name="chevron" />
                            </button>
                          ) : (
                            <span
                              className="fluent-tree-caret-spacer"
                              aria-hidden="true"
                            />
                          )}
                          <button
                            className={
                              'fluent-tree-node' +
                              (control.panelId === activePanelId ? ' active' : '')
                            }
                            aria-current={
                              control.panelId === activePanelId
                                ? 'true'
                                : undefined
                            }
                            data-fluent-control={control.id}
                            type="button"
                            onClick={() => onActivateNode(control)}
                            onDoubleClick={() => {
                              if (hasChildren) onToggleNode(control.id)
                            }}
                            onContextMenu={(event) => {
                              event.preventDefault()
                              setContextMenu({
                                x: event.clientX,
                                y: event.clientY,
                                title: label(control.label),
                                control,
                              })
                            }}
                          >
                            <span className="fluent-tree-node-main">
                              <FluentIcon controlId={control.id} />
                              <span>{label(control.label)}</span>
                            </span>
                          </button>
                        </div>

                        {hasChildren && nodeExpanded && (
                          <div className="fluent-tree-children">
                            {subNodes.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                data-fluent-control={sub.id}
                                className={
                                  'fluent-tree-subnode' +
                                  (activeControlId === sub.targetControlId && selectedSubNodeId === sub.id
                                    ? ' active'
                                    : '')
                                }
                                onClick={(event) => {
                                  setSelectedSubNodeId(sub.id)
                                  if ('pointerType' in event.nativeEvent && event.nativeEvent.pointerType === 'touch' &&
                                    window.matchMedia('(pointer: coarse) and (max-width: 1100px)').matches) {
                                    onSubNodeDoubleClick(sub)
                                  } else {
                                    onSubNodeClick(sub.targetControlId, sub.boundary)
                                  }
                                }}
                                onDoubleClick={() => onSubNodeDoubleClick(sub)}
                                onKeyDown={(event) => {
                                  if (event.key !== 'F2') return
                                  event.preventDefault()
                                  onSubNodeDoubleClick(sub)
                                }}
                                onContextMenu={(event) => {
                                  event.preventDefault()
                                  setContextMenu({
                                    x: event.clientX,
                                    y: event.clientY,
                                    title: sub.label,
                                    sub,
                                  })
                                }}
                              >
                                <span>{sub.label}</span>
                                {sub.badge && (
                                  <span className="fluent-tree-badge">
                                    {sub.badge}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {outlineQuery && !visibleSections.length && (
          <p className="fluent-tree-empty">{label('No matching nodes')}</p>
        )}
      </div>

      {contextMenu && (
        <div
          className="fluent-context-menu"
          role="menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="fluent-context-menu-title">{contextMenu.title}</div>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (contextMenu.control) {
                onActivateNode(contextMenu.control)
              } else if (contextMenu.sub) {
                onSubNodeDoubleClick(contextMenu.sub)
              }
              setContextMenu(null)
            }}
          >
            Edit...
          </button>
          {(contextMenu.sub?.boundary || contextMenu.sub?.surfaceName) && <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (contextMenu.sub) {
                onSubNodeClick(
                  contextMenu.sub.targetControlId,
                  contextMenu.sub.boundary,
                )
              }
              onDisplayMesh?.(contextMenu.sub?.surfaceName)
              setContextMenu(null)
            }}
          >
            Display
          </button>}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              if (contextMenu.control) {
                onActivateNode(contextMenu.control)
              } else if (contextMenu.sub) {
                onSubNodeClick(
                  contextMenu.sub.targetControlId,
                  contextMenu.sub.boundary,
                )
              }
              setContextMenu(null)
            }}
          >
            Inspect Guide
          </button>
        </div>
      )}
    </aside>
  )
}
