import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EngineeringChart } from '../components/EngineeringChart'
import PageHeader from '../components/PageHeader'
import { braytonCycle, rateExchanger, refrigerationCycle, r134aSaturationCurve, sizeExchanger, type FlowArrangement } from '../calculators/thermalLaboratory'
import { thermalLabs } from '../knowledge/thermalLabs'

type SliderConfig = { id: string; label: string; min: number; max: number; step?: number; initial: number; unit?: string }

function useLabInputs(fields: SliderConfig[]) {
  const defaults = Object.fromEntries(fields.map(({ id, initial }) => [id, initial]))
  const [values, setValues] = useState(defaults)
  return { values, change: (id: string, value: number) => setValues((previous) => ({ ...previous, [id]: value })), reset: () => setValues(defaults) }
}

function LabSliders({ fields, inputs }: { fields: SliderConfig[]; inputs: ReturnType<typeof useLabInputs> }) {
  return (
    <div className="engineering-sliders">
      {fields.map(({ id, label, min, max, step, unit }) => (
        <label key={id}>
          <span>{label} <strong aria-hidden="true">{inputs.values[id]} {unit}</strong></span>
          <input type="range" min={min} max={max} step={step ?? 1} value={inputs.values[id]} aria-label={label}
            aria-valuetext={unit ? `${inputs.values[id]} ${unit}` : undefined}
            onChange={(event) => inputs.change(id, event.target.valueAsNumber)} />
        </label>
      ))}
      <button type="button" className="ghost-button" onClick={inputs.reset}>恢复示例参数</button>
    </div>
  )
}

function Metrics({ items }: { items: readonly [string, number, string][] }) {
  return (
    <dl className="engineering-metrics" aria-label="实验结果" aria-live="polite">
      {items.map(([label, value, unit]) => (
        <div key={label}><dt>{label}</dt><dd>{Number(value.toPrecision(5))} <span>{unit}</span></dd></div>
      ))}
    </dl>
  )
}

function tryExperiment<T>(run: () => T): { value: T; error?: never } | { value?: never; error: string } {
  try {
    return { value: run() }
  } catch (cause) {
    return { error: cause instanceof Error ? cause.message : '当前工况无法计算。' }
  }
}

const braytonFields: SliderConfig[] = [
  { id: 'inlet', label: '压缩机入口温度', min: 0, max: 50, initial: 20, unit: '°C' },
  { id: 'turbineInlet', label: '透平入口温度', min: 400, max: 1400, step: 10, initial: 1050, unit: '°C' },
  { id: 'ratio', label: '压比', min: 2, max: 35, step: 0.5, initial: 10 },
  { id: 'compressor', label: '压缩机等熵效率', min: 50, max: 100, initial: 85, unit: '%' },
  { id: 'turbine', label: '透平等熵效率', min: 55, max: 100, initial: 90, unit: '%' },
]

function BraytonLab() {
  const inputs = useLabInputs(braytonFields)
  const { inlet, turbineInlet, ratio, compressor, turbine } = inputs.values
  const result = tryExperiment(() => braytonCycle(inlet, turbineInlet, ratio, compressor / 100, turbine / 100))
  const cycle = result.value
  return (
    <div className="engineering-columns">
      <section className="engineering-panel" aria-label="布雷顿循环参数"><LabSliders fields={braytonFields} inputs={inputs} /></section>
      <section className="engineering-panel" aria-label="布雷顿循环结果">
        {cycle ? <>
          <EngineeringChart title="布雷顿循环 T–s 图" xLabel="相对比熵 (kJ/(kg·K))" yLabel="温度 (K)" series={[
            { points: cycle.diagram, color: '#045d72' },
            { points: cycle.states.map((point, index) => ({ ...point, label: String(index + 1) })), color: '#045d72', markersOnly: true },
          ]} />
          <Metrics items={[
            ['净比功', cycle.netWork, 'kJ/kg'], ['热效率', cycle.efficiency * 100, '%'], ['同压比理想热效率', cycle.idealEfficiency * 100, '%'],
            ['压缩机比功', cycle.compressorWork, 'kJ/kg'], ['透平比功', cycle.turbineWork, 'kJ/kg'],
          ]} />
          <p>1→2 压缩 · 2→3 定压加热 · 3→4 膨胀 · 4→1 定压放热。</p>
        </> : <p className="engineering-error" role="alert">{result.error}</p>}
        <p>采用定比热理想空气，忽略压降与热损失。压缩和膨胀线连接计算所得状态点。</p>
      </section>
    </div>
  )
}

