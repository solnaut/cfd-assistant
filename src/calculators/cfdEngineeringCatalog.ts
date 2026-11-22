import type { CalculatorDefinition, CalculatorInputDefinition, CalculatorOutputDefinition } from '../models/calculator'

function input(id: string, label: string, defaultValue: number, unitCategory?: CalculatorInputDefinition['unitCategory'], defaultUnit?: string): CalculatorInputDefinition {
  return { id, label, defaultValue, unitCategory, defaultUnit, quantity: id, required: true }
}

function output(id: string, label: string, unitCategory?: CalculatorOutputDefinition['unitCategory'], defaultUnit?: string): CalculatorOutputDefinition {
  return { id, label, quantity: id, unitCategory, defaultUnit }
}

const inletInputs = [
  input('speed', '入口平均速度', 10, 'velocity', 'm/s'),
  input('intensity', '湍流强度 (%)', 5),
  input('density', '流体密度', 1.225, 'density', 'kg/m^3'),
  input('viscosity', '动力黏度', 1.7894e-5, 'dynamicViscosity', 'Pa*s'),
]

export const cfdEngineeringCatalog: CalculatorDefinition[] = [
  {
    id: 'inlet-turbulence', implementationId: 'inlet-turbulence', categoryId: 'flow-piping', availability: 'available',
    name: 'Fluent 入口湍流参数换算', shortName: '入口湍流参数',
    summary: '通过湍流强度与水力直径或湍流黏度比计算 k、ε、ω 与长度尺度。',
    inputs: [...inletInputs, input('diameter', '水力直径', 0.1, 'length', 'm'), input('viscosity-ratio', '湍流黏度比 μt/μ', 10)],
    outputs: [output('k', '湍动能 k (m²/s²)'), output('epsilon', '耗散率 ε (m²/s³)'), output('omega', '比耗散率 ω (1/s)'), output('length', '湍流长度尺度 ℓ', 'length', 'm'), output('viscosityRatio', '湍流黏度比 μt/μ')],
    resultPreview: ['k、ε、ω', '湍流长度尺度', '湍流黏度比'],
    commonFormulaIds: ['turbulence-k', 'turbulence-epsilon'],
    modes: [
      { id: 'diameter', label: '强度 + 水力直径', description: '用水力直径估算入口长度尺度，适用于管路教学。', inputIds: [...inletInputs.map(({ id }) => id), 'diameter'], formulaIds: ['turbulence-length'] },
      { id: 'ratio', label: '强度 + 黏度比', description: '用已知湍流黏度比和流体物性换算耗散量。', inputIds: [...inletInputs.map(({ id }) => id), 'viscosity-ratio'], formulaIds: ['turbulence-viscosity-ratio'] },
    ],
    formulas: [
      { id: 'turbulence-k', title: '由强度估算湍动能', plainText: 'k = 1.5 (U I/100)^2', latex: String.raw`k = \frac32 (U I/100)^2` },
      { id: 'turbulence-epsilon', title: '耗散率与比耗散率', plainText: 'epsilon = Cmu k omega; Cmu = 0.09', latex: String.raw`\varepsilon = C_\mu k \omega,\quad C_\mu=0.09` },
      { id: 'turbulence-length', title: '水力直径法', plainText: 'ell = 0.07 Dh; omega = sqrt(k)/(Cmu^0.25 ell)', latex: String.raw`\ell=0.07D_h,\quad \omega=\frac{\sqrt{k}}{C_\mu^{1/4}\ell}` },
      { id: 'turbulence-viscosity-ratio', title: '黏度比法', plainText: 'omega = rho k / (mu (mut/mu))', latex: String.raw`\omega=\frac{\rho k}{\mu(\mu_t/\mu)}` },
    ],
    scope: ['采用 Fluent 入口湍流估算关系及 Cμ = 0.09。水力直径法的 ℓ = 0.07Dh 用作典型内部流动入口的经验估算。'],
    notes: ['湍流强度以百分数输入。k–ε 与 k–ω 模型分别使用对应的耗散参数。', '可用实测值或已验证的入口剖面时，应按实际工况核对估算结果。'],
    sources: [{ label: 'Fluent 2024 R2', title: 'Determining Turbulence Parameters', organization: 'Ansys', url: 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_bcs_sec_bound_cond.html#flu_ug_ke_params', accessedAt: '2026-11-22' }],
  },
  {
    id: 'grid-convergence-gci', implementationId: 'grid-convergence-gci', categoryId: 'near-wall-mesh', availability: 'available',
    name: '三网格收敛指数 GCI', shortName: '网格收敛 GCI',
    summary: '评估网格无关性时，用三套网格的单元数与同一监测值估算 Richardson 外推、表观阶与离散误差。',
    inputs: [
      { id: 'dimension', label: '空间维度', quantity: 'dimension', kind: 'select', options: [{ id: '2', label: '2D' }, { id: '3', label: '3D' }], defaultValue: '3', required: true },
      ...(['细', '中', '粗'] as const).flatMap((name, index) => [
        { ...input(`n${index + 1}`, `${name}网格单元数`, [1728000, 512000, 216000][index]), integer: true, min: 1 },
        input(`phi${index + 1}`, `${name}网格监测值`, [100.25, 100.5625, 101][index]),
      ]),
    ],
    outputs: [
      output('order', '表观收敛阶 p'), output('extrapolation', 'Richardson 外推值'), output('gciFine', '细/中网格 GCI (%)'),
      output('gciMedium', '中/粗网格 GCI (%)'), output('rangeRatio', '渐近区间比值'),
    ],
    resultPreview: ['表观收敛阶', '外推值', '细网格 GCI'],
    formulas: [
      { title: '代表性网格尺度与外推', plainText: 'h proportional to N^(-1/d); phi_ext = phi1 - (phi2-phi1)/(r21^p-1)', latex: String.raw`h\propto N^{-1/d},\quad \phi_{\rm ext}=\phi_1-\frac{\phi_2-\phi_1}{r_{21}^p-1}` },
      { title: '细网格 GCI 与渐近区间比值', plainText: 'GCI21 = 1.25 |(phi2-phi1)/phi1|/(r21^p-1); ratio = GCI32/(r21^p GCI21)', latex: String.raw`\mathrm{GCI}_{21}=\frac{1.25\left|(\phi_2-\phi_1)/\phi_1\right|}{r_{21}^p-1},\quad R=\frac{\mathrm{GCI}_{32}}{r_{21}^p\mathrm{GCI}_{21}}` },
    ],
    scope: ['适用于同几何、同设置、系统性细化的三组网格，支持不等细化比及单调收敛趋势。'],
    notes: ['渐近区间比值接近 1 提供一致性线索。仍需检查细化比、迭代误差和多个关键监测量。', '振荡、差异近零或无正表观阶时，先检查输入并增加网格级别。GCI 估算的是空间离散不确定性。'],
    sources: [{ label: 'NASA Glenn', title: 'Examining Spatial (Grid) Convergence', organization: 'NASA Glenn Research Center', url: 'https://www.grc.nasa.gov/www/wind/valid/tutorial/spatconv.html', accessedAt: '2026-11-22' }],
  },
]
