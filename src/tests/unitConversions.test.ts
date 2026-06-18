import { describe, expect, it } from 'vitest'
import { convertValue } from '../units/conversions'

describe('unit conversions', () => {
  it('converts millimeters to meters', () => {
    expect(convertValue(1250, 'mm', 'm', 'length')).toBeCloseTo(1.25)
  })

  it('converts meters per second to kilometers per hour', () => {
    expect(convertValue(10, 'm/s', 'km/h', 'velocity')).toBeCloseTo(36)
  })

  it('rejects unsupported units', () => {
    expect(() => convertValue(1, 'inch', 'm', 'length')).toThrow(
      /Unsupported length unit conversion/,
    )
  })
})
