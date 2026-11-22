import type { FluentMockDialog, FluentVisibilityCondition } from '../fluentTypes'
import type { DialogTabGroup } from '../fluentTeachingExtras'
import { modelControls } from './modelBranches'
import { aiadRegime } from './multiphaseDialogs'

function condition(controlId: string, ...values: FluentVisibilityCondition['values']): FluentVisibilityCondition {
  return { controlId, values }
}

const radiation = 'radiation-model-dialog'
const species = 'species-model-dialog'
const viscous = 'viscous-model-dialog'
const dpm = 'dpm-model-dialog'
const film = 'wall-film-model-dialog'
const solidification = 'solidification-model-dialog'
const sound = 'acoustics-model-dialog'
const exchanger = 'heat-exchanger-dialog'
const battery = 'battery-model-dialog'
const rad = (model: string) => condition('radiation-model-select', model)
const doModel = rad('Discrete Ordinates (DO)')
const s2s = rad('Surface to Surface (S2S)')
const mc = rad('Monte Carlo (MC)')
const radiationIterations = condition('radiation-model-select', 'Discrete Transfer (DTRM)', 'Surface to Surface (S2S)', 'Discrete Ordinates (DO)')
const spectralBands = condition('radiation-model-select', 'P1', 'Discrete Ordinates (DO)', 'Monte Carlo (MC)')
const solar3d = condition('solver-dimension', '3d')
const solarRayTracing = condition('radiation-solar-model', 'Solar Ray Tracing')
const solarActive = condition('radiation-solar-model', 'Solar Ray Tracing', 'DO Irradiation')
const speciesTransport = condition('species-model-select', 'Species Transport')
const pdf = condition('species-model-select', 'Non-Premixed Combustion', 'Partially Premixed Combustion')
const compositionPdf = condition('species-model-select', 'Composition PDF Transport')
const speciesEnabled = condition('wall-film-species-active', true)
const phaseAccretion = condition('wall-film-phase-accretion-available', true)
const wallFilmPhaseCoupling = condition('wall-film-phase-coupling', true)
const transitionSst = condition('viscous-transition-sst', true)
const responding = condition('species-volumetric-reactions', true)
const edc = condition('species-tci', 'Eddy-Dissipation Concept')
const edcConstant = condition('species-edc-model', 'Constant Coefficients')
const edcReactor = condition('species-edc-model', 'Partially Stirred Reactor')
const chemistryIntegrates = condition('species-chemistry-solver', 'Stiff Chemistry Solver', 'CHEMKIN-CFD Solver')
const wallReactions = condition('species-wall-reactions', true)
const rng = [condition('viscous-kepsilon', true), condition('viscous-ke-submodel', 'rng')]
const geko = [condition('viscous-kw-sst', true), condition('viscous-kw-submodel', 'geko')]
const ewt = condition('viscous-wall-treatment', 'Enhanced Wall Treatment')
const filmMomentum = condition('wall-film-momentum', true)
const solidOn = condition('solidification-enable', true)
const scheil = condition('solidification-rule', 'Scheil Rule')
const fwh = condition('acoustics-model-select', 'Ffowcs-Williams & Hawkings')
const wave = condition('acoustics-model-select', 'Wave Equation')
const broadband = condition('acoustics-model-select', 'Broadband Noise Sources')
const remoteReceivers = condition('acoustics-remote-receivers', true)
const thermal = condition('energy-enable', true)
const unsteady = condition('solver-time-formulation', 'Transient')
const hxDual = condition('hx-model-type', 'Untapped Dual Cell')
const hxMacro = condition('hx-model-type', 'Macro Heat Exchanger')
const hxFixedRejection = condition('hx-dual-mode', 'Fixed Heat Rejection')
const hxRawData = condition('hx-dual-performance-data', 'Raw Data')
const batteryEnabled = condition('battery-enable', true)
const batteryMsmd = condition('battery-solution-method', 'MSMD')
const aiadActive = condition('multiphase-eulerian-regime-applied', aiadRegime)
const kw = condition('viscous-kw-sst', true)
const standardKw = condition('viscous-kw-submodel', 'standard')
const stressOmega = [condition('viscous-rsm', true), condition('viscous-rsm-model', 'Stress-Omega')]
const les = condition('viscous-les', true)
const lesDynamicStress = [les, condition('viscous-les-model', 'Smagorinsky-Lilly', 'Kinetic-Energy Transport'), condition('viscous-les-dynamic-stress', true)]
const turbulenceOn = [condition('viscous-inviscid', false), condition('viscous-laminar', false)]
const wallTreatmentAvailable = condition('viscous-near-wall-available', true)
const allSpeciesReactions = condition('species-model-select', 'Species Transport', 'Composition PDF Transport')
const lagrangianPdf = condition('species-pdf-transport', 'Lagrangian')
const dpmInstant = condition('dpm-unsteady-tracking', true)
const dpmCoupled = condition('dpm-interaction', true)

export const derivedModelControls = [
  'species-integration-available', 'viscous-near-wall-available', 'viscous-curvature-available',
  'viscous-has-tke', 'viscous-has-epsilon', 'viscous-has-omega', 'viscous-has-nut', 'methods-is-coupled',
  'wall-film-species-active', 'wall-film-phase-coupling-available', 'wall-film-phase-accretion-available',
  'dpm-independent-particle-step', 'dpm-source-linearization-available',
]

