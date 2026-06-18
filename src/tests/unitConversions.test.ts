import { describe, expect, it } from 'vitest'
import { convertValue } from '../units/conversions'

describe('unit conversions', () => {
  it('converts millimeters to meters', () => {
    expect(convertValue(1250, 'mm', 'm', 'length')).toBeCloseTo(1.25)
  })

  it('converts meters per second to kilometers per hour', () => {
    expect(convertValue(10, 'm/s', 'km/h', 'velocity')).toBeCloseTo(36)
  })

  it('converts density, area, viscosity, and thermal diffusivity units', () => {
    expect(convertValue(0.001225, 'g/cm^3', 'kg/m^3', 'density')).toBeCloseTo(1.225)
    expect(convertValue(200, 'cm^2', 'm^2', 'area')).toBeCloseTo(0.02)
    expect(convertValue(0.018, 'mPa*s', 'Pa*s', 'dynamicViscosity')).toBeCloseTo(0.000018)
    expect(convertValue(15, 'mm^2/s', 'm^2/s', 'kinematicViscosity')).toBeCloseTo(0.000015)
  })

  it('converts temperature and temperature-difference units correctly', () => {
    expect(convertValue(20, 'degC', 'K', 'temperature')).toBeCloseTo(293.15)
    expect(convertValue(20, 'degC', 'K', 'temperatureDifference')).toBeCloseTo(20)
  })

  it('rejects unsupported units', () => {
    expect(() => convertValue(1, 'inch', 'm', 'length')).toThrow(
      /Unsupported length unit conversion/,
    )
  })
})
