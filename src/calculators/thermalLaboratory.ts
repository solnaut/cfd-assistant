import r134a from './r134aTeachingData.json'

export function braytonCycle(inletC: number, turbineInletC: number, pressureRatio: number, compressorEfficiency: number, turbineEfficiency: number) {
  const cp = 1.005
  const gamma = 1.4
  const gasConstant = cp * (1 - 1 / gamma)
  const temperatureRatio = pressureRatio ** (1 - 1 / gamma)
  const t1 = inletC + 273.15
  const t3 = turbineInletC + 273.15
  const t2 = t1 + (t1 * temperatureRatio - t1) / compressorEfficiency
  const t4 = t3 - turbineEfficiency * (t3 - t3 / temperatureRatio)
  if (t3 <= t2) throw new Error('压缩机出口已达到或超过透平入口温度。请降低压比、提高压缩机效率或提高透平入口温度。')
  const compressorWork = cp * (t2 - t1)
  const turbineWork = cp * (t3 - t4)
  const netWork = turbineWork - compressorWork
  if (netWork <= 0) throw new Error('该工况的透平功不足以驱动压缩机，请调整压比、效率或透平入口温度。')
  const heatInput = cp * (t3 - t2)
  const entropy = (temperature: number, pressure: number) => cp * Math.log(temperature / t1) - gasConstant * Math.log(pressure)
  const state = (temperature: number, pressure: number) => ({ x: entropy(temperature, pressure), y: temperature })
  function isobar(from: number, to: number, pressure: number) {
    return Array.from({ length: 19 }, (_, index) => state(from + (to - from) * index / 18, pressure))
  }
  return {
    compressorWork, turbineWork, netWork, heatInput,
    efficiency: netWork / heatInput,
    idealEfficiency: 1 - 1 / temperatureRatio,
    states: [state(t1, 1), state(t2, pressureRatio), state(t3, pressureRatio), state(t4, 1)],
    diagram: [...isobar(t2, t3, pressureRatio), ...isobar(t4, t1, 1), state(t2, pressureRatio)],
  }
}

function bracket(values: number[], target: number) {
  if (!Number.isFinite(target) || target < values[0] || target > values.at(-1)!) throw new Error('输入超出本实验的物性表范围。')
  const upper = values.findIndex((value) => value >= target)
  if (upper <= 0) return { lower: 0, upper: 0, fraction: 0 }
  return { lower: upper - 1, upper, fraction: (target - values[upper - 1]) / (values[upper] - values[upper - 1]) }
}

function interpolate(location: ReturnType<typeof bracket>, at: (index: number) => number) {
  const lower = at(location.lower)
  return lower + location.fraction * (at(location.upper) - lower)
}

export const r134aSaturationCurve = [
  ...r134a.saturation.map(([pressure, liquid]) => ({ x: liquid, y: Math.log10(pressure) })),
  ...r134a.saturation.slice().reverse().map(([pressure, , vapour]) => ({ x: vapour, y: Math.log10(pressure) })),
]

export function refrigerationCycle(evapC: number, condC: number, superheat: number, subcool: number, compressorEfficiency: number) {
  const e = bracket(r134a.evap, evapC)
  const c = bracket(r134a.cond, condC)
  const sh = bracket(r134a.superheat, superheat)
  const sc = bracket(r134a.subcool, subcool)
  const highPressure = interpolate(c, (i) => r134a.condKpa[i])
  const lowPressure = interpolate(e, (i) => r134a.evapKpa[i])
  const h1 = interpolate(e, (i) => interpolate(sh, (j) => r134a.inletH[i][j]))
  const h2s = interpolate(e, (i) => interpolate(c, (j) => interpolate(sh, (k) => r134a.isentropicH[i][j][k])))
  const h2 = h1 + (h2s - h1) / compressorEfficiency
  const h3 = interpolate(c, (i) => interpolate(sc, (j) => r134a.liquidH[i][j]))
  const dischargeEnthalpies = r134a.discharge.map((_, i) => interpolate(c, (j) => r134a.dischargeH[j][i]))
  const dischargeC = condC + interpolate(bracket(dischargeEnthalpies, h2), (i) => r134a.discharge[i])
  const work = h2 - h1
  const cooling = h1 - h3
  const rejectedHeat = h2 - h3
  return {
    lowPressure, highPressure, dischargeC, work, cooling, rejectedHeat,
    cop: cooling / work, carnotCop: (evapC + 273.15) / (condC - evapC),
    states: [{ h: h1, p: lowPressure }, { h: h2, p: highPressure }, { h: h3, p: highPressure }, { h: h3, p: lowPressure }],
  }
}

export type FlowArrangement = 'counter' | 'parallel' | 'cross'

