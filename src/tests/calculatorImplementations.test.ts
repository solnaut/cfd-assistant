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

function intermediateValue(
  result: ReturnType<typeof calculate>,
  itemId: string,
) {
  const item = result.intermediates.find((entry) => entry.id === itemId)

  if (!item || item.value === undefined) {
    throw new Error(`Missing intermediate ${itemId}`)
  }

  return item.value
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

  it('calculates y+ first-layer height in initial estimate mode', () => {
    const result = calculate(
      calculator('y-plus-first-layer-height'),
      {
        'target-y-plus': { value: 1, unitId: '1' },
        'flow-scenario': { value: 'flat-plate-external' },
        density: { value: 1.225, unitId: 'kg/m^3' },
        'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
        'reference-velocity': { value: 10, unitId: 'm/s' },
        'characteristic-length': { value: 1, unitId: 'm' },
      },
      { modeId: 'initial-estimate' },
    )

    expect(result.outputs[0].value).toBeCloseTo(0.0000325438)
    expect(result.outputs[1].value).toBeCloseTo(0.0000650876)
    expect(intermediateValue(result, 'reynolds-number')).toBeCloseTo(684587.0124)
    expect(intermediateValue(result, 'wall-friction-coefficient')).toBeCloseTo(0.0040293591)
    expect(intermediateValue(result, 'wall-shear-stress')).toBeCloseTo(0.2467982459)
    expect(intermediateValue(result, 'friction-velocity')).toBeCloseTo(0.4488518194)
    expect(intermediateValue(result, 'kinematic-viscosity')).toBeCloseTo(0.0000146073)
  })

  it('calculates y+ first-layer height from known wall shear stress', () => {
    const result = calculate(calculator('y-plus-first-layer-height'), {
      'target-y-plus': { value: 1, unitId: '1' },
      'wall-shear-stress': { value: 0.5, unitId: 'Pa' },
      density: { value: 1.225, unitId: 'kg/m^3' },
      'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
    }, { modeId: 'known-wall-shear-stress' })

    expect(result.outputs[0].value).toBeCloseTo(0.000022862)
    expect(result.outputs[1].value).toBeCloseTo(0.000045724)
    expect(intermediateValue(result, 'wall-shear-stress')).toBeCloseTo(0.5)
    expect(intermediateValue(result, 'friction-velocity')).toBeCloseTo(0.6388765649)
    expect(intermediateValue(result, 'kinematic-viscosity')).toBeCloseTo(0.0000146073)
    expect(result.intermediates.some((item) => item.id === 'reynolds-number')).toBe(false)
    expect(result.intermediates.some((item) => item.id === 'wall-friction-coefficient')).toBe(false)
  })

  it('calculates y+ first-layer height from known friction coefficient', () => {
    const result = calculate(
      calculator('y-plus-first-layer-height'),
      {
        'target-y-plus': { value: 1, unitId: '1' },
        'friction-coefficient': { value: 0.005, unitId: '1' },
        density: { value: 1.225, unitId: 'kg/m^3' },
        'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
        'reference-velocity': { value: 10, unitId: 'm/s' },
      },
      { modeId: 'known-friction-coefficient' },
    )

    expect(result.outputs[0].value).toBeCloseTo(0.0000292147)
    expect(result.outputs[1].value).toBeCloseTo(0.0000584294)
    expect(intermediateValue(result, 'wall-friction-coefficient')).toBeCloseTo(0.005)
    expect(intermediateValue(result, 'wall-shear-stress')).toBeCloseTo(0.30625)
    expect(intermediateValue(result, 'friction-velocity')).toBeCloseTo(0.5)
  })

  it('keeps inactive y+ mode fields out of validation and supports unit conversion', () => {
    const result = calculate(
      calculator('y-plus-first-layer-height'),
      {
        'target-y-plus': { value: 1, unitId: '1' },
        'wall-shear-stress': { value: 0.5, unitId: 'Pa' },
        density: { value: 0.001225, unitId: 'g/cm^3' },
        'dynamic-viscosity': { value: 0.017894, unitId: 'mPa*s' },
        'reference-velocity': { value: 0, unitId: 'm/s' },
        'characteristic-length': { value: 0, unitId: 'm' },
        'friction-coefficient': { value: 0, unitId: '1' },
      },
      { modeId: 'known-wall-shear-stress' },
    )

    expect(result.outputs[0].value).toBeCloseTo(0.000022862)
    expect(result.outputs[1].value).toBeCloseTo(0.000045724)
  })

  it('calculates time-step helper calculators', () => {
    expect(
      outputValue('total-time-steps', {
        'total-time': { value: 1, unitId: 's' },
        'time-step': { value: 1, unitId: 'ms' },
      }),
    ).toBeCloseTo(1000)

    expect(
      outputValue('rotating-time-step', {
        'rotational-speed': { value: 3000, unitId: 'rpm' },
        'steps-per-revolution': { value: 360 },
      }),
    ).toBeCloseTo(0.0000555556)
  })

  it('calculates additional flow and piping calculators', () => {
    expect(
      outputValue('mean-velocity', {
        'volume-flow-rate': { value: 60, unitId: 'L/min' },
        area: { value: 0.01, unitId: 'm^2' },
      }),
    ).toBeCloseTo(0.1)

    expect(
      outputValue('mass-flow-rate', {
        density: { value: 1000, unitId: 'kg/m^3' },
        'volume-flow-rate': { value: 60, unitId: 'L/min' },
      }),
    ).toBeCloseTo(1)

    expect(
      outputValue('laminar-pipe-pressure-drop', {
        'pipe-length': { value: 10, unitId: 'm' },
        'pipe-diameter': { value: 50, unitId: 'mm' },
        density: { value: 1000, unitId: 'kg/m^3' },
        velocity: { value: 0.02, unitId: 'm/s' },
        'dynamic-viscosity': { value: 0.001, unitId: 'Pa*s' },
      }),
    ).toBeCloseTo(2.56)
  })

  it('calculates heat-transfer helper calculators', () => {
    expect(
      outputValue('nusselt-number', {
        'heat-transfer-coefficient': { value: 100, unitId: 'W/(m^2*K)' },
        'characteristic-length': { value: 0.1, unitId: 'm' },
        'thermal-conductivity': { value: 0.026, unitId: 'W/(m*K)' },
      }),
    ).toBeCloseTo(384.6153846)

    expect(
      outputValue('heat-flux', {
        'heat-rate': { value: 100, unitId: 'W' },
        area: { value: 0.5, unitId: 'm^2' },
      }),
    ).toBeCloseTo(200)

    expect(
      outputValue('thermal-resistance', {
        'temperature-difference': { value: 20, unitId: 'K' },
        'heat-rate': { value: 100, unitId: 'W' },
      }),
    ).toBeCloseTo(0.2)

    expect(
      outputValue('convective-heat-transfer', {
        'heat-transfer-coefficient': { value: 100, unitId: 'W/(m^2*K)' },
        area: { value: 1, unitId: 'm^2' },
        'temperature-difference': { value: 10, unitId: 'K' },
      }),
    ).toBeCloseTo(1000)

    expect(
      outputValue('conduction-heat-transfer', {
        'thermal-conductivity': { value: 10, unitId: 'W/(m*K)' },
        area: { value: 1, unitId: 'm^2' },
        'temperature-difference': { value: 10, unitId: 'K' },
        thickness: { value: 10, unitId: 'mm' },
      }),
    ).toBeCloseTo(10000)

    expect(
      outputValue('temperature-rise', {
        power: { value: 100, unitId: 'W' },
        time: { value: 60, unitId: 's' },
        mass: { value: 1, unitId: 'kg' },
        'specific-heat': { value: 4180, unitId: 'J/(kg*K)' },
      }),
    ).toBeCloseTo(1.4354067)
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

    expect(() =>
      outputValue('heat-flux', {
        'heat-rate': { value: 100, unitId: 'W' },
        area: { value: 0, unitId: 'm^2' },
      }),
    ).toThrow(/面积必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 0, unitId: '1' },
          'flow-scenario': { value: 'flat-plate-external' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
          'characteristic-length': { value: 1, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/目标 y\+必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'flow-scenario': { value: 'flat-plate-external' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 0, unitId: 'm/s' },
          'characteristic-length': { value: 1, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/参考速度 U必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'flow-scenario': { value: 'flat-plate-external' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
          'characteristic-length': { value: 0, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/特征长度 L必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'flow-scenario': { value: 'flat-plate-external' },
          density: { value: 0, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
          'characteristic-length': { value: 1, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/密度 ρ必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'flow-scenario': { value: 'flat-plate-external' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 0, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
          'characteristic-length': { value: 1, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/动力黏度 μ必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'flow-scenario': { value: 'internal-pipe' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
          'characteristic-length': { value: 1, unitId: 'm' },
        },
        { modeId: 'initial-estimate' },
      ),
    ).toThrow(/暂未开放计算/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'wall-shear-stress': { value: 0, unitId: 'Pa' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
        },
        { modeId: 'known-wall-shear-stress' },
      ),
    ).toThrow(/壁面剪切应力 τw必须大于 0/)

    expect(() =>
      calculate(
        calculator('y-plus-first-layer-height'),
        {
          'target-y-plus': { value: 1, unitId: '1' },
          'friction-coefficient': { value: 0, unitId: '1' },
          density: { value: 1.225, unitId: 'kg/m^3' },
          'dynamic-viscosity': { value: 1.7894e-5, unitId: 'Pa*s' },
          'reference-velocity': { value: 10, unitId: 'm/s' },
        },
        { modeId: 'known-friction-coefficient' },
      ),
    ).toThrow(/壁面摩擦系数 Cf必须大于 0/)
  })

  it('formats result values with units for display', () => {
    const result = calculate(calculator('cfl-time-step'), {
      'target-cfl': { value: 1, unitId: '1' },
      'cell-size': { value: 10, unitId: 'mm' },
      velocity: { value: 2, unitId: 'm/s' },
    })

    expect(formatCalculationValue(result.outputs[0])).toBe('0.005 s')

    const viscosityResult = calculate(calculator('reynolds-number'), {
      density: { value: 1, unitId: 'kg/m^3' },
      velocity: { value: 1, unitId: 'm/s' },
      'characteristic-length': { value: 1, unitId: 'm' },
      'dynamic-viscosity': { value: 1, unitId: 'Pa*s' },
    })

    expect(formatCalculationValue(viscosityResult.intermediates[0])).toBe('1 m²/s')
  })
})
