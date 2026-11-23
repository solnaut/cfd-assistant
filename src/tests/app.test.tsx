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
  it('renders the new cover, keeps workspace shortcuts, and starts a configured session', () => {
    renderApp()

    expect(
      screen.getByRole('heading', {
        name: '从流动与传热，到 Fluent 实操',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /均匀来流绕圆柱的流线/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /阅读热流体工程图解/ })).toHaveAttribute('href', '/knowledge')
    expect(
      screen.getByRole('heading', { name: 'Fluent Meshing 网格工作台' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Fluent Solution 求解工作台' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: '参数计算' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Fluent 功能导览' }).length,
    ).toBeGreaterThan(0)

    const launcher = within(
      screen.getByRole('complementary', { name: 'Fluent Launcher 配置器' }),
    )
    expect(
      launcher.getByRole('link', { name: /启动 Fluent Meshing/ }),
    ).toHaveAttribute('href', '/fluent-meshing?dim=3d&dp=1&np=4')

    fireEvent.click(launcher.getByRole('button', { name: /Solution/ }))
    fireEvent.click(launcher.getByRole('button', { name: '2D' }))
    expect(
      launcher.getByRole('link', { name: /启动 Fluent Solution/ }),
    ).toHaveAttribute('href', '/fluent-guide?dim=2d&dp=0&np=4')
  })

  it('starts a 2D Solution session from the dedicated launcher with its selected settings', () => {
    renderApp('/fluent-launcher')
    const launcher = within(screen.getByRole('complementary', { name: 'Fluent Launcher 配置器' }))
    expect(launcher.getByRole('heading', { name: 'Fluent Launcher', level: 1 })).toBeInTheDocument()
    const precision = launcher.getByRole('checkbox', { name: /Double Precision/ })
    expect(precision).toBeChecked()
    expect(precision).toBeDisabled()
    const meshingProcesses = launcher.getByRole('spinbutton', { name: 'Meshing Processes' })
    fireEvent.change(meshingProcesses, { target: { value: '7' } })
    expect(launcher.getByText('7', { selector: 'strong' })).toBeInTheDocument()

    fireEvent.click(launcher.getByRole('button', { name: /Solution/ }))
    expect(precision).toBeEnabled()
    expect(precision).not.toBeChecked()
    fireEvent.click(precision)
    fireEvent.click(launcher.getByRole('button', { name: '2D' }))
    const solverProcesses = launcher.getByRole('spinbutton', { name: 'Solver Processes' })
    expect(solverProcesses).toHaveValue(7)
    fireEvent.change(solverProcesses, { target: { value: '0' } })
    expect(launcher.getByRole('button', { name: '启动 Fluent Solution' })).toBeDisabled()
    fireEvent.change(solverProcesses, { target: { value: '9' } })
    fireEvent.click(launcher.getByRole('link', { name: '启动 Fluent Solution' }))

    expect(screen.getByText(/\[2d, dp, pbns, np=9\]/)).toBeInTheDocument()
    const graphics = within(screen.getByRole('region', { name: 'Graphics' }))
    expect(graphics.getByRole('img', { name: /2D Elbow geometry/ })).toBeInTheDocument()
    expect(graphics.queryByText('Z')).not.toBeInTheDocument()
  })

  it('keeps the Meshing session double precision even with an older single-precision link', () => {
    renderApp('/fluent-meshing?dim=3d&dp=0&np=6')
    expect(screen.getByRole('heading', { name: /Fluent Meshing Workbench \[3d, dp, meshing\]/ })).toBeInTheDocument()
    expect(screen.getByText(/Watertight Geometry · np=6/)).toBeInTheDocument()
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

  it('accepts a valid negative Celsius input and clears stale results when inputs change', () => {
    renderApp('/calculators/flow-piping/ideal-gas-speed-of-sound')
    const panel = within(screen.getByRole('form', { name: 'Calculator input panel' }))
    const result = within(screen.getByRole('complementary', { name: 'Calculator result panel' }))
    const temperature = panel.getByRole('spinbutton', { name: /绝对温度/ })
    fireEvent.change(panel.getByRole('combobox', { name: '绝对温度单位' }), { target: { value: 'degC' } })
    fireEvent.change(temperature, { target: { value: '-20' } })
    expect(temperature).toHaveAttribute('min', '-273.15')
    fireEvent.click(panel.getByRole('button', { name: '开始计算' }))
    expect(result.getByText(/318\.9.* m\/s/)).toBeInTheDocument()
    fireEvent.change(temperature, { target: { value: '' } })
    expect(result.queryByText(/318\.9.* m\/s/)).not.toBeInTheDocument()
    fireEvent.click(panel.getByRole('button', { name: '开始计算' }))
    expect(result.getByText('请填写绝对温度。')).toBeInTheDocument()
  })

  it('provides a route back to the home page from an unknown address', () => {
    renderApp('/missing-workbench')
    expect(screen.getByRole('heading', { name: '找不到这个页面' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '返回首页' })).toHaveAttribute('href', '/')
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
    expect(task.getByRole('radio', { name: 'Pressure-Based' })).toHaveFocus()

    const boundary = outline.getByRole('button', { name: 'Boundary Conditions' })
    fireEvent.click(boundary)
    expect(boundary).toHaveAttribute('aria-current', 'true')
    expect(guide.getByRole('heading', { name: '边界条件' })).toBeInTheDocument()
    expect(screen.getByText('设置 / 边界条件')).toBeInTheDocument()

    fireEvent.click(ribbon.getByRole('button', { name: 'Check' }))
    expect(screen.getByRole('heading', { name: '网格检查' })).toBeInTheDocument()
    expect(screen.getByText('Ribbon → 区域 → 网格')).toBeInTheDocument()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })

    fireEvent.click(task.getByRole('radio', { name: 'Pressure-Based' }))
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

    fireEvent.click(within(dialog).getByRole('combobox', { name: /Length Unit/ }))
    expect(screen.getByRole('heading', { name: '长度单位' })).toBeInTheDocument()
    expect(screen.getByText('模拟窗口 → 单位设置')).toBeInTheDocument()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Close Units' }))
    expect(screen.queryByRole('dialog', { name: 'Units' })).not.toBeInTheDocument()
    expect(units).toHaveFocus()

    fireEvent.click(task.getByRole('button', { name: 'Report Quality' }))
    const quality = screen.getByRole('dialog', { name: 'Mesh Quality Report' })
    fireEvent.click(within(quality).getByRole('textbox', { name: /Min. Orthogonal Quality/ }))
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

    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Energy' }))
    expect(screen.getByRole('heading', { name: '启用 Energy' })).toBeInTheDocument()
    expect(screen.getByText('适合存在热传导、热通量、温度边界或可压缩热效应的算例。')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close Energy Model' }))
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(task.getByRole('button', { name: 'Velocity Inlet' }))
    const velocityDialog = screen.getByRole('dialog', { name: 'Velocity Inlet' })
    expect(velocityDialog).toBeInTheDocument()

    fireEvent.click(within(velocityDialog).getByRole('combobox', { name: /Turbulence Specification/ }))
    expect(screen.getByRole('heading', { name: 'Turbulence Specification' })).toBeInTheDocument()
    expect(screen.getByText('检查入口湍流强度、长度尺度或水力直径是否来自工况估算。')).toBeInTheDocument()
  })

  it('compares steady and transient, and updates the instructions with the selected mode', () => {
    renderApp('/fluent-guide')
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    fireEvent.click(task.getByRole('radio', { name: 'Steady' }))
    expect(guide.getByText(/迭代步数不能换算为真实秒数/)).toBeInTheDocument()
    for (const name of ['区别与选法', '操作顺序', '算例示范']) {
      expect(guide.getByRole('heading', { name })).toBeInTheDocument()
    }
    fireEvent.click(task.getByRole('radio', { name: 'Transient' }))
    expect(guide.getByText(/时间步长描述实际时间推进的增量/)).toBeInTheDocument()
    expect(guide.getByText(/核心和表面温度/)).toBeInTheDocument()
  })

  it('restores the parent teaching window and focus after closing a nested window', () => {
    renderApp('/fluent-guide')

    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.click(outline.getByRole('button', { name: 'Materials' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(task.getByRole('button', { name: 'Manage Materials' }))
    expect(screen.getByRole('dialog', { name: 'Manage Materials' })).toBeInTheDocument()

    fireEvent.click(within(screen.getByRole('dialog', { name: 'Manage Materials' })).getByRole('button', { name: 'Create/Edit' }))
    const createEditDialog = screen.getByRole('dialog', { name: 'Create/Edit Materials' })
    expect(createEditDialog).toBeInTheDocument()

    fireEvent.click(within(createEditDialog).getByRole('combobox', { name: /Density Method/ }))
    expect(screen.getByRole('heading', { name: 'Density Method' })).toBeInTheDocument()
    expect(screen.getByText('材料密度方法决定密度是常数、理想气体、分段函数还是其他表达。')).toBeInTheDocument()

    fireEvent.keyDown(createEditDialog, { key: 'Escape' })
    const parent = screen.getByRole('dialog', { name: 'Manage Materials' })
    expect(within(parent).getByRole('button', { name: 'Create/Edit' })).toHaveFocus()
  })

  it('opens the correct tab and rebuilds the parent window for direct links', () => {
    const app = renderApp('/fluent-guide?locate=mesh-swap-dihedral')
    const smoothSwap = within(screen.getByRole('dialog', { name: 'Smooth/Swap Mesh' }))
    expect(smoothSwap.getByRole('tab', { name: 'Swap' })).toHaveAttribute('aria-selected', 'true')
    expect(smoothSwap.getByRole('textbox', { name: 'Min Dihedral Angle (deg)' })).toHaveFocus()
    app.unmount()

    renderApp('/fluent-guide?locate=material-density-method')
    const editor = screen.getByRole('dialog', { name: 'Create/Edit Materials' })
    expect(within(editor).getByRole('combobox', { name: 'Density Method' })).toHaveFocus()
    fireEvent.keyDown(editor, { key: 'Escape' })
    const parent = within(screen.getByRole('dialog', { name: 'Manage Materials' }))
    expect(parent.getByRole('button', { name: 'Create/Edit' })).toHaveFocus()
  })

  it('preserves the DPM prerequisites when searching for a nested DEM setting', () => {
    renderApp('/fluent-guide?locate=dpm-dem-max-speed')
    const dpm = within(screen.getByRole('dialog', { name: 'Discrete Phase Model' }))
    expect(screen.queryByRole('dialog', { name: 'DEM Collisions' })).not.toBeInTheDocument()
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    expect(guide.queryByText('此设置的开启条件')).toBeInTheDocument()
    fireEvent.click(dpm.getByRole('checkbox', { name: 'Enable Discrete Phase Model' }))
    fireEvent.click(dpm.getByRole('checkbox', { name: 'Unsteady Particle Tracking' }))

    const search = within(screen.getByRole('search'))
    function locateVelocity() {
      fireEvent.change(search.getByRole('searchbox', { name: 'Quick Search' }), { target: { value: 'Maximum Particle Velocity' } })
      fireEvent.click(search.getByRole('button', { name: 'Maximum Particle Velocity' }))
    }
    locateVelocity()
    expect(screen.queryByRole('dialog', { name: 'DEM Collisions' })).not.toBeInTheDocument()
    expect(dpm.getByRole('tab', { name: 'Physical Models' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(dpm.getByRole('checkbox', { name: 'DEM Collision' }))
    locateVelocity()
    const dem = screen.getByRole('dialog', { name: 'DEM Collisions' })
    expect(within(dem).getByRole('textbox', { name: 'Maximum Particle Velocity' })).toHaveFocus()
    fireEvent.keyDown(dem, { key: 'Escape' })
    expect(dpm.getByRole('button', { name: 'DEM Collisions…' })).toHaveFocus()
  })

  it('locates dialog controls from Chinese search terms and reveals filtered outline nodes', () => {
    renderApp('/fluent-guide')

    const search = within(screen.getByRole('search'))
    const field = search.getByRole('searchbox', { name: 'Quick Search' })
    fireEvent.change(field, { target: { value: '最小正交质量' } })
    fireEvent.click(search.getByRole('button', { name: /Min. Orthogonal Quality/ }))
    const dialog = screen.getByRole('dialog', { name: 'Mesh Quality Report' })
    expect(within(dialog).getByRole('textbox', { name: /Min. Orthogonal Quality/ })).toHaveFocus()

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

  it('explains the current Coupled option according to the control located by search', () => {
    renderApp('/fluent-guide')
    const search = within(screen.getByRole('search'))
    const field = search.getByRole('searchbox', { name: 'Quick Search' })
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))

    fireEvent.change(field, { target: { value: 'SIMPLE / Coupled' } })
    fireEvent.click(search.getByRole('button', { name: 'SIMPLE / Coupled' }))
    const methods = within(screen.getByRole('dialog', { name: 'Solution Methods' }))
    expect(guide.getByText('当前选项要点：SIMPLE')).toBeInTheDocument()
    fireEvent.change(methods.getByRole('combobox', { name: 'SIMPLE / Coupled' }), { target: { value: 'Coupled' } })
    expect(guide.getByText(/联立求解动量方程/)).toBeInTheDocument()

    fireEvent.change(field, { target: { value: 'Thermal Condition' } })
    fireEvent.click(search.getByRole('button', { name: 'Thermal Condition', description: 'Wall' }))
    expect(guide.queryByText('当前选项要点：Coupled')).not.toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: '定位 Enable Energy' }))
    const energy = within(screen.getByRole('dialog', { name: 'Energy Model' }))
    expect(energy.getByRole('checkbox', { name: 'Enable Energy' })).not.toBeChecked()
    fireEvent.click(energy.getByRole('checkbox', { name: 'Enable Energy' }))

    fireEvent.change(field, { target: { value: 'Thermal Condition' } })
    fireEvent.click(search.getByRole('button', { name: 'Thermal Condition', description: 'Wall' }))
    const wall = within(screen.getByRole('dialog', { name: 'Wall' }))
    expect(guide.getByText('当前选项要点：Heat Flux')).toBeInTheDocument()
    fireEvent.change(wall.getByRole('combobox', { name: 'Thermal Condition' }), { target: { value: 'Coupled' } })
    expect(guide.getByText(/wall 与 wall-shadow 两侧热耦合/)).toBeInTheDocument()
    expect(guide.queryByText(/联立求解动量方程/)).not.toBeInTheDocument()
  })

  it('guides a learner from a hidden Courant Number to the explicit VOF controls', () => {
    renderApp('/fluent-guide')
    const search = within(screen.getByRole('search'))
    const field = search.getByRole('searchbox', { name: 'Quick Search' })
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))

    fireEvent.change(field, { target: { value: 'Courant Number' } })
    fireEvent.click(search.getByRole('button', { name: 'Courant Number', description: 'Multiphase Model' }))
    let model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    expect(model.getByRole('combobox', { name: 'Model' })).toHaveValue('Off')
    expect(model.queryByRole('textbox', { name: 'Courant Number' })).not.toBeInTheDocument()
    expect(guide.getByText('将 Multiphase Model 设为 Volume of Fluid (VOF) 或 Eulerian')).toBeInTheDocument()
    expect(guide.getByText('将 Volume Fraction Formulation 设为 Explicit')).toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: '定位 Transient' }))
    const transient = screen.getByRole('radio', { name: 'Transient' })
    expect(transient).toHaveFocus()
    expect(transient).not.toBeChecked()
    fireEvent.click(transient)

    fireEvent.change(field, { target: { value: 'Courant Number' } })
    fireEvent.click(search.getByRole('button', { name: 'Courant Number', description: 'Multiphase Model' }))
    expect(guide.queryByRole('button', { name: '定位 Transient' })).not.toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: '定位 Multiphase Model' }))
    model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    const modelSelect = model.getByRole('combobox', { name: 'Model' })
    expect(modelSelect).toHaveFocus()
    fireEvent.change(modelSelect, { target: { value: 'Volume of Fluid (VOF)' } })
    expect(guide.getByText(/各相共享动量方程/)).toBeInTheDocument()

    fireEvent.change(model.getByRole('combobox', { name: 'Volume Fraction Formulation' }), { target: { value: 'Implicit' } })
    expect(guide.getByText(/可用于稳态或瞬态/)).toBeInTheDocument()
    expect(model.queryByRole('textbox', { name: 'Courant Number' })).not.toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Volume Fraction Formulation' }), { target: { value: 'Explicit' } })
    expect(guide.getByText(/只在瞬态可选/)).toBeInTheDocument()
    fireEvent.change(field, { target: { value: 'Courant Number' } })
    fireEvent.click(search.getByRole('button', { name: 'Courant Number', description: 'Multiphase Model' }))
    expect(model.getByRole('textbox', { name: 'Courant Number' })).toHaveFocus()
    expect(guide.queryByText('此设置的开启条件')).not.toBeInTheDocument()
  })

  it('explains prerequisites inherited from the Eulerian heat transfer tab', () => {
    renderApp('/fluent-guide')
    const search = within(screen.getByRole('search'))
    const field = search.getByRole('searchbox', { name: 'Quick Search' })
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    function locateHeatTransfer() {
      fireEvent.change(field, { target: { value: 'Heat Transfer Coefficient' } })
      fireEvent.click(search.getByRole('button', { name: 'Heat Transfer Coefficient', description: 'Multiphase Model' }))
    }

    locateHeatTransfer()
    expect(guide.getByText('将 Multiphase Model 设为 Eulerian')).toBeInTheDocument()
    expect(guide.getByText('启用 Enable Energy')).toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: '定位 Multiphase Model' }))
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Eulerian' } })
    locateHeatTransfer()
    expect(guide.queryByText('将 Multiphase Model 设为 Eulerian')).not.toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: '定位 Enable Energy' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Energy' }))

    locateHeatTransfer()
    const activeModel = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    expect(activeModel.getByRole('tab', { name: 'Heat' })).toHaveAttribute('aria-selected', 'true')
    const heatTransfer = activeModel.getByRole('combobox', { name: 'Heat Transfer Coefficient' })
    expect(heatTransfer).toHaveFocus()
    fireEvent.change(heatTransfer, { target: { value: 'constant' } })
    expect(guide.getByText(/为当前相对输入固定的传热系数/)).toBeInTheDocument()
    expect(activeModel.getByRole('textbox', { name: 'Constant Heat Transfer Coefficient' })).toBeInTheDocument()
  })

  it('supports cross-module state coupling, calculate warnings, calculator links, and troubleshooting jumps', () => {
    renderApp('/fluent-guide')

    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consoleRegion = within(screen.getByRole('region', { name: 'Console' }))

    // Switch Steady -> Transient and verify Run Calculation exposes Time Step Size
    fireEvent.click(task.getByRole('radio', { name: 'Transient' }))
    fireEvent.click(outline.getByRole('button', { name: 'Run Calculation' }))
    expect(task.getByRole('textbox', { name: 'Time Step Size' })).toBeInTheDocument()

    // Calculate before Initialize logs a warning
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consoleRegion.getByText(/Flow field is not initialized/i)).toBeInTheDocument()

    // Initialize then Calculate runs and switches viewport to Scaled Residuals
    fireEvent.click(outline.getByRole('button', { name: 'Initialization' }))
    fireEvent.click(task.getByRole('button', { name: 'Initialize' }))
    fireEvent.click(outline.getByRole('button', { name: 'Run Calculation' }))
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consoleRegion.getByText(/Teaching Demo completed/i)).toBeInTheDocument()

    // Viscous link shows related y+ calculator
    fireEvent.click(screen.getByRole('button', { name: 'Physics' }))
    fireEvent.click(screen.getByRole('button', { name: 'Viscous' }))
    expect(screen.getByRole('link', { name: /y\+ 与第一层网格高度/ })).toHaveAttribute(
      'href',
      '/calculators/near-wall-mesh/y-plus-first-layer-height',
    )

    // Troubleshooting tab jumps to target control
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    fireEvent.click(guide.getByRole('button', { name: 'Troubleshooting' }))
    expect(guide.getByRole('heading', { name: 'Fluent 常见报错与收敛排查' })).toBeInTheDocument()
    fireEvent.click(guide.getByRole('button', { name: /定位 Solution Controls/ }))
    expect(screen.getByRole('dialog', { name: 'Solution Controls' })).toBeInTheDocument()
  })
})

