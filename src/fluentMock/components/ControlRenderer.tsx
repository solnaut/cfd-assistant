import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import { controlOptionsById, type SelectOptionItem } from '../fluentTeachingExtras'
import {
  formatBatteryBadge,
  formatViscousBadge,
  getControlChecked,
  getControlValue,
  isAcousticWaveAvailable,
  nearWallTreatments,
  speciesChemistrySolvers,
  type FluentSimState,
} from '../state/fluentSimState'
import type { FluentMockControl } from '../fluentTypes'
import { eulerianRegime, getMultiphaseOptions, isEulerianRegimeControlLocked } from '../state/fluentMultiphaseState'
import { gentopRegime } from '../data/multiphaseDialogs'

function getRadioGroupName(control: FluentMockControl) {
  if (
    control.id === 'general-pressure-based' ||
    control.id === 'general-density-based'
  ) {
    return 'fluent-solver-type'
  }
  if (
    control.id === 'solver-type-pressure-based' ||
    control.id === 'solver-type-density-based'
  ) {
    return 'fluent-dialog-solver-type'
  }
  if (
    control.id === 'general-absolute-velocity' ||
    control.id === 'general-relative-velocity'
  ) {
    return 'fluent-velocity-formulation'
  }
  if (control.id === 'general-steady' || control.id === 'general-transient') {
    return 'fluent-time-formulation'
  }
  if (control.parentId === 'viscous-model-dialog' && control.group === 'Model') {
    return 'fluent-viscous-model'
  }
  return `fluent-radio-${control.group}`
}

function getDynamicOptions(
  control: FluentMockControl,
  simState: FluentSimState,
): SelectOptionItem[] {
  const reportOutput = /^report-(plot|file)-(existing|definition|basis)$/.exec(control.id)
  if (reportOutput) {
    const [, kind, field] = reportOutput
    const options = field === 'basis'
      ? simState.timeFormulation === 'transient' ? ['Iterations', 'Time Steps', 'Flow Time'] : ['Iterations']
      : field === 'definition'
        ? Object.keys(simState.reportDefinitions)
        : Object.values(simState.reportOutputs).filter((output) => output.kind === kind).map((output) => output.name)
    return [
      ...(field !== 'basis' ? [{ value: '', label: 'Select…' }] : []),
      ...options.map((value) => ({ value, label: value })),
    ]
  }
  if (
    control.id === 'materials-assigned' ||
    control.id === 'cell-zone-fluid-material'
  ) {
    return simState.materials.fluids.map((name) => ({
      value: name,
      label: name,
    }))
  }
  if (control.id === 'cell-zone-solid-material') {
    return simState.materials.solids.map((name) => ({
      value: name,
      label: name,
    }))
  }

  const id = control.valueId ?? control.id
  if (id === 'species-chemistry-solver' || id === 'viscous-wall-treatment') {
    return (id === 'species-chemistry-solver' ? speciesChemistrySolvers(simState) : nearWallTreatments(simState)).map((value) => ({ value, label: value }))
  }
  const multiphaseOptions = getMultiphaseOptions(simState, id)
  if (multiphaseOptions) return multiphaseOptions
  const preset = (control.options?.map((value) => ({ value, label: value })) ?? controlOptionsById[control.id] ?? [])
    .filter(({ value }) =>
      !(id === 'run-adaptive-method' && value === 'Multiphase-Specific' && simState.multiphaseModel === 'Off') &&
      !(id === 'radiation-solar-model' && value === 'DO Irradiation' && simState.radiationModel !== 'Discrete Ordinates (DO)') &&
      !(id === 'species-state-relation' && value === 'Flamelet Generated Manifold' && simState.speciesModel !== 'Partially Premixed Combustion') &&
      !(id === 'acoustics-model-select' && value === 'Wave Equation' && !isAcousticWaveAvailable(simState)),
    ).map((option) => id === 'species-model-select' && option.value === 'Species Transport' && eulerianRegime(simState) === gentopRegime
      ? { ...option, disabled: true, reason: 'Disable GENTOP first.' } : option)
  const options = [
    ...preset,
    ...((id === 'methods-pressure-velocity' || id === 'solution-methods-coupling') && simState.multiphaseModel === 'Eulerian'
      ? [{ value: 'Phase Coupled SIMPLE', label: 'Phase Coupled SIMPLE' }] : []),
    ...(id === 'particle-tracks-injection' || /^export-.*-injection$/.test(id)
      ? Object.keys(simState.dpmInjections).filter((name) => !preset.some(({ value }) => value === name))
        .map((value) => ({ value, label: value })) : []),
    ...(/^(contours|xy-plot|surface-integrals|report-definition|export-.*)-(surfaces|surface)$/.test(control.id) || control.id === 'iso-clip-surface' || control.id === 'manage-surface-selected'
      ? [
          ...(control.id === 'manage-surface-selected'
            ? [{ value: 'plane-center', label: 'plane-center' }, { value: 'iso-x-0.1', label: 'iso-x-0.1' }, { value: 'wall', label: 'wall' }, { value: 'inlet', label: 'inlet' }, { value: 'outlet', label: 'outlet' }]
            : []),
          ...simState.createdSurfaces.map(({ name }) => ({ value: name, label: name })),
        ]
      : []),
  ]
  const current = getControlValue(simState, id, control.value ?? '')
  if (current && !options.some((option) => option.value === current)) {
    return [{ value: current, label: current }, ...options]
  }
  return options
}

