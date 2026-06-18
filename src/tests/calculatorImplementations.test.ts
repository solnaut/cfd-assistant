import { describe, expect, it } from 'vitest'
import { calculate, formatCalculationValue } from '../calculators/implementations'
import { getCalculator } from '../calculators/registry'

function calculator(id: string) {
  const definition = getCalculator(id)
  if (!definition) {
    throw new Error(`Missing calculator ${id}`)
  }
  return definition
}

function outputValue(id: string, values: Parameters<typeof calculate>[1]) {
  const result = calculate(calculator(id), values)
  return result.outputs[0].value ?? Number.NaN
}

describe('calculator implementations', () => {
  it('calculates Reynolds number and handles unit conversion', () => {
    expect(
      outputValue('reynolds-number', {
        density: { value: 1.225, unitId: 'kg/m^3' },
        velocity: { value: 10, unitId: 'm/s' },
        'characteristic-length': { value: 1, unitId: 'm' },
        'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
      }),
    ).toBeCloseTo(684587.0124)

    expect(
      outputValue('reynolds-number', {
        density: { value: 0.001225, unitId: 'g/cm^3' },
        velocity: { value: 36, unitId: 'km/h' },
        'characteristic-length': { value: 100, unitId: 'cm' },
        'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
      }),
    ).toBeCloseTo(684587.0124)
  })

  it('calculates Mach, Prandtl, Peclet, Fourier, and Biot numbers', () => {
    expect(
      outputValue('mach-number', {
        velocity: { value: 170, unitId: 'm/s' },
        'speed-of-sound': { value: 340, unitId: 'm/s' },
      }),
    ).toBeCloseTo(0.5)

    expect(
      outputValue('ideal-gas-speed-of-sound', {
        'heat-capacity-ratio': { value: 1.4, unitId: '1' },
        'gas-constant': { value: 287.05, unitId: 'J/(kg*K)' },
        temperature: { value: 288.15, unitId: 'K' },
      }),
    ).toBeCloseTo(340.2922869)

    expect(
      outputValue('prandtl-number', {
        'dynamic-viscosity': { value: 1.8e-5, unitId: 'Pa*s' },
        'specific-heat': { value: 1005, unitId: 'J/(kg*K)' },
        'thermal-conductivity': { value: 0.026, unitId: 'W/(m*K)' },
      }),
    ).toBeCloseTo(0.6957692308)

    expect(
      outputValue('peclet-number', {
        velocity: { value: 2, unitId: 'm/s' },
        'characteristic-length': { value: 0.5, unitId: 'm' },
        'thermal-diffusivity': { value: 1e-6, unitId: 'm^2/s' },
      }),
    ).toBeCloseTo(1000000)

    expect(
      outputValue('fourier-number', {
        'thermal-diffusivity': { value: 1, unitId: 'mm^2/s' },
        time: { value: 10, unitId: 's' },
        'characteristic-length': { value: 10, unitId: 'mm' },
      }),
    ).toBeCloseTo(0.1)

    expect(
      outputValue('biot-number', {
        'heat-transfer-coefficient': { value: 100, unitId: 'W/(m^2*K)' },
        'characteristic-length': { value: 0.01, unitId: 'm' },
        'thermal-conductivity': { value: 10, unitId: 'W/(m*K)' },
      }),
    ).toBeCloseTo(0.1)
  })

  it('calculates Grashof, Rayleigh, hydraulic diameter, CFL, and mesh growth', () => {
    expect(
      outputValue('grashof-number', {
        gravity: { value: 9.80665, unitId: 'm/s^2' },
        'thermal-expansion-coefficient': { value: 0.0034, unitId: '1/K' },
        'temperature-difference': { value: 10, unitId: 'K' },
        'characteristic-length': { value: 0.1, unitId: 'm' },
        'kinematic-viscosity': { value: 1.5e-5, unitId: 'm^2/s' },
      }),
    ).toBeCloseTo(1481893.7778)

    expect(
      outputValue('rayleigh-number', {
        gravity: { value: 9.80665, unitId: 'm/s^2' },
        'thermal-expansion-coefficient': { value: 0.0034, unitId: '1/K' },
        'temperature-difference': { value: 10, unitId: 'K' },
        'characteristic-length': { value: 0.1, unitId: 'm' },
        'kinematic-viscosity': { value: 1.5e-5, unitId: 'm^2/s' },
        'thermal-diffusivity': { value: 2.2e-5, unitId: 'm^2/s' },
      }),
    ).toBeCloseTo(1010382.1212)

    expect(
      outputValue('hydraulic-diameter', {
        area: { value: 0.02, unitId: 'm^2' },
        'wetted-perimeter': { value: 0.6, unitId: 'm' },
      }),
    ).toBeCloseTo(0.1333333333)

    expect(
      outputValue('pipe-pressure-drop', {
        'darcy-friction-factor': { value: 0.02, unitId: '1' },
        'pipe-length': { value: 1000, unitId: 'cm' },
        'hydraulic-diameter': { value: 100, unitId: 'mm' },
        density: { value: 1, unitId: 'g/cm^3' },
        velocity: { value: 200, unitId: 'cm/s' },
      }),
    ).toBeCloseTo(4000)

    expect(
      outputValue('cfl-time-step', {
        'target-cfl': { value: 1, unitId: '1' },
        'cell-size': { value: 10, unitId: 'mm' },
        velocity: { value: 200, unitId: 'cm/s' },
      }),
    ).toBeCloseTo(0.005)

    const meshResult = calculate(calculator('boundary-layer-mesh'), {
      'first-layer-height': { value: 1, unitId: 'mm' },
      'growth-rate': { value: 1.2, unitId: '1' },
      'layer-count': { value: 5 },
    })
    expect(meshResult.outputs[0].value).toBeCloseTo(0.0074416)
    expect(meshResult.outputs[1].value).toBeCloseTo(0.0020736)
  })

  it('rejects invalid inputs before producing non-finite results', () => {
    expect(() =>
      outputValue('mach-number', {
        velocity: { value: 170, unitId: 'm/s' },
        'speed-of-sound': { value: 0, unitId: 'm/s' },
      }),
    ).toThrow(/声速必须大于 0/)

    expect(() =>
      outputValue('hydraulic-diameter', {
        area: { value: 0.02, unitId: 'm^2' },
        'wetted-perimeter': { value: 0, unitId: 'm' },
      }),
    ).toThrow(/湿周必须大于 0/)

    expect(() =>
      outputValue('ideal-gas-speed-of-sound', {
        'heat-capacity-ratio': { value: 1.4, unitId: '1' },
        'gas-constant': { value: 287.05, unitId: 'J/(kg*K)' },
        temperature: { value: -300, unitId: 'K' },
      }),
    ).toThrow(/绝对温度/)

    expect(() =>
      outputValue('pipe-pressure-drop', {
        'darcy-friction-factor': { value: 0.02, unitId: '1' },
        'pipe-length': { value: 10, unitId: 'm' },
        'hydraulic-diameter': { value: 0, unitId: 'm' },
        density: { value: 1000, unitId: 'kg/m^3' },
        velocity: { value: 2, unitId: 'm/s' },
      }),
    ).toThrow(/水力直径必须大于 0/)

    expect(() =>
      outputValue('boundary-layer-mesh', {
        'first-layer-height': { value: 1, unitId: 'mm' },
        'growth-rate': { value: 1.2, unitId: '1' },
        'layer-count': { value: 2.5 },
      }),
    ).toThrow(/层数必须是整数/)
  })

  it('formats result values with units for display', () => {
    const result = calculate(calculator('cfl-time-step'), {
      'target-cfl': { value: 1, unitId: '1' },
      'cell-size': { value: 10, unitId: 'mm' },
      velocity: { value: 2, unitId: 'm/s' },
    })

    expect(formatCalculationValue(result.outputs[0])).toBe('0.005 s')
  })
})
