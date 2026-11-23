import { useState, type Dispatch } from 'react'
import type { FluentLabel, FluentLanguage } from '../fluentLanguage'
import type { FluentMeshingAction, FluentMeshingState } from './meshingState'
import type { MeshingBoundaryHighlight, MeshingDialogId, MeshingRegionRow, MeshingViewportTab } from './meshingTypes'

interface MeshingDialogsProps {
  activeDialog: MeshingDialogId | null
  state: FluentMeshingState
  dispatch: Dispatch<FluentMeshingAction>
  label: FluentLabel
  language: FluentLanguage
  uiTheme: 'light' | 'dark'
  onSetLanguage: (lang: FluentLanguage) => void
  onSetUiTheme: (theme: 'light' | 'dark') => void
  onClose: () => void
}

interface TabDef {
  id: string
  label: string
}

const dialogConfig: Record<MeshingDialogId, { title: string; subtitle: string; tabs: TabDef[] }> = {
  'meshing-file-io': {
    title: 'Read/Write Mesh',
    subtitle: '读取上游 CAD/面网格文件，或导出前处理 `.msh.h5` / `.msh` 文件供存档与求解器读取。',
    tabs: [
      { id: 'read', label: 'Read' },
      { id: 'write', label: 'Write' },
    ],
  },
  'meshing-display-options': {
    title: 'Display Options',
    subtitle: '配置图形视口渲染模式、边界面高亮及体网格交互剖切平面位置。',
    tabs: [
      { id: 'viewport', label: 'Viewport' },
      { id: 'cut-plane', label: 'Cut Plane' },
      { id: 'coloring', label: 'Colors & Lighting' },
    ],
  },
  'meshing-surface-diagnostics': {
    title: 'Surface Mesh Diagnostics',
    subtitle: '检查面网格偏斜率峰值，排查自由边、多重边及自交相面拓扑缺陷。',
    tabs: [
      { id: 'quality', label: 'Quality' },
      { id: 'connectivity', label: 'Connectivity' },
      { id: 'repair', label: 'Repair & Smooth' },
    ],
  },
  'meshing-volume-check': {
    title: 'Volume Mesh Check',
    subtitle: '核验体网格单元数目、最小正交质量、最大长宽比与偏斜度并定位质量直方图。',
    tabs: [
      { id: 'summary', label: 'Summary' },
      { id: 'metrics', label: 'Quality Metrics' },
      { id: 'bl-audit', label: 'Boundary Layer Audit' },
    ],
  },
  'meshing-zone-manager': {
    title: 'Manage Zones',
    subtitle: '批量管理面边界区域类型与体计算域类型（Fluid / Solid / Dead），并即时高亮视口。',
    tabs: [
      { id: 'boundaries', label: 'Boundary Zones' },
      { id: 'regions', label: 'Cell Regions' },
    ],
  },
  'meshing-preferences': {
    title: 'Preferences',
    subtitle: '切换 Fluent Meshing 界面主题、教学语言，以及并行网格进程数与自动质检开关。',
    tabs: [
      { id: 'appearance', label: 'Appearance' },
      { id: 'engine', label: 'Meshing Engine' },
    ],
  },
}

export function MeshingDialogs(props: MeshingDialogsProps) {
  if (!props.activeDialog) return null
  return (
    <div className="fluent-dialog-layer">
      <MeshingDialogBody
        key={props.activeDialog}
        dialogId={props.activeDialog}
        {...props}
      />
    </div>
  )
}