function isControlDisabled(
  control: FluentMockControl,
  simState: FluentSimState,
) {
  if (!control.enabled) return true
  if (isEulerianRegimeControlLocked(simState, control.valueId ?? control.id)) return true
  if ((control.valueId ?? control.id) === 'energy-viscous-heating' && simState.solverType === 'density-based') return true
  if (control.id === 'dpm-enable' && simState.multiphaseModel === 'Eulerian' && getControlChecked(simState, 'multiphase-ddpm')) return true
  if (
    !simState.gravityEnabled &&
    (control.id === 'general-gravity-x' ||
      control.id === 'general-gravity-y' ||
      control.id === 'general-gravity-z' ||
      control.id === 'operating-gravity-vector')
  ) {
    return true
  }
  return false
}

function getDynamicButtonValue(
  control: FluentMockControl,
  simState: FluentSimState,
): string | undefined {
  switch (control.id) {
    case 'models-multiphase':
      return simState.multiphaseModel
    case 'models-energy':
      return simState.energyEnabled ? 'On' : 'Off'
    case 'models-viscous':
      return formatViscousBadge(simState.viscousModel)
    case 'models-radiation':
      return simState.radiationModel
    case 'models-heat-exchanger':
      return simState.heatExchangerModel
    case 'models-species':
      return simState.speciesModel
    case 'models-dpm':
      return simState.dpmEnabled ? 'On' : 'Off'
    case 'models-solidification':
      return simState.solidificationEnabled ? 'On' : 'Off'
    case 'models-acoustics':
      return getControlValue(simState, 'acoustics-model-select')
    case 'models-wall-film':
      return simState.wallFilmEnabled ? 'On' : 'Off'
    case 'models-battery':
      return formatBatteryBadge(simState)
    default:
      return control.value
  }
}

