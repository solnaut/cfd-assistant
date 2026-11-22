import { useState } from 'react'
import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import type { FluentMeshingState } from './meshingState'
import type { MeshingViewportTab } from './meshingTypes'

const viewportTabs: Array<{ id: MeshingViewportTab; labelKey: string }> = [
  { id: 'cad', labelKey: 'CAD Geometry' },
  { id: 'surface-mesh', labelKey: 'Surface Mesh' },
  { id: 'volume-mesh', labelKey: 'Volume Mesh' },
  { id: 'quality', labelKey: 'Quality Histogram' },
]

export function MeshingViewport({
  label,
  state,
  onSelectTab,
  onToggleCutPlane,
  onSetCutPlanePosition,
  onSelectFilter,
  onInspectControlId,
}: {
  label: FluentLabel
  state: FluentMeshingState
  onSelectTab: (tab: MeshingViewportTab) => void
  onToggleCutPlane: () => void
  onSetCutPlanePosition: (position: number) => void
  onSelectFilter: (filter: FluentMeshingState['selectionFilter']) => void
  onInspectControlId: (controlId: string) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState(0)
  const [activeTool, setActiveTool] = useState('select')
  const [cutAxis, setCutAxis] = useState<'X' | 'Y' | 'Z'>('X')

  const activeTab = state.viewportTab
  const isHistogram = activeTab === 'quality'

  function handleToolbar(toolId: string) {
    setActiveTool(toolId)
    switch (toolId) {
      case 'zoom':
        setZoom((v) => (v >= 1.5 ? 1 : v + 0.25))
        break
      case 'rotate':
        setRotation((v) => (v + 15) % 360)
        break
      case 'pan':
        setPan((v) => (v >= 30 ? -30 : v + 15))
        break
      case 'cut-plane':
        onToggleCutPlane()
        onInspectControlId('meshing-cut-plane-ctrl')
        break
      case 'fit':
        setZoom(1)
        setRotation(0)
        setPan(0)
        break
      default:
        break
    }
  }

  return (
    <section className="fluent-graphics-pane" aria-label={label('Graphics')}>
      <div className="fluent-pane-title fluent-viewport-tabs">
        {viewportTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => onSelectTab(tab.id)}
          >
            {label(tab.labelKey)}
          </button>
        ))}
      </div>

      <div className="fluent-graphics-layout">
        <div className="fluent-graphics-toolbar">
          {(
            [
              ['select', 'pointer', 'Select'],
              ['rotate', 'rotate', 'Rotate'],
              ['pan', 'pan', 'Pan'],
              ['zoom', 'zoom', 'Zoom'],
              ['cut-plane', 'cutPlane', 'Cut Plane'],
              ['fit', 'fit', 'Fit View'],
            ] as const
          ).map(([id, iconName, title]) => (
            <button
              key={id}
              type="button"
              aria-label={label(title)}
              title={label(title)}
              className={
                (id === 'cut-plane' && state.cutPlaneEnabled) || activeTool === id
                  ? 'active'
                  : ''
              }
              onClick={() => handleToolbar(id)}
            >
              <FluentIcon name={iconName} />
            </button>
          ))}
        </div>

        <div
          className={
            'fluent-graphics-canvas' + (isHistogram ? ' plot-mode' : '')
          }
        >
          <span className="fluent-canvas-caption">
            {captionForMeshingTab(activeTab, state, label)}
          </span>

          {activeTab === 'quality' ? (
            <QualityHistogramCanvas state={state} />
          ) : (
            <MeshingGeometryCanvas
              activeTab={activeTab}
              cutAxis={cutAxis}
              pan={pan}
              rotation={rotation}
              state={state}
              zoom={zoom}
            />
          )}

          {activeTab === 'volume-mesh' && (
            <div className="fluent-cutplane-bar">
              <label>
                <input
                  type="checkbox"
                  checked={state.cutPlaneEnabled}
                  onChange={onToggleCutPlane}
                />
                <span>{label('Cut Plane')}</span>
              </label>
              <select
                aria-label="Cut Plane Axis"
                value={cutAxis}
                disabled={!state.cutPlaneEnabled}
                onChange={(event) => setCutAxis(event.target.value as 'X' | 'Y' | 'Z')}
              >
                <option value="X">X</option>
                <option value="Y">Y</option>
                <option value="Z">Z</option>
              </select>
              <input
                type="range"
                aria-label="Cut Plane Position"
                min={10}
                max={90}
                value={state.cutPlanePosition}
                disabled={!state.cutPlaneEnabled}
                onChange={(event) =>
                  onSetCutPlanePosition(Number.parseInt(event.target.value, 10))
                }
              />
              <span>{cutAxis}: {state.cutPlanePosition}%</span>
            </div>
          )}

          {!isHistogram && (
            <>
              <div className="fluent-scale-bar" aria-hidden="true">
                <div className="fluent-scale-line" />
                <span>0 — 50 — 100 mm</span>
              </div>
              <svg
                className="fluent-view-axes"
                viewBox="0 0 52 46"
                aria-hidden="true"
              >
                <path d="M17 32h26" stroke="#c9302c" strokeWidth="1.8" />
                <path d="M17 32V8" stroke="#1e824c" strokeWidth="1.8" />
                <path d="m17 32-9 8" stroke="#1b6dc1" strokeWidth="1.8" />
                <text x="43" y="35" fill="#c9302c">
                  X
                </text>
                <text x="14" y="8" fill="#1e824c">
                  Y
                </text>
                <text x="1" y="43" fill="#1b6dc1">
                  Z
                </text>
              </svg>
            </>
          )}
        </div>
      </div>

      <div className="fluent-selection-filter-bar">
        <label htmlFor="meshing-selection-filter">
          {label('Selection Filter')}
        </label>
        <select
          id="meshing-selection-filter"
          value={state.selectionFilter}
          onChange={(event) =>
            onSelectFilter(
              event.target.value as FluentMeshingState['selectionFilter'],
            )
          }
        >
          <option value="all">all</option>
          <option value="faces">faces</option>
          <option value="zones">zones</option>
          <option value="regions">regions</option>
        </select>
        <small className="fluent-mesh-badge-inline">
          Fill: {state.volumeMesh.fillWith} · Layers:{' '}
          {state.boundaryLayers.enabled ? state.boundaryLayers.numberOfLayers : 0}
        </small>
      </div>
    </section>
  )
}

