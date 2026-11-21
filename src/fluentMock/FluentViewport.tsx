import { useState } from 'react'
import { FluentIcon } from './FluentIcons'
import type { FluentLabel } from './fluentLanguage'
import { fluentMockLayout } from './fluentLayoutData'
import type { FluentSimState, ViewportTab } from './state/fluentSimState'
import type { FluentMockControl } from './fluentTypes'

const radii = Array.from({ length: 9 }, (_, index) => 69 + index * 9)
const bendAngles = Array.from({ length: 13 }, (_, index) => (index * Math.PI) / 24)
const graphicsTools = fluentMockLayout.graphicsControls.filter(
  (control) => control.controlType === 'graphics-tool',
)

const viewportTabs: Array<{ id: ViewportTab; labelKey: string }> = [
  { id: 'mesh', labelKey: 'Mesh' },
  { id: 'geometry', labelKey: 'Geometry' },
  { id: 'contours', labelKey: 'Contours' },
  { id: 'vectors', labelKey: 'Vectors' },
  { id: 'residuals', labelKey: 'Scaled Residuals' },
  { id: 'xy-plot', labelKey: 'XY Plot' },
]

export function FluentViewport({
  activeControlId,
  label,
  simState,
  onInspect,
  onSelectTab,
  onSelectFilter,
}: {
  activeControlId: string
  label: FluentLabel
  simState: FluentSimState
  onInspect: (control: FluentMockControl) => void
  onSelectTab: (tab: ViewportTab) => void
  onSelectFilter: (value: FluentSimState['selectionFilter']) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState(0)
  const filter = fluentMockLayout.graphicsControls.find(
    (control) => control.id === 'graphics-selection-filter',
  )

  const activeTab = simState.viewportTab
  const isPlotMode = activeTab === 'residuals' || activeTab === 'xy-plot'
  const showMeshEdges =
    activeTab === 'mesh' ||
    (activeTab === 'contours' && simState.meshDisplay.showEdges)

  function activate(tool: FluentMockControl) {
    onInspect(tool)
    switch (tool.id) {
      case 'graphics-zoom':
        setZoom((value) => (value >= 1.5 ? 1 : value + 0.25))
        break
      case 'graphics-rotate':
        setRotation((value) => (value + 15) % 360)
        break
      case 'graphics-pan':
        setPan((value) => (value >= 30 ? -30 : value + 15))
        break
      case 'graphics-fit':
        setZoom(1)
        setRotation(0)
        setPan(0)
        break
      case 'graphics-style':
        onSelectTab(activeTab === 'mesh' ? 'geometry' : 'mesh')
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
          {graphicsTools.map((control) => (
            <button
              aria-label={label(control.label)}
              className={control.id === activeControlId ? 'active' : ''}
              data-fluent-control={control.id}
              key={control.id}
              onClick={() => activate(control)}
              title={label(control.label)}
              type="button"
            >
              <FluentIcon controlId={control.id} />
            </button>
          ))}
        </div>

        <div
          className={
            'fluent-graphics-canvas' + (isPlotMode ? ' plot-mode' : '')
          }
        >
          <span className="fluent-canvas-caption">
            {captionForTab(activeTab, simState, label)}
          </span>

          {activeTab === 'residuals' ? (
            <ResidualsChart simState={simState} />
          ) : activeTab === 'xy-plot' ? (
            <XyProfileChart simState={simState} />
          ) : (
            <ElbowCanvas
              activeTab={activeTab}
              pan={pan}
              rotation={rotation}
              showMeshEdges={showMeshEdges}
              simState={simState}
              zoom={zoom}
            />
          )}

          {activeTab === 'contours' && (
            <div className="fluent-colorbar" aria-hidden="true">
              <div className="fluent-colorbar-bar" />
              <div className="fluent-colorbar-ticks">
                <span>
                  {simState.contourField === 'Static Temperature'
                    ? '350 K'
                    : simState.contourField === 'Static Pressure'
                      ? '120 Pa'
                      : '3.4 m/s'}
                </span>
                <span>
                  {simState.contourField === 'Static Temperature'
                    ? '325 K'
                    : simState.contourField === 'Static Pressure'
                      ? '60 Pa'
                      : '1.7 m/s'}
                </span>
                <span>
                  {simState.contourField === 'Static Temperature'
                    ? '300 K'
                    : simState.contourField === 'Static Pressure'
                      ? '0 Pa'
                      : '0.0 m/s'}
                </span>
              </div>
            </div>
          )}

          {(activeTab === 'contours' || activeTab === 'vectors') &&
            !simState.runCalculation.hasCalculated && (
              <div className="fluent-canvas-hint">
                教学示例预览（运行 Initialize → Calculate 后将刷新收敛演示视图）
              </div>
            )}

          {!isPlotMode && (
            <>
              <div className="fluent-scale-bar" aria-hidden="true">
                <div className="fluent-scale-line" />
                <span>0 — 0.05 — 0.10 m</span>
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

      {filter && (
        <div className="fluent-selection-filter-bar">
          <label htmlFor="fluent-selection-filter">
            {label(filter.label)}
          </label>
          <select
            id="fluent-selection-filter"
            aria-label={label(filter.label)}
            data-fluent-control={filter.id}
            value={simState.selectionFilter}
            onFocus={() => onInspect(filter)}
            onChange={(event) => {
              onInspect(filter)
              onSelectFilter(
                event.target.value as FluentSimState['selectionFilter'],
              )
            }}
          >
            <option value="all">all</option>
            <option value="faces">faces</option>
            <option value="edges">edges</option>
            <option value="cells">cells</option>
          </select>
        </div>
      )}
    </section>
  )
}

function captionForTab(
  tab: ViewportTab,
  simState: FluentSimState,
  label: FluentLabel,
) {
  switch (tab) {
    case 'contours':
      return `${label('Contours')}: ${simState.contourField} (Teaching Demo)`
    case 'vectors':
      return `${label('Vectors')}: ${simState.vectorField} (Teaching Demo)`
    case 'residuals':
      return `${label('Scaled Residuals')} (${simState.runCalculation.hasCalculated ? `${simState.runCalculation.completedIterations} iter` : 'Pending Calculate'})`
    case 'xy-plot':
      return `${label('XY Plot')}: Outlet Velocity Profile`
    case 'geometry':
      return label('Elbow geometry')
    default:
      return `${label('Elbow mesh')} · ${simState.highlightedBoundary ?? 'fluid-domain'}`
  }
}

function ElbowCanvas({
  activeTab,
  pan,
  rotation,
  showMeshEdges,
  simState,
  zoom,
}: {
  activeTab: ViewportTab
  pan: number
  rotation: number
  showMeshEdges: boolean
  simState: FluentSimState
  zoom: number
}) {
  const contourFill =
    activeTab === 'contours'
      ? simState.contourField === 'Static Temperature'
        ? 'url(#elbow-temp-grad)'
        : 'url(#elbow-vel-grad)'
      : '#5b8ea8'

  const highlight = simState.highlightedBoundary

  return (
    <svg className="fluent-elbow" viewBox="0 0 430 285" aria-hidden="true">
      <defs>
        <linearGradient id="elbow-vel-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2c7bb6" />
          <stop offset="45%" stopColor="#80cdc1" />
          <stop offset="72%" stopColor="#fdae61" />
          <stop offset="100%" stopColor="#d7191c" />
        </linearGradient>
        <linearGradient id="elbow-temp-grad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#2c7bb6" />
          <stop offset="55%" stopColor="#ffffbf" />
          <stop offset="100%" stopColor="#d7191c" />
        </linearGradient>
      </defs>
      <g
        style={{
          transformOrigin: 'center',
          transform: `translateX(${pan}px) rotate(${rotation}deg) scale(${zoom})`,
        }}
      >
        <path
          d="M48 147H235A69 69 0 0 0 304 78V40H376V78A141 141 0 0 1 235 219H48Z"
          fill={contourFill}
          stroke={highlight === 'wall' ? '#d7191c' : '#1b3b4e'}
          strokeWidth={highlight === 'wall' ? '3.5' : '1.6'}
        />

        {showMeshEdges && (
          <g fill="none" stroke="#183848" strokeWidth=".6" opacity=".52">
            {radii.slice(1, -1).map((r) => (
              <path
                key={r}
                d={['M48', 78 + r, 'H235A', r, r, '0 0 0', 235 + r, '78V40'].join(
                  ' ',
                )}
              />
            ))}
            {bendAngles.map((angle) => (
              <line
                key={angle}
                x1={235 + 69 * Math.sin(angle)}
                y1={78 + 69 * Math.cos(angle)}
                x2={235 + 141 * Math.sin(angle)}
                y2={78 + 141 * Math.cos(angle)}
              />
            ))}
            <path d="M66 147v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72 M304 55h72m-72 11h72" />
          </g>
        )}

        {activeTab === 'vectors' && (
          <g stroke="#fff8c6" strokeWidth="1.6" fill="none">
            <path d="M74 183h32m-5-4 5 4-5 4" />
            <path d="M138 183h32m-5-4 5 4-5 4" />
            <path d="M204 183h30m-5-4 5 4-5 4" />
            <path d="M268 171l24-18m-7-1 7 1-2 7" />
            <path d="M318 128l18-28m-7 2 7-2 1 7" />
            <path d="M340 84V52m-4 5 4-5 4 5" />
          </g>
        )}

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

function ResidualsChart({ simState }: { simState: FluentSimState }) {
  const ran = simState.runCalculation.hasCalculated
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[55, 90, 125, 160, 195].map((y) => (
          <line key={y} x1="48" y1={y} x2="400" y2={y} />
        ))}
        {[120, 190, 260, 330].map((x) => (
          <line key={x} x1={x} y1="20" x2={x} y2="225" />
        ))}
      </g>
      <text x="12" y="30" fontSize="9" fill="#526071">
        1e+0
      </text>
      <text x="12" y="128" fontSize="9" fill="#526071">
        1e-3
      </text>
      <text x="12" y="224" fontSize="9" fill="#526071">
        1e-6
      </text>
      <text x="175" y="244" fontSize="10" fill="#526071">
        Iterations (Teaching Demo)
      </text>
      {ran ? (
        <g fill="none" strokeWidth="1.8">
          <path d="M48 34Q140 70 220 130T400 202" stroke="#1a232e" />
          <path d="M48 48Q140 96 220 155T400 212" stroke="#d7191c" />
          <path d="M48 56Q140 105 220 162T400 215" stroke="#0078d4" />
          <path d="M48 64Q140 112 220 166T400 208" stroke="#1e824c" />
          {simState.energyEnabled && (
            <path d="M48 76Q130 135 220 186T400 220" stroke="#e67e22" />
          )}
        </g>
      ) : (
        <text x="132" y="126" fontSize="11" fill="#6e7b8c">
          Initialize 并点击 Calculate 后显示模拟残差曲线
        </text>
      )}
    </svg>
  )
}

function XyProfileChart({ simState }: { simState: FluentSimState }) {
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[60, 100, 140, 180].map((y) => (
          <line key={y} x1="48" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <path
        d="M52 216Q224 38 396 216"
        fill="none"
        stroke="#0078d4"
        strokeWidth="2.2"
      />
      <text x="148" y="244" fontSize="10" fill="#526071">
        Radial Position — {simState.contourField} (Teaching Demo)
      </text>
    </svg>
  )
}
