import { FluentIcon } from '../FluentIcons'
import type { FluentLabel } from '../fluentLanguage'
import { controlOptionsById } from '../fluentTeachingExtras'
import {
  getControlChecked,
  getControlValue,
  type FluentSimState,
} from '../state/fluentSimState'
import type { FluentMockControl } from '../fluentTypes'

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
  if (
    control.id === 'viscous-laminar' ||
    control.id === 'viscous-kepsilon' ||
    control.id === 'viscous-kw-sst'
  ) {
    return 'fluent-viscous-model'
  }
  return `fluent-radio-${control.group}`
}

function getDynamicOptions(
  control: FluentMockControl,
  simState: FluentSimState,
) {
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

  const preset = controlOptionsById[control.id] ?? []
  const current = getControlValue(simState, control.id, control.value ?? '')
  if (current && !preset.some((option) => option.value === current)) {
    return [{ value: current, label: current }, ...preset]
  }
  return preset
}

function isControlDisabled(
  control: FluentMockControl,
  simState: FluentSimState,
) {
  if (!control.enabled) return true
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
  onInspect: (control: FluentMockControl, optionValue?: string) => void
  onButtonActivate: (control: FluentMockControl) => void
  onValueChange: (control: FluentMockControl, value: string | boolean) => void
}) {
  const disabled = isControlDisabled(control, simState)

  if (control.controlType === 'radio') {
    const checked = getControlChecked(
      simState,
      control.id,
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
      control.id,
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
    const value = getControlValue(simState, control.id, control.value ?? '')
    return (
      <div className={'fluent-field-row' + (active ? ' active' : '')}>
        <label htmlFor={`fl-ctrl-${control.id}`}>{label(control.label)}</label>
        <select
          id={`fl-ctrl-${control.id}`}
          aria-label={label(control.label)}
          data-fluent-control={control.id}
          disabled={disabled}
          value={value}
          onFocus={() => onInspect(control, value)}
          onClick={() => onInspect(control, value)}
          onChange={(event) => {
            onInspect(control, event.target.value)
            onValueChange(control, event.target.value)
          }}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {label(option.label)}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (control.controlType === 'field') {
    const value = getControlValue(simState, control.id, control.value ?? '')
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

  return (
    <button
      type="button"
      className={'fluent-action-row' + (active ? ' active' : '')}
      data-fluent-control={control.id}
      disabled={disabled}
      onClick={() => onButtonActivate(control)}
    >
      <span>{label(control.label)}</span>
      {control.value && <small>{label(control.value)}</small>}
      {control.dialogId && <FluentIcon name="chevron" />}
    </button>
  )
}