const refrigerationFields: SliderConfig[] = [
  { id: 'evap', label: '蒸发温度', min: -20, max: 10, step: 0.5, initial: -5, unit: '°C' },
  { id: 'cond', label: '冷凝温度', min: 25, max: 55, step: 0.5, initial: 40, unit: '°C' },
  { id: 'superheat', label: '吸气过热度', min: 0, max: 20, step: 0.5, initial: 5, unit: 'K' },
  { id: 'subcool', label: '液体过冷度', min: 0, max: 15, step: 0.5, initial: 5, unit: 'K' },
  { id: 'compressor', label: '压缩机等熵效率', min: 55, max: 100, initial: 75, unit: '%' },
]

function RefrigerationLab() {
  const inputs = useLabInputs(refrigerationFields)
  const { evap, cond, superheat, subcool, compressor } = inputs.values
  const result = tryExperiment(() => refrigerationCycle(evap, cond, superheat, subcool, compressor / 100))
  const cycle = result.value
  return (
    <div className="engineering-columns">
      <section className="engineering-panel" aria-label="制冷循环参数"><LabSliders fields={refrigerationFields} inputs={inputs} /></section>
      <section className="engineering-panel" aria-label="制冷循环结果">
        {cycle ? <>
          <EngineeringChart title="R134a 压焓图" xLabel="比焓 (kJ/kg)" yLabel="绝压 (kPa，对数轴)"
            yFormat={(value) => Math.round(10 ** value).toString()} series={[
              { points: r134aSaturationCurve, color: '#697d8e', name: '饱和液线与饱和蒸气线', dashed: true },
              { points: [...cycle.states, cycle.states[0]].map(({ h, p }, index) => ({ x: h, y: Math.log10(p), label: index < 4 ? String(index + 1) : undefined })), color: '#046773', name: '制冷循环状态点' },
            ]} />
          <Metrics items={[
            ['制冷 COP', cycle.cop, ''], ['逆卡诺 COP（蒸发/冷凝温度基准）', cycle.carnotCop, ''], ['单位质量制冷量', cycle.cooling, 'kJ/kg'],
            ['单位质量压缩功', cycle.work, 'kJ/kg'], ['单位质量放热量', cycle.rejectedHeat, 'kJ/kg'], ['排气温度', cycle.dischargeC, '°C'],
          ]} />
          <p>1→2 压缩 · 2→3 冷凝与过冷 · 3→4 等焓节流 · 4→1 蒸发与过热。</p>
        </> : <p className="engineering-error" role="alert">{result.error}</p>}
        <p>采用 CoolProp 7.2.0 的 R134a 教学物性表插值，假定管路无压降。冷凝/蒸发温度表示制冷剂的饱和温度。</p>
      </section>
    </div>
  )
}

const ratingFields: SliderConfig[] = [
  { id: 'hot', label: '热流入口温度', min: 30, max: 130, initial: 90, unit: '°C' },
  { id: 'cold', label: '冷流入口温度', min: 0, max: 80, initial: 20, unit: '°C' },
  { id: 'hotCapacity', label: '热流热容率', min: 0.5, max: 15, step: 0.1, initial: 4, unit: 'kW/K' },
  { id: 'coldCapacity', label: '冷流热容率', min: 0.5, max: 15, step: 0.1, initial: 3, unit: 'kW/K' },
  { id: 'coefficient', label: '总传热系数 U', min: 0.05, max: 3, step: 0.05, initial: 0.5, unit: 'kW/(m²·K)' },
  { id: 'area', label: '换热面积 A', min: 0.5, max: 80, step: 0.5, initial: 10, unit: 'm²' },
]

const sizingFields: SliderConfig[] = [
  ratingFields[0],
  { id: 'hotOut', label: '热流出口温度', min: 10, max: 120, initial: 60, unit: '°C' },
  ratingFields[1],
  { id: 'coldOut', label: '冷流出口温度', min: 10, max: 120, initial: 50, unit: '°C' },
  { id: 'heat', label: '换热负荷', min: 1, max: 300, initial: 100, unit: 'kW' },
  ratingFields[4],
  { id: 'correction', label: '已知叉流修正因子 F', min: 0.1, max: 1, step: 0.01, initial: 0.9 },
]