const additions: Record<string, ReturnType<typeof modelControls>> = {
  'energy-model-dialog': modelControls('energy-model-dialog', 'Energy Modes', [
    ['energy-two-temperature', 'Two-Temperature Model', { defaultSelected: false, visibleWhen: [thermal, condition('general-density-based', true)] }],
  ]),
  [radiation]: [
    ...modelControls(radiation, 'Iteration Parameters', [
      ['radiation-energy-iterations', 'Energy Iterations per Radiation Iteration', { value: '10', visibleWhen: [radiationIterations] }],
      ['radiation-max-iterations', 'Maximum Number of Radiation Iterations', { visibleWhen: [radiationIterations] }],
      ['radiation-do-energy-coupling', 'DO/Energy Coupling', { defaultSelected: false, visibleWhen: [doModel], section: 'DO Options' }],
      ['radiation-mc-history', 'Target Number of Histories', { visibleWhen: [mc], section: 'Monte Carlo Options' }],
      ['radiation-residual-convergence', 'Residual Convergence Criteria', { visibleWhen: [condition('radiation-model-select', 'Discrete Transfer (DTRM)', 'Surface to Surface (S2S)')] }],
    ]),
    ...modelControls(radiation, 'Angular Discretization', [
      ['radiation-theta-pixels', 'Theta Pixels', { value: '1', visibleWhen: [doModel], section: 'Pixels' }],
      ['radiation-phi-pixels', 'Phi Pixels', { value: '1', visibleWhen: [doModel], section: 'Pixels' }],
      ['radiation-volume-cluster', 'Target Cells Per Volume Cluster', { visibleWhen: [doModel], section: 'Volume Clustering' }],
    ]),
    ...modelControls(radiation, 'View Factors and Clustering', [
      ['radiation-view-factor-settings', 'Settings…', { dialogId: 'radiation-view-factors-dialog', visibleWhen: [s2s] }],
    ]),
    ...modelControls(radiation, 'Non-Gray Model', [
      ['radiation-number-of-bands', 'Number of Bands', { value: '0', options: ['0', '1', '2', '3', '4', '5'], visibleWhen: [spectralBands] }],
    ]),
    ...['1', '2', '3', '4', '5'].flatMap((number, index, counts) => modelControls(radiation, 'Non-Gray Model', [
      ['radiation-band-' + number + '-name', 'Band ' + number + ' Name'],
      ['radiation-band-' + number + '-start', 'Band ' + number + ' Start (m)'],
      ['radiation-band-' + number + '-end', 'Band ' + number + ' End (m)'],
    ]).map((control) => ({ ...control, visibleWhen: [spectralBands, condition('radiation-number-of-bands', ...counts.slice(index))] }))),
    ...modelControls(radiation, 'Solar Load', [
      ['radiation-solar-model', 'Solar Load', { value: 'Off', options: ['Off', 'Solar Ray Tracing', 'DO Irradiation'] }],
      ['radiation-solar-use-calculator', 'Use Direction Computed from Solar Calculator', { defaultSelected: false, visibleWhen: [solarActive], section: 'Sun Direction Vector' }],
      ['radiation-solar-calculator', 'Solar Calculator…', { dialogId: 'radiation-solar-calculator-dialog', visibleWhen: [solarActive] }],
      ['radiation-solar-direction', 'Sun Direction Vector', { visibleWhen: [solarActive, condition('radiation-solar-use-calculator', false)], section: 'Sun Direction Vector' }],
      ['radiation-solar-direct', 'Direct Solar Irradiation', { visibleWhen: [solarActive], section: 'Illumination Parameters' }],
      ['radiation-solar-diffuse', 'Diffuse Solar Irradiation', { visibleWhen: [solarActive], section: 'Illumination Parameters' }],
      ['radiation-solar-spectral-fraction', 'Spectral Fraction', { visibleWhen: [solarRayTracing], section: 'Illumination Parameters' }],
      ['radiation-solar-update-steps', 'Time Steps per Solar Load Update', { visibleWhen: [solarActive, unsteady], section: 'Update Parameters' }],
    ]).map((control) => ({ ...control, visibleWhen: [solar3d, ...(control.visibleWhen ?? [])] })),
  ],
  [species]: [
    ...modelControls(species, 'Species', [
      ['species-multicomponent', 'Full Multicomponent Diffusion', { defaultSelected: false, visibleWhen: [speciesTransport] }],
      ['species-thermal-diffusion', 'Thermal Diffusion', { defaultSelected: false, visibleWhen: [speciesTransport, thermal] }],
      ['species-diffusion-energy', 'Diffusion Energy Source', { defaultSelected: false, valueId: 'energy-diffusion', visibleWhen: [speciesTransport, thermal] }],
    ]),
    ...modelControls(species, 'Reactions', [
      ['species-wall-reactions', 'Wall Surface Reactions', { defaultSelected: false, visibleWhen: [speciesTransport] }],
      ['species-particle-reactions', 'Particle Reactions', { defaultSelected: false, visibleWhen: [speciesTransport, condition('dpm-enable', true)] }],
      ['species-tci', 'Turbulence-Chemistry Interaction', { value: 'Finite-Rate/No TCI', options: ['Finite-Rate/No TCI', 'Finite-Rate/Eddy-Dissipation', 'Eddy-Dissipation', 'Eddy-Dissipation Concept'], visibleWhen: [speciesTransport, responding], section: 'Turbulence-Chemistry Interaction' }],
      ['species-chemistry-solver', 'Chemistry Solver', { options: ['None - Direct Source', 'Stiff Chemistry Solver', 'CHEMKIN-CFD Solver', 'Relax to Chemical Equilibrium'], visibleWhen: [allSpeciesReactions, responding], section: 'Chemistry Solver' }],
      ['species-integration', 'Integration Parameters…', { dialogId: 'species-integration-dialog', visibleWhen: [allSpeciesReactions, responding, condition('species-integration-available', true)], section: 'Chemistry Solver' }],
      ['species-chemistry-threshold', 'Temperature Threshold (K)', { value: '200', visibleWhen: [allSpeciesReactions, responding, chemistryIntegrates], section: 'Chemistry Solver' }],
      ['species-edc-model', 'EDC Model', { value: 'Constant Coefficients', options: ['Constant Coefficients', 'Partially Stirred Reactor'], visibleWhen: [speciesTransport, responding, edc], section: 'EDC Model' }],
      ['species-edc-volume', 'Volume Fraction Constant', { visibleWhen: [speciesTransport, responding, edc, edcConstant], section: 'EDC Model' }],
      ['species-edc-time', 'Time Scale Constant', { visibleWhen: [speciesTransport, responding, edc, edcConstant], section: 'EDC Model' }],
      ['species-edc-mix', 'Mixing Model', { value: 'Dynamic Cmix', options: ['Dynamic Cmix', 'Constant Cmix'], visibleWhen: [speciesTransport, responding, edc, edcReactor], section: 'Mixing Model' }],
      ['species-edc-mix-constant', 'Mixing Constant', { visibleWhen: [speciesTransport, responding, edc, edcReactor, condition('species-edc-mix', 'Constant Cmix')], section: 'Mixing Model' }],
      ['species-edc-fractal', 'Fractal Dimension', { visibleWhen: [speciesTransport, responding, edc, edcReactor, condition('species-edc-mix', 'Dynamic Cmix')], section: 'Mixing Model' }],
      ['species-wall-heat', 'Heat of Surface Reactions', { defaultSelected: false, visibleWhen: [speciesTransport, wallReactions, thermal] }],
      ['species-wall-deposition', 'Mass Deposition Source', { defaultSelected: false, visibleWhen: [speciesTransport, wallReactions] }],
    ]),
    ...modelControls(species, 'Combustion', [
      ['species-pdf-function', 'Probability Density Function', { value: 'beta', options: ['beta', 'double delta'], visibleWhen: [pdf] }],
      ['species-state-relation', 'State Relation', { value: 'Chemical Equilibrium', options: ['Chemical Equilibrium', 'Steady Diffusion Flamelet', 'Unsteady Diffusion Flamelet', 'Flamelet Generated Manifold'], visibleWhen: [pdf] }],
      ['species-energy-treatment', 'Energy Treatment', { value: 'Adiabatic', options: ['Adiabatic', 'Non-Adiabatic'], visibleWhen: [pdf] }],
      ['species-premixed-model', 'Premixed Combustion Model', { value: 'C-Equation', options: ['C-Equation', 'G-Equation'], visibleWhen: [condition('species-model-select', 'Premixed Combustion')] }],
      ['species-pdf-transport', 'PDF Transport Options', { value: 'Lagrangian', options: ['Lagrangian', 'Eulerian'], visibleWhen: [compositionPdf] }],
      ['species-pdf-mixing', 'Mixing Model', { value: 'Modified Curl', options: ['Modified Curl', 'IEM', 'EMST'], visibleWhen: [compositionPdf] }],
    ]),
    ...modelControls(species, 'PDF Transport Parameters', [
      ['species-pdf-particles', 'Particles Per Cell'],
      ['species-pdf-local-timestep', 'Local Time Stepping', { defaultSelected: true, visibleWhen: [condition('solver-time-formulation', 'Steady')] }],
      ['species-pdf-timestep', 'Time Step', { visibleWhen: [condition('solver-time-formulation', 'Steady'), condition('species-pdf-local-timestep', false)] }],
      ['species-pdf-convection', 'Convection #'],
      ['species-pdf-diffusion', 'Diffusion #'],
      ['species-pdf-mixing-number', 'Mixing #'],
    ]),
  ],
  [viscous]: [
    ...modelControls(viscous, 'Model', [
      ['viscous-transition-kl', 'Transition k-kl-omega', { controlType: 'radio' }],
      ['viscous-sas', 'Scale-Adaptive Simulation (SAS)', { controlType: 'radio' }],
      ['viscous-des', 'Detached Eddy Simulation (DES)', { controlType: 'radio' }],
    ]),
    ...modelControls(viscous, 'Submodels', [
      ['viscous-sa-production', 'Spalart-Allmaras Production', { value: 'Vorticity-Based', options: ['Vorticity-Based', 'Strain/Vorticity-Based'], visibleWhen: [condition('viscous-sa', true)] }],
      ['viscous-rng-differential', 'Differential Viscosity Model', { defaultSelected: false, visibleWhen: rng, section: 'RNG Options' }],
      ['viscous-rng-swirl', 'Swirl Dominated Flow', { defaultSelected: false, visibleWhen: rng, section: 'RNG Options' }],
      ['viscous-kw-low-re', 'Low-Re Corrections', { defaultSelected: false, visibleWhen: [kw], section: 'k-omega Options' }],
      ['viscous-kw-shear-flow', 'Shear Flow Corrections', { defaultSelected: false, visibleWhen: [kw, standardKw], section: 'k-omega Options' }],
      ['viscous-rsm-low-re', 'Low-Re Corrections', { defaultSelected: false, visibleWhen: stressOmega, section: 'Reynolds-Stress Options' }],
      ['viscous-rsm-shear-flow', 'Shear Flow Corrections', { defaultSelected: false, visibleWhen: stressOmega, section: 'Reynolds-Stress Options' }],
      ['viscous-sst-roughness', 'Roughness Correlation', { defaultSelected: false, visibleWhen: [transitionSst] }],
      ['viscous-sst-roughness-height', 'Geometric Roughness Height', { visibleWhen: [transitionSst, condition('viscous-sst-roughness', true)] }],
      ['viscous-sst-c-thetat', 'C_thetat', { visibleWhen: [transitionSst] }],
      ['viscous-sst-c-s1', 'C_s1', { visibleWhen: [transitionSst] }],
      ['viscous-geko-csep', 'CSEP', { visibleWhen: geko }],
      ['viscous-geko-cnw', 'CNW', { visibleWhen: geko }],
      ['viscous-geko-cmix', 'CMIX', { visibleWhen: geko }],
      ['viscous-geko-cjet', 'CJET', { visibleWhen: geko }],
      ['viscous-rsm-model', 'Reynolds-Stress Model', { value: 'Linear Pressure-Strain', options: ['Linear Pressure-Strain', 'Quadratic Pressure-Strain', 'Stress-Omega', 'Stress-BSL'], visibleWhen: [condition('viscous-rsm', true)] }],
      ['viscous-rsm-wall-reflection', 'Wall Reflection Effects', { defaultSelected: true, visibleWhen: [condition('viscous-rsm', true), condition('viscous-rsm-model', 'Linear Pressure-Strain')] }],
      ['viscous-rsm-wall-k', 'Wall BC from k Equation', { defaultSelected: true, visibleWhen: [condition('viscous-rsm', true), condition('viscous-rsm-model', 'Linear Pressure-Strain')], section: 'Reynolds-Stress Options' }],
      ['viscous-des-model', 'RANS Model', { value: 'SST k-omega', options: ['Spalart-Allmaras', 'Realizable k-epsilon', 'SST k-omega'], visibleWhen: [condition('viscous-des', true)] }],
      ['viscous-delayed-des', 'Delayed DES', { defaultSelected: false, visibleWhen: [condition('viscous-des', true)] }],
      ['viscous-les-model', 'Subgrid-Scale Model', { value: 'Smagorinsky-Lilly', options: ['Smagorinsky-Lilly', 'WALE', 'WMLES', 'WMLES S-Omega', 'Kinetic-Energy Transport'], visibleWhen: [condition('viscous-les', true)] }],
      ['viscous-les-dynamic-stress', 'Dynamic Stress', { defaultSelected: false, visibleWhen: [condition('viscous-les', true), condition('viscous-les-model', 'Smagorinsky-Lilly', 'Kinetic-Energy Transport')] }],
      ['viscous-les-dynamic-energy', 'Dynamic Energy Flux', { defaultSelected: false, visibleWhen: lesDynamicStress, section: 'LES Model Options' }],
      ['viscous-les-dynamic-scalar', 'Dynamic Scalar Flux', { defaultSelected: false, visibleWhen: lesDynamicStress, section: 'LES Model Options' }],
      ['viscous-les-dynamic-fvar', 'Dynamic Fvar', { defaultSelected: false, visibleWhen: [les, pdf], section: 'LES Model Options' }],
      ['viscous-eulerian-turbulence', 'Turbulence Multiphase Model', { value: 'Mixture', options: ['Mixture', 'Dispersed', 'Per Phase'], visibleWhen: [condition('multiphase-model-select', 'Eulerian'), condition('viscous-inviscid', false), condition('viscous-laminar', false)], section: 'Multiphase Turbulence' }],
    ]),
    ...modelControls(viscous, 'Near-Wall Treatment', [
      ['viscous-ewt-pressure-gradient', 'Pressure Gradient Effects', { defaultSelected: false, visibleWhen: [wallTreatmentAvailable, ewt], section: 'Enhanced Wall Treatment Options' }],
      ['viscous-ewt-thermal', 'Thermal Effects', { defaultSelected: false, visibleWhen: [wallTreatmentAvailable, ewt, thermal], section: 'Enhanced Wall Treatment Options' }],
      ['viscous-law-of-wall', 'Law of the Wall', { visibleWhen: [wallTreatmentAvailable, condition('viscous-wall-treatment', 'User-Defined Wall Functions')], section: 'User-Defined Wall Functions' }],
    ]),
    ...modelControls(viscous, 'Options', [
      ['viscous-heating', 'Viscous Heating', { defaultSelected: false, valueId: 'energy-viscous-heating', visibleWhen: [thermal] }],
      ['viscous-aiad-damping', 'Turbulence Damping', { defaultSelected: true, visibleWhen: [aiadActive, condition('viscous-kw-sst', true)], section: 'Turbulence Damping Options' }],
      ['viscous-aiad-subgrid', 'Subgrid Turbulence Contribution (AIAD)', { defaultSelected: true, visibleWhen: [aiadActive, condition('viscous-kw-sst', true)], section: 'Regime Transition Modeling' }],
    ]),
  ],
  [dpm]: [
    ...modelControls(dpm, 'Tracking', [
      ['dpm-update-source', 'Update DPM Sources Every Flow Iteration', { defaultSelected: false, visibleWhen: [dpmCoupled], section: 'Interaction' }],
      ['dpm-inject-at', 'Inject Particles at', { value: 'Fluid Flow Time Step', options: ['Particle Time Step', 'Fluid Flow Time Step'], visibleWhen: [unsteady, condition('dpm-independent-particle-step', true)], section: 'Particle Treatment' }],
      ['dpm-particle-steps', 'Number of Time Steps', { visibleWhen: [dpmInstant, condition('solver-time-formulation', 'Steady')], section: 'Particle Treatment' }],
      ['dpm-specify-length', 'Specify Length Scale', { defaultSelected: false, section: 'Tracking Parameters' }],
      ['dpm-length-scale', 'Length Scale', { visibleWhen: [condition('dpm-specify-length', true)], section: 'Tracking Parameters' }],
      ['dpm-step-length-factor', 'Step Length Factor', { visibleWhen: [condition('dpm-specify-length', false)], section: 'Tracking Parameters' }],
      ['dpm-high-res-tracking', 'High-Res Tracking', { defaultSelected: true, section: 'Tracking Option' }],
    ]),
    ...modelControls(dpm, 'Physical Models', [
      ['dpm-virtual-mass', 'Virtual Mass Force', { defaultSelected: false }],
      ['dpm-particle-radiation', 'Particle Radiation Interaction', { defaultSelected: false, visibleWhen: [condition('radiation-model-select', 'P1', 'Discrete Ordinates (DO)')] }],
      ['dpm-erosion', 'Erosion/Accretion', { defaultSelected: false }],
      ['dpm-pressure-boiling', 'Pressure Dependent Boiling', { defaultSelected: false }],
      ['dpm-variable-latent-heat', 'Temperature Dependent Latent Heat', { defaultSelected: false }],
      ['dpm-two-way-turbulence', 'Two-Way Turbulence Coupling', { defaultSelected: false, visibleWhen: [dpmCoupled, ...turbulenceOn] }],
      ['dpm-breakup', 'Breakup', { defaultSelected: false, visibleWhen: [condition('dpm-unsteady-tracking', true)] }],
      ['dpm-stochastic-collision', 'Stochastic Collision', { defaultSelected: false, visibleWhen: [condition('dpm-unsteady-tracking', true)] }],
      ['dpm-dem-collision', 'DEM Collision', { defaultSelected: false, visibleWhen: [condition('dpm-unsteady-tracking', true)] }],
      ['dpm-dem-settings', 'DEM Collisions…', { dialogId: 'dpm-dem-collisions-dialog', visibleWhen: [condition('dpm-unsteady-tracking', true), condition('dpm-dem-collision', true)] }],
      ['dpm-coalescence', 'Coalescence', { defaultSelected: false, visibleWhen: [condition('dpm-unsteady-tracking', true), condition('dpm-stochastic-collision', true)] }],
    ]),
    ...modelControls(dpm, 'UDF', [
      ['dpm-udf-body-force', 'Body Force UDF'],
      ['dpm-udf-scalar-update', 'Scalar Update UDF'],
      ['dpm-udf-source', 'Source UDF'],
      ['dpm-udf-timestep', 'DPM Timestep UDF'],
      ['dpm-user-scalars', 'Number of Scalars'],
    ]),
    ...modelControls(dpm, 'Numerics', [
      ['dpm-track-absolute-frame', 'Track in Absolute Frame', { defaultSelected: false }],
      ['dpm-automated-tracking-scheme', 'Automated Tracking Scheme Selection', { defaultSelected: true }],
      ['dpm-high-order-scheme', 'High Order Scheme', { options: ['trapezoidal', 'runge-kutta'], value: 'trapezoidal', visibleWhen: [condition('dpm-automated-tracking-scheme', false)] }],
      ['dpm-low-order-scheme', 'Low Order Scheme', { options: ['implicit', 'analytic'], value: 'implicit', visibleWhen: [condition('dpm-automated-tracking-scheme', false)] }],
      ['dpm-node-averaging', 'Enable Node Based Averaging', { defaultSelected: false }],
      ['dpm-averaging-kernel', 'Averaging Kernel', { value: 'gaussian', visibleWhen: [condition('dpm-node-averaging', true)] }],
      ['dpm-linearize-sources', 'Linearize Source Terms', { defaultSelected: false, visibleWhen: [condition('dpm-source-linearization-available', true)], section: 'Source Terms' }],
      ['dpm-enhanced-numerics', 'Enhanced Numerics', { defaultSelected: false, visibleWhen: [condition('multiphase-model-select', 'Eulerian'), condition('multiphase-ddpm', true)], section: 'Source Terms' }],
    ]),
    ...modelControls(dpm, 'Parallel', [
      ['dpm-parallel-method', 'Parallel Tracking Method', { value: 'Message Passing', options: ['Message Passing', 'Shared Memory', 'Hybrid'] }],
      ['dpm-workpile', 'Workpile Algorithm', { defaultSelected: false, visibleWhen: [condition('dpm-parallel-method', 'Shared Memory')] }],
      ['dpm-parallel-threads', 'Number of Threads', { visibleWhen: [condition('dpm-parallel-method', 'Shared Memory'), condition('dpm-workpile', true)] }],
      ['dpm-domain', 'Use DPM Domain', { defaultSelected: false, visibleWhen: [condition('dpm-parallel-method', 'Hybrid')] }],
    ]),
  ],
  [solidification]: modelControls(solidification, 'Solidification', [
    ['solidification-rule', 'Solidification Rule', { value: 'Lever Rule', options: ['Lever Rule', 'Scheil Rule'], visibleWhen: [solidOn, speciesTransport] }],
    ['solidification-back-diffusion', 'Back Diffusion', { defaultSelected: false, visibleWhen: [solidOn, speciesTransport, scheil] }],
    ['solidification-back-method', 'Back Diffusion Parameter Method', { value: 'constant', options: ['constant', 'user-defined'], visibleWhen: [solidOn, speciesTransport, scheil, condition('solidification-back-diffusion', true)] }],
    ['solidification-back-value', 'Back Diffusion Parameter', { visibleWhen: [solidOn, speciesTransport, scheil, condition('solidification-back-diffusion', true), condition('solidification-back-method', 'constant')] }],
    ['solidification-back-udf', 'Back Diffusion UDF', { visibleWhen: [solidOn, speciesTransport, scheil, condition('solidification-back-diffusion', true), condition('solidification-back-method', 'user-defined')] }],
    ['solidification-thermal-buoyancy', 'Include Thermal Buoyancy', { defaultSelected: false, visibleWhen: [solidOn, speciesTransport] }],
    ['solidification-solutal-buoyancy', 'Include Solutal Buoyancy', { defaultSelected: false, visibleWhen: [solidOn, speciesTransport] }],
    ['solidification-pull-velocities', 'Include Pull Velocities', { defaultSelected: false, visibleWhen: [solidOn] }],
    ['solidification-compute-pull', 'Compute Pull Velocities', { defaultSelected: false, visibleWhen: [solidOn, condition('solidification-pull-velocities', true)] }],
    ['solidification-pull-iterations', 'Flow Iterations per Pull Velocity Iteration', { visibleWhen: [solidOn, condition('solidification-pull-velocities', true), condition('solidification-compute-pull', true)] }],
  ]),
  [sound]: modelControls(sound, 'Acoustics', [
    ['acoustics-source-data-asd', 'Export Acoustic Source Data in ASD Format', { defaultSelected: false, visibleWhen: [fwh], section: 'Export Options' }],
    ['acoustics-source-data-cgns', 'Export Acoustic Source Data in CGNS Format', { defaultSelected: false, visibleWhen: [fwh], section: 'Export Options' }],
    ['acoustics-compute-simultaneously', 'Compute Acoustics Signals Simultaneously', { defaultSelected: false, visibleWhen: [fwh], section: 'Export Options' }],
    ['acoustics-convective-effects', 'Convective Effects', { defaultSelected: false, visibleWhen: [fwh], section: 'Ffowcs-Williams & Hawkings Options' }],
    ['acoustics-free-stream-velocity', 'Free Stream Velocity', { visibleWhen: [fwh, condition('acoustics-convective-effects', true)], section: 'Ffowcs-Williams & Hawkings Options' }],
    ['acoustics-free-stream-direction', 'Free Stream Direction', { visibleWhen: [fwh, condition('acoustics-convective-effects', true)], section: 'Ffowcs-Williams & Hawkings Options' }],
    ['acoustics-filter-sources', 'Time-Filter Sound Sources', { defaultSelected: false, visibleWhen: [wave], section: 'Wave Equation Options' }],
    ['acoustics-wave-source-mask', 'Source Mask UDF', { visibleWhen: [wave], section: 'Wave Equation Options' }],
    ['acoustics-wave-sponge', 'Sponge Layer UDF', { visibleWhen: [wave], section: 'Wave Equation Options' }],
    ['acoustics-remote-receivers', 'Remote Receivers', { defaultSelected: false, visibleWhen: [wave], section: 'Wave Equation Options' }],
    ['acoustics-integration-surface', 'Integration Surface', { visibleWhen: [wave, remoteReceivers], section: 'Wave Equation Options' }],
    ['acoustics-define-sources', 'Define Sources…', { dialogId: 'acoustics-sources-dialog', visibleWhen: [fwh], section: 'Ffowcs-Williams & Hawkings Options' }],
    ['acoustics-define-receivers', 'Define Receivers…', { dialogId: 'acoustics-receivers-dialog', visibleWhen: [fwh], section: 'Ffowcs-Williams & Hawkings Options' }],
    ['acoustics-wave-receivers', 'Define Receivers…', { dialogId: 'acoustics-receivers-dialog', visibleWhen: [wave, remoteReceivers], section: 'Wave Equation Options' }],
    ['acoustics-sound-speed', 'Far-Field Sound Speed', { visibleWhen: [condition('acoustics-model-select', 'Ffowcs-Williams & Hawkings', 'Broadband Noise Sources', 'Wave Equation')], section: 'Model Constants' }],
    ['acoustics-sponge-viscosity', 'Artificial Viscosity Factor for Sponge Layer', { visibleWhen: [wave], section: 'Model Constants' }],
    ['acoustics-source-correlation-length', 'Source Correlation Length', { visibleWhen: [fwh, condition('solver-dimension', '2d')], section: 'Model Constants' }],
    ['acoustics-reference-power', 'Reference Acoustic Power', { visibleWhen: [broadband], section: 'Model Constants' }],
    ['acoustics-reference-intensity', 'Reference Acoustic Intensity', { visibleWhen: [broadband], section: 'Model Constants' }],
  ]),
  [film]: [
    ...modelControls(film, 'Wall Film', [
      ['wall-film-solve-energy', 'Solve Energy', { defaultSelected: false, visibleWhen: [thermal] }],
      ['wall-film-solve-scalar', 'Solve Scalar', { defaultSelected: false }],
      ['wall-film-scalar-diffusivity', 'Scalar Diffusivity', { visibleWhen: [condition('wall-film-solve-scalar', true)] }],
      ['wall-film-gravity', 'Gravity Force', { defaultSelected: false, visibleWhen: [filmMomentum, condition('general-gravity-enable', true)] }],
      ['wall-film-shear', 'Surface Shear Force', { defaultSelected: false, visibleWhen: [filmMomentum] }],
      ['wall-film-pressure-gradient', 'Pressure Gradient', { defaultSelected: false, visibleWhen: [filmMomentum] }],
      ['wall-film-material', 'Film Material', { value: 'water-liquid', options: ['water-liquid', 'air'] }],
      ['wall-film-dpm-coupling', 'DPM Interaction', { defaultSelected: false, visibleWhen: [condition('dpm-enable', true)] }],
      ['wall-film-phase-coupling', 'Phase Coupling', { defaultSelected: false, visibleWhen: [condition('wall-film-phase-coupling-available', true)] }],
      ['wall-film-separation', 'Edge Separation', { defaultSelected: false }],
      ['wall-film-separation-model', 'Separation Model', { value: 'Foucart', options: ['Foucart', "O'Rourke", 'Friedrich'], visibleWhen: [condition('wall-film-separation', true)] }],
    ]),
    ...modelControls(film, 'Phase Interaction', [
      ['wall-film-phase-change', 'Phase Change', { defaultSelected: false, visibleWhen: [speciesEnabled] }],
      ['wall-film-vapor-material', 'Film Vapor Material', { visibleWhen: [speciesEnabled, condition('wall-film-phase-change', true)] }],
      ['wall-film-phase-accretion', 'Phase Accretion', { defaultSelected: false, visibleWhen: [phaseAccretion] }],
    ]),
    ...modelControls(film, 'Solution Method and Control', [
      ['wall-film-time-scheme', 'Time Discretization', { value: 'First Order Explicit', options: ['First Order Explicit', 'High Order Explicit', 'First Order Implicit', 'Second Order Implicit'] }],
      ['wall-film-continuity', 'Continuity', { value: 'First Order Upwind', options: ['First Order Upwind', 'Second Order Upwind'] }],
      ['wall-film-thickness', 'Maximum Thickness'],
      ['wall-film-max-courant', 'Max. Courant Number'],
      ['wall-film-initial-step', 'Initial Time Step', { visibleWhen: [unsteady] }],
      ['wall-film-dpm-steps', 'Film Steps per DPM Step', { visibleWhen: [condition('dpm-enable', true), condition('wall-film-dpm-coupling', true)] }],
    ]),
  ],
  [exchanger]: modelControls(exchanger, 'Heat Exchanger', [
    ['hx-dual-cell-settings', 'Define…', { dialogId: 'dual-cell-hx-settings-dialog', visibleWhen: [hxDual] }],
    ['hx-macro-settings', 'Ungrouped Macro Model…', { dialogId: 'macro-hx-settings-dialog', visibleWhen: [hxMacro] }],
  ]),
  [battery]: [
    ...modelControls(battery, 'Battery Enable', [
      ['battery-potential-settings', 'Electric Potential…', { dialogId: 'electric-potential-dialog' }],
      ['battery-enable', 'Enable Battery Model', { defaultSelected: false }],
      ['battery-solution-method', 'Solution Method', { value: 'MSMD', options: ['CHT Coupling', 'FMU-CHT Coupling', 'Circuit Network', 'MSMD'], visibleWhen: [batteryEnabled] }],
    ]),
    ...modelControls(battery, 'Electrical Parameters', [
      ['battery-nominal-capacity', 'Nominal Cell Capacity (Ah)', { visibleWhen: [batteryEnabled, batteryMsmd] }],
      ['battery-electrical-control', 'Solution Options', { value: 'Specified C-Rate', options: ['Specified C-Rate', 'Specified System Current', 'Specified System Voltage', 'Specified System Power'], visibleWhen: [batteryEnabled, batteryMsmd] }],
      ['battery-system-current', 'System Current (A)', { visibleWhen: [batteryEnabled, batteryMsmd, condition('battery-electrical-control', 'Specified System Current')] }],
      ['battery-system-voltage', 'System Voltage (V)', { visibleWhen: [batteryEnabled, batteryMsmd, condition('battery-electrical-control', 'Specified System Voltage')] }],
      ['battery-system-power', 'System Power (W)', { visibleWhen: [batteryEnabled, batteryMsmd, condition('battery-electrical-control', 'Specified System Power')] }],
    ]),
    ...modelControls(battery, 'Conductive Zones', [
      ['battery-active-zones', 'Active Zones'],
      ['battery-passive-zones', 'Passive Zones'],
    ]),
    ...modelControls(battery, 'Electric Contacts', [
      ['battery-positive-contact', 'Positive Tab'],
      ['battery-negative-contact', 'Negative Tab'],
    ]),
  ],
}

