import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MobileFullscreenButton } from '../components/MobileFullscreenButton'

const root = document.documentElement
const originalElement = Object.getOwnPropertyDescriptor(document, 'fullscreenElement')
const originalRequest = Object.getOwnPropertyDescriptor(root, 'requestFullscreen')
const originalExit = Object.getOwnPropertyDescriptor(document, 'exitFullscreen')

afterEach(() => {
  if (originalElement) Object.defineProperty(document, 'fullscreenElement', originalElement)
  else Reflect.deleteProperty(document, 'fullscreenElement')
  if (originalRequest) Object.defineProperty(root, 'requestFullscreen', originalRequest)
  else Reflect.deleteProperty(root, 'requestFullscreen')
  if (originalExit) Object.defineProperty(document, 'exitFullscreen', originalExit)
  else Reflect.deleteProperty(document, 'exitFullscreen')
  root.classList.remove('mobile-focus-view')
})

describe('Mobile fullscreen', () => {
  it('preserves the fullscreen controls if the native exit is denied', async () => {
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: root })
    Object.defineProperty(document, 'exitFullscreen', {
      configurable: true, value: vi.fn().mockRejectedValue(new Error('Exit denied')),
    })
    render(<MobileFullscreenButton />)
    fireEvent.click(screen.getByRole('button', { name: '退出全屏' }))
    expect(await screen.findByRole('status')).toHaveTextContent('请通过浏览器的退出全屏操作返回。')
    expect(screen.getByRole('button', { name: '退出全屏' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('uses the native fullscreen state and responds to an external exit', async () => {
    let element: Element | null = null
    Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => element })
    const requestFullscreen = vi.fn(async () => {
      element = root
      document.dispatchEvent(new Event('fullscreenchange'))
    })
    Object.defineProperty(root, 'requestFullscreen', { configurable: true, value: requestFullscreen })
    render(<MobileFullscreenButton />)

    fireEvent.click(screen.getByRole('button', { name: '全屏' }))
    expect(await screen.findByRole('button', { name: '退出全屏' })).toHaveAttribute('aria-pressed', 'true')
    expect(requestFullscreen).toHaveBeenCalledOnce()

    element = null
    fireEvent(document, new Event('fullscreenchange'))
    expect(screen.getByRole('button', { name: '全屏' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('offers an exit from focus view via button or Escape when the browser denies native fullscreen', async () => {
    Object.defineProperty(root, 'requestFullscreen', {
      configurable: true,
      value: vi.fn().mockRejectedValue(new Error('Fullscreen unavailable')),
    })
    render(<MobileFullscreenButton />)

    fireEvent.click(screen.getByRole('button', { name: '全屏' }))
    const exit = await screen.findByRole('button', { name: '退出专注' })
    expect(exit).toHaveAttribute('aria-pressed', 'true')
    expect(root).toHaveClass('mobile-focus-view')
    expect(screen.getByRole('status')).toHaveTextContent(/已进入专注视图/)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(root).not.toHaveClass('mobile-focus-view')
    expect(screen.getByRole('button', { name: '全屏' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '全屏' }))
    fireEvent.click(await screen.findByRole('button', { name: '退出专注' }))
    expect(root).not.toHaveClass('mobile-focus-view')
  })
})
