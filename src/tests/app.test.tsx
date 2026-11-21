import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

function selectByLabel(label: string) {
  const labelElement = screen.getByText(label).closest('label')
  const select = labelElement?.querySelector('select')

  if (!select) {
    throw new Error(`Missing select for ${label}`)
  }

  return select
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

  it('renders y+ mode-specific fields and switches the visible input set', () => {
    renderApp('/calculators/near-wall-mesh/y-plus-first-layer-height')

    expect(
      screen.getByRole('button', { name: /初始估算：根据速度和特征长度/ }),
    ).toHaveClass('active')
    expect(screen.getByText('流动场景')).toBeInTheDocument()
    expect(screen.getByText('密度 ρ')).toBeInTheDocument()
    expect(screen.getByText('动力黏度 μ')).toBeInTheDocument()
    expect(screen.getByText('参考速度 U')).toBeInTheDocument()
    expect(screen.getByText('特征长度 L')).toBeInTheDocument()
    expect(screen.getByText('平板摩擦系数公式')).toBeInTheDocument()
    expect(screen.queryByText('管道摩阻估算方式')).not.toBeInTheDocument()
    expect(screen.queryByText('管径或水力直径 D')).not.toBeInTheDocument()
    expect(screen.queryByText('壁面剪切应力 τw')).not.toBeInTheDocument()
    expect(screen.getByText('公共公式')).toBeInTheDocument()
    expect(screen.getByText('当前模式公式')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /修正计算：已知壁面剪切应力/ }),
    )

    expect(screen.getByText('壁面剪切应力 τw')).toBeInTheDocument()
    expect(screen.queryByText('参考速度 U')).not.toBeInTheDocument()
    expect(screen.queryByText('特征长度 L')).not.toBeInTheDocument()
    expect(screen.queryByText('边界层推荐方式')).toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: /自定义摩擦：已知摩擦系数/ }),
    )

    expect(screen.getByText('壁面摩擦系数 Cf')).toBeInTheDocument()
    expect(screen.getByText('参考速度 U')).toBeInTheDocument()
    expect(screen.queryByText('壁面剪切应力 τw')).not.toBeInTheDocument()
  })

  it('switches y+ conditional inputs for pipe friction and grid recommendation modes', () => {
    renderApp('/calculators/near-wall-mesh/y-plus-first-layer-height')

    fireEvent.change(selectByLabel('流动场景'), {
      target: { value: 'internal-pipe' },
    })

    expect(screen.getByText('管道摩阻估算方式')).toBeInTheDocument()
    expect(screen.getByText('管径或水力直径 D')).toBeInTheDocument()
    expect(screen.queryByText('平板摩擦系数公式')).not.toBeInTheDocument()
    expect(screen.queryByText('特征长度 L')).not.toBeInTheDocument()
    expect(screen.queryByText('Darcy 摩阻系数 f')).not.toBeInTheDocument()

    fireEvent.change(selectByLabel('管道摩阻估算方式'), {
      target: { value: 'pipe-custom-darcy' },
    })
    expect(screen.getByText('Darcy 摩阻系数 f')).toBeInTheDocument()
    expect(screen.queryByText('Fanning 摩擦系数 Cf')).not.toBeInTheDocument()

    fireEvent.change(selectByLabel('管道摩阻估算方式'), {
      target: { value: 'pipe-custom-fanning' },
    })
    expect(screen.getByText('Fanning 摩擦系数 Cf')).toBeInTheDocument()
    expect(screen.queryByText('Darcy 摩阻系数 f')).not.toBeInTheDocument()

    expect(screen.queryByText('目标总厚度 H')).not.toBeInTheDocument()
    fireEvent.change(selectByLabel('边界层推荐方式'), {
      target: { value: 'target-total-thickness' },
    })
    expect(screen.getByText('目标总厚度 H')).toBeInTheDocument()

    fireEvent.change(selectByLabel('边界层推荐方式'), {
      target: { value: 'fixed-layer-count' },
    })
    expect(screen.getByText('层数 n')).toBeInTheDocument()
    expect(screen.queryByText('目标总厚度 H')).not.toBeInTheDocument()
  })

  it('renders the boundary-layer recommendation directly after y+ calculation', () => {
    renderApp('/calculators/near-wall-mesh/y-plus-first-layer-height')

    fireEvent.click(screen.getByRole('button', { name: '开始计算' }))

    expect(screen.getByRole('heading', { name: '边界层网格推荐方案' })).toBeInTheDocument()
    expect(screen.getByText('实际总厚度 Hn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '复制表格' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '复制 CSV' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '复制简要方案' })).toBeInTheDocument()
  })

  it('copies raw LaTeX from the y+ formula area', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    renderApp('/calculators/near-wall-mesh/y-plus-first-layer-height')

    fireEvent.click(screen.getAllByRole('button', { name: '复制 LaTeX' })[0])

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(String.raw`y^+=\frac{yu_\tau}{\nu}`)
    })
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
    expect(screen.getByText('壁面剪切应力与壁面摩擦系数')).toBeInTheDocument()
    expect(screen.getByText('第一层完整厚度近似')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: '复制 LaTeX' }).length).toBeGreaterThan(0)
    expect(screen.queryByText('来源')).not.toBeInTheDocument()
    expect(screen.queryByText('适用范围')).not.toBeInTheDocument()
    expect(screen.queryByText('注意事项')).not.toBeInTheDocument()
  })

  it('renders a workbench with the task page, viewport, console and teaching guide', () => {
    renderApp('/fluent-guide')

    expect(screen.getByRole('heading', { name: 'Fluent Solver Workbench' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Command tabs' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: 'Outline' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Task Page' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Graphics' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Console' })).toBeInTheDocument()
    expect(screen.getByRole('complementary', { name: '控件说明' })).toBeInTheDocument()
    expect(screen.getByText('X Gravity')).toBeInTheDocument()

    const language = screen.getByRole('combobox', { name: '界面语言' })
    fireEvent.change(language, { target: { value: 'both' } })
    expect(screen.getByRole('button', { name: 'File · 文件' })).toBeInTheDocument()
    fireEvent.change(language, { target: { value: 'zh' } })
    expect(screen.getByRole('heading', { name: 'Fluent 求解教学工作台' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: '任务页' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '文件' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '教学说明' }))
    expect(screen.queryByRole('complementary', { name: '控件说明' })).not.toBeInTheDocument()
  })

  it('updates the teaching guide from tree, ribbon, task controls, graphics tools and console', () => {
    renderApp('/fluent-guide')

    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))

    fireEvent.click(guide.getByRole('button', { name: 'Pressure-Based' }))
    expect(task.getByRole('button', { name: 'Pressure-Based' })).toHaveFocus()

    const boundary = outline.getByRole('button', { name: 'Boundary Conditions' })
    fireEvent.click(boundary)
    expect(boundary).toHaveAttribute('aria-current', 'true')
    expect(guide.getByRole('heading', { name: '边界条件' })).toBeInTheDocument()
    expect(screen.getByText('设置 / 边界条件')).toBeInTheDocument()

    fireEvent.click(ribbon.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('heading', { name: '网格检查' })).toBeInTheDocument()
    expect(screen.getByText('Ribbon → 区域 → 网格')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    fireEvent.click(task.getByRole('button', { name: 'Pressure-Based' }))
    expect(screen.getByRole('heading', { name: '基于压力求解器' })).toBeInTheDocument()
    expect(screen.getByText('任务页面 → 一般 → 求解器 → 类型')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Select' }))
    expect(screen.getByRole('heading', { name: '图形窗口选择工具' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Console' }))
    expect(screen.getByRole('heading', { name: '控制台' })).toBeInTheDocument()
    expect(screen.getByText('底部控制台')).toBeInTheDocument()
  })

  it('opens and closes teaching dialogs and updates the explanation from dialog controls', () => {
    renderApp('/fluent-guide')

    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const units = task.getByRole('button', { name: 'Units' })
    fireEvent.click(units)
    const dialog = screen.getByRole('dialog', { name: 'Units' })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '单位设置' })).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: /Length Unit/ }))
    expect(screen.getByRole('heading', { name: '长度单位' })).toBeInTheDocument()
    expect(screen.getByText('模拟窗口 → 单位设置')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Units' }))
    expect(screen.queryByRole('dialog', { name: 'Units' })).not.toBeInTheDocument()
    expect(units).toHaveFocus()

    fireEvent.click(task.getByRole('button', { name: 'Report Quality' }))
    const quality = screen.getByRole('dialog', { name: 'Mesh Quality Report' })
    fireEvent.click(within(quality).getByRole('button', { name: /Min. Orthogonal Quality/ }))
    expect(screen.getByRole('heading', { name: '最小正交质量' })).toBeInTheDocument()
  })

  it('shows action-oriented Fluent explanations and deeper model dialog options', () => {
    renderApp('/fluent-guide')

    expect(screen.getByText('是什么')).toBeInTheDocument()
    expect(screen.getByText('建议')).toBeInTheDocument()
    expect(screen.getByText('检查要点')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Physics' }))
    fireEvent.click(screen.getByRole('button', { name: 'Energy' }))
    expect(screen.getByRole('dialog', { name: 'Energy Model' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Enable Energy' }))
    expect(screen.getByRole('heading', { name: '启用 Energy' })).toBeInTheDocument()
    expect(screen.getByText('适合存在热传导、热通量、温度边界或可压缩热效应的算例。')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close Energy Model' }))
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(task.getByRole('button', { name: 'Velocity Inlet' }))
    expect(screen.getByRole('dialog', { name: 'Velocity Inlet' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Turbulence Specification/ }))
    expect(screen.getByRole('heading', { name: 'Turbulence Specification' })).toBeInTheDocument()
    expect(screen.getByText('检查入口湍流强度、长度尺度或水力直径是否来自工况估算。')).toBeInTheDocument()
  })

  it('restores the parent teaching window and focus after closing a nested window', () => {
    renderApp('/fluent-guide')

    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.click(outline.getByRole('button', { name: 'Materials' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(task.getByRole('button', { name: 'Manage Materials' }))
    expect(screen.getByRole('dialog', { name: 'Manage Materials' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Create/Edit' }))
    expect(screen.getByRole('dialog', { name: 'Create/Edit Materials' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Density Method/ }))
    expect(screen.getByRole('heading', { name: 'Density Method' })).toBeInTheDocument()
    expect(screen.getByText('材料密度方法决定密度是常数、理想气体、分段函数还是其他表达。')).toBeInTheDocument()

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    const parent = screen.getByRole('dialog', { name: 'Manage Materials' })
    expect(within(parent).getByRole('button', { name: 'Create/Edit' })).toHaveFocus()
  })

  it('locates dialog controls from Chinese search terms and reveals filtered outline nodes', () => {
    renderApp('/fluent-guide')

    const search = within(screen.getByRole('search'))
    const field = search.getByRole('searchbox', { name: 'Quick Search' })
    fireEvent.change(field, { target: { value: '最小正交质量' } })
    fireEvent.click(search.getByRole('button', { name: /Min. Orthogonal Quality/ }))
    const dialog = screen.getByRole('dialog', { name: 'Mesh Quality Report' })
    expect(within(dialog).getByRole('button', { name: /Min. Orthogonal Quality/ })).toHaveFocus()

    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.click(outline.getByRole('button', { name: 'Collapse all' }))
    fireEvent.change(outline.getByRole('searchbox'), { target: { value: '边界条件' } })
    expect(outline.getByRole('button', { name: 'Boundary Conditions' })).toBeInTheDocument()
    expect(outline.queryByRole('button', { name: 'Materials' })).not.toBeInTheDocument()
    fireEvent.change(field, { target: { value: 'Run Calculation' } })
    fireEvent.click(search.getByRole('button', { name: 'Run Calculation', description: 'Outline' }))
    expect(outline.getByRole('searchbox')).toHaveValue('')
    expect(outline.getByRole('button', { name: 'Run Calculation' })).toHaveFocus()
  })
})
