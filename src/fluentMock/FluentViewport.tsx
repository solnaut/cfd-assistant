import { useState } from 'react'
import { FluentIcon } from './FluentIcons'
import type { FluentLabel } from './fluentLanguage'
import { fluentMockLayout } from './fluentLayoutData'
import {
  getControlChecked,
  getControlValue,
  resultSettings,
  type CameraPreset,
  type FluentSimState,
  type ViewportTab,
} from './state/fluentSimState'
import type { FluentMockControl } from './fluentTypes'

const radii = Array.from({ length: 9 }, (_, index) => 69 + index * 9)
const bendAngles = Array.from({ length: 13 }, (_, index) => (index * Math.PI) / 24)
const elbowSection = 'M48 147H235A69 69 0 0 0 304 78V40H376V78A141 141 0 0 1 235 219H48Z'
const contourPalettes: Record<string, [number, string][]> = {
  velocity: [[0, '#2c7bb6'], [45, '#80cdc1'], [72, '#fdae61'], [100, '#d7191c']],
  temperature: [[0, '#2c7bb6'], [55, '#ffffbf'], [100, '#d7191c']],
  pressure: [[0, '#2c7bb6'], [50, '#abd9e9'], [100, '#d7191c']],
  Grayscale: [[0, '#1f2937'], [55, '#9ca3af'], [100, '#f8fafc']],
  Viridis: [[0, '#440154'], [45, '#21918c'], [100, '#fde725']],
  'Blue to Red': [[0, '#1953a3'], [50, '#faf5eb'], [100, '#af3029']],
  Turbo: [[0, '#302868'], [25, '#29a5ef'], [50, '#a4fc3c'], [75, '#fa7d20'], [100, '#a71001']],
}
const vectorPaths: Record<string, string> = {
  Arrow: 'M0 0h32m-5-4 5 4-5 4',
  Harpoon: 'M0 0h32l-7-5',
  Headless: 'M0 0h32',
  Cone: 'M5-3 32 0 5 3Z',
  'Filled-Arrow': 'M0-1h23v-4l9 5-9 5v-4H0Z',
  '3D Arrow': 'M0 1h24m-1-6 9 5-9 4V-5m0 3 9 2',
  '3D Arrowhead': 'M23-5l9 5-9 4V-5m0 3 9 2',
}
const graphicsTools = fluentMockLayout.graphicsControls.filter(
  (control) => control.controlType === 'graphics-tool',
)

const viewportTabs: Array<{ id: ViewportTab; labelKey: string }> = [
  { id: 'mesh', labelKey: 'Mesh' },
  { id: 'geometry', labelKey: 'Geometry' },
  { id: 'contours', labelKey: 'Contours' },
  { id: 'vectors', labelKey: 'Vectors' },
  { id: 'pathlines', labelKey: 'Pathlines' },
  { id: 'particle-tracks', labelKey: 'Particle Tracks' },
  { id: 'scene', labelKey: 'Scene' },
  { id: 'residuals', labelKey: 'Scaled Residuals' },
  { id: 'xy-plot', labelKey: 'XY Plot' },
  { id: 'histogram', labelKey: 'Histogram' },
  { id: 'fft', labelKey: 'FFT' },
  { id: 'report-plot', labelKey: 'Report Plot' },
]

function colormapClass(colormap: string) {
  switch (colormap) {
    case 'Blue to Red':
      return 'colormap-blue-red'
    case 'Grayscale':
      return 'colormap-grayscale'
    case 'Viridis':
      return 'colormap-viridis'
    case 'Turbo':
      return 'colormap-turbo'
    default:
      return ''
  }
}

