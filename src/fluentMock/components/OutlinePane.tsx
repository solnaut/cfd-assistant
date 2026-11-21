import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import type {
  FluentSimState,
  HighlightedBoundary,
} from '../state/fluentSimState'
import type { FluentMockControl, FluentMockTreeSection } from '../fluentTypes'

interface TreeSubNode {
  id: string
  label: string
  badge?: string
  targetControlId: string
  boundary?: HighlightedBoundary
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
          id: 'sub-model-energy',
          label: label('Energy'),
          badge: simState.energyEnabled ? 'On' : 'Off',
          targetControlId: 'models-energy',
        },
        {
          id: 'sub-model-viscous',
          label: label('Viscous'),
          badge:
            simState.viscousModel === 'laminar'
              ? 'Laminar'
              : simState.viscousModel === 'k-epsilon'
                ? 'k-epsilon'
                : 'SST k-omega',
          targetControlId: 'models-viscous',
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
      ]
    case 'tree-monitors':
      return [
        {
          id: 'sub-monitor-residual',
          label: label('Residual Monitors'),
          badge: simState.monitors.absoluteCriteria,
          targetControlId: 'monitors-residuals',
        },
      ]
    case 'tree-graphics':
      return [
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
  onSubNodeDoubleClick: (targetControlId: string, boundary?: HighlightedBoundary) => void
}) {
  const outlineQuery = filterText.trim().toLowerCase()

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
        {sections.map((section) => {
          const nodes = section.controls.filter((control) =>
            matchesControl(control, outlineQuery),
          )
          if (!nodes.length) return null
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
                  {nodes.map((control) => {
                    const subNodes = getTreeSubNodes(control.id, simState, label)
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
                          >
                            <span>{label(control.label)}</span>
                          </button>
                        </div>

                        {hasChildren && nodeExpanded && (
                          <div className="fluent-tree-children">
                            {subNodes.map((sub) => (
                              <button
                                key={sub.id}
                                type="button"
                                className={
                                  'fluent-tree-subnode' +
                                  (activeControlId === sub.targetControlId
                                    ? ' active'
                                    : '')
                                }
                                onClick={() =>
                                  onSubNodeClick(
                                    sub.targetControlId,
                                    sub.boundary,
                                  )
                                }
                                onDoubleClick={() =>
                                  onSubNodeDoubleClick(
                                    sub.targetControlId,
                                    sub.boundary,
                                  )
                                }
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

        {outlineQuery &&
          !sections.some((section) =>
            section.controls.some((control) =>
              matchesControl(control, outlineQuery),
            ),
          ) && <p className="fluent-tree-empty">{label('No matching nodes')}</p>}
      </div>
    </aside>
  )
}