function MeshingDialogBody({
  dialogId,
  state,
  dispatch,
  label,
  language,
  uiTheme,
  onSetLanguage,
  onSetUiTheme,
  onClose,
}: MeshingDialogsProps & { dialogId: MeshingDialogId }) {
  const meta = dialogConfig[dialogId]
  const title = label(meta.title)
  const [activeTab, setActiveTab] = useState(meta.tabs[0].id)

  // File I/O local state
  const [readType, setReadType] = useState('Mesh File (.msh.h5)')
  const [readFile, setReadFile] = useState(state.importGeometry.fileName || 'mixing_elbow.scdoc')
  const [scaleUnits, setScaleUnits] = useState(state.importGeometry.lengthUnit)
  const [writeFormat, setWriteFormat] = useState('Mesh File (.msh.h5)')
  const [writeFile, setWriteFile] = useState('mixing_elbow_meshed.msh.h5')
  const [binaryFormat, setBinaryFormat] = useState(true)

  // Display options local state
  const [showEdges, setShowEdges] = useState(true)
  const [shadedFaces, setShadedFaces] = useState(true)
  const [planeOrientation, setPlaneOrientation] = useState('Z-Normal')
  const [colorBy, setColorBy] = useState('Zone Type')
  const [headlightOn, setHeadlightOn] = useState(true)

  // Surface diagnostics local state
  const [skewThreshold, setSkewThreshold] = useState('0.85')
  const [checkFreeFaces, setCheckFreeFaces] = useState(true)
  const [checkMultiFaces, setCheckMultiFaces] = useState(true)
  const [checkSelfIntersect, setCheckSelfIntersect] = useState(true)
  const [smoothIterations, setSmoothIterations] = useState('3')
  const [stitchTol, setStitchTol] = useState('0.001')

  // Volume check local state
  const [targetOrtho, setTargetOrtho] = useState(state.improveMesh.targetOrthogonalQuality || '0.20')
  const [targetYPlus, setTargetYPlus] = useState('1.0')
  const [firstAspectLimit, setFirstAspectLimit] = useState('25')

  // Preferences local state
  const [meshProcesses, setMeshProcesses] = useState(String(state.processes || 4))
  const [autoCheckQuality, setAutoCheckQuality] = useState(true)
  const [keepBackupSurf, setKeepBackupSurf] = useState(false)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'touch' || (event.target as HTMLElement).closest('button')) return
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const originX = dragPos.x
    const originY = dragPos.y

    function handleMove(moveEvent: PointerEvent) {
      setDragPos({
        x: Math.max(-420, Math.min(420, originX + moveEvent.clientX - startX)),
        y: Math.max(-200, Math.min(260, originY + moveEvent.clientY - startY)),
      })
    }

    function handleUp() {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  function handleReadMesh() {
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /file/read-mesh "${readFile}"` },
        {
          kind: 'success',
          text: `[Meshing File I/O] Loaded ${readType} "${readFile}" (units=${scaleUnits}).`,
        },
      ],
    })
  }

  function handleWriteMesh() {
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /file/write-mesh "${writeFile}"` },
        {
          kind: 'success',
          text: `[Meshing File I/O] Exported ${writeFormat} "${writeFile}" (${binaryFormat ? 'Binary' : 'ASCII'}).`,
        },
      ],
    })
  }

  function handleRunSurfaceDiag() {
    const faceCount = state.surfaceMesh.generated ? state.surfaceMesh.faceCount : 3840
    const skew = state.surfaceMesh.generated ? state.surfaceMesh.maxSkewness : 0.72
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /diagnostics/surface-mesh/quality ${skewThreshold}` },
        {
          kind: Number(skew) > Number(skewThreshold || 0.85) ? 'warning' : 'success',
          text: `[Surface Diagnostics] Checked ${faceCount.toLocaleString()} faces: max skewness = ${skew} (threshold ${skewThreshold}).`,
        },
      ],
    })
  }

  function handleCheckConnectivity() {
    const checks = [
      checkFreeFaces ? 'Free Faces=0' : null,
      checkMultiFaces ? 'Multi Faces=0' : null,
      checkSelfIntersect ? 'Self-Intersections=0' : null,
    ].filter(Boolean)
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: '> /diagnostics/surface-mesh/connectivity' },
        {
          kind: 'success',
          text: `[Surface Connectivity] Verified ${checks.join(', ') || 'surface topology'} — clean closed domain.`,
        },
      ],
    })
  }

  function handleCheckVolumeMesh() {
    const count = state.volumeMesh.generated ? state.volumeMesh.cellCount : 48620
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: '> /mesh/check-mesh' },
        {
          kind: 'output',
          text: `[Volume Mesh Check] Fill=${state.volumeMesh.fillWith}, Cells=${count.toLocaleString()}, Min Ortho=${state.volumeMesh.minOrthogonalQuality}, Max Skew=${state.volumeMesh.maxSkewness}, Max AR=${state.volumeMesh.maxAspectRatio}.`,
        },
      ],
    })
  }

  function handleReportQualityHistogram() {
    dispatch({ type: 'SET_VIEWPORT_TAB', tab: 'quality' })
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /mesh/report-quality target=${targetOrtho}` },
        {
          kind: 'success',
          text: `[Volume Quality] Displayed orthogonal quality histogram (Min Ortho=${state.volumeMesh.minOrthogonalQuality}, Target>=${targetOrtho}).`,
        },
      ],
    })
  }

  function handleSmoothSurface() {
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /diagnostics/surface-mesh/smooth iterations=${smoothIterations}` },
        {
          kind: 'success',
          text: `[Surface Repair] Applied ${smoothIterations} Laplacian/skewness-guided smoothing passes (stitch tol=${stitchTol} mm).`,
        },
      ],
    })
  }

  function handleAuditBoundaryLayers() {
    const layers = state.boundaryLayers.numberOfLayers
    const ratio = state.boundaryLayers.growthRate
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        { kind: 'command', text: `> /mesh/check-boundary-layers target-yplus=${targetYPlus}` },
        {
          kind: 'success',
          text: `[BL Audit] Verified ${layers} prism layers (growth rate ${ratio}, target y+=${targetYPlus}, max first-layer AR<=${firstAspectLimit}).`,
        },
      ],
    })
  }

  function handleApplyPreferences() {
    dispatch({
      type: 'APPEND_CONSOLE',
      entries: [
        {
          kind: 'success',
          text: `[Meshing Preferences] Theme=${uiTheme}, Language=${language}, Parallel Processes=${meshProcesses}, Auto-Check=${autoCheckQuality ? 'On' : 'Off'}.`,
        },
      ],
    })
    onClose()
  }

  return (
    <div
      className="fluent-dialog-window fluent-meshing-dialog-window"
      role="dialog"
      aria-label={title}
      style={{ transform: `translate(${dragPos.x}px, ${dragPos.y}px)` }}
    >
      <div className="fluent-dialog-titlebar" onPointerDown={startDrag}>
        <strong>{title}</strong>
        <button type="button" aria-label={`Close ${title}`} onClick={onClose}>
          ×
        </button>
      </div>

      <div className="fluent-dialog-tabs" role="tablist" aria-label={`${title} Tabs`}>
        {meta.tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            {label(tab.label)}
          </button>
        ))}
      </div>

      <div className="fluent-dialog-body">
        <p className="fluent-dialog-subtitle">{meta.subtitle}</p>

        {dialogId === 'meshing-file-io' && activeTab === 'read' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-io-read-type">File Type</label>
              <select id="m-io-read-type" value={readType} onChange={(e) => setReadType(e.target.value)}>
                <option value="Mesh File (.msh.h5)">Mesh File (.msh.h5)</option>
                <option value="CAD Geometry (.scdoc)">CAD Geometry (.scdoc)</option>
                <option value="Surface Mesh (.sf)">Surface Mesh (.sf)</option>
              </select>
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-io-read-file">File Name</label>
              <input id="m-io-read-file" type="text" value={readFile} onChange={(e) => setReadFile(e.target.value)} />
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-io-scale-units">Scale Units</label>
              <select id="m-io-scale-units" value={scaleUnits} onChange={(e) => setScaleUnits(e.target.value as 'mm' | 'm' | 'in')}>
                <option value="mm">mm</option>
                <option value="m">m</option>
                <option value="in">in</option>
              </select>
            </div>
          </div>
        )}

        {dialogId === 'meshing-file-io' && activeTab === 'write' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-io-write-format">Export Format</label>
              <select id="m-io-write-format" value={writeFormat} onChange={(e) => setWriteFormat(e.target.value)}>
                <option value="Mesh File (.msh.h5)">Mesh File (.msh.h5)</option>
                <option value="Legacy Mesh (.msh)">Legacy Mesh (.msh)</option>
                <option value="CGNS (.cgns)">CGNS (.cgns)</option>
              </select>
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-io-write-file">Output File Name</label>
              <input id="m-io-write-file" type="text" value={writeFile} onChange={(e) => setWriteFile(e.target.value)} />
            </div>
            <label className="fluent-check-row">
              <input type="checkbox" checked={binaryFormat} onChange={(e) => setBinaryFormat(e.target.checked)} />
              <span>Binary Format</span>
            </label>
          </div>
        )}

        {dialogId === 'meshing-display-options' && activeTab === 'viewport' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-disp-view">Active View</label>
              <select
                id="m-disp-view"
                value={state.viewportTab}
                onChange={(e) => dispatch({ type: 'SET_VIEWPORT_TAB', tab: e.target.value as MeshingViewportTab })}
              >
                <option value="cad">CAD Geometry</option>
                <option value="surface-mesh">Surface Mesh</option>
                <option value="volume-mesh">Volume Mesh</option>
                <option value="quality">Quality Histogram</option>
              </select>
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-disp-zone">Highlight Boundary Zone</label>
              <select
                id="m-disp-zone"
                value={state.highlightedZone ?? ''}
                onChange={(e) =>
                  dispatch({
                    type: 'SET_HIGHLIGHTED_ZONE',
                    zone: (e.target.value || null) as MeshingBoundaryHighlight,
                  })
                }
              >
                <option value="">None</option>
                <option value="inlet">inlet</option>
                <option value="outlet">outlet</option>
                <option value="wall">wall</option>
                <option value="symmetry">symmetry</option>
              </select>
            </div>
            <label className="fluent-check-row">
              <input type="checkbox" checked={showEdges} onChange={(e) => setShowEdges(e.target.checked)} />
              <span>Edge Visibility</span>
            </label>
            <label className="fluent-check-row">
              <input type="checkbox" checked={shadedFaces} onChange={(e) => setShadedFaces(e.target.checked)} />
              <span>Shaded Faces</span>
            </label>
          </div>
        )}

        {dialogId === 'meshing-display-options' && activeTab === 'cut-plane' && (
          <div className="fluent-controls-stack">
            <label className="fluent-check-row">
              <input
                type="checkbox"
                checked={state.cutPlaneEnabled}
                onChange={(e) => dispatch({ type: 'TOGGLE_CUT_PLANE', enabled: e.target.checked })}
              />
              <span>Enable Cut Plane</span>
            </label>
            <div className="fluent-field-row">
              <label htmlFor="m-disp-cut-pos">Cut Plane Position ({state.cutPlanePosition}%)</label>
              <input
                id="m-disp-cut-pos"
                type="range"
                min={10}
                max={90}
                value={state.cutPlanePosition}
                onChange={(e) => dispatch({ type: 'SET_CUT_PLANE_POSITION', position: Number(e.target.value) })}
              />
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-disp-cut-ori">Plane Orientation</label>
              <select id="m-disp-cut-ori" value={planeOrientation} onChange={(e) => setPlaneOrientation(e.target.value)}>
                <option value="X-Normal">X-Normal</option>
                <option value="Y-Normal">Y-Normal</option>
                <option value="Z-Normal">Z-Normal</option>
              </select>
            </div>
          </div>
        )}

        {dialogId === 'meshing-display-options' && activeTab === 'coloring' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-disp-color-by">Color Faces By</label>
              <select id="m-disp-color-by" value={colorBy} onChange={(e) => setColorBy(e.target.value)}>
                <option value="Zone Type">Zone Type</option>
                <option value="Face Zone Name">Face Zone Name</option>
                <option value="Surface Skewness">Surface Skewness</option>
              </select>
            </div>
            <label className="fluent-check-row">
              <input type="checkbox" checked={headlightOn} onChange={(e) => setHeadlightOn(e.target.checked)} />
              <span>Headlight Illumination</span>
            </label>
          </div>
        )}

        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'quality' && (
          <div className="fluent-controls-stack">
            <p className="fluent-inline-note">
              Face Count: {(state.surfaceMesh.generated ? state.surfaceMesh.faceCount : 3840).toLocaleString()} | Max Skewness: {state.surfaceMesh.maxSkewness}
            </p>
            <div className="fluent-field-row">
              <label htmlFor="m-sdiag-skew">Skewness Threshold</label>
              <input id="m-sdiag-skew" type="text" value={skewThreshold} onChange={(e) => setSkewThreshold(e.target.value)} />
            </div>
          </div>
        )}

        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'connectivity' && (
          <div className="fluent-controls-stack">
            <label className="fluent-check-row">
              <input type="checkbox" checked={checkFreeFaces} onChange={(e) => setCheckFreeFaces(e.target.checked)} />
              <span>Free Faces Check</span>
            </label>
            <label className="fluent-check-row">
              <input type="checkbox" checked={checkMultiFaces} onChange={(e) => setCheckMultiFaces(e.target.checked)} />
              <span>Multi Faces Check</span>
            </label>
            <label className="fluent-check-row">
              <input type="checkbox" checked={checkSelfIntersect} onChange={(e) => setCheckSelfIntersect(e.target.checked)} />
              <span>Self-Intersection Check</span>
            </label>
          </div>
        )}

        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'repair' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-sdiag-smooth-iter">Smoothing Iterations</label>
              <input id="m-sdiag-smooth-iter" type="text" value={smoothIterations} onChange={(e) => setSmoothIterations(e.target.value)} />
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-sdiag-stitch-tol">Stitch Tolerance (mm)</label>
              <input id="m-sdiag-stitch-tol" type="text" value={stitchTol} onChange={(e) => setStitchTol(e.target.value)} />
            </div>
          </div>
        )}

        {dialogId === 'meshing-volume-check' && activeTab === 'summary' && (
          <div className="fluent-controls-stack">
            <p className="fluent-inline-note">
              Fill Method: {state.volumeMesh.fillWith} | Cell Count: {(state.volumeMesh.generated ? state.volumeMesh.cellCount : 48620).toLocaleString()}
            </p>
            <p className="fluent-inline-note">
              Min Orthogonal Quality: {state.volumeMesh.minOrthogonalQuality} | Max Aspect Ratio: {state.volumeMesh.maxAspectRatio} | Max Skewness: {state.volumeMesh.maxSkewness}
            </p>
          </div>
        )}

        {dialogId === 'meshing-volume-check' && activeTab === 'metrics' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-vchk-ortho">Target Min Orthogonal Quality</label>
              <input id="m-vchk-ortho" type="text" value={targetOrtho} onChange={(e) => setTargetOrtho(e.target.value)} />
            </div>
            <p className="fluent-inline-note">
              Quality Status: {state.volumeMesh.minOrthogonalQuality >= Number(targetOrtho || 0.2) ? 'Within Target' : 'Below Target (Improve Recommended)'}
            </p>
          </div>
        )}

        {dialogId === 'meshing-volume-check' && activeTab === 'bl-audit' && (
          <div className="fluent-controls-stack">
            <p className="fluent-inline-note">
              Active Prism Layers: {state.boundaryLayers.numberOfLayers} | Growth Rate: {state.boundaryLayers.growthRate} | Method: {state.boundaryLayers.offsetMethod}
            </p>
            <div className="fluent-field-row">
              <label htmlFor="m-vchk-yplus">Target Wall y+</label>
              <input id="m-vchk-yplus" type="text" value={targetYPlus} onChange={(e) => setTargetYPlus(e.target.value)} />
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-vchk-bl-ar">Max First-Layer Aspect Ratio</label>
              <input id="m-vchk-bl-ar" type="text" value={firstAspectLimit} onChange={(e) => setFirstAspectLimit(e.target.value)} />
            </div>
          </div>
        )}

        {dialogId === 'meshing-zone-manager' && activeTab === 'boundaries' && (
          <div className="fluent-controls-stack">
            {state.boundaries.map((row) => (
              <div key={row.id} className="fluent-field-row">
                <label htmlFor={`m-zm-bc-${row.id}`}>{row.name}</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <select
                    id={`m-zm-bc-${row.id}`}
                    aria-label={`Zone Type ${row.name}`}
                    value={row.type}
                    onChange={(e) =>
                      dispatch({ type: 'UPDATE_BOUNDARY_TYPE', id: row.id, boundaryType: e.target.value })
                    }
                  >
                    <option value="velocity-inlet">velocity-inlet</option>
                    <option value="pressure-inlet">pressure-inlet</option>
                    <option value="mass-flow-inlet">mass-flow-inlet</option>
                    <option value="pressure-outlet">pressure-outlet</option>
                    <option value="outflow">outflow</option>
                    <option value="wall">wall</option>
                    <option value="symmetry">symmetry</option>
                    <option value="interface">interface</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'SET_HIGHLIGHTED_ZONE', zone: row.boundary })}
                  >
                    Highlight
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {dialogId === 'meshing-zone-manager' && activeTab === 'regions' && (
          <div className="fluent-controls-stack">
            {state.regions.map((row) => (
              <div key={row.id} className="fluent-field-row">
                <label htmlFor={`m-zm-reg-${row.id}`}>
                  {row.name} ({row.estimatedCells.toLocaleString()})
                </label>
                <select
                  id={`m-zm-reg-${row.id}`}
                  aria-label={`Region Type ${row.name}`}
                  value={row.type}
                  onChange={(e) =>
                    dispatch({
                      type: 'UPDATE_REGION_TYPE',
                      id: row.id,
                      regionType: e.target.value as MeshingRegionRow['type'],
                    })
                  }
                >
                  <option value="fluid">fluid</option>
                  <option value="solid">solid</option>
                  <option value="dead">dead</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {dialogId === 'meshing-preferences' && activeTab === 'appearance' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-pref-theme">UI Theme</label>
              <select
                id="m-pref-theme"
                value={uiTheme}
                onChange={(e) => onSetUiTheme(e.target.value === 'dark' ? 'dark' : 'light')}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="fluent-field-row">
              <label htmlFor="m-pref-lang">Interface Language</label>
              <select
                id="m-pref-lang"
                value={language}
                onChange={(e) => onSetLanguage(e.target.value as FluentLanguage)}
              >
                <option value="en">English (EN)</option>
                <option value="zh">中文 (ZH)</option>
                <option value="both">EN · 中文</option>
              </select>
            </div>
          </div>
        )}

        {dialogId === 'meshing-preferences' && activeTab === 'engine' && (
          <div className="fluent-controls-stack">
            <div className="fluent-field-row">
              <label htmlFor="m-pref-procs">Parallel Processes</label>
              <select
                id="m-pref-procs"
                value={meshProcesses}
                onChange={(e) => setMeshProcesses(e.target.value)}
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="4">4</option>
                <option value="8">8</option>
                <option value="16">16</option>
              </select>
            </div>
            <label className="fluent-check-row">
              <input
                type="checkbox"
                checked={autoCheckQuality}
                onChange={(e) => setAutoCheckQuality(e.target.checked)}
              />
              <span>Auto-Check Quality After Volume Mesh</span>
            </label>
            <label className="fluent-check-row">
              <input
                type="checkbox"
                checked={keepBackupSurf}
                onChange={(e) => setKeepBackupSurf(e.target.checked)}
              />
              <span>Keep Backup Surface Mesh</span>
            </label>
          </div>
        )}
      </div>

      <div className="fluent-dialog-actions">
        {dialogId === 'meshing-file-io' && activeTab === 'read' && (
          <button type="button" className="primary" onClick={handleReadMesh}>
            Read File
          </button>
        )}
        {dialogId === 'meshing-file-io' && activeTab === 'write' && (
          <button type="button" className="primary" onClick={handleWriteMesh}>
            Write File
          </button>
        )}
        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'quality' && (
          <button type="button" className="primary" onClick={handleRunSurfaceDiag}>
            Run Diagnostics
          </button>
        )}
        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'connectivity' && (
          <button type="button" className="primary" onClick={handleCheckConnectivity}>
            Check Connectivity
          </button>
        )}
        {dialogId === 'meshing-surface-diagnostics' && activeTab === 'repair' && (
          <button type="button" className="primary" onClick={handleSmoothSurface}>
            Smooth &amp; Stitch
          </button>
        )}
        {dialogId === 'meshing-volume-check' && activeTab === 'summary' && (
          <button type="button" className="primary" onClick={handleCheckVolumeMesh}>
            Check Volume Mesh
          </button>
        )}
        {dialogId === 'meshing-volume-check' && activeTab === 'metrics' && (
          <button type="button" className="primary" onClick={handleReportQualityHistogram}>
            Report Quality Histogram
          </button>
        )}
        {dialogId === 'meshing-volume-check' && activeTab === 'bl-audit' && (
          <button type="button" className="primary" onClick={handleAuditBoundaryLayers}>
            Audit Boundary Layers
          </button>
        )}
        {dialogId === 'meshing-preferences' && (
          <button type="button" className="primary" onClick={handleApplyPreferences}>
            Apply Preferences
          </button>
        )}
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