export const physicsModelTabs: Record<string, DialogTabGroup[]> = {
  [species]: [
    { id: 'model', label: 'Model', groups: ['Species', 'Reactions', 'Combustion'] },
    { id: 'pdf-control', label: 'Control', groups: ['PDF Transport Parameters'], visibleWhen: [compositionPdf, lagrangianPdf] },
  ],
  [film]: [
    { id: 'model-options', label: 'Model Options and Setup', groups: ['Wall Film'] },
    { id: 'phase-interaction', label: 'Phase Interaction', groups: ['Phase Interaction'], visibleWhen: [condition('wall-film-enable', true), condition('wall-film-phase-coupling-available', true), wallFilmPhaseCoupling] },
    { id: 'solution', label: 'Solution Method and Control', groups: ['Solution Method and Control'], visibleWhen: [condition('wall-film-enable', true)] },
  ],
  [battery]: [
    { id: 'model-options', label: 'Model Options', groups: ['Battery Enable', 'Battery', 'Electrical Parameters'] },
    { id: 'zones', label: 'Conductive Zones', groups: ['Conductive Zones'], visibleWhen: [batteryEnabled] },
    { id: 'contacts', label: 'Electric Contacts', groups: ['Electric Contacts'], visibleWhen: [batteryEnabled] },
  ],
}

