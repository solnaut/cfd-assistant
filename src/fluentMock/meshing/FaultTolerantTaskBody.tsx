import type { Dispatch, ReactNode } from 'react'
import type { FluentMeshingAction, FluentMeshingState } from './meshingState'

export function FaultTolerantTaskBody({ state, dispatch }: {
  state: FluentMeshingState
  dispatch: Dispatch<FluentMeshingAction>
}) {
  const { activeTaskId: taskId, faultTolerant: form } = state
  const update = (patch: Partial<typeof form>) => dispatch({ type: 'UPDATE_FAULT_FORM', patch })
  const textInput = (key: 'capName' | 'regionName' | 'x' | 'y' | 'z' | 'maxLeakageSize', label: string) => (
    <label className="fluent-field-row" key={key}>
      <span>{label}</span>
      <input value={form[key]} onChange={(event) => update({ [key]: event.target.value })} />
    </label>
  )
  const taskButton = (label: string, action: FluentMeshingAction, primary = true) => (
    <button type="button" className={primary ? 'fluent-primary-btn' : undefined} onClick={() => dispatch(action)}>
      {label}
    </button>
  )
  let fields: ReactNode
  let actions: ReactNode

  if (state.skippedTasks.includes(taskId)) {
    return (
      <div className="fluent-controls-stack">
        <p className="fluent-inline-note">This task was skipped in Describe Geometry and Flow.</p>
        <div className="fluent-task-footer-actions">
          {taskButton('Describe Geometry and Flow', { type: 'SELECT_TASK', taskId: 'ft-describe' })}
        </div>
      </div>
    )
  }

  switch (taskId) {
    case 'ft-describe':
      fields = (
        <>
          <label className="fluent-choice-row">
            <input type="checkbox" checked={form.capOpenings} onChange={(event) => update({ capOpenings: event.target.checked })} />
            Enclose Fluid Regions (Capping)
          </label>
          <label className="fluent-choice-row">
            <input type="checkbox" checked={form.closeLeaks} onChange={(event) => update({ closeLeaks: event.target.checked })} />
            Close Leakages
          </label>
        </>
      )
      actions = taskButton('Update', { type: 'RUN_FAULT_TASK', taskId })
      break
    case 'ft-capping':
      fields = (
        <>
          {textInput('capName', 'Cap Name')}
          <label className="fluent-field-row">
            <span>Opening</span>
            <select value={form.capOpening} onChange={(event) => update({ capOpening: event.target.value })}>
              <option value="elbow-inlet">elbow-inlet</option>
              <option value="elbow-outlet">elbow-outlet</option>
            </select>
          </label>
          <label className="fluent-field-row">
            <span>Zone Type</span>
            <select value={form.capType} onChange={(event) => update({ capType: event.target.value as typeof form.capType })}>
              <option value="inlet">inlet</option>
              <option value="outlet">outlet</option>
              <option value="wall">wall</option>
            </select>
          </label>
          {form.caps.length > 0 && (
            <ul className="fluent-task-records" aria-label="Caps">
              {form.caps.map((cap) => <li key={cap.opening}>{cap.name} · {cap.opening} · {cap.type}</li>)}
            </ul>
          )}
        </>
      )
      actions = (
        <>
          {taskButton('Add Cap(s)', { type: 'ADD_FAULT_CAP' }, false)}
          {taskButton('Update', { type: 'RUN_FAULT_TASK', taskId })}
        </>
      )
      break
    case 'ft-identify':
      fields = (
        <>
          {textInput('regionName', 'Region Name')}
          <label className="fluent-field-row">
            <span>Region Type</span>
            <select value={form.regionType} onChange={(event) => update({ regionType: event.target.value as typeof form.regionType })}>
              <option value="fluid">fluid</option>
              <option value="solid">solid</option>
              <option value="void">void</option>
            </select>
          </label>
          {textInput('x', 'X (mm)')}
          {textInput('y', 'Y (mm)')}
          {textInput('z', 'Z (mm)')}
        </>
      )
      actions = taskButton('Identify Regions', { type: 'RUN_FAULT_TASK', taskId })
      break
    case 'ft-leakage':
      fields = (
        <>
          {textInput('maxLeakageSize', 'Maximum Leakage Size (mm)')}
          {form.leakagePreview !== null && (
            <p className="fluent-inline-note" role="status">
              {form.leakagePreview} sample gap(s) at or below {form.maxLeakageSize} mm
            </p>
          )}
        </>
      )
      actions = (
        <>
          {taskButton('Preview Leakages', { type: 'PREVIEW_LEAKAGES' }, false)}
          {taskButton('Define Leakage Threshold', { type: 'RUN_FAULT_TASK', taskId })}
        </>
      )
      break
    default:
      return null
  }

  return (
    <div className="fluent-controls-stack">
      <div className="fluent-task-group fluent-controls-stack">{fields}</div>
      <div className="fluent-task-footer-actions">{actions}</div>
    </div>
  )
}
