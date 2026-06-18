import { describe, expect, it } from 'vitest'
import {
  convertValue,
  formatUnitSymbol,
  getUnitDisplaySymbol,
} from '../units/conversions'

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
    expect(convertValue(4, 'kPa', 'Pa', 'pressure')).toBeCloseTo(4000)
    expect(convertValue(0.28705, 'kJ/(kg*K)', 'J/(kg*K)', 'specificHeat')).toBeCloseTo(287.05)
  })

  it('converts temperature and temperature-difference units correctly', () => {
    expect(convertValue(20, 'degC', 'K', 'temperature')).toBeCloseTo(293.15)
    expect(convertValue(20, 'degC', 'K', 'temperatureDifference')).toBeCloseTo(20)
  })

  it('converts new engineering units and exposes readable display symbols', () => {
    expect(convertValue(60, 'L/min', 'm^3/s', 'volumeFlowRate')).toBeCloseTo(0.001)
    expect(convertValue(3600, 'kg/h', 'kg/s', 'massFlowRate')).toBeCloseTo(1)
    expect(convertValue(1, 'kW/m^2', 'W/m^2', 'heatFlux')).toBeCloseTo(1000)
    expect(convertValue(50, 'rps', 'rpm', 'rotationalSpeed')).toBeCloseTo(3000)
    expect(getUnitDisplaySymbol('dynamicViscosity', 'Pa*s')).toBe('Pa·s')
    expect(getUnitDisplaySymbol('density', 'kg/m^3')).toBe('kg/m³')
    expect(formatUnitSymbol('W/(m^2*K)')).toBe('W/(m²·K)')
  })

  it('rejects unsupported units', () => {
    expect(() => convertValue(1, 'inch', 'm', 'length')).toThrow(
      /Unsupported length unit conversion/,
    )
  })
})
