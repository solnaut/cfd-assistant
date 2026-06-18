export type UnitCategory =
  | 'acceleration'
  | 'area'
  | 'density'
  | 'dimensionless'
  | 'dynamicViscosity'
  | 'heatTransferCoefficient'
  | 'inverseTemperature'
  | 'kinematicViscosity'
  | 'length'
  | 'pressure'
  | 'specificHeat'
  | 'temperature'
  | 'temperatureDifference'
  | 'thermalConductivity'
  | 'thermalDiffusivity'
  | 'time'
  | 'velocity'

export interface UnitDefinition {
  id: string
  symbol: string
  label: string
  toBaseFactor: number
  offsetToBase?: number
}

export const unitCatalog: Record<UnitCategory, UnitDefinition[]> = {
  acceleration: [
    { id: 'm/s^2', symbol: 'm/s^2', label: 'meter per second squared', toBaseFactor: 1 },
  ],
  area: [
    { id: 'm^2', symbol: 'm^2', label: 'square meter', toBaseFactor: 1 },
    { id: 'cm^2', symbol: 'cm^2', label: 'square centimeter', toBaseFactor: 0.0001 },
    { id: 'mm^2', symbol: 'mm^2', label: 'square millimeter', toBaseFactor: 0.000001 },
  ],
  density: [
    { id: 'kg/m^3', symbol: 'kg/m^3', label: 'kilogram per cubic meter', toBaseFactor: 1 },
    { id: 'g/cm^3', symbol: 'g/cm^3', label: 'gram per cubic centimeter', toBaseFactor: 1000 },
  ],
  dimensionless: [
    { id: '1', symbol: '-', label: 'dimensionless', toBaseFactor: 1 },
  ],
  dynamicViscosity: [
    { id: 'Pa*s', symbol: 'Pa*s', label: 'pascal second', toBaseFactor: 1 },
    { id: 'mPa*s', symbol: 'mPa*s', label: 'millipascal second', toBaseFactor: 0.001 },
    { id: 'cP', symbol: 'cP', label: 'centipoise', toBaseFactor: 0.001 },
  ],
  heatTransferCoefficient: [
    {
      id: 'W/(m^2*K)',
      symbol: 'W/(m^2*K)',
      label: 'watt per square meter kelvin',
      toBaseFactor: 1,
    },
    {
      id: 'W/(cm^2*K)',
      symbol: 'W/(cm^2*K)',
      label: 'watt per square centimeter kelvin',
      toBaseFactor: 10000,
    },
  ],
  inverseTemperature: [
    { id: '1/K', symbol: '1/K', label: 'inverse kelvin', toBaseFactor: 1 },
  ],
  kinematicViscosity: [
    {
      id: 'm^2/s',
      symbol: 'm^2/s',
      label: 'square meter per second',
      toBaseFactor: 1,
    },
    {
      id: 'mm^2/s',
      symbol: 'mm^2/s',
      label: 'square millimeter per second',
      toBaseFactor: 0.000001,
    },
    { id: 'cSt', symbol: 'cSt', label: 'centistokes', toBaseFactor: 0.000001 },
  ],
  length: [
    { id: 'm', symbol: 'm', label: 'meter', toBaseFactor: 1 },
    { id: 'cm', symbol: 'cm', label: 'centimeter', toBaseFactor: 0.01 },
    { id: 'mm', symbol: 'mm', label: 'millimeter', toBaseFactor: 0.001 },
    { id: 'um', symbol: 'um', label: 'micrometer', toBaseFactor: 0.000001 },
  ],
  pressure: [
    { id: 'Pa', symbol: 'Pa', label: 'pascal', toBaseFactor: 1 },
    { id: 'kPa', symbol: 'kPa', label: 'kilopascal', toBaseFactor: 1000 },
    { id: 'MPa', symbol: 'MPa', label: 'megapascal', toBaseFactor: 1000000 },
  ],
  specificHeat: [
    {
      id: 'J/(kg*K)',
      symbol: 'J/(kg*K)',
      label: 'joule per kilogram kelvin',
      toBaseFactor: 1,
    },
    {
      id: 'kJ/(kg*K)',
      symbol: 'kJ/(kg*K)',
      label: 'kilojoule per kilogram kelvin',
      toBaseFactor: 1000,
    },
  ],
  temperature: [
    { id: 'K', symbol: 'K', label: 'kelvin', toBaseFactor: 1 },
    { id: 'degC', symbol: 'degC', label: 'degree Celsius', toBaseFactor: 1, offsetToBase: 273.15 },
  ],
  temperatureDifference: [
    { id: 'K', symbol: 'K', label: 'kelvin difference', toBaseFactor: 1 },
    { id: 'degC', symbol: 'degC', label: 'degree Celsius difference', toBaseFactor: 1 },
  ],
  thermalConductivity: [
    {
      id: 'W/(m*K)',
      symbol: 'W/(m*K)',
      label: 'watt per meter kelvin',
      toBaseFactor: 1,
    },
  ],
  thermalDiffusivity: [
    {
      id: 'm^2/s',
      symbol: 'm^2/s',
      label: 'square meter per second',
      toBaseFactor: 1,
    },
    {
      id: 'mm^2/s',
      symbol: 'mm^2/s',
      label: 'square millimeter per second',
      toBaseFactor: 0.000001,
    },
  ],
  time: [
    { id: 's', symbol: 's', label: 'second', toBaseFactor: 1 },
    { id: 'ms', symbol: 'ms', label: 'millisecond', toBaseFactor: 0.001 },
    { id: 'min', symbol: 'min', label: 'minute', toBaseFactor: 60 },
  ],
  velocity: [
    { id: 'm/s', symbol: 'm/s', label: 'meter per second', toBaseFactor: 1 },
    {
      id: 'km/h',
      symbol: 'km/h',
      label: 'kilometer per hour',
      toBaseFactor: 1 / 3.6,
    },
    { id: 'cm/s', symbol: 'cm/s', label: 'centimeter per second', toBaseFactor: 0.01 },
  ],
}

export function getUnits(category: UnitCategory) {
  return unitCatalog[category]
}

export function getUnit(category: UnitCategory, unitId: string) {
  return unitCatalog[category].find((unit) => unit.id === unitId) ?? null
}

export function toBaseValue(
  value: number,
  fromUnitId: string,
  category: UnitCategory,
) {
  if (!Number.isFinite(value)) {
    throw new Error('Unit conversion value must be a finite number.')
  }

  const fromUnit = getUnit(category, fromUnitId)

  if (!fromUnit) {
    throw new Error(`Unsupported ${category} unit conversion.`)
  }

  return value * fromUnit.toBaseFactor + (fromUnit.offsetToBase ?? 0)
}

export function fromBaseValue(
  value: number,
  toUnitId: string,
  category: UnitCategory,
) {
  if (!Number.isFinite(value)) {
    throw new Error('Unit conversion value must be a finite number.')
  }

  const toUnit = getUnit(category, toUnitId)

  if (!toUnit) {
    throw new Error(`Unsupported ${category} unit conversion.`)
  }

  return (value - (toUnit.offsetToBase ?? 0)) / toUnit.toBaseFactor
}

export function convertValue(
  value: number,
  fromUnitId: string,
  toUnitId: string,
  category: UnitCategory,
) {
  return fromBaseValue(toBaseValue(value, fromUnitId, category), toUnitId, category)
}