export function logMeanTemperatureDifference(first: number, second: number) {
  if (first <= 0 || second <= 0) throw new Error('两个端温差都必须大于 0。请核对流向与温度。')
  if (first === second) return first
  const relative = (first - second) / second
  return relative > -0.5 ? (first - second) / Math.log1p(relative) : (first - second) / Math.log(first / second)
}

function exchangerProfiles(hotStart: number, hotEnd: number, coldStart: number, coldEnd: number, exponent: number) {
  const progress = Array.from({ length: 41 }, (_, index) => {
    const x = index / 40
    if (Math.abs(exponent) < 1e-10) return x
    return exponent > 0
      ? Math.exp(exponent * (x - 1)) * Math.expm1(-exponent * x) / Math.expm1(-exponent)
      : Math.expm1(exponent * x) / Math.expm1(exponent)
  })
  return { hotProfile: progress.map((x) => hotStart + (hotEnd - hotStart) * x),
    coldProfile: progress.map((x) => coldStart + (coldEnd - coldStart) * x) }
}

export function rateExchanger(arrangement: FlowArrangement, hotIn: number, coldIn: number,
  hotCapacity: number, coldCapacity: number, conductance: number) {
  if (hotIn <= coldIn) throw new Error('热流入口温度必须高于冷流入口温度。')
  const min = Math.min(hotCapacity, coldCapacity)
  const ratio = min / Math.max(hotCapacity, coldCapacity)
  const ntu = conductance / min
  const maxHeat = min * (hotIn - coldIn)
  if (arrangement === 'cross') {
    // Solve both unmixed streams on orthogonal strips. Each cell exchanges the same heat between its two streams.
    const strips = 64
    const stripHot = hotCapacity / strips
    const stripCold = coldCapacity / strips
    const exchange = -Math.expm1(-conductance / strips ** 2 * (1 / stripHot + 1 / stripCold)) / (1 / stripHot + 1 / stripCold)
    const cold = Array<number>(strips).fill(coldIn)
    const hotProfile = Array<number>(strips + 1).fill(0)
    const coldProfile = [coldIn]
    for (let row = 0; row < strips; row++) {
      let hot = hotIn
      hotProfile[0] += hot / strips
      for (let col = 0; col < strips; col++) {
        const heat = exchange * (hot - cold[col])
        hot -= heat / stripHot
        cold[col] += heat / stripCold
        hotProfile[col + 1] += hot / strips
      }
      coldProfile.push(cold.reduce((sum, temp) => sum + temp, 0) / strips)
    }
    const hotOut = hotProfile.at(-1)!
    const coldOut = coldProfile.at(-1)!
    const heat = hotCapacity * (hotIn - hotOut)
    return { hotOut, coldOut, heat, ntu, effectiveness: heat / maxHeat, lmtd: undefined, pinch: undefined, hotProfile, coldProfile }
  }

  const counter = arrangement === 'counter'
  const driving = -Math.expm1(-ntu * (1 - ratio))
  const effectiveness = counter
    ? (ratio === 1 ? ntu / (1 + ntu) : driving / ((1 - ratio) + ratio * driving))
    : -Math.expm1(-ntu * (1 + ratio)) / (1 + ratio)
  const heat = effectiveness * maxHeat
  const hotOut = hotIn - heat / hotCapacity
  const coldOut = coldIn + heat / coldCapacity
  const exponent = conductance * (counter ? 1 / coldCapacity - 1 / hotCapacity : -1 / coldCapacity - 1 / hotCapacity)
  return { hotOut, coldOut, heat, ntu, effectiveness, lmtd: heat / conductance,
    pinch: counter ? Math.min(hotIn - coldOut, hotOut - coldIn) : Math.max(0, hotOut - coldOut),
    ...exchangerProfiles(hotIn, hotOut, counter ? coldOut : coldIn, counter ? coldIn : coldOut, exponent),
  }
}

export function sizeExchanger(arrangement: FlowArrangement, hotIn: number, hotOut: number, coldIn: number, coldOut: number,
  heat: number, coefficient: number, correction: number) {
  if (hotIn <= hotOut || coldOut <= coldIn) throw new Error('请让热流出口低于其入口，并让冷流出口高于其入口。')
  const first = hotIn - (arrangement === 'parallel' ? coldIn : coldOut)
  const second = hotOut - (arrangement === 'parallel' ? coldOut : coldIn)
  const lmtd = logMeanTemperatureDifference(first, second)
  const adjustedLmtd = lmtd * (arrangement === 'cross' ? correction : 1)
  const counter = arrangement === 'counter'
  const profiles = arrangement === 'cross' ? { hotProfile: [hotIn, hotOut], coldProfile: [coldIn, coldOut] }
    : exchangerProfiles(hotIn, hotOut, counter ? coldOut : coldIn, counter ? coldIn : coldOut, Math.log(second / first))
  return { lmtd, adjustedLmtd, area: heat / (coefficient * adjustedLmtd), pinch: arrangement === 'cross' ? undefined : Math.min(first, second), ...profiles }
}
