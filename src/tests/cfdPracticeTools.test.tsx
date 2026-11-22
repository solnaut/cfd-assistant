import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { gridConvergence, inletTurbulence } from '../calculators/cfdEngineering'
import { calculate } from '../calculators/implementations'
import { getCalculator } from '../calculators/registry'
import { braytonCycle, rateExchanger, refrigerationCycle, sizeExchanger } from '../calculators/thermalLaboratory'
import { fluentMockLayout } from '../fluentMock/fluentLayoutData'
import { diagnosisPaths, getModelRecommendations, initialSelection } from '../knowledge/cfdPractice'
import { searchGlobalIndex } from '../search/globalSearchIndex'
import { convertIdealGasFlow, convertPressure } from '../units/engineeringConversions'

function open(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

describe('CFD engineering tools', () => {
  it('agrees across the two inlet methods and uses the configured length units', () => {
    const estimate = inletTurbulence(10, 5, 1.225, 1.7894e-5, { diameter: 0.1 })
    expect(estimate.k).toBeCloseTo(0.375)
    expect(estimate.length).toBeCloseTo(0.007)
    const equivalent = inletTurbulence(10, 5, 1.225, 1.7894e-5, { viscosityRatio: estimate.viscosityRatio })
    expect(equivalent.epsilon).toBeCloseTo(estimate.epsilon)
    expect(equivalent.omega).toBeCloseTo(estimate.omega)

    const calculator = getCalculator('inlet-turbulence')!
    const inputs = { speed: { value: 36, unitId: 'km/h' }, intensity: { value: 5 }, diameter: { value: 100, unitId: 'mm' }, density: { value: 1.225 }, viscosity: { value: 1.7894e-5 } }
    expect(calculate(calculator, inputs).outputs.find(({ id }) => id === 'length')?.value).toBeCloseTo(0.007)
    expect(() => calculate(calculator, { ...inputs, intensity: { value: 101 } })).toThrow(/湍流强度/)
  })

  it('recovers a known unequal-ratio convergence order and rejects oscillation', () => {
    const result = gridConvergence(3, [1728000, 512000, 216000], [100.25, 100.5625, 101])
    expect(result.order).toBeCloseTo(2, 10)
    expect(result.extrapolation).toBeCloseTo(100, 10)
    expect(result.gciFine).toBeCloseTo(0.31172, 4)
    expect(result.rangeRatio).toBeCloseTo(0.997, 3)
    expect(() => gridConvergence(2, [1600, 400, 100], [5, 4, 6])).toThrow(/振荡/)
    expect(() => gridConvergence(2, [100, 400, 1600], [5, 4, 6])).toThrow(/正整数/)
  })

  it('converts pressure basis and ideal-gas flow using absolute state', () => {
    expect(convertPressure(0, 'Pa', 'bar', 'gauge', 'absolute', 101.325)).toBeCloseTo(1.01325, 9)
    expect(convertPressure(1, 'atm', 'kPa', 'absolute', 'gauge', 101.325)).toBeCloseTo(0, 9)
    expect(() => convertPressure(-200, 'kPa', 'bar', 'gauge', 'absolute', 101.325)).toThrow(/绝压低于/)
    expect(convertIdealGasFlow(3600, 'm^3/h', 'm^3/s', 100, 0, 200, 0)).toBeCloseTo(0.5, 9)
  })

  it('uses actual Fluent control IDs for mixed cases and diagnostics', () => {
    const controls = new Set([...fluentMockLayout.allControls, ...fluentMockLayout.dialogs.flatMap(({ controls }) => controls)].map(({ id }) => id))
    const actions = getModelRecommendations({ ...initialSelection, phases: 'eulerian', compressibility: 'shock', motion: 'sliding', thermal: 'radiation' })
    expect(actions.map(({ controlId }) => controlId)).toContain('general-pressure-based')
    expect(actions.map(({ controlId }) => controlId)).toContain('general-transient')
    expect(actions.map(({ detail }) => detail).join(' ')).toContain('Phase Coupled SIMPLE')
    const particles = getModelRecommendations({ ...initialSelection, phases: 'particles', compressibility: 'shock' })
    for (const { controlId } of [...actions, ...particles, ...getModelRecommendations(initialSelection), ...diagnosisPaths.flatMap(({ steps }) => steps)]) {
      expect(controls.has(controlId), controlId).toBe(true)
    }
  })

  it('links the worksheet to a Fluent setting and tracks a symptom checklist', () => {
    const rendered = open('/cfd-practice')
    fireEvent.change(screen.getByRole('combobox', { name: '相态' }), { target: { value: 'interface' } })
    expect(screen.getByRole('heading', { name: 'VOF' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: '不收敛与报错排查' }))
    fireEvent.change(screen.getByRole('combobox', { name: '当前症状' }), { target: { value: 'temperature-limit' } })
    fireEvent.click(screen.getByRole('checkbox', { name: '追查热边界和温度单位' }))
    expect(screen.getByRole('status')).toHaveTextContent('已核查 1 / 3 项')
    fireEvent.click(within(screen.getByText('追查热边界和温度单位').closest('li')!).getByRole('link', { name: /定位 Fluent/ }))
    expect(screen.getByRole('dialog', { name: 'Wall' })).toBeInTheDocument()
    rendered.unmount()
    open('/cfd-practice?mode=diagnosis&symptom=temperature-limit')
    expect(screen.getByRole('checkbox', { name: '追查热边界和温度单位' })).toBeChecked()
    sessionStorage.removeItem('cfd-assistant:diagnosis:v1:temperature-limit')
  })

  it('updates gauge conversion result and indexes every new tool', () => {
    open('/unit-converter')
    fireEvent.change(screen.getByRole('spinbutton', { name: '输入数值' }), { target: { value: '0' } })
    fireEvent.change(screen.getByRole('combobox', { name: '输入压力基准' }), { target: { value: 'gauge' } })
    expect(screen.getByLabelText('换算结果')).toHaveTextContent('101.325 kPa（绝压）')
    expect(searchGlobalIndex('GCI', 'calculator').some(({ item }) => item.to.endsWith('/grid-convergence-gci'))).toBe(true)
    expect(searchGlobalIndex('R134a', 'knowledge').some(({ item }) => item.to === '/thermal-lab?experiment=refrigeration')).toBe(true)
    expect(searchGlobalIndex('多相流界面', 'troubleshoot').some(({ item }) => item.to.endsWith('symptom=vof-instability'))).toBe(true)
  })
})

describe('thermal laboratory', () => {
  it('honours ideal Brayton efficiency and evaluates R134a against a held-out CoolProp point', () => {
    const cycle = braytonCycle(20, 1050, 10, 1, 1)
    expect(cycle.efficiency).toBeCloseTo(cycle.idealEfficiency, 10)
    expect(cycle.states[0].x).toBeCloseTo(cycle.states[1].x, 10)
    const refrigerator = refrigerationCycle(-4.2, 41.1, 6.2, 3.4, 0.77)
    expect(refrigerator.cop).toBeCloseTo(3.72021, 2)
    expect(Math.abs(refrigerator.dischargeC - 60.76544)).toBeLessThan(0.15)
    expect(refrigerator.rejectedHeat).toBeCloseTo(refrigerator.cooling + refrigerator.work, 10)
    expect(refrigerator.states[2].h).toBe(refrigerator.states[3].h)
  })

  it('conserves heat in each flow direction and handles the equal-temperature-difference limit', () => {
    const counter = rateExchanger('counter', 100, 20, 5, 5, 10)
    const parallel = rateExchanger('parallel', 100, 20, 5, 5, 10)
    const cross = rateExchanger('cross', 100, 20, 5, 5, 10)
    expect(counter.effectiveness).toBeCloseTo(2 / 3, 8)
    expect(cross.effectiveness).toBeGreaterThan(parallel.effectiveness)
    expect(cross.effectiveness).toBeLessThan(counter.effectiveness)
    expect(cross.heat).toBeCloseTo(5 * (cross.coldOut - 20), 8)
    const sized = sizeExchanger('counter', 100, counter.hotOut, 20, counter.coldOut, counter.heat, 0.5, 1)
    expect(sized.area).toBeCloseTo(20, 8)
    expect(sized.lmtd).toBeCloseTo(counter.heat / 10, 8)
    expect(() => sizeExchanger('parallel', 100, 40, 20, 60, 10, 0.5, 1)).toThrow(/端温差/)
  })

  it('recomputes the refrigeration chart and opens the exchanger sizing controls', () => {
    open('/thermal-lab?experiment=refrigeration')
    const cop = () => screen.getByText('制冷 COP', { selector: 'dt' }).nextElementSibling?.textContent
    const initial = cop()
    expect(screen.getByRole('img', { name: /R134a 压焓图/ })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider', { name: '冷凝温度' }), { target: { value: '50' } })
    expect(cop()).not.toBe(initial)
    fireEvent.click(screen.getByRole('link', { name: '换热器 LMTD 与 ε–NTU' }))
    fireEvent.change(screen.getByRole('combobox', { name: '计算方式' }), { target: { value: 'size' } })
    expect(screen.getByText('所需面积')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: '流向' }), { target: { value: 'cross' } })
    expect(screen.getByRole('slider', { name: /叉流修正因子/ })).toBeInTheDocument()
  })
})