function captionForMeshingTab(
  tab: MeshingViewportTab,
  state: FluentMeshingState,
  label: FluentLabel,
) {
  switch (tab) {
    case 'cad':
      return `${label('CAD Geometry')}: ${state.importGeometry.fileName} (${state.importGeometry.lengthUnit})`
    case 'surface-mesh':
      return `${label('Surface Mesh')}: ${state.surfaceMesh.generated ? `${state.surfaceMesh.faceCount.toLocaleString()} faces` : 'Preview'} · BOI=${state.localSizings.length}`
    case 'volume-mesh':
      return `${label('Volume Mesh')} (${state.volumeMesh.fillWith}): ${state.volumeMesh.generated ? `${state.volumeMesh.cellCount.toLocaleString()} cells` : 'Preview'}`
    case 'quality':
      return `${label('Quality Histogram')}: Min Ortho = ${state.volumeMesh.minOrthogonalQuality}`
  }
}

function MeshingGeometryCanvas({
  activeTab,
  cutAxis,
  pan,
  rotation,
  state,
  zoom,
}: {
  activeTab: MeshingViewportTab
  cutAxis: 'X' | 'Y' | 'Z'
  pan: number
  rotation: number
  state: FluentMeshingState
  zoom: number
}) {
  const highlight = state.highlightedZone
  const showSurfaceTri = activeTab === 'surface-mesh'
  const showVolume = activeTab === 'volume-mesh'
  const hasBoi = state.localSizings.length > 0
  const fillMode = state.volumeMesh.fillWith
  const cutClipX = 48 + (state.cutPlanePosition / 100) * 320
  const cutClipY = 40 + (state.cutPlanePosition / 100) * 180

  return (
    <svg className="fluent-elbow" viewBox="0 0 430 285" aria-hidden="true">
      <defs>
        <clipPath id="meshing-elbow-clip">
          <path d="M48 147H235A69 69 0 0 0 304 78V40H376V78A141 141 0 0 1 235 219H48Z" />
        </clipPath>
        <clipPath id="meshing-prism-core-clip">
          <path d="M52 157H235A79 79 0 0 0 314 78V44H366V78A131 131 0 0 1 235 209H52Z" />
        </clipPath>
      </defs>

      <g
        style={{
          transformOrigin: 'center',
          transform: `translateX(${pan}px) rotate(${rotation}deg) scale(${zoom})`,
        }}
      >
        {/* Solid wall shell when Fluid + Solid described */}
        {state.describeGeometry.geometryType !== 'fluid-only' && (
          <path
            d="M44 140H235A62 62 0 0 0 297 78V40H383V78A148 148 0 0 1 235 226H44Z"
            fill="#b68d68"
            opacity="0.48"
            stroke="#734c29"
            strokeWidth="1.2"
          />
        )}

        {/* Main elbow body */}
        <path
          d="M48 147H235A69 69 0 0 0 304 78V40H376V78A141 141 0 0 1 235 219H48Z"
          fill={showVolume && state.cutPlaneEnabled ? '#d8eaf5' : '#6599b4'}
          stroke={highlight === 'wall' ? '#d7191c' : '#1b3b4e'}
          strokeWidth={highlight === 'wall' ? '3.5' : '1.6'}
        />

        {/* Surface Mesh Triangles */}
        {showSurfaceTri && (
          <g
            clipPath="url(#meshing-elbow-clip)"
            fill="none"
            stroke="#163547"
            strokeWidth="0.6"
            opacity="0.62"
          >
            {[60, 84, 108, 132, 156, 180, 204, 228, 252, 276, 300, 324, 348].map(
              (x) => (
                <path
                  key={`sx-${x}`}
                  d={`M${x} 40L${x + 18} 225M${x + 18} 40L${x} 225`}
                />
              ),
            )}
            {[155, 171, 187, 203].map((y) => (
              <line key={`sy-${y}`} x1="48" y1={y} x2="376" y2={y} />
            ))}
            {[54, 72, 90, 108, 126].map((y) => (
              <line key={`sy2-${y}`} x1="250" y1={y} x2="376" y2={y} />
            ))}
          </g>
        )}

        {/* Volume Mesh Cut-Plane Patterns */}
        {showVolume && state.cutPlaneEnabled && (
          <g clipPath="url(#meshing-elbow-clip)">
            {/* Boundary Prism Layers along walls */}
            {state.boundaryLayers.enabled && (
              <g fill="none" stroke="#0078d4" strokeWidth="0.7" opacity="0.82">
                <path d="M48 151H235A73 73 0 0 0 308 78V40M48 155H235A77 77 0 0 0 312 78V40" />
                <path d="M48 215H235A137 137 0 0 0 372 78V40M48 211H235A133 133 0 0 0 368 78V40" />
              </g>
            )}

            {/* Core cell pattern differentiated by fillWith */}
            <g clipPath="url(#meshing-prism-core-clip)">
              {(fillMode === 'poly-hexcore' || fillMode === 'hexcore') && (
                <g stroke="#244861" strokeWidth="0.7" opacity="0.65">
                  {Array.from({ length: 20 }, (_, i) => 56 + i * 16).map((x) => (
                    <line key={`hx-${x}`} x1={x} y1="44" x2={x} y2="212" />
                  ))}
                  {Array.from({ length: 11 }, (_, i) => 50 + i * 16).map((y) => (
                    <line key={`hy-${y}`} x1="48" y1={y} x2="372" y2={y} />
                  ))}
                  {fillMode === 'poly-hexcore' && (
                    <path
                      d="M52 162h182a84 84 0 0 0 84-84V44"
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="0.9"
                      strokeDasharray="4 3"
                    />
                  )}
                </g>
              )}

              {fillMode === 'polyhedra' && (
                <g fill="none" stroke="#244861" strokeWidth="0.75" opacity="0.7">
                  {Array.from({ length: 12 }, (_, r) => 54 + r * 14).map((y, rIdx) =>
                    Array.from({ length: 16 }, (_, c) => 56 + c * 20 + (rIdx % 2) * 10).map(
                      (x) => (
                        <polygon
                          key={`pg-${rIdx}-${x}`}
                          points={`${x},${y - 7} ${x + 8},${y - 3} ${x + 8},${y + 4} ${x},${y + 8} ${x - 8},${y + 4} ${x - 8},${y - 3}`}
                        />
                      ),
                    ),
                  )}
                </g>
              )}

              {fillMode === 'tetrahedral' && (
                <g fill="none" stroke="#244861" strokeWidth="0.6" opacity="0.68">
                  {Array.from({ length: 22 }, (_, i) => 48 + i * 15).map((x) => (
                    <path
                      key={`tet-${x}`}
                      d={`M${x} 44L${x + 15} 214M${x + 15} 44L${x} 214M${x} 44v170`}
                    />
                  ))}
                  {Array.from({ length: 12 }, (_, i) => 48 + i * 14).map((y) => (
                    <line key={`teth-${y}`} x1="48" y1={y} x2="372" y2={y} />
                  ))}
                </g>
              )}
            </g>

            {/* Cut Plane marker line */}
            {cutAxis === 'Y' ? (
              <line
                x1="40"
                y1={cutClipY}
                x2="386"
                y2={cutClipY}
                stroke="#c9302c"
                strokeWidth="1.4"
                strokeDasharray="4 3"
              />
            ) : cutAxis === 'Z' ? (
              <rect
                x={cutClipX - 24}
                y="40"
                width="48"
                height="182"
                fill="rgba(201, 48, 44, 0.14)"
                stroke="#c9302c"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
            ) : (
              <line
                x1={cutClipX}
                y1="30"
                x2={cutClipX}
                y2="232"
                stroke="#c9302c"
                strokeWidth="1.4"
                strokeDasharray="4 3"
              />
            )}
          </g>
        )}

        {/* BOI Local Sizing Box */}
        {hasBoi && (activeTab === 'surface-mesh' || activeTab === 'volume-mesh') && (
          <g>
            <rect
              x="210"
              y="92"
              width="148"
              height="118"
              rx="3"
              fill="rgba(245, 158, 11, 0.14)"
              stroke="#d97706"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="216" y="106" fontSize="9.5" fontWeight="700" fill="#92400e">
              BOI ({state.localSizings[0]?.targetSize})
            </text>
          </g>
        )}

        {/* Boundary edge highlights */}
        <path
          d="M48 147v72"
          stroke={highlight === 'inlet' ? '#0056d6' : '#f08c2b'}
          strokeWidth={highlight === 'inlet' ? '5' : '3'}
        />
        <path
          d="M304 40h72"
          stroke={highlight === 'outlet' ? '#d7191c' : '#2a9d8f'}
          strokeWidth={highlight === 'outlet' ? '5' : '3'}
        />
        {highlight === 'symmetry' && (
          <path
            d="M48 183H235A105 105 0 0 0 340 78V40"
            fill="none"
            stroke="#7b2cbf"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
        )}
      </g>
    </svg>
  )
}

