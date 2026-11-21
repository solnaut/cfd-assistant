import { useState } from 'react'
import { FluentIcon } from './FluentIcons'
import type { FluentLabel } from './fluentLanguage'
import { fluentMockLayout } from './fluentLayoutData'
import type { FluentMockControl } from './fluentTypes'

const radii = Array.from({ length: 9 }, (_, index) => 69 + index * 9)
const bendAngles = Array.from({ length: 13 }, (_, index) => index * Math.PI / 24)
const graphicsTools = fluentMockLayout.graphicsControls.filter(
  (control) => control.controlType === 'graphics-tool',
)

export function FluentViewport({
  activeControlId,
  label,
  onInspect,
}: {
  activeControlId: string
  label: FluentLabel
  onInspect: (control: FluentMockControl) => void
}) {
  const [showMesh, setShowMesh] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState(0)
  const filter = fluentMockLayout.graphicsControls.find(
    (control) => control.id === 'graphics-selection-filter',
  )

  function activate(tool: FluentMockControl) {
    onInspect(tool)
    switch (tool.id) {
      case 'graphics-zoom':
        setZoom((value) => value === 1.5 ? 1 : value + 0.25)
        break
      case 'graphics-rotate':
        setRotation((value) => (value + 15) % 360)
        break
      case 'graphics-pan':
        setPan((value) => value >= 30 ? -30 : value + 15)
        break
      case 'graphics-fit':
        setZoom(1)
        setRotation(0)
        setPan(0)
        break
      case 'graphics-style':
        setShowMesh((value) => !value)
        break
    }
  }

  return (
    <section className="fluent-graphics-pane" aria-label={label('Graphics')}>
      <div className="fluent-pane-title fluent-viewport-tabs">
        <button type="button" aria-pressed={showMesh} onClick={() => setShowMesh(true)}>
          {label('Mesh')}
        </button>
        <button type="button" aria-pressed={!showMesh} onClick={() => setShowMesh(false)}>
          {label('Geometry')}
        </button>
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
        <div className="fluent-graphics-canvas">
          <span className="fluent-canvas-caption">{label(showMesh ? 'Elbow mesh' : 'Elbow geometry')}</span>
          <svg className="fluent-elbow" viewBox="0 0 430 285" aria-hidden="true">
            <g style={{ transformOrigin: 'center', transform: 'translateX(' + pan + 'px) rotate(' + rotation + 'deg) scale(' + zoom + ')' }}>
              <path d="M48 184H235A106 106 0 0 0 341 78V40" fill="none"
                stroke="#37788b" strokeWidth="77" />
              <path d="M48 147H235A69 69 0 0 0 304 78V40H376V78A141 141 0 0 1 235 219H48Z"
                fill="#438897" stroke="#9ce3de" strokeWidth="1.5" />
              {showMesh && (
                <g fill="none" stroke="#9ce3de" strokeWidth=".65" opacity=".78">
                  {radii.slice(1, -1).map((r) => (
                    <path key={r} d={['M48', 78 + r, 'H235A', r, r, '0 0 0', 235 + r, '78V40'].join(' ')} />
                  ))}
                  {bendAngles.map((angle) => (
                    <line key={angle}
                      x1={235 + 69 * Math.sin(angle)} y1={78 + 69 * Math.cos(angle)}
                      x2={235 + 141 * Math.sin(angle)} y2={78 + 141 * Math.cos(angle)} />
                  ))}
                  <path d="M66 147v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72m18-72v72 M304 55h72m-72 11h72" />
                </g>
              )}
              <path d="M48 147v72 M304 40h72" stroke="#ffca85" strokeWidth="2.5" />
            </g>
          </svg>
          <svg className="fluent-view-axes" viewBox="0 0 52 46" aria-hidden="true">
            <path d="M17 32h26" stroke="#ff9685" />
            <path d="M17 32V8" stroke="#9be2ae" />
            <path d="m17 32-9 8" stroke="#a1caff" />
            <text x="43" y="35" fill="#ff9685">X</text>
            <text x="14" y="7" fill="#9be2ae">Y</text>
            <text x="1" y="43" fill="#a1caff">Z</text>
          </svg>
        </div>
      </div>
      {filter && (
        <button
          className={'fluent-selection-filter' + (filter.id === activeControlId ? ' active' : '')}
          data-fluent-control={filter.id}
          type="button"
          onClick={() => onInspect(filter)}
        >
          {label(filter.label)} <small>{filter.value}</small>
        </button>
      )}
    </section>
  )
}
