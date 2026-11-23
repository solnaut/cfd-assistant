import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DiagramLightboxModalProps {
  open: boolean
  onClose: () => void
  title: string
  badge?: string
  caption?: string
  highlights?: string[]
  defaultSurface?: 'light' | 'dark'
  children: ReactNode
}

const MIN_ZOOM = 0.75
const MAX_ZOOM = 3
const ZOOM_STEP = 0.25

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100))
}

function DiagramLightboxBody({
  onClose,
  title,
  badge,
  caption,
  highlights,
  defaultSurface = 'light',
  children,
}: Omit<DiagramLightboxModalProps, 'open'>) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [surface, setSurface] = useState<'light' | 'dark'>(defaultSurface)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [onClose])

  function updateZoom(nextZoom: number) {
    const clamped = clampZoom(nextZoom)
    setZoom(clamped)
    if (clamped <= 1) setPan({ x: 0, y: 0 })
  }

  function handleReset() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  function handleStagePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1 || event.button !== 0) return
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const originX = pan.x
    const originY = pan.y
    setDragging(true)

    function handleMove(moveEvent: PointerEvent) {
      setPan({
        x: Math.max(-600, Math.min(600, originX + moveEvent.clientX - startX)),
        y: Math.max(-420, Math.min(420, originY + moveEvent.clientY - startY)),
      })
    }

    function handleUp() {
      setDragging(false)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }

    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  return createPortal(
    <div
      className="diagram-lightbox-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="diagram-lightbox-card"
        role="dialog"
        aria-modal="true"
        aria-label={`大图预览：${title}`}
      >
        <header className="diagram-lightbox-header">
          <div className="diagram-lightbox-title-group">
            <strong>{title}</strong>
            {badge && <span className="diagram-lightbox-badge">{badge}</span>}
          </div>
          <div className="diagram-lightbox-toolbar">
            <button
              type="button"
              aria-label="缩小图解"
              disabled={zoom <= MIN_ZOOM}
              onClick={() => updateZoom(zoom - ZOOM_STEP)}
            >
              −
            </button>
            <span className="diagram-lightbox-zoom-readout" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              aria-label="放大图解"
              disabled={zoom >= MAX_ZOOM}
              onClick={() => updateZoom(zoom + ZOOM_STEP)}
            >
              +
            </button>
            <button
              type="button"
              aria-label="重置图解缩放"
              onClick={handleReset}
            >
              1:1 重置
            </button>
            <button
              type="button"
              aria-pressed={surface === 'dark'}
              onClick={() => setSurface((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            >
              {surface === 'dark' ? '浅色图纸' : '深色图纸'}
            </button>
            <button
              type="button"
              className="diagram-lightbox-close"
              aria-label="关闭大图预览"
              onClick={onClose}
            >
              关闭
            </button>
          </div>
        </header>

        <div
          className={`diagram-lightbox-stage${zoom > 1 ? ' is-pannable' : ''}${dragging ? ' is-dragging' : ''}`}
          data-lightbox-surface={surface}
          onPointerDown={handleStagePointerDown}
          onWheel={(event) => {
            event.preventDefault()
            updateZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP))
          }}
        >
          <div
            className="diagram-lightbox-canvas"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {children}
          </div>
        </div>

        {(caption || (highlights && highlights.length > 0)) && (
          <footer className="diagram-lightbox-footer">
            {caption && <p>{caption}</p>}
            {highlights && highlights.length > 0 && (
              <div className="diagram-lightbox-tags">
                {highlights.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
            <small className="diagram-lightbox-hint">
              支持滚轮缩放；放大后可按住左键拖动平移，按 Esc 仅退出大图预览。
            </small>
          </footer>
        )}
      </section>
    </div>,
    document.body,
  )
}

export function DiagramLightboxModal(props: DiagramLightboxModalProps) {
  if (!props.open) return null
  return <DiagramLightboxBody {...props} />
}
