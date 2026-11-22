import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { convertValue, getUnitDisplaySymbol, getUnits, type UnitCategory } from '../units/conversions'
import { convertIdealGasFlow, convertPressure } from '../units/engineeringConversions'

const categories: { id: UnitCategory; label: string }[] = [
  { id: 'pressure', label: '压力' }, { id: 'power', label: '热功率与冷量' },
  { id: 'dynamicViscosity', label: '动力黏度' }, { id: 'kinematicViscosity', label: '运动黏度' },
  { id: 'heatTransferCoefficient', label: '换热系数' }, { id: 'heatFlux', label: '热流密度' },
  { id: 'volumeFlowRate', label: '体积流量' }, { id: 'massFlowRate', label: '质量流量' },
  { id: 'temperature', label: '温度' }, { id: 'temperatureDifference', label: '温差' },
  { id: 'length', label: '长度' }, { id: 'velocity', label: '速度' }, { id: 'density', label: '密度' },
]

function finiteInput(raw: string) {
  if (!raw.trim() || !Number.isFinite(Number(raw))) throw new Error('请填写有限数值。')
  return Number(raw)
}

function ConversionForm({ category }: { category: UnitCategory }) {
  const units = getUnits(category)
  const [value, setValue] = useState('1')
  const [fromUnit, setFromUnit] = useState(units[0].id)
  const [toUnit, setToUnit] = useState(units[1]?.id ?? units[0].id)
  const [fromGauge, setFromGauge] = useState(false)
  const [toGauge, setToGauge] = useState(false)
  const [reference, setReference] = useState('101.325')
  const [correctFlow, setCorrectFlow] = useState(false)
  const [fromPressure, setFromPressure] = useState('101.325')
  const [fromTemperature, setFromTemperature] = useState('0')
  const [toPressure, setToPressure] = useState('101.325')
  const [toTemperature, setToTemperature] = useState('20')

  let displayResult = ''
  let error = ''
  try {
    const input = finiteInput(value)
    const result = category === 'pressure'
      ? convertPressure(input, fromUnit, toUnit, fromGauge ? 'gauge' : 'absolute', toGauge ? 'gauge' : 'absolute', fromGauge || toGauge ? finiteInput(reference) : 101.325)
      : category === 'volumeFlowRate' && correctFlow
        ? convertIdealGasFlow(input, fromUnit, toUnit, finiteInput(fromPressure), finiteInput(fromTemperature), finiteInput(toPressure), finiteInput(toTemperature))
        : convertValue(input, fromUnit, toUnit, category)
    if (!Number.isFinite(result)) throw new Error('结果超出可显示范围。')
    displayResult = `${Number(result.toPrecision(10))} ${getUnitDisplaySymbol(category, toUnit)}`
    if (category === 'pressure') displayResult += toGauge ? '（表压）' : '（绝压）'
  } catch (cause) {
    error = cause instanceof Error ? cause.message : '换算失败。'
  }

  return (
    <div className="engineering-fields">
      <label>输入数值<input type="number" step="any" value={value} onChange={(event) => setValue(event.target.value)} /></label>
      <label>输入单位<select value={fromUnit} onChange={(event) => setFromUnit(event.target.value)}>
        {units.map(({ id }) => <option value={id} key={id}>{getUnitDisplaySymbol(category, id)}</option>)}
      </select></label>
      <label>输出单位<select value={toUnit} onChange={(event) => setToUnit(event.target.value)}>
        {units.map(({ id }) => <option value={id} key={id}>{getUnitDisplaySymbol(category, id)}</option>)}
      </select></label>
      <button type="button" className="ghost-button" onClick={() => {
        setFromUnit(toUnit)
        setToUnit(fromUnit)
        setFromGauge(toGauge)
        setToGauge(fromGauge)
        setFromPressure(toPressure)
        setToPressure(fromPressure)
        setFromTemperature(toTemperature)
        setToTemperature(fromTemperature)
      }}>交换输入与输出单位</button>

      {category === 'pressure' && <>
        <label>输入压力基准<select value={fromGauge ? 'gauge' : 'absolute'} onChange={(event) => setFromGauge(event.target.value === 'gauge')}>
          <option value="absolute">绝压</option><option value="gauge">表压</option>
        </select></label>
        <label>输出压力基准<select value={toGauge ? 'gauge' : 'absolute'} onChange={(event) => setToGauge(event.target.value === 'gauge')}>
          <option value="absolute">绝压</option><option value="gauge">表压</option>
        </select></label>
        {(fromGauge || toGauge) && <label>参考绝压 (kPa)<input type="number" step="any" value={reference} onChange={(event) => setReference(event.target.value)} /></label>}
      </>}

      {category === 'volumeFlowRate' && <>
        <label className="engineering-check"><input type="checkbox" checked={correctFlow} onChange={(event) => setCorrectFlow(event.target.checked)} /> 标况与工况换算（理想气体）</label>
        {correctFlow && <>
          <label>输入侧绝压 (kPa)<input type="number" step="any" value={fromPressure} onChange={(event) => setFromPressure(event.target.value)} /></label>
          <label>输入侧温度 (°C)<input type="number" step="any" value={fromTemperature} onChange={(event) => setFromTemperature(event.target.value)} /></label>
          <label>输出侧绝压 (kPa)<input type="number" step="any" value={toPressure} onChange={(event) => setToPressure(event.target.value)} /></label>
          <label>输出侧温度 (°C)<input type="number" step="any" value={toTemperature} onChange={(event) => setToTemperature(event.target.value)} /></label>
          <p className="engineering-wide">按气体质量流量不变换算。标况定义随行业变化，请按需要指定绝压和温度。</p>
        </>}
      </>}

      {error ? <p className="engineering-error engineering-wide" role="alert">{error}</p>
        : <output aria-label="换算结果" className="engineering-result engineering-wide">{displayResult}</output>}
    </div>
  )
}

export default function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('pressure')
  return (
    <div className="page engineering-page">
      <PageHeader title="工程单位换算器" description="换算常用 CFD 与热工单位，可选绝压、表压和理想气体流量基准。" />
      <section className="engineering-panel" aria-label="工程单位换算">
        <label className="engineering-field">物理量<select value={category} onChange={(event) => setCategory(event.target.value as UnitCategory)}>
          {categories.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </select></label>
        <ConversionForm key={category} category={category} />
      </section>
    </div>
  )
}