export function ControlRenderer({
  control,
  active,
  simState,
  label,
  onInspect,
  onButtonActivate,
  onValueChange,
}: {
  control: FluentMockControl
  active: boolean
  simState: FluentSimState
  label: FluentLabel
  onInspect: (control: FluentMockControl) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
}) {
  const disabled = isControlDisabled(control, simState)
  const valueId = control.valueId ?? control.id

  if (control.controlType === 'radio') {
    const checked = getControlChecked(
      simState,
      valueId,
      Boolean(control.defaultSelected),
    )
    return (
      <label className={'fluent-choice-row' + (active ? ' active' : '')}>
        <input
          type="radio"
          name={getRadioGroupName(control)}
          aria-label={label(control.label)}
          checked={checked}
          data-fluent-control={control.id}
          disabled={disabled}
          onClick={() => onInspect(control)}
          onFocus={() => onInspect(control)}
          onChange={() => {
            onInspect(control)
            onValueChange(control, true)
          }}
        />
        <span>{label(control.label)}</span>
      </label>
    )
  }

  if (control.controlType === 'checkbox') {
    const checked = getControlChecked(
      simState,
      valueId,
      Boolean(control.defaultSelected),
    )
    return (
      <label className={'fluent-choice-row' + (active ? ' active' : '')}>
        <input
          type="checkbox"
          aria-label={label(control.label)}
          checked={checked}
          data-fluent-control={control.id}
          disabled={disabled}
          onClick={() => onInspect(control)}
          onFocus={() => onInspect(control)}
          onChange={(event) => {
            onInspect(control)
            onValueChange(control, event.target.checked)
          }}
        />
        <span>{label(control.label)}</span>
      </label>
    )
  }

  if (control.controlType === 'select') {
    const options = getDynamicOptions(control, simState)
    const value = getControlValue(simState, valueId, control.value ?? '')
    if (control.optionDisplay === 'choices') {
      return (
        <div className="fluent-choice-group" data-fluent-control={control.id} role="radiogroup" aria-label={label(control.label)} tabIndex={-1}>
          {options.map((option) => (
            <label key={option.value} className={'fluent-choice-row' + (active && value === option.value ? ' active' : '')} title={option.reason}>
              <input type="radio" name={control.id} value={option.value} checked={value === option.value}
                disabled={disabled || option.disabled} onFocus={() => onInspect(control)} onClick={() => onInspect(control)}
                onChange={() => onValueChange(control, option.value)} />
              <span>{label(option.label)}{option.reason && <small className="fluent-choice-reason">{option.reason}</small>}</span>
            </label>
          ))}
        </div>
      )
    }
    return (
      <div className={'fluent-field-row' + (active ? ' active' : '')}>
        <label htmlFor={`fl-ctrl-${control.id}`}>{label(control.label)}</label>
        <select
          id={`fl-ctrl-${control.id}`}
          aria-label={label(control.label)}
          data-fluent-control={control.id}
          disabled={disabled}
          value={value}
          onFocus={() => onInspect(control)}
          onClick={() => onInspect(control)}
          onChange={(event) => {
            onInspect(control)
            onValueChange(control, event.target.value)
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled} title={option.reason}>
              {label(option.label)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (control.controlType === 'field') {
    const value = getControlValue(simState, valueId, control.value ?? '')
    return (
      <div className={'fluent-field-row' + (active ? ' active' : '')}>
        <label htmlFor={`fl-ctrl-${control.id}`}>{label(control.label)}</label>
        <input
          id={`fl-ctrl-${control.id}`}
          type="text"
          aria-label={label(control.label)}
          data-fluent-control={control.id}
          disabled={disabled}
          value={value}
          onFocus={() => onInspect(control)}
          onClick={() => onInspect(control)}
          onChange={(event) => {
            onInspect(control)
            onValueChange(control, event.target.value)
          }}
        />
      </div>
    )
  }

  const buttonValue = getDynamicButtonValue(control, simState)

  return (
    <button
      type="button"
      className={'fluent-action-row' + (active ? ' active' : '')}
      data-fluent-control={control.id}
      disabled={disabled}
      title={control.unavailableReason && label(control.unavailableReason)}
      onClick={() => onButtonActivate(control)}
    >
      <span>{label(control.label)}</span>
      {buttonValue && <small>{label(buttonValue)}</small>}
      {control.dialogId && <FluentIcon name="chevron" />}
    </button>
  )
}
