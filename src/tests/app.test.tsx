import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders the polished home page with the two primary entries', () => {
    renderApp()

    expect(
      screen.getByRole('heading', {
        name: '更清晰地完成 CFD 参数整理与 Fluent 功能学习',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: '参数计算' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Fluent 功能导览' }).length,
    ).toBeGreaterThan(0)
  })

  it('renders calculator categories before individual calculators', () => {
    renderApp('/calculators')

    expect(screen.getByRole('heading', { name: '参数计算' })).toBeInTheDocument()
    expect(screen.getByText('近壁面与网格')).toBeInTheDocument()
    expect(screen.getByText('瞬态与时间步长')).toBeInTheDocument()
    expect(screen.getByText('无量纲数')).toBeInTheDocument()
  })

  it('renders a calculator category page', () => {
    renderApp('/calculators/near-wall-mesh')

    expect(screen.getByRole('heading', { name: '近壁面与网格' })).toBeInTheDocument()
    expect(screen.getByText('y+ 与第一层网格高度')).toBeInTheDocument()
    expect(screen.getByText('边界层网格计算')).toBeInTheDocument()
  })

  it('renders a calculator detail page shell', () => {
    renderApp('/calculators/near-wall-mesh/y-plus-first-layer-height')

    expect(
      screen.getByRole('heading', { name: 'y+ 与第一层网格高度' }),
    ).toBeInTheDocument()
    expect(screen.getByText('输入参数')).toBeInTheDocument()
    expect(screen.getByText('结果展示')).toBeInTheDocument()
    expect(screen.getByText('公式与说明')).toBeInTheDocument()
  })
})