function ExchangerLab() {
  const [arrangement, setArrangement] = useState<FlowArrangement>('counter')
  const [sizing, setSizing] = useState(false)
  const rating = useLabInputs(ratingFields)
  const sizingInputs = useLabInputs(sizingFields)
  const { hot, cold, hotCapacity, coldCapacity, coefficient, area } = rating.values
  const design = sizingInputs.values
  const result = sizing ? tryExperiment(() => ({ kind: 'size' as const, ...sizeExchanger(arrangement, design.hot, design.hotOut, design.cold, design.coldOut, design.heat, design.coefficient, design.correction) }))
    : tryExperiment(() => ({ kind: 'rate' as const, ...rateExchanger(arrangement, hot, cold, hotCapacity, coldCapacity, coefficient * area) }))
  const data = result.value
  const cross = arrangement === 'cross'
  const counter = arrangement === 'counter'
  const fields = sizing ? sizingFields.filter(({ id }) => cross || id !== 'correction') : ratingFields
  const metrics: [string, number, string][] = !data ? [] : data.kind === 'rate'
    ? [['换热负荷', data.heat, 'kW'], ['热流出口温度', data.hotOut, '°C'], ['冷流出口温度', data.coldOut, '°C'],
      ['热效能', data.effectiveness * 100, '%'], ['NTU', data.ntu, '']]
    : [['LMTD（基准）', data.lmtd, 'K'], ['有效平均温差', data.adjustedLmtd, 'K'], ['所需面积', data.area, 'm²']]
  if (data?.kind === 'rate' && data.lmtd !== undefined) metrics.push(['LMTD', data.lmtd, 'K'])
  if (data?.pinch !== undefined) metrics.push(['最小端温差（Pinch）', data.pinch, 'K'])
  const profile = (values: number[]) => values.map((y, index) => ({ x: 100 * index / (values.length - 1), y }))
  const hotEnd = data ? data.hotProfile.length - 1 : 0
  const pinchIndex = data && data.hotProfile[0] - data.coldProfile[0] <= data.hotProfile[hotEnd] - data.coldProfile[hotEnd] ? 0 : hotEnd
  const pinchLine = data?.pinch !== undefined ? [{ color: '#516373', dashed: true, name: '最小端温差', points: [
    { x: pinchIndex === 0 ? 0 : 100, y: data.hotProfile[pinchIndex] },
    { x: pinchIndex === 0 ? 0 : 100, y: data.coldProfile[pinchIndex] },
  ] }] : []

  return (
    <div className="engineering-columns">
      <section className="engineering-panel" aria-label="换热器参数">
        <div className="engineering-fields">
          <label>计算方式<select value={sizing ? 'size' : 'rate'} onChange={(event) => setSizing(event.target.value === 'size')}>
            <option value="rate">已知 UA · ε–NTU 校核</option><option value="size">已知进出口温度 · LMTD 估算面积</option>
          </select></label>
          <label>流向<select value={arrangement} onChange={(event) => setArrangement(event.target.value as FlowArrangement)}>
            <option value="counter">逆流</option><option value="parallel">顺流</option><option value="cross">叉流（两侧不混合）</option>
          </select></label>
        </div>
        <LabSliders fields={fields} inputs={sizing ? sizingInputs : rating} />
      </section>
      <section className="engineering-panel" aria-label="换热器结果">
        {data ? <>
          <EngineeringChart title={cross ? (sizing ? '冷热流道端温示意' : '两流道各自方向的平均温度') : '沿热流方向的冷热温度'} xLabel={cross ? '沿各自流向的进度 (%)' : '沿热侧面积进度 (%)'} yLabel="温度 (°C)" series={[
            { points: profile(data.hotProfile), color: '#a43a2b', name: '热流' },
            { points: profile(data.coldProfile), color: '#166995', name: counter ? '冷流（右侧入口）' : '冷流' },
            ...pinchLine,
          ]} />
          <Metrics items={metrics} />
        </> : <p className="engineering-error" role="alert">{result.error}</p>}
        <p>假定稳态、无相变、恒定物性和总传热系数，忽略向外界散热。{cross && (sizing
          ? '叉流面积按逆流基准温差与已知修正因子 F 估算。图中仅连接进出口温度。F 应来自该换热器的流型关系或图表。'
          : '叉流采用 64×64 分区近似。两条曲线的横坐标分别沿各自流向。')}</p>
      </section>
    </div>
  )
}

export default function ThermalLabPage() {
  const [params] = useSearchParams()
  const active = thermalLabs.find(({ id }) => id === params.get('experiment')) ?? thermalLabs[0]
  return (
    <div className="page engineering-page">
      <PageHeader title="热工交互实验室" description="拖动参数，观察热力循环、制冷循环和换热器的状态与性能变化。" />
      <nav className="engineering-tabs" aria-label="热工实验">
        {thermalLabs.map(({ id, title }) => <Link key={id} to={`/thermal-lab?experiment=${id}`} aria-current={id === active.id ? 'page' : undefined}>{title}</Link>)}
      </nav>
      <h2>{active.title}</h2>
      <p>{active.description}</p>
      {active.id === 'brayton' ? <BraytonLab /> : active.id === 'refrigeration' ? <RefrigerationLab /> : <ExchangerLab />}
      <div className="engineering-links engineering-lab-footer">
        <Link to={active.lesson}>阅读相关知识</Link>
        <a href={active.source.url} target="_blank" rel="noreferrer">{active.source.label} ↗</a>
      </div>
    </div>
  )
}