export function FluentViewport({
  activeControlId,
  label,
  simState,
  onInspect,
  onSelectTab,
  onSelectFilter,
  onSelectCameraPreset,
}: {
  activeControlId: string
  label: FluentLabel
  simState: FluentSimState
  onInspect: (control: FluentMockControl) => void
  onSelectTab: (tab: ViewportTab) => void
  onSelectFilter: (value: FluentSimState['selectionFilter']) => void
  onSelectCameraPreset?: (preset: CameraPreset) => void
}) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState(0)
  const filter = fluentMockLayout.graphicsControls.find(
    (control) => control.id === 'graphics-selection-filter',
  )

  const activeTab = simState.viewportTab
  const is3D = simState.dimension === '3d'
  const contours = simState.displayedResults.contours ?? resultSettings('contours', simState)
  const vectors = simState.displayedResults.vectors ?? resultSettings('vectors', simState)
  const isPlotMode =
    activeTab === 'residuals' ||
    activeTab === 'xy-plot' ||
    activeTab === 'report-plot' ||
    activeTab === 'histogram' ||
    activeTab === 'fft'
  const reportKey = simState.displayedReportPlot
  const report = reportKey ? simState.reportOutputs[reportKey] : undefined
  const reportSamples = reportKey ? simState.reportSamples[reportKey] ?? 0 : 0
  const sceneShowMesh = getControlChecked(simState, 'scene-show-mesh', true)
  const sceneShowContours = getControlChecked(simState, 'scene-show-contours', true)
  const showMeshEdges =
    (activeTab === 'mesh' && simState.meshDisplay.showEdges) ||
    (activeTab === 'contours' && contours.drawMesh) ||
    (activeTab === 'vectors' && vectors.drawMesh) ||
    (activeTab === 'scene' && sceneShowMesh)
  const showColorbar =
    simState.displayOptions.showLegend &&
    (activeTab === 'contours' || (activeTab === 'scene' && sceneShowContours))

  const presetRotationOffset =
    simState.cameraPreset === 'front'
      ? 0
      : simState.cameraPreset === 'back'
        ? 24
        : simState.cameraPreset === 'top'
          ? -12
          : simState.cameraPreset === 'bottom'
            ? -24
            : simState.cameraPreset === 'left'
              ? 12
              : simState.cameraPreset === 'right'
                ? -16
                : 0

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

  const maxTick = contours.range
    ? contours.range[1]
    : contours.field === 'Static Temperature'
      ? '350 K'
      : contours.field === 'Static Pressure'
        ? '120 Pa'
        : '3.4 m/s'
  const minTick = contours.range
    ? contours.range[0]
    : contours.field === 'Static Temperature'
      ? '300 K'
      : contours.field === 'Static Pressure'
        ? '0 Pa'
        : '0.0 m/s'
  const midTick = contours.range
    ? ((Number(minTick) / 2) + (Number(maxTick) / 2)).toFixed(2)
    : contours.field === 'Static Temperature'
      ? '325 K'
      : contours.field === 'Static Pressure'
        ? '60 Pa'
        : '1.7 m/s'

  return (
    <section className="fluent-graphics-pane" aria-label={label('Graphics')}>
      <div className="fluent-pane-title fluent-viewport-tabs">
        {viewportTabs
          .filter(
            (tab) =>
              (tab.id !== 'particle-tracks' || simState.dpmEnabled) &&
              (tab.id !== 'report-plot' || report),
          )
          .map((tab) => (
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
            {activeTab === 'report-plot' && report
              ? `${report.destination} · ${report.definition} · ${reportSamples} samples (Teaching Demo)`
              : captionForTab(activeTab, simState, label)}
          </span>

          {activeTab === 'residuals' ? (
            <ResidualsChart simState={simState} />
          ) : activeTab === 'xy-plot' ? (
            <XyProfileChart simState={simState} />
          ) : activeTab === 'histogram' ? (
            <HistogramChart simState={simState} />
          ) : activeTab === 'fft' ? (
            <FftChart simState={simState} />
          ) : activeTab === 'report-plot' ? (
            <ReportSampleChart samples={reportSamples} />
          ) : (
            <ElbowCanvas
              activeTab={activeTab}
              description={`${simState.dimension.toUpperCase()} ${label('Elbow geometry')} · ${label('Teaching preview')}`}
              pan={pan}
              rotation={rotation + presetRotationOffset}
              showMeshEdges={showMeshEdges}
              simState={simState}
              zoom={zoom}
            />
          )}

          {showColorbar && (
            <div className="fluent-colorbar" aria-hidden="true">
              <div
                className={
                  'fluent-colorbar-bar ' +
                  colormapClass(simState.displayOptions.colormap)
                }
              />
              <div className="fluent-colorbar-ticks">
                <span>{maxTick}</span>
                <span>{midTick}</span>
                <span>{minTick}</span>
              </div>
            </div>
          )}

          {(activeTab === 'contours' ||
            activeTab === 'vectors' ||
            activeTab === 'pathlines' ||
            activeTab === 'particle-tracks' ||
            activeTab === 'scene') &&
            !simState.runCalculation.hasCalculated && (
              <div className="fluent-canvas-hint">
                教学示例预览。执行 Initialize 和 Calculate 后可查看本次演示的残差曲线。
              </div>
            )}

          {!isPlotMode && (
            <>
              <div className="fluent-scale-bar" aria-hidden="true">
                <div className="fluent-scale-line" />
                <span>0 — 0.05 — 0.10 m</span>
              </div>
              <div className="fluent-triad-controls">
                {onSelectCameraPreset && (
                  <div className="fluent-triad-presets" role="group" aria-label="视图预设">
                    {(
                      [
                        ['isometric', 'Iso'],
                        ['front', 'Front'],
                        ['top', 'Top'],
                        ['left', 'Left'],
                      ] as const
                    ).map(([preset, text]) => (
                      <button
                        key={preset}
                        type="button"
                        className={simState.cameraPreset === preset ? 'active' : ''}
                        onClick={() => onSelectCameraPreset(preset)}
                      >
                        {text}
                      </button>
                    ))}
                  </div>
                )}
                <svg
                  className="fluent-view-axes"
                  viewBox="0 0 52 46"
                  aria-hidden="true"
                >
                  <path d="M17 32h26" stroke="#c9302c" strokeWidth="1.8" />
                  <path d="M17 32V8" stroke="#1e824c" strokeWidth="1.8" />
                  <text x="43" y="35" fill="#c9302c">
                    X
                  </text>
                  <text x="14" y="8" fill="#1e824c">
                    Y
                  </text>
                  {is3D && (
                    <>
                      <path d="m17 32-9 8" stroke="#1b6dc1" strokeWidth="1.8" />
                      <text x="1" y="43" fill="#1b6dc1">
                        Z
                      </text>
                    </>
                  )}
                </svg>
              </div>
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
          <small className="fluent-mesh-badge-inline">
            View: {simState.cameraPreset} · {simState.meshInfo.meshType}
          </small>
        </div>
      )}
    </section>
  )
}

function ReportSampleChart({ samples }: { samples: number }) {
  const markers = Math.min(samples, 12)
  const points = Array.from({ length: markers }, (_, index) => ({
    x: 60 + (330 * index) / Math.max(1, markers - 1),
    y: 95 + 104 / (index + 1),
  }))
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      {[60, 100, 140, 180].map((y) => (
        <path key={y} d={`M48 ${y}H400`} stroke="#e6ebf1" />
      ))}
      {points.length ? (
        <>
          <polyline
            points={points.map(({ x, y }) => x + ',' + y).join(' ')}
            fill="none"
            stroke="#0078d4"
            strokeWidth="2"
          />
          {points.map(({ x, y }) => (
            <circle key={x} cx={x} cy={y} r="3" fill="#0078d4" />
          ))}
        </>
      ) : (
        <text x="110" y="130" fontSize="12" fill="#526071">
          Calculate to collect demo samples
        </text>
      )}
      <text x="120" y="244" fontSize="11" fill="#526071">
        Sample index · illustrative values
      </text>
    </svg>
  )
}

function captionForTab(
  tab: ViewportTab,
  simState: FluentSimState,
  label: FluentLabel,
) {
  switch (tab) {
    case 'contours':
    case 'vectors':
    case 'pathlines':
    case 'particle-tracks':
    case 'scene':
    case 'xy-plot':
    case 'histogram':
    case 'fft': {
      const result = simState.displayedResults[tab] ?? resultSettings(tab, simState)
      const title = viewportTabs.find((item) => item.id === tab)?.labelKey ?? tab
      const details = [tab === 'pathlines' ? undefined : result.field, result.source, result.option]
        .filter((value): value is string => Boolean(value))
        .map(label)
        .join(' · ')
      return `${label(title)}: ${details} (Teaching Demo)`
    }
    case 'residuals':
      return `${label('Scaled Residuals')} (${simState.runCalculation.hasCalculated ? `${simState.runCalculation.completedIterations} iter` : 'Pending Calculate'})`
    case 'geometry':
      return label('Elbow geometry')
    default:
      return `${label('Elbow mesh')} · ${simState.highlightedBoundary ?? 'fluid-domain'}`
  }
}

function ElbowCanvas({
  activeTab,
  description,
  pan,
  rotation,
  showMeshEdges,
  simState,
  zoom,
}: {
  activeTab: ViewportTab
  description: string
  pan: number
  rotation: number
  showMeshEdges: boolean
  simState: FluentSimState
  zoom: number
}) {
  const contours = simState.displayedResults.contours ?? resultSettings('contours', simState)
  const vectors = simState.displayedResults.vectors ?? resultSettings('vectors', simState)
  const pathlines = simState.displayedResults.pathlines ?? resultSettings('pathlines', simState)
  const particles =
    simState.displayedResults['particle-tracks'] ??
    resultSettings('particle-tracks', simState)
  const sceneContours = activeTab === 'scene' && getControlChecked(simState, 'scene-show-contours', true)
  const sceneVectors = activeTab === 'scene' && getControlChecked(simState, 'scene-show-vectors', true)
  const scenePathlines = activeTab === 'scene' && getControlChecked(simState, 'scene-show-pathlines', false)
  const meshOpacity = activeTab === 'scene'
    ? Math.max(0.1, Math.min(1, Number(getControlValue(simState, 'scene-mesh-transparency', '0.35')) || 0.35))
    : 0.52

  const cmap = simState.displayOptions.colormap
  const fieldPalette = contours.field === 'Static Temperature' ? 'temperature' : contours.field === 'Static Pressure' ? 'pressure' : 'velocity'
  const palette = cmap === 'Rainbow' ? fieldPalette : cmap
  const colors = contourPalettes[palette] ?? contourPalettes.velocity
  const stops = contours.banded ? colors.flatMap(([, color], index) => [
    { color, offset: index * 100 / colors.length }, { color, offset: (index + 1) * 100 / colors.length },
  ]) : colors.map(([offset, color]) => ({ color, offset }))
  const vectorStyle = vectors.style ?? 'Arrow'
  const arrowColor = vectors.colorBy === 'Static Pressure' ? '#e6b5ff' : '#fff8c6'
  const showContourFill =
    (activeTab === 'contours' && contours.filled) || sceneContours
  const contourFill = showContourFill ? 'url(#elbow-contour-gradient)' : '#5b8ea8'

  const highlight = simState.highlightedBoundary
  const showDepth =
    simState.dimension === '3d' &&
    (activeTab === 'geometry' || activeTab === 'mesh' || activeTab === 'scene')

  return (
    <svg className="fluent-elbow" viewBox="0 0 430 285" role="img" aria-label={description}>
      <defs>
        <linearGradient id="elbow-contour-gradient" x1={palette === 'pressure' ? 1 : 0} y1={palette === 'temperature' ? 1 : 0}
          x2={palette === 'pressure' || palette === 'temperature' ? 0 : 1} y2={palette === 'pressure' ? 1 : 0}>
          {stops.map(({ offset, color }, index) => <stop key={index} offset={`${offset}%`} stopColor={color} />)}
        </linearGradient>
      </defs>
      <g
        style={{
          transformOrigin: 'center',
          transform: `translateX(${pan}px) rotate(${rotation}deg) scale(${zoom})`,
        }}
      >
        {showDepth && (
          <g stroke="#1b3b4e" strokeWidth="1.2" strokeLinejoin="round">
            <path d={elbowSection} transform="translate(24 -16)" fill="#3e6277" />
            <path
              d="M48 147l24-16H259A69 69 0 0 0 328 62V24l-24 16v38A69 69 0 0 1 235 147Z"
              fill="#84a9b9"
            />
            <path d="M304 40l24-16h72l-24 16Z" fill="#9ebdcc" />
          </g>
        )}
        <path
          d={elbowSection}
          fill={contourFill}
          stroke={highlight === 'wall' ? '#d7191c' : '#1b3b4e'}
          strokeWidth={highlight === 'wall' ? '3.5' : '1.6'}
        />

        {showMeshEdges && (
          <g fill="none" stroke="#183848" strokeWidth=".6" opacity={meshOpacity}>
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

        {(activeTab === 'vectors' || sceneVectors) && (
          <g stroke={arrowColor} strokeWidth="1.6" fill={vectorStyle === 'Filled-Arrow' ? arrowColor : 'none'}>
            {[
              [74, 183, 0],
              [138, 183, 0],
              [204, 183, 0],
              [268, 171, -37],
              [318, 128, -56],
              [340, 84, -90],
            ]
              .filter((_, index) => index % (1 + (vectors.skip ?? 0)) === 0)
              .map(([x, y, angle]) => (
                <path
                  key={x}
                  d={vectorPaths[vectorStyle] ?? vectorPaths.Arrow}
                  transform={`translate(${x} ${y}) rotate(${angle}) scale(${vectors.scale ?? 1})`}
                />
              ))}
          </g>
        )}

        {activeTab === 'contours' && !contours.filled && (
          <path
            d="M48 178H235A100 100 0 0 0 335 78V40"
            stroke="url(#elbow-contour-gradient)"
            strokeWidth="4"
            fill="none"
          />
        )}

        {(activeTab === 'pathlines' || scenePathlines) && (
          <g
            fill="none"
            strokeWidth={pathlines.source === 'inlet' ? 1.8 : 2.6}
            strokeLinecap="round"
          >
            <path d="M48 162H235A84 84 0 0 0 319 78V40" stroke="#fde047" />
            <path d="M48 176H235A98 98 0 0 0 333 78V40" stroke="#38bdf8" />
            <path d="M48 190H235A112 112 0 0 0 347 78V40" stroke="#fb7185" />
            <path d="M48 205H235A127 127 0 0 0 362 78V40" stroke="#34d399" />
          </g>
        )}

        {activeTab === 'particle-tracks' && (
          <g
            fill={
              particles.field === 'Particle Residence Time'
                ? '#fb7185'
                : '#fde047'
            }
          >
            {[
              [67, 181],
              [105, 176],
              [149, 171],
              [191, 166],
              [242, 157],
              [286, 137],
              [318, 109],
              [332, 63],
            ].map(([x, y], index) => (
              <circle
                key={x}
                cx={x}
                cy={y + (particles.source === 'injection-2' ? 12 : 0)}
                r={2 + (index % 3)}
              />
            ))}
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
  const { field, option } =
    simState.displayedResults['xy-plot'] ?? resultSettings('xy-plot', simState)
  const logY = getControlChecked(simState, 'xy-plot-log-y', false)
  const curve =
    field === 'Pressure'
      ? 'M52 60Q194 84 396 194'
      : field === 'Temperature'
        ? 'M52 195Q170 84 396 75'
        : 'M52 216Q224 38 396 216'
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[60, 100, 140, 180].map((y) => (
          <line key={y} x1="48" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <path d={curve} fill="none" stroke="#0078d4" strokeWidth="2.2" />
      <text x="130" y="244" fontSize="10" fill="#526071">
        {option} — {field} {logY ? '[Log Y]' : ''} (Teaching Demo)
      </text>
    </svg>
  )
}

function HistogramChart({ simState }: { simState: FluentSimState }) {
  const field = getControlValue(simState, 'histogram-field', 'Orthogonal Quality')
  const divisions = Math.max(5, Number(getControlValue(simState, 'histogram-bins', '5')) || 5)
  const count = Math.min(10, divisions)
  const baseHeights = [24, 52, 86, 128, 156, 134, 98, 64, 42, 20]
  const bars = Array.from({ length: count }, (_, idx) => {
    const shift = field === 'Velocity Magnitude' ? 1 : field === 'Static Temperature' ? 2 : 0
    const h = baseHeights[(idx + shift) % baseHeights.length]
    const colors = ['#dc2626', '#f59e0b', '#0ea5e9', '#14b8a6', '#16a34a']
    return {
      idx,
      h,
      color: colors[Math.min(colors.length - 1, Math.floor((idx / count) * colors.length))],
    }
  })
  const barWidth = Math.floor(300 / count) - 6
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[60, 100, 140, 180].map((y) => (
          <line key={y} x1="48" y1={y} x2="400" y2={y} />
        ))}
      </g>
      {bars.map((bar) => {
        const x = 64 + bar.idx * (barWidth + 6)
        const y = 225 - bar.h
        return (
          <rect
            key={bar.idx}
            x={x}
            y={y}
            width={barWidth}
            height={bar.h}
            fill={bar.color}
            rx="1.5"
          />
        )
      })}
      <text x="60" y="38" fontSize="10" fontWeight="700" fill="#1e293b">
        {field} Distribution ({count} divisions · Min Ortho = {simState.meshInfo.minOrthogonalQuality})
      </text>
      <text x="150" y="244" fontSize="10" fill="#526071">
        Bin Range · Teaching Histogram
      </text>
    </svg>
  )
}

function FftChart({ simState }: { simState: FluentSimState }) {
  const signal = getControlValue(simState, 'fft-signal', 'Pressure Probe')
  const yFunc = getControlValue(simState, 'fft-y-func', 'Sound Pressure Level (dB)')
  const win = getControlValue(simState, 'fft-window', 'Hanning')
  const peakX = signal === 'Lift Coefficient' ? 195 : signal === 'Acoustic Receiver' ? 265 : 150
  const d = `M48 188 L88 164 L120 142 L${peakX - 18} 134 L${peakX} 46 L${peakX + 22} 145 L295 168 L345 182 L400 198`
  return (
    <svg className="fluent-elbow" viewBox="0 0 430 260" aria-hidden="true">
      <rect x="48" y="20" width="352" height="205" fill="#fff" stroke="#b8c2ce" />
      <g stroke="#e6ebf1" strokeWidth="1">
        {[60, 100, 140, 180].map((y) => (
          <line key={y} x1="48" y1={y} x2="400" y2={y} />
        ))}
      </g>
      <path d={d} fill="none" stroke="#7c3aed" strokeWidth="2" />
      <circle cx={peakX} cy={46} r="3.5" fill="#dc2626" />
      <text x={peakX + 7} y="50" fontSize="9.5" fontWeight="700" fill="#dc2626">
        Peak: {signal === 'Acoustic Receiver' ? '342 Hz' : '128 Hz'}
      </text>
      <text x="86" y="244" fontSize="10" fill="#526071">
        {yFunc} · {signal} ({win} window)
      </text>
    </svg>
  )
}