describe('Fluent workbench interaction branches', () => {
  it('switches File recording actions and preserves the case when replacing the mesh', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'File' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Export' }))
    expect(ribbon.queryByRole('button', { name: 'During Calculation' })).not.toBeInTheDocument()
    fireEvent.click(ribbon.getByRole('button', { name: 'Write' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Start Journal…' }))
    const recording = within(screen.getByRole('dialog', { name: 'Write Start Journal' }))
    fireEvent.change(recording.getByRole('textbox', { name: 'File Name' }), { target: { value: 'audit.jou' } })
    fireEvent.click(recording.getByRole('button', { name: 'OK' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Write' }))
    expect(ribbon.queryByRole('button', { name: 'Start Journal…' })).not.toBeInTheDocument()
    fireEvent.click(ribbon.getByRole('button', { name: 'Stop Journal' }))
    expect(consolePane.getByText(/Stopped journal recording "audit\.jou"/)).toBeInTheDocument()

    fireEvent.click(ribbon.getByRole('button', { name: 'Read' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Case & Data…' }))
    const caseData = within(screen.getByRole('dialog', { name: 'Read Case & Data' }))
    fireEvent.change(caseData.getByRole('textbox', { name: 'File Name' }), { target: { value: 'elbow.cas.h5' } })
    fireEvent.click(caseData.getByRole('button', { name: 'OK' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Read' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Mesh…' }))
    const mesh = within(screen.getByRole('dialog', { name: 'Read Mesh' }))
    fireEvent.change(mesh.getByRole('combobox', { name: 'Read Mesh Options' }), { target: { value: 'Discard Data, Replace Mesh' } })
    fireEvent.click(mesh.getByRole('checkbox', { name: 'Show Scale Mesh Panel After Replacing Mesh' }))
    fireEvent.change(mesh.getByRole('textbox', { name: 'File Name' }), { target: { value: 'fine.msh.h5' } })
    fireEvent.click(mesh.getByRole('button', { name: 'OK' }))
    expect(screen.getByRole('dialog', { name: 'Scale Mesh' })).toBeInTheDocument()
    expect(screen.getByText('Case: elbow.cas.h5')).toBeInTheDocument()
    expect(screen.queryByText('Data: elbow.dat.h5')).not.toBeInTheDocument()
    expect(screen.getByText('Mesh file: fine.msh.h5')).toBeInTheDocument()
  })

  it('shows corrected outlet inputs and enables the Thermal tab by keyboard', () => {
    renderApp('/fluent-guide')
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    fireEvent.click(task.getByRole('button', { name: 'Mass-Flow Outlet' }))
    const outlet = within(screen.getByRole('dialog', { name: 'Mass-Flow Outlet' }))
    fireEvent.change(outlet.getByRole('combobox', { name: 'Mass Flow Specification Method' }), {
      target: { value: 'Exit Corrected Mass Flow Rate' },
    })
    expect(outlet.getByRole('textbox', { name: /ECMF Reference Temperature/ })).toBeInTheDocument()
    expect(outlet.queryByRole('textbox', { name: /Average Mass Flux/ })).not.toBeInTheDocument()
    fireEvent.click(outlet.getByRole('button', { name: 'Close Mass-Flow Outlet' }))
    fireEvent.click(task.getByRole('button', { name: 'Wall' }))
    const wall = within(screen.getByRole('dialog', { name: 'Wall' }))
    fireEvent.keyDown(wall.getByRole('tab', { name: 'Momentum' }), { key: 'ArrowRight' })
    expect(wall.getByRole('tab', { name: 'Thermal (Off)' })).toHaveAttribute('aria-selected', 'true')
    expect(wall.getByRole('tab', { name: 'Thermal (Off)' })).toHaveFocus()
  })

  it('switches between periodic and adaptive time advancement and validates the settings window', () => {
    renderApp('/fluent-guide')
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    fireEvent.click(task.getByRole('radio', { name: 'Transient' }))
    fireEvent.click(outline.getByRole('button', { name: 'Initialization' }))
    fireEvent.click(task.getByRole('button', { name: 'Initialize' }))
    fireEvent.click(outline.getByRole('button', { name: 'Run Calculation' }))
    fireEvent.change(task.getByRole('combobox', { name: 'Method' }), { target: { value: 'Period-Based' } })
    expect(task.queryByRole('textbox', { name: 'Time Step Size' })).not.toBeInTheDocument()
    fireEvent.change(task.getByRole('textbox', { name: 'Period (s)' }), { target: { value: '2' } })
    fireEvent.change(task.getByRole('textbox', { name: 'Time Steps per Period' }), { target: { value: '8' } })
    fireEvent.change(task.getByRole('textbox', { name: 'Total Periods' }), { target: { value: '2' } })
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consolePane.getByText(/Time Step Size = 0\.25 s/)).toBeInTheDocument()
    expect(consolePane.getByText(/completed 16 time steps/)).toBeInTheDocument()

    fireEvent.change(task.getByRole('combobox', { name: 'Type' }), { target: { value: 'Adaptive' } })
    fireEvent.change(task.getByRole('combobox', { name: 'Method' }), { target: { value: 'Error-Based' } })
    expect(task.getByRole('textbox', { name: 'Error Tolerance' })).toBeInTheDocument()
    expect(task.queryByRole('textbox', { name: 'Courant Number' })).not.toBeInTheDocument()
    fireEvent.click(task.getByRole('button', { name: 'Settings…' }))
    const adaptive = within(screen.getByRole('dialog', { name: 'Adaptive Time Stepping' }))
    fireEvent.change(adaptive.getByRole('textbox', { name: 'Minimum Time Step Size (s)' }), { target: { value: '0.01' } })
    fireEvent.click(adaptive.getByRole('button', { name: 'OK' }))
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consolePane.getByText(/Check the adaptive size bounds/)).toBeInTheDocument()
    fireEvent.change(task.getByRole('textbox', { name: 'Initial Time Step Size' }), { target: { value: '0.02' } })
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consolePane.getByText(/Error-Based: initial step 0\.02 s/)).toBeInTheDocument()
  })

  it('separates initialization method, FMG, and transient calculation', () => {
    renderApp('/fluent-guide')
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    fireEvent.click(task.getByRole('radio', { name: 'Transient' }))
    fireEvent.click(outline.getByRole('button', { name: 'Initialization' }))
    expect(task.queryByRole('combobox', { name: 'Compute From' })).not.toBeInTheDocument()
    fireEvent.click(task.getByRole('radio', { name: 'Standard Initialization' }))
    fireEvent.change(task.getByRole('combobox', { name: 'Compute From' }), { target: { value: 'outlet' } })
    expect(consolePane.queryByText(/Initialization complete/)).not.toBeInTheDocument()

    fireEvent.click(task.getByRole('button', { name: 'FMG Initialization' }))
    let fmg = within(screen.getByRole('dialog', { name: 'FMG Initialization' }))
    fireEvent.click(fmg.getByRole('button', { name: 'Initialize' }))
    expect(consolePane.getByText(/FMG requires an initial flow field/)).toBeInTheDocument()
    fireEvent.click(fmg.getByRole('button', { name: 'Close FMG Initialization' }))
    fireEvent.click(task.getByRole('button', { name: 'Initialize' }))
    expect(consolePane.getByText(/Standard Initialization: initial field from outlet/)).toBeInTheDocument()
    fireEvent.click(task.getByRole('button', { name: 'FMG Initialization' }))
    fmg = within(screen.getByRole('dialog', { name: 'FMG Initialization' }))
    fireEvent.change(fmg.getByRole('textbox', { name: 'Number of Levels' }), { target: { value: '3' } })
    fireEvent.click(fmg.getByRole('button', { name: 'Initialize' }))
    expect(consolePane.getByText(/FMG Initialization complete using 3 grid levels/)).toBeInTheDocument()
    fireEvent.click(fmg.getByRole('button', { name: 'Close FMG Initialization' }))

    fireEvent.click(outline.getByRole('button', { name: 'Run Calculation' }))
    expect(task.queryByRole('textbox', { name: 'No. of Iterations' })).not.toBeInTheDocument()
    const dt = task.getByRole('textbox', { name: 'Time Step Size' })
    fireEvent.change(dt, { target: { value: '0' } })
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consolePane.getByText(/Enter a positive Time Step Size/)).toBeInTheDocument()
    fireEvent.change(dt, { target: { value: '0.02' } })
    fireEvent.change(task.getByRole('textbox', { name: 'Number of Time Steps' }), { target: { value: '5' } })
    fireEvent.change(task.getByRole('textbox', { name: 'Max Iterations/Time Step' }), { target: { value: '8' } })
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(consolePane.getByText(/dual-time-iterate 5 8/)).toBeInTheDocument()
    expect(consolePane.getByText(/Teaching Demo completed 5 time steps/)).toBeInTheDocument()
    expect(screen.queryByText(/Converged \(/)).not.toBeInTheDocument()
  })

  it('saves a report definition, creates separate plot and file outputs, and samples them at their configured intervals', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Solution' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Report Definitions' }))
    const definition = within(screen.getByRole('dialog', { name: 'Report Definition' }))
    fireEvent.change(definition.getByRole('textbox', { name: 'Name' }), { target: { value: 'outlet-pressure' } })
    fireEvent.change(definition.getByRole('combobox', { name: 'Report Type' }), { target: { value: 'Area-Weighted Average' } })
    expect(definition.queryByRole('textbox', { name: 'Force Vector' })).not.toBeInTheDocument()
    fireEvent.change(definition.getByRole('combobox', { name: 'Field Variable' }), { target: { value: 'Static Pressure' } })
    fireEvent.change(definition.getByRole('combobox', { name: 'Surfaces' }), { target: { value: 'outlet' } })
    fireEvent.click(definition.getByRole('checkbox', { name: 'Create Report Plot' }))
    fireEvent.click(definition.getByRole('button', { name: 'OK' }))

    for (const [kind, destinationLabel, destination, every] of [
      ['Plot', 'Plot Title', 'Outlet Pressure', '4'], ['File', 'File Name', 'pressure.out', '3'],
    ]) {
      fireEvent.click(ribbon.getByRole('button', { name: 'Report ' + kind + 's' }))
      const outputList = within(screen.getByRole('dialog', { name: 'Report ' + kind + 's' }))
      fireEvent.click(outputList.getByRole('button', { name: 'New…' }))
      const form = within(screen.getByRole('dialog', { name: 'New Report ' + kind }))
      fireEvent.change(form.getByRole('textbox', { name: 'Name' }), { target: { value: 'pressure-' + kind.toLowerCase() } })
      fireEvent.change(form.getByRole('textbox', { name: destinationLabel }), { target: { value: destination } })
      fireEvent.change(form.getByRole('textbox', { name: 'Get Data Every' }), { target: { value: every } })
      fireEvent.click(form.getByRole('button', { name: 'OK' }))
      expect(form.getByRole('alert')).toHaveTextContent('select a Report Definition')
      fireEvent.change(form.getByRole('combobox', { name: 'Report Definition' }), { target: { value: 'outlet-pressure' } })
      fireEvent.click(form.getByRole('button', { name: 'OK' }))
      expect(outputList.getByRole('combobox', { name: 'Report ' + kind + ' Name' })).toHaveValue('pressure-' + kind.toLowerCase())
      fireEvent.click(outputList.getByRole('button', { name: 'Close Report ' + kind + 's' }))
    }

    fireEvent.click(outline.getByRole('button', { name: 'Initialization' }))
    fireEvent.click(task.getByRole('button', { name: 'Initialize' }))
    fireEvent.click(outline.getByRole('button', { name: 'Run Calculation' }))
    fireEvent.change(task.getByRole('textbox', { name: 'No. of Iterations' }), { target: { value: '10' } })
    fireEvent.click(task.getByRole('button', { name: 'Calculate' }))
    expect(consolePane.getByText(/Outlet Pressure.*2 sample/)).toBeInTheDocument()
    expect(consolePane.getByText(/would write 3 sample\(s\) to "pressure\.out"/)).toBeInTheDocument()
    fireEvent.click(ribbon.getByRole('button', { name: 'Report Plots' }))
    const plots = within(screen.getByRole('dialog', { name: 'Report Plots' }))
    fireEvent.click(plots.getByRole('button', { name: 'Display' }))
    const graphics = within(screen.getByRole('region', { name: 'Graphics' }))
    expect(graphics.getByText(/Outlet Pressure · outlet-pressure · 2 samples/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ansys Fluent 2024 R2 文档' })).toHaveAttribute('href', expect.stringContaining('flu_ug_sec_create_report_plots'))
  })

  it('opens distinct file operations through a cascade and accepts the case and data pair only after validation', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'File' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Import' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'CGNS' }))
    fireEvent.click(within(ribbon.getByRole('group', { name: 'CGNS' })).getByRole('button', { name: 'Mesh…' }))
    const importedMesh = screen.getByRole('dialog', { name: 'Import Mesh' })
    expect(within(importedMesh).getByText('.cgns')).toBeInTheDocument()
    fireEvent.keyDown(importedMesh, { key: 'Escape' })
    expect(ribbon.getByRole('button', { name: 'Import' })).toHaveFocus()

    fireEvent.click(ribbon.getByRole('button', { name: 'Read' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Case & Data…' }))
    const read = within(screen.getByRole('dialog', { name: 'Read Case & Data' }))
    fireEvent.change(read.getByRole('textbox', { name: 'File Name' }), { target: { value: 'elbow.dat.h5' } })
    fireEvent.click(read.getByRole('button', { name: 'OK' }))
    expect(read.getByRole('alert')).toHaveTextContent('.cas.h5')
    fireEvent.change(read.getByRole('textbox', { name: 'File Name' }), { target: { value: 'elbow.cas.h5' } })
    fireEvent.click(read.getByRole('button', { name: 'OK' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Case: elbow.cas.h5')).toBeInTheDocument()
    expect(screen.getByText('Data: elbow.dat.h5')).toBeInTheDocument()
    expect(consolePane.getByText(/Read Case & Data: "elbow\.cas\.h5"/)).toBeInTheDocument()
  })

  it('changes wall controls with physical selections and returns from the shell layer dialog', () => {
    renderApp('/fluent-guide')
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    fireEvent.click(task.getByRole('button', { name: 'Wall' }))
    const wall = within(screen.getByRole('dialog', { name: 'Wall' }))
    fireEvent.change(wall.getByRole('combobox', { name: 'Wall Motion' }), { target: { value: 'Moving Wall' } })
    fireEvent.change(wall.getByRole('combobox', { name: 'Motion' }), { target: { value: 'Rotational' } })
    expect(wall.getByRole('textbox', { name: 'Rotation-Axis Direction Z' })).toBeInTheDocument()
    expect(wall.queryByRole('textbox', { name: 'Direction X' })).not.toBeInTheDocument()

    fireEvent.click(wall.getByRole('tab', { name: 'Thermal (Off)' }))
    expect(wall.queryByRole('combobox', { name: 'Thermal Condition' })).not.toBeInTheDocument()
    fireEvent.click(wall.getByRole('button', { name: '前往开启 Energy 模型' }))
    const energy = within(screen.getByRole('dialog', { name: 'Energy Model' }))
    fireEvent.click(energy.getByRole('checkbox', { name: 'Enable Energy' }))
    fireEvent.click(energy.getByRole('button', { name: 'OK' }))
    expect(wall.getByRole('tab', { name: 'Thermal' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(wall.getByRole('combobox', { name: 'Thermal Condition' }), { target: { value: 'Convection' } })
    expect(wall.getByRole('textbox', { name: /Heat Transfer Coefficient/ })).toBeInTheDocument()
    expect(wall.queryByRole('textbox', { name: /Heat Flux/ })).not.toBeInTheDocument()
    fireEvent.click(wall.getByRole('checkbox', { name: 'Shell Conduction' }))
    fireEvent.click(wall.getByRole('button', { name: 'Edit Shell Conduction Layers…' }))
    const layers = screen.getByRole('dialog', { name: 'Shell Conduction Layers' })
    fireEvent.change(within(layers).getByRole('combobox', { name: 'Number of Layers' }), { target: { value: '2' } })
    expect(within(layers).getByRole('textbox', { name: /Layer 2 Thickness/ })).toBeInTheDocument()
    fireEvent.keyDown(layers, { key: 'Escape' })
    expect(wall.getByRole('button', { name: 'Edit Shell Conduction Layers…' })).toHaveFocus()
  })

  it('adds model-dependent tabs and returns to the current tab after editing a phase', () => {
    renderApp('/fluent-guide')
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(task.getByRole('radio', { name: 'Transient' }))
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Multiphase' }))
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    expect(model.queryByRole('tab', { name: 'Phases' })).not.toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Volume of Fluid (VOF)' } })
    expect(model.getByRole('textbox', { name: 'Courant Number' })).toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Volume Fraction Formulation' }), { target: { value: 'Implicit' } })
    expect(model.queryByRole('textbox', { name: 'Courant Number' })).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('tab', { name: 'Phases' }))
    fireEvent.click(model.getByRole('button', { name: 'Edit Secondary Phase…' }))
    const phase = within(screen.getByRole('dialog', { name: 'Secondary Phase Setup' }))
    expect(phase.getByRole('combobox', { name: 'Phase Material' })).toHaveValue('water-liquid')
    fireEvent.click(phase.getByRole('button', { name: 'OK' }))
    expect(model.getByRole('tab', { name: 'Phases' })).toHaveAttribute('aria-selected', 'true')
  })

  it('locates AIAD through Quick Search and applies phase, force and entrainment settings', () => {
    renderApp('/fluent-guide')
    const search = within(screen.getByRole('search'))
    fireEvent.change(search.getByRole('searchbox', { name: 'Quick Search' }), { target: { value: 'AIAD' } })
    fireEvent.click(search.getByRole('button', { name: 'Regime Transition Modeling' }))
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    expect(model.queryByRole('radio', { name: /Algebraic Interfacial/ })).not.toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Eulerian' } })
    expect(model.getByRole('radiogroup', { name: 'Regime Transition Modeling' })).toBeInTheDocument()
    fireEvent.click(model.getByRole('radio', { name: /Algebraic Interfacial/ }))
    expect(model.getByRole('combobox', { name: 'Hybrid Interface Model' })).toHaveValue('Off')
    fireEvent.click(model.getByRole('button', { name: 'Apply' }))
    expect(model.getByRole('combobox', { name: 'Hybrid Interface Model' })).toHaveValue('Multi-Fluid VOF Model')
    expect(model.getByRole('combobox', { name: 'Interface Modeling Type' })).toBeDisabled()

    fireEvent.click(model.getByRole('tab', { name: 'Phases' }))
    expect(model.getByRole('checkbox', { name: 'AIAD Continuous Phase Treatment (Primary)' })).toBeChecked()
    fireEvent.change(model.getByRole('combobox', { name: 'Phase' }), { target: { value: '2' } })
    fireEvent.change(model.getByRole('combobox', { name: 'AIAD Phase Treatment (Secondary)' }), { target: { value: 'AIAD Continuous Phase Treatment (Secondary)' } })
    fireEvent.click(model.getByRole('button', { name: 'Add Phase' }))
    fireEvent.change(model.getByRole('combobox', { name: 'AIAD Phase Treatment (Secondary)' }), { target: { value: 'AIAD Entrained Phase Treatment (Secondary)' } })
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Material' }), { target: { value: 'air' } })
    fireEvent.click(model.getByRole('button', { name: 'Apply' }))
    expect(model.getByRole('alert')).toHaveTextContent('AIAD 卷吸相必须与次级连续相使用相同材料。')
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Material' }), { target: { value: 'water-liquid' } })
    fireEvent.click(model.getByRole('button', { name: 'Apply' }))
    expect(model.queryByRole('alert')).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('tab', { name: 'Phase Interaction' }))
    expect(model.getByRole('combobox', { name: 'Drag Coefficient' })).toHaveValue('drag-aiad')
    expect(model.queryByRole('combobox', { name: 'Lift Coefficient' })).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('button', { name: 'Edit AIAD Parameters…' }))
    const aiad = within(screen.getByRole('dialog', { name: 'AIAD Model Parameters' }))
    const bubbles = within(aiad.getByRole('group', { name: 'Bubbles Field' }))
    fireEvent.change(bubbles.getByRole('combobox', { name: 'Drag Coefficient Method' }), { target: { value: 'user-defined' } })
    expect(bubbles.queryByRole('textbox', { name: 'Drag Coefficient' })).not.toBeInTheDocument()
    fireEvent.click(aiad.getByRole('button', { name: 'OK' }))
    fireEvent.click(model.getByRole('tab', { name: 'Interfacial Area' }))
    expect(model.getByRole('combobox', { name: 'Interfacial Area Model' })).toHaveValue('ia-aiad')
    fireEvent.click(model.getByRole('tab', { name: 'Heat, Mass, Reactions' }))
    expect(model.getByRole('textbox', { name: 'Regime Transition Mechanism' })).toHaveValue('aiad-entrained-absorption')
    fireEvent.click(model.getByRole('button', { name: 'Edit Entrainment…' }))
    expect(screen.getByRole('dialog', { name: 'AIAD Entrainment Parameters' })).toBeInTheDocument()
  })

  it('applies GENTOP to phase selection, drag and population balance while blocking DDPM conflicts', () => {
    renderApp('/fluent-guide?locate=multiphase-eulerian-regime')
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Eulerian' } })
    const ddpm = model.getByRole('checkbox', { name: 'Dense Discrete Phase Model' })
    fireEvent.click(ddpm)
    expect(model.getByRole('radio', { name: /GENTOP/ })).toBeDisabled()
    fireEvent.click(ddpm)
    fireEvent.click(model.getByRole('radio', { name: /GENTOP/ }))
    expect(model.getByRole('textbox', { name: 'Calibration Coefficient' })).toHaveValue('1.0')
    fireEvent.click(model.getByRole('button', { name: 'Apply' }))
    expect(model.getByRole('combobox', { name: 'Number of Eulerian Phases' })).toHaveValue('3')
    fireEvent.click(model.getByRole('tab', { name: 'Phases' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Phase' }), { target: { value: '3' } })
    fireEvent.click(model.getByRole('checkbox', { name: 'GENTOP Hybrid Phase Modeling' }))
    fireEvent.click(model.getByRole('tab', { name: 'Phase Interaction' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Pairs' }), { target: { value: '1/3' } })
    expect(within(model.getByRole('combobox', { name: 'Drag Coefficient' })).getAllByRole('option').map((option) => option.textContent)).toEqual(['ishii-zuber', 'grace', 'universal-drag'])
    fireEvent.click(model.getByRole('tab', { name: 'Heat, Mass, Reactions' }))
    expect(model.getByRole('textbox', { name: 'Regime Transition Mechanism' })).toHaveValue('gentop-complete-coalescence')
    fireEvent.click(model.getByRole('tab', { name: 'Population Balance' }))
    expect(model.getByRole('combobox', { name: 'Method' })).toHaveValue('Inhomogeneous Discrete')
    fireEvent.change(model.getByRole('combobox', { name: 'Phase' }), { target: { value: '3' } })
    expect(model.getByRole('textbox', { name: 'Bins' })).toHaveValue('1')
    expect(model.getByRole('textbox', { name: 'Bins' })).toBeDisabled()
  })

  it('maintains Eulerian phase properties and force settings for each phase pair', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Multiphase' }))
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Eulerian' } })
    fireEvent.click(model.getByRole('checkbox', { name: 'Boiling Model' }))
    fireEvent.click(model.getByRole('button', { name: 'Boiling Options…' }))
    const boiling = within(screen.getByRole('dialog', { name: 'Boiling Model' }))
    fireEvent.change(boiling.getByRole('combobox', { name: 'Boiling Options' }), { target: { value: 'Non-equilibrium Boiling' } })
    fireEvent.click(boiling.getByRole('button', { name: 'OK' }))
    fireEvent.click(model.getByRole('tab', { name: 'Phases' }))
    fireEvent.click(model.getByRole('button', { name: 'Add Phase' }))
    expect(model.getByRole('combobox', { name: 'Phase' })).toHaveValue('3')
    fireEvent.change(model.getByRole('textbox', { name: 'Name' }), { target: { value: 'sand' } })
    fireEvent.click(model.getByRole('checkbox', { name: 'Granular' }))
    expect(model.getByRole('checkbox', { name: 'Packed Bed' })).toBeInTheDocument()
    expect(model.queryByRole('checkbox', { name: 'Interfacial Area Concentration' })).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('tab', { name: 'Phase Interaction' }))
    expect(model.getByRole('tab', { name: 'Forces' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Pairs' }), { target: { value: '1/3' } })
    expect(model.getByRole('option', { name: 'phase-1 / sand' })).toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Drag Coefficient' }), { target: { value: 'gidaspow' } })
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Pairs' }), { target: { value: '1/2' } })
    expect(model.getByRole('combobox', { name: 'Drag Coefficient' })).toHaveValue('none')
    fireEvent.change(model.getByRole('combobox', { name: 'Phase Pairs' }), { target: { value: '1/3' } })
    expect(model.getByRole('combobox', { name: 'Drag Coefficient' })).toHaveValue('gidaspow')
    fireEvent.click(model.getByRole('tab', { name: 'Population Balance' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Method' }), { target: { value: 'Standard Moment' } })
    expect(model.getByRole('textbox', { name: 'Moments' })).toBeInTheDocument()
    expect(model.queryByRole('textbox', { name: 'Bins' })).not.toBeInTheDocument()
  })

  it('opens the correct Mixture mass-transfer dialog and retains its settings by mechanism', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Multiphase' }))
    const model = within(screen.getByRole('dialog', { name: 'Multiphase Model' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Model' }), { target: { value: 'Mixture' } })
    fireEvent.click(model.getByRole('checkbox', { name: 'Slip Velocity' }))
    expect(model.queryByRole('checkbox', { name: 'Flow Regime Modeling' })).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('tab', { name: 'Phase Interaction' }))
    expect(model.queryByRole('tab', { name: 'Interfacial Area' })).not.toBeInTheDocument()
    fireEvent.click(model.getByRole('tab', { name: 'Heat, Mass, Reactions' }))
    expect(model.getByRole('tab', { name: 'Mass' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(model.getByRole('combobox', { name: 'Number of Mass Transfer Mechanisms' }), { target: { value: '2' } })
    expect(model.getByRole('tab', { name: 'Interfacial Area' })).toBeInTheDocument()
    fireEvent.change(model.getByRole('combobox', { name: 'Mechanism' }), { target: { value: 'evaporation-condensation' } })
    const evaporation = within(screen.getByRole('dialog', { name: 'Evaporation-Condensation Model' }))
    fireEvent.change(evaporation.getByRole('textbox', { name: 'Saturation Temperature (K)' }), { target: { value: '370' } })
    fireEvent.click(evaporation.getByRole('button', { name: 'OK' }))
    expect(model.getByRole('tab', { name: 'Mass' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(model.getByRole('combobox', { name: 'Mass Transfer Mechanism' }), { target: { value: '2' } })
    fireEvent.change(model.getByRole('combobox', { name: 'Mechanism' }), { target: { value: 'cavitation' } })
    const cavitation = within(screen.getByRole('dialog', { name: 'Cavitation Model' }))
    expect(cavitation.getByRole('combobox', { name: 'Cavitation Model' })).toHaveValue('Schnerr-Sauer')
    fireEvent.click(cavitation.getByRole('button', { name: 'OK' }))
    fireEvent.change(model.getByRole('combobox', { name: 'Mass Transfer Mechanism' }), { target: { value: '1' } })
    fireEvent.click(model.getByRole('button', { name: 'Edit Evaporation-Condensation…' }))
    expect(within(screen.getByRole('dialog', { name: 'Evaporation-Condensation Model' }))
      .getByRole('textbox', { name: 'Saturation Temperature (K)' })).toHaveValue('370')
  })

  it('shows radiation and species settings in place and keeps the DPM numerics tabs', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Radiation' }))
    const radiation = within(screen.getByRole('dialog', { name: 'Radiation Model' }))
    fireEvent.change(radiation.getByRole('combobox', { name: 'Model' }), { target: { value: 'Monte Carlo (MC)' } })
    expect(radiation.getByRole('textbox', { name: 'Target Number of Histories' })).toBeInTheDocument()
    expect(radiation.queryByRole('textbox', { name: 'Theta Divisions' })).not.toBeInTheDocument()
    expect(radiation.queryByRole('tablist')).not.toBeInTheDocument()
    fireEvent.change(radiation.getByRole('combobox', { name: 'Number of Bands' }), { target: { value: '2' } })
    expect(radiation.getByRole('textbox', { name: 'Band 2 End (m)' })).toBeInTheDocument()
    expect(radiation.queryByRole('textbox', { name: 'Band 3 End (m)' })).not.toBeInTheDocument()
    fireEvent.change(radiation.getByRole('textbox', { name: 'Band 2 End (m)' }), { target: { value: '1e-6' } })
    fireEvent.click(radiation.getByRole('button', { name: 'OK' }))
    expect(radiation.getByRole('alert')).toHaveTextContent('Enter the start wavelength for Band 2.')
    fireEvent.change(radiation.getByRole('textbox', { name: 'Band 2 Start (m)' }), { target: { value: '0' } })
    fireEvent.change(radiation.getByRole('combobox', { name: 'Model' }), { target: { value: 'Discrete Ordinates (DO)' } })
    expect(radiation.getByRole('textbox', { name: 'Theta Divisions' })).toBeInTheDocument()
    const solar = radiation.getByRole('combobox', { name: 'Solar Load' })
    fireEvent.change(solar, { target: { value: 'Solar Ray Tracing' } })
    expect(radiation.getByRole('textbox', { name: 'Spectral Fraction' })).toBeInTheDocument()
    fireEvent.change(solar, { target: { value: 'DO Irradiation' } })
    expect(radiation.queryByRole('textbox', { name: 'Spectral Fraction' })).not.toBeInTheDocument()
    fireEvent.change(radiation.getByRole('combobox', { name: 'Model' }), { target: { value: 'Surface to Surface (S2S)' } })
    expect(radiation.queryByRole('combobox', { name: 'Number of Bands' })).not.toBeInTheDocument()
    fireEvent.click(radiation.getByRole('button', { name: 'Settings…' }))
    const clustering = within(screen.getByRole('dialog', { name: 'View Factors and Clustering' }))
    fireEvent.change(clustering.getByRole('combobox', { name: 'Clustering' }), { target: { value: 'Automatic' } })
    expect(clustering.getByRole('textbox', { name: 'Maximum Faces per Surface Cluster' })).toBeInTheDocument()
    fireEvent.click(clustering.getByRole('button', { name: 'OK' }))
    fireEvent.click(radiation.getByRole('button', { name: 'OK' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Species' }))
    const species = within(screen.getByRole('dialog', { name: 'Species Model' }))
    fireEvent.change(species.getByRole('combobox', { name: 'Model' }), { target: { value: 'Species Transport' } })
    expect(species.queryByRole('tablist')).not.toBeInTheDocument()
    fireEvent.click(species.getByRole('checkbox', { name: 'Volumetric Reactions' }))
    fireEvent.change(species.getByRole('combobox', { name: 'Turbulence-Chemistry Interaction' }), { target: { value: 'Eddy-Dissipation Concept' } })
    expect(species.getByRole('combobox', { name: 'Chemistry Solver' })).toHaveValue('Stiff Chemistry Solver')
    expect(species.getByRole('textbox', { name: 'Volume Fraction Constant' })).toBeInTheDocument()
    fireEvent.change(species.getByRole('combobox', { name: 'EDC Model' }), { target: { value: 'Partially Stirred Reactor' } })
    expect(species.getByRole('textbox', { name: 'Fractal Dimension' })).toBeInTheDocument()
    fireEvent.change(species.getByRole('combobox', { name: 'Mixing Model' }), { target: { value: 'Constant Cmix' } })
    expect(species.getByRole('textbox', { name: 'Mixing Constant' })).toBeInTheDocument()
    expect(species.queryByRole('textbox', { name: 'Fractal Dimension' })).not.toBeInTheDocument()
    fireEvent.click(species.getByRole('button', { name: 'Integration Parameters…' }))
    const integration = within(screen.getByRole('dialog', { name: 'Integration Parameters' }))
    fireEvent.change(integration.getByRole('combobox', { name: 'Integration Method' }), { target: { value: 'Direct Integration' } })
    expect(integration.queryByRole('textbox', { name: 'ISAT Error Tolerance' })).not.toBeInTheDocument()
    expect(integration.getByRole('textbox', { name: 'Absolute Error Tolerance' })).toBeInTheDocument()
    fireEvent.click(integration.getByRole('button', { name: 'OK' }))
    fireEvent.click(species.getByRole('button', { name: 'OK' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Discrete Phase' }))
    const dpm = within(screen.getByRole('dialog', { name: 'Discrete Phase Model' }))
    expect(dpm.queryByRole('textbox', { name: 'Step Length Factor' })).not.toBeInTheDocument()
    fireEvent.click(dpm.getByRole('checkbox', { name: 'Enable Discrete Phase Model' }))
    fireEvent.click(dpm.getByRole('checkbox', { name: 'Unsteady Particle Tracking' }))
    expect(dpm.getByRole('textbox', { name: 'Particle Time Step Size (s)' })).toBeInTheDocument()
    expect(dpm.getByRole('textbox', { name: 'Number of Time Steps' })).toBeInTheDocument()
    expect(dpm.queryByRole('checkbox', { name: 'Track with Fluid Flow Time Step' })).not.toBeInTheDocument()
    fireEvent.click(dpm.getByRole('tab', { name: 'Numerics' }))
    expect(dpm.queryByRole('combobox', { name: 'High Order Scheme' })).not.toBeInTheDocument()
    fireEvent.click(dpm.getByRole('checkbox', { name: 'Automated Tracking Scheme Selection' }))
    expect(dpm.getByRole('combobox', { name: 'High Order Scheme' })).toHaveValue('trapezoidal')
    expect(dpm.getByRole('tab', { name: 'UDF' })).toBeInTheDocument()
    expect(dpm.getByRole('tab', { name: 'Parallel' })).toBeInTheDocument()
  })

  it('updates Viscous submodels and near-wall groups on the same screen', () => {
    renderApp('/fluent-guide?locate=ribbon-model-viscous')
    const viscous = within(screen.getByRole('dialog', { name: 'Viscous Model' }))
    expect(viscous.queryByRole('tablist')).not.toBeInTheDocument()
    fireEvent.click(viscous.getByRole('radio', { name: 'k-epsilon' }))
    fireEvent.change(viscous.getByRole('combobox', { name: 'k-epsilon Model' }), { target: { value: 'rng' } })
    expect(viscous.getByRole('checkbox', { name: 'Swirl Dominated Flow' })).toBeInTheDocument()
    expect(viscous.getByRole('option', { name: 'Menter-Lechner' })).toBeInTheDocument()
    fireEvent.change(viscous.getByRole('combobox', { name: 'Near-Wall Treatment' }), { target: { value: 'User-Defined Wall Functions' } })
    expect(viscous.getByRole('textbox', { name: 'Law of the Wall' })).toBeInTheDocument()
    fireEvent.click(viscous.getByRole('radio', { name: 'k-omega' }))
    expect(viscous.queryByRole('checkbox', { name: 'Swirl Dominated Flow' })).not.toBeInTheDocument()
    fireEvent.change(viscous.getByRole('combobox', { name: 'k-omega Model' }), { target: { value: 'standard' } })
    expect(viscous.getByRole('checkbox', { name: 'Shear Flow Corrections' })).toBeInTheDocument()
    fireEvent.change(viscous.getByRole('combobox', { name: 'k-omega Model' }), { target: { value: 'sst' } })
    expect(viscous.queryByRole('checkbox', { name: 'Shear Flow Corrections' })).not.toBeInTheDocument()
  })

  it('switches periodic driving conditions and branches to perforation geometry', () => {
    renderApp('/fluent-guide')
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    fireEvent.click(task.getByRole('button', { name: 'Periodic Conditions…' }))
    const periodic = within(screen.getByRole('dialog', { name: 'Periodic Conditions' }))
    fireEvent.change(periodic.getByRole('combobox', { name: 'Flow Driving Method' }), { target: { value: 'Specify Pressure Gradient' } })
    expect(periodic.getByRole('textbox', { name: 'Pressure Gradient (Pa/m)' })).toBeInTheDocument()
    expect(periodic.queryByRole('textbox', { name: 'Mass Flow Rate (kg/s)' })).not.toBeInTheDocument()
    fireEvent.click(periodic.getByRole('button', { name: 'OK' }))
    fireEvent.click(task.getByRole('button', { name: 'Perforated Walls…' }))
    const perforated = within(screen.getByRole('dialog', { name: 'Perforated Walls' }))
    fireEvent.click(perforated.getByRole('checkbox', { name: 'Perforated Wall Model' }))
    fireEvent.change(perforated.getByRole('combobox', { name: 'Injection Type' }), { target: { value: 'Discrete' } })
    fireEvent.click(perforated.getByRole('button', { name: 'Injection Holes Geometry…' }))
    expect(within(screen.getByRole('dialog', { name: 'Injection Holes Geometry' })).getByRole('textbox', { name: 'Diameter (m)' })).toBeInTheDocument()
  })

  it('keeps Dual Cell raw heat-transfer data and NTU data in separate dialogs', () => {
    renderApp('/fluent-guide')
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    fireEvent.click(outline.getByRole('button', { name: 'Models' }))
    fireEvent.click(task.getByRole('button', { name: /^Heat Exchanger/ }))
    const exchanger = within(screen.getByRole('dialog', { name: 'Heat Exchanger Model' }))
    fireEvent.change(exchanger.getByRole('combobox', { name: 'Heat Exchanger Model' }), { target: { value: 'Untapped Dual Cell' } })
    fireEvent.click(exchanger.getByRole('button', { name: 'Define…' }))
    const dualCell = within(screen.getByRole('dialog', { name: 'Set Dual Cell Heat Exchanger' }))
    expect(dualCell.getByRole('combobox', { name: 'Effectiveness-NTU Relation' })).toBeInTheDocument()
    fireEvent.click(dualCell.getByRole('button', { name: 'Heat Transfer Table…' }))
    const heatData = within(screen.getByRole('dialog', { name: 'Heat Transfer Data Table' }))
    fireEvent.change(heatData.getByRole('textbox', { name: 'Heat Transfer (W)' }), { target: { value: '2500' } })
    fireEvent.click(heatData.getByRole('button', { name: 'OK' }))
    fireEvent.change(dualCell.getByRole('combobox', { name: 'Performance Data' }), { target: { value: 'NTU Data' } })
    expect(dualCell.queryByRole('combobox', { name: 'Effectiveness-NTU Relation' })).not.toBeInTheDocument()
    fireEvent.click(dualCell.getByRole('button', { name: 'NTU Table…' }))
    const ntu = within(screen.getByRole('dialog', { name: 'NTU Table' }))
    fireEvent.change(ntu.getByRole('textbox', { name: 'NTU' }), { target: { value: '0.75' } })
    fireEvent.click(ntu.getByRole('button', { name: 'OK' }))
    fireEvent.change(dualCell.getByRole('combobox', { name: 'Performance Data' }), { target: { value: 'Raw Data' } })
    fireEvent.click(dualCell.getByRole('button', { name: 'Heat Transfer Table…' }))
    expect(within(screen.getByRole('dialog', { name: 'Heat Transfer Data Table' }))
      .getByRole('textbox', { name: 'Heat Transfer (W)' })).toHaveValue('2500')
  })

  it('creates a named rake and uses it in a separately rendered XY plot', () => {
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const graphics = within(screen.getByRole('region', { name: 'Graphics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Create Surface' }))
    fireEvent.click(within(ribbon.getByRole('group', { name: 'Create Surface' })).getByRole('button', { name: 'Line/Rake' }))
    const rake = within(screen.getByRole('dialog', { name: 'Line/Rake' }))
    expect(rake.queryByRole('textbox', { name: 'Number of Points' })).not.toBeInTheDocument()
    fireEvent.change(rake.getByRole('combobox', { name: 'Type' }), { target: { value: 'Rake' } })
    expect(rake.getByRole('textbox', { name: 'Number of Points' })).toBeInTheDocument()
    fireEvent.change(rake.getByRole('textbox', { name: 'New Surface Name' }), { target: { value: 'outlet-rake' } })
    fireEvent.click(rake.getByRole('button', { name: 'Create' }))
    fireEvent.click(rake.getByRole('button', { name: 'Close Line/Rake' }))
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    fireEvent.change(outline.getByRole('searchbox'), { target: { value: 'outlet-rake' } })
    const existing = outline.getByRole('button', { name: /outlet-rake/ })
    fireEvent.keyDown(existing, { key: 'F2' })
    const edit = within(screen.getByRole('dialog', { name: 'Line/Rake' }))
    expect(edit.getByRole('textbox', { name: 'Surface Name' })).toHaveValue('outlet-rake')
    expect(edit.getByRole('combobox', { name: 'Type' })).toHaveValue('Rake')
    fireEvent.change(edit.getByRole('textbox', { name: 'Number of Points' }), { target: { value: '20' } })
    fireEvent.click(edit.getByRole('button', { name: 'Update' }))
    expect(screen.getByRole('region', { name: 'Console' })).toHaveTextContent(/Updated line-rake "outlet-rake".*Number of Points=20/)
    fireEvent.click(edit.getByRole('button', { name: 'Close Line/Rake' }))
    expect(existing).toHaveFocus()

    fireEvent.click(ribbon.getByRole('button', { name: 'Results' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'XY Plot' }))
    const plot = within(screen.getByRole('dialog', { name: 'XY Plot' }))
    expect(graphics.getByRole('button', { name: 'XY Plot' })).toHaveAttribute('aria-pressed', 'false')
    fireEvent.change(plot.getByRole('combobox', { name: 'Surfaces' }), { target: { value: 'outlet-rake' } })
    fireEvent.change(plot.getByRole('combobox', { name: 'Y Axis Function' }), { target: { value: 'Temperature' } })
    fireEvent.click(plot.getByRole('button', { name: 'Plot' }))
    expect(graphics.getByRole('button', { name: 'XY Plot' })).toHaveAttribute('aria-pressed', 'true')
    expect(graphics.getByText(/Temperature · outlet-rake · Position/)).toBeInTheDocument()
  })

  it('requires teaching disclaimer acknowledgment and propagates launcher tabs & dark theme', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-launcher')
    const launcher = within(screen.getByRole('complementary', { name: 'Fluent Launcher 配置器' }))

    expect(launcher.getByRole('note', { name: '教学复刻声明' })).toBeInTheDocument()
    const ack = launcher.getByRole('checkbox', { name: /我已知悉：本界面无实际功能/ })
    expect(ack).toBeChecked()
    fireEvent.click(ack)
    expect(launcher.getByRole('button', { name: '启动 Fluent Meshing' })).toBeDisabled()
    expect(launcher.getByRole('alert')).toHaveTextContent('请先勾选确认')
    fireEvent.click(ack)

    const tabs = ['General Options', 'Parallel Settings', 'Environment', 'Solver / Meshing', 'Scheduler']
    for (const tabName of tabs) {
      fireEvent.click(launcher.getByRole('tab', { name: tabName }))
    }
    fireEvent.click(launcher.getByRole('checkbox', { name: 'Use Job Scheduler' }))
    expect(launcher.getByRole('combobox', { name: 'Scheduler Type' })).toBeInTheDocument()

    fireEvent.change(launcher.getByRole('combobox', { name: 'Workbench Color Scheme' }), {
      target: { value: 'dark' },
    })
    fireEvent.click(launcher.getByRole('button', { name: /Solution/ }))
    fireEvent.click(launcher.getByRole('link', { name: '启动 Fluent Solution' }))

    const workbench = document.querySelector('.fluent-workbench')
    expect(workbench).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByRole('region', { name: 'Console' })).toHaveTextContent(/\[Launcher Config\].*driver=auto/)
  })

  it('executes Domain mesh actions, multi-tab jumps, Density-Based switching, and new result plots', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    const graphics = within(screen.getByRole('region', { name: 'Graphics' }))

    // Domain: Smooth/Swap & Make Polyhedra & Reorder cascade
    fireEvent.click(ribbon.getByRole('button', { name: 'Smooth/Swap' }))
    const smoothDlg = within(screen.getByRole('dialog', { name: 'Smooth/Swap Mesh' }))
    fireEvent.click(smoothDlg.getByRole('button', { name: 'Smooth' }))
    expect(consolePane.getByText(/Min Orthogonal Quality 0\.21 -> 0\.29/)).toBeInTheDocument()
    fireEvent.click(smoothDlg.getByRole('tab', { name: 'Swap' }))
    expect(smoothDlg.getByRole('textbox', { name: 'Min Dihedral Angle (deg)' })).toBeInTheDocument()
    fireEvent.click(smoothDlg.getByRole('button', { name: 'Close Smooth/Swap Mesh' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Make Polyhedra' }))
    const polyDlg = within(screen.getByRole('dialog', { name: 'Make Polyhedra' }))
    fireEvent.click(polyDlg.getByRole('button', { name: 'Convert Domain' }))
    expect(screen.getByText(/\(polyhedra\)/)).toBeInTheDocument()
    fireEvent.click(polyDlg.getByRole('button', { name: 'Close Make Polyhedra' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Reorder' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Print Bandwidth' }))
    expect(consolePane.getByText(/matrix bandwidth = 148/)).toBeInTheDocument()

    // User-Defined: open directly on Function Hooks and Execute On Demand tabs
    fireEvent.click(ribbon.getByRole('button', { name: 'User-Defined' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Function Hooks' }))
    const udfHooks = within(screen.getByRole('dialog', { name: 'User-Defined Functions (UDF)' }))
    expect(udfHooks.getByRole('tab', { name: 'Function Hooks' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(udfHooks.getByRole('button', { name: 'Close User-Defined Functions (UDF)' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Execute On Demand' }))
    const udfDemand = within(screen.getByRole('dialog', { name: 'User-Defined Functions (UDF)' }))
    expect(udfDemand.getByRole('tab', { name: 'Execute On Demand' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(udfDemand.getByRole('button', { name: 'Execute' }))
    expect(consolePane.getByText(/Executed on-demand UDF/)).toBeInTheDocument()
    fireEvent.click(udfDemand.getByRole('button', { name: 'Close User-Defined Functions (UDF)' }))

    // Cell Zone Conditions: 5 tabs + Porous Zone branching
    fireEvent.click(outline.getByRole('button', { name: 'Cell Zone Conditions' }))
    fireEvent.click(task.getByRole('button', { name: 'Fluid Zone' }))
    const fluidZone = within(screen.getByRole('dialog', { name: 'Fluid Zone' }))
    expect(fluidZone.getByRole('tab', { name: 'Mesh Motion' })).toBeDisabled()
    expect(fluidZone.getByRole('tab', { name: 'Porous Zone' })).toBeDisabled()
    fireEvent.click(fluidZone.getByRole('checkbox', { name: 'Porous Zone' }))
    fireEvent.click(fluidZone.getByRole('tab', { name: 'Porous Zone' }))
    expect(fluidZone.getByRole('textbox', { name: /Viscous Resistance/ })).toBeInTheDocument()
    expect(fluidZone.getByRole('combobox', { name: 'Material Name' })).toBeInTheDocument()
    const sourceTerms = fluidZone.getByRole('tab', { name: 'Source Terms' })
    expect(sourceTerms).toBeDisabled()
    fireEvent.click(fluidZone.getByRole('checkbox', { name: 'Enable Source Terms' }))
    fireEvent.click(sourceTerms)
    fireEvent.click(fluidZone.getByRole('button', { name: 'Source Terms' }))
    const sourceDialog = within(screen.getByRole('dialog', { name: 'Source Terms' }))
    fireEvent.click(sourceDialog.getByRole('button', { name: 'Close Source Terms' }))
    expect(sourceTerms).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(fluidZone.getByRole('button', { name: 'Close Fluid Zone' }))

    fireEvent.click(task.getByRole('button', { name: 'Solid Zone' }))
    const solidZone = within(screen.getByRole('dialog', { name: 'Solid Zone' }))
    expect(solidZone.getByRole('combobox', { name: 'Material Name' })).toBeInTheDocument()
    expect(solidZone.getByRole('tab', { name: 'Source Terms' })).toBeDisabled()
    fireEvent.click(solidZone.getByRole('checkbox', { name: 'Enable Source Terms' }))
    fireEvent.click(solidZone.getByRole('tab', { name: 'Source Terms' }))
    expect(solidZone.getByRole('textbox', { name: 'Heat Generation Rate' })).toBeInTheDocument()
    fireEvent.click(solidZone.getByRole('checkbox', { name: 'Mesh Motion' }))
    fireEvent.click(solidZone.getByRole('tab', { name: 'Mesh Motion' }))
    expect(solidZone.getByRole('textbox', { name: 'Rotational Velocity (rpm)' })).toBeInTheDocument()
    fireEvent.click(solidZone.getByRole('button', { name: 'Close Solid Zone' }))

    // Density-Based dynamically swaps Solution Methods controls
    fireEvent.click(outline.getByRole('button', { name: 'General' }))
    fireEvent.click(task.getByRole('radio', { name: 'Density-Based' }))
    fireEvent.click(outline.getByRole('button', { name: 'Methods' }))
    expect(task.queryByRole('combobox', { name: 'Pressure-Velocity Coupling' })).not.toBeInTheDocument()
    expect(task.getByRole('combobox', { name: 'Formulation' })).toBeInTheDocument()
    expect(task.getByRole('combobox', { name: 'Flux Type' })).toBeInTheDocument()

    // Results: Histogram, FFT, and Composite Scene
    fireEvent.click(ribbon.getByRole('button', { name: 'Results' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Histogram' }))
    const histDlg = within(screen.getByRole('dialog', { name: 'Histogram' }))
    fireEvent.click(histDlg.getByRole('button', { name: 'Plot Histogram' }))
    expect(graphics.getByRole('button', { name: 'Histogram' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(histDlg.getByRole('button', { name: 'Close Histogram' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'FFT' }))
    const fftDlg = within(screen.getByRole('dialog', { name: 'Fourier Transform (FFT)' }))
    fireEvent.change(fftDlg.getByRole('combobox', { name: 'Signal Source' }), { target: { value: 'Acoustic Receiver' } })
    fireEvent.click(fftDlg.getByRole('button', { name: 'Plot FFT' }))
    expect(graphics.getByRole('button', { name: 'FFT' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(fftDlg.getByRole('button', { name: 'Close Fourier Transform (FFT)' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Scene' }))
    const sceneDlg = within(screen.getByRole('dialog', { name: 'Scene Composition' }))
    fireEvent.click(sceneDlg.getByRole('button', { name: 'Display Scene' }))
    expect(graphics.getByRole('button', { name: 'Scene' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(sceneDlg.getByRole('button', { name: 'Close Scene Composition' }))

    // Design: Mesh Morphing direct tab jump + Parameters: Design Points update
    fireEvent.click(ribbon.getByRole('button', { name: 'Design' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Mesh Morphing' }))
    const adjointDlg = within(screen.getByRole('dialog', { name: 'Adjoint Solver' }))
    expect(adjointDlg.getByRole('tab', { name: 'Mesh Morphing' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(adjointDlg.getByRole('button', { name: 'Apply Morphing' }))
    expect(consolePane.getByText(/\[Adjoint Morphing\]/)).toBeInTheDocument()
    fireEvent.click(adjointDlg.getByRole('button', { name: 'Close Adjoint Solver' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Parameters' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Parameter Table' }))
    const paramDlg = within(screen.getByRole('dialog', { name: 'Parameter Manager' }))
    expect(paramDlg.getByRole('tab', { name: 'Design Points' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(paramDlg.getByRole('combobox', { name: 'Design Point' }), { target: { value: 'DP 1 (v=5.0 m/s)' } })
    fireEvent.click(paramDlg.getByRole('button', { name: 'Update Selected DP' }))
    expect(consolePane.getByText(/Updated DP 1 \(v=5\.0 m\/s\)/)).toBeInTheDocument()
  })

  it('displays banded contours and headless vectors from their dedicated windows', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const graphics = screen.getByRole('region', { name: 'Graphics' })
    fireEvent.click(ribbon.getByRole('button', { name: 'Results' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Contours' }))
    const contours = within(screen.getByRole('dialog', { name: 'Contours' }))
    fireEvent.change(contours.getByRole('combobox', { name: 'Colormap' }), { target: { value: 'Turbo' } })
    fireEvent.change(contours.getByRole('combobox', { name: 'Coloring' }), { target: { value: 'Banded' } })
    fireEvent.click(contours.getByRole('checkbox', { name: 'Draw Mesh' }))
    fireEvent.click(contours.getByRole('checkbox', { name: 'Auto Range' }))
    fireEvent.change(contours.getByRole('textbox', { name: 'Min Value' }), { target: { value: '-5' } })
    fireEvent.change(contours.getByRole('textbox', { name: 'Max Value' }), { target: { value: '-6' } })
    fireEvent.click(contours.getByRole('button', { name: 'Display' }))
    expect(screen.getByRole('region', { name: 'Console' })).toHaveTextContent('Min Value below Max Value')
    fireEvent.change(contours.getByRole('textbox', { name: 'Max Value' }), { target: { value: '5' } })
    fireEvent.click(contours.getByRole('button', { name: 'Display' }))
    expect(graphics).toHaveTextContent('0.00')
    expect(graphics.querySelectorAll('#elbow-contour-gradient stop')).toHaveLength(10)
    expect(graphics.querySelector('#elbow-contour-gradient stop')).toHaveAttribute('stop-color', '#302868')
    expect(graphics.querySelector('g[stroke="#183848"]')).toBeInTheDocument()
    fireEvent.change(contours.getByRole('combobox', { name: 'Coloring' }), { target: { value: 'Smooth' } })
    expect(graphics.querySelectorAll('#elbow-contour-gradient stop')).toHaveLength(10)
    fireEvent.click(contours.getByRole('button', { name: 'Display' }))
    expect(graphics.querySelectorAll('#elbow-contour-gradient stop')).toHaveLength(5)
    fireEvent.click(contours.getByRole('button', { name: 'Close Contours' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Vectors' }))
    const vectors = within(screen.getByRole('dialog', { name: 'Vectors' }))
    fireEvent.change(vectors.getByRole('combobox', { name: 'Style' }), { target: { value: 'Headless' } })
    fireEvent.change(vectors.getByRole('textbox', { name: 'Skip' }), { target: { value: '0' } })
    fireEvent.click(vectors.getByRole('button', { name: 'Display' }))
    expect(graphics.querySelectorAll('path[d="M0 0h32"]').length).toBeGreaterThan(1)
    expect(graphics.querySelector('g[stroke="#183848"]')).not.toBeInTheDocument()
    fireEvent.click(vectors.getByRole('checkbox', { name: 'Draw Mesh' }))
    fireEvent.click(vectors.getByRole('button', { name: 'Display' }))
    expect(graphics.querySelector('g[stroke="#183848"]')).toBeInTheDocument()
  })

  it('supports dark theme toggle, disclaimer modal, and multi-axis cut plane in Fluent Meshing', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-meshing')

    fireEvent.click(screen.getByRole('button', { name: '暗色主题' }))
    expect(document.querySelector('.fluent-workbench')).toHaveAttribute('data-theme', 'dark')

    fireEvent.click(screen.getByRole('button', { name: '教学复刻声明' }))
    expect(screen.getByRole('dialog', { name: '教学复刻声明' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '我知道了' }))
    expect(screen.queryByRole('dialog', { name: '教学复刻声明' })).not.toBeInTheDocument()

    const graphics = within(screen.getByRole('region', { name: 'Graphics' }))
    fireEvent.click(graphics.getByRole('button', { name: 'Volume Mesh' }))
    fireEvent.change(graphics.getByRole('combobox', { name: 'Cut Plane Axis' }), { target: { value: 'Y' } })
    expect(graphics.getByText('Y: 50%')).toBeInTheDocument()
  })

  it('opens global search via button and Ctrl+K, filters categories, and deep-links to formulas and Fluent Solution', () => {
    window.sessionStorage.clear()
    renderApp('/')

    fireEvent.click(screen.getByRole('button', { name: '打开全站搜索' }))
    const modal = within(screen.getByRole('dialog', { name: '全站搜索' }))
    const searchInput = modal.getByRole('searchbox', {
      name: '搜索计算器、CFD 公式、Fluent 控件或报错',
    })

    fireEvent.change(searchInput, { target: { value: 'Smooth/Swap' } })
    fireEvent.click(modal.getByRole('button', { name: /Fluent 求解器/ }))
    fireEvent.click(modal.getAllByRole('option', { name: /Smooth\/Swap/ })[0])

    expect(screen.queryByRole('dialog', { name: '全站搜索' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Smooth/Swap Mesh' })).toBeInTheDocument()

    // Toggle global search via Ctrl+K directly from Solution workbench and jump to formula page
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    const modalAgain = within(screen.getByRole('dialog', { name: '全站搜索' }))
    const searchInputAgain = modalAgain.getByRole('searchbox', {
      name: '搜索计算器、CFD 公式、Fluent 控件或报错',
    })
    fireEvent.change(searchInputAgain, { target: { value: 'Reynolds' } })
    fireEvent.click(modalAgain.getByRole('button', { name: /CFD 公式/ }))
    fireEvent.keyDown(modalAgain.getByRole('searchbox'), { key: 'ArrowDown' })
    fireEvent.keyDown(modalAgain.getByRole('searchbox'), { key: 'Enter' })

    expect(screen.getByRole('heading', { name: 'CFD 公式库' })).toBeInTheDocument()
    expect(
      (screen.getByRole('searchbox', { name: '搜索 CFD 公式' }) as HTMLInputElement).value,
    ).toContain('Reynolds')
  })

  it('supports inline search on CalculatorsPage and FormulaLibraryPage', () => {
    const view1 = renderApp('/calculators')
    const calcSearch = screen.getByRole('searchbox', { name: '搜索参数计算器' })
    fireEvent.change(calcSearch, { target: { value: 'y+' } })
    expect(screen.getByText(/找到 \d+ 个匹配计算器/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'y+ 与第一层网格高度' })).toBeInTheDocument()

    fireEvent.change(calcSearch, { target: { value: '不存在的指标xyz' } })
    expect(screen.getByRole('status')).toHaveTextContent(/未找到/)
    fireEvent.click(screen.getByRole('button', { name: '返回分类视图' }))
    expect(screen.getByRole('region', { name: 'Calculator categories' })).toBeInTheDocument()
    view1.unmount()

    renderApp('/formulas')
    const formulaSearch = screen.getByRole('searchbox', { name: '搜索 CFD 公式' })
    fireEvent.change(formulaSearch, { target: { value: 'Nusselt' } })
    expect(screen.getByText(/共匹配 \d+ 条公式/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '清空筛选' }))
    expect(formulaSearch).toHaveValue('')
  })

  it('supports Solution Help->Troubleshooting sync, QuickSearch TUI/troubleshoot hits, Console history, and Display Options theme sync', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-guide')

    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    fireEvent.click(ribbon.getByRole('button', { name: 'Help' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Troubleshooting' }))

    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))
    expect(guide.getByRole('heading', { name: 'Fluent 常见报错与收敛排查' })).toBeInTheDocument()

    const troubleFilter = guide.getByRole('searchbox', { name: '筛选报错现象' })
    fireEvent.change(troubleFilter, { target: { value: '回流' } })
    expect(guide.getByRole('heading', { name: /Reversed flow/ })).toBeInTheDocument()
    expect(guide.queryByRole('heading', { name: /Floating point exception/ })).not.toBeInTheDocument()

    // QuickSearch runs new TUI command via keyboard
    const quickSearch = screen.getByRole('searchbox', { name: 'Quick Search' })
    fireEvent.focus(quickSearch)
    fireEvent.change(quickSearch, { target: { value: '/mesh/smooth-mesh' } })
    fireEvent.click(screen.getByRole('button', { name: '/mesh/smooth-mesh' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    expect(consolePane.getByText(/Min Orthogonal Quality 0\.21 -> 0\.29/)).toBeInTheDocument()

    // Console ArrowUp/ArrowDown command history + new /solve/report-summary TUI command
    const tuiInput = consolePane.getByRole('textbox', { name: 'TUI 命令输入' })
    fireEvent.change(tuiInput, { target: { value: '/solve/report-summary' } })
    fireEvent.submit(tuiInput.closest('form')!)
    expect(consolePane.getByText(/\[Summary\] 3D pressure-based/)).toBeInTheDocument()
    fireEvent.keyDown(tuiInput, { key: 'ArrowUp' })
    expect(tuiInput).toHaveValue('/solve/report-summary')
    fireEvent.keyDown(tuiInput, { key: 'ArrowDown' })
    expect(tuiInput).toHaveValue('')

    // Two-way sync between Display Options theme and topbar data-theme
    fireEvent.click(ribbon.getByRole('button', { name: 'View' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Display Options' }))
    const displayDlg = within(screen.getByRole('dialog', { name: 'Display Options' }))
    fireEvent.change(displayDlg.getByRole('combobox', { name: 'Workbench Theme' }), {
      target: { value: 'dark' },
    })
    expect(document.querySelector('.fluent-workbench')).toHaveAttribute('data-theme', 'dark')
  })

  it('deep-links directly to Fluent Meshing task and Troubleshooting via URL params', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-meshing?task=wm-boundary-layers&panel=troubleshoot')
    expect(
      screen.getByRole('heading', { name: /Add Boundary Layers/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Fluent Meshing 常见网格故障排查' }),
    ).toBeInTheDocument()
  })

  it('renders Energy & Power Knowledge Center with all 4 courses, SVG diagrams, quizzes, mastery progress, and global search deep-link', () => {
    window.localStorage.clear()
    renderApp('/knowledge')

    const courseNav = within(screen.getByRole('navigation', { name: '能源动力核心课程' }))
    expect(courseNav.getByRole('link', { name: /流体力学/ })).toBeInTheDocument()
    expect(courseNav.getByRole('link', { name: /工程热力学/ })).toBeInTheDocument()
    expect(courseNav.getByRole('link', { name: /传热学/ })).toBeInTheDocument()
    expect(courseNav.getByRole('link', { name: /制冷技术原理/ })).toBeInTheDocument()

    // Switch to Refrigeration -> Vapor Compression topic with P-h diagram and interactive quiz
    fireEvent.click(courseNav.getByRole('link', { name: /制冷技术原理/ }))
    const chapterNav = within(screen.getByRole('navigation', { name: '课程章节导航' }))
    fireEvent.click(chapterNav.getByRole('link', { name: /单级蒸气压缩制冷循环/ }))

    expect(screen.getByRole('img', { name: /单级蒸气压缩制冷四大核心部件流程/ })).toBeInTheDocument()

    // Expand collapsible worked example
    const exampleSection = within(screen.getByRole('region', { name: '经典工程例题' }))
    fireEvent.click(exampleSection.getByRole('button', { name: /查看分步求解/ }))
    expect(exampleSection.getByText(/结论答案：/)).toBeInTheDocument()
    expect(exampleSection.getByRole('button', { name: /收起解析/ })).toHaveAttribute('aria-expanded', 'true')

    const quizSection = within(screen.getByRole('region', { name: '随堂概念自测' }))
    fireEvent.click(quizSection.getByRole('button', { name: /沿垂直等焓线向下移动/ }))
    expect(quizSection.getByRole('status')).toHaveTextContent(/回答正确/)

    // Toggle bookmark & mastery flag
    fireEvent.click(screen.getByRole('button', { name: /收藏重点/ }))
    expect(screen.getByRole('button', { name: /已收藏/ })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '标记已掌握' }))
    expect(screen.getByRole('button', { name: '已掌握 ✓' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText((_, el) => el?.className === 'energy-overall-progress' && /1 \/ 36/.test(el.textContent ?? ''))).toBeInTheDocument()

    // Verify bookmark filter keeps starred topic visible
    const onlyBookmarkedCheckbox = screen.getByRole('checkbox', { name: '仅看收藏' })
    fireEvent.click(onlyBookmarkedCheckbox)
    expect(within(screen.getByRole('navigation', { name: '课程章节导航' })).getByRole('link', { name: /单级蒸气压缩制冷循环/ })).toBeInTheDocument()
    fireEvent.click(onlyBookmarkedCheckbox)

    // Switch to Course Quiz Bank tab and verify score counter reflects answered quiz
    fireEvent.click(screen.getByRole('tab', { name: /本学科刷题自测/ }))
    const quizBank = within(screen.getByRole('region', { name: '制冷技术原理综合刷题自测' }))
    expect(quizBank.getByText(/制冷技术原理专题综合自测（共 18 题）/)).toBeInTheDocument()
    expect(quizBank.getByRole('status')).toHaveTextContent(/回答正确/)

    // Switch to Knowledge Framework Map view and deep-link to Transcritical CO2 topic
    fireEvent.click(screen.getByRole('tab', { name: /知识框架图谱/ }))
    const frameworkView = within(screen.getByLabelText('能源动力学科知识框架总览'))
    expect(frameworkView.getByRole('heading', { name: '三层贯通知识体系架构' })).toBeInTheDocument()
    expect(frameworkView.getByRole('heading', { name: /跨学科物理融通桥梁/ })).toBeInTheDocument()
    fireEvent.click(frameworkView.getByRole('button', { name: '跨临界 CO₂ 循环、冷库冷负荷构成与 IPLV 综合能效' }))
    expect(screen.getByRole('heading', { name: '跨临界 CO₂ 循环、冷库冷负荷构成与 IPLV 综合能效' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /R744/ })).toBeInTheDocument()

    // Inline search across all 4 courses -> Heat Transfer Biot number
    const topicSearch = screen.getByRole('searchbox', { name: '搜索热流体知识点' })
    fireEvent.change(topicSearch, { target: { value: '毕渥数' } })
    fireEvent.click(screen.getByRole('button', { name: /非稳态导热、毕渥数/ }))
    expect(screen.getByRole('heading', { name: /非稳态导热、毕渥数/ })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /平壁双侧对流冷却时/ })).toBeInTheDocument()

    // Global Search Ctrl+K -> Carnot cycle -> Engineering Thermodynamics
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    const modal = within(screen.getByRole('dialog', { name: '全站搜索' }))
    fireEvent.change(modal.getByRole('searchbox'), { target: { value: '卡诺循环' } })
    fireEvent.click(modal.getByRole('button', { name: /热流体工程图解/ }))
    fireEvent.click(modal.getByRole('option', { name: /热力学第二定律、卡诺循环/ }))
    expect(screen.getByRole('img', { name: /T-s 图上的可逆卡诺循环/ })).toBeInTheDocument()
  })

  it('reproduces Fluent 1:1 ribbon submenus, model-conditional Methods/Controls, Dynamic Mesh tabs, and Sutherland material cascade', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-guide')
    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))

    // Domain -> Transform -> Translate… opens Scale dialog directly on Translate tab
    fireEvent.click(ribbon.getByRole('button', { name: 'Transform' }))
    fireEvent.click(within(ribbon.getByRole('group', { name: 'Transform' })).getByRole('button', { name: 'Translate…' }))
    const scaleDlg = within(screen.getByRole('dialog', { name: 'Scale Mesh' }))
    expect(scaleDlg.getByRole('tab', { name: 'Translate' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.change(scaleDlg.getByRole('textbox', { name: 'Translation Offset X (m)' }), { target: { value: '0.25' } })
    fireEvent.click(scaleDlg.getByRole('button', { name: 'Translate' }))
    expect(consolePane.getByText(/Translated mesh by \(0\.25, 0, 0\) m/)).toBeInTheDocument()
    fireEvent.click(scaleDlg.getByRole('button', { name: 'Close Scale Mesh' }))

    // Domain -> Dynamic Mesh opens tabbed dialog and Smoothing cascades Smoothing Method
    fireEvent.click(ribbon.getByRole('button', { name: 'Dynamic Mesh' }))
    const dmDlg = within(screen.getByRole('dialog', { name: 'Dynamic Mesh' }))
    expect(dmDlg.getByRole('tab', { name: 'Mesh Methods' })).toBeInTheDocument()
    expect(dmDlg.getByRole('tab', { name: 'Options' })).toBeInTheDocument()
    expect(dmDlg.queryByRole('combobox', { name: 'Smoothing Method' })).not.toBeInTheDocument()
    fireEvent.click(dmDlg.getByRole('checkbox', { name: 'Smoothing' }))
    expect(dmDlg.getByRole('combobox', { name: 'Smoothing Method' })).toBeInTheDocument()
    fireEvent.click(dmDlg.getByRole('button', { name: 'Close Dynamic Mesh' }))

    // Physics -> Viscous switch drives Solution Methods & Controls equation fields
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Viscous' }))
    const viscousDlg = within(screen.getByRole('dialog', { name: 'Viscous Model' }))
    fireEvent.click(viscousDlg.getByRole('radio', { name: 'k-epsilon' }))
    fireEvent.click(viscousDlg.getByRole('button', { name: 'OK' }))

    // Materials Create/Edit -> Sutherland cascade
    fireEvent.click(ribbon.getByRole('button', { name: 'Create/Edit' }))
    const matDlg = within(screen.getByRole('dialog', { name: 'Create/Edit Materials' }))
    expect(matDlg.queryByRole('textbox', { name: 'Sutherland Reference Temp (K)' })).not.toBeInTheDocument()
    fireEvent.change(matDlg.getByRole('combobox', { name: 'Viscosity Method' }), { target: { value: 'sutherland' } })
    expect(matDlg.getByRole('textbox', { name: 'Sutherland Reference Temp (K)' })).toBeInTheDocument()
    fireEvent.click(matDlg.getByRole('button', { name: 'Close Create/Edit Materials' }))

    // Solution Methods reflects k-epsilon (shows Turbulent Dissipation Rate, hides Specific Dissipation Rate)
    fireEvent.click(outline.getByRole('button', { name: 'Methods' }))
    expect(task.getByRole('combobox', { name: 'Turbulent Dissipation Rate' })).toBeInTheDocument()
    expect(task.queryByRole('combobox', { name: 'Specific Dissipation Rate' })).not.toBeInTheDocument()
    fireEvent.change(task.getByRole('combobox', { name: 'Pressure-Velocity Coupling' }), { target: { value: 'Coupled' } })
    fireEvent.click(outline.getByRole('button', { name: 'Controls' }))
    expect(task.getByRole('textbox', { name: 'Flow Courant Number' })).toBeInTheDocument()
    expect(task.queryByRole('textbox', { name: 'Pressure' })).not.toBeInTheDocument()

    // Solution -> New Report -> Force Report… opens Report Definition pre-selected to Force
    fireEvent.click(ribbon.getByRole('button', { name: 'Solution' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'New Report' }))
    fireEvent.click(within(ribbon.getByRole('group', { name: 'New Report' })).getByRole('button', { name: 'Force Report…' }))
    const repDlg = within(screen.getByRole('dialog', { name: 'Report Definition' }))
    expect(repDlg.getByRole('combobox', { name: 'Report Category' })).toHaveValue('Force')
    expect(repDlg.getByRole('combobox', { name: 'Report Type' })).toHaveValue('Force')
  })

  it('opens nested sub-dialogs, option-triggered dialogs, panel dialogs, and updates British/SI unit presets', () => {
    window.sessionStorage.clear()
    render(
      <MemoryRouter initialEntries={['/fluent-guide']}>
        <App />
      </MemoryRouter>,
    )

    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const consolePane = within(screen.getByRole('region', { name: 'Console' }))

    // 1. Materials option-triggered sub-dialogs + User-Defined Database
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Create/Edit' }))
    const matDlg = within(screen.getByRole('dialog', { name: 'Create/Edit Materials' }))
    fireEvent.change(matDlg.getByRole('combobox', { name: 'Density Method' }), { target: { value: 'polynomial' } })
    const polyDlg = within(screen.getByRole('dialog', { name: 'Polynomial Profile' }))
    fireEvent.click(polyDlg.getByRole('button', { name: 'Close Polynomial Profile' }))
    fireEvent.change(matDlg.getByRole('combobox', { name: 'Viscosity Method' }), { target: { value: 'piecewise-linear' } })
    const pwlDlg = within(screen.getByRole('dialog', { name: 'Piecewise-Linear Profile' }))
    fireEvent.click(pwlDlg.getByRole('button', { name: 'Close Piecewise-Linear Profile' }))
    fireEvent.click(matDlg.getByRole('button', { name: 'User-Defined Database…' }))
    const udbDlg = within(screen.getByRole('dialog', { name: 'User-Defined Database Materials' }))
    fireEvent.click(udbDlg.getByRole('button', { name: 'Copy to Case' }))
    expect(consolePane.getByText(/\[User Database:/)).toBeInTheDocument()
    fireEvent.click(udbDlg.getByRole('button', { name: 'Close User-Defined Database Materials' }))
    fireEvent.click(matDlg.getByRole('button', { name: 'Close Create/Edit Materials' }))

    // 2. Stacked Results sub-dialogs (Contours -> Colormap Options, XY Plot -> Axes)
    fireEvent.click(ribbon.getByRole('button', { name: 'Results' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Contours' }))
    const contourDlg = within(screen.getAllByRole('dialog').at(-1) as HTMLElement)
    fireEvent.click(contourDlg.getByRole('button', { name: 'Colormap Options…' }))
    const cmapDlg = within(screen.getByRole('dialog', { name: 'Colormap Options' }))
    fireEvent.click(cmapDlg.getByRole('button', { name: 'Close Colormap Options' }))
    fireEvent.click(contourDlg.getByRole('button', { name: /^Close / }))

    fireEvent.click(ribbon.getByRole('button', { name: 'XY Plot' }))
    const xyDlg = within(screen.getAllByRole('dialog').at(-1) as HTMLElement)
    fireEvent.click(xyDlg.getByRole('button', { name: 'Axes…' }))
    const axesDlg = within(screen.getByRole('dialog', { name: 'Axes - Solution XY Plot' }))
    fireEvent.click(axesDlg.getByRole('button', { name: 'Close Axes - Solution XY Plot' }))
    fireEvent.click(xyDlg.getByRole('button', { name: /^Close / }))

    // 3. Dynamic Mesh -> Options -> In-Cylinder Settings…
    fireEvent.click(ribbon.getByRole('button', { name: 'Domain' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Dynamic Mesh' }))
    const dmDlg = within(screen.getByRole('dialog', { name: 'Dynamic Mesh' }))
    fireEvent.click(dmDlg.getByRole('tab', { name: 'Options' }))
    expect(dmDlg.queryByRole('button', { name: 'In-Cylinder Settings…' })).not.toBeInTheDocument()
    fireEvent.click(dmDlg.getByRole('checkbox', { name: 'In-Cylinder' }))
    fireEvent.click(dmDlg.getByRole('button', { name: 'In-Cylinder Settings…' }))
    const incylDlg = within(screen.getByRole('dialog', { name: 'In-Cylinder Settings' }))
    fireEvent.click(incylDlg.getByRole('button', { name: 'Close In-Cylinder Settings' }))
    fireEvent.click(dmDlg.getByRole('button', { name: 'Close Dynamic Mesh' }))

    // 4. Case Check & GPU Solver dialogs
    fireEvent.click(ribbon.getByRole('button', { name: 'Solution' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Check Case' }))
    const ccDlg = within(screen.getByRole('dialog', { name: 'Case Check' }))
    fireEvent.click(ccDlg.getByRole('tab', { name: 'Solver' }))
    fireEvent.click(ccDlg.getByRole('button', { name: 'Run Case Check' }))
    expect(consolePane.getByText(/\[Case Check\]/)).toBeInTheDocument()
    fireEvent.click(ccDlg.getByRole('button', { name: 'Close Case Check' }))

    fireEvent.click(ribbon.getByRole('button', { name: 'Parallel' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'GPU Solver' }))
    const gpuDlg = within(screen.getByRole('dialog', { name: 'Native GPU Solver Settings' }))
    fireEvent.click(gpuDlg.getByRole('button', { name: 'Check Physics Compatibility' }))
    expect(consolePane.getByText(/\[GPU Solver\]/)).toBeInTheDocument()
    fireEvent.click(gpuDlg.getByRole('button', { name: 'Close Native GPU Solver Settings' }))

    // 5. Outline panel -> Expression Editor, New Cell Register, Animation Definition
    fireEvent.click(outline.getByRole('button', { name: 'Named Expressions' }))
    fireEvent.click(task.getByRole('button', { name: 'Expression Editor…' }))
    const exprDlg = within(screen.getByRole('dialog', { name: 'Expression Editor' }))
    fireEvent.click(exprDlg.getByRole('button', { name: 'Close Expression Editor' }))

    fireEvent.click(outline.getByRole('button', { name: 'Cell Registers' }))
    fireEvent.click(task.getByRole('button', { name: 'New Cell Register…' }))
    const regDlg = within(screen.getByRole('dialog', { name: 'New Cell Register' }))
    fireEvent.click(regDlg.getByRole('button', { name: 'Close New Cell Register' }))

    fireEvent.click(outline.getByRole('button', { name: 'Animations' }))
    fireEvent.click(task.getByRole('button', { name: 'Solution Animations…' }))
    const animDlg = within(screen.getByRole('dialog', { name: 'Animation Definition' }))
    fireEvent.click(animDlg.getByRole('button', { name: 'Close Animation Definition' }))

    // 6. Units -> British preset + Reset to SI
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Units' }))
    const unitsDlg = within(screen.getAllByRole('dialog').at(-1) as HTMLElement)
    fireEvent.change(unitsDlg.getByRole('combobox', { name: 'Unit System' }), { target: { value: 'British' } })
    expect(unitsDlg.getByRole('combobox', { name: 'Length Unit' })).toHaveValue('ft')
    expect(unitsDlg.getByRole('combobox', { name: 'Pressure Unit' })).toHaveValue('psi')
    expect(unitsDlg.getByRole('combobox', { name: 'Temperature Unit' })).toHaveValue('F')
    fireEvent.click(unitsDlg.getByRole('button', { name: 'Reset to SI' }))
    expect(unitsDlg.getByRole('combobox', { name: 'Length Unit' })).toHaveValue('m')
    expect(unitsDlg.getByRole('combobox', { name: 'Pressure Unit' })).toHaveValue('Pa')
    expect(unitsDlg.getByRole('combobox', { name: 'Temperature Unit' })).toHaveValue('K')
  })

  it('triggers UDS/Material/SpecialBC/FFT multi-tab cascades and renders teaching SVG diagrams', () => {
    window.sessionStorage.clear()
    renderApp('/fluent-guide')

    const ribbon = within(screen.getByRole('navigation', { name: 'Command tabs' }).parentElement!)
    const outline = within(screen.getByRole('complementary', { name: 'Outline' }))
    const task = within(screen.getByRole('region', { name: 'Task Page' }))
    const guide = within(screen.getByRole('complementary', { name: '控件说明' }))

    // 1. User-Defined -> UDM / UDS 2-tab dialog & cross-dialog UDS cascade
    fireEvent.click(ribbon.getByRole('button', { name: 'User-Defined' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'UDM / UDS' }))
    const udmDlg = within(screen.getByRole('dialog', { name: 'User-Defined Memory & Scalars' }))
    expect(udmDlg.getByRole('tab', { name: 'User-Defined Memory' })).toBeInTheDocument()
    fireEvent.click(udmDlg.getByRole('tab', { name: 'User-Defined Scalars' }))
    fireEvent.change(udmDlg.getByRole('combobox', { name: 'Number of User-Defined Scalars' }), {
      target: { value: '2' },
    })
    expect(udmDlg.getByRole('combobox', { name: 'UDS Flux Function' })).toBeInTheDocument()
    expect(guide.getByRole('img')).toBeInTheDocument()
    fireEvent.click(udmDlg.getByRole('button', { name: 'Close User-Defined Memory & Scalars' }))

    // 2. Materials -> UDS Diffusivity unlocked + Cp Method -> NASA Piecewise-Polynomial sub-dialog
    fireEvent.click(ribbon.getByRole('button', { name: 'Physics' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'Create/Edit' }))
    const matDlg = within(screen.getByRole('dialog', { name: 'Create/Edit Materials' }))
    expect(matDlg.getByRole('textbox', { name: 'UDS Diffusivity (kg/m·s)' })).toBeInTheDocument()
    fireEvent.change(matDlg.getByRole('combobox', { name: 'Cp Method' }), {
      target: { value: 'piecewise-polynomial' },
    })
    const nasaDlg = within(screen.getByRole('dialog', { name: 'NASA Piecewise-Polynomial Profile' }))
    expect(nasaDlg.getByRole('textbox', { name: 'Coefficient a1' })).toBeInTheDocument()
    fireEvent.click(nasaDlg.getByRole('button', { name: 'Close NASA Piecewise-Polynomial Profile' }))
    fireEvent.click(matDlg.getByRole('button', { name: 'Close Create/Edit Materials' }))

    // 3. Viscous dialog keeps no tablist while rendering inline mechanism summary & collapsible SVG + Lightbox zoom
    fireEvent.click(ribbon.getByRole('button', { name: 'Viscous' }))
    const viscousDlg = within(screen.getByRole('dialog', { name: 'Viscous Model' }))
    expect(viscousDlg.queryByRole('tablist')).not.toBeInTheDocument()
    expect(viscousDlg.getByText(/当前活跃模型/)).toBeInTheDocument()
    expect(viscousDlg.getByRole('img')).toBeInTheDocument()
    fireEvent.click(viscousDlg.getByRole('button', { name: /放大查看：湍流解析尺度谱系/ }))
    const lightbox = within(screen.getByRole('dialog', { name: /^大图预览：湍流解析尺度谱系/ }))
    expect(lightbox.getByText('100%')).toBeInTheDocument()
    fireEvent.click(lightbox.getByRole('button', { name: '放大图解' }))
    expect(lightbox.getByText('125%')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: /^大图预览：/ })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Viscous Model' })).toBeInTheDocument()
    fireEvent.click(viscousDlg.getByRole('button', { name: 'Close Viscous Model' }))

    // Wide ExplanationPane toggle on Solution workbench
    const wideToggle = screen.getByRole('button', { name: '切换教学说明面板宽度' })
    expect(wideToggle).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(wideToggle)
    expect(wideToggle).toHaveAttribute('aria-pressed', 'true')
    expect(document.querySelector('.fluent-solver-main-grid.fluent-guide-wide')).toBeInTheDocument()

    // 4. Boundary Conditions -> Velocity Inlet UDS tab & Radiator multi-tab + Radiator Curve sub-dialog
    fireEvent.click(outline.getByRole('button', { name: 'Boundary Conditions' }))
    fireEvent.click(task.getByRole('button', { name: 'Velocity Inlet' }))
    const viDlg = within(screen.getByRole('dialog', { name: 'Velocity Inlet' }))
    fireEvent.click(viDlg.getByRole('tab', { name: 'UDS' }))
    expect(viDlg.getByRole('combobox', { name: 'UDS Boundary Condition' })).toBeInTheDocument()
    fireEvent.click(viDlg.getByRole('button', { name: 'Close Velocity Inlet' }))

    fireEvent.click(task.getByRole('button', { name: 'Radiator' }))
    const radDlg = within(screen.getByRole('dialog', { name: 'Radiator' }))
    expect(radDlg.getByRole('tab', { name: 'Momentum' })).toBeInTheDocument()
    expect(radDlg.getByRole('tab', { name: /Thermal/ })).toBeInTheDocument()
    expect(radDlg.getByRole('tab', { name: 'UDS' })).toBeInTheDocument()
    fireEvent.change(radDlg.getByRole('combobox', { name: 'Loss Coefficient Method' }), {
      target: { value: 'polynomial' },
    })
    const radCurveDlg = within(screen.getByRole('dialog', { name: 'Radiator Loss & Heat-Transfer Curve' }))
    fireEvent.click(radCurveDlg.getByRole('button', { name: 'Close Radiator Loss & Heat-Transfer Curve' }))
    fireEvent.click(radDlg.getByRole('button', { name: 'Close Radiator' }))

    // 5. Results -> FFT 2-tab dialog
    fireEvent.click(ribbon.getByRole('button', { name: 'Results' }))
    fireEvent.click(ribbon.getByRole('button', { name: 'FFT' }))
    const fftDlg = within(screen.getByRole('dialog', { name: 'Fourier Transform (FFT)' }))
    expect(fftDlg.getByRole('tab', { name: 'Signal & Window' })).toBeInTheDocument()
    fireEvent.click(fftDlg.getByRole('tab', { name: 'Axes Options' }))
    expect(fftDlg.getByRole('checkbox', { name: 'Logarithmic Frequency Axis' })).toBeInTheDocument()
  })

  it('opens standalone lightbox preview for EnergyKnowledgeDiagram figures on /knowledge', () => {
    renderApp('/knowledge')
    const zoomBtn = screen.getByRole('button', { name: /^放大查看：/ })
    fireEvent.click(zoomBtn)
    const lightbox = within(screen.getByRole('dialog', { name: /^大图预览：/ }))
    fireEvent.click(lightbox.getByRole('button', { name: '深色图纸' }))
    expect(lightbox.getByRole('button', { name: '浅色图纸' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(lightbox.getByRole('button', { name: '关闭大图预览' }))
    expect(screen.queryByRole('dialog', { name: /^大图预览：/ })).not.toBeInTheDocument()
  })
})