const viscousModelOrder = [
  'viscous-inviscid', 'viscous-laminar', 'viscous-sa', 'viscous-kepsilon', 'viscous-kw-sst', 'viscous-transition-kl',
  'viscous-transition-sst', 'viscous-rsm', 'viscous-sas', 'viscous-des', 'viscous-les',
]

export function addPhysicsModelBranches(dialog: FluentMockDialog): FluentMockDialog {
  const extra = additions[dialog.id]
  if (!extra) return dialog
  const base = dialog.controls.map((item) => {
    switch (item.id) {
      case 'energy-viscous-heating':
        return { ...item, visibleWhen: [thermal] }
      case 'energy-diffusion':
        return { ...item, visibleWhen: [thermal, speciesTransport] }
      case 'radiation-s2s-faces-per-cluster':
        return { ...item, visibleWhen: [s2s, condition('radiation-clustering-method', 'Manual')] }
      case 'radiation-theta-divisions':
      case 'radiation-phi-divisions':
        return { ...item, section: 'Angular Divisions' }
      case 'species-model-select':
      case 'radiation-model-select':
      case 'acoustics-model-select':
        return { ...item, section: 'Model' }
      case 'species-mixture-material':
        return { ...item, section: 'Mixture Properties' }
      case 'species-volumetric-reactions':
        return { ...item, visibleWhen: [allSpeciesReactions] }
      case 'dpm-interaction':
        return { ...item, section: 'Interaction' }
      case 'dpm-unsteady-tracking':
        return { ...item, section: 'Particle Treatment' }
      case 'dpm-max-steps':
        return { ...item, section: 'Tracking Parameters' }
      case 'viscous-wall-treatment':
        return { ...item, visibleWhen: [wallTreatmentAvailable] }
      case 'viscous-ke-submodel':
      case 'viscous-kw-submodel':
        return { ...item, section: item.label }
      case 'viscous-production-limiter':
        return { ...item, visibleWhen: turbulenceOn }
      case 'wall-film-momentum':
        return { ...item, visibleWhen: [condition('wall-film-enable', true)] }
      case 'solidification-mushy-const':
        return { ...item, visibleWhen: [solidOn] }
      case 'acoustics-far-field-density':
        return { ...item, section: 'Model Constants', visibleWhen: [condition('acoustics-model-select', 'Ffowcs-Williams & Hawkings', 'Broadband Noise Sources', 'Wave Equation')] }
      case 'hx-effectiveness':
        return { ...item, valueId: 'hx-dual-heat-rejection', visibleWhen: [hxDual, hxFixedRejection] }
      case 'battery-model-select':
        return { ...item, label: 'E-Chemistry Model', labelZh: '电化学子模型', visibleWhen: [batteryEnabled, batteryMsmd] }
      case 'battery-c-rate':
        return { ...item, visibleWhen: [batteryEnabled, batteryMsmd, condition('battery-electrical-control', 'Specified C-Rate')] }
      case 'viscous-curvature-correction':
        return { ...item, visibleWhen: [condition('viscous-curvature-available', true)] }
      case 'viscous-les':
        return { ...item, label: 'Large Eddy Simulation (LES)', labelZh: 'Large Eddy Simulation (LES)' }
      case 'viscous-kw-sst':
        return { ...item, label: 'k-omega', labelZh: 'k-omega' }
      default:
        return item
    }
  })
  const extraControls = dialog.id === film ? extra.map((item) => ({
    ...item, visibleWhen: [condition('wall-film-enable', true), ...(item.visibleWhen ?? [])],
  })) : dialog.id === dpm ? extra.map((item) => ({
    ...item, visibleWhen: [condition('dpm-enable', true), ...(item.visibleWhen ?? [])],
  })) : extra
  if (dialog.id === battery) {
    return { ...dialog, controls: [
      ...extraControls.filter((item) => item.group === 'Battery Enable'),
      ...base.filter((item) => item.id === 'battery-model-select'),
      ...extraControls.filter((item) => item.group !== 'Battery Enable'),
      ...base.filter((item) => item.id !== 'battery-model-select'),
    ] }
  }
  if (dialog.id === viscous) {
    const controls = [...base, ...extraControls]
    const byId = new Map(controls.map((item) => [item.id, item]))
    return { ...dialog, controls: [
      ...viscousModelOrder.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []),
      ...controls.filter((item) => !viscousModelOrder.includes(item.id)),
    ] }
  }
  return { ...dialog, controls: [...base, ...extraControls] }
}