function QualityHistogramCanvas({ state }: { state: FluentMeshingState }) {
  const minOrtho = state.volumeMesh.minOrthogonalQuality
  const improved = state.improveMesh.improved
  const bars = improved
    ? [
        { label: '0.1–0.2', h: 6, color: '#d97706' },
        { label: '0.2–0.4', h: 24, color: '#0284c7' },
        { label: '0.4–0.6', h: 68, color: '#0078d4' },
        { label: '0.6–0.8', h: 118, color: '#0d9488' },
        { label: '0.8–1.0', h: 152, color: '#15803d' },
      ]
    : [
        { label: '0.1–0.2', h: 22, color: '#dc2626' },
        { label: '0.2–0.4', h: 48, color: '#d97706' },
        { label: '0.4–0.6', h: 82, color: '#0078d4' },
        { label: '0.6–0.8', h: 114, color: '#0d9488' },
        { label: '0.8–1.0', h: 126, color: '#15803d' },
      ]

  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="44" y="22" width="356" height="196" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[62, 102, 142, 182].map((y) => (
          <line key={y} x1="44" y1={y} x2="400" y2={y} />
        ))}
      </g>
      {bars.map((bar, idx) => {
        const x = 66 + idx * 66
        const y = 218 - bar.h
        return (
          <g key={bar.label}>
            <rect x={x} y={y} width="42" height={bar.h} fill={bar.color} rx="2" />
            <text x={x + 4} y="233" fontSize="9.5" fill="#475569">
              {bar.label}
            </text>
          </g>
        )
      })}
      <text x="54" y="39" fontSize="10" fontWeight="700" fill="#1e293b">
        Orthogonal Quality Histogram (Teaching Demo · Min = {minOrtho})
      </text>
    </svg>
  )
}
