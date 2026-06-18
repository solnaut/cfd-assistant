export type UnitCategory = 'length' | 'time' | 'velocity'

export interface UnitDefinition {
  id: string
  symbol: string
  label: string
  toBaseFactor: number
}

export const unitCatalog: Record<UnitCategory, UnitDefinition[]> = {
  length: [
    { id: 'm', symbol: 'm', label: 'meter', toBaseFactor: 1 },
    { id: 'mm', symbol: 'mm', label: 'millimeter', toBaseFactor: 0.001 },
    { id: 'um', symbol: 'um', label: 'micrometer', toBaseFactor: 0.000001 },
  ],
  time: [
    { id: 's', symbol: 's', label: 'second', toBaseFactor: 1 },
    { id: 'ms', symbol: 'ms', label: 'millisecond', toBaseFactor: 0.001 },
  ],
  velocity: [
    { id: 'm/s', symbol: 'm/s', label: 'meter per second', toBaseFactor: 1 },
    {
      id: 'km/h',
      symbol: 'km/h',
      label: 'kilometer per hour',
      toBaseFactor: 1 / 3.6,
    },
  ],
}

export function convertValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategory,
) {
  if (!Number.isFinite(value)) {
    throw new Error('Unit conversion value must be a finite number.')
  }

  const units = unitCatalog[category]
  const fromUnit = units.find((unit) => unit.id === fromUnitId)
  const toUnit = units.find((unit) => unit.id === toUnitId)

  if (!fromUnit || !toUnit) {
    throw new Error(`Unsupported ${category} unit conversion.`)
  }

  return (value * fromUnit.toBaseFactor) / toUnit.toBaseFactor
}