function child(id: string, title: string, subtitle: string, settings: Parameters<typeof modelControls>[2]): FluentMockDialog {
  return { id, title, module: 'Models', subtitle, controls: modelControls(id, title, settings) }
}

export const physicsModelChildDialogs: FluentMockDialog[] = [
  child('electric-potential-dialog', 'Potential / Electrochemistry', '启用电位方程后，导电材料还需指定电导率，导电边界需要设置电势或电流密度。', [
    ['electric-potential-enable', 'Potential Equation', { defaultSelected: false }],
    ['electric-potential-joule-heating', 'Include Joule Heating in Energy Equation', { defaultSelected: false, visibleWhen: [condition('electric-potential-enable', true), thermal] }],
  ]),
  child('radiation-view-factors-dialog', 'View Factors and Clustering', '配置 S2S 表面聚类和视角系数的计算方式。', [
    ['radiation-clustering-method', 'Clustering', { value: 'Manual', options: ['Manual', 'Automatic'] }],
    ['radiation-clustering-manual-faces', 'Faces per Surface Cluster for Flow Boundary Zones', { valueId: 'radiation-s2s-faces-per-cluster', visibleWhen: [condition('radiation-clustering-method', 'Manual')] }],
    ['radiation-clustering-max-faces', 'Maximum Faces per Surface Cluster', { value: '10', visibleWhen: [condition('radiation-clustering-method', 'Automatic')] }],
    ['radiation-clustering-basis', 'Basis', { value: 'Cluster to Cluster', options: ['Face to Face', 'Cluster to Cluster'] }],
    ['radiation-view-factors-surface', 'Surfaces', { value: 'Blocking', options: ['Blocking', 'Nonblocking'] }],
    ['radiation-view-factors-method', 'Method', { value: 'Hemicube', options: ['Hemicube', 'Ray Tracing'] }],
    ['radiation-hemicube-resolution', 'Resolution', { visibleWhen: [condition('radiation-view-factors-method', 'Hemicube')] }],
  ]),
  child('radiation-solar-calculator-dialog', 'Solar Calculator', '记录日照计算输入。此工作台预览设置流程。', [
    ['radiation-solar-longitude', 'Longitude'],
    ['radiation-solar-latitude', 'Latitude'],
    ['radiation-solar-timezone', 'Timezone'],
    ['radiation-solar-day', 'Day of Year'],
    ['radiation-solar-time', 'Time of Day'],
    ['radiation-solar-method', 'Solar Irradiation Method', { value: 'Theoretical Maximum', options: ['Theoretical Maximum', 'Fair Weather Conditions'] }],
    ['radiation-sunshine-factor', 'Sunshine Factor', { visibleWhen: [condition('radiation-solar-method', 'Fair Weather Conditions')] }],
  ]),
  child('species-integration-dialog', 'Integration Parameters', '配置直接积分或 ISAT 的数值参数。', [
    ['species-integration-method', 'Integration Method', { value: 'ISAT', options: ['ISAT', 'Direct Integration'] }],
    ['species-isat-error', 'ISAT Error Tolerance', { visibleWhen: [condition('species-integration-method', 'ISAT')] }],
    ['species-isat-storage', 'Max. Storage', { visibleWhen: [condition('species-integration-method', 'ISAT')] }],
    ['species-ode-absolute-error', 'Absolute Error Tolerance'],
    ['species-ode-relative-error', 'Relative Error Tolerance'],
  ]),
  child('dpm-dem-collisions-dialog', 'DEM Collisions', '记录离散元碰撞搜索的网格设置。', [
    ['dpm-dem-adaptive-width', 'Adaptive Collision Mesh Width', { defaultSelected: true }],
    ['dpm-dem-edge-factor', 'Edge Scale Factor', { visibleWhen: [condition('dpm-dem-adaptive-width', true)] }],
    ['dpm-dem-static-width', 'Static Collision Mesh Width', { visibleWhen: [condition('dpm-dem-adaptive-width', false)] }],
    ['dpm-dem-max-speed', 'Maximum Particle Velocity'],
  ]),
  child('acoustics-sources-dialog', 'Acoustic Sources', '设置教学声源区域和文件名。', [
    ['acoustics-source-zone', 'Source Zones', { value: 'wall', options: ['wall', 'interior'] }],
    ['acoustics-source-file', 'File Name'],
    ['acoustics-source-frequency', 'Write Frequency'],
    ['acoustics-source-steps-per-file', 'Number of Time Steps per File'],
  ]),
  child('acoustics-receivers-dialog', 'Acoustic Receivers', '记录教学接收点坐标。', [
    ['acoustics-receiver-name', 'Receiver Name'],
    ['acoustics-receiver-x', 'X Coordinate'],
    ['acoustics-receiver-y', 'Y Coordinate'],
    ['acoustics-receiver-z', 'Z Coordinate', { visibleWhen: [condition('solver-dimension', '3d')] }],
  ]),
  child('dual-cell-hx-settings-dialog', 'Set Dual Cell Heat Exchanger', '设置示例主流体区、辅助流体区和换热条件。', [
    ['hx-dual-name', 'Name'],
    ['hx-dual-primary-zone', 'Primary Fluid Zone'],
    ['hx-dual-auxiliary-zone', 'Auxiliary Fluid Zone'],
    ['hx-dual-passes', 'Number of Passes'],
    ['hx-dual-mode', 'Heat Rejection', { value: 'Fixed Heat Rejection', options: ['Fixed Heat Rejection', 'Fixed Inlet Temperature'] }],
    ['hx-dual-heat-rejection', 'Heat Rejection Targeted (W)', { value: '5000 W', visibleWhen: [hxFixedRejection] }],
    ['hx-dual-inlet-temperature', 'Inlet Temperature (K)', { visibleWhen: [condition('hx-dual-mode', 'Fixed Inlet Temperature')] }],
    ['hx-dual-performance-data', 'Performance Data', { value: 'Raw Data', options: ['Raw Data', 'NTU Data'] }],
    ['hx-dual-heat-table', 'Heat Transfer Table…', { dialogId: 'hx-heat-transfer-table-dialog', visibleWhen: [hxRawData] }],
    ['hx-dual-ntu-table', 'NTU Table…', { dialogId: 'hx-ntu-table-dialog', visibleWhen: [condition('hx-dual-performance-data', 'NTU Data')] }],
    ['hx-dual-ntu-relation', 'Effectiveness-NTU Relation', { value: 'counter-flow', options: ['counter-flow', 'parallel-flow', 'cross-flow-unmixed'], visibleWhen: [hxRawData] }],
    ['hx-dual-primary-reference-temperature', 'Primary Reference Inlet Temperature (K)', { visibleWhen: [hxRawData] }],
    ['hx-dual-auxiliary-reference-temperature', 'Auxiliary Reference Inlet Temperature (K)', { visibleWhen: [hxRawData] }],
  ]),
  child('hx-heat-transfer-table-dialog', 'Heat Transfer Data Table', '示例录入一组主流体流量、辅助流体流量与实测换热量。', [
    ['hx-raw-primary-flow-rate', 'Primary Fluid Flow Rate'],
    ['hx-raw-aux-flow-rate', 'Auxiliary Fluid Flow Rate'],
    ['hx-raw-heat-transfer', 'Heat Transfer (W)'],
  ]),
  child('hx-ntu-table-dialog', 'NTU Table', '示例录入一组主流体流量、辅助流体流量与 NTU。', [
    ['hx-ntu-primary-flow-rate', 'Primary Fluid Flow Rate'],
    ['hx-ntu-aux-flow-rate', 'Auxiliary Fluid Flow Rate'],
    ['hx-ntu-value', 'NTU'],
  ]),
  child('macro-hx-settings-dialog', 'Ungrouped Macro Heat Exchanger', '设置示例宏观换热器。', [
    ['hx-macro-zone', 'Fluid Zone'],
    ['hx-macro-model', 'Heat Transfer Model', { value: 'ntu-model', options: ['ntu-model', 'simple-effectiveness-model'] }],
    ['hx-macro-width', 'Width'],
    ['hx-macro-height', 'Height'],
    ['hx-macro-depth', 'Depth'],
    ['hx-macro-passes', 'Number of Passes'],
    ['hx-macro-auxiliary-flow', 'Auxiliary Fluid Flow Rate'],
    ['hx-macro-core-porosity', 'Core Porosity Model…', { dialogId: 'hx-core-porosity-dialog' }],
  ]),
  child('hx-core-porosity-dialog', 'Core Porosity Model', '配置入口、出口及芯体摩擦损失参数。', [
    ['hx-porosity-entrance', 'Entrance Loss Coefficient'],
    ['hx-porosity-exit', 'Exit Loss Coefficient'],
    ['hx-porosity-friction-coefficient', 'Core Friction Coefficient'],
    ['hx-porosity-friction-exponent', 'Core Friction Exponent'],
  ]),
]
