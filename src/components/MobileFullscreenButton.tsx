import { useEffect, useState } from 'react'

const focusViewClass = 'mobile-focus-view'

type WebkitDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void
}

function getFullscreenElement(): Element | null {
  const doc = document as WebkitDocument
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null
}

async function requestRootFullscreen(root: WebkitElement): Promise<void> {
  if (typeof root.requestFullscreen === 'function') {
    await root.requestFullscreen()
    return
  }
  if (typeof root.webkitRequestFullscreen === 'function') {
    await root.webkitRequestFullscreen()
  }
}

async function exitDocFullscreen(): Promise<void> {
  const doc = document as WebkitDocument
  if (typeof document.exitFullscreen === 'function') {
    await document.exitFullscreen()
    return
  }
  if (typeof doc.webkitExitFullscreen === 'function') {
    await doc.webkitExitFullscreen()
  }
}

function FullscreenIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M6 2.5V6H2.5M10 2.5V6h3.5M6 13.5V10H2.5M10 13.5V10h3.5" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" />
    </svg>
  )
}

export function MobileFullscreenButton() {
  const [fullscreen, setFullscreen] = useState(() => Boolean(getFullscreenElement()))
  const [focusView, setFocusView] = useState(() =>
    document.documentElement.classList.contains(focusViewClass),
  )
  const [hint, setHint] = useState('')

  useEffect(() => {
    function syncFullscreen() {
      setFullscreen(Boolean(getFullscreenElement()))
      setHint('')
    }

    document.addEventListener('fullscreenchange', syncFullscreen)
    document.addEventListener('webkitfullscreenchange', syncFullscreen)
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', syncFullscreen)
    }
  }, [])

  useEffect(() => {
    if (!focusView) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      document.documentElement.classList.remove(focusViewClass)
      setFocusView(false)
      setHint('')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusView])

  async function toggle() {
    const root = document.documentElement as WebkitElement
    if (getFullscreenElement()) {
      try {
        await exitDocFullscreen()
      } catch {
        setHint('请通过浏览器的退出全屏操作返回。')
      }
      return
    }

    if (focusView) {
      root.classList.remove(focusViewClass)
      setFocusView(false)
      setHint('')
      return
    }

    if (typeof root.requestFullscreen === 'function' || typeof root.webkitRequestFullscreen === 'function') {
      try {
        await requestRootFullscreen(root)
      } catch {
        // Some browsers or embedded frames restrict native fullscreen and fall back to focus view.
      }

      if (getFullscreenElement()) {
        const orientation = window.screen.orientation as
          | (ScreenOrientation & { lock?: (mode: 'landscape') => Promise<void> })
          | undefined
        if (orientation?.type?.startsWith('portrait')) {
          await orientation.lock?.('landscape').catch(() => {
            // Manual rotation remains available.
          })
        }
        return
      }
    }

    root.classList.add(focusViewClass)
    setFocusView(true)
    const isCoarsePointer =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    setHint(
      isCoarsePointer
        ? '已进入专注视图，可横置手机扩大工作区。'
        : '已进入专注视图，按 Esc 键或点击“退出专注”返回。',
    )
  }

  return (
    <div className="mobile-screen-controls" lang="zh-CN">
      <button
        type="button"
        aria-pressed={fullscreen || focusView}
        aria-label={fullscreen ? '退出全屏' : focusView ? '退出专注' : '全屏'}
        onClick={() => void toggle()}
      >
        <FullscreenIcon active={fullscreen || focusView} />
        <span>{fullscreen ? '退出全屏' : focusView ? '退出专注' : '全屏'}</span>
      </button>
      {hint && (
        <span className="mobile-screen-hint" role="status">
          {hint}
        </span>
      )}
    </div>
  )
}
