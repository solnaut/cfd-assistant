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
    expect(screen.getByText('边界层网格等比增长')).toBeInTheDocument()
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

  it('renders calculator variable symbols and units as user-facing text', () => {
    renderApp('/calculators/dimensionless-numbers/reynolds-number')

    expect(screen.getAllByText('μ').length).toBeGreaterThan(0)
    expect(screen.getAllByText('ρ').length).toBeGreaterThan(0)
    expect(screen.getAllByText('kg/m³').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pa·s').length).toBeGreaterThan(0)
  })

  it('renders the formula library without exposing source links', () => {
    renderApp('/formulas')

    expect(screen.getByRole('heading', { name: 'CFD 公式库' })).toBeInTheDocument()
    expect(screen.getAllByText('Reynolds 数').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: '复制 LaTeX' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('来源')).not.toBeInTheDocument()
  })
})
