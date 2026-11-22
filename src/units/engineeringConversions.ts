import { convertValue, fromBaseValue, toBaseValue } from './conversions'

type PressureBasis = 'absolute' | 'gauge'

export function convertPressure(value: number, fromUnit: string, toUnit: string, fromBasis: PressureBasis,
  toBasis: PressureBasis, referenceKpa: number) {
  if (!Number.isFinite(referenceKpa) || referenceKpa <= 0) throw new Error('参考绝压必须大于 0。')
  const reference = referenceKpa * 1000
  const absolute = toBaseValue(value, fromUnit, 'pressure') + (fromBasis === 'gauge' ? reference : 0)
  if (absolute < 0) throw new Error('换算后绝压低于 0。请检查表压、参考压力和单位。')
  return fromBaseValue(absolute - (toBasis === 'gauge' ? reference : 0), toUnit, 'pressure')
}

export function convertIdealGasFlow(value: number, fromUnit: string, toUnit: string, fromKpa: number,
  fromCelsius: number, toKpa: number, toCelsius: number) {
  const tFrom = toBaseValue(fromCelsius, 'degC', 'temperature')
  const tTo = toBaseValue(toCelsius, 'degC', 'temperature')
  if (!(fromKpa > 0 && toKpa > 0 && tFrom > 0 && tTo > 0) || !Number.isFinite(fromKpa) || !Number.isFinite(toKpa)) {
    throw new Error('两侧绝压和绝对温度必须大于 0。')
  }
  return convertValue(value * (fromKpa / toKpa) * (tTo / tFrom), fromUnit, toUnit, 'volumeFlowRate')
}
